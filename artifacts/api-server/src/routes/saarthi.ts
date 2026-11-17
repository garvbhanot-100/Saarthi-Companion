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
  updateUserProfile,
  type ChatSessionDto,
  type UserProfileDto,
} from "../lib/saarthiStore";
import {
  isClerkBackendConfigured,
  resolveEmailFromClerkToken,
} from "../lib/clerkAdminAuth";

const router: IRouter = Router();

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
    res.status(400).json({ error: message });
  }
});

router.post("/saarthi/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : undefined;
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
  if (!clerkToken) {
    res.status(400).json({ error: "INVALID_BODY" });
    return;
  }
  const email = await resolveEmailFromClerkToken(clerkToken);
  if (!email) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  const name = typeof req.body?.name === "string" ? req.body.name : "";
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
