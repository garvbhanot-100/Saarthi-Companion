import { useClerk, useSSO } from "@clerk/expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as AuthSession from "expo-auth-session";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { MotionPressable } from "@/components/Motion";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";

const NATIVE_SCHEME = "com.garv.saarthiai";

function getGoogleRedirectUrl() {
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  if (isExpoGo) {
    return AuthSession.makeRedirectUri({ path: "sso-callback" });
  }

  return AuthSession.makeRedirectUri({
    scheme: NATIVE_SCHEME,
    path: "callback",
  });
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 37.3 44 32 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </Svg>
  );
}

type Props = {
  mode: "login" | "signup";
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string) => void;
  onSuccess: () => void;
  variant?: "default" | "hero" | "icon" | "auth";
};

export function GoogleClerkButton({
  mode,
  busy,
  onBusyChange,
  onError,
  onSuccess,
  variant = "auth",
}: Props) {
  const c = useColors();
  const { t } = useLanguage();
  const { completeClerkSession } = useSaarthi();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  const [localBusy, setLocalBusy] = useState(false);

  const disabled = busy || localBusy;

  const continueWithGoogle = async () => {
    if (disabled) return;
    setLocalBusy(true);
    onBusyChange(true);
    onError("");
    try {
      const redirectUrl = getGoogleRedirectUrl();
      const {
        createdSessionId,
        setActive,
        signIn: clerkSignIn,
        signUp: clerkSignUp,
        authSessionResult,
      } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      if (
        authSessionResult?.type === "cancel" ||
        authSessionResult?.type === "dismiss"
      ) {
        return;
      }

      if (!createdSessionId || !setActive) {
        onError(t("profileAuthGoogleLoginFailed"));
        return;
      }

      await setActive({ session: createdSessionId });

      const clerkUser = clerk.user;
      const emailAddress =
        clerkUser?.primaryEmailAddress?.emailAddress ||
        clerkUser?.emailAddresses?.[0]?.emailAddress ||
        clerkSignUp?.emailAddress ||
        (typeof clerkSignIn?.identifier === "string" &&
        clerkSignIn.identifier.includes("@")
          ? clerkSignIn.identifier
          : undefined);

      if (!emailAddress?.trim()) {
        onError(t("profileAuthGoogleEmailMissing"));
        return;
      }

      const profile = {
        name:
          clerkUser?.fullName?.trim() ||
          [clerkUser?.firstName, clerkUser?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          clerkSignUp?.firstName?.trim() ||
          t("profileAuthDefaultName"),
        email: emailAddress.trim().toLowerCase(),
      };

      completeClerkSession(profile, mode);
      onSuccess();
    } catch (googleError) {
      console.error("Google sign-in failed:", googleError);
      const message =
        googleError instanceof Error ? googleError.message.toLowerCase() : "";
      if (
        message.includes("cancel") ||
        message.includes("dismiss") ||
        message.includes("closed")
      ) {
        return;
      }
      const detail =
        googleError instanceof Error && googleError.message.trim()
          ? googleError.message.trim()
          : t("profileAuthGoogleLoginFailed");
      onError(detail);
    } finally {
      setLocalBusy(false);
      onBusyChange(false);
    }
  };

  if (variant === "icon") {
    return (
      <View style={styles.iconRow}>
        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={t("profileAuthContinueGoogle")}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => void continueWithGoogle()}
          style={({ pressed }) => [
            styles.googleIconBtn,
            { opacity: disabled ? 0.65 : pressed ? 0.9 : 1 },
          ]}
        >
          <GoogleIcon size={22} />
        </MotionPressable>
      </View>
    );
  }

  const label = disabled ? t("profileAuthWaiting") : t("profileAuthContinueGoogle");
  const iconSize = variant === "hero" ? 22 : 20;

  if (variant === "auth") {
    return (
      <View style={styles.authWrap}>
        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={t("profileAuthContinueGoogle")}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => void continueWithGoogle()}
          style={({ pressed }) => [
            styles.googleAuthBtn,
            { opacity: disabled ? 0.75 : pressed ? 0.92 : 1 },
          ]}
        >
          {disabled ? (
            <ActivityIndicator size="small" color="#4f46e5" />
          ) : (
            <GoogleIcon size={iconSize} />
          )}
          <Text style={styles.googleAuthLabel} numberOfLines={1}>
            {label}
          </Text>
        </MotionPressable>
      </View>
    );
  }

  return (
    <View>
      <MotionPressable
        accessibilityRole="button"
        accessibilityLabel={t("profileAuthContinueGoogle")}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => void continueWithGoogle()}
        style={({ pressed }) => [
          styles.googleBtn,
          variant === "hero" && styles.googleBtnHero,
          {
            borderColor: variant === "hero" ? "rgba(16, 24, 40, 0.08)" : c.border,
            opacity: disabled ? 0.7 : pressed ? 0.94 : 1,
          },
        ]}
      >
        <GoogleIcon size={iconSize} />
        <Text
          style={[
            styles.googleBtnText,
            variant === "hero" && styles.googleBtnTextHero,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </MotionPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  authWrap: {
    marginBottom: 6,
  },
  googleAuthBtn: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#eef1f8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
    shadowColor: "#94a3b8",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  googleAuthLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#334155",
    letterSpacing: -0.2,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  googleIconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#64748b",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  googleBtn: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  googleBtnHero: {
    minHeight: 58,
    borderRadius: 18,
    gap: 12,
    paddingHorizontal: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  googleBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#1f1f1f",
    flexShrink: 1,
  },
  googleBtnTextHero: {
    fontSize: 16,
  },
});