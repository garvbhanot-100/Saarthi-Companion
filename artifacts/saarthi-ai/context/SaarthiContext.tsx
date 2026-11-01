import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
export interface UserProfile {
  name: string;
  email: string;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: { label: string; url: string }[];
  isError?: boolean;
}
export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}
interface ContextValue {
  hydrated: boolean;
  user: UserProfile | null;
  savedServiceIds: string[];
  chats: ChatSession[];
  activeChatId: string | null;
  signUp: (profile: UserProfile) => Promise<void>;
  logIn: (email: string) => Promise<boolean>;
  logOut: () => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  startNewChat: () => string;
  appendMessage: (
    chatId: string,
    message: Omit<ChatMessage, "id" | "createdAt">,
  ) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  clearChat: (id: string) => void;
  deleteChat: (id: string) => void;
  openChat: (id: string) => void;
}
const KEYS = {
  user: "@saarthi/user",
  saved: "@saarthi/saved",
  chats: "@saarthi/chats",
};
const id = (prefix: string) =>
  prefix +
  "-" +
  Date.now().toString() +
  "-" +
  Math.random().toString(36).slice(2, 8);
const Context = createContext<ContextValue | null>(null);
export function SaarthiProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false),
    [user, setUser] = useState<UserProfile | null>(null),
    [savedServiceIds, setSaved] = useState<string[]>([]),
    [chats, setChats] = useState<ChatSession[]>([]),
    [activeChatId, setActive] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    Promise.all([
      AsyncStorage.getItem(KEYS.user),
      AsyncStorage.getItem(KEYS.saved),
      AsyncStorage.getItem(KEYS.chats),
    ])
      .then(([u, s, c]) => {
        if (!mounted) return;
        try {
          if (u) setUser(JSON.parse(u));
          if (s) setSaved(JSON.parse(s));
          if (c) setChats(JSON.parse(c));
        } catch {}
        setHydrated(true);
      })
      .catch(() => mounted && setHydrated(true));
    return () => {
      mounted = false;
    };
  }, []);
  const signUp = useCallback(async (profile: UserProfile) => {
    const next = {
      name: profile.name.trim(),
      email: profile.email.trim().toLowerCase(),
    };
    setUser(next);
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(next));
  }, []);
  const logIn = useCallback(
    async (email: string) => {
      if (!user || user.email !== email.trim().toLowerCase()) return false;
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
      return true;
    },
    [user],
  );
  const logOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(KEYS.user);
  }, []);
  const toggleSaved = useCallback(async (serviceId: string) => {
    setSaved((current) => {
      const next = current.includes(serviceId)
        ? current.filter((x) => x !== serviceId)
        : [...current, serviceId];
      AsyncStorage.setItem(KEYS.saved, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
  }, []);
  const startNewChat = useCallback(() => {
    const chatId = id("chat"),
      now = new Date().toISOString();
    setChats((current) => [
      { id: chatId, title: "New conversation", updatedAt: now, messages: [] },
      ...current,
    ]);
    setActive(chatId);
    return chatId;
  }, []);
  const appendMessage = useCallback(
    (chatId: string, message: Omit<ChatMessage, "id" | "createdAt">) => {
      setChats((current) => {
        const next = current.map((chat) => {
          if (chat.id !== chatId) return chat;
          const messages = [
            ...chat.messages,
            {
              ...message,
              id: id("message"),
              createdAt: new Date().toISOString(),
            },
          ];
          const first = messages.find((x) => x.role === "user");
          return {
            ...chat,
            title: first ? first.content.slice(0, 38) : chat.title,
            updatedAt: new Date().toISOString(),
            messages,
          };
        });
        AsyncStorage.setItem(KEYS.chats, JSON.stringify(next)).catch(
          () => undefined,
        );
        return next;
      });
    },
    [],
  );
  const removeMessage = useCallback((chatId: string, messageId: string) => {
    setChats((current) => {
      const next = current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.filter(
                (message) => message.id !== messageId,
              ),
              updatedAt: new Date().toISOString(),
            }
          : chat,
      );
      AsyncStorage.setItem(KEYS.chats, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
  }, []);
  const clearChat = useCallback((chatId: string) => {
    setChats((current) => {
      const next = current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: "New conversation",
              messages: [],
              updatedAt: new Date().toISOString(),
            }
          : chat,
      );
      AsyncStorage.setItem(KEYS.chats, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
  }, []);
  const deleteChat = useCallback((chatId: string) => {
    setChats((current) => {
      const next = current.filter((chat) => chat.id !== chatId);
      AsyncStorage.setItem(KEYS.chats, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
    setActive((current) => (current === chatId ? null : current));
  }, []);
  const value = useMemo(
    () => ({
      hydrated,
      user,
      savedServiceIds,
      chats,
      activeChatId,
      signUp,
      logIn,
      logOut,
      toggleSaved,
      startNewChat,
      appendMessage,
      removeMessage,
      clearChat,
      deleteChat,
      openChat: (chatId: string) => setActive(chatId),
    }),
    [
      hydrated,
      user,
      savedServiceIds,
      chats,
      activeChatId,
      signUp,
      logIn,
      logOut,
      toggleSaved,
      startNewChat,
      appendMessage,
      removeMessage,
      clearChat,
      deleteChat,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSaarthi() {
  const value = useContext(Context);
  if (!value) throw new Error("useSaarthi must be used within SaarthiProvider");
  return value;
}
