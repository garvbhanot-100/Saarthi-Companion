const DEFAULT_GOOGLE_ALLOWED_EMAILS = [
  "aaniya1985@gmail.com",
  "garvbhanot990@gmail.com",
];

function parseEmailList(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function getAllowedEmails(): string[] {
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_ALLOWED_EMAILS?.trim();
  if (fromEnv) return parseEmailList(fromEnv);
  return [...DEFAULT_GOOGLE_ALLOWED_EMAILS];
}

export function isGoogleSignupEmailAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getAllowedEmails().includes(normalized);
}