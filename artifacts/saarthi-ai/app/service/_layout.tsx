import { Stack } from "expo-router";
import React from "react";

import { AuthGate } from "@/components/AuthGate";

export default function ServiceLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGate>
  );
}
