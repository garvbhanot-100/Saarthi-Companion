export const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

export const isClerkAdminEnabled = Boolean(clerkPublishableKey);

const DEFAULT_ADMIN_EMAILS = [
  "aaniya1985@gmail.com",
  "garvbhanot990@gmail.com",
];

export function isAllowedAdminEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return DEFAULT_ADMIN_EMAILS.includes(normalized);
}