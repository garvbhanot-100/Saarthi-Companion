import {
  languageNames,
  searchTranslationKeys,
  type LanguageCode,
} from "../constants/translations";
import { searchCategoryTranslations } from "../constants/searchCategoryTranslations";
import { searchTranslations } from "../constants/searchTranslations";
import { serviceTranslationUnavailable } from "../constants/serviceTranslationUnavailable";
import { catalogServiceTranslations } from "../data/catalogServiceTranslations";
import { services } from "../data/services";
import { serviceTranslations } from "../data/serviceTransalations";

const missingByLanguage: Partial<Record<LanguageCode, string[]>> = {};
const categoriesUsed = new Set(services.map(({ category }) => category));
const officialServiceNameIds = new Set([
  "cpgrams",
  "digilocker",
  "enam",
  "mygov",
  "umang",
]);

function reportMissing(language: LanguageCode, key: string) {
  (missingByLanguage[language] ??= []).push(key);
}

for (const language of Object.keys(languageNames) as LanguageCode[]) {
  for (const key of searchTranslationKeys) {
    const value =
      key === "serviceTranslationUnavailable"
        ? serviceTranslationUnavailable[language]
        : searchTranslations[language]?.[key];

    if (
      typeof value !== "string" ||
      !value.trim() ||
      (language !== "en" && value === searchTranslations.en[key])
    ) {
      reportMissing(language, `ui.${key}`);
    }
  }

  for (const category of categoriesUsed) {
    const value = searchCategoryTranslations[language]?.[category];

    if (
      typeof value !== "string" ||
      !value.trim() ||
      (language !== "en" &&
        value === searchCategoryTranslations.en[category])
    ) {
      reportMissing(language, `category.${category}`);
    }
  }

  if (language === "en") continue;

  for (const service of services) {
    for (const field of ["name", "description"] as const) {
      const value =
        catalogServiceTranslations[language]?.[service.id]?.[field] ??
        serviceTranslations[language]?.[service.id]?.[field];
      const isOfficialBrandName =
        field === "name" && officialServiceNameIds.has(service.id);

      if (
        (!isOfficialBrandName &&
          (typeof value !== "string" || !value.trim())) ||
        (typeof value === "string" &&
          value === service[field] &&
          !isOfficialBrandName)
      ) {
        reportMissing(language, `service.${service.id}.${field}`);
      }
    }
  }
}

const missingCount = Object.values(missingByLanguage).reduce(
  (count, entries) => count + (entries?.length ?? 0),
  0,
);

if (missingCount > 0) {
  console.error(
    `Search UI: ${searchTranslationKeys.length} keys checked across ${Object.keys(languageNames).length} languages.`,
  );
  console.error(
    `Search categories: ${categoriesUsed.size} used categories checked across ${Object.keys(languageNames).length} languages.`,
  );
  console.error("Remaining missing Search entries:");
  for (const [language, keys] of Object.entries(missingByLanguage)) {
    const entries = keys ?? [];
    const uiAndCategories = entries.filter(
      (key) => !key.startsWith("service."),
    );
    if (uiAndCategories.length > 0) {
      console.error(`${language}: ${uiAndCategories.join(", ")}`);
    }

    const serviceEntries = entries.filter((key) =>
      key.startsWith("service."),
    );
    if (serviceEntries.length > 0) {
      console.error(`${language}: ${serviceEntries.join(", ")}`);
    }
  }
  throw new Error(`${missingCount} Search translations are missing.`);
}

console.log(
  `All ${searchTranslationKeys.length} Search UI keys, categories used on Search, and service names/descriptions are translated for ${Object.keys(languageNames).length} languages.`,
);
