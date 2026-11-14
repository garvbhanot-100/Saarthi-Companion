import { createClerkClient, verifyToken } from "@clerk/backend";

function clerkSecretKey() {
  return process.env.CLERK_SECRET_KEY?.trim() || "";
}

export async function resolveAdminEmailFromClerkToken(
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