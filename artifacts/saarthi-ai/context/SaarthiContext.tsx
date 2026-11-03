import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { OfficialLinkType } from "@/data/services";
export interface UserProfile {
  name: string;
  email: string;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: { label: string; url: string; type?: OfficialLinkType }[];
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
  hydrationError: string | null;
  user: UserProfile | null;
  savedServiceIds: string[];
  chats: ChatSession[];
  activeChatId: string | null;
  signUp: (profile: UserProfile, password?: string) => Promise<void>;
  logIn: (
    email: string,
    password?: string,
    profile?: UserProfile,
  ) => Promise<boolean>;
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
  // Signed-in session. Cleared on sign out.
  user: "@saarthi/user",
  // Account registered on this device. Kept on sign out so the user can log in again.
  account: "@saarthi/account",
  localCredential: "saarthi-local-credential",
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
    [hydrationError, setHydrationError] = useState<string | null>(null),
    [user, setUser] = useState<UserProfile | null>(null),
    [account, setAccount] = useState<UserProfile | null>(null),
    [savedServiceIds, setSaved] = useState<string[]>([]),
    [chats, setChats] = useState<ChatSession[]>([]),
    [activeChatId, setActive] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    Promise.all([
      AsyncStorage.getItem(KEYS.user),
      AsyncStorage.getItem(KEYS.account),
      AsyncStorage.getItem(KEYS.saved),
      AsyncStorage.getItem(KEYS.chats),
    ])
      .then(([u, a, s, c]) => {
        if (!mounted) return;
        let failedToRead = false;
        const parseStored = <T,>(
          raw: string | null,
          key: string,
          setValue: (value: T) => void,
        ) => {
          if (!raw) return;
          try {
            setValue(JSON.parse(raw) as T);
          } catch (error) {
            failedToRead = true;
            console.error(`Could not parse saved Saarthi data (${key}):`, error);
          }
        };
        let storedUser: UserProfile | null = null;
        parseStored<UserProfile>(u, KEYS.user, (value) => {
          storedUser = value;
          setUser(value);
        });
        let storedAccount: UserProfile | null = null;
        parseStored<UserProfile>(a, KEYS.account, (value) => {
          storedAccount = value;
        });
        // Profiles saved before accounts were tracked separately.
        if (!storedAccount && storedUser) {
          storedAccount = storedUser;
          AsyncStorage.setItem(KEYS.account, JSON.stringify(storedUser)).catch(
            () => undefined,
          );
        }
        setAccount(storedAccount);
        parseStored<string[]>(s, KEYS.saved, setSaved);
        parseStored<ChatSession[]>(c, KEYS.chats, setChats);
        if (failedToRead) {
          setHydrationError("Some saved profile data could not be loaded.");
        }
        setHydrated(true);
      })
      .catch((error) => {
        console.error("Could not load saved Saarthi data:", error);
        if (mounted) {
          setHydrationError("Saved profile data could not be loaded.");
          setHydrated(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);
  const signUp = useCallback(
    async (profile: UserProfile, password?: string) => {
      const next = {
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
      };
      if (password) {
        const salt = Crypto.randomUUID();
        const passwordHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${salt}:${password}`,
        );
        await SecureStore.setItemAsync(
          KEYS.localCredential,
          JSON.stringify({ email: next.email, salt, passwordHash }),
        );
      } else if (account?.email !== next.email) {
        await SecureStore.deleteItemAsync(KEYS.localCredential);
      }
      await AsyncStorage.multiSet([
        [KEYS.account, JSON.stringify(next)],
        [KEYS.user, JSON.stringify(next)],
      ]);
      setAccount(next);
      setUser(next);
    },
    [account],
  );
  const logIn = useCallback(
    async (email: string, password?: string, profile?: UserProfile) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (profile !== undefined) {
        // Google has already verified this email address.
        const sameAccount = account?.email === normalizedEmail;
        if (!sameAccount) {
          await SecureStore.deleteItemAsync(KEYS.localCredential);
        }
        const next = {
          name:
            profile.name.trim() || (sameAccount ? account.name : ""),
          email: normalizedEmail,
        };
        await AsyncStorage.multiSet([
          [KEYS.account, JSON.stringify(next)],
          [KEYS.user, JSON.stringify(next)],
        ]);
        setAccount(next);
        setUser(next);
        return true;
      }
      if (!account || account.email !== normalizedEmail) return false;
      if (!password) return false;
      const rawCredential = await SecureStore.getItemAsync(
        KEYS.localCredential,
      );
      if (!rawCredential) return false;
      let credential: {
        email: string;
        salt: string;
        passwordHash: string;
      };
      try {
        credential = JSON.parse(rawCredential);
      } catch (error) {
        console.error("Could not parse the saved local credential:", error);
        return false;
      }
      if (
        credential.email !== normalizedEmail ||
        !credential.salt ||
        !credential.passwordHash
      ) {
        return false;
      }
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${credential.salt}:${password}`,
      );
      if (passwordHash !== credential.passwordHash) return false;
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(account));
      setUser(account);
      return true;
    },
    [account],
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
      hydrationError,
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
      hydrationError,
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
