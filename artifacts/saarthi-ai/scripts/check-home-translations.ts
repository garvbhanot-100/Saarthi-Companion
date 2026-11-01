import {
  homeSearchKeys,
  languageNames,
  translations,
  type LanguageCode,
} from "../constants/translations";
import { homeTranslations } from "../constants/homeTranslations";
import { services } from "../data/services";
import { serviceTranslations } from "../data/serviceTransalations";

const homeServices = services.slice(0, 3);
const missingByLanguage: Partial<Record<LanguageCode, string[]>> = {};

function reportMissing(language: LanguageCode, entry: string) {
  (missingByLanguage[language] ??= []).push(entry);
}

for (const language of Object.keys(languageNames) as LanguageCode[]) {
  if (language === "en") {
    continue;
  }

  for (const key of homeSearchKeys) {
    const value =
      homeTranslations[language]?.[key] ?? translations[language][key];

    if (
      typeof value !== "string" ||
      !value.trim() ||
      value === translations.en[key]
    ) {
      reportMissing(language, key);
    }
  }

  for (const service of homeServices) {
    for (const field of ["name", "description"] as const) {
      const value = serviceTranslations[language]?.[service.id]?.[field];

      if (
        typeof value !== "string" ||
        !value.trim() ||
        value === service[field]
      ) {
        reportMissing(language, `${service.id}.${field}`);
      }
    }
  }
}

const missingCount = Object.values(missingByLanguage).reduce(
  (count, entries) => count + (entries?.length ?? 0),
  0,
);
const completeLanguages = (
  Object.keys(languageNames) as LanguageCode[]
).filter((language) => language === "en" || !missingByLanguage[language]);

if (missingCount > 0) {
  console.error(
    `Complete locale coverage: ${completeLanguages.join(", ")} (${completeLanguages.length}/${Object.keys(languageNames).length})`,
  );
  console.error("Missing Home translations:");
  for (const [language, entries] of Object.entries(missingByLanguage)) {
    console.error(`${language}: ${entries?.join(", ")}`);
  }
  throw new Error(`${missingCount} Home translations are missing.`);
}

console.log(
  `All Home strings and ${homeServices.length} Home services are translated for ${Object.keys(languageNames).length} languages.`,
);
