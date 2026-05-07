import { langToKey, translations } from '../../core/i18n/translations';
import { useLanguage } from '../../core/context/LanguageContext';

export function Footer() {
  const { language } = useLanguage();
  const key = langToKey(language);
  const footerTexts = translations.footer.main[key];

  return (
    <footer className="bg-dark text-light d-flex align-items-center justify-content-center" style={{ height: '5vh' }}>
      <p className="mb-0 small">{footerTexts.copyright}</p>
    </footer>
  );
}
