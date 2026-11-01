import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { services } from "@/data/services";
import { serviceImages } from "@/data/serviceImages";
import {
  getLocalizedService,
  hasLocalizedServiceField,
} from "@/data/serviceTransalations";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";
import { SectionHeading } from "@/components/UI";
import { FadeInView, MotionPressable } from "@/components/Motion";
import { useLanguage } from "@/context/LanguagesContext";

const suggestions = [
  { label: "scholarships", key: "suggestionScholarships" },
  { label: "Aadhaar", key: "suggestionAadhaar" },
  { label: "PAN card", key: "suggestionPan" },
  { label: "pension", key: "suggestionPension" },
] as const;

export default function Search() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const [q, setQ] = useState("");
  const { savedServiceIds, toggleSaved } = useSaarthi();

  const results = useMemo(() => {
    const query = q.trim().toLocaleLowerCase();

    const localizedServices = services.map((service) => {
      const localizedService = getLocalizedService(service.id, language);
      const name = hasLocalizedServiceField(service.id, language, "name")
        ? (localizedService?.name ?? service.name)
        : t("serviceTranslationUnavailable");
      const description = hasLocalizedServiceField(
        service.id,
        language,
        "description",
      )
        ? (localizedService?.description ?? service.description)
        : t("serviceTranslationUnavailable");
      const category = hasLocalizedServiceField(
        service.id,
        language,
        "category",
      )
        ? (localizedService?.category ?? service.category)
        : t("serviceTranslationUnavailable");

      return {
        ...service,
        name,
        description,
        category,
        searchText: [
          service.name,
          service.category,
          service.description,
          service.source,
          name,
          category,
          description,
        ]
          .join(" ")
          .toLocaleLowerCase(),
      };
    });

    if (!query) return localizedServices;

    return localizedServices.filter((service) =>
      service.searchText.includes(query),
    );
  }, [q, language, t]);

  return (
    <FadeInView style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        key={language}
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + 15,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
          flexGrow: results.length === 0 ? 1 : undefined,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={[styles.eyebrow, { color: c.primary }]}>
              {t("searchEyebrow")}
            </Text>

            <Text style={[styles.title, { color: c.foreground }]}>
              {t("searchPageTitle")}
            </Text>

            <Text style={[styles.caption, { color: c.mutedForeground }]}>
              {t("searchPageDescription")}
            </Text>

            <View
              style={[
                styles.searchBox,
                { backgroundColor: c.card, borderColor: c.input },
              ]}
            >
              <Feather name="search" size={19} color={c.mutedForeground} />

              <TextInput
                testID="search-input"
                value={q}
                onChangeText={setQ}
                placeholder={t("searchPlaceholder")}
                placeholderTextColor={c.mutedForeground}
                accessibilityLabel={t("searchPlaceholder")}
                returnKeyType="search"
                style={[styles.input, { color: c.foreground }]}
              />
              {q.length > 0 && (
                <MotionPressable
                  accessibilityRole="button"
                  accessibilityLabel={t("searchClear")}
                  hitSlop={10}
                  onPress={() => setQ("")}
                >
                  <Feather
                    name="x-circle"
                    size={18}
                    color={c.mutedForeground}
                  />
                </MotionPressable>
              )}
            </View>

            {!q && (
              <View style={styles.suggestions}>
                {suggestions.map((item) => (
                  <MotionPressable
                    key={item.key}
                    accessibilityRole="button"
                    onPress={() => setQ(item.label)}
                    style={[styles.chip, { backgroundColor: c.primarySoft }]}
                  >
                    <Text style={[styles.chipText, { color: c.primary }]}>
                      {t(item.key)}
                    </Text>
                  </MotionPressable>
                ))}
              </View>
            )}

            <SectionHeading
              eyebrow={
                q
                  ? t("searchResultCount").replace(
                      "{count}",
                      String(results.length),
                    )
                  : t("officialStartingPoints")
              }
              title={q ? t("searchResults") : t("browseServices")}
            />
          </View>
        }
        renderItem={({ item }) => {
          const isSaved = savedServiceIds.includes(item.id);

          return (
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={`${item.name}. ${t("searchViewDetails")}`}
              onPress={() =>
                router.push({
                  pathname: "/service/[id]",
                  params: { id: item.id },
                })
              }
              style={[
                styles.card,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: c.primarySoft },
                  ]}
                >
                  {item.id === "aadhaar-update" ? (
                    <Image
                      source={require("../../assets/images/images-2/aadhar-card.png")}
                      style={{ width: 34, height: 34 }}
                      resizeMode="contain"
                    />
                  ) : item.id === "pan-card" ? (
                    <Image
                      source={require("../../assets/images/images-2/Pan-Card.png")}
                      style={{ width: 34, height: 34 }}
                      resizeMode="contain"
                    />
                  ) : item.id === "pm-kisan" ? (
                    <Image
                      source={require("../../assets/images/images-2/pm-kisan.png")}
                      style={{ width: 34, height: 34 }}
                      resizeMode="contain"
                    />
                  ) : serviceImages[item.id] ? (
                    <Image
                      source={serviceImages[item.id]}
                      style={{ width: 34, height: 34 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Feather name="shield" size={18} color={c.primary} />
                  )}
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.titleLine}>
                    <Text style={[styles.cardTitle, { color: c.foreground }]}>
                      {item.name}
                    </Text>

                    <MotionPressable
                      accessibilityRole="button"
                      accessibilityLabel={`${isSaved ? t("searchRemoveSavedService") : t("searchSaveService")}: ${item.name}`}
                      accessibilityState={{ selected: isSaved }}
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleSaved(item.id);
                      }}
                      hitSlop={10}
                    >
                      <Feather
                        name={isSaved ? "bookmark" : "bookmark"}
                        size={19}
                        color={isSaved ? c.accent : c.mutedForeground}
                      />
                    </MotionPressable>
                  </View>

                  <Text style={[styles.category, { color: c.primary }]}>
                    {item.category}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.description, { color: c.mutedForeground }]}
                numberOfLines={3}
              >
                {item.description}
              </Text>

              <View style={styles.meta}>
                <View
                  style={[styles.verified, { backgroundColor: c.successSoft }]}
                >
                  <Feather name="check-circle" size={12} color={c.success} />

                  <Text style={[styles.verifiedText, { color: c.success }]}>
                    {t("officialSource")}
                  </Text>
                </View>

                <Text
                  style={[styles.domain, { color: c.mutedForeground }]}
                  numberOfLines={1}
                >
                  {item.source}
                </Text>
              </View>

              <Text style={[styles.details, { color: c.primary }]}>
                {t("searchViewDetails")} ↗
              </Text>
            </MotionPressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[styles.emptyIcon, { backgroundColor: c.primarySoft }]}
            >
              <Feather name="search" size={23} color={c.primary} />
            </View>

            <Text style={[styles.emptyTitle, { color: c.foreground }]}>
              {t("noVerifiedMatch")}
            </Text>

            <Text style={[styles.emptyBody, { color: c.mutedForeground }]}>
              {t("noSearchResultsHelp")}
            </Text>

            <MotionPressable
              accessibilityRole="button"
              onPress={() => router.push("/ask")}
            >
              <Text style={[styles.details, { color: c.primary }]}>
                {t("searchAskSaarthi")}
              </Text>
            </MotionPressable>
          </View>
        }
      />
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginTop: 7,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 11,
  },
  searchBox: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  suggestions: {
    flexDirection: "row",
    gap: 7,
    flexWrap: "wrap",
    marginTop: 12,
    marginBottom: 22,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  chipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#17304f",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    gap: 11,
  },
  categoryIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    lineHeight: 21,
    flex: 1,
    flexShrink: 1,
  },
  category: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 13,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
  },
  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },
  verifiedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  domain: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  details: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    marginTop: 13,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    marginTop: 14,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 15,
  },
});
