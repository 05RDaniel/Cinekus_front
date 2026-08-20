import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePageTexts } from '../../../lang';
import { useAuth } from '../context/AuthContext';

type LocationState = {
  from?: string;
};

function firstValidationMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as
    | { message?: string; errors?: Record<string, string[]> }
    | undefined;
  if (data?.errors) {
    const first = Object.values(data.errors)[0]?.[0];
    if (first) return first;
  }
  return data?.message ?? null;
}

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, isAuthenticated } = useAuth();
  const texts = usePageTexts('register');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from || '/home';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !email.trim() || !password || !passwordConfirmation) {
      setFormError(texts.errors.missingFields);
      return;
    }
    if (password !== passwordConfirmation) {
      setFormError(texts.errors.passwordMismatch);
      return;
    }
    if (password.length < 6) {
      setFormError(texts.errors.passwordShort);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(firstValidationMessage(error) || texts.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page" aria-labelledby="register-title">
      <div className="login-page__card">
        <h1 id="register-title" className="login-page__title">
          {texts.title}
        </h1>
        <p className="login-page__subtitle">{texts.subtitle}</p>

        <form className="login-page__form" onSubmit={onSubmit}>
          {formError && (
            <div className="login-page__error" role="alert">
              {formError}
            </div>
          )}

          <label className="login-page__field" htmlFor="register-username">
            <span>{texts.fields.usernameLabel}</span>
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="login-page__field" htmlFor="register-email">
            <span>{texts.fields.emailLabel}</span>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="login-page__field" htmlFor="register-password">
            <span>{texts.fields.passwordLabel}</span>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          <label className="login-page__field" htmlFor="register-password-confirmation">
            <span>{texts.fields.passwordConfirmLabel}</span>
            <input
              id="register-password-confirmation"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              minLength={6}
            />
          </label>

          <div className="login-page__actions">
            <Link to={from === '/register' ? '/home' : from} className="admin-btn admin-btn--ghost">
              {texts.buttons.back}
            </Link>
            <button type="submit" className="admin-btn" disabled={isSubmitting}>
              {isSubmitting ? texts.buttons.submitting : texts.buttons.submit}
            </button>
          </div>
        </form>

        <p className="login-page__switch">
          {texts.switch.prompt}{' '}
          <Link to="/login" state={{ from }}>
            {texts.switch.link}
          </Link>
        </p>
      </div>
    </section>
  );
}
