import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoogleClerkButton } from "@/components/GoogleClerkButton";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { MotionPressable } from "@/components/Motion";
import { AppInput } from "@/components/UI";
import { isClerkConfigured } from "@/constants/clerk";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";

// Required so the browser auth session can return to the Expo app.
WebBrowser.maybeCompleteAuthSession();

const enterApp = () => {
  router.replace("/(tabs)");
};

function RiseIn({
  children,
  delay = 0,
  style,
}: React.PropsWithChildren<{ delay?: number; style?: object }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        opacity.setValue(1);
        translateY.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 380,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
    return () => {
      cancelled = true;
    };
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

export default function Auth() {
  const c = useColors();
  const i = useSafeAreaInsets();
  const { t, hydrated: languageHydrated } = useLanguage();
  const {
    hydrated: profileHydrated,
    user,
    signUp,
    logIn,
  } = useSaarthi();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const authInProgress = useRef(false);

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    if (profileHydrated && user) {
      enterApp();
    }
  }, [profileHydrated, user]);

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
      enterApp();
    } catch (submitError) {
      console.error("Could not save the local profile:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("profileAuthGoogleLoginFailed"),
      );
    } finally {
      authInProgress.current = false;
      setBusy(false);
    }
  };

  if (!languageHydrated || !profileHydrated) {
    return (
      <View style={[s.loading, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: c.background }]}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: i.bottom + 28 }}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[c.indigo, c.primary, c.background]}
          locations={[0, 0.55, 1]}
          style={[s.hero, { paddingTop: i.top + 10 }]}
        >
          <View style={s.heroGlow} />

          <RiseIn>
            <View style={s.topBar}>
              <View style={s.brandRow}>
                <Image
                  source={require("../assets/images/images-2/Saarthi-AI Images.jpeg")}
                  style={s.brandMark}
                  resizeMode="cover"
                />
                <Text style={s.brandWord}>
                  Saarthi <Text style={s.brandAccent}>AI</Text>
                </Text>
              </View>

            </View>
          </RiseIn>

          <RiseIn delay={80}>
            <Text style={s.eyebrow}>
              {mode === "signup"
                ? t("profileAuthWelcome")
                : t("profileAuthWelcomeBack")}
            </Text>
            <Text style={s.heroTitle}>
              {mode === "signup"
                ? t("profileAuthSignupTitle")
                : t("profileAuthLoginTitle")}
            </Text>
            <Text style={s.heroCaption}>
              {mode === "signup"
                ? t("profileAuthSignupDescription")
                : t("profileAuthLoginDescription")}
            </Text>
          </RiseIn>
        </LinearGradient>

        <RiseIn delay={140} style={s.sheetWrap}>
          <View
            style={[
              s.sheet,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
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
                  mode === "login" && {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    s.switchText,
                    {
                      color:
                        mode === "login" ? c.foreground : c.mutedForeground,
                    },
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
                  mode === "signup" && {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    s.switchText,
                    {
                      color:
                        mode === "signup" ? c.foreground : c.mutedForeground,
                    },
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
                <Text style={[s.errorText, { color: c.foreground }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={
                busy
                  ? t("profileAuthWaiting")
                  : mode === "signup"
                    ? t("profileAuthCreateLocalProfile")
                    : t("profileAuthLogin")
              }
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={submit}
              style={({ pressed }) => [
                s.primaryCta,
                {
                  backgroundColor: c.primary,
                  opacity: busy ? 0.7 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={[s.primaryCtaText, { color: c.primaryForeground }]}>
                {busy
                  ? t("profileAuthWaiting")
                  : mode === "signup"
                    ? t("profileAuthCreateLocalProfile")
                    : t("profileAuthLogin")}
              </Text>
              {!busy && (
                <Feather
                  name="arrow-right"
                  size={17}
                  color={c.primaryForeground}
                />
              )}
            </MotionPressable>

            {isClerkConfigured ? (
              <>
                <View style={s.or}>
                  <View style={[s.line, { backgroundColor: c.border }]} />
                  <Text style={[s.orText, { color: c.mutedForeground }]}>
                    {t("profileAuthOr")}
                  </Text>
                  <View style={[s.line, { backgroundColor: c.border }]} />
                </View>

                <GoogleClerkButton
                  mode={mode}
                  busy={busy}
                  onBusyChange={setBusy}
                  onError={setError}
                  onSuccess={enterApp}
                />
              </>
            ) : null}

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
              style={s.footerLink}
            >
              <Text style={[s.forgot, { color: c.primary }]}>
                {mode === "login"
                  ? t("profileAuthForgotPassword")
                  : t("profileAuthSecureAuthentication")}
              </Text>
            </Pressable>
          </View>
        </RiseIn>

        <Text style={[s.disclosure, { color: c.mutedForeground }]}>
          {t("profileAuthPreviewDisclosure")}
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 42,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -36,
    right: -40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  brandWord: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#fff",
    letterSpacing: -0.3,
  },
  brandAccent: {
    color: "rgba(255,255,255,0.72)",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  eyebrow: {
    marginTop: 28,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.75)",
  },
  heroTitle: {
    marginTop: 10,
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.7,
    color: "#fff",
  },
  heroCaption: {
    marginTop: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.8)",
    maxWidth: 340,
  },
  sheetWrap: {
    marginTop: -22,
    paddingHorizontal: 18,
  },
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  switcher: {
    minHeight: 48,
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    marginBottom: 18,
  },
  switchItem: {
    flex: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  errorBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  primaryCta: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryCtaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  or: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  line: { flex: 1, height: 1 },
  orText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.6,
  },
  googleBtn: {
    marginTop: 10,
    width: "100%",
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
    shadowColor: "#12213e",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  googleBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#1f1f1f",
    flexShrink: 1,
  },
  footerLink: {
    paddingTop: 14,
    paddingBottom: 2,
  },
  forgot: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    textAlign: "center",
  },
  disclosure: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 16,
    marginHorizontal: 28,
  },
});
