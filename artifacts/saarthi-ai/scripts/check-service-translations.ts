import { searchCategoryTranslations } from "../constants/searchCategoryTranslations";
import {
  languageNames,
  type LanguageCode,
} from "../constants/translations";
import { catalogServiceTranslations } from "../data/catalogServiceTranslations";
import { serviceTranslations } from "../data/serviceTransalations";
import { services } from "../data/services";

const officialBrandNameIds = new Set([
  "cpgrams",
  "digilocker",
  "enam",
  "mygov",
  "umang",
]);
const fields = ["name", "description", "category"] as const;
type Field = (typeof fields)[number];
type FieldStatus = { missing: string[]; englishFallback: string[] };
type LanguageStatus = Record<Field, FieldStatus>;
const statusByLanguage: Partial<Record<LanguageCode, LanguageStatus>> = {};

function addStatus(
  language: LanguageCode,
  field: Field,
  status: "missing" | "englishFallback",
  serviceId: string,
) {
  const languageStatus =
    (statusByLanguage[language] ??= {
      name: { missing: [], englishFallback: [] },
      description: { missing: [], englishFallback: [] },
      category: { missing: [], englishFallback: [] },
    });
  languageStatus[field][status].push(serviceId);
}

for (const language of Object.keys(languageNames) as LanguageCode[]) {
  for (const service of services) {
    const serviceTranslation = {
      ...serviceTranslations[language]?.[service.id],
      ...catalogServiceTranslations[language]?.[service.id],
    };

    for (const field of ["name", "description"] as const) {
      const translated =
        language === "en" ||
        (field === "name" && officialBrandNameIds.has(service.id))
          ? service[field]
          : serviceTranslation[field];
      if (typeof translated !== "string" || !translated.trim()) {
        addStatus(language, field, "missing", service.id);
      } else if (
        language !== "en" &&
        translated === service[field] &&
        !(field === "name" && officialBrandNameIds.has(service.id))
      ) {
        addStatus(language, field, "englishFallback", service.id);
      }
    }

    const category = searchCategoryTranslations[language]?.[service.category];
    if (typeof category !== "string" || !category.trim()) {
      addStatus(language, "category", "missing", service.id);
    } else if (language !== "en" && category === service.category) {
      addStatus(language, "category", "englishFallback", service.id);
    }
  }
}

console.log(
  `Checked ${services.length} services across ${Object.keys(languageNames).length} languages (${services.length * Object.keys(languageNames).length} service-language pairs).`,
);

let totalProblems = 0;
for (const language of Object.keys(languageNames) as LanguageCode[]) {
  const languageStatus = statusByLanguage[language];
  const translatedFieldCount = fields.reduce(
    (count, field) =>
      count +
      services.length -
      (languageStatus?.[field].missing.length ?? 0) -
      (languageStatus?.[field].englishFallback.length ?? 0),
    0,
  );
  console.log(
    `${language}: ${translatedFieldCount}/${services.length * fields.length} translated; ` +
      fields
        .map(
          (field) =>
            `${field}: ${languageStatus?.[field].missing.length ?? 0} missing, ` +
            `${languageStatus?.[field].englishFallback.length ?? 0} English fallback`,
        )
        .join("; "),
  );

  for (const field of fields) {
    const missing = languageStatus?.[field].missing ?? [];
    const englishFallback = languageStatus?.[field].englishFallback ?? [];
    totalProblems += missing.length + englishFallback.length;
    if (missing.length > 0) {
      console.error(`${language} ${field} missing: ${missing.join(", ")}`);
    }
    if (englishFallback.length > 0) {
      console.error(
        `${language} ${field} English fallback: ${englishFallback.join(", ")}`,
      );
    }
  }
}

if (totalProblems > 0) {
  console.error(`Missing or English-fallback service fields: ${totalProblems}`);
  process.exitCode = 1;
} else {
  console.log(
    "All service names, descriptions, and categories are translated for every supported language.",
  );
}
