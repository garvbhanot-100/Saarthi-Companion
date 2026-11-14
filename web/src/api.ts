const apiBase = () =>
  (import.meta.env.VITE_API_URL || "http://localhost:5000")
    .trim()
    .replace(/\/+$/, "");

export const DEFAULT_ADMIN_EMAIL = "aaniya1985@gmail.com";

export type AdminCredentials = {
  email: string;
  password: string;
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

function adminHeaders(creds: AdminCredentials) {
  return {
    "Content-Type": "application/json",
    "x-admin-email": creds.email.trim().toLowerCase(),
    "x-admin-password": creds.password,
  };
}

export async function fetchUsers(creds: AdminCredentials) {
  const res = await fetch(`${apiBase()}/api/admin/users`, {
    headers: adminHeaders(creds),
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
    headers: adminHeaders(creds),
  });
  if (!res.ok) throw new Error("Could not load user");
  return (await res.json()) as UserDetail;
}

export function subscribeAdminUsers(
  creds: AdminCredentials,
  onUsers: (users: AdminUserRow[]) => void,
) {
  const params = new URLSearchParams({
    email: creds.email.trim().toLowerCase(),
    secret: creds.password,
  });
  const url = `${apiBase()}/api/admin/stream?${params.toString()}`;
  const es = new EventSource(url);
  es.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as { users: AdminUserRow[] };
      onUsers(parsed.users);
    } catch {
      /* ignore */
    }
  };
  es.onerror = () => {};
  return () => es.close();
}