import type { RequestHandler } from "express";

/**
 * Fixed-window, per-client-IP rate limiter kept in memory. Good enough for a
 * single API instance; with several instances each keeps its own counts.
 * The client IP comes from `req.ip`, so `trust proxy` must match the hosting
 * proxy chain (see TRUST_PROXY in app.ts).
 */
export function rateLimit(options: {
  name: string;
  windowMs: number;
  max: number;
}): RequestHandler {
  const hits = new Map<string, { startedAt: number; count: number }>();

  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5_000) {
      for (const [key, entry] of hits) {
        if (now - entry.startedAt >= options.windowMs) hits.delete(key);
      }
    }

    const key = req.ip || req.socket.remoteAddress || "unknown";
    const entry = hits.get(key);
    if (!entry || now - entry.startedAt >= options.windowMs) {
      hits.set(key, { startedAt: now, count: 1 });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > options.max) {
      const retryAfterSeconds = Math.ceil(
        (entry.startedAt + options.windowMs - now) / 1000,
      );
      res.setHeader("Retry-After", String(Math.max(1, retryAfterSeconds)));
      req.log?.warn({ limiter: options.name }, "rate limit exceeded");
      res.status(429).json({ error: "RATE_LIMITED" });
      return;
    }
    next();
  };
}
