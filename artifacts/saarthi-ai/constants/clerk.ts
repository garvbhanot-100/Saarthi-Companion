/** Clerk publishable key from Expo env (same source as ClerkProvider). */
export const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

/** True when a Clerk publishable key is baked into this build. */
export const isClerkConfigured = Boolean(clerkPublishableKey);
