/** True when a Clerk publishable key is baked into this build. */
export const isClerkConfigured = Boolean(
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
);
