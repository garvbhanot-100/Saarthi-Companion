import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { prisma, type Prisma } from "@workspace/db";

const SESSION_DAYS = 30;

/** An expected failure whose code is safe to return to the client. */
export class StoreError extends Error {
  constructor(
    public readonly code: string,
    public readonly status = 400,
  ) {
    super(code);
  }
}

export type UserProfileDto = { name: string; email: string };

export type ChatMessageDto = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: unknown;
  isError?: boolean;
};

export type ChatSessionDto = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessageDto[];
};

export type UserPlan = "free" | "premium";

export type UserStateDto = {
  user: UserProfileDto;
  plan: UserPlan;
  /** ISO timestamp; null when the user has never had (or no longer has) Premium. */
  premiumExpiresAt: string | null;
  savedServiceIds: string[];
  chats: ChatSessionDto[];
};

/**
 * Premium is derived only from the server-side expiry timestamp written after a
 * verified payment. When it passes, the user is Free again without any job.
 */
export function planFromExpiry(
  premiumExpiresAt: Date | null | undefined,
  now: Date = new Date(),
): UserPlan {
  return premiumExpiresAt && premiumExpiresAt.getTime() > now.getTime()
    ? "premium"
    : "free";
}

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;
const SCRYPT_PREFIX = "scrypt:";
const SCRYPT_KEY_LENGTH = 64;

async function hashPassword(salt: string, password: string) {
  const key = await scrypt(password, salt, SCRYPT_KEY_LENGTH);
  return SCRYPT_PREFIX + key.toString("hex");
}

/** Accounts created before scrypt store a single salted SHA-256 hash. */
function legacyHashPassword(salt: string, password: string) {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

async function verifyPassword(
  cred: { salt: string; passwordHash: string },
  password: string,
): Promise<{ ok: boolean; needsUpgrade: boolean }> {
  if (cred.passwordHash.startsWith(SCRYPT_PREFIX)) {
    const hash = await hashPassword(cred.salt, password);
    return { ok: safeEqual(hash, cred.passwordHash), needsUpgrade: false };
  }
  const ok = safeEqual(legacyHashPassword(cred.salt, password), cred.passwordHash);
  return { ok, needsUpgrade: ok };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sessionExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d;
}

function mapUserState(user: {
  name: string;
  email: string;
  premiumExpiresAt: Date | null;
  saved: { serviceId: string }[];
  chats: {
    id: string;
    title: string;
    updatedAt: Date;
    messages: {
      id: string;
      role: string;
      content: string;
      createdAt: Date;
      sources: Prisma.JsonValue | null;
      isError: boolean | null;
    }[];
  }[];
}): UserStateDto {
  return {
    user: { name: user.name, email: user.email },
    plan: planFromExpiry(user.premiumExpiresAt),
    premiumExpiresAt:
      planFromExpiry(user.premiumExpiresAt) === "premium"
        ? user.premiumExpiresAt!.toISOString()
        : null,
    savedServiceIds: user.saved.map((s) => s.serviceId),
    chats: user.chats.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt.toISOString(),
      messages: c.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        sources: m.sources ?? undefined,
        isError: m.isError ?? undefined,
      })),
    })),
  };
}

const userStateInclude = {
  saved: { select: { serviceId: true } },
  chats: {
    orderBy: { updatedAt: "desc" as const },
    include: {
      messages: { orderBy: { createdAt: "asc" as const } },
    },
  },
} satisfies Prisma.SaarthiUserInclude;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.saarthiSession.create({
    data: {
      token,
      userId,
      expiresAt: sessionExpiry(),
    },
  });
  return token;
}

export async function resolveSession(
  token: string | undefined,
): Promise<string | null> {
  if (!token?.trim()) return null;
  const session = await prisma.saarthiSession.findUnique({
    where: { token: token.trim() },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.userId;
}

export async function deleteSession(token: string) {
  await prisma.saarthiSession.deleteMany({ where: { token } });
}

export async function loadUserState(userId: string): Promise<UserStateDto | null> {
  const user = await prisma.saarthiUser.findUnique({
    where: { id: userId },
    include: userStateInclude,
  });
  if (!user) return null;
  return mapUserState(user);
}

export async function signUpUser(
  profile: UserProfileDto,
  password?: string,
): Promise<{ token: string; state: UserStateDto }> {
  const email = normalizeEmail(profile.email);
  const name = profile.name.trim();
  if (!name || !email.includes("@")) {
    throw new StoreError("INVALID_PROFILE");
  }
  const existing = await prisma.saarthiUser.findUnique({ where: { email } });
  if (existing) {
    throw new StoreError("EMAIL_TAKEN", 409);
  }

  const salt = password ? randomUUID() : null;
  const passwordHash =
    salt && password ? await hashPassword(salt, password) : null;
  const user = await prisma.saarthiUser.create({
    data: {
      email,
      name,
      lastLoginAt: new Date(),
      ...(salt && passwordHash
        ? { credential: { create: { salt, passwordHash } } }
        : {}),
    },
  });

  const token = await createSession(user.id);
  const state = (await loadUserState(user.id))!;
  return { token, state };
}

export async function loginUser(
  emailInput: string,
  password?: string,
): Promise<{ token: string; state: UserStateDto } | null> {
  const email = normalizeEmail(emailInput);
  const user = await prisma.saarthiUser.findUnique({ where: { email } });

  // Password is always required here. Passwordless sign-in is only allowed
  // through loginVerifiedEmailUser() after the email was verified by Clerk.
  if (!user || !password) return null;

  const cred = await prisma.saarthiCredential.findUnique({
    where: { userId: user.id },
  });
  if (!cred) return null;

  const { ok, needsUpgrade } = await verifyPassword(cred, password);
  if (!ok) return null;
  if (needsUpgrade) {
    const salt = randomUUID();
    await prisma.saarthiCredential.update({
      where: { userId: user.id },
      data: { salt, passwordHash: await hashPassword(salt, password) },
    });
  }

  await prisma.saarthiUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createSession(user.id);
  const state = (await loadUserState(user.id))!;
  return { token, state };
}

/**
 * Sign in (creating the account if needed) for an email address that the
 * caller has ALREADY verified server-side, e.g. via a Clerk session token.
 * Never call this with an email taken from the request body.
 */
export async function loginVerifiedEmailUser(
  verifiedEmail: string,
  fallbackName: string,
): Promise<{ token: string; state: UserStateDto }> {
  const email = normalizeEmail(verifiedEmail);
  const name = fallbackName.trim() || email.split("@")[0] || "User";
  const user = await prisma.saarthiUser.upsert({
    where: { email },
    create: { email, name, lastLoginAt: new Date() },
    // Keep the display name in step with the identity provider.
    update: {
      lastLoginAt: new Date(),
      ...(fallbackName.trim() ? { name: fallbackName.trim() } : {}),
    },
  });
  const token = await createSession(user.id);
  const state = (await loadUserState(user.id))!;
  return { token, state };
}

export async function updateUserProfile(
  userId: string,
  profile: UserProfileDto,
  options: { allowEmailChange: boolean } = { allowEmailChange: true },
) {
  const email = normalizeEmail(profile.email);
  const name = profile.name.trim();
  if (!name || !email.includes("@")) {
    throw new StoreError("INVALID_PROFILE");
  }

  const conflict = await prisma.saarthiUser.findUnique({ where: { email } });
  if (conflict && conflict.id !== userId) {
    throw new StoreError("EMAIL_TAKEN", 409);
  }
  if (!options.allowEmailChange && conflict?.id !== userId) {
    throw new StoreError("EMAIL_CHANGE_NOT_ALLOWED", 403);
  }

  await prisma.saarthiUser.update({
    where: { id: userId },
    data: { name, email },
  });
}

export async function replaceSavedServices(
  userId: string,
  serviceIds: string[],
) {
  await prisma.$transaction([
    prisma.saarthiSavedService.deleteMany({ where: { userId } }),
    ...(serviceIds.length > 0
      ? [
          prisma.saarthiSavedService.createMany({
            data: [...new Set(serviceIds)].map((serviceId) => ({
              userId,
              serviceId,
            })),
          }),
        ]
      : []),
  ]);
}

export async function replaceChats(userId: string, chats: ChatSessionDto[]) {
  await prisma.$transaction(async (tx) => {
    await tx.saarthiChatMessage.deleteMany({
      where: { chat: { userId } },
    });
    await tx.saarthiChat.deleteMany({ where: { userId } });

    for (const chat of chats) {
      await tx.saarthiChat.create({
        data: {
          id: chat.id,
          userId,
          title: chat.title,
          updatedAt: new Date(chat.updatedAt),
          messages: {
            create: chat.messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: new Date(m.createdAt),
              sources: m.sources as Prisma.InputJsonValue | undefined,
              isError: m.isError ?? null,
            })),
          },
        },
      });
    }
  });
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  createdAt: string;
  lastLoginAt: string | null;
  savedCount: number;
  chatCount: number;
  messageCount: number;
};

export async function listAllUsersForAdmin(): Promise<AdminUserRow[]> {
  const users = await prisma.saarthiUser.findMany({
    orderBy: { lastLoginAt: "desc" },
    include: {
      _count: { select: { saved: true, chats: true } },
      chats: { select: { _count: { select: { messages: true } } } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: planFromExpiry(user.premiumExpiresAt),
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    savedCount: user._count.saved,
    chatCount: user._count.chats,
    messageCount: user.chats.reduce((n, c) => n + c._count.messages, 0),
  }));
}
