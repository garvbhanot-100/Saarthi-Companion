import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import {
  listAllUsersForAdmin,
  loadUserState,
} from "../lib/saarthiStore";
import { adminRequestAuthorized } from "../lib/adminAuth";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: () => void) {
  if (!adminRequestAuthorized(req)) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  next();
}

router.use(requireAdmin);

router.get("/admin/users", async (_req, res) => {
  const users = await listAllUsersForAdmin();
  res.json({ users });
});

router.get("/admin/users/:userId", async (req, res) => {
  const state = await loadUserState(req.params.userId);
  if (!state) {
    res.status(404).json({ error: "NOT_FOUND" });
    return;
  }
  res.json(state);
});

router.get("/admin/stream", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");

  const client = await pool.connect();
  await client.query("LISTEN saarthi_user_change");

  const pushUsers = async () => {
    const users = await listAllUsersForAdmin();
    res.write(`data: ${JSON.stringify({ users })}\n\n`);
  };

  const onNotify = async () => {
    try {
      await pushUsers();
    } catch {
      /* disconnected */
    }
  };

  client.on("notification", onNotify);
  await pushUsers();

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    client.removeListener("notification", onNotify);
    client.release();
  });
});

export default router;
