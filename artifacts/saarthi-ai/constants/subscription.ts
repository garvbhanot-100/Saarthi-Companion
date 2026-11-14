export type UserPlan = "free" | "premium";

export const PREMIUM_PRICE_INR = 149;

/** Free users can browse and ask AI only about these 10 services. */
export const FREE_TIER_SERVICE_IDS = [
  "aadhaar-update",
  "pan-card",
  "pm-kisan",
  "national-scholarship",
  "national-social-assistance",
  "udyam-registration",
  "passport-seva",
  "voter-services",
  "parivahan",
  "digilocker",
] as const;

const freeSet = new Set<string>(FREE_TIER_SERVICE_IDS);

export function isPremiumPlan(plan: UserPlan | string | undefined): boolean {
  return plan === "premium";
}

export function canAccessService(
  serviceId: string,
  plan: UserPlan | string | undefined,
): boolean {
  if (isPremiumPlan(plan)) return true;
  return freeSet.has(serviceId);
}

export function filterServicesForPlan<T extends { id: string }>(
  items: T[],
  plan: UserPlan | string | undefined,
): T[] {
  if (isPremiumPlan(plan)) return items;
  return items.filter((item) => freeSet.has(item.id));
}