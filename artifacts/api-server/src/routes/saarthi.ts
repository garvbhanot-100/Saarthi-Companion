import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import {
  deleteSession,
  loadUserState,
  loginUser,
  replaceChats,
  replaceSavedServices,
  resolveSession,
  signUpUser,
  upgradeUserToPremium,
  updateUserProfile,
  type ChatSessionDto,
  type UserProfileDto,
} from "../lib/saarthiStore";

const router: IRouter = Router();

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  const bodyToken =
    typeof req.body?.sessionToken === "string" ? req.body.sessionToken : "";
  return bodyToken.trim() || undefined;
}

async function requireUserId(req: Request, res: Response) {
  const token = getBearerToken(req);
  const userId = await resolveSession(token);
  if (!userId) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return null;
  }
  return { userId, token: token! };
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
  try {
    const profile = req.body?.profile as UserProfileDto | undefined;
    const password =
      typeof req.body?.password === "string" ? req.body.password : undefined;
    if (!profile?.email || !profile?.name) {
      res.status(400).json({ error: "INVALID_BODY" });
      return;
    }
    const result = await signUpUser(profile, password);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "EMAIL_TAKEN") {
      res.status(409).json({ error: "EMAIL_TAKEN" });
      return;
    }
    if (message === "GOOGLE_EMAIL_NOT_ALLOWED") {
      res.status(403).json({ error: "GOOGLE_EMAIL_NOT_ALLOWED" });
      return;
    }
    res.status(400).json({ error: message });
  }
});

router.post("/saarthi/login", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password =
      typeof req.body?.password === "string" ? req.body.password : undefined;
    const profile = req.body?.profile as UserProfileDto | undefined;
    const result = await loginUser(email, password, profile);
    if (!result) {
      res.status(401).json({ error: "INVALID_CREDENTIALS" });
      return;
    }
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "GOOGLE_EMAIL_NOT_ALLOWED") {
      res.status(403).json({ error: "GOOGLE_EMAIL_NOT_ALLOWED" });
      return;
    }
    res.status(400).json({ error: message });
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
  try {
    const profile = req.body?.profile as UserProfileDto | undefined;
    if (!profile) {
      res.status(400).json({ error: "INVALID_BODY" });
      return;
    }
    await updateUserProfile(auth.userId, profile);
    const state = await loadUserState(auth.userId);
    res.json({ sessionToken: auth.token, ...state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    res.status(400).json({ error: message });
  }
});

router.put("/saarthi/saved", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  const ids = Array.isArray(req.body?.savedServiceIds)
    ? (req.body.savedServiceIds as string[])
    : [];
  await replaceSavedServices(auth.userId, ids);
  res.json({ savedServiceIds: ids });
});

router.put("/saarthi/chats", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  const chats = Array.isArray(req.body?.chats)
    ? (req.body.chats as ChatSessionDto[])
    : [];
  await replaceChats(auth.userId, chats);
  res.json({ chats });
});

router.post("/saarthi/upgrade-premium", async (req, res) => {
  const auth = await requireUserId(req, res);
  if (!auth) return;
  try {
    const state = await upgradeUserToPremium(auth.userId);
    res.json({ sessionToken: auth.token, ...state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    res.status(400).json({ error: message });
  }
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

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(": connected\n\n");

  const listener = pool;
  const client = await listener.connect();
  await client.query("LISTEN saarthi_user_change");

  const pushState = async () => {
    const state = await loadUserState(userId);
    if (!state) return;
    res.write(`data: ${JSON.stringify(state)}\n\n`);
  };

  const onNotify = async (msg: { channel?: string; payload?: string }) => {
    if (msg.channel !== "saarthi_user_change") return;
    if (msg.payload !== userId) return;
    try {
      await pushState();
    } catch {
      /* client may have disconnected */
    }
  };

  client.on("notification", onNotify);
  await pushState();

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
