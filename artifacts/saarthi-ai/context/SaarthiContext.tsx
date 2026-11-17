import { getClerkInstance } from "@clerk/expo";
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
import { openRazorpayCheckout } from "@/services/razorpayCheckout";
import { isClerkConfigured } from "@/constants/clerk";
import {
  clearClerkLocalProfile,
  saveClerkLocalProfile,
} from "@/services/clerkLocalProfile";
import {
  clearGuestSession,
  createGuestProfile,
  readGuestSession,
  saveGuestSession,
} from "@/services/guestSession";
import {
  isRemoteDataEnabled,
  readSessionToken,
  remoteClerkSession,
  remoteCreatePremiumOrder,
  remoteFetchState,
  remoteLogin,
  remoteLogout,
  remotePushChats,
  remotePushSaved,
  remoteSignUp,
  remotePremiumOrderStatus,
  remoteUpdateProfile,
  remoteVerifyPremiumPayment,
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
  isGuest: boolean;
  clerkBridgePaused: boolean;
  enterGuestSession: (displayName?: string) => void;
  signUp: (profile: UserProfile, password?: string) => Promise<void>;
  logIn: (
    email: string,
    password?: string,
    profile?: UserProfile,
  ) => Promise<boolean>;
  /** After Clerk OAuth or email auth — enter app; cloud sync is optional. */
  completeClerkSession: (profile: UserProfile, mode: "login" | "signup") => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  logOut: () => Promise<void>;
  /**
   * Opens Razorpay checkout for Premium. Resolves "success" only after the
   * backend has verified the payment; "cancelled" if the user closed checkout.
   * Throws on failure.
   */
  upgradeToPremium: () => Promise<"success" | "cancelled">;
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
  const [isGuest, setIsGuest] = useState(false);
  const [clerkBridgePaused, setClerkBridgePaused] = useState(false);
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
      if (isClerkConfigured) {
        try {
          const guestProfile = await readGuestSession();
          if (mounted && guestProfile) {
            setUser(guestProfile);
            setIsGuest(true);
          }
        } catch {
          // ignore
        }
        if (mounted) {
          setHydrationError(null);
          setHydrated(true);
        }
        return;
      }

      if (!isRemoteDataEnabled()) {
        if (mounted) {
          setHydrationError(null);
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
          setHydrationError(null);
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

  const clerkExchangeRef = useRef<{
    email: string;
    ticket: object;
    promise: Promise<string | null>;
  } | null>(null);
  /** Email of the account the current API session token belongs to. */
  const apiSessionEmailRef = useRef<string | null>(null);
  /** Bumped on logout / account switch so late exchange results are discarded. */
  const authGenerationRef = useRef(0);

  /** Drops the API session and every piece of per-account data held in memory. */
  const resetAccountState = useCallback(() => {
    authGenerationRef.current += 1;
    clerkExchangeRef.current = null;
    const oldToken = sessionTokenRef.current;
    sessionTokenRef.current = null;
    apiSessionEmailRef.current = null;
    setSessionToken(null);
    setPlan("free");
    setSaved([]);
    setChats([]);
    setActive(null);
    return oldToken;
  }, []);

  /**
   * Gets a Saarthi API session for the signed-in Clerk user (the API verifies
   * the Clerk token server-side). Needed for payments and cloud sync.
   * The session is always bound to the Clerk account currently signed in.
   */
  const ensureClerkApiSession = useCallback(
    (profile: UserProfile): Promise<string | null> => {
      const email = profile.email.trim().toLowerCase();
      if (sessionTokenRef.current && apiSessionEmailRef.current === email) {
        return Promise.resolve(sessionTokenRef.current);
      }
      if (sessionTokenRef.current) {
        // A different Clerk account signed in: never reuse the old session or data.
        const oldToken = resetAccountState();
        if (oldToken) {
          void remoteLogout(oldToken).catch(() => undefined);
        }
      }
      if (!isRemoteDataEnabled()) return Promise.resolve(null);
      if (clerkExchangeRef.current?.email === email) {
        return clerkExchangeRef.current.promise;
      }
      const generation = authGenerationRef.current;
      const ticket = {};
      const promise = (async () => {
        try {
          const clerkToken = await getClerkInstance()?.session?.getToken();
          if (!clerkToken) return null;
          const result = await remoteClerkSession(clerkToken, profile.name);
          if (
            generation !== authGenerationRef.current ||
            result.user.email.trim().toLowerCase() !== email
          ) {
            // Logged out / switched account meanwhile, or token belongs to
            // someone else: discard this session instead of applying it.
            void remoteLogout(result.sessionToken).catch(() => undefined);
            return null;
          }
          sessionTokenRef.current = result.sessionToken;
          apiSessionEmailRef.current = email;
          setSessionToken(result.sessionToken);
          applyRemoteState(result);
          return result.sessionToken;
        } catch (error) {
          console.warn(
            "Could not start API session from Clerk:",
            error instanceof Error ? error.message : "unknown error",
          );
          return null;
        } finally {
          if (clerkExchangeRef.current?.ticket === ticket) {
            clerkExchangeRef.current = null;
          }
        }
      })();
      clerkExchangeRef.current = { email, ticket, promise };
      return promise;
    },
    [applyRemoteState, resetAccountState],
  );

  const completeClerkSession = useCallback(
    (profile: UserProfile, _mode: "login" | "signup") => {
      setIsGuest(false);
      void clearGuestSession();
      setUser(profile);
      void saveClerkLocalProfile(profile);
      void ensureClerkApiSession(profile);
    },
    [ensureClerkApiSession],
  );

  const enterGuestSession = useCallback((displayName?: string) => {
    const profile = createGuestProfile(displayName?.trim() || "Guest");
    setIsGuest(true);
    setUser(profile);
    void saveGuestSession(profile);
  }, []);

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
        return false;
      }
    },
    [applyRemoteState],
  );

  const updateProfile = useCallback(
    async (profile: UserProfile) => {
      if (isClerkConfigured && !sessionTokenRef.current) {
        setUser(profile);
        if (isGuest) {
          await saveGuestSession(profile);
        } else {
          await saveClerkLocalProfile(profile);
        }
        return;
      }
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
    [applyRemoteState, isGuest],
  );

  const refreshRemoteState = useCallback(
    async (token: string) => {
      const fresh = await remoteFetchState(token);
      if (fresh) applyRemoteState(fresh);
    },
    [applyRemoteState],
  );

  const upgradeToPremium = useCallback(async (): Promise<
    "success" | "cancelled"
  > => {
    let token = sessionTokenRef.current;
    if (!token && isClerkConfigured && user && !isGuest) {
      token = await ensureClerkApiSession(user);
    }
    if (!token) throw new Error("NOT_SIGNED_IN");

    let order;
    try {
      order = await remoteCreatePremiumOrder(token);
    } catch (error) {
      if (error instanceof Error && error.message === "ALREADY_PREMIUM") {
        await refreshRemoteState(token);
        return "success";
      }
      throw error;
    }

    const checkout = await openRazorpayCheckout({
      keyId: order.keyId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      description: "Sartva Premium — 30 days",
      prefill: user ? { name: user.name, email: user.email } : undefined,
      themeColor: "#4F46E5",
    });

    // Premium is never granted from the checkout callback alone: either the
    // backend verifies the signature now, or the webhook already marked it paid.
    const confirmedByServer = async () => {
      try {
        const status = await remotePremiumOrderStatus(token, order.orderId);
        if (status === "paid") {
          await refreshRemoteState(token);
          return true;
        }
      } catch {
        /* treat as not confirmed */
      }
      return false;
    };

    if (checkout.kind === "success") {
      try {
        const next = await remoteVerifyPremiumPayment(token, {
          orderId: checkout.orderId,
          paymentId: checkout.paymentId,
          signature: checkout.signature,
        });
        applyRemoteState(next);
        return "success";
      } catch (error) {
        if (await confirmedByServer()) return "success";
        throw error;
      }
    }

    if (await confirmedByServer()) return "success";
    if (checkout.kind === "cancelled") return "cancelled";
    throw new Error("PAYMENT_FAILED");
  }, [applyRemoteState, ensureClerkApiSession, isGuest, refreshRemoteState, user]);

  const logOut = useCallback(async () => {
    setClerkBridgePaused(true);
    try {
      // Clear the API session and per-account data first, so nothing from this
      // account (or a still-running Clerk exchange) leaks into the next one.
      const token = resetAccountState();
      if (token) {
        // Also ends the API session created from a Clerk sign-in.
        await remoteLogout(token).catch(() =>
          console.warn("API logout failed; local session cleared anyway."),
        );
      }
      if (isClerkConfigured) {
        try {
          const clerk = getClerkInstance();
          if (clerk) {
            await clerk.signOut();
          }
        } catch (error) {
          console.warn("Clerk sign-out:", error);
        }
      }
      await clearClerkLocalProfile();
      await clearGuestSession();
      sessionTokenRef.current = null;
      setSessionToken(null);
      setIsGuest(false);
      setUser(null);
      setPlan("free");
      setSaved([]);
      setChats([]);
      setActive(null);
    } finally {
      setClerkBridgePaused(false);
    }
  }, [resetAccountState]);

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
      isGuest,
      clerkBridgePaused,
      enterGuestSession,
      signUp,
      logIn,
      completeClerkSession,
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
      isGuest,
      clerkBridgePaused,
      enterGuestSession,
      signUp,
      logIn,
      completeClerkSession,
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
