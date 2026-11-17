import { Feather } from "@expo/vector-icons";
import { isClerkAPIResponseError, useAuth, useClerk } from "@clerk/expo";
// @clerk/expo v4 (Clerk Core 3) changed `useSignUp` from "@clerk/expo" to the
// signal API (no isLoaded/setActive). The classic hook this screen is written
// for is the officially supported export from "@clerk/expo/legacy".
import { useSignUp } from "@clerk/expo/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import { useOAuthBrowserWarmup } from "@/hooks/useOAuthBrowserWarmup";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { profileFromClerkUser } from "@/components/auth/syncClerkToSaarthi";
import {
  AUTH_BG_GRADIENT,
  AUTH_BTN_GRADIENT_SIGNUP,
  AuthError,
  AuthField,
  AuthGradientButton,
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

export default function SignupScreen() {
  const { t, hydrated: languageHydrated } = useLanguage();
  const { hydrated: profileHydrated, user, completeClerkSession } = useSaarthi();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const {
    isLoaded: signUpLoaded,
    signUp: clerkSignUp,
    setActive,
  } = useSignUp();
  const clerk = useClerk();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Set when Clerk requires the email to be verified with a one-time code.
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [code, setCode] = useState("");
  const authInProgress = useRef(false);

  useOAuthBrowserWarmup();

  useEffect(() => {
    if (!profileHydrated || !authLoaded) return;
    if (isClerkConfigured && isSignedIn && user) {
      enterApp();
    }
  }, [profileHydrated, authLoaded, isSignedIn, user]);

  const finishSignUp = async (createdSessionId: string, trimmedName: string) => {
    await setActive!({ session: createdSessionId });
    const profile =
      profileFromClerkUser(clerk.user ?? {}, trimmedName) ?? {
        name: trimmedName,
        email: email.trim().toLowerCase(),
      };
    completeClerkSession(profile, "signup");
    enterApp();
  };

  const submitCode = async () => {
    if (authInProgress.current) return;
    setError("");
    if (!code.trim()) {
      setError(t("profileAuthVerificationCodeRequired"));
      return;
    }
    if (!signUpLoaded || !clerkSignUp) {
      setError(t("profileAuthClerkLoading"));
      return;
    }
    authInProgress.current = true;
    setBusy(true);
    try {
      const result = await clerkSignUp.attemptEmailAddressVerification({
        code: code.trim(),
      });
      if (result.status === "complete" && result.createdSessionId) {
        await finishSignUp(result.createdSessionId, name.trim());
        return;
      }
      setError(t("profileAuthClerkVerifyEmail"));
    } catch (e) {
      setError(clerkErrorMessage(e, t("profileAuthClerkFailed")));
    } finally {
      authInProgress.current = false;
      setBusy(false);
    }
  };

  const submitEmail = async () => {
    if (authInProgress.current) return;
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("profileAuthNameRequired"));
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      setError(t("profileAuthInvalidEmail"));
      return;
    }
    if (password.length < 8) {
      setError(t("profileAuthPasswordMinimum"));
      return;
    }

    if (!isClerkConfigured) {
      setError(t("profileAuthClerkRequiredForSignup"));
      return;
    }
    if (!authLoaded || !signUpLoaded || !clerkSignUp) {
      setError(t("profileAuthClerkLoading"));
      return;
    }

    authInProgress.current = true;
    setBusy(true);
    try {
      const parts = trimmedName.split(/\s+/);
      // Use the returned resource: the hook's object can be stale right after create().
      const created = await clerkSignUp.create({
        emailAddress: normalizedEmail,
        password,
        firstName: parts[0],
        lastName: parts.slice(1).join(" ") || undefined,
      });
      if (created.status === "complete" && created.createdSessionId) {
        await finishSignUp(created.createdSessionId, trimmedName);
        return;
      }
      if (created.unverifiedFields.includes("email_address")) {
        await created.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setCode("");
        setAwaitingCode(true);
        return;
      }
      setError(t("profileAuthClerkVerifyEmail"));
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
      screenTitle={t("profileAuthScreenSignup")}
      gradientButtonColors={AUTH_BTN_GRADIENT_SIGNUP}
      footer={
        <AuthSwitchLink
          prompt={t("profileAuthHaveAccount")}
          actionLabel={t("profileAuthScreenLogin")}
          onPress={() => router.push("/login")}
        />
      }
    >
      {error ? <AuthError message={error} /> : null}

      {isClerkConfigured ? (
        <GoogleClerkButton
          mode="signup"
          busy={busy}
          onBusyChange={setBusy}
          onError={setError}
          onSuccess={enterApp}
        />
      ) : null}

      {isClerkConfigured ? <AuthSocialDivider label={t("profileAuthOr")} /> : null}

      <AuthField
        label={t("profileAuthFullName")}
        icon="user"
        value={name}
        onChangeText={setName}
        placeholder={t("profileAuthYourName")}
        autoCapitalize="words"
      />
      <AuthField
        label={t("profileAuthEmail")}
        icon="mail"
        value={email}
        onChangeText={setEmail}
        placeholder={t("profileAuthEmailPlaceholder")}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthField
        label={t("profileAuthPassword")}
        icon="lock"
        value={password}
        onChangeText={setPassword}
        placeholder={t("profileAuthCreatePassword")}
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

      {awaitingCode ? (
        <AuthField
          label={t("profileAuthVerificationCode")}
          icon="shield"
          value={code}
          onChangeText={setCode}
          placeholder={t("profileAuthVerificationCodeHint")}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
      ) : null}

      <AuthGradientButton
        label={
          busy
            ? t("profileAuthWaiting")
            : awaitingCode
              ? t("profileAuthVerifyEmailCta")
              : t("profileAuthScreenSignup")
        }
        busy={busy}
        onPress={() => void (awaitingCode ? submitCode() : submitEmail())}
        gradientColors={AUTH_BTN_GRADIENT_SIGNUP}
      />
    </SoftAuthLayout>
  );

  if (isClerkConfigured) {
    return <ClerkAuthReady>{form}</ClerkAuthReady>;
  }

  return form;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});