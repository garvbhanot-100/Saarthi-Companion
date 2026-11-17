import express, {
  Router,
  type IRouter,
  type Request,
  type RequestHandler,
  type Response,
} from "express";

const MAX_REQUEST_BYTES = 512 * 1024;
const MAX_QUESTION_LENGTH = 8_000;
const MAX_SERVICE_CONTEXT_LENGTH = 128_000;
const AI_SERVICE_TIMEOUT_MS = 65_000;

const router: IRouter = Router();
const jsonParser = express.json({ limit: MAX_REQUEST_BYTES });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parserErrorType(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    typeof error.type === "string"
  ) {
    return error.type;
  }
  return undefined;
}

function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  retryable = false,
) {
  res.status(status).json({ error: { code, message, retryable } });
}

export const assistantJsonParser: RequestHandler = (req, res, next) => {
  jsonParser(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    switch (parserErrorType(error)) {
      case "entity.too.large":
        sendError(res, 413, "REQUEST_TOO_LARGE", "Request body is too large");
        return;
      case "entity.parse.failed":
        sendError(res, 400, "INVALID_JSON", "Invalid JSON request");
        return;
      default:
        next(error);
    }
  });
};

function getAssistantEndpoint(): URL | undefined {
  const configuredUrl = process.env.SAARTHI_AI_URL?.trim();
  if (!configuredUrl) return undefined;

  try {
    const baseUrl = new URL(configuredUrl);
    if (
      !["http:", "https:"].includes(baseUrl.protocol) ||
      baseUrl.username ||
      baseUrl.password ||
      baseUrl.pathname !== "/" ||
      baseUrl.search ||
      baseUrl.hash
    ) {
      return undefined;
    }
    return new URL("/api/assistant", baseUrl);
  } catch {
    return undefined;
  }
}

router.post("/assistant", async (req: Request, res: Response) => {
  const body: unknown = req.body;
  if (!isRecord(body)) {
    sendError(res, 400, "INVALID_BODY", "Request body must be a JSON object");
    return;
  }

  if (typeof body.question !== "string" || !body.question.trim()) {
    sendError(res, 400, "INVALID_QUESTION", "Question is required");
    return;
  }
  if (body.question.length > MAX_QUESTION_LENGTH) {
    sendError(
      res,
      413,
      "QUESTION_TOO_LARGE",
      `Question must not exceed ${MAX_QUESTION_LENGTH} characters`,
    );
    return;
  }
  if (
    body.serviceContext !== undefined &&
    typeof body.serviceContext !== "string"
  ) {
    sendError(res, 400, "INVALID_CONTEXT", "Service context must be a string");
    return;
  }
  if (
    typeof body.serviceContext === "string" &&
    body.serviceContext.length > MAX_SERVICE_CONTEXT_LENGTH
  ) {
    sendError(res, 413, "CONTEXT_TOO_LARGE", "Service context is too large");
    return;
  }
  if (body.language !== undefined && typeof body.language !== "string") {
    sendError(
      res,
      400,
      "UNSUPPORTED_LANGUAGE",
      "Unsupported response language",
    );
    return;
  }

  const endpoint = getAssistantEndpoint();
  if (!endpoint) {
    sendError(
      res,
      503,
      "AI_NOT_CONFIGURED",
      "The AI service is not configured.",
    );
    return;
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, AI_SERVICE_TIMEOUT_MS);
  req.once("aborted", () => controller.abort());
  res.once("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: body.question.trim(),
        ...(body.serviceContext !== undefined
          ? { serviceContext: body.serviceContext }
          : {}),
        ...(body.language !== undefined ? { language: body.language } : {}),
      }),
      signal: controller.signal,
    });

    const payload: unknown = await upstream.json().catch(() => undefined);
    if (!isRecord(payload)) {
      sendError(
        res,
        502,
        "AI_SERVICE_INVALID_RESPONSE",
        "The AI service returned an invalid response.",
        true,
      );
      return;
    }

    if (!upstream.ok) {
      const error = isRecord(payload.error) ? payload.error : {};
      const code =
        typeof error.code === "string" && /^[A-Z0-9_]{1,64}$/.test(error.code)
          ? error.code
          : "AI_SERVICE_ERROR";
      const message =
        typeof error.message === "string"
          ? error.message
              .replace(/\bgsk_[A-Za-z0-9]{20,}\b/g, "[redacted]")
              .replace(/\s+/g, " ")
              .slice(0, 500)
          : "The AI service could not complete the request.";
      sendError(
        res,
        upstream.status,
        code,
        message,
        typeof error.retryable === "boolean"
          ? error.retryable
          : upstream.status >= 500,
      );
      return;
    }

    if (typeof payload.content !== "string" || !payload.content.trim()) {
      sendError(
        res,
        502,
        "AI_SERVICE_INVALID_RESPONSE",
        "The AI service returned an empty response.",
        true,
      );
      return;
    }

    res.status(upstream.status).json({ content: payload.content });
  } catch {
    if (res.destroyed || res.writableEnded) return;
    if (timedOut) {
      sendError(
        res,
        504,
        "AI_SERVICE_TIMEOUT",
        "The AI service timed out. Please try again.",
        true,
      );
      return;
    }
    sendError(
      res,
      503,
      "AI_SERVICE_UNAVAILABLE",
      "The AI service is temporarily unavailable.",
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
