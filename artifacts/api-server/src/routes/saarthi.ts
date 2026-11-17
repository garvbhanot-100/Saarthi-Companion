import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import {
  deleteSession,
  loadUserState,
  loginUser,
  loginVerifiedEmailUser,
  replaceChats,
  replaceSavedServices,
  resolveSession,
  signUpUser,
  StoreError,
  updateUserProfile,
  type ChatMessageDto,
  type ChatSessionDto,
  type UserProfileDto,
} from "../lib/saarthiStore";
import {
  isClerkBackendConfigured,
  resolveEmailFromClerkToken,
} from "../lib/clerkAdminAuth";

const router: IRouter = Router();

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;
const MIN_PASSWORD_LENGTH = 8;
const MAX_SAVED_SERVICES = 500;
const MAX_SERVICE_ID_LENGTH = 128;
const MAX_CHATS = 200;
const MAX_MESSAGES_PER_CHAT = 500;
const MAX_ID_LENGTH = 128;
const MAX_TITLE_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 20_000;

export function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  const bodyToken =
    typeof req.body?.sessionToken === "string" ? req.body.sessionToken : "";
  return bodyToken.trim() || undefined;
}

export async function requireUserId(req: Request, res: Response) {
  const token = getBearerToken(req);
  const userId = await resolveSession(token);
  if (!userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return { userId, token: token! };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 64 &&
    !Number.isNaN(Date.parse(value))
  );
}

function parseProfile(value: unknown): UserProfileDto | null {
  if (!isRecord(value)) return null;
  const { name, email } = value;
  if (
    !isBoundedString(name, MAX_NAME_LENGTH) ||
    !isBoundedString(email, MAX_EMAIL_LENGTH) ||
    !name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return null;
  }
  return { name, email };
}

function parseSavedServiceIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > MAX_SAVED_SERVICES) return null;
  if (
    !value.every(
      (id) => isBoundedString(id, MAX_SERVICE_ID_LENGTH) && id.trim(),
    )
  ) {
    return null;
  }
  return [...new Set(value as string[])];
}

function parseMessage(value: unknown): ChatMessageDto | null {
  if (!isRecord(value)) return null;
  const { id, role, content, createdAt, sources, isError } = value;
  if (
    !isBoundedString(id, MAX_ID_LENGTH) ||
    !id ||
    (role !== "user" && role !== "assistant") ||
    !isBoundedString(content, MAX_MESSAGE_LENGTH) ||
    !isIsoDate(createdAt) ||
    (isError !== undefined && isError !== null && typeof isError !== "boolean")
  ) {
    return null;
  }
  return {
    id,
    role,
    content,
    createdAt,
    sources: Array.isArray(sources) ? sources.slice(0, 10) : undefined,
    isError: isError ?? undefined,
  };
}

function parseChats(value: unknown): ChatSessionDto[] | null {
  if (!Array.isArray(value) || value.length > MAX_CHATS) return null;
  const chats: ChatSessionDto[] = [];
  const chatIds = new Set<string>();
  const messageIds = new Set<string>();
  for (const item of value) {
    if (!isRecord(item)) return null;
    const { id, title, updatedAt, messages } = item;
    if (
      !isBoundedString(id, MAX_ID_LENGTH) ||
      !id ||
      chatIds.has(id) ||
      typeof title !== "string" ||
      !isIsoDate(updatedAt) ||
      !Array.isArray(messages) ||
      messages.length > MAX_MESSAGES_PER_CHAT
    ) {
      return null;
    }
    chatIds.add(id);
    const parsedMessages: ChatMessageDto[] = [];
    for (const message of messages) {
      const parsed = parseMessage(message);
      if (!parsed || messageIds.has(parsed.id)) return null;
      messageIds.add(parsed.id);
      parsedMessages.push(parsed);
    }
    chats.push({
      id,
      title: title.slice(0, MAX_TITLE_LENGTH),
      updatedAt,
      messages: parsedMessages,
    });
  }
  return chats;
}

function sendStoreError(req: Request, res: Response, error: unknown) {
  if (error instanceof StoreError) {
    res.status(error.status).json({ error: error.code });
    return;
  }
  req.log.error({ err: error }, "saarthi request failed");
  res.status(500).json({ error: "SERVER_ERROR" });
}

/**
 * With Clerk enabled, accounts are matched to Clerk-verified emails. Email +
 * password sign-up/login never verified the address, so allowing it would let
 * someone pre-register another person's email and later read their data.
 */
function rejectUnverifiedPasswordAuth(res: Response) {
  if (!isClerkBackendConfigured()) return false;
  res.status(403).json({ error: "PASSWORD_AUTH_DISABLED" });
  return true;
}

router.get("/saarthi/state", async (req, res) => {
  const token = getBearerToken(req);
  const userId = await resolveSession(token);
  if (!userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  const state = await loadUserState(userId);
  if (!state) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  res.json({ sessionToken: token, ...state });
});

router.post("/saarthi/signup", async (req, res) => {
  if (rejectUnverifiedPasswordAuth(res)) return;
  const profile = parseProfile(req.body?.profile);
  const password = req.body?.password;
  if (
    !profile ||
    (password !== undefined &&
      (!isBoundedString(password, MAX_PASSWORD_LENGTH) ||
        password.length < MIN_PASSWORD_LENGTH))
  ) {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }
  try {
    const result = await signUpUser(profile, password);
    res.json(result);
  } catch (error) {
    sendStoreError(req, res, error);
  }
});

router.post("/saarthi/login", async (req, res) => {
  if (rejectUnverifiedPasswordAuth(res)) return;
  const email = req.body?.email;
  const password = req.body?.password;
  if (
    !isBoundedString(email, MAX_EMAIL_LENGTH) ||
    !isBoundedString(password, MAX_PASSWORD_LENGTH)
  ) {
    res.status(401).json({ error: "INVALID_CREDENTIALS" });
    return;
  }
  const result = await loginUser(email, password);
  if (!result) {
    res.status(401).json({ error: "INVALID_CREDENTIALS" });
    return;
  }
  res.json(result);
});

/**
 * Exchanges a Clerk session token for a Saarthi session. The email comes only
 * from Clerk's server-side verification, never from the request body.
 */
router.post("/saarthi/clerk-session", async (req, res) => {
  if (!isClerkBackendConfigured()) {
    res.status(503).json({ error: "CLERK_NOT_CONFIGURED" });
    return;
  }
  const clerkToken =
    typeof req.body?.clerkToken === "string" ? req.body.clerkToken.trim() : "";
  if (!clerkToken || clerkToken.length > 8_192) {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }
  const email = await resolveEmailFromClerkToken(clerkToken);
  if (!email) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  const name =
    typeof req.body?.name === "string"
      ? req.body.name.slice(0, MAX_NAME_LENGTH)
      : "";
  try {
    const result = await loginVerifiedEmailUser(email, name);
    res.json(result);
  } catch (error) {
    req.log.error({ err: error }, "clerk-session failed");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

router.post("/saarthi/logout", async (req, res) => {
  const token = getBearerToken(req);
  if (token) await deleteSession(token);
  res.json({ ok: true });
});

router.put("/saarthi/profile", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  const profile = parseProfile(req.body?.profile);
  if (!profile) {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }
  try {
    await updateUserProfile(auth.userId, profile, {
      // The Clerk-verified email identifies the account; it cannot be edited.
      allowEmailChange: !isClerkBackendConfigured(),
    });
    const state = await loadUserState(auth.userId);
    res.json({ sessionToken: auth.token, ...state });
  } catch (error) {
    sendStoreError(req, res, error);
  }
});

router.put("/saarthi/saved", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  const ids = parseSavedServiceIds(req.body?.savedServiceIds);
  if (!ids) {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }
  await replaceSavedServices(auth.userId, ids);
  res.json({ savedServiceIds: ids });
});

router.put("/saarthi/chats", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  const chats = parseChats(req.body?.chats);
  if (!chats) {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }
  try {
    await replaceChats(auth.userId, chats);
  } catch (error) {
    sendStoreError(req, res, error);
    return;
  }
  res.json({ chats });
});

router.get("/saarthi/stream", async (req, res) => {
  const queryToken =
    typeof req.query.token === "string" ? req.query.token : undefined;
  const token = getBearerToken(req) || queryToken;
  const userId = await resolveSession(token);
  if (!userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  // Connect before sending headers so a database failure is a clean 503.
  let client;
  try {
    client = await pool.connect();
    await client.query("LISTEN saarthi_user_change");
  } catch (error) {
    client?.release(true);
    req.log.error({ err: error }, "saarthi stream unavailable");
    res.status(503).json({ error: "STREAM_UNAVAILABLE" });
    return;
  }
  const listener = client;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");

  let closed = false;
  const pushState = async () => {
    const state = await loadUserState(userId);
    if (!state || closed) return;
    res.write(`data: ${JSON.stringify(state)}\n\n`);
  };

  const onNotify = (msg: { channel?: string; payload?: string }) => {
    if (msg.channel !== "saarthi_user_change") return;
    if (msg.payload !== userId) return;
    pushState().catch(() => {
      /* client may have disconnected */
    });
  };

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 25000);

  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    listener.removeListener("notification", onNotify);
    listener.query("UNLISTEN saarthi_user_change").catch(() => undefined);
    listener.release();
  };
  req.on("close", cleanup);

  listener.on("notification", onNotify);
  pushState().catch((error) => {
    req.log.warn({ err: error }, "saarthi stream initial push failed");
  });
});

export default router;
