import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_ADMIN_EMAIL,
  fetchUserDetail,
  fetchUsers,
  subscribeAdminUsers,
  type AdminCredentials,
  type AdminUserRow,
  type UserDetail,
} from "./api";

const STORAGE_KEY = "saarthi-admin-session";

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function loadStoredCreds(): AdminCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminCredentials;
    if (!parsed.email || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const [adminCreds, setAdminCreds] = useState<AdminCredentials | null>(() =>
    loadStoredCreds(),
  );
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
    setAdminCreds(creds);
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
          setError("Email/password galat hai ya API chalu nahi.");
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

  if (!adminCreds) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Panel className="w-full max-w-md p-6">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Sartva Admin
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            Live users aur unka data dekho — sab real-time server se aata hai.
          </p>
          <label className="block text-sm text-slate-300 mb-2">
            Admin email
          </label>
          <input
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white mb-4"
            placeholder={DEFAULT_ADMIN_EMAIL}
            autoComplete="username"
          />
          <label className="block text-sm text-slate-300 mb-2">
            Admin password
          </label>
          <input
            type="password"
            value={draftPassword}
            onChange={(e) => setDraftPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white mb-4"
            placeholder="API .env → SAARTHI_ADMIN_PASSWORD"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={connect}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 font-medium text-white"
          >
            Connect
          </button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            Sartva Admin Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {connected ? "● Live connected" : "○ Connecting…"} — users login &
            data realtime
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setAdminCreds(null);
            setDraftEmail(DEFAULT_ADMIN_EMAIL);
            setDraftPassword("");
            setUsers([]);
            setDetail(null);
          }}
          className="text-sm text-slate-400 hover:text-white border border-slate-600 rounded-lg px-3 py-2"
        >
          Sign out
        </button>
      </header>

      {error && (
        <p className="max-w-7xl mx-auto mb-4 text-amber-300 text-sm">{error}</p>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Total users" value={stats.total} />
        <Stat label="Logged in (ever)" value={stats.logins} />
        <Stat label="Messages" value={stats.messages} />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/80 text-sm font-medium text-slate-300">
            Users ({users.length})
          </div>
          <Panel as="ul" className="p-0 max-h-[70vh] overflow-y-auto border-0">
            {users.length === 0 ? (
              <li className="p-6 text-slate-500 text-sm text-center">
                Abhi koi user login nahi — app se signup/login karein.
              </li>
            ) : (
              users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(u.id)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-800/80 hover:bg-slate-800/50 transition ${
                      selectedId === u.id ? "bg-emerald-950/40" : ""
                    }`}
                  >
                    <UserRow
                      name={u.name}
                      email={u.email}
                      meta={`Plan: ${u.plan ?? "free"} · Last login: ${formatWhen(u.lastLoginAt)} · ${u.chatCount} chats · ${u.savedCount} saved`}
                    />
                  </button>
                </li>
              ))
            )}
          </Panel>
        </section>

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4 md:p-6 max-h-[70vh] overflow-y-auto">
          {!detail ? (
            <p className="text-slate-500 text-sm">
              Kisi user par click karein — profile, saved services, chats dikhenge.
            </p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {detail.user.name}
                </h2>
                <p className="text-slate-400 text-sm">{detail.user.email}</p>
              </div>
              <Block title={`Saved services (${detail.savedServiceIds.length})`}>
                {detail.savedServiceIds.length === 0 ? (
                  <p className="text-slate-500 text-sm">None</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {detail.savedServiceIds.map((id) => (
                      <li
                        key={id}
                        className="text-xs bg-slate-800 rounded-md px-2 py-1 text-slate-200"
                      >
                        {id}
                      </li>
                    ))}
                  </ul>
                )}
              </Block>
              <Block title={`Chats (${detail.chats.length})`}>
                {detail.chats.map((chat) => (
                  <details
                    key={chat.id}
                    className="rounded-lg border border-slate-700/60 mb-2"
                  >
                    <summary className="cursor-pointer px-3 py-2 text-sm text-slate-200">
                      {chat.title} · {chat.messages.length} msgs ·{" "}
                      {formatWhen(chat.updatedAt)}
                    </summary>
                    <ul className="px-3 pb-3 space-y-2">
                      {chat.messages.map((m) => (
                        <li
                          key={m.id}
                          className="text-xs text-slate-400 border-l-2 border-slate-600 pl-2"
                        >
                          <span className="text-emerald-400">{m.role}</span>{" "}
                          {m.content.slice(0, 200)}
                          {m.content.length > 200 ? "…" : ""}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </Block>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-4">
      <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-white mt-1">{value}</p>
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
      className={`rounded-2xl border border-slate-700/80 bg-slate-900/60 shadow-xl shadow-black/30 ${className}`}
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
    <>
      <p className="font-medium text-white">{name || "—"}</p>
      <p className="text-sm text-slate-400">{email}</p>
      <p className="text-xs text-slate-500 mt-1">{meta}</p>
    </>
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
      <h3 className="text-sm font-medium text-slate-300 mb-2">{title}</h3>
      {children}
    </div>
  );
}
