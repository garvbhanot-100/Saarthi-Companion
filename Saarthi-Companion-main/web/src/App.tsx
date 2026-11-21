import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AdminSignIn } from "./AdminSignIn";
import { ClerkSignOut } from "./ClerkSignOut";
import {
  DEFAULT_ADMIN_EMAIL,
  fetchUserDetail,
  fetchUsers,
  subscribeAdminUsers,
  type AdminCredentials,
  type AdminUserRow,
  type UserDetail,
} from "./api";
import { isAllowedAdminEmail, isClerkAdminEnabled } from "./clerkConfig";

const STORAGE_KEY = "saarthi-admin-session";

function formatWhen(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function initials(name: string, email: string) {
  const src = (name || email).trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

function ClerkSessionBridge({
  onClerkCreds,
  onError,
}: {
  onClerkCreds: (creds: AdminCredentials | null) => void;
  onError: (message: string) => void;
}) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      onClerkCreds(null);
      return;
    }
    const email =
      user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? "";
    if (!email || !isAllowedAdminEmail(email)) {
      void signOut();
      onClerkCreds(null);
      onError(
        "This Google account is not authorized for admin. Use an approved admin email.",
      );
      return;
    }
    onClerkCreds({ email, getClerkToken: () => getToken() });
    onError("");
  }, [isLoaded, isSignedIn, user, getToken, signOut, onClerkCreds, onError]);

  return null;
}

function loadStoredCreds(): AdminCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminCredentials;
    if (!parsed.email || !parsed.password) return null;
    return { email: parsed.email, password: parsed.password };
  } catch {
    return null;
  }
}

export default function App() {
  const [clerkCreds, setClerkCreds] = useState<AdminCredentials | null>(null);
  const [passwordCreds, setPasswordCreds] = useState<AdminCredentials | null>(
    () => (isClerkAdminEnabled ? null : loadStoredCreds()),
  );
  const adminCreds = clerkCreds ?? passwordCreds;
  const [draftEmail, setDraftEmail] = useState(
    () => loadStoredCreds()?.email ?? DEFAULT_ADMIN_EMAIL,
  );
  const [draftPassword, setDraftPassword] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    const email = draftEmail.trim().toLowerCase();
    const password = draftPassword;
    if (!email || !password) return;
    const creds = { email, password };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setPasswordCreds(creds);
    setError(null);
  }, [draftEmail, draftPassword]);

  useEffect(() => {
    if (!adminCreds) return;
    let active = true;

    fetchUsers(adminCreds)
      .then((rows) => {
        if (active) {
          setUsers(rows);
          setConnected(true);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "Invalid credentials or the API server is unreachable. Check your password and ensure the backend is running.",
          );
          setConnected(false);
        }
      });

    const unsubscribe = subscribeAdminUsers(adminCreds, (rows) => {
      setUsers(rows);
      setConnected(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [adminCreds]);

  const loadDetail = async (userId: string) => {
    if (!adminCreds) return;
    setSelectedId(userId);
    try {
      const data = await fetchUserDetail(adminCreds, userId);
      setDetail(data);
      setError(null);
    } catch {
      setError("Could not load this user's data.");
    }
  };

  const stats = useMemo(() => {
    const logins = users.filter((u) => u.lastLoginAt).length;
    const messages = users.reduce((n, u) => n + u.messageCount, 0);
    return { total: users.length, logins, messages };
  }, [users]);

  const signOutAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setClerkCreds(null);
    setPasswordCreds(null);
    setDraftEmail(DEFAULT_ADMIN_EMAIL);
    setDraftPassword("");
    setUsers([]);
    setDetail(null);
    setError(null);
    setConnected(false);
  }, []);

  if (!adminCreds) {
    return (
      <>
        {isClerkAdminEnabled ? (
          <ClerkSessionBridge onClerkCreds={setClerkCreds} onError={setError} />
        ) : null}
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md relative">
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/40 via-sky-500/20 to-violet-500/30 blur-sm" />
          <Panel className="relative w-full p-8 border-slate-700/50">
            <BrandMark />
            <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
              Sartva Admin
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Sign in to view users, profiles, saved services, and chats — all
              synced in real time from the API.
            </p>

            {isClerkAdminEnabled ? (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
                  Continue with Google
                </p>
                <AdminSignIn />
                <hr className="border-slate-700/60 my-6" />
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
                  Or admin password
                </p>
              </>
            ) : null}

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin email
            </label>
            <input
              type="email"
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-2.5 text-white mb-4 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
              placeholder={DEFAULT_ADMIN_EMAIL}
              autoComplete="username"
            />
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin password
            </label>
            <input
              type="password"
              value={draftPassword}
              onChange={(e) => setDraftPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              className="w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-2.5 text-white mb-6 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
              placeholder="Your SAARTHI_ADMIN_PASSWORD"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={connect}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 font-semibold text-white shadow-lg shadow-emerald-950/40 transition"
            >
              Connect to dashboard
            </button>
          </Panel>
        </div>
      </div>
      </>
    );
  }

  return (
  <>
    {isClerkAdminEnabled ? (
      <ClerkSessionBridge onClerkCreds={setClerkCreds} onError={setError} />
    ) : null}
    <div className="min-h-screen p-4 md:p-8 pb-12">
      <header className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex items-start gap-4">
          <BrandMark size="sm" />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Sartva Admin Panel
            </h1>
            <p className="text-slate-400 text-sm mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge connected={connected} />
              <span className="text-slate-500">
                Real-time user activity &amp; conversation data
              </span>
            </p>
          </div>
        </div>
        {isClerkAdminEnabled && clerkCreds ? (
          <ClerkSignOut onDone={signOutAll} />
        ) : (
          <button
            type="button"
            onClick={signOutAll}
            className="text-sm text-slate-300 hover:text-white border border-slate-600/80 hover:border-slate-500 rounded-xl px-4 py-2.5 bg-slate-900/40 backdrop-blur transition"
          >
            Sign out
          </button>
        )}
      </header>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-amber-100 text-sm">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat
          label="Total users"
          value={stats.total}
          accent="emerald"
          hint="Registered accounts"
        />
        <Stat
          label="Active logins"
          value={stats.logins}
          accent="sky"
          hint="Users who signed in at least once"
        />
        <Stat
          label="Messages"
          value={stats.messages}
          accent="violet"
          hint="Across all conversations"
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/20">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Users</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-800/80 rounded-full px-2.5 py-0.5">
              {users.length}
            </span>
          </div>
          <Panel
            as="ul"
            className="p-0 max-h-[70vh] overflow-y-auto border-0 rounded-none bg-transparent shadow-none"
          >
            {users.length === 0 ? (
              <li className="p-10 text-center">
                <EmptyIcon />
                <p className="text-slate-400 text-sm font-medium mt-4">
                  No users yet
                </p>
                <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                  When someone signs up or logs in through the mobile app, they
                  will appear here automatically.
                </p>
              </li>
            ) : (
              users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(u.id)}
                    className={`w-full text-left px-5 py-4 border-b border-slate-800/60 hover:bg-slate-800/40 transition flex gap-4 items-start ${
                      selectedId === u.id
                        ? "bg-emerald-950/35 border-l-2 border-l-emerald-500"
                        : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <Avatar
                      label={initials(u.name, u.email)}
                      active={selectedId === u.id}
                    />
                    <UserRow
                      name={u.name}
                      email={u.email}
                      meta={`${u.plan ?? "free"} plan · Last login ${formatWhen(u.lastLoginAt)} · ${u.chatCount} chats · ${u.savedCount} saved`}
                    />
                  </button>
                </li>
              ))
            )}
          </Panel>
        </section>

        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm p-5 md:p-6 max-h-[70vh] overflow-y-auto shadow-xl shadow-black/20">
          {!detail ? (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center px-4">
              <EmptyIcon muted />
              <p className="text-slate-400 text-sm font-medium mt-4">
                Select a user
              </p>
              <p className="text-slate-500 text-xs mt-2 max-w-sm leading-relaxed">
                Click anyone in the list to view their profile, saved government
                services, and full chat history.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-4 items-center pb-4 border-b border-slate-700/50">
                <Avatar
                  label={initials(detail.user.name, detail.user.email)}
                  active
                  large
                />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {detail.user.name || "Unnamed user"}
                  </h2>
                  <p className="text-slate-400 text-sm">{detail.user.email}</p>
                </div>
              </div>
              <Block title={`Saved services (${detail.savedServiceIds.length})`}>
                {detail.savedServiceIds.length === 0 ? (
                  <p className="text-slate-500 text-sm">No saved services</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {detail.savedServiceIds.map((id) => (
                      <li
                        key={id}
                        className="text-xs bg-slate-800/90 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                      >
                        {id}
                      </li>
                    ))}
                  </ul>
                )}
              </Block>
              <Block title={`Chats (${detail.chats.length})`}>
                {detail.chats.length === 0 ? (
                  <p className="text-slate-500 text-sm">No conversations yet</p>
                ) : (
                  detail.chats.map((chat) => (
                    <details
                      key={chat.id}
                      className="rounded-xl border border-slate-700/50 bg-slate-950/30 mb-2 group"
                    >
                      <summary className="cursor-pointer px-4 py-3 text-sm text-slate-200 hover:bg-slate-800/30 rounded-xl transition list-none flex justify-between gap-2">
                        <span className="font-medium truncate">{chat.title}</span>
                        <span className="text-slate-500 text-xs shrink-0">
                          {chat.messages.length} msgs · {formatWhen(chat.updatedAt)}
                        </span>
                      </summary>
                      <ul className="px-4 pb-4 space-y-2 border-t border-slate-800/60 pt-3">
                        {chat.messages.map((m) => (
                          <li
                            key={m.id}
                            className="text-xs text-slate-400 border-l-2 border-emerald-600/50 pl-3 py-0.5"
                          >
                            <span
                              className={
                                m.role === "user"
                                  ? "text-sky-400 font-medium"
                                  : "text-emerald-400 font-medium"
                              }
                            >
                              {m.role}
                            </span>
                            <span className="text-slate-500"> · </span>
                            {m.content.slice(0, 280)}
                            {m.content.length > 280 ? "…" : ""}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))
                )}
              </Block>
            </div>
          )}
        </section>
      </div>
    </div>
  </>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        connected
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
          : "bg-slate-800/80 text-slate-400 border border-slate-600/50"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          connected ? "bg-emerald-400 live-dot" : "bg-slate-500"
        }`}
      />
      {connected ? "Live" : "Connecting…"}
    </span>
  );
}

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box =
    size === "sm" ? "w-11 h-11 rounded-xl text-lg" : "w-14 h-14 rounded-2xl text-xl mb-4";
  return (
    <div
      className={`${box} md:mb-0 shrink-0 bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-950/50`}
      aria-hidden
    >
      S
    </div>
  );
}

function EmptyIcon({ muted }: { muted?: boolean }) {
  return (
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
        muted ? "bg-slate-800/50" : "bg-slate-800/80"
      }`}
      aria-hidden
    >
      <svg
        className={`w-7 h-7 ${muted ? "text-slate-600" : "text-slate-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    </div>
  );
}

function Avatar({
  label,
  active,
  large,
}: {
  label: string;
  active?: boolean;
  large?: boolean;
}) {
  const size = large ? "w-12 h-12 text-sm" : "w-10 h-10 text-xs";
  return (
    <div
      className={`${size} rounded-xl shrink-0 font-semibold flex items-center justify-center ${
        active
          ? "bg-gradient-to-br from-emerald-500/30 to-teal-600/30 text-emerald-200 ring-1 ring-emerald-500/40"
          : "bg-slate-800 text-slate-300 ring-1 ring-slate-700/80"
      }`}
    >
      {label}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: number;
  accent: "emerald" | "sky" | "violet";
  hint: string;
}) {
  const ring = {
    emerald: "from-emerald-500/20 to-transparent ring-emerald-500/20",
    sky: "from-sky-500/20 to-transparent ring-sky-500/20",
    violet: "from-violet-500/20 to-transparent ring-violet-500/20",
  }[accent];
  const num = {
    emerald: "text-emerald-300",
    sky: "text-sky-300",
    violet: "text-violet-300",
  }[accent];

  return (
    <div
      className={`rounded-2xl border border-slate-700/50 bg-gradient-to-br ${ring} bg-slate-900/50 backdrop-blur-sm px-5 py-5 ring-1`}
    >
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-3xl font-bold mt-2 tabular-nums ${num}`}>{value}</p>
      <p className="text-slate-500 text-xs mt-2">{hint}</p>
    </div>
  );
}

function Panel({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
}) {
  return (
    <Tag
      className={`rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-black/25 ${className}`}
    >
      {children}
    </Tag>
  );
}

function UserRow({
  name,
  email,
  meta,
}: {
  name: string;
  email: string;
  meta: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="font-medium text-white truncate">{name || "—"}</p>
      <p className="text-sm text-slate-400 truncate">{email}</p>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{meta}</p>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">{title}</h3>
      {children}
    </div>
  );
}