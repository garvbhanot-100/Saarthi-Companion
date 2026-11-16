import type { UserProfile } from "@/context/SaarthiContext";

export function profileFromClerkUser(
  clerkUser: {
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    primaryEmailAddress?: { emailAddress?: string | null } | null;
    emailAddresses?: { emailAddress?: string | null }[];
  },
  fallbackName: string,
): UserProfile | null {
  const email =
    clerkUser.primaryEmailAddress?.emailAddress?.trim() ||
    clerkUser.emailAddresses?.[0]?.emailAddress?.trim();
  if (!email) return null;
  const name =
    clerkUser.fullName?.trim() ||
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    fallbackName;
  return { name: name || fallbackName, email: email.toLowerCase() };
}