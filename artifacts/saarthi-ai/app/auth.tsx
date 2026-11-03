import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import {
  AppInput,
  GhostButton,
  LogoMark,
  PrimaryButton,
} from "@/components/UI";
import { useSaarthi } from "@/context/SaarthiContext";
import { useLanguage } from "@/context/LanguagesContext";
import { useColors } from "@/hooks/useColors";

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

type GoogleSignInModule = typeof import("react-native-nitro-google-signin");

// Google sign-in is a native (Nitro) module. It is missing in Expo Go, where
// importing it throws, so load it lazily and hide the button when unavailable.
let googleSignIn: GoogleSignInModule | null = null;
if (Platform.OS === "android" && GOOGLE_WEB_CLIENT_ID) {
  try {
    googleSignIn = require("react-native-nitro-google-signin") as GoogleSignInModule;
  } catch {
    console.warn("Google sign-in is unavailable in this build (for example Expo Go).");
  }
}

// Return to the screen that opened the auth modal (the Profile tab).
const closeAuth = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)/profile");
  }
};

export default function Auth() {
  const c = useColors();
  const i = useSafeAreaInsets();
  const { t, hydrated: languageHydrated } = useLanguage();
  const { hydrated: profileHydrated, signUp, logIn } = useSaarthi();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const authInProgress = useRef(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    if (!googleSignIn || !GOOGLE_WEB_CLIENT_ID) return;
    try {
      googleSignIn.GoogleOneTapSignIn.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        autoSelectOnSignIn: false,
        offlineAccess: false,
      });
      setGoogleReady(true);
    } catch (error) {
      console.error("Could not configure Google sign-in:", error);
    }
  }, []);

  const submit = async () => {
    if (authInProgress.current) return;
    setError("");
    const formMode = mode;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      setError(t("profileAuthInvalidEmail"));
      return;
    }
    if (formMode === "signup") {
      if (!name.trim()) {
        setError(t("profileAuthNameRequired"));
        return;
      }
      if (password.length < 8) {
        setError(t("profileAuthPasswordMinimum"));
        return;
      }
      if (password !== confirm) {
        setError(t("profileAuthPasswordMismatch"));
        return;
      }
    } else if (!password) {
      setError(t("profileAuthPasswordRequired"));
      return;
    }

    authInProgress.current = true;
    setBusy(true);
    try {
      if (formMode === "signup") {
        await signUp({ name, email: normalizedEmail }, password);
      } else {
        const loggedIn = await logIn(normalizedEmail, password);
        if (!loggedIn) {
          setError(t("profileAuthLocalProfileMissing"));
          return;
        }
      }
      closeAuth();
    } catch (error) {
      console.error("Could not save the local profile:", error);
      setError(
        error instanceof Error
          ? error.message
          : t("profileAuthGoogleLoginFailed"),
      );
    } finally {
      authInProgress.current = false;
      setBusy(false);
    }
  };

  const continueWithGoogle = async () => {
    if (authInProgress.current) return;
    if (!googleSignIn || !googleReady) {
      setError(t("profileAuthGoogleLoginFailed"));
      return;
    }
    const {
      GoogleOneTapSignIn,
      isCancelledResponse,
      isErrorWithCode,
      isNoSavedCredentialFoundResponse,
      isSuccessResponse,
      statusCodes,
    } = googleSignIn;

    const authMode = mode;
    authInProgress.current = true;
    setError("");
    setBusy(true);
    try {
      await GoogleOneTapSignIn.checkPlayServices();
      let result = await GoogleOneTapSignIn.signIn();
      if (isNoSavedCredentialFoundResponse(result)) {
        result = await GoogleOneTapSignIn.createAccount();
      }
      if (isNoSavedCredentialFoundResponse(result)) {
        result = await GoogleOneTapSignIn.presentExplicitSignIn();
      }
      if (isCancelledResponse(result)) return;
      if (!isSuccessResponse(result)) {
        throw new Error("Google did not return an authenticated account");
      }

      const { user, idToken } = result.data;
      if (!idToken) throw new Error("Google did not return an ID token");
      if (!user.email?.trim()) {
        setError(t("profileAuthGoogleEmailMissing"));
        return;
      }
      const profile = {
        name: user.name?.trim() || t("profileAuthDefaultName"),
        email: user.email.trim().toLowerCase(),
      };
      if (authMode === "login") {
        await logIn(profile.email, undefined, profile);
      } else {
        await signUp(profile);
      }
      closeAuth();
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      console.error("Google sign-in failed:", error);
      setError(t("profileAuthGoogleLoginFailed"));
    } finally {
      authInProgress.current = false;
      setBusy(false);
    }
  };

  if (!languageHydrated || !profileHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.background,
        }}
      >
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: i.top + 17,
        paddingBottom: i.bottom + 30,
        paddingHorizontal: 22,
      }}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.top}>
        <LogoMark />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profileAuthClose")}
          onPress={closeAuth}
        >
          <Feather name="x" size={22} color={c.mutedForeground} />
        </Pressable>
      </View>
      <View style={s.intro}>
        <Text style={[s.eyebrow, { color: c.primary }]}>
          {mode === "signup"
            ? t("profileAuthWelcome")
            : t("profileAuthWelcomeBack")}
        </Text>
        <Text style={[s.title, { color: c.foreground }]}>
          {mode === "signup"
            ? t("profileAuthSignupTitle")
            : t("profileAuthLoginTitle")}
        </Text>
        <Text style={[s.caption, { color: c.mutedForeground }]}>
          {mode === "signup"
            ? t("profileAuthSignupDescription")
            : t("profileAuthLoginDescription")}
        </Text>
      </View>
      <View style={[s.switcher, { backgroundColor: c.muted }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profileAuthLogin")}
          onPress={() => {
            setMode("login");
            setError("");
          }}
          style={[
            s.switchItem,
            mode === "login" && { backgroundColor: c.card },
          ]}
        >
          <Text
            style={[
              s.switchText,
              { color: mode === "login" ? c.foreground : c.mutedForeground },
            ]}
          >
            {t("profileAuthLogin")}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profileAuthCreateAccount")}
          onPress={() => {
            setMode("signup");
            setError("");
          }}
          style={[
            s.switchItem,
            mode === "signup" && { backgroundColor: c.card },
          ]}
        >
          <Text
            style={[
              s.switchText,
              { color: mode === "signup" ? c.foreground : c.mutedForeground },
            ]}
          >
            {t("profileAuthCreateAccount")}
          </Text>
        </Pressable>
      </View>
      {mode === "signup" && (
        <AppInput
          label={t("profileAuthFullName")}
          accessibilityLabel={t("profileAuthFullName")}
          value={name}
          onChangeText={setName}
          placeholder={t("profileAuthYourName")}
        />
      )}
      <AppInput
        label={t("profileAuthEmail")}
        accessibilityLabel={t("profileAuthEmail")}
        value={email}
        onChangeText={setEmail}
        placeholder={t("profileAuthEmailPlaceholder")}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AppInput
        label={t("profileAuthPassword")}
        accessibilityLabel={t("profileAuthPassword")}
        value={password}
        onChangeText={setPassword}
        placeholder={t("profileAuthPasswordPlaceholder")}
        secureTextEntry
      />
      {mode === "signup" && (
        <AppInput
          label={t("profileAuthConfirmPassword")}
          accessibilityLabel={t("profileAuthConfirmPassword")}
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t("profileAuthReenterPassword")}
          secureTextEntry
        />
      )}
      {error ? (
        <View style={[s.errorBox, { backgroundColor: c.warningSoft }]}>
          <Feather name="alert-circle" size={15} color={c.accent} />
          <Text style={[s.errorText, { color: c.foreground }]}>{error}</Text>
        </View>
      ) : null}
      <PrimaryButton
        title={
          busy
            ? t("profileAuthWaiting")
            : mode === "signup"
              ? t("profileAuthCreateLocalProfile")
              : t("profileAuthLogin")
        }
        icon="arrow-right"
        onPress={submit}
        disabled={busy}
      />
      {googleReady && (
        <>
          <View style={s.or}>
            <View style={[s.line, { backgroundColor: c.border }]} />
            <Text style={[s.orText, { color: c.mutedForeground }]}>
              {t("profileAuthOr")}
            </Text>
            <View style={[s.line, { backgroundColor: c.border }]} />
          </View>
          <GhostButton
            title={
              busy ? t("profileAuthWaiting") : t("profileAuthContinueGoogle")
            }
            icon="globe"
            onPress={() => void continueWithGoogle()}
          />
        </>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          mode === "login"
            ? t("profileAuthForgotPassword")
            : t("profileAuthSecureAuthentication")
        }
        onPress={() =>
          Alert.alert(
            t("profileAuthPasswordResetTitle"),
            t("profileAuthPasswordResetDescription"),
          )
        }
      >
        <Text style={[s.forgot, { color: c.primary }]}>
          {mode === "login"
            ? t("profileAuthForgotPassword")
            : t("profileAuthSecureAuthentication")}
        </Text>
      </Pressable>
      <Text style={[s.disclosure, { color: c.mutedForeground }]}>
        {t("profileAuthPreviewDisclosure")}
      </Text>
    </KeyboardAwareScrollViewCompat>
  );
}

const s = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  intro: { marginTop: 35, marginBottom: 24 },
  eyebrow: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    lineHeight: 36,
    marginTop: 8,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  switcher: {
    minHeight: 45,
    borderRadius: 13,
    padding: 4,
    flexDirection: "row",
    marginBottom: 23,
  },
  switchItem: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  errorBox: {
    flexDirection: "row",
    gap: 8,
    padding: 11,
    borderRadius: 13,
    marginBottom: 13,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  or: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18,
  },
  line: { flex: 1, height: 1 },
  orText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  forgot: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 16,
  },
  disclosure: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 12,
  },
});
