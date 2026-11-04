import React from "react";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";

import { AuthGate } from "@/components/AuthGate";
import { MotionProvider } from "@/components/Motion";
import { useLanguage } from "@/context/LanguagesContext";
import { useColors } from "@/hooks/useColors";

function Native() {
  const { t } = useLanguage();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>{t("home")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" />
        <Label>{t("search")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ask">
        <Icon sf={{ default: "bubble.left", selected: "bubble.left.fill" }} />
        <Label>{t("ask")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <Icon sf={{ default: "bookmark", selected: "bookmark.fill" }} />
        <Label>{t("saved")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>{t("profile")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function Classic() {
  const c = useColors();
  const { t } = useLanguage();
  const ios = Platform.OS === "ios";
  const web = Platform.OS === "web";
  const dark = useColorScheme() === "dark";

  const tab =
    (name: React.ComponentProps<typeof Feather>["name"]) =>
    ({ color }: { color: string }) =>
      ios ? (
        <SymbolView name={name as any} tintColor={color} size={22} />
      ) : (
        <Feather name={name} size={21} color={color} />
      );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: ios ? "transparent" : c.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: c.border,
          elevation: web ? 0 : 8,
          ...(web ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          ios ? (
            <BlurView
              intensity={100}
              tint={dark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : web ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: c.background },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("home"), tabBarIcon: tab("home") }}
      />

      <Tabs.Screen
        name="search"
        options={{ title: t("search"), tabBarIcon: tab("search") }}
      />

      <Tabs.Screen
        name="ask"
        options={{ title: t("ask"), tabBarIcon: tab("message-circle") }}
      />

      <Tabs.Screen
        name="saved"
        options={{ title: t("saved"), tabBarIcon: tab("bookmark") }}
      />

      <Tabs.Screen
        name="profile"
        options={{ title: t("profile"), tabBarIcon: tab("user") }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <AuthGate>
      <MotionProvider>
        {isLiquidGlassAvailable() ? <Native /> : <Classic />}
      </MotionProvider>
    </AuthGate>
  );
}
