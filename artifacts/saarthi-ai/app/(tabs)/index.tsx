import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton, SectionHeading } from "@/components/UI";
import { CategoryTabs } from "@/components/CategoryTabs";
import { FadeInView, MotionPressable } from "@/components/Motion";
import React from "react";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";
import { services } from "@/data/services";
import { getHomeServiceText } from "@/data/serviceTransalations";
import { useColors } from "@/hooks/useColors";

export default function Home() {
  const { t, language, hydrated } = useLanguage();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user, chats } = useSaarthi();

  if (!hydrated) {
    return null;
  }

  const getServiceImage = (id: string) => {
    switch (id) {
      case "aadhaar-update":
        return require("../../assets/images/images-2/aadhar-card.png");
      case "pan-card":
        return require("../../assets/images/images-2/Pan-Card.png");
      case "pm-kisan":
        return require("../../assets/images/images-2/pm-kisan.png");
      default:
        return null;
    }
  };

  const popularServices = services.slice(0, 3);

  return (
    <FadeInView style={{ flex: 1 }}>
      <ScrollView
        key={language}
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{
          paddingTop: insets.top + 13,
          paddingBottom: insets.bottom + 95,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: c.primary }]}>
            <Image
              source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>

          <MotionPressable
            accessibilityRole="button"
            accessibilityLabel={t("profile")}
            onPress={() => router.push(user ? "/profile" : "/auth")}
            style={[styles.avatar, { backgroundColor: c.primarySoft }]}
          >
            {user ? (
              <Text style={[styles.avatarText, { color: c.primary }]}>
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </Text>
            ) : (
              <Feather name="user" size={18} color={c.primary} />
            )}
          </MotionPressable>
        </View>

        {/* Welcome */}
        <Text style={[styles.greeting, { color: c.mutedForeground }]}>
          {t("greeting")}
        </Text>

        <Text style={[styles.title, { color: c.foreground }]}>
          {t("homeTitle")}
          <Text style={{ color: c.primary }}>{t("homeTitleHighlight")}</Text>
        </Text>

        <Text style={[styles.body, { color: c.mutedForeground }]}>
          {t("homeDescription")}
        </Text>

        {/* Home tagline */}
        <View
          style={[
            styles.taglineContainer,
            {
              backgroundColor: c.card,
              borderColor: c.border,
            },
          ]}
        >
          <Text style={[styles.tagline, { color: c.foreground }]}>
            Government Services.
            {"\n"}
            Simplified for You.
          </Text>

          <Text style={[styles.taglineSubtitle, { color: c.mutedForeground }]}>
            Simple. Accessible. For Everyone.
          </Text>
        </View>

        {/* Hero */}
        <LinearGradient colors={[c.indigo, c.primary]} style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>{t("heroEyebrow")}</Text>

            <Text style={styles.heroTitle}>{t("heroTitle")}</Text>

            <Text style={styles.heroBody}>{t("heroDescription")}</Text>
          </View>

          <View style={styles.compass}>
            <Image
              source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
              style={{ width: 38, height: 38, borderRadius: 12 }}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Main actions */}
        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={t("askSaarthi")}
              icon="message-circle"
              onPress={() => router.push("/ask")}
            />
          </View>

          <MotionPressable
            accessibilityRole="button"
            accessibilityLabel={t("search")}
            onPress={() => router.push("/search")}
            style={[
              styles.searchButton,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Feather name="search" size={20} color={c.primary} />
          </MotionPressable>
        </View>

        {/* Explore services */}
        <SectionHeading
          eyebrow={t("exploreServices")}
          title={t("startWithService")}
        />

        <View style={styles.categoryTabs}>
          <CategoryTabs
            onSelect={(category) =>
              router.push({ pathname: "/search", params: { category } })
            }
          />
        </View>

        <View style={styles.grid}>
          {[
            {
              title: t("findServices"),
              subtitle: t("searchOfficialSchemes"),
              icon: "search",
              route: "/search",
            },
            {
              title: t("checkEligibility"),
              subtitle: t("understandRequirements"),
              icon: "check-circle",
              route: "/ask",
            },
            {
              title: t("getGuidance"),
              subtitle: t("askInSimpleLanguage"),
              icon: "compass",
              route: "/ask",
            },
          ].map((item) => (
            <MotionPressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.subtitle}`}
              onPress={() => router.push(item.route as "/search" | "/ask")}
              style={[
                styles.exploreCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View
                style={[styles.exploreIcon, { backgroundColor: c.primarySoft }]}
              >
                <Feather
                  name={item.icon as "search" | "check-circle" | "compass"}
                  size={17}
                  color={c.primary}
                />
              </View>

              <Text style={[styles.exploreTitle, { color: c.foreground }]}>
                {item.title}
              </Text>

              <Text
                style={[styles.exploreSubtitle, { color: c.mutedForeground }]}
              >
                {item.subtitle}
              </Text>
            </MotionPressable>
          ))}
        </View>

        {/* Popular services */}
        <SectionHeading
          eyebrow={t("trustedStartingPoints")}
          title={t("popularRightNow")}
          action={t("seeAll")}
          onAction={() => router.push("/search")}
        />

        {popularServices.map((service) => {
          const serviceName = getHomeServiceText(service.id, language, "name");
          const serviceDescription = getHomeServiceText(
            service.id,
            language,
            "description",
          );
          const serviceImage = getServiceImage(service.id);

          return (
            <MotionPressable
              key={service.id}
              accessibilityRole="button"
              accessibilityLabel={`${serviceName}. ${t("viewDetails")}`}
              onPress={() =>
                router.push({
                  pathname: "/service/[id]",
                  params: { id: service.id },
                })
              }
              style={[
                styles.serviceCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View
                style={[styles.serviceIcon, { backgroundColor: c.primarySoft }]}
              >
                {serviceImage ? (
                  <Image
                    source={serviceImage}
                    style={styles.serviceImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Feather name="shield" size={16} color={c.primary} />
                )}
              </View>

              <View style={styles.serviceContent}>
                <Text style={[styles.serviceTitle, { color: c.foreground }]}>
                  {serviceName}
                </Text>

                <Text
                  style={[styles.serviceSubtitle, { color: c.mutedForeground }]}
                  numberOfLines={2}
                >
                  {serviceDescription}
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={17}
                color={c.mutedForeground}
              />
            </MotionPressable>
          );
        })}

        {/* Recent conversation */}
        {chats.length > 0 && (
          <>
            <SectionHeading
              eyebrow={t("yourSpace")}
              title={t("continueConversation")}
              action={t("viewAll")}
              onAction={() => router.push("/profile")}
            />

            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={t("continueConversation")}
              onPress={() => router.push("/ask")}
              style={[
                styles.serviceCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View
                style={[styles.serviceIcon, { backgroundColor: c.successSoft }]}
              >
                <Feather name="message-square" size={16} color={c.success} />
              </View>

              <View style={styles.serviceContent}>
                <Text style={[styles.serviceTitle, { color: c.foreground }]}>
                  {chats[0].title}
                </Text>

                <Text
                  style={[styles.serviceSubtitle, { color: c.mutedForeground }]}
                >
                  {chats[0].messages.length} {t("messagesSaved")}
                </Text>
              </View>
            </MotionPressable>
          </>
        )}

        {/* Privacy notice */}
        <View style={styles.privacy}>
          <Feather name="shield" size={14} color={c.success} />

          <Text style={[styles.privacyText, { color: c.mutedForeground }]}>
            {t("privacyNotice")}
          </Text>
        </View>
      </ScrollView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 19,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.7,
    marginTop: 7,
    flexWrap: "wrap",
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
  },

  taglineContainer: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },

  tagline: {
    fontFamily: "Inter_700Bold",
    fontSize: 21,
    lineHeight: 29,
    letterSpacing: -0.4,
  },

  taglineSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  hero: {
    minHeight: 166,
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#173979",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroContent: {
    flex: 1,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,.8)",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 29,
    marginTop: 9,
    flexShrink: 1,
  },
  heroBody: {
    color: "rgba(255,255,255,.85)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 11,
  },
  compass: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,.17)",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  searchButton: {
    width: 54,
    minHeight: 53,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTabs: {
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 26,
  },
  exploreCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 144,
    borderRadius: 17,
    borderWidth: 1,
    padding: 11,
    shadowColor: "#17304f",
    shadowOpacity: 0.045,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  exploreIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  exploreTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
  exploreSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
    flexShrink: 1,
  },
  serviceCard: {
    minHeight: 74,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 10,
    shadowColor: "#17304f",
    shadowOpacity: 0.045,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  serviceIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceImage: {
    width: 30,
    height: 30,
  },
  serviceContent: {
    flex: 1,
    minWidth: 0,
  },
  serviceTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    lineHeight: 19,
  },
  serviceSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  privacy: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 5,
  },
  privacyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
