import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { UserPlan } from "@/constants/subscription";
import type { ChatSession, UserProfile } from "@/context/SaarthiContext";

const SESSION_KEY = "@saarthi/session-token";
const SECURE_SESSION_KEY = "saarthi-session-token";

function apiBase() {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!url) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Point it at your API server (e.g. http://localhost:5000).",
    );
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
  const response = await fetch(`${apiBase()}${path}`, { ...rest, headers });
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
  return {
    sessionToken: token,
    user: data.state.user as UserProfile,
    plan: parsePlan(data.state.plan),
    savedServiceIds: data.state.savedServiceIds as string[],
    chats: data.state.chats as ChatSession[],
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
  return {
    sessionToken: token,
    user: data.state.user as UserProfile,
    plan: parsePlan(data.state.plan),
    savedServiceIds: data.state.savedServiceIds as string[],
    chats: data.state.chats as ChatSession[],
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

export async function remoteUpgradePremium(sessionToken: string) {
  const data = await apiFetch("/saarthi/upgrade-premium", {
    method: "POST",
    sessionToken,
  });
  return {
    user: data.user as UserProfile,
    plan: parsePlan(data.plan),
    savedServiceIds: data.savedServiceIds as string[],
    chats: data.chats as ChatSession[],
  };
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
  const tick = async () => {
    if (cancelled) return;
    const fresh = await remoteFetchState(sessionToken);
    if (fresh && !cancelled) {
      onState({
        user: fresh.user,
        plan: fresh.plan,
        savedServiceIds: fresh.savedServiceIds,
        chats: fresh.chats,
      });
    }
  };
  void tick();
  const interval = setInterval(() => void tick(), 3500);
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}
