import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../core/context/LanguageContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { usePageTexts } from '../../../../lang';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const texts = usePageTexts('header');
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = isAuthenticated && user?.rol === 'ADMIN';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const onOpenLogin = () => {
    setMenuOpen(false);
    navigate('/login', { state: { from: location.pathname } });
  };

  const onOpenRegister = () => {
    setMenuOpen(false);
    navigate('/register', { state: { from: location.pathname } });
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            PC
          </div>
          <span className="app-header__title">{texts.branding.appName}</span>
        </div>

        <nav className="app-header__nav" aria-label="Principal">
          <Link to="/home">{texts.navigation.home}</Link>
          <Link to="/cartelera">{texts.navigation.nowShowing}</Link>
          <a href="#">{texts.navigation.offers}</a>
          {isAdmin && <Link to="/admin/home">{texts.navigation.admin}</Link>}
        </nav>

        <div className="app-header__menu" ref={menuRef}>
          <button
            type="button"
            className={`app-header__menu-toggle${menuOpen ? ' app-header__menu-toggle--open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={texts.menu.openMenuAriaLabel}
            aria-expanded={menuOpen}
            aria-controls="app-header-menu"
          >
            <span className="app-header__burger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          {menuOpen && (
            <div id="app-header-menu" className="app-header__dropdown" role="menu">
              <nav className="app-header__dropdown-nav" aria-label="Móvil">
                <Link to="/home" role="menuitem" onClick={() => setMenuOpen(false)}>
                  {texts.navigation.home}
                </Link>
                <Link to="/cartelera" role="menuitem" onClick={() => setMenuOpen(false)}>
                  {texts.navigation.nowShowing}
                </Link>
                <a href="#" role="menuitem" onClick={() => setMenuOpen(false)}>
                  {texts.navigation.offers}
                </a>
                {isAdmin && (
                  <Link to="/admin/home" role="menuitem" onClick={() => setMenuOpen(false)}>
                    {texts.navigation.admin}
                  </Link>
                )}
              </nav>

              <div className="app-header__dropdown-section">
                <span className="app-header__dropdown-label" id="language-label">
                  {texts.menu.languageLabel}
                </span>
                <div
                  className="app-header__language"
                  role="group"
                  aria-labelledby="language-label"
                >
                  <button
                    type="button"
                    className={`app-header__language-option${
                      language === 'es-ES' ? ' app-header__language-option--active' : ''
                    }`}
                    aria-pressed={language === 'es-ES'}
                    onClick={() => setLanguage('es-ES')}
                  >
                    {texts.menu.languageSpanish}
                  </button>
                  <button
                    type="button"
                    className={`app-header__language-option${
                      language === 'en-US' ? ' app-header__language-option--active' : ''
                    }`}
                    aria-pressed={language === 'en-US'}
                    onClick={() => setLanguage('en-US')}
                  >
                    {texts.menu.languageEnglish}
                  </button>
                </div>
              </div>

              <div className="app-header__dropdown-section">
                {isAuthenticated ? (
                  <>
                    <div className="app-header__user">
                      <span className="app-header__user-name">{user?.username}</span>
                      <span className="app-header__user-email">{user?.email}</span>
                    </div>
                    <button
                      type="button"
                      className="app-header__action app-header__action--ghost"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                    >
                      {texts.menu.logoutButton}
                    </button>
                  </>
                ) : (
                  <div className="app-header__auth-actions">
                    <button
                      type="button"
                      className="app-header__action app-header__action--primary"
                      role="menuitem"
                      onClick={onOpenLogin}
                    >
                      {texts.menu.loginButton}
                    </button>
                    <button
                      type="button"
                      className="app-header__action app-header__action--ghost"
                      role="menuitem"
                      onClick={onOpenRegister}
                    >
                      {texts.menu.registerButton}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
