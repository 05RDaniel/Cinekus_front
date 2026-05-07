import { useState } from 'react';
import { Link } from 'react-router-dom';
import { langToKey, translations } from '../../core/i18n/translations';
import { useLanguage } from '../../core/context/LanguageContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const key = langToKey(language);

  const brandingTexts = translations.header.branding[key];
  const navigationTexts = translations.header.navigation[key];
  const menuTexts = translations.header.menu[key];

  return (
    <header className="bg-dark text-light d-flex align-items-center px-3" style={{ height: '10vh' }}>
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36 }}
          >
            PC
          </div>
          <span className="fw-bold">{brandingTexts.appName}</span>
        </div>

        <nav className="d-none d-md-flex align-items-center gap-3">
          <Link className="link-light text-decoration-none" to="/home">
            {navigationTexts.nowShowing}
          </Link>
          <a className="link-light text-decoration-none" href="#">
            {navigationTexts.offers}
          </a>
          <Link className="link-light text-decoration-none" to="/admin/home">
            {navigationTexts.admin}
          </Link>
        </nav>

        <div className="position-relative">
          <button className="btn btn-outline-light" type="button" onClick={() => setMenuOpen((prev) => !prev)} aria-label={menuTexts.openMenuAriaLabel}>
            ☰
          </button>

          {menuOpen && (
            <div className="position-absolute end-0 mt-2 p-2 rounded border bg-dark" style={{ minWidth: 170, zIndex: 20 }}>
              <label htmlFor="language-select" className="form-label text-light small mb-1">
                {menuTexts.languageLabel}
              </label>
              <select
                id="language-select"
                className="form-select form-select-sm mb-2"
                value={language}
                onChange={(event) => setLanguage(event.target.value === 'en-US' ? 'en-US' : 'es-ES')}
              >
                <option value="es-ES">{menuTexts.languageSpanish}</option>
                <option value="en-US">{menuTexts.languageEnglish}</option>
              </select>
              <button className="btn btn-primary w-100" type="button">
                {menuTexts.loginButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
