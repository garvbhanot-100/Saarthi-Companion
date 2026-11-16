import { useAuth } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { AUTH_BG_GRADIENT } from "@/components/auth/SimpleAuthLayout";
import { isClerkConfigured } from "@/constants/clerk";
import { useSaarthi } from "@/context/SaarthiContext";

function BootSpinner() {
  return (
    <LinearGradient colors={[...AUTH_BG_GRADIENT]} style={styles.boot}>
      <ActivityIndicator color="#fff" size="large" />
    </LinearGradient>
  );
}

function ClerkEntry() {
  const { hydrated, isGuest } = useSaarthi();
  const { isLoaded, isSignedIn } = useAuth();

  if (!hydrated || !isLoaded) {
    return <BootSpinner />;
  }

  return <Redirect href={isSignedIn || isGuest ? "/(tabs)" : "/login"} />;
}

function LocalEntry() {
  const { hydrated, user } = useSaarthi();

  if (!hydrated) {
    return <BootSpinner />;
  }

  return <Redirect href={user ? "/(tabs)" : "/login"} />;
}

/** First route: login unless Clerk (or local) session already exists. */
export default function Index() {
  return isClerkConfigured ? <ClerkEntry /> : <LocalEntry />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});