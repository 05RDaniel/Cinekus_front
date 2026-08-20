import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePageTexts } from '../../../lang';
import { useAuth } from '../context/AuthContext';

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const texts = usePageTexts('login');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from || '/home';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setLoginError(texts.errors.missingFields);
      return;
    }
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const response = await login(email.trim(), password);
      const destination =
        from.startsWith('/admin') && response.user.rol !== 'ADMIN' ? '/home' : from;
      navigate(destination, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
        setLoginError(apiMessage || texts.errors.generic);
      } else {
        setLoginError(texts.errors.generic);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <section className="login-page" aria-labelledby="login-title">
      <div className="login-page__card">
        <h1 id="login-title" className="login-page__title">
          {texts.title}
        </h1>
        <p className="login-page__subtitle">{texts.subtitle}</p>

        <form className="login-page__form" onSubmit={onSubmit}>
          {loginError && (
            <div className="login-page__error" role="alert">
              {loginError}
            </div>
          )}

          <label className="login-page__field" htmlFor="login-email">
            <span>{texts.fields.emailLabel}</span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="login-page__field" htmlFor="login-password">
            <span>{texts.fields.passwordLabel}</span>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <div className="login-page__actions">
            <Link to={from === '/login' ? '/home' : from} className="admin-btn admin-btn--ghost">
              {texts.buttons.back}
            </Link>
            <button type="submit" className="admin-btn" disabled={isLoggingIn}>
              {isLoggingIn ? texts.buttons.submitting : texts.buttons.submit}
            </button>
          </div>
        </form>

        <p className="login-page__switch">
          {texts.switch.prompt}{' '}
          <Link to="/register" state={{ from }}>
            {texts.switch.link}
          </Link>
        </p>
      </div>
    </section>
  );
}
