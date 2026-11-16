import type { TranslationKey } from "@/constants/translations";

/** Turn internal hydration / API errors into user-facing copy (no .env jargon). */
export function formatAuthHydrationError(
  raw: string | null,
  t: (key: TranslationKey) => string,
): string | null {
  if (!raw) return null;
  if (raw === "SERVER_UNREACHABLE") {
    return t("profileAuthServerUnreachable");
  }
  if (raw === "API_NOT_CONFIGURED") {
    return t("profileAuthApiRequired");
  }
  const lower = raw.toLowerCase();
  if (
    lower.includes("expo_public") ||
    lower.includes(".env") ||
    lower.includes("http_")
  ) {
    return t("profileAuthApiRequired");
  }
  return raw;
}