import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  GhostButton,
  IconButton,
  PrimaryButton,
  SourceRow,
} from "@/components/UI";
import { getServiceById } from "@/data/services";
import { serviceImages } from "@/data/serviceImages";
import {
  getServiceText,
  hasLocalizedServiceField,
  type LocalizedServiceContent,
} from "@/data/serviceTransalations";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguagesContext";
import { translations, type TranslationKey } from "@/constants/translations";

export default function Detail() {
  const c = useColors();
  const i = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = getServiceById(id || "");
  const { savedServiceIds, toggleSaved } = useSaarthi();
  const { language, t } = useLanguage();

  const detailText = (key: TranslationKey) => {
    const translatedText = t(key);

    if (
      language !== "en" &&
      translatedText === translations.en[key]
    ) {
      return t("serviceTranslationUnavailable");
    }

    return translatedText;
  };

  if (!item) {
    return (
      <View style={[s.notFound, { backgroundColor: c.background }]}>
        <Text style={[s.title, { color: c.foreground }]}>
          {detailText("serviceNotFound")}
        </Text>
        <GhostButton title={detailText("goBack")} onPress={() => router.back()} />
      </View>
    );
  }

  const saved = savedServiceIds.includes(item.id);
  const serviceText = (field: keyof LocalizedServiceContent) => {
    if (language === "en") return item[field];

    if (!hasLocalizedServiceField(item.id, language, field)) {
      return t("serviceTranslationUnavailable");
    }

    return getServiceText(item.id, language, field);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: i.top + 13,
        paddingBottom: i.bottom + 30,
        paddingHorizontal: 20,
      }}
    >
      <View style={s.top}>
        <IconButton
          icon="arrow-left"
          label={detailText("goBack")}
          onPress={() => router.back()}
        />

        <IconButton
          icon="bookmark"
          label={
            saved
              ? detailText("removeSavedService")
              : detailText("saveService")
          }
          onPress={() => toggleSaved(item.id)}
        />
      </View>

      <View style={[s.icon, { backgroundColor: c.primarySoft }]}>
        {item.id === "aadhaar-update" ? (
          <Image
            source={require("../../assets/images/images-2/aadhar-card.png")}
            style={{ width: 54, height: 54 }}
            resizeMode="contain"
          />
        ) : item.id === "pan-card" ? (
          <Image
            source={require("../../assets/images/images-2/Pan-Card.png")}
            style={{ width: 54, height: 54 }}
            resizeMode="contain"
          />
        ) : item.id === "pm-kisan" ? (
          <Image
            source={require("../../assets/images/images-2/pm-kisan.png")}
            style={{ width: 54, height: 54 }}
            resizeMode="contain"
          />
        ) : serviceImages[item.id] ? (
          <Image
            source={serviceImages[item.id]}
            style={{ width: 54, height: 54 }}
            resizeMode="contain"
          />
        ) : (
          <Feather name="shield" size={25} color={c.primary} />
        )}
      </View>

      <Text style={[s.category, { color: c.primary }]}>
        {serviceText("category").toUpperCase()}
      </Text>

      <Text style={[s.title, { color: c.foreground }]}>
        {serviceText("name")}
      </Text>

      <Text style={[s.description, { color: c.mutedForeground }]}>
        {serviceText("description")}
      </Text>

      <View style={[s.verified, { backgroundColor: c.successSoft }]}>
        <Feather name="check-circle" size={14} color={c.success} />
        <Text style={[s.verifiedText, { color: c.success }]}>
          {detailText("verifiedStartingPoint")} ·{" "}
          {language === "en"
            ? item.lastVerified
            : t("serviceTranslationUnavailable")}
        </Text>
      </View>

      <View style={[s.notice, { backgroundColor: c.warningSoft }]}>
        <Feather name="info" size={16} color={c.accent} />
        <Text style={[s.noticeText, { color: c.foreground }]}>
          {detailText("serviceOfficialNotice")}
        </Text>
      </View>

      <View
        style={[s.card, { backgroundColor: c.card, borderColor: c.border }]}
      >
        <Text style={[s.detailTitle, { color: c.foreground }]}>
          {detailText("eligibility")}
        </Text>

        <Text style={[s.detailBody, { color: c.mutedForeground }]}>
          {serviceText("eligibility")}
        </Text>

        <View style={[s.divider, { backgroundColor: c.border }]} />

        <Text style={[s.detailTitle, { color: c.foreground }]}>
          {detailText("documents")}
        </Text>

        <Text style={[s.detailBody, { color: c.mutedForeground }]}>
          {serviceText("documents")}
        </Text>
      </View>

      <Text style={[s.sourceHeading, { color: c.foreground }]}>
        {detailText("officialSource")}
      </Text>

      <SourceRow
        label={item.source}
        onPress={() => Linking.openURL(item.officialUrl)}
      />

      <View style={s.actions}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            title={detailText("askAboutService")}
            icon="message-circle"
            onPress={() => router.push("/ask")}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={detailText("openOfficialWebsite")}
          onPress={() => Linking.openURL(item.officialUrl)}
          style={[
            s.external,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Feather name="external-link" size={19} color={c.primary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  category: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
    marginTop: 19,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    lineHeight: 38,
    marginTop: 7,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 11,
  },
  verified: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 10,
    marginTop: 17,
  },
  verifiedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  notice: {
    flexDirection: "row",
    gap: 9,
    padding: 13,
    borderRadius: 15,
    marginTop: 16,
  },
  noticeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },
  detailTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  detailBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sourceHeading: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginTop: 23,
  },
  actions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 21,
  },
  external: {
    width: 54,
    minHeight: 53,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
