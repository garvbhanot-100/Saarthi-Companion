import type { Request } from "express";

const DEFAULT_ADMIN_EMAIL = "aaniya1985@gmail.com";

export function getConfiguredAdminEmail() {
  return (
    process.env.SAARTHI_ADMIN_EMAIL?.trim().toLowerCase() ||
    DEFAULT_ADMIN_EMAIL
  );
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

export function adminRequestAuthorized(req: Request): boolean {
  const expectedEmail = getConfiguredAdminEmail();
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

  if (email !== expectedEmail) return false;
  return secret === expectedSecret;
}