import { useAuth, useUser } from "@clerk/expo";
import { useHostedAuth } from "@clerk/expo/hosted-auth";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { GhostButton } from "@/components/UI";
import { useLanguage } from "@/context/LanguagesContext";
import { useColors } from "@/hooks/useColors";

type ClerkHostedAuthProps = {
  mode: "login" | "signup";
  busy?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onComplete?: () => void;
  onError?: (message: string) => void;
};

export function ClerkHostedAuthButtons({
  mode,
  busy = false,
  onBusyChange,
  onComplete,
  onError,
}: ClerkHostedAuthProps) {
  const c = useColors();
  const { t } = useLanguage();
  const { isLoaded, isSignedIn } = useAuth();
  const { startHostedAuth } = useHostedAuth();
  const [clerkBusy, setClerkBusy] = useState(false);

  const disabled = busy || clerkBusy || !isLoaded;

  const runHostedAuth = async () => {
    if (disabled || isSignedIn) return;
    setClerkBusy(true);
    onBusyChange?.(true);
    try {
      await startHostedAuth({ mode: mode === "signup" ? "sign-up" : "sign-in" });
      onComplete?.();
    } catch (error) {
      console.error("Clerk hosted auth failed:", error);
      onError?.(t("profileAuthClerkFailed"));
    } finally {
      setClerkBusy(false);
      onBusyChange?.(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <GhostButton
      title={
        clerkBusy
          ? t("profileAuthWaiting")
          : mode === "signup"
            ? t("profileAuthContinueClerkSignUp")
            : t("profileAuthContinueClerkSignIn")
      }
      icon="shield"
      onPress={() => {
        if (disabled) return;
        void runHostedAuth();
      }}
    />
  );
}

export function ClerkAccountBadge() {
  const c = useColors();
  const { t } = useLanguage();
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { startHostedAuth } = useHostedAuth();
  const [busy, setBusy] = useState(false);

  if (!isLoaded || !isSignedIn || !user) {
    return null;
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <View style={styles.badgeHeader}>
        <Text style={[styles.badgeTitle, { color: c.foreground }]}>
          {t("profileClerkAccount")}
        </Text>
        <View style={[styles.clerkDot, { backgroundColor: c.primary }]} />
      </View>
      {email ? (
        <Text style={[styles.badgeEmail, { color: c.mutedForeground }]}>
          {email}
        </Text>
      ) : null}
      <View style={styles.badgeActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profileClerkManageAccount")}
          disabled={busy}
          onPress={() => {
            setBusy(true);
            void startHostedAuth({ mode: "sign-in" }).finally(() => setBusy(false));
          }}
        >
          <Text style={[styles.badgeLink, { color: c.primary }]}>
            {t("profileClerkManageAccount")}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profileClerkSignOut")}
          disabled={busy}
          onPress={() => {
            setBusy(true);
            void signOut().finally(() => setBusy(false));
          }}
        >
          <Text style={[styles.badgeLink, { color: c.accent }]}>
            {t("profileClerkSignOut")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    paddingVertical: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  badgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  clerkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeEmail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  badgeActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  badgeLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
