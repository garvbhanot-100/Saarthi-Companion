import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DummyRazorpayModal } from "@/components/DummyRazorpayModal";
import { FadeInView, MotionPressable } from "@/components/Motion";
import { PrimaryButton } from "@/components/UI";
import {
  FREE_TIER_SERVICE_IDS,
  PREMIUM_PRICE_INR,
} from "@/constants/subscription";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";
import { services } from "@/data/services";
import { useColors } from "@/hooks/useColors";

const perks = [
  "premiumPerkAllServices",
  "premiumPerkAi",
  "premiumPerkSaved",
  "premiumPerkSupport",
] as const;

export default function Premium() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { plan, isPremium, upgradeToPremium } = useSaarthi();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const freeNames = services
    .filter((s) => FREE_TIER_SERVICE_IDS.includes(s.id as (typeof FREE_TIER_SERVICE_IDS)[number]))
    .map((s) => s.name);

  const handlePay = async () => {
    setPaying(true);
    try {
      await upgradeToPremium();
      setCheckoutOpen(false);
      Alert.alert(t("premiumUnlockedTitle"), t("premiumUnlockedMessage"));
    } catch {
      Alert.alert(t("premiumUpgradeFailed"));
    } finally {
      setPaying(false);
    }
  };

  return (
    <FadeInView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[c.indigo, c.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEyebrow}>{t("premiumEyebrow")}</Text>
          <Text style={styles.heroTitle}>{t("premiumTitle")}</Text>
          <Text style={styles.heroSub}>{t("premiumSubtitle")}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{PREMIUM_PRICE_INR}</Text>
            <Text style={styles.priceOnce}>{t("premiumOneTime")}</Text>
          </View>
          {isPremium ? (
            <View style={styles.badge}>
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={styles.badgeText}>{t("premiumActive")}</Text>
            </View>
          ) : null}
        </LinearGradient>

        <View
          style={[
            styles.planCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Text style={[styles.planLabel, { color: c.mutedForeground }]}>
            {t("yourPlan")}
          </Text>
          <Text style={[styles.planValue, { color: c.foreground }]}>
            {plan === "premium" ? t("planPremium") : t("planFree")}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: c.foreground }]}>
          {t("premiumIncludes")}
        </Text>
        {perks.map((key) => (
          <View key={key} style={styles.perkRow}>
            <Feather name="check" size={18} color={c.primary} />
            <Text style={[styles.perkText, { color: c.foreground }]}>
              {t(key)}
            </Text>
          </View>
        ))}

        <View
          style={[
            styles.freeBox,
            { backgroundColor: c.primarySoft, borderColor: c.border },
          ]}
        >
          <Text style={[styles.freeTitle, { color: c.foreground }]}>
            {t("freeTierIncludes")}
          </Text>
          <Text style={[styles.freeList, { color: c.mutedForeground }]}>
            {freeNames.join(" • ")}
          </Text>
        </View>

        {!isPremium ? (
          <View style={{ marginTop: 20 }}>
            <PrimaryButton
              title={t("unlockAllServicesCta")}
              onPress={() => setCheckoutOpen(true)}
            />
          </View>
        ) : (
          <MotionPressable
            accessibilityRole="button"
            onPress={() => router.push("/search")}
            style={[
              styles.exploreBtn,
              { backgroundColor: c.primarySoft, borderColor: c.border },
            ]}
          >
            <Text style={[styles.exploreText, { color: c.primary }]}>
              {t("premiumBrowseAll")}
            </Text>
            <Feather name="arrow-right" size={18} color={c.primary} />
          </MotionPressable>
        )}
      </ScrollView>

      <DummyRazorpayModal
        visible={checkoutOpen}
        busy={paying}
        onClose={() => !paying && setCheckoutOpen(false)}
        onSimulateSuccess={() => void handlePay()}
      />
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  price: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
  },
  priceOnce: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  planCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 20,
  },
  planLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  planValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  perkText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  freeBox: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 8,
  },
  freeTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  freeList: {
    fontSize: 12,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 20,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exploreText: {
    fontSize: 16,
    fontWeight: "600",
  },
});