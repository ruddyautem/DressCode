"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR, enUS } from "@clerk/localizations";
import frMessages from "../../messages/fr.json";
import enMessages from "../../messages/en.json";

export type Language = "fr" | "en";

export const messagesRecord: Record<Language, typeof frMessages> = {
  fr: frMessages,
  en: enMessages,
};

export type TranslationKey = keyof typeof frMessages;

// Dictionnaire de traduction automatique pour les données Sanity (Produits & Catégories)
export const catalogTranslations: Record<
  string,
  {
    name?: { fr: string; en: string };
    title?: { fr: string; en: string };
    description?: { fr: string; en: string };
  }
> = {
  // Catégories
  "t-shirts": {
    title: { fr: "T-Shirts", en: "T-Shirts" },
    description: {
      fr: "T-shirts premium en coton peigné et coupes décontractées contemporaines.",
      en: "Premium combed cotton t-shirts in contemporary relaxed fits.",
    },
  },
  baskets: {
    title: { fr: "Baskets", en: "Sneakers" },
    description: {
      fr: "Sélection de sneakers emblématiques alliant confort urbain et esthétique streetwear.",
      en: "Curated iconic sneakers blending urban comfort and streetwear aesthetics.",
    },
  },
  bonnets: {
    title: { fr: "Bonnets", en: "Beanies" },
    description: {
      fr: "Bonnets tricotés douillets et colorés pour affronter la saison avec style.",
      en: "Cozy and colorful knitted beanies to face the cold in style.",
    },
  },
  casquettes: {
    title: { fr: "Casquettes", en: "Caps" },
    description: {
      fr: "Casquettes intemporelles à visière courbée ou snapback pour compléter votre silhouette.",
      en: "Timeless curved-brim caps and snapbacks to complete your silhouette.",
    },
  },

  // Produits
  "t-shirt-leave-the-road": {
    name: { fr: "T-Shirt \"Leave the road\"", en: "T-Shirt \"Leave the road\"" },
    description: {
      fr: "Magnifique T-shirt - Leave the Road - Tailles Disponibles: SM / M / L",
      en: "Magnificent \"Leave the Road\" T-shirt - Available sizes: SM / M / L",
    },
  },
  "bonnet-orange": {
    name: { fr: "Bonnet Orange", en: "Orange Beanie" },
    description: {
      fr: "Magnifique bonnet orange pour affronter la froideur de l'hiver !",
      en: "Magnificent vibrant orange beanie to conquer winter cold in style!",
    },
  },
  "converse-all-star-noires": {
    name: { fr: "Converse All-Star Noires", en: "Black Converse All-Stars" },
    description: {
      fr: "La classique et indémodable Converse All-Star montante !",
      en: "The classic and timeless black high-top Converse All-Star sneaker!",
    },
  },
  "t-shirt-noir": {
    name: { fr: "T-Shirt noir", en: "Black Essential T-Shirt" },
    description: {
      fr: "T-shirt noir classique, doux et polyvalent, adapté à toutes vos tenues. Coupe unisexe et confortable.",
      en: "Classic black t-shirt, soft and versatile for any outfit. Unisex and comfortable fit.",
    },
  },
  "casquette-blanche": {
    name: { fr: "Casquette Blanche", en: "White Minimalist Cap" },
    description: {
      fr: "Casquette blanche épurée, idéale pour un style frais et moderne. Ajustable pour convenir à toutes les tailles.",
      en: "Crisp white minimalist cap for a clean, modern look. Adjustable strap fits all sizes.",
    },
  },
  "t-shirt-outcast": {
    name: { fr: "T-Shirt Outcast", en: "Outcast Graphic T-Shirt" },
    description: {
      fr: "T-Shirt Outcast avec sérigraphie signature !",
      en: "Outcast T-Shirt featuring bold signature screenprint artwork!",
    },
  },
  "baskets-nike-blanches": {
    name: {
      fr: "Nike SB Stefan Janoski Max White Black",
      en: "Nike SB Stefan Janoski Max White Black",
    },
    description: {
      fr: "Édition limitée ! Amorti Max Air et empeigne respirante.",
      en: "Limited edition! Max Air cushioning with lightweight breathable upper.",
    },
  },
  "casquette-noire": {
    name: { fr: "Casquette Noire WRSHP", en: "WRSHP Black Cap" },
    description: {
      fr: "Casquette noire WRSHP minimaliste, parfaite pour un look sobre et intemporel. Ajustable pour un confort optimal.",
      en: "Minimalist black WRSHP cap, perfect for a subtle timeless aesthetic. Fully adjustable.",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  translateCategory: (title?: string, slug?: string) => string;
  translateProductName: (name?: string, slug?: string) => string;
  translateProductDesc: (originalDesc?: string, slug?: string) => string;
  translateSize: (size?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: () => {},
  t: (key) => frMessages[key] || key,
  translateCategory: (title) => title || "",
  translateProductName: (name) => name || "",
  translateProductDesc: (d) => d || "",
  translateSize: (s) => s || "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("dresscode_lang") as Language;
    if (saved === "fr" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dresscode_lang", lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const messages = messagesRecord[language] || frMessages;
    let text = messages[key] || frMessages[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
      });
    }
    return text;
  };

  const translateCategory = (title?: string, slug?: string): string => {
    if (!slug) return title || "";
    const entry = catalogTranslations[slug];
    if (entry?.title) {
      return entry.title[language] || title || "";
    }
    return title || "";
  };

  const translateProductName = (name?: string, slug?: string): string => {
    if (!slug) return name || "";
    const entry = catalogTranslations[slug];
    if (entry?.name) {
      return entry.name[language] || name || "";
    }
    return name || "";
  };

  const translateProductDesc = (originalDesc?: string, slug?: string): string => {
    if (!slug) return originalDesc || "";
    const entry = catalogTranslations[slug];
    if (entry?.description) {
      return entry.description[language] || originalDesc || "";
    }
    return originalDesc || "";
  };

  const translateSize = (size?: string): string => {
    if (!size) return "";
    const normalized = size.trim().toUpperCase();
    if (normalized === "TAILLE UNIQUE" || normalized === "ONE SIZE") {
      return language === "fr" ? "TAILLE UNIQUE" : "ONE SIZE";
    }
    return size;
  };

  const currentMessages = messagesRecord[language] || frMessages;
  const clerkLocalization = language === "en" ? enUS : frFR;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCategory,
        translateProductName,
        translateProductDesc,
        translateSize,
      }}
    >
      <ClerkProvider localization={clerkLocalization}>
        <NextIntlClientProvider locale={language} messages={currentMessages}>
          {children}
        </NextIntlClientProvider>
      </ClerkProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
