import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import enTranslations from '../translations/en.json';
import deTranslations from '../translations/de.json';

// Define available languages
export type Language = 'en' | 'de';

// Translation context type
interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Translation data interface
interface TranslationData {
  [key: string]: string | TranslationData;
}

// Load translation data synchronously
const getTranslations = (lang: Language): TranslationData => {
  switch (lang) {
    case 'en':
      return enTranslations;
    case 'de':
      return deTranslations;
    default:
      return enTranslations;
  }
};

// Get nested value from object using dot notation
const getNestedValue = (obj: TranslationData, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' && current[key] !== undefined ? current[key] : null;
  }, obj as TranslationData | string | null) as string;
};

// Provider component props
interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// Translation provider component
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  defaultLanguage = 'en' 
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or use default
    const saved = localStorage.getItem('app-language') as Language;
    return saved && ['en', 'de'].includes(saved) ? saved : defaultLanguage;
  });
  
  const [translations, setTranslations] = useState<TranslationData>(() => {
    // Initialize with translations for the default language
    return getTranslations(language);
  });

  // Load translations when language changes
  useEffect(() => {
    const translationData = getTranslations(language);
    setTranslations(translationData);
  }, [language]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    // Check if translations are available
    if (Object.keys(translations).length === 0) {
      return key;
    }
    
    const value = getNestedValue(translations, key);
    
    if (value === null || value === undefined) {
      console.warn(`Translation missing for key: ${key} (language: ${language})`);
      return key; // Return the key itself as fallback
    }
    
    return typeof value === 'string' ? value : String(value);
  };

  // Handle language change
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;