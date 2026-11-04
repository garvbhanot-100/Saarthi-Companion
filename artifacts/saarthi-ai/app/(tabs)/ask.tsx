import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FadeInView,
  MotionPressable,
  TypingIndicator,
} from "@/components/Motion";
import type { TranslationKey } from "@/constants/translations";
import { useLanguage } from "@/context/LanguagesContext";
import { ChatMessage, useSaarthi } from "@/context/SaarthiContext";
import type { OfficialLinkType } from "@/data/services";
import { useColors } from "@/hooks/useColors";
import {
  findOfficialSource,
  getAssistantReply,
  isSafeHttpUrl,
  splitContentLinks,
} from "@/services/assistant";
import { SpeechRecognition, useSpeechEvent } from "@/services/speech";

type PromptKey = "askPromptPan" | "askPromptScholarship" | "askPromptAadhaar";

const SOURCE_TYPE_KEYS: Record<OfficialLinkType, TranslationKey> = {
  information: "sourceTypeInformation",
  application: "sourceTypeApplication",
  forms: "sourceTypeForms",
  website: "sourceTypeWebsite",
};

const PROMPT_KEYS: {
  id: string;
  key: PromptKey;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  { id: "pan", key: "askPromptPan", icon: "credit-card" },
  { id: "scholarship", key: "askPromptScholarship", icon: "book-open" },
  { id: "aadhaar", key: "askPromptAadhaar", icon: "file-text" },
];

const openOfficialUrl = (url: string) => {
  if (!isSafeHttpUrl(url)) return;
  Linking.openURL(url).catch((error) => {
    console.warn("Could not open official link:", error);
  });
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function Bubble({
  m,
  onRetry,
  retryDisabled,
}: {
  m: ChatMessage;
  onRetry?: () => void;
  retryDisabled?: boolean;
}) {
  const c = useColors();
  const { t } = useLanguage();
  const isUser = m.role === "user";
  const sources = isUser
    ? []
    : (m.sources ?? []).flatMap((source) => {
        const official = findOfficialSource(source.url);
        return official ? [official] : [];
      });

  return (
    <View style={[s.message, isUser && s.user]}>
      {!isUser ? (
        <View style={[s.avatar, { backgroundColor: c.primarySoft }]}>
          <Image
            source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
            style={s.avatarImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <View style={s.bubbleCol}>
        <View
          style={[
            s.bubble,
            isUser ? s.userBubble : s.assistantBubble,
            {
              backgroundColor: isUser ? c.primary : c.card,
              borderColor: m.isError
                ? c.destructive
                : isUser
                  ? "transparent"
                  : c.border,
            },
          ]}
        >
          {!isUser ? (
            <Text style={[s.roleLabel, { color: c.primary }]}>Saarthi</Text>
          ) : null}

          <Text
            selectable
            style={[
              s.messageText,
              { color: isUser ? c.primaryForeground : c.foreground },
            ]}
          >
            {isUser
              ? m.content
              : splitContentLinks(m.content).map((segment, index) =>
                  segment.kind === "link" ? (
                    <Text
                      key={index}
                      accessibilityRole="link"
                      onPress={() => openOfficialUrl(segment.url)}
                      style={[s.inlineLink, { color: c.primary }]}
                    >
                      {segment.text}
                    </Text>
                  ) : segment.kind === "unverified-link" ? (
                    <Text key={index} style={{ color: c.mutedForeground }}>
                      {t("askUnverifiedLinkRemoved")}
                    </Text>
                  ) : (
                    segment.text
                  ),
                )}
          </Text>

          {sources.length ? (
            <View style={s.sourcesBlock}>
              <Text style={[s.sources, { color: c.mutedForeground }]}>
                {t("officialSources")}
              </Text>
              {sources.map((source, index) => {
                const typeLabel = t(SOURCE_TYPE_KEYS[source.type ?? "website"]);
                return (
                  <MotionPressable
                    key={`${source.url}-${index}`}
                    accessibilityRole="link"
                    accessibilityLabel={`${source.label}, ${typeLabel}`}
                    onPress={() => openOfficialUrl(source.url)}
                    style={[
                      s.source,
                      {
                        backgroundColor: c.primarySoft,
                        borderColor: c.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.sourceIcon,
                        { backgroundColor: c.card },
                      ]}
                    >
                      <Feather name="external-link" size={12} color={c.primary} />
                    </View>
                    <View style={s.sourceCopy}>
                      <Text
                        numberOfLines={1}
                        style={[s.sourceText, { color: c.foreground }]}
                      >
                        {source.label}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[s.sourceType, { color: c.mutedForeground }]}
                      >
                        {typeLabel}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={14} color={c.mutedForeground} />
                  </MotionPressable>
                );
              })}
            </View>
          ) : null}

          {onRetry ? (
            <MotionPressable
              accessibilityRole="button"
              accessibilityLabel="Retry"
              disabled={retryDisabled}
              onPress={onRetry}
              style={[
                s.retry,
                {
                  backgroundColor: c.primarySoft,
                  borderColor: c.border,
                  opacity: retryDisabled ? 0.35 : 1,
                },
              ]}
            >
              <Feather name="rotate-ccw" size={14} color={c.primary} />
              <Text style={[s.retryText, { color: c.primary }]}>Retry</Text>
            </MotionPressable>
          ) : null}
        </View>

        {m.createdAt ? (
          <Text
            style={[
              s.time,
              isUser ? s.timeUser : s.timeAssistant,
              { color: c.mutedForeground },
            ]}
          >
            {formatTime(m.createdAt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function Ask() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t, language, hydrated } = useLanguage();

  const {
    chats,
    activeChatId,
    startNewChat,
    appendMessage,
    removeMessage,
    clearChat,
  } = useSaarthi();

  const [sid, setSid] = useState(activeChatId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const session = useMemo(
    () => chats.find((chat) => chat.id === sid),
    [chats, sid],
  );

  const input = useRef<TextInput>(null);
  const hasMessages = Boolean(session?.messages.length) || sending;

  useSpeechEvent("start", () => {
    setIsListening(true);
  });

  useSpeechEvent("end", () => {
    setIsListening(false);
  });

  useSpeechEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setText(transcript);
    }
  });

  useSpeechEvent("error", () => {
    setIsListening(false);
  });

  useEffect(() => {
    if (activeChatId) setSid(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    if (!sid) {
      setSid(startNewChat());
    }
  }, [sid, startNewChat]);

  const send = async (questionText = text, retryMessageId?: string) => {
    const question = questionText.trim();

    if (!hydrated || !question || sendingRef.current || !sid) return;

    sendingRef.current = true;
    if (retryMessageId) {
      removeMessage(sid, retryMessageId);
    } else {
      setText("");
      appendMessage(sid, { role: "user", content: question });
    }
    setSending(true);

    try {
      const response = await getAssistantReply(question, language);

      appendMessage(sid, {
        role: "assistant",
        content: response.content,
        sources: response.sources,
      });
    } catch (error) {
      console.warn("Assistant request failed:", error);
      appendMessage(sid, {
        role: "assistant",
        content: t("askError"),
        isError: true,
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const retryMessage = (message: ChatMessage) => {
    if (!session) return;
    const messageIndex = session.messages.findIndex(
      (item) => item.id === message.id,
    );
    if (messageIndex < 0) return;
    const previousQuestion = session.messages
      .slice(0, messageIndex)
      .reverse()
      .find((item) => item.role === "user");
    if (previousQuestion) {
      void send(previousQuestion.content, message.id);
    }
  };

  const newChat = () => {
    setSid(startNewChat());
    setText("");
  };

  const toggleListening = async () => {
    if (!SpeechRecognition) {
      Alert.alert(
        "Voice input unavailable",
        "Voice input works in the installed Saarthi AI app. Please type your question here.",
      );
      return;
    }
    if (isListening) {
      SpeechRecognition.stop();
      return;
    }

    try {
      const permission = await SpeechRecognition.requestPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      SpeechRecognition.start({
        lang: `${language}-IN`,
        interimResults: true,
        continuous: false,
      });
    } catch (error) {
      console.warn("Speech recognition error:", error);
      setIsListening(false);
    }
  };

  const canSend = Boolean(text.trim()) && !sending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior="padding"
    >
      <FadeInView style={{ flex: 1 }}>
        <LinearGradient
          colors={[c.indigo, c.primary, c.background]}
          locations={[0, 0.35, 1]}
          style={[s.topPlane, { paddingTop: insets.top + 8 }]}
        >
          <View style={s.header}>
            <View style={s.brandBlock}>
              <View style={s.brandMarkWrap}>
                <Image
                  source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
                  style={s.brandMark}
                  resizeMode="cover"
                />
              </View>
              <View style={s.headerText}>
                <Text style={s.eyebrow}>{t("askEyebrow")}</Text>
                <Text style={s.headerTitle}>{t("ask")}</Text>
              </View>
            </View>

            <View style={s.headerActions}>
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("clearChat")}
                onPress={() => sid && clearChat(sid)}
                style={s.headerChip}
              >
                <Feather name="trash-2" size={15} color="#fff" />
              </MotionPressable>
              <MotionPressable
                accessibilityRole="button"
                accessibilityLabel={t("newChat")}
                onPress={newChat}
                style={s.headerChip}
              >
                <Feather name="plus" size={16} color="#fff" />
              </MotionPressable>
            </View>
          </View>
        </LinearGradient>

        {!hasMessages ? (
          <View style={s.emptyChat}>
            <View style={[s.heroCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[s.bigIcon, { backgroundColor: c.primarySoft }]}>
                <Image
                  source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
                  style={s.bigIconImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[s.emptyTitle, { color: c.foreground }]}>
                {t("askEmptyTitle")}
              </Text>
              <Text style={[s.emptyBody, { color: c.mutedForeground }]}>
                {t("askEmptyDescription")}
              </Text>
            </View>

            <Text style={[s.suggestLabel, { color: c.mutedForeground }]}>
              {t("trustedStartingPoints")}
            </Text>

            {PROMPT_KEYS.map((prompt) => (
              <MotionPressable
                key={prompt.id}
                accessibilityRole="button"
                accessibilityLabel={t(prompt.key)}
                onPress={() => {
                  const value = t(prompt.key);
                  setText(value);
                  void send(value);
                }}
                style={[
                  s.prompt,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <View style={[s.promptIcon, { backgroundColor: c.primarySoft }]}>
                  <Feather name={prompt.icon} size={16} color={c.primary} />
                </View>
                <Text style={[s.promptText, { color: c.foreground }]}>
                  {t(prompt.key)}
                </Text>
                <Feather name="arrow-up-right" size={15} color={c.primary} />
              </MotionPressable>
            ))}
          </View>
        ) : (
          <FlatList
            data={[...(session?.messages || [])].reverse()}
            inverted
            keyExtractor={(message) => message.id}
            renderItem={({ item }) => (
              <Bubble
                m={item}
                onRetry={item.isError ? () => retryMessage(item) : undefined}
                retryDisabled={sending}
              />
            )}
            contentContainerStyle={s.list}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              sending ? (
                <View style={s.typingRow}>
                  <View style={[s.avatar, { backgroundColor: c.primarySoft }]}>
                    <Image
                      source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
                      style={s.avatarImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View
                    style={[
                      s.typingCard,
                      { backgroundColor: c.card, borderColor: c.border },
                    ]}
                  >
                    <TypingIndicator color={c.primary} label={t("askChecking")} />
                    <Text style={[s.typingText, { color: c.mutedForeground }]}>
                      {t("askChecking")}
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            s.inputArea,
            {
              backgroundColor: c.background,
              borderTopColor: c.border,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          {isListening ? (
            <View style={[s.listeningBanner, { backgroundColor: c.primarySoft }]}>
              <View style={[s.listeningDot, { backgroundColor: c.primary }]} />
              <Text style={[s.listeningText, { color: c.primary }]}>
                Listening… speak your question
              </Text>
            </View>
          ) : null}

          <View
            style={[
              s.inputBox,
              {
                backgroundColor: c.card,
                borderColor: inputFocused || isListening ? c.primary : c.input,
              },
            ]}
          >
            <TextInput
              ref={input}
              testID="chat-input"
              value={text}
              onChangeText={setText}
              multiline
              placeholder={t("askPlaceholder")}
              placeholderTextColor={c.mutedForeground}
              returnKeyType="send"
              onSubmitEditing={() => void send()}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              accessibilityLabel={t("askPlaceholder")}
              style={[s.chatInput, { color: c.foreground }]}
            />

            <MotionPressable
              testID="voice-input"
              accessibilityRole="button"
              accessibilityLabel={
                isListening ? "Stop voice input" : "Start voice input"
              }
              onPress={() => void toggleListening()}
              style={[
                s.voiceButton,
                {
                  backgroundColor: isListening ? c.primary : c.muted,
                  borderColor: isListening ? c.primary : c.border,
                },
              ]}
            >
              <Feather
                name={isListening ? "mic-off" : "mic"}
                size={17}
                color={isListening ? c.primaryForeground : c.primary}
              />
            </MotionPressable>

            <MotionPressable
              testID="send-message"
              accessibilityRole="button"
              accessibilityLabel={t("askSend")}
              disabled={!canSend}
              onPress={() => void send()}
              style={[
                s.send,
                {
                  backgroundColor: c.primary,
                  opacity: canSend ? 1 : 0.35,
                },
              ]}
            >
              <Feather name="arrow-up" size={18} color={c.primaryForeground} />
            </MotionPressable>
          </View>

          <Text style={[s.disclaimer, { color: c.mutedForeground }]}>
            {t("askDisclaimer")}
          </Text>
        </View>
      </FadeInView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  topPlane: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  brandMarkWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  brandMark: {
    width: "100%",
    height: "100%",
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.72)",
    textTransform: "uppercase",
  },
  headerTitle: {
    marginTop: 2,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.3,
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerChip: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  emptyChat: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    marginBottom: 18,
  },
  bigIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bigIconImage: {
    width: 68,
    height: 68,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    textAlign: "center",
    marginTop: 16,
    letterSpacing: -0.2,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  suggestLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  prompt: {
    width: "100%",
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 9,
  },
  promptIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  promptText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  message: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 14,
  },
  user: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 30,
    height: 30,
  },
  bubbleCol: {
    maxWidth: "82%",
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderBottomLeftRadius: 6,
  },
  roleLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  messageText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 4,
  },
  timeUser: {
    textAlign: "right",
    marginRight: 4,
  },
  timeAssistant: {
    marginLeft: 4,
  },
  retry: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  retryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  sourcesBlock: {
    marginTop: 10,
  },
  sources: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  source: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  sourceIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceCopy: {
    flex: 1,
    minWidth: 0,
  },
  sourceText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  sourceType: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginTop: 1,
  },
  inlineLink: {
    fontFamily: "Inter_600SemiBold",
    textDecorationLine: "underline",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingVertical: 6,
  },
  typingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  inputArea: {
    paddingTop: 10,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  listeningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 8,
  },
  listeningDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  listeningText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  inputBox: {
    minHeight: 58,
    maxHeight: 130,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingLeft: 14,
    paddingRight: 7,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  chatInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 112,
    paddingTop: 13,
    paddingBottom: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  voiceButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    marginRight: 6,
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  disclaimer: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 6,
  },
});
