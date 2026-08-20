import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type Lang = 'en-US' | 'es-ES';

const storageKey = 'cinekus.language';

type LanguageContextValue = {
  language: Lang;
  setLanguage: (language: Lang) => void;
};

function getInitialLanguage(): Lang {
  const saved = localStorage.getItem(storageKey);
  if (saved === 'en-US' || saved === 'es-ES') return saved;
  return 'es-ES';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Lang>(getInitialLanguage());

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage: Lang) => {
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
