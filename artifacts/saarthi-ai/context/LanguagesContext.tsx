import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getHomeTranslation,
  askSavedTranslationKeys,
  homeSearchKeys,
  profileTranslationKeys,
  searchTranslationKeys,
  translationsWithHome,
  type TranslationKey,
} from "@/constants/translations";
import { askSavedTranslations } from "@/constants/askSavedTranslations";
import { profileTranslations } from "@/constants/profileTranslations";
import { searchTranslations } from "@/constants/searchTranslations";
import { serviceTranslationUnavailable } from "@/constants/serviceTranslationUnavailable";
import { languages } from "@/constants/languages";

export type LanguageCode =
  | "en"
  | "as"
  | "bn"
  | "brx"
  | "doi"
  | "gu"
  | "hi"
  | "kn"
  | "ks"
  | "kok"
  | "mai"
  | "ml"
  | "mni"
  | "mr"
  | "ne"
  | "or"
  | "pa"
  | "sa"
  | "sat"
  | "sd"
  | "ta"
  | "te"
  | "ur";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  hydrated: boolean;
  t: (key: TranslationKey) => string;
}

const LANGUAGE_STORAGE_KEY = "@saarthi_language";

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [hydrated, setHydrated] = useState(false);
  const userSelectedLanguage = useRef(false);

  useEffect(() => {
    async function loadLanguage() {
      try {
        const savedLanguage = await AsyncStorage.getItem(
          LANGUAGE_STORAGE_KEY
        );

        const isValidLanguage = languages.some(
          (item) => item.code === savedLanguage
        );

        if (isValidLanguage && !userSelectedLanguage.current) {
          setLanguageState(savedLanguage as LanguageCode);
        }
      } catch (error) {
        console.error("Could not load saved language:", error);
      } finally {
        setHydrated(true);
      }
    }

    loadLanguage();
  }, []);

  const setLanguage = (nextLanguage: LanguageCode) => {
    userSelectedLanguage.current = true;
    setLanguageState(nextLanguage);

    AsyncStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      nextLanguage
    ).catch((error) => {
      console.error("Could not save language:", error);
    });
  };

const t = (key: TranslationKey): string => {
  const isAskSavedText = askSavedTranslationKeys.includes(key);
  const isHomeText = homeSearchKeys.includes(key);
  const isProfileText = profileTranslationKeys.includes(key);
  const isSearchText = searchTranslationKeys.includes(key);
  const translatedText = isAskSavedText
    ? askSavedTranslations[language]?.[key]
    : isHomeText
      ? getHomeTranslation(language, key)
      : isProfileText
        ? profileTranslations[language]?.[key]
        : isSearchText
          ? key === "serviceTranslationUnavailable"
            ? serviceTranslationUnavailable[language]
            : searchTranslations[language]?.[key]
          : translationsWithHome[language]?.[key];

  if (typeof translatedText !== "string" || !translatedText.trim()) {
    console.warn(
      `[Saarthi] Missing translation: ${language}.${key}`
    );

    return `[${language}.${key}]`;
  }

  return translatedText;
};
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        hydrated,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}