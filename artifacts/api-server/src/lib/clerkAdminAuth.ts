import { createClerkClient, verifyToken } from "@clerk/backend";

function clerkSecretKey() {
  return process.env.CLERK_SECRET_KEY?.trim() || "";
}

export function isClerkBackendConfigured() {
  return Boolean(clerkSecretKey());
}

/**
 * Verifies a Clerk session token server-side and returns the user's primary
 * email (lower-cased), or null when the token is missing or invalid.
 */
export async function resolveEmailFromClerkToken(
  token: string,
): Promise<string | null> {
  const secretKey = clerkSecretKey();
  if (!secretKey || !token.trim()) return null;

  try {
    const client = createClerkClient({ secretKey });
    const payload = await verifyToken(token, { secretKey });
    const userId = payload.sub;
    if (!userId) return null;
    const user = await client.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find((row) => row.id === primaryId);
    const email = primary?.emailAddress || user.emailAddresses[0]?.emailAddress;
    return email?.trim().toLowerCase() ?? null;
  } catch {
    return null;
  }
}

/** Admin routes use the same verification; the email allowlist is applied by the caller. */
export const resolveAdminEmailFromClerkToken = resolveEmailFromClerkToken;
