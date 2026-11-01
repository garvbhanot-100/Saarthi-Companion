import { Feather } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
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
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();
export default function Auth() {
  const redirectUri = makeRedirectUri({
    scheme: "saarthi-ai",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "224635012304-6qqvn4kcmq1gonm25tnr20uqi5hs93b6.apps.googleusercontent.com",
  });

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type !== "success") return;

      try {
        const accessToken = response.authentication?.accessToken;

        if (!accessToken) {
          setError(t("profileAuthGoogleTokenMissing"));
          return;
        }

        const userResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const user = await userResponse.json();

        if (!user.email) {
          setError(t("profileAuthGoogleEmailMissing"));
          return;
        }

        setBusy(true);

        await signUp({
          name: user.name || t("profileAuthDefaultName"),
          email: user.email.trim().toLowerCase(),
        });

        setBusy(false);

        router.replace("/profile");
      } catch (error) {
        console.error("Google login error:", error);
        setBusy(false);
        setError(t("profileAuthGoogleLoginFailed"));
      }
    };

    handleGoogleLogin();
  }, [response]);
  const c = useColors(),
    i = useSafeAreaInsets(),
    { t, hydrated } = useLanguage(),
    { signUp, logIn } = useSaarthi(),
    [mode, setMode] = useState<"login" | "signup">("signup"),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async () => {
    setError("");
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) return setError(t("profileAuthInvalidEmail"));
    if (mode === "signup") {
      if (!name.trim()) return setError(t("profileAuthNameRequired"));
      if (password.length < 8)
        return setError(t("profileAuthPasswordMinimum"));
      if (password !== confirm)
        return setError(t("profileAuthPasswordMismatch"));
      setBusy(true);
      await signUp({ name, email: e });
      setBusy(false);
      router.replace("/profile");
    } else {
      if (!password) return setError(t("profileAuthPasswordRequired"));
      setBusy(true);
      const ok = await logIn(e);
      setBusy(false);
      if (!ok)
        return setError(
          t("profileAuthLocalProfileMissing"),
        );
      router.replace("/profile");
    }
  };
  if (!hydrated) return null;
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
          onPress={() => router.back()}
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
      {error && (
        <View style={[s.errorBox, { backgroundColor: c.warningSoft }]}>
          <Feather name="alert-circle" size={15} color={c.accent} />
          <Text style={[s.errorText, { color: c.foreground }]}>{error}</Text>
        </View>
      )}
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
      <View style={s.or}>
        <View style={[s.line, { backgroundColor: c.border }]} />
        <Text style={[s.orText, { color: c.mutedForeground }]}>
          {t("profileAuthOr")}
        </Text>
        <View style={[s.line, { backgroundColor: c.border }]} />
      </View>
      <GhostButton
        title={t("profileAuthContinueGoogle")}
        icon="globe"
        onPress={() => {
          if (request) {
            promptAsync();
          }
        }}
      />
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
