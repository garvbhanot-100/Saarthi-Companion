import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { isClerkConfigured } from "@/constants/clerk";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";

function ClerkTabGate({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const { isLoaded, isSignedIn } = useAuth();
  const { hydrated, isGuest } = useSaarthi();

  if (!isLoaded) {
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

  if (!hydrated) {
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

  if (!isSignedIn && !isGuest) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

function LocalTabGate({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const { hydrated, user } = useSaarthi();

  if (!hydrated) {
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

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured) {
    return <ClerkTabGate>{children}</ClerkTabGate>;
  }
  return <LocalTabGate>{children}</LocalTabGate>;
}