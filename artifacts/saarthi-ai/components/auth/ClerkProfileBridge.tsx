import { useAuth, useUser } from "@clerk/expo";
import { useEffect } from "react";

import { profileFromClerkUser } from "@/components/auth/syncClerkToSaarthi";
import { isClerkConfigured } from "@/constants/clerk";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";

/** Keeps in-app profile in sync with Clerk only — no API server. */
export function ClerkProfileBridge() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { t } = useLanguage();
  const { user, isGuest, clerkBridgePaused, completeClerkSession, logOut } =
    useSaarthi();

  useEffect(() => {
    if (!isClerkConfigured || !isLoaded || clerkBridgePaused) return;
    if (!isSignedIn && user && !isGuest) {
      void logOut();
    }
  }, [
    isClerkConfigured,
    isLoaded,
    isSignedIn,
    user,
    isGuest,
    clerkBridgePaused,
    logOut,
  ]);

  useEffect(() => {
    if (
      !isClerkConfigured ||
      !isLoaded ||
      clerkBridgePaused ||
      !isSignedIn ||
      !clerkUser
    ) {
      return;
    }
    const profile = profileFromClerkUser(clerkUser, t("profileAuthDefaultName"));
    if (!profile) return;
    if (
      user?.email === profile.email &&
      user?.name === profile.name
    ) {
      return;
    }
    completeClerkSession(profile, "login");
  }, [
    isLoaded,
    isSignedIn,
    clerkUser,
    clerkBridgePaused,
    user?.email,
    user?.name,
    t,
    completeClerkSession,
  ]);

  return null;
}