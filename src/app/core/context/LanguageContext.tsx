import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { TranslationLanguage } from '../i18n/translations';

const storageKey = 'cinekus.language';

type LanguageContextValue = {
  language: TranslationLanguage;
  setLanguage: (language: TranslationLanguage) => void;
};

function getInitialLanguage(): TranslationLanguage {
  const saved = localStorage.getItem(storageKey);
  if (saved === 'en-US' || saved === 'es-ES') return saved;
  return 'es-ES';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<TranslationLanguage>(getInitialLanguage());

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage: TranslationLanguage) => {
        localStorage.setItem(storageKey, nextLanguage);
        setLanguageState(nextLanguage);
      },
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
