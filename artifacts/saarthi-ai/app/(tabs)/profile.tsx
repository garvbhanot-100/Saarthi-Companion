import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GhostButton, PrimaryButton, SectionHeading } from "@/components/UI";
import { FadeInView, MotionPressable } from "@/components/Motion";
import LanguageSelector from "@/components/LanguageSelector";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguagesContext";

export default function Profile() {
  const c = useColors();
  const i = useSafeAreaInsets();
  const { t, hydrated } = useLanguage();

  const { user, chats, savedServiceIds, logOut, deleteChat, openChat } =
    useSaarthi();

  if (!hydrated) {
    return null;
  }

  if (!user) {
    return (
      <FadeInView
        style={[
          styles.guest,
          {
            backgroundColor: c.background,
            paddingTop: i.top + 28,
            paddingBottom: i.bottom + 90,
          },
        ]}
      >
        <View style={[styles.guestIcon, { backgroundColor: c.primarySoft }]}>
          <Feather name="user" size={28} color={c.primary} />
        </View>

        <Text style={[styles.guestTitle, { color: c.foreground }]}>
          {t("profileGuestTitle")}
        </Text>

        <Text style={[styles.guestBody, { color: c.mutedForeground }]}>
          {t("profileGuestDescription")}
        </Text>

        <View style={styles.guestLanguage}>
          <LanguageSelector />
        </View>

        <PrimaryButton
          title={t("createAccount")}
          icon="arrow-right"
          onPress={() => router.push("/auth")}
        />

        <MotionPressable
          accessibilityRole="button"
          accessibilityLabel={t("profileLoginLink")}
          onPress={() => router.push("/auth")}
        >
          <Text style={[styles.loginLink, { color: c.primary }]}>
            {t("profileLoginLink")}
          </Text>
        </MotionPressable>
      </FadeInView>
    );
  }

  return (
    <FadeInView style={{ flex: 1 }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: i.top + 16,
          paddingBottom: i.bottom + 100,
          paddingHorizontal: 20,
        }}
        ListHeaderComponent={
          <View>
            <View style={styles.profileHeader}>
              <View
                style={[styles.profileAvatar, { backgroundColor: c.primary }]}
              >
                <Text
                  style={[styles.avatarText, { color: c.primaryForeground }]}
                >
                  {user.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={[styles.name, { color: c.foreground }]}>
                  {user.name}
                </Text>

                <Text style={[styles.email, { color: c.mutedForeground }]}>
                  {user.email}
                </Text>
              </View>

              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("profileSettings")}
                hitSlop={10}
                onPress={() =>
                  Alert.alert(
                    t("profilePreviewTitle"),
                    t("profilePreviewDescription"),
                  )
                }
              >
                <Feather name="settings" size={20} color={c.mutedForeground} />
              </MotionPressable>
            </View>

            <View style={styles.stats}>
              <View
                style={[
                  styles.stat,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text style={[styles.statValue, { color: c.foreground }]}>
                  {savedServiceIds.length}
                </Text>
                <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
                  {t("saved")}
                </Text>
              </View>

              <View
                style={[
                  styles.stat,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text style={[styles.statValue, { color: c.foreground }]}>
                  {chats.length}
                </Text>
                <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
                  {t("profileChats")}
                </Text>
              </View>

              <View
                style={[
                  styles.stat,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text style={[styles.statValue, { color: c.foreground }]}>
                  {t("profileLocal")}
                </Text>
                <Text style={[styles.statLabel, { color: c.mutedForeground }]}>
                  {t("profilePreview")}
                </Text>
              </View>
            </View>

            <LanguageSelector />

            <SectionHeading
              eyebrow={t("yourSpace")}
              title={t("profileRecentChats")}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.chatRow,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={`${
                item.title === "New conversation"
                  ? t("profileNewConversation")
                  : item.title
              }. ${t("profileMessageCount").replace(
                "{count}",
                String(item.messages.length),
              )}`}
              onPress={() => {
                openChat(item.id);
                router.push("/ask");
              }}
              style={styles.chatPressable}
            >
              <Text
                style={[styles.chatTitle, { color: c.foreground }]}
                numberOfLines={1}
              >
                {item.title === "New conversation"
                  ? t("profileNewConversation")
                  : item.title}
              </Text>

              <Text style={[styles.chatMeta, { color: c.mutedForeground }]}>
                {t("profileMessageCount").replace(
                  "{count}",
                  String(item.messages.length),
                )}
              </Text>
            </MotionPressable>

            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel={t("profileDeleteChat")}
              onPress={() =>
                Alert.alert(
                  t("profileDeleteChat"),
                  t("profileDeleteChatConfirm"),
                  [
                    { text: t("cancel"), style: "cancel" },
                    {
                      text: t("profileDelete"),
                      style: "destructive",
                      onPress: () => deleteChat(item.id),
                    },
                  ],
                )
              }
              hitSlop={10}
            >
              <Feather name="trash-2" size={17} color={c.mutedForeground} />
            </MotionPressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.noChats}>
            <Feather
              name="message-square"
              size={21}
              color={c.mutedForeground}
            />
            <Text style={[styles.noChatsText, { color: c.mutedForeground }]}>
              {t("profileNoChats")}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={[styles.notice, { backgroundColor: c.warningSoft }]}>
              <Feather name="info" size={16} color={c.accent} />
              <Text style={[styles.noticeText, { color: c.foreground }]}>
                {t("profilePrivacyNotice")}
              </Text>
            </View>

            <GhostButton
              title={t("profileSignOut")}
              icon="log-out"
              onPress={logOut}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  guest: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  guestIcon: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 4,
  },
  guestTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 25,
    lineHeight: 32,
    marginTop: 18,
    textAlign: "center",
  },
  guestBody: {
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  guestLanguage: {
    width: "100%",
    marginBottom: 4,
  },
  loginLink: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    marginTop: 18,
    textAlign: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  email: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },

  createAccountButton: {
    width: "100%",
    marginTop: 18,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    marginBottom: 27,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: "#17304f",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 4,
  },
  chatRow: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 11,
    shadowColor: "#17304f",
    shadowOpacity: 0.045,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  chatPressable: {
    flex: 1,
  },
  chatTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  chatMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 4,
  },
  noChats: {
    alignItems: "center",
    padding: 28,
    gap: 8,
  },
  noChatsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
  footer: {
    gap: 14,
    marginTop: 24,
  },
  notice: {
    flexDirection: "row",
    gap: 9,
    padding: 13,
    borderRadius: 15,
  },
  noticeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },
});
