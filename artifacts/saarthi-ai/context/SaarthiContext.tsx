import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { OfficialLinkType } from "@/data/services";
import {
  isPremiumPlan,
  type UserPlan,
  canAccessService,
} from "@/constants/subscription";
import {
  isRemoteDataEnabled,
  readSessionToken,
  remoteFetchState,
  remoteLogin,
  remoteLogout,
  remotePushChats,
  remotePushSaved,
  remoteSignUp,
  remoteUpdateProfile,
  remoteUpgradePremium,
  subscribeRemoteState,
} from "@/services/saarthiRemote";

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
  plan: UserPlan;
  isPremium: boolean;
  savedServiceIds: string[];
  chats: ChatSession[];
  activeChatId: string | null;
  signUp: (profile: UserProfile, password?: string) => Promise<void>;
  logIn: (
    email: string,
    password?: string,
    profile?: UserProfile,
  ) => Promise<boolean>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  logOut: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
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

const id = (prefix: string) =>
  prefix +
  "-" +
  Date.now().toString() +
  "-" +
  Math.random().toString(36).slice(2, 8);

const Context = createContext<ContextValue | null>(null);

export function SaarthiProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<UserPlan>("free");
  const [savedServiceIds, setSaved] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActive] = useState<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const applyRemoteState = useCallback(
    (state: {
      user: UserProfile;
      plan: UserPlan;
      savedServiceIds: string[];
      chats: ChatSession[];
    }) => {
      setUser(state.user);
      setPlan(state.plan);
      setSaved(state.savedServiceIds);
      setChats(state.chats);
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      if (!isRemoteDataEnabled()) {
        if (mounted) {
          setHydrationError(
            "Set EXPO_PUBLIC_API_URL to your live API server so profile and chats stay in real time.",
          );
          setHydrated(true);
        }
        return;
      }

      try {
        const token = await readSessionToken();
        if (!token) {
          if (mounted) setHydrated(true);
          return;
        }
        const state = await remoteFetchState(token);
        if (!mounted) return;
        if (!state) {
          sessionTokenRef.current = null;
          setSessionToken(null);
          setHydrated(true);
          return;
        }
        sessionTokenRef.current = state.sessionToken;
        setSessionToken(state.sessionToken);
        applyRemoteState(state);
        setHydrated(true);
      } catch (error) {
        console.error("Could not load Saarthi cloud data:", error);
        if (mounted) {
          setHydrationError("Could not reach the live Saarthi server.");
          setHydrated(true);
        }
      }
    }

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [applyRemoteState]);

  useEffect(() => {
    if (!sessionToken) return undefined;
    return subscribeRemoteState(sessionToken, applyRemoteState);
  }, [sessionToken, applyRemoteState]);

  const signUp = useCallback(async (profile: UserProfile, password?: string) => {
    const result = await remoteSignUp(profile, password);
    sessionTokenRef.current = result.sessionToken;
    setSessionToken(result.sessionToken);
    applyRemoteState(result);
  }, [applyRemoteState]);

  const logIn = useCallback(
    async (email: string, password?: string, profile?: UserProfile) => {
      try {
        const result = await remoteLogin(email, password, profile);
        sessionTokenRef.current = result.sessionToken;
        setSessionToken(result.sessionToken);
        applyRemoteState(result);
        return true;
      } catch (error) {
        console.error("Login failed:", error);
        if (
          error instanceof Error &&
          error.message === "GOOGLE_EMAIL_NOT_ALLOWED"
        ) {
          throw error;
        }
        return false;
      }
    },
    [applyRemoteState],
  );

  const updateProfile = useCallback(
    async (profile: UserProfile) => {
      const token = sessionTokenRef.current;
      if (!token) throw new Error("Not signed in.");
      const next = await remoteUpdateProfile(token, profile);
      applyRemoteState({
        user: next.user,
        plan: next.plan,
        savedServiceIds: next.savedServiceIds,
        chats: next.chats,
      });
    },
    [applyRemoteState],
  );

  const upgradeToPremium = useCallback(async () => {
    const token = sessionTokenRef.current;
    if (!token) throw new Error("Not signed in.");
    const next = await remoteUpgradePremium(token);
    applyRemoteState(next);
  }, [applyRemoteState]);

  const logOut = useCallback(async () => {
    const token = sessionTokenRef.current;
    if (token) await remoteLogout(token);
    sessionTokenRef.current = null;
    setSessionToken(null);
    setUser(null);
    setPlan("free");
    setSaved([]);
    setChats([]);
    setActive(null);
  }, []);

  const toggleSaved = useCallback(async (serviceId: string) => {
    const token = sessionTokenRef.current;
    if (!token) return;
    if (!canAccessService(serviceId, plan)) return;
    let next: string[] = [];
    setSaved((current) => {
      next = current.includes(serviceId)
        ? current.filter((x) => x !== serviceId)
        : [...current, serviceId];
      return next;
    });
    try {
      await remotePushSaved(token, next);
    } catch (error) {
      console.error("Could not sync saved services:", error);
    }
  }, [plan]);

  const persistChats = useCallback(async (next: ChatSession[]) => {
    const token = sessionTokenRef.current;
    if (!token) return;
    try {
      await remotePushChats(token, next);
    } catch (error) {
      console.error("Could not sync chats:", error);
    }
  }, []);

  const startNewChat = useCallback(() => {
    const chatId = id("chat");
    const now = new Date().toISOString();
    setChats((current) => {
      const next = [
        { id: chatId, title: "New conversation", updatedAt: now, messages: [] },
        ...current,
      ];
      void persistChats(next);
      return next;
    });
    setActive(chatId);
    return chatId;
  }, [persistChats]);

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
        void persistChats(next);
        return next;
      });
    },
    [persistChats],
  );

  const removeMessage = useCallback(
    (chatId: string, messageId: string) => {
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
        void persistChats(next);
        return next;
      });
    },
    [persistChats],
  );

  const clearChat = useCallback(
    (chatId: string) => {
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
        void persistChats(next);
        return next;
      });
    },
    [persistChats],
  );

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((current) => {
        const next = current.filter((chat) => chat.id !== chatId);
        void persistChats(next);
        return next;
      });
      setActive((current) => (current === chatId ? null : current));
    },
    [persistChats],
  );

  const isPremium = isPremiumPlan(plan);

  const value = useMemo(
    () => ({
      hydrated,
      hydrationError,
      user,
      plan,
      isPremium,
      savedServiceIds,
      chats,
      activeChatId,
      signUp,
      logIn,
      updateProfile,
      logOut,
      upgradeToPremium,
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
      plan,
      isPremium,
      savedServiceIds,
      chats,
      activeChatId,
      signUp,
      logIn,
      updateProfile,
      logOut,
      upgradeToPremium,
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
