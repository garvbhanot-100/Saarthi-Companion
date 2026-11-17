import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import {
  listAllUsersForAdmin,
  loadUserState,
} from "../lib/saarthiStore";
import { adminRequestAuthorized } from "../lib/adminAuth";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: () => void) {
  adminRequestAuthorized(req).then(
    (ok) => {
      if (!ok) {
        res.status(401).json({ error: "UNAUTHORIZED" });
        return;
      }
      next();
    },
    (error: unknown) => {
      req.log.error({ err: error }, "admin auth check failed");
      res.status(500).json({ error: "SERVER_ERROR" });
    },
  );
}

// Only /admin paths need an admin; other unknown /api paths get a 404.
router.use("/admin", requireAdmin);

router.get("/admin/users", async (_req, res) => {
  const users = await listAllUsersForAdmin();
  res.json({ users });
});

router.get("/admin/users/:userId", async (req, res) => {
  // User ids are UUIDs; anything else would make Postgres throw.
  if (!/^[0-9a-f-]{36}$/i.test(req.params.userId)) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  const state = await loadUserState(req.params.userId);
  if (!state) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  res.json(state);
});

router.get("/admin/stream", async (req, res) => {
  // Connect before sending headers so a database failure is a clean 503.
  let client;
  try {
    client = await pool.connect();
    await client.query("LISTEN saarthi_user_change");
  } catch (error) {
    client?.release(true);
    req.log.error({ err: error }, "admin stream unavailable");
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
  const pushUsers = async () => {
    const users = await listAllUsersForAdmin();
    if (closed) return;
    res.write(`data: ${JSON.stringify({ users })}\n\n`);
  };

  const onNotify = () => {
    pushUsers().catch(() => {
      /* disconnected */
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
  pushUsers().catch((error) => {
    req.log.warn({ err: error }, "admin stream initial push failed");
  });
});

export default router;
