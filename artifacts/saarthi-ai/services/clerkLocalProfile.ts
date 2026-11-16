import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UserProfile } from "@/context/SaarthiContext";

const LOCAL_PROFILE_KEY = "@saarthi/clerk-profile";

export async function saveClerkLocalProfile(profile: UserProfile) {
  await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
}

export async function readClerkLocalProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed?.email?.includes("@") || !parsed?.name?.trim()) return null;
    return {
      name: parsed.name.trim(),
      email: parsed.email.trim().toLowerCase(),
    };
  } catch {
    return null;
  }
}

export async function clearClerkLocalProfile() {
  await AsyncStorage.removeItem(LOCAL_PROFILE_KEY);
}