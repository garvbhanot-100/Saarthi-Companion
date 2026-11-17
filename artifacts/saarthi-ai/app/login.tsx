import { Feather } from "@expo/vector-icons";
import { isClerkAPIResponseError, useAuth, useClerk } from "@clerk/expo";
// @clerk/expo v4 (Clerk Core 3) changed `useSignIn` from "@clerk/expo" to the
// signal API (no isLoaded/setActive). The classic hook this screen is written
// for is the officially supported export from "@clerk/expo/legacy".
import { useSignIn } from "@clerk/expo/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import { useOAuthBrowserWarmup } from "@/hooks/useOAuthBrowserWarmup";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { profileFromClerkUser } from "@/components/auth/syncClerkToSaarthi";
import {
  AUTH_BG_GRADIENT,
  AUTH_BTN_GRADIENT_LOGIN,
  AuthError,
  AuthField,
  AuthGradientButton,
  AuthGuestButton,
  AuthSocialDivider,
  AuthSwitchLink,
  SoftAuthLayout,
} from "@/components/auth/SimpleAuthLayout";
import { ClerkAuthReady } from "@/components/auth/ClerkAuthReady";
import { GoogleClerkButton } from "@/components/GoogleClerkButton";
import { isClerkConfigured } from "@/constants/clerk";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";

WebBrowser.maybeCompleteAuthSession();

const enterApp = () => router.replace("/(tabs)");

function clerkErrorMessage(error: unknown, fallback: string) {
  if (isClerkAPIResponseError(error)) {
    const line = error.errors[0]?.longMessage || error.errors[0]?.message;
    if (line?.trim()) return line.trim();
  }
  return fallback;
}

export default function LoginScreen() {
  const { t, hydrated: languageHydrated } = useLanguage();
  const {
    hydrated: profileHydrated,
    user,
    completeClerkSession,
    enterGuestSession,
    isGuest,
  } = useSaarthi();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const clerk = useClerk();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const authInProgress = useRef(false);

  useOAuthBrowserWarmup();

  useEffect(() => {
    if (!profileHydrated || !authLoaded) return;
    if (isGuest) {
      enterApp();
      return;
    }
    if (isClerkConfigured && isSignedIn && user) {
      enterApp();
    }
  }, [profileHydrated, authLoaded, isSignedIn, isGuest, user]);

  const continueAsGuest = () => {
    enterGuestSession(t("profileAuthGuestName"));
    enterApp();
  };

  const guestControl = (
    <AuthGuestButton
      label={t("profileAuthContinueAsGuest")}
      hint={t("profileAuthGuestHint")}
      onPress={continueAsGuest}
    />
  );

  const submitEmail = async () => {
    if (authInProgress.current) return;
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      setError(t("profileAuthInvalidEmail"));
      return;
    }
    if (!password) {
      setError(t("profileAuthPasswordRequired"));
      return;
    }

    if (!isClerkConfigured) {
      setError(t("profileAuthClerkRequiredForSignup"));
      return;
    }
    if (!authLoaded || !signInLoaded || !signIn) {
      setError(t("profileAuthClerkLoading"));
      return;
    }

    authInProgress.current = true;
    setBusy(true);
    try {
      const attempt = await signIn.create({
        identifier: normalizedEmail,
        password,
      });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        const profile = profileFromClerkUser(
          clerk.user ?? {},
          t("profileAuthDefaultName"),
        );
        if (!profile) {
          setError(t("profileAuthGoogleEmailMissing"));
          return;
        }
        completeClerkSession(profile, "login");
        enterApp();
        return;
      }
      setError(t("profileAuthInvalidCredentials"));
    } catch (e) {
      setError(clerkErrorMessage(e, t("profileAuthGoogleLoginFailed")));
    } finally {
      authInProgress.current = false;
      setBusy(false);
    }
  };

  if (!languageHydrated || !profileHydrated) {
    return (
      <LinearGradient colors={[...AUTH_BG_GRADIENT]} style={styles.loading}>
        <ActivityIndicator color="#fff" />
      </LinearGradient>
    );
  }

  const form = (
    <SoftAuthLayout
      screenTitle={t("profileAuthScreenLogin")}
      gradientButtonColors={AUTH_BTN_GRADIENT_LOGIN}
      footer={
        <AuthSwitchLink
          prompt={t("profileAuthNoAccount")}
          actionLabel={t("profileAuthScreenSignup")}
          onPress={() => router.push("/signup")}
        />
      }
    >
      {error ? <AuthError message={error} /> : null}

      {isClerkConfigured ? (
        <GoogleClerkButton
          mode="login"
          busy={busy}
          onBusyChange={setBusy}
          onError={setError}
          onSuccess={enterApp}
        />
      ) : null}

      {isClerkConfigured ? <AuthSocialDivider label={t("profileAuthOr")} /> : null}

      <AuthField
        label={t("profileAuthEmail")}
        icon="mail"
        value={email}
        onChangeText={setEmail}
        placeholder={t("profileAuthEmailPlaceholder")}
        keyboardType="email-address"
        autoCapitalize="none"
        labelAction={{
          text: t("profileAuthForgotPassword"),
          onPress: () =>
            Alert.alert(
              t("profileAuthPasswordResetTitle"),
              t("profileAuthPasswordResetDescription"),
            ),
        }}
      />
      <AuthField
        label={t("profileAuthPassword")}
        icon="lock"
        value={password}
        onChangeText={setPassword}
        placeholder={t("profileAuthPasswordPlaceholder")}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              showPassword
                ? t("profileAuthHidePassword")
                : t("profileAuthShowPassword")
            }
            hitSlop={10}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#64748b" />
          </Pressable>
        }
      />

      <AuthGradientButton
        label={busy ? t("profileAuthWaiting") : t("profileAuthScreenLogin")}
        busy={busy}
        onPress={() => void submitEmail()}
        gradientColors={AUTH_BTN_GRADIENT_LOGIN}
      />

      {guestControl}
    </SoftAuthLayout>
  );

  const guestOnLoading = (
    <AuthGuestButton
      variant="onGradient"
      label={t("profileAuthContinueAsGuest")}
      hint={t("profileAuthGuestHint")}
      onPress={continueAsGuest}
    />
  );

  if (isClerkConfigured) {
    return (
      <ClerkAuthReady earlyAccess={guestOnLoading}>{form}</ClerkAuthReady>
    );
  }

  return form;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});