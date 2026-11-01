import {
  askSavedTranslationKeys,
  languageNames,
  type LanguageCode,
} from "../constants/translations";
import { askSavedTranslations } from "../constants/askSavedTranslations";

const missingByLanguage: Partial<Record<LanguageCode, string[]>> = {};

for (const language of Object.keys(languageNames) as LanguageCode[]) {
  for (const key of askSavedTranslationKeys) {
    const value = askSavedTranslations[language]?.[key];

    if (
      typeof value !== "string" ||
      !value.trim() ||
      (language !== "en" &&
        value === askSavedTranslations.en[key])
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
  console.error("Missing Ask and Saved translations:");
  for (const [language, keys] of Object.entries(missingByLanguage)) {
    console.error(`${language}: ${keys?.join(", ")}`);
  }
  throw new Error(`${missingCount} Ask and Saved translations are missing.`);
}

console.log(
  `All ${askSavedTranslationKeys.length} Ask and Saved UI keys are translated for ${Object.keys(languageNames).length} languages.`,
);
