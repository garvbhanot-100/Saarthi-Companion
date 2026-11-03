import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";


import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/UI";
import {
  FadeInView,
  MotionPressable,
  TypingIndicator,
} from "@/components/Motion";
import { ChatMessage, useSaarthi } from "@/context/SaarthiContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguagesContext";
import type { TranslationKey } from "@/constants/translations";
import type { OfficialLinkType } from "@/data/services";
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

const openOfficialUrl = (url: string) => {
  if (!isSafeHttpUrl(url)) return;
  Linking.openURL(url).catch((error) => {
    console.warn("Could not open official link:", error);
  });
};

const PROMPT_KEYS: { id: string; key: PromptKey }[] = [
  { id: "pan", key: "askPromptPan" },
  { id: "scholarship", key: "askPromptScholarship" },
  { id: "aadhaar", key: "askPromptAadhaar" },
];

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
      <View
        style={[
          s.avatar,
          { backgroundColor: isUser ? c.primary : c.primarySoft },
        ]}
      >
        {isUser ? (
          <Feather name="user" size={18} color={c.foreground} />
        ) : (
          <Image
            source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        )}
      </View>

      <View
        style={[
          s.bubble,
          {
            backgroundColor: isUser ? c.primary : c.card,
            borderColor: m.isError
              ? c.destructive
              : isUser
                ? c.primary
                : c.border,
          },
        ]}
      >
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
          <>
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
                  style={[s.source, { backgroundColor: c.primarySoft }]}
                >
                  <Feather name="external-link" size={13} color={c.primary} />
                  <Text
                    numberOfLines={1}
                    style={[s.sourceText, { color: c.primary }]}
                  >
                    {source.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[s.sourceType, { color: c.mutedForeground }]}
                  >
                    {typeLabel}
                  </Text>
                </MotionPressable>
              );
            })}
          </>
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
                opacity: retryDisabled ? 0.35 : 1,
              },
            ]}
          >
            <Feather name="rotate-ccw" size={15} color={c.primary} />
          </MotionPressable>
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

  const [isListening,setIsListening]=useState(false);

  const session = useMemo(
    () => chats.find((chat) => chat.id === sid),
    [chats, sid],
  );

  const input = useRef<TextInput>(null);
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

  // Follow chats opened from the Profile tab while this screen stays mounted.
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior="padding"
    >
      <FadeInView style={{ flex: 1, paddingTop: insets.top }}>
        <View style={s.header}>
          <View style={s.headerText}>
            <Text style={[s.eyebrow, { color: c.primary }]}>
              {t("heroEyebrow")}
            </Text>
            <Text style={[s.headerTitle, { color: c.foreground }]}>
              {t("ask")}
            </Text>
          </View>

          <View style={s.headerActions}>
            <IconButton
              icon="trash-2"
              label={t("clearChat")}
              onPress={() => sid && clearChat(sid)}
            />
            <IconButton
              icon="plus"
              label={t("profileNewConversation")}
              onPress={newChat}
            />
          </View>
        </View>

        {!session?.messages.length && !sending ? (
          <View style={s.emptyChat}>
            <View style={[s.bigIcon, { backgroundColor: c.primarySoft }]}>
              <Image
                source={require("../../assets/images/images-2/Saarthi-AI Images.jpeg")}
                style={{ width: 38, height: 38, borderRadius: 12 }}
                resizeMode="contain"
              />
            </View>

            <Text style={[s.emptyTitle, { color: c.foreground }]}>
              {t("askEmptyTitle")}
            </Text>

            <Text style={[s.emptyBody, { color: c.mutedForeground }]}>
              {t("askEmptyDescription")}
            </Text>

            {PROMPT_KEYS.map((prompt) => (
              <MotionPressable
                key={prompt.id}
                onPress={() => setText(t(prompt.key))}
                style={[
                  s.prompt,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
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
                <View style={s.typing}>
                  <TypingIndicator color={c.primary} label={t("askChecking")} />
                  <Text style={[s.typingText, { color: c.mutedForeground }]}>
                    {t("askChecking")}
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            s.inputArea,
            {
              borderTopColor: c.border,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          <View
            style={[
              s.inputBox,
              { backgroundColor: c.card, borderColor: c.input },
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
              accessibilityLabel={t("askPlaceholder")}
              style={[s.chatInput, { color: c.foreground }]}
            />

            <MotionPressable
  testID="voice-input"
  accessibilityRole="button"
  accessibilityLabel={isListening ? "Stop voice input" : "Start voice input"}
  onPress={() => void toggleListening()}
  style={[
    s.voiceButton,
    {
      backgroundColor: isListening ? c.primarySoft : c.background,
      borderColor: c.border,
    },
  ]}
>
  <Feather
    name={isListening ? "mic-off" : "mic"}
    size={18}
    color={c.primary}
  />
</MotionPressable>

            <MotionPressable
              testID="send-message"
              accessibilityRole="button"
              accessibilityLabel={t("askSend")}
              disabled={!text.trim() || sending}
              onPress={() => void send()}
              style={[
                s.send,
                {
                  backgroundColor: c.primary,
                  opacity: !text.trim() || sending ? 0.35 : 1,
                },
              ]}
            >
              <Feather name="arrow-up" size={19} color={c.primaryForeground} />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.4,
    marginTop: 5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 30,
  },
  bigIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 21,
    textAlign: "center",
    marginTop: 18,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 26,
  },
  prompt: {
    width: "100%",
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  promptText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
    paddingRight: 12,
  },
  list: {
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 18,
  },
  message: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 11,
  },
  user: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
    shadowColor: "#172b4d",
    shadowOpacity: 0.045,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  messageText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  retry: {
    alignSelf: "flex-start",
    width: 32,
    height: 32,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sources: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 10,
  },
  source: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  sourceText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    flexShrink: 1,
  },
  sourceType: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    marginLeft: "auto",
    paddingLeft: 6,
  },
  inlineLink: {
    fontFamily: "Inter_600SemiBold",
    textDecorationLine: "underline",
  },
  typing: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 47,
  },
  typingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  inputArea: {
    paddingTop: 11,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  inputBox: {
    minHeight: 60,
    maxHeight: 130,
    borderRadius: 20,
    borderWidth: 1,
    paddingLeft: 15,
    paddingRight: 7,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    paddingTop: 13,
    paddingBottom: 11,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },

  voiceButton: {
  width: 40,
  height: 40,
  borderRadius: 14,
  borderWidth: 1,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
  marginRight: 6,
},
});
