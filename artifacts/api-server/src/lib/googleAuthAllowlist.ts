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

export function getGoogleAllowedEmails(): string[] {
  const fromGoogle = process.env.SAARTHI_GOOGLE_ALLOWED_EMAILS?.trim();
  if (fromGoogle) return parseEmailList(fromGoogle);
  const fromAdmin = process.env.SAARTHI_ADMIN_EMAIL?.trim();
  if (fromAdmin) return parseEmailList(fromAdmin);
  return [...DEFAULT_GOOGLE_ALLOWED_EMAILS];
}

export function isGoogleAuthEmailAllowed(emailInput: string): boolean {
  const email = emailInput.trim().toLowerCase();
  return getGoogleAllowedEmails().includes(email);
}