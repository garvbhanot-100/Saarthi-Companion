import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";

/**
 * Blocks dashboard tabs until a local Saarthi profile is signed in.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
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
    return <Redirect href="/auth" />;
  }

  return <>{children}</>;
}
