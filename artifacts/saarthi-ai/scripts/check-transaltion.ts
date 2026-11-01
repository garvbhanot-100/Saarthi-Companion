import { languageNames, translations } from "../constants/translations";

const referenceKeys = Object.keys(translations.en);
let hasErrors = false;

for (const languageCode of Object.keys(languageNames) as Array<
  keyof typeof languageNames
>) {
  const dictionary = translations[languageCode];

const missingKeys = referenceKeys.filter((key) => {
  const value = dictionary[key as keyof typeof dictionary];
  const englishValue =
    translations.en[key as keyof typeof translations.en];

  return (
    typeof value !== "string" ||
    value.trim() === "" ||
    (languageCode !== "en" &&
      languageCode !== "hi" &&
      value === englishValue)
  );
});

  console.log(`\n${languageCode}:`);

  if (missingKeys.length > 0) {
    hasErrors = true;
    console.log(`Missing ${missingKeys.length} keys:`);
    console.log(missingKeys.join(", "));
  } else {
    console.log("All translation keys are present.");
  }
}

console.log(
  hasErrors
    ? "\nTranslation check found missing entries."
    : "\nAll dictionaries contain every key.",
);
