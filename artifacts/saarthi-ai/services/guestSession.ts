import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UserProfile } from "@/context/SaarthiContext";

export const GUEST_EMAIL = "guest@saarthi.local";
const GUEST_FLAG_KEY = "@saarthi/guest-session";
const GUEST_PROFILE_KEY = "@saarthi/guest-profile";

export function isGuestProfile(
  profile: UserProfile | null | undefined,
): boolean {
  return profile?.email?.toLowerCase() === GUEST_EMAIL;
}

export function createGuestProfile(displayName: string): UserProfile {
  return {
    name: displayName.trim() || "Guest",
    email: GUEST_EMAIL,
  };
}

export async function saveGuestSession(profile: UserProfile) {
  await AsyncStorage.multiSet([
    [GUEST_FLAG_KEY, "1"],
    [GUEST_PROFILE_KEY, JSON.stringify(profile)],
  ]);
}

export async function readGuestSession(): Promise<UserProfile | null> {
  try {
    if ((await AsyncStorage.getItem(GUEST_FLAG_KEY)) !== "1") {
      return null;
    }
    const raw = await AsyncStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) {
      return createGuestProfile("Guest");
    }
    const parsed = JSON.parse(raw) as UserProfile;
    if (parsed?.email?.toLowerCase() !== GUEST_EMAIL) {
      return null;
    }
    return {
      name: parsed.name?.trim() || "Guest",
      email: GUEST_EMAIL,
    };
  } catch {
    return null;
  }
}

export async function clearGuestSession() {
  try {
    await AsyncStorage.multiRemove([GUEST_FLAG_KEY, GUEST_PROFILE_KEY]);
  } catch {
    // ignore
  }
}