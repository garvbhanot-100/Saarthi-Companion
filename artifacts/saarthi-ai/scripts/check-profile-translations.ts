import {
  languageNames,
  profileTranslationKeys,
  translations,
  type LanguageCode,
} from "../constants/translations";
import { profileTranslations } from "../constants/profileTranslations";

const missingByLanguage: Partial<Record<LanguageCode, string[]>> = {};

for (const language of Object.keys(languageNames) as LanguageCode[]) {
  for (const key of profileTranslationKeys) {
    const value = profileTranslations[language]?.[key];

    if (
      typeof value !== "string" ||
      value.trim() === "" ||
      (language !== "en" && value === translations.en[key])
    ) {
      (missingByLanguage[language] ??= []).push(key);
    }
  }
}

const missingCount = Object.values(missingByLanguage).reduce(
  (count, entries) => count + (entries?.length ?? 0),
  0,
);

if (missingCount > 0) {
  console.error("Missing Profile translations:");
  for (const [language, keys] of Object.entries(missingByLanguage)) {
    console.error(`${language}: ${keys?.join(", ")}`);
  }
  throw new Error(`${missingCount} Profile translations are missing.`);
}

console.log(
  `All ${profileTranslationKeys.length} Profile translation keys are translated for ${Object.keys(languageNames).length} languages.`,
);
