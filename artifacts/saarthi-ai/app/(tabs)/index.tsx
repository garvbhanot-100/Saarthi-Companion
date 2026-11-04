import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryTabs } from "@/components/CategoryTabs";
import { FadeInView, MotionPressable } from "@/components/Motion";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";
import { services } from "@/data/services";
import { getHomeServiceText } from "@/data/serviceTransalations";
import { useColors } from "@/hooks/useColors";

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
          duration: 420,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 420,
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
  const displayName = user?.name?.trim()?.split(/\s+/)[0];

  return (
    <FadeInView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        key={language}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Atmosphere + first composition */}
        <LinearGradient
          colors={[c.indigo, c.primary, c.background]}
          locations={[0, 0.42, 1]}
          style={[styles.heroPlane, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.heroGlow} />

          <RiseIn delay={40}>
            <View style={styles.topBar}>
              <View style={styles.brandRow}>
                <Image
                  source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
                  style={styles.brandMark}
                  resizeMode="cover"
                />
                <Text style={styles.brandWord}>
                  Saarthi <Text style={styles.brandAccent}>AI</Text>
                </Text>
              </View>

              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("profile")}
                onPress={() => router.push(user ? "/profile" : "/auth")}
                style={styles.avatar}
              >
                {user ? (
                  <Text style={styles.avatarText}>
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </Text>
                ) : (
                  <Feather name="user" size={18} color="#fff" />
                )}
              </MotionPressable>
            </View>
          </RiseIn>

          <RiseIn delay={120}>
            <Text style={styles.greeting}>
              {displayName ? `${t("greeting")} ${displayName}` : t("greeting")}
            </Text>
            <Text style={styles.headline}>
              {t("homeTitle")}
              <Text style={styles.headlineAccent}>{t("homeTitleHighlight")}</Text>
            </Text>
            <Text style={styles.support}>{t("homeDescription")}</Text>
          </RiseIn>

          <RiseIn delay={220}>
            <View style={styles.ctaRow}>
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("askSaarthi")}
                onPress={() => router.push("/ask")}
                style={styles.askCta}
              >
                <Feather name="message-circle" size={18} color={c.indigo} />
                <Text style={[styles.askCtaText, { color: c.indigo }]}>
                  {t("askSaarthi")}
                </Text>
              </MotionPressable>

              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("search")}
                onPress={() => router.push("/search")}
                style={styles.searchCta}
              >
                <Feather name="search" size={18} color="#fff" />
              </MotionPressable>
            </View>
          </RiseIn>
        </LinearGradient>

        <View style={styles.body}>
          <RiseIn delay={280}>
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={`${t("search")}. ${t("searchOfficialSchemes")}`}
              onPress={() => router.push("/search")}
              style={[
                styles.searchStrip,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Feather name="search" size={18} color={c.primary} />
              <Text
                style={[styles.searchStripText, { color: c.mutedForeground }]}
                numberOfLines={1}
              >
                {t("searchOfficialSchemes")}
              </Text>
              <Feather name="arrow-right" size={16} color={c.mutedForeground} />
            </MotionPressable>
          </RiseIn>

          <RiseIn delay={340}>
            <Text style={[styles.sectionLabel, { color: c.primary }]}>
              {t("exploreServices")}
            </Text>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              {t("startWithService")}
            </Text>

            <View style={styles.categoryTabs}>
              <CategoryTabs
                onSelect={(category) =>
                  router.push({ pathname: "/search", params: { category } })
                }
              />
            </View>
          </RiseIn>

          <RiseIn delay={400}>
            <View style={styles.pathRow}>
              {[
                {
                  title: t("findServices"),
                  icon: "search" as const,
                  route: "/search" as const,
                },
                {
                  title: t("checkEligibility"),
                  icon: "check-circle" as const,
                  route: "/ask" as const,
                },
                {
                  title: t("getGuidance"),
                  icon: "compass" as const,
                  route: "/ask" as const,
                },
              ].map((item) => (
                <MotionPressable
                  key={item.title}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  onPress={() => router.push(item.route)}
                  style={[
                    styles.pathChip,
                    { backgroundColor: c.primarySoft, borderColor: c.border },
                  ]}
                >
                  <Feather name={item.icon} size={15} color={c.primary} />
                  <Text
                    style={[styles.pathChipText, { color: c.foreground }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                </MotionPressable>
              ))}
            </View>
          </RiseIn>

          <RiseIn delay={460}>
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: c.primary }]}>
                  {t("trustedStartingPoints")}
                </Text>
                <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                  {t("popularRightNow")}
                </Text>
              </View>
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("seeAll")}
                onPress={() => router.push("/search")}
              >
                <Text style={[styles.seeAll, { color: c.primary }]}>
                  {t("seeAll")}
                </Text>
              </MotionPressable>
            </View>

            {popularServices.map((service, index) => {
              const serviceName = getHomeServiceText(
                service.id,
                language,
                "name",
              );
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
                    styles.serviceRow,
                    {
                      backgroundColor: c.card,
                      borderColor: c.border,
                      marginTop: index === 0 ? 14 : 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.serviceIcon,
                      { backgroundColor: c.primarySoft },
                    ]}
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
                    <Text
                      style={[styles.serviceTitle, { color: c.foreground }]}
                    >
                      {serviceName}
                    </Text>
                    <Text
                      style={[
                        styles.serviceSubtitle,
                        { color: c.mutedForeground },
                      ]}
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
          </RiseIn>

          {chats.length > 0 && (
            <RiseIn delay={520}>
              <View style={styles.sectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionLabel, { color: c.primary }]}>
                    {t("yourSpace")}
                  </Text>
                  <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                    {t("continueConversation")}
                  </Text>
                </View>
              </View>

              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("continueConversation")}
                onPress={() => router.push("/ask")}
                style={[
                  styles.continueRow,
                  { backgroundColor: c.successSoft, borderColor: c.border },
                ]}
              >
                <View
                  style={[
                    styles.serviceIcon,
                    { backgroundColor: c.card },
                  ]}
                >
                  <Feather name="message-square" size={16} color={c.success} />
                </View>
                <View style={styles.serviceContent}>
                  <Text style={[styles.serviceTitle, { color: c.foreground }]}>
                    {chats[0].title}
                  </Text>
                  <Text
                    style={[
                      styles.serviceSubtitle,
                      { color: c.mutedForeground },
                    ]}
                  >
                    {chats[0].messages.length} {t("messagesSaved")}
                  </Text>
                </View>
                <Feather name="play" size={16} color={c.success} />
              </MotionPressable>
            </RiseIn>
          )}

          <View style={styles.privacy}>
            <Feather name="shield" size={14} color={c.success} />
            <Text style={[styles.privacyText, { color: c.mutedForeground }]}>
              {t("privacyNotice")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  heroPlane: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -40,
    right: -50,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  brandWord: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#fff",
    letterSpacing: -0.4,
  },
  brandAccent: {
    color: "rgba(255,255,255,0.72)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  greeting: {
    marginTop: 28,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    letterSpacing: 0.2,
  },
  headline: {
    marginTop: 8,
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.9,
    color: "#fff",
  },
  headlineAccent: {
    color: "rgba(255,255,255,0.82)",
  },
  support: {
    marginTop: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.78)",
    maxWidth: 340,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  askCta: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  askCtaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  searchCta: {
    width: 54,
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  body: {
    marginTop: -18,
    paddingHorizontal: 20,
  },
  searchStrip: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchStripText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  sectionLabel: {
    marginTop: 28,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  sectionTitle: {
    marginTop: 6,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  seeAll: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    paddingBottom: 2,
  },
  categoryTabs: {
    marginTop: 14,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  pathRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  pathChip: {
    flex: 1,
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  pathChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  serviceRow: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  continueRow: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceImage: {
    width: 28,
    height: 28,
  },
  serviceContent: {
    flex: 1,
    minWidth: 0,
  },
  serviceTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },
  serviceSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  privacy: {
    flexDirection: "row",
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 2,
  },
  privacyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
