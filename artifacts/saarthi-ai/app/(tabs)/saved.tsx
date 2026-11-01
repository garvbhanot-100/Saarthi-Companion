import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { services } from "@/data/services";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";
import { PrimaryButton } from "@/components/UI";
import { FadeInView, MotionPressable } from "@/components/Motion";
import { useLanguage } from "@/context/LanguagesContext";

export default function Saved() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { savedServiceIds, toggleSaved } = useSaarthi();

  const saved = services.filter((service) =>
    savedServiceIds.includes(service.id),
  );

  return (
    <FadeInView style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
          flexGrow: saved.length === 0 ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: c.primary }]}>
              {t("savedEyebrow")}
            </Text>

            <Text style={[styles.title, { color: c.foreground }]}>
              {t("saved")}
            </Text>

            <Text style={[styles.caption, { color: c.mutedForeground }]}>
              {t("savedDescription")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MotionPressable
            onPress={() =>
              router.push({
                pathname: "/service/[id]",
                params: { id: item.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={item.name}
            style={[
              styles.card,
              {
                backgroundColor: c.card,
                borderColor: c.border,
              },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: c.primarySoft }]}>
              <Feather name="bookmark" size={18} color={c.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: c.foreground }]}>
                {item.name}
              </Text>

              <Text style={[styles.cardSub, { color: c.mutedForeground }]}>
                {item.source}
              </Text>
            </View>

            <MotionPressable
              onPress={(event) => {
                event.stopPropagation();
                toggleSaved(item.id);
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t("removeSavedService")}
            >
              <Feather name="x" size={18} color={c.mutedForeground} />
            </MotionPressable>
          </MotionPressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[styles.emptyIcon, { backgroundColor: c.primarySoft }]}
            >
              <Feather name="bookmark" size={24} color={c.primary} />
            </View>

            <Text style={[styles.emptyTitle, { color: c.foreground }]}>
              {t("savedEmptyTitle")}
            </Text>

            <Text style={[styles.emptyBody, { color: c.mutedForeground }]}>
              {t("savedEmptyDescription")}
            </Text>

            <PrimaryButton
              title={t("browseServices")}
              icon="search"
              onPress={() => router.push("/search")}
              small
            />
          </View>
        }
      />
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    letterSpacing: -0.5,
    marginTop: 7,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 12,
    shadowColor: "#17304f",
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  cardSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 72,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    marginTop: 16,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 18,
    textAlign: "center",
  },
});
