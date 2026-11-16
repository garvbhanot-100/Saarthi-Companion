import { Feather } from "@expo/vector-icons";
import {
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useSignUp,
} from "@clerk/expo";
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
  const authInProgress = useRef(false);

  useOAuthBrowserWarmup();

  useEffect(() => {
    if (!profileHydrated || !authLoaded) return;
    if (isClerkConfigured && isSignedIn && user) {
      enterApp();
    }
  }, [profileHydrated, authLoaded, isSignedIn, user]);

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
      await clerkSignUp.create({
        emailAddress: normalizedEmail,
        password,
        firstName: parts[0],
        lastName: parts.slice(1).join(" ") || undefined,
      });
      if (
        clerkSignUp.status === "complete" &&
        clerkSignUp.createdSessionId
      ) {
        await setActive({ session: clerkSignUp.createdSessionId });
        const profile =
          profileFromClerkUser(clerk.user ?? {}, trimmedName) ?? {
            name: trimmedName,
            email: normalizedEmail,
          };
        completeClerkSession(profile, "signup");
        enterApp();
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

      <AuthGradientButton
        label={busy ? t("profileAuthWaiting") : t("profileAuthScreenSignup")}
        busy={busy}
        onPress={() => void submitEmail()}
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