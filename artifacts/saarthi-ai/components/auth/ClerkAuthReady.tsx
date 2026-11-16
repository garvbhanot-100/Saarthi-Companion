import { useAuth } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AUTH_BG_GRADIENT } from "@/components/auth/SimpleAuthLayout";
import { useLanguage } from "@/context/LanguagesContext";

type Props = {
  children: React.ReactNode;
  /** Shown even while Clerk is still loading (e.g. guest entry). */
  earlyAccess?: React.ReactNode;
};

/** Full-screen wait until Clerk `useAuth()` is loaded — avoids dead buttons on login. */
export function ClerkAuthReady({ children, earlyAccess }: Props) {
  const { t } = useLanguage();
  const { isLoaded } = useAuth();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setSlow(false);
      return undefined;
    }
    const timer = setTimeout(() => setSlow(true), 12_000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <LinearGradient colors={[...AUTH_BG_GRADIENT]} style={styles.root}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.label}>{t("profileAuthClerkLoading")}</Text>
        {slow ? (
          <Text style={styles.hint}>
            Internet / Wi‑Fi check karein, phir Expo reload (`r`) try karein.
          </Text>
        ) : null}
        {earlyAccess ? <View style={styles.early}>{earlyAccess}</View> : null}
      </LinearGradient>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 14,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.88)",
    textAlign: "center",
    lineHeight: 18,
  },
  early: {
    marginTop: 8,
    width: "100%",
    maxWidth: 320,
  },
});