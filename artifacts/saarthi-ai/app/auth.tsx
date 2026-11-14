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
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoogleClerkButton } from "@/components/GoogleClerkButton";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { MotionPressable } from "@/components/Motion";
import { isClerkConfigured } from "@/constants/clerk";
import { useLanguage } from "@/context/LanguagesContext";
import { APP_DISPLAY_NAME } from "@/constants/brand";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";

WebBrowser.maybeCompleteAuthSession();

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const enterApp = () => {
  router.replace("/(tabs)");
};

function RiseIn({
  children,
  delay = 0,
  style,
}: React.PropsWithChildren<{ delay?: number; style?: object }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

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
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
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

function AuthBenefitRow({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
}) {
  const c = useColors();
  return (
    <View style={benefitStyles.row}>
      <View style={[benefitStyles.iconWrap, { backgroundColor: c.primarySoft }]}>
        <Feather name={icon} size={16} color={c.primary} />
      </View>
      <Text style={[benefitStyles.label, { color: c.foreground }]}>{label}</Text>
    </View>
  );
}

function AuthField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  trailing,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"];
  trailing?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View style={fieldStyles.wrap}>
      <Text style={[fieldStyles.label, { color: c.mutedForeground }]}>{label}</Text>
      <View
        style={[
          fieldStyles.box,
          { backgroundColor: c.background, borderColor: c.input },
        ]}
      >
        <Feather name={icon} size={18} color={c.mutedForeground} />
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.mutedForeground}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={[fieldStyles.input, { color: c.foreground }]}
        />
        {trailing}
      </View>
    </View>
  );
}

export default function Auth() {
  const c = useColors();
  const i = useSafeAreaInsets();
  const { t, hydrated: languageHydrated } = useLanguage();
  const { hydrated: profileHydrated, user, logIn } = useSaarthi();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const authInProgress = useRef(false);
  const switchAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    Animated.spring(switchAnim, {
      toValue: mode === "login" ? 0 : 1,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [mode, switchAnim]);

  const setAuthMode = (next: "login" | "signup") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(next);
    setError("");
  };

  const submit = async () => {
    if (authInProgress.current) return;
    setError("");
    const formMode = mode;
    if (formMode === "signup") {
      setError(t("profileAuthSignupGoogleOnly"));
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      setError(t("profileAuthInvalidEmail"));
      return;
    }
    if (!password) {
      setError(t("profileAuthPasswordRequired"));
      return;
    }

    authInProgress.current = true;
    setBusy(true);
    try {
      const loggedIn = await logIn(normalizedEmail, password);
      if (!loggedIn) {
        setError(t("profileAuthLocalProfileMissing"));
        return;
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

  const indicatorTranslate = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 4 + (stylesMetrics.switchHalfWidth || 0)],
  });

  return (
    <View style={[s.root, { backgroundColor: c.background }]}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: i.bottom + 32 }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#1e3a8a", c.indigo, c.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: i.top + 16 }]}
        >
          <View style={s.orbA} />
          <View style={s.orbB} />

          <RiseIn>
            <View style={s.brandGlass}>
              <Image
                source={require("../assets/images/images-2/Saarthi-AI Images.jpeg")}
                style={s.brandMark}
                resizeMode="cover"
              />
              <View style={s.brandCopy}>
                <Text style={s.brandWord}>{APP_DISPLAY_NAME}</Text>
                <Text style={s.brandTagline}>{t("profileAuthWelcome")}</Text>
              </View>
            </View>
          </RiseIn>

          <RiseIn delay={60}>
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

          {mode === "signup" ? (
            <RiseIn delay={120} style={s.benefitStrip}>
              <AuthBenefitRow
                icon="bookmark"
                label={t("profileBenefitSaved")}
              />
              <AuthBenefitRow
                icon="message-circle"
                label={t("profileBenefitChats")}
              />
              <AuthBenefitRow
                icon="globe"
                label={t("profileBenefitLanguage")}
              />
            </RiseIn>
          ) : null}
        </LinearGradient>

        <RiseIn delay={160} style={s.sheetWrap}>
          <View
            style={[
              s.sheet,
              {
                backgroundColor: c.card,
                borderColor: c.border,
                shadowColor: c.foreground,
              },
            ]}
          >
            <View style={[s.switcher, { backgroundColor: c.muted }]}>
              <Animated.View
                pointerEvents="none"
                style={[
                  s.switchIndicator,
                  {
                    backgroundColor: c.card,
                    borderColor: c.border,
                    transform: [{ translateX: indicatorTranslate }],
                    width: stylesMetrics.switchHalfWidth,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: mode === "login" }}
                accessibilityLabel={t("profileAuthLogin")}
                onPress={() => setAuthMode("login")}
                style={s.switchItem}
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
                accessibilityState={{ selected: mode === "signup" }}
                accessibilityLabel={t("profileAuthCreateAccount")}
                onPress={() => setAuthMode("signup")}
                style={s.switchItem}
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

            {error ? (
              <View style={[s.errorBox, { backgroundColor: c.warningSoft }]}>
                <Feather name="alert-circle" size={16} color={c.accent} />
                <Text style={[s.errorText, { color: c.foreground }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {mode === "signup" ? (
              <View style={s.signupBody}>
                {isClerkConfigured ? (
                  <>
                    <GoogleClerkButton
                      mode="signup"
                      busy={busy}
                      onBusyChange={setBusy}
                      onError={setError}
                      onSuccess={enterApp}
                      prominent
                    />
                    <Text
                      style={[s.googleHint, { color: c.mutedForeground }]}
                    >
                      {t("profileAuthSignupGoogleOnly")}
                    </Text>
                  </>
                ) : (
                  <View
                    style={[s.clerkWarn, { backgroundColor: c.warningSoft }]}
                  >
                    <Feather name="info" size={16} color={c.accent} />
                    <Text style={[s.clerkWarnText, { color: c.foreground }]}>
                      {t("profileAuthClerkRequiredForSignup")}
                    </Text>
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setAuthMode("login")}
                  style={s.altModeLink}
                >
                  <Text style={[s.altModeText, { color: c.mutedForeground }]}>
                    {t("profileAuthLoginDescription")}{" "}
                    <Text style={{ color: c.primary, fontFamily: "Inter_700Bold" }}>
                      {t("profileAuthLogin")}
                    </Text>
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.loginBody}>
                {isClerkConfigured ? (
                  <>
                    <GoogleClerkButton
                      mode="login"
                      busy={busy}
                      onBusyChange={setBusy}
                      onError={setError}
                      onSuccess={enterApp}
                      prominent
                    />
                    <View style={s.or}>
                      <View style={[s.line, { backgroundColor: c.border }]} />
                      <Text style={[s.orText, { color: c.mutedForeground }]}>
                        {t("profileAuthOr")}
                      </Text>
                      <View style={[s.line, { backgroundColor: c.border }]} />
                    </View>
                    <Text style={[s.sectionLabel, { color: c.mutedForeground }]}>
                      {t("profileAuthEmailSignIn")}
                    </Text>
                  </>
                ) : null}

                <View
                  style={[
                    s.formCard,
                    { backgroundColor: c.muted, borderColor: c.border },
                  ]}
                >
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
                        <Feather
                          name={showPassword ? "eye-off" : "eye"}
                          size={18}
                          color={c.mutedForeground}
                        />
                      </Pressable>
                    }
                  />
                </View>

                <MotionPressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    busy ? t("profileAuthWaiting") : t("profileAuthLogin")
                  }
                  accessibilityState={{ disabled: busy }}
                  disabled={busy}
                  onPress={submit}
                  style={({ pressed }) => [
                    s.primaryCta,
                    {
                      backgroundColor: c.primary,
                      opacity: busy ? 0.7 : pressed ? 0.92 : 1,
                    },
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color={c.primaryForeground} />
                  ) : (
                    <>
                      <Text
                        style={[s.primaryCtaText, { color: c.primaryForeground }]}
                      >
                        {t("profileAuthLogin")}
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={18}
                        color={c.primaryForeground}
                      />
                    </>
                  )}
                </MotionPressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("profileAuthForgotPassword")}
                  onPress={() =>
                    Alert.alert(
                      t("profileAuthPasswordResetTitle"),
                      t("profileAuthPasswordResetDescription"),
                    )
                  }
                  style={s.footerLink}
                >
                  <Text style={[s.forgot, { color: c.primary }]}>
                    {t("profileAuthForgotPassword")}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </RiseIn>

        <Text style={[s.disclosure, { color: c.mutedForeground }]}>
          {t("profileAuthPreviewDisclosure")}
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const stylesMetrics = {
  switchHalfWidth: 0,
};

const SWITCHER_INNER = 4;

const benefitStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    lineHeight: 15,
  },
});

const fieldStyles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.3,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  box: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    paddingVertical: 12,
  },
});

const s = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    overflow: "hidden",
  },
  orbA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -60,
    right: -70,
  },
  orbB: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: 20,
    left: -40,
  },
  brandGlass: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignSelf: "flex-start",
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  brandCopy: {
    gap: 2,
    paddingRight: 8,
  },
  brandWord: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#fff",
    letterSpacing: -0.4,
  },
  brandTagline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.72)",
  },
  heroTitle: {
    marginTop: 22,
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: "#fff",
  },
  heroCaption: {
    marginTop: 8,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.84)",
    maxWidth: 340,
  },
  benefitStrip: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sheetWrap: {
    marginTop: -28,
    paddingHorizontal: 16,
  },
  sheet: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  switcher: {
    minHeight: 52,
    borderRadius: 16,
    padding: SWITCHER_INNER,
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  switchIndicator: {
    position: "absolute",
    top: SWITCHER_INNER,
    bottom: SWITCHER_INNER,
    left: 0,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  switchItem: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    zIndex: 1,
  },
  switchText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  errorBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  signupBody: {
    gap: 4,
  },
  loginBody: {
    gap: 2,
  },
  googleHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  clerkWarn: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  clerkWarnText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 17,
  },
  altModeLink: {
    marginTop: 18,
    paddingVertical: 6,
  },
  altModeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 2,
    marginBottom: 16,
  },
  or: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18,
  },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  orText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  primaryCta: {
    minHeight: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryCtaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  footerLink: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  forgot: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textAlign: "center",
  },
  disclosure: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 18,
    marginHorizontal: 28,
  },
});

// Estimate half width for segment indicator (sheet width ~ screen - 32 - 40 padding)
// Updated on layout via onLayout on switcher - we'll use percentage instead
Object.defineProperty(stylesMetrics, "switchHalfWidth", {
  get() {
    const { Dimensions } = require("react-native");
    const sheetWidth = Dimensions.get("window").width - 32 - 40;
    return (sheetWidth - SWITCHER_INNER * 2) / 2;
  },
});