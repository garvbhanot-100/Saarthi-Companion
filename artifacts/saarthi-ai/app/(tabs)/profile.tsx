import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LanguageSelector from "@/components/LanguageSelector";
import { FadeInView, MotionPressable } from "@/components/Motion";
import { GhostButton } from "@/components/UI";
import { languages } from "@/constants/languages";
import { useLanguage } from "@/context/LanguagesContext";
import { useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";

export default function Profile() {
  const c = useColors();
  const i = useSafeAreaInsets();
  const { t, language, hydrated: languageHydrated } = useLanguage();

  const {
    user,
    chats,
    savedServiceIds,
    hydrated: profileHydrated,
    hydrationError,
    updateProfile,
    logOut,
    deleteChat,
    openChat,
  } = useSaarthi();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const messageCount = useMemo(
    () => chats.reduce((total, chat) => total + chat.messages.length, 0),
    [chats],
  );

  const languageLabel =
    languages.find((item) => item.code === language)?.nativeName ?? language;

  useEffect(() => {
    if (!user) {
      setEditing(false);
      setName("");
      setEmail("");
      return;
    }
    if (!editing) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, editing]);

  if (!languageHydrated || !profileHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  const startEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setEditing(true);
  };

  const cancelEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setEditing(false);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email });
      setEditing(false);
      Alert.alert(t("profileUpdated"));
    } catch (error) {
      console.error("Could not update profile:", error);
      Alert.alert(t("profileUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t("profileSignOut"), t("profileOnThisDevice"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("profileSignOut"),
        style: "destructive",
        onPress: () => {
          void (async () => {
            setLoggingOut(true);
            try {
              await logOut();
              router.replace("/auth");
            } catch (error) {
              console.error("Could not sign out:", error);
              router.replace("/auth");
            } finally {
              setLoggingOut(false);
            }
          })();
        },
      },
    ]);
  };

  return (
    <FadeInView style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: i.bottom + 100,
        }}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={[c.indigo, c.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hero, { paddingTop: i.top + 18 }]}
            >
              <View style={styles.heroTop}>
                <Text style={styles.heroEyebrow}>{t("profileSettings")}</Text>
                <MotionPressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    editing ? t("profileCancelEdit") : t("profileEdit")
                  }
                  onPress={editing ? cancelEdit : startEdit}
                  style={styles.editChip}
                >
                  <Feather
                    name={editing ? "x" : "edit-3"}
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.editChipText}>
                    {editing ? t("profileCancelEdit") : t("profileEdit")}
                  </Text>
                </MotionPressable>
              </View>

              <View style={styles.avatarRing}>
                <Text style={styles.avatarLetter}>
                  {user.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>

              {!editing ? (
                <>
                  <Text style={styles.heroName}>{user.name}</Text>
                  <Text style={styles.heroEmail}>{user.email}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.heroBadge}>
                      <Feather name="shield" size={11} color="#fff" />
                      <Text style={styles.heroBadgeText}>
                        {t("profileLocal")}
                      </Text>
                    </View>
                    <View style={styles.heroBadge}>
                      <Feather name="smartphone" size={11} color="#fff" />
                      <Text style={styles.heroBadgeText}>
                        {t("profileOnThisDevice")}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.heroEditing}>{t("profileEditing")}</Text>
              )}
            </LinearGradient>

            <View style={styles.body}>
              {hydrationError ? (
                <Text style={[styles.loadError, { color: c.accent }]}>
                  {hydrationError}
                </Text>
              ) : null}

              {editing ? (
                <View
                  style={[
                    styles.editCard,
                    { backgroundColor: c.card, borderColor: c.border },
                  ]}
                >
                  <Text style={[styles.fieldLabel, { color: c.foreground }]}>
                    {t("profileAuthFullName")}
                  </Text>
                  <TextInput
                    accessibilityLabel={t("profileAuthFullName")}
                    value={name}
                    onChangeText={setName}
                    placeholder={t("profileAuthYourName")}
                    placeholderTextColor={c.mutedForeground}
                    style={[
                      styles.fieldInput,
                      {
                        backgroundColor: c.muted,
                        borderColor: c.border,
                        color: c.foreground,
                      },
                    ]}
                  />

                  <Text style={[styles.fieldLabel, { color: c.foreground }]}>
                    {t("profileAuthEmail")}
                  </Text>
                  <TextInput
                    accessibilityLabel={t("profileAuthEmail")}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t("profileAuthEmailPlaceholder")}
                    placeholderTextColor={c.mutedForeground}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[
                      styles.fieldInput,
                      {
                        backgroundColor: c.muted,
                        borderColor: c.border,
                        color: c.foreground,
                      },
                    ]}
                  />

                  <MotionPressable
                    accessibilityRole="button"
                    accessibilityLabel={t("profileSaveChanges")}
                    accessibilityState={{ disabled: saving }}
                    disabled={saving}
                    onPress={() => void saveEdit()}
                    style={({ pressed }) => [
                      styles.saveBtn,
                      {
                        backgroundColor: c.primary,
                        opacity: saving ? 0.7 : pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator color={c.primaryForeground} />
                    ) : (
                      <>
                        <Feather
                          name="check"
                          size={16}
                          color={c.primaryForeground}
                        />
                        <Text
                          style={[
                            styles.saveBtnText,
                            { color: c.primaryForeground },
                          ]}
                        >
                          {t("profileSaveChanges")}
                        </Text>
                      </>
                    )}
                  </MotionPressable>
                </View>
              ) : (
                <>
                  <View
                    style={[
                      styles.infoCard,
                      { backgroundColor: c.card, borderColor: c.border },
                    ]}
                  >
                    <Text
                      style={[styles.infoCardTitle, { color: c.foreground }]}
                    >
                      {t("profileAccountInfo")}
                    </Text>

                    <InfoRow
                      icon="user"
                      label={t("profileAuthFullName")}
                      value={user.name}
                      color={c}
                    />
                    <InfoRow
                      icon="mail"
                      label={t("profileAuthEmail")}
                      value={user.email}
                      color={c}
                    />
                    <InfoRow
                      icon="globe"
                      label={t("profileLanguageTitle")}
                      value={languageLabel}
                      color={c}
                    />
                    <InfoRow
                      icon="lock"
                      label={t("profileAccountType")}
                      value={t("profileLocal")}
                      color={c}
                      last
                    />
                  </View>

                  <Text
                    style={[styles.sectionLabel, { color: c.primary }]}
                  >
                    {t("profileActivity")}
                  </Text>

                  <View style={styles.stats}>
                    <View
                      style={[
                        styles.stat,
                        { backgroundColor: c.card, borderColor: c.border },
                      ]}
                    >
                      <Text
                        style={[styles.statValue, { color: c.foreground }]}
                      >
                        {savedServiceIds.length}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: c.mutedForeground },
                        ]}
                      >
                        {t("saved")}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.stat,
                        { backgroundColor: c.card, borderColor: c.border },
                      ]}
                    >
                      <Text
                        style={[styles.statValue, { color: c.foreground }]}
                      >
                        {chats.length}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: c.mutedForeground },
                        ]}
                      >
                        {t("profileChats")}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.stat,
                        { backgroundColor: c.card, borderColor: c.border },
                      ]}
                    >
                      <Text
                        style={[styles.statValue, { color: c.foreground }]}
                      >
                        {messageCount}
                      </Text>
                      <Text
                        style={[
                          styles.statLabel,
                          { color: c.mutedForeground },
                        ]}
                      >
                        {t("profileMessages")}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.languageBlock}>
                <LanguageSelector />
              </View>

              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("profileSignOut")}
                disabled={loggingOut}
                onPress={handleSignOut}
                style={({ pressed }) => [
                  styles.logoutBtn,
                  {
                    backgroundColor: c.card,
                    borderColor: c.destructive,
                    opacity: loggingOut ? 0.6 : pressed ? 0.88 : 1,
                  },
                ]}
              >
                {loggingOut ? (
                  <ActivityIndicator color={c.destructive} />
                ) : (
                  <>
                    <Feather name="log-out" size={18} color={c.destructive} />
                    <Text
                      style={[styles.logoutText, { color: c.destructive }]}
                    >
                      {t("profileSignOut")}
                    </Text>
                  </>
                )}
              </MotionPressable>

              <Text style={[styles.sectionLabel, { color: c.primary }]}>
                {t("yourSpace")}
              </Text>
              <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                {t("profileRecentChats")}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.chatPad}>
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
              onPress={handleSignOut}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </FadeInView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  color,
  last = false,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  color: ReturnType<typeof useColors>;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: color.border,
        },
      ]}
    >
      <View style={[styles.infoIcon, { backgroundColor: color.primarySoft }]}>
        <Feather name={icon} size={14} color={color.primary} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={[styles.infoLabel, { color: color.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: color.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadError: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: "center",
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
  },
  heroTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  heroEyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
  },
  editChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  editChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#fff",
  },
  avatarRing: {
    width: 78,
    height: 78,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarLetter: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: "#fff",
  },
  heroName: {
    marginTop: 14,
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
  },
  heroEmail: {
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#fff",
  },
  heroEditing: {
    marginTop: 14,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  body: {
    marginTop: -14,
    paddingHorizontal: 20,
  },
  editCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCopy: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  infoValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 2,
  },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  fieldInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginBottom: 12,
  },
  saveBtn: {
    marginTop: 4,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 2,
  },
  languageBlock: {
    marginTop: 12,
    marginBottom: 8,
  },
  logoutBtn: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  logoutText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  sectionLabel: {
    marginTop: 18,
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  sectionTitle: {
    marginTop: 6,
    marginBottom: 14,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  chatPad: {
    paddingHorizontal: 20,
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
    marginTop: 18,
    paddingHorizontal: 20,
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
