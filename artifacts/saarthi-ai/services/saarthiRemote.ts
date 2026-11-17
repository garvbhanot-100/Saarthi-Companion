import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";

import type { UserPlan } from "@/constants/subscription";
import type { ChatSession, UserProfile } from "@/context/SaarthiContext";

const SESSION_KEY = "@saarthi/session-token";
const SECURE_SESSION_KEY = "saarthi-session-token";
// Cross-device sync cadence while the app is in the foreground.
const POLL_INTERVAL_MS = 10_000;

function apiBase() {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!url) {
    throw new Error("API_NOT_CONFIGURED");
  }
  return `${url}/api`;
}

export function isRemoteDataEnabled() {
  return Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
}

async function saveSessionToken(token: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(SESSION_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(SECURE_SESSION_KEY, token);
}

export async function readSessionToken() {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(SESSION_KEY);
  }
  return SecureStore.getItemAsync(SECURE_SESSION_KEY);
}

export async function clearSessionToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
}

async function apiFetch(
  path: string,
  init: RequestInit & { sessionToken?: string | null } = {},
) {
  const { sessionToken, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Content-Type", "application/json");
  if (sessionToken) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      ...rest,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code =
      typeof data?.error === "string" ? data.error : `HTTP_${response.status}`;
    throw new Error(code);
  }
  return data as Record<string, unknown>;
}

export type RemoteUserState = {
  sessionToken: string;
  user: UserProfile;
  plan: UserPlan;
  savedServiceIds: string[];
  chats: ChatSession[];
};

function parsePlan(value: unknown): UserPlan {
  return value === "premium" ? "premium" : "free";
}

export async function remoteFetchState(
  sessionToken: string,
): Promise<RemoteUserState | null> {
  try {
    const data = await apiFetch("/saarthi/state", { sessionToken });
    return {
      sessionToken,
      user: data.user as UserProfile,
      plan: parsePlan(data.plan),
      savedServiceIds: data.savedServiceIds as string[],
      chats: data.chats as ChatSession[],
    };
  } catch {
    return null;
  }
}

export async function remoteSignUp(profile: UserProfile, password?: string) {
  const data = await apiFetch("/saarthi/signup", {
    method: "POST",
    body: JSON.stringify({ profile, password }),
  });
  const token = data.token as string;
  await saveSessionToken(token);
  const state = data.state as Record<string, unknown>;
  return {
    sessionToken: token,
    user: state.user as UserProfile,
    plan: parsePlan(state.plan),
    savedServiceIds: state.savedServiceIds as string[],
    chats: state.chats as ChatSession[],
  };
}

export async function remoteLogin(
  email: string,
  password?: string,
  profile?: UserProfile,
) {
  const data = await apiFetch("/saarthi/login", {
    method: "POST",
    body: JSON.stringify({ email, password, profile }),
  });
  const token = data.token as string;
  await saveSessionToken(token);
  const state = data.state as Record<string, unknown>;
  return {
    sessionToken: token,
    user: state.user as UserProfile,
    plan: parsePlan(state.plan),
    savedServiceIds: state.savedServiceIds as string[],
    chats: state.chats as ChatSession[],
  };
}

export async function remoteLogout(sessionToken: string) {
  try {
    await apiFetch("/saarthi/logout", {
      method: "POST",
      sessionToken,
    });
  } finally {
    await clearSessionToken();
  }
}

export async function remoteUpdateProfile(
  sessionToken: string,
  profile: UserProfile,
) {
  const data = await apiFetch("/saarthi/profile", {
    method: "PUT",
    sessionToken,
    body: JSON.stringify({ profile }),
  });
  return {
    user: data.user as UserProfile,
    plan: parsePlan(data.plan),
    savedServiceIds: data.savedServiceIds as string[],
    chats: data.chats as ChatSession[],
  };
}

/**
 * Exchanges a Clerk session token for a Saarthi API session. The server
 * verifies the token with Clerk and takes the email from Clerk, not from us.
 */
export async function remoteClerkSession(clerkToken: string, name: string) {
  const data = await apiFetch("/saarthi/clerk-session", {
    method: "POST",
    body: JSON.stringify({ clerkToken, name }),
  });
  const state = data.state as Record<string, unknown>;
  return {
    sessionToken: data.token as string,
    user: state.user as UserProfile,
    plan: parsePlan(state.plan),
    savedServiceIds: state.savedServiceIds as string[],
    chats: state.chats as ChatSession[],
  };
}

export type PremiumOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export async function remoteCreatePremiumOrder(
  sessionToken: string,
): Promise<PremiumOrder> {
  const data = await apiFetch("/payments/razorpay/order", {
    method: "POST",
    sessionToken,
  });
  return {
    orderId: data.orderId as string,
    amount: data.amount as number,
    currency: data.currency as string,
    keyId: data.keyId as string,
  };
}

/** Server verifies the Razorpay signature and grants Premium; returns fresh state. */
export async function remoteVerifyPremiumPayment(
  sessionToken: string,
  payment: { orderId: string; paymentId: string; signature: string },
) {
  const data = await apiFetch("/payments/razorpay/verify", {
    method: "POST",
    sessionToken,
    body: JSON.stringify(payment),
  });
  return {
    user: data.user as UserProfile,
    plan: parsePlan(data.plan),
    savedServiceIds: data.savedServiceIds as string[],
    chats: data.chats as ChatSession[],
  };
}

export async function remotePremiumOrderStatus(
  sessionToken: string,
  orderId: string,
): Promise<"created" | "paid" | "failed"> {
  const data = await apiFetch(
    `/payments/razorpay/order/${encodeURIComponent(orderId)}/status`,
    { sessionToken },
  );
  return data.status as "created" | "paid" | "failed";
}

export async function remotePushSaved(
  sessionToken: string,
  savedServiceIds: string[],
) {
  await apiFetch("/saarthi/saved", {
    method: "PUT",
    sessionToken,
    body: JSON.stringify({ savedServiceIds }),
  });
}

export async function remotePushChats(
  sessionToken: string,
  chats: ChatSession[],
) {
  await apiFetch("/saarthi/chats", {
    method: "PUT",
    sessionToken,
    body: JSON.stringify({ chats }),
  });
}

export function subscribeRemoteState(
  sessionToken: string,
  onState: (state: Omit<RemoteUserState, "sessionToken">) => void,
) {
  if (Platform.OS === "web" && typeof EventSource !== "undefined") {
    const url = `${apiBase()}/saarthi/stream?token=${encodeURIComponent(sessionToken)}`;
    const es = new EventSource(url);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          user: UserProfile;
          plan?: UserPlan;
          savedServiceIds: string[];
          chats: ChatSession[];
        };
        onState({
          user: parsed.user,
          plan: parsePlan(parsed.plan),
          savedServiceIds: parsed.savedServiceIds,
          chats: parsed.chats,
        });
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }

  return subscribeRemoteStatePolling(sessionToken, onState);
}

export function subscribeRemoteStatePolling(
  sessionToken: string,
  onState: (state: Omit<RemoteUserState, "sessionToken">) => void,
) {
  let cancelled = false;
  let inFlight = false;
  const tick = async () => {
    // Skip while backgrounded or while the previous request is still running.
    if (cancelled || inFlight || AppState.currentState !== "active") return;
    inFlight = true;
    try {
      const fresh = await remoteFetchState(sessionToken);
      if (fresh && !cancelled) {
        onState({
          user: fresh.user,
          plan: fresh.plan,
          savedServiceIds: fresh.savedServiceIds,
          chats: fresh.chats,
        });
      }
    } finally {
      inFlight = false;
    }
  };
  void tick();
  const interval = setInterval(() => void tick(), POLL_INTERVAL_MS);
  const appState = AppState.addEventListener("change", (state) => {
    if (state === "active") void tick();
  });
  return () => {
    cancelled = true;
    clearInterval(interval);
    appState.remove();
  };
}
