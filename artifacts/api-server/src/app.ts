import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { assistantJsonParser } from "./routes/assistant";
import { razorpayWebhookRawParser } from "./routes/payments";
import router from "./routes";
import { logger } from "./lib/logger";
import { rateLimit } from "./lib/rateLimit";

const app: Express = express();

// Hosts such as Render put the app behind a proxy; req.ip (used for rate
// limiting) is only the real client address when this matches the number of
// proxy hops. Override with TRUST_PROXY (a hop count, or "false").
function trustProxySetting(raw: string | undefined): number | false {
  const value = raw?.trim();
  if (value === "false") return false;
  const hops = Number(value);
  return value && Number.isInteger(hops) && hops >= 0 ? hops : 1;
}
app.set("trust proxy", trustProxySetting(process.env.TRUST_PROXY));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Auth uses bearer tokens (no cookies), so any origin may call the API.
app.use(cors());

const minute = 60_000;
app.use(
  ["/api/saarthi/signup", "/api/saarthi/login", "/api/saarthi/clerk-session"],
  rateLimit({ name: "auth", windowMs: minute, max: 20 }),
);
app.use(
  "/api/payments/razorpay/order",
  rateLimit({ name: "payment-order", windowMs: minute, max: 10 }),
);
app.use("/api/admin", rateLimit({ name: "admin", windowMs: minute, max: 120 }));

app.use("/api/assistant", assistantJsonParser);
app.use("/api/payments/razorpay/webhook", razorpayWebhookRawParser);
// The app syncs all of a user's chats in one request.
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

// Express 5 forwards rejected async handlers here. Never send internals
// (stack traces, database messages) to clients.
const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const status =
    typeof error?.status === "number" &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;
  if (status === 500) {
    req.log.error({ err: error }, "unhandled request error");
  }
  if (res.headersSent) {
    res.end();
    return;
  }
  const code =
    status === 413
      ? "REQUEST_TOO_LARGE"
      : status === 400
        ? "INVALID_BODY"
        : status === 500
          ? "SERVER_ERROR"
          : "REQUEST_ERROR";
  res.status(status).json({ error: code });
};
app.use(errorHandler);

export default app;
