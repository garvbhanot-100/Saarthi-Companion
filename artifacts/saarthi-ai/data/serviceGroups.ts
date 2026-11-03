import type { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { searchCategoryTranslations } from "../constants/searchCategoryTranslations";
import type { LanguageCode } from "../constants/translations";
import type { ServiceCategory, ServiceRecord } from "./services";

// Top-level tabs shown on Home and Search. Every service belongs to exactly
// one group, derived from its category; "all" shows every group.
export type ServiceGroup = "government" | "education" | "transport";
export type ServiceGroupFilter = "all" | ServiceGroup;

type FeatherIconName = ComponentProps<typeof Feather>["name"];

const groupByCategory: Partial<Record<ServiceCategory, ServiceGroup>> = {
  Education: "education",
  Scholarships: "education",
  Transport: "transport",
};

export const serviceGroupFilters: ServiceGroupFilter[] = [
  "all",
  "government",
  "education",
  "transport",
];

// Fallback card icons for services without a logo. Government keeps the
// shield the app has always shown.
export const serviceGroupIcons: Record<ServiceGroup, FeatherIconName> = {
  government: "shield",
  education: "book-open",
  transport: "truck",
};

export function getServiceGroup(service: ServiceRecord): ServiceGroup {
  return groupByCategory[service.category] ?? "government";
}

export function isServiceGroupFilter(
  value: unknown,
): value is ServiceGroupFilter {
  return serviceGroupFilters.includes(value as ServiceGroupFilter);
}

const allLabels: Record<LanguageCode, string> = {
  en: "All",
  as: "সকলো",
  bn: "সব",
  brx: "गासैबो",
  doi: "सारे",
  gu: "બધા",
  hi: "सभी",
  kn: "ಎಲ್ಲಾ",
  ks: "سٲری",
  kok: "सगळे",
  mai: "सभ",
  ml: "എല്ലാം",
  mni: "পুম্নমক",
  mr: "सर्व",
  ne: "सबै",
  or: "ସବୁ",
  pa: "ਸਾਰੇ",
  sa: "सर्वम्",
  sat: "सानाम",
  sd: "سڀ",
  ta: "அனைத்தும்",
  te: "అన్నీ",
  ur: "تمام",
};

// Group labels reuse the reviewed category translations, so every
// supported language gets a native label without a second word list.
export function getServiceGroupLabel(
  filter: ServiceGroupFilter,
  language: LanguageCode,
): string {
  const categories = searchCategoryTranslations[language];

  switch (filter) {
    case "all":
      return allLabels[language];
    case "government":
      return categories["Government services"];
    case "education":
      return language === "en"
        ? "Education & Scholarship"
        : `${categories.Education} / ${categories.Scholarships}`;
    case "transport":
      return categories.Transport;
  }
}
