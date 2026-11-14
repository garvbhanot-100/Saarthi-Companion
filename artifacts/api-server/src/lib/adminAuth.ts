import type { Request } from "express";
import { resolveAdminEmailFromClerkToken } from "./clerkAdminAuth";

const DEFAULT_ADMIN_EMAILS = [
  "aaniya1985@gmail.com",
  "garvbhanot990@gmail.com",
];

function parseAdminEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function getConfiguredAdminEmails(): string[] {
  const fromEnv = process.env.SAARTHI_ADMIN_EMAIL?.trim();
  if (fromEnv) return parseAdminEmails(fromEnv);
  return [...DEFAULT_ADMIN_EMAILS];
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getAdminSecretFromEnv() {
  return (
    process.env.SAARTHI_ADMIN_PASSWORD?.trim() ||
    process.env.SAARTHI_ADMIN_KEY?.trim() ||
    ""
  );
}

function clerkBearerFromRequest(req: Request): string {
  const header = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (header) return header;
  const query =
    typeof req.query.clerk_token === "string" ? req.query.clerk_token.trim() : "";
  return query;
}

export async function adminRequestAuthorized(req: Request): Promise<boolean> {
  const allowedEmails = getConfiguredAdminEmails();

  const clerkToken = clerkBearerFromRequest(req);
  if (clerkToken) {
    const email = await resolveAdminEmailFromClerkToken(clerkToken);
    return Boolean(email && allowedEmails.includes(email));
  }

  const expectedSecret = getAdminSecretFromEnv();
  if (!expectedSecret) return false;

  const queryEmail =
    typeof req.query.email === "string" ? req.query.email : "";
  const querySecret =
    typeof req.query.secret === "string"
      ? req.query.secret
      : typeof req.query.key === "string"
        ? req.query.key
        : "";

  const headerEmail = req.headers["x-admin-email"]?.toString() ?? "";
  const headerSecret =
    req.headers["x-admin-password"]?.toString().trim() ||
    req.headers["x-admin-key"]?.toString().trim() ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "").trim() ||
    "";

  const email = normalizeEmail(headerEmail || queryEmail);
  const secret = (headerSecret || querySecret).trim();

  if (!allowedEmails.includes(email)) return false;
  return secret === expectedSecret;
}