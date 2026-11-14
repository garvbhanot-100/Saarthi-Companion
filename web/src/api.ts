const apiBase = () =>
  (import.meta.env.VITE_API_URL || "http://localhost:5000")
    .trim()
    .replace(/\/+$/, "");

export const DEFAULT_ADMIN_EMAIL = "aaniya1985@gmail.com";

export type AdminCredentials = {
  email: string;
  password?: string;
  getClerkToken?: () => Promise<string | null>;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  plan?: string;
  createdAt: string;
  lastLoginAt: string | null;
  savedCount: number;
  chatCount: number;
  messageCount: number;
};

export type UserDetail = {
  user: { name: string; email: string };
  savedServiceIds: string[];
  chats: {
    id: string;
    title: string;
    updatedAt: string;
    messages: {
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }[];
  }[];
};

async function adminHeaders(creds: AdminCredentials) {
  const base: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-email": creds.email.trim().toLowerCase(),
  };
  if (creds.getClerkToken) {
    const token = await creds.getClerkToken();
    if (!token) throw new Error("Could not get sign-in token");
    base.Authorization = `Bearer ${token}`;
    return base;
  }
  if (!creds.password) throw new Error("Missing admin password");
  base["x-admin-password"] = creds.password;
  return base;
}

export async function fetchUsers(creds: AdminCredentials) {
  const res = await fetch(`${apiBase()}/api/admin/users`, {
    headers: await adminHeaders(creds),
  });
  if (!res.ok) throw new Error("Could not load users");
  const data = (await res.json()) as { users: AdminUserRow[] };
  return data.users;
}

export async function fetchUserDetail(
  creds: AdminCredentials,
  userId: string,
) {
  const res = await fetch(`${apiBase()}/api/admin/users/${userId}`, {
    headers: await adminHeaders(creds),
  });
  if (!res.ok) throw new Error("Could not load user");
  return (await res.json()) as UserDetail;
}

export function subscribeAdminUsers(
  creds: AdminCredentials,
  onUsers: (users: AdminUserRow[]) => void,
) {
  let es: EventSource | null = null;
  let closed = false;

  const connect = async () => {
    if (closed) return;
    const params = new URLSearchParams();
    if (creds.getClerkToken) {
      const token = await creds.getClerkToken();
      if (!token) return;
      params.set("clerk_token", token);
    } else {
      params.set("email", creds.email.trim().toLowerCase());
      params.set("secret", creds.password ?? "");
    }
    es?.close();
    const url = `${apiBase()}/api/admin/stream?${params.toString()}`;
    es = new EventSource(url);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as { users: AdminUserRow[] };
        onUsers(parsed.users);
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      es?.close();
      if (!closed) void connect();
    };
  };

  void connect();
  return () => {
    closed = true;
    es?.close();
  };
}