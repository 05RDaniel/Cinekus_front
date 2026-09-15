import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/context/AuthContext';
import { getMe, updateProfile } from '../../../auth/services/auth.service';
import { BackButton } from '../../../shared/components/layout/BackButton';
import { mapApiError } from '../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../lang';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firstValidationMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as
    | { message?: string; errors?: Record<string, string[]>; details?: Record<string, string[] | string> }
    | undefined;
  const bag = data?.errors ?? data?.details;
  if (bag && typeof bag === 'object') {
    const first = Object.values(bag)[0];
    if (Array.isArray(first) && first[0]) return first[0];
    if (typeof first === 'string' && first) return first;
  }
  return data?.message ?? null;
}

export function ProfilePage() {
  const texts = usePageTexts('profile');
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [secondLastName, setSecondLastName] = useState(user?.second_last_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getMe();
        if (!mounted) return;
        updateUser(data);
        setFirstName(data.first_name ?? '');
        setLastName(data.last_name ?? '');
        setSecondLastName(data.second_last_name ?? '');
        setEmail(data.email ?? '');
      } catch (error) {
        if (mounted) {
          setFormError(
            firstValidationMessage(error) ||
              mapApiError(error, {
                sessionExpired: texts.errors.sessionExpired,
                forbidden: texts.errors.forbidden,
                generic: texts.errors.load,
              })
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedFirst || !trimmedLast || !trimmedEmail) {
      setSuccess(false);
      setFormError(texts.errors.missingFields);
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setSuccess(false);
      setFormError(texts.errors.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSuccess(false);
    try {
      const data = await updateProfile({
        first_name: trimmedFirst,
        last_name: trimmedLast,
        second_last_name: secondLastName.trim() || null,
        email: trimmedEmail,
      });
      updateUser(data);
      setFirstName(data.first_name ?? '');
      setLastName(data.last_name ?? '');
      setSecondLastName(data.second_last_name ?? '');
      setEmail(data.email ?? '');
      setSuccess(true);
    } catch (error) {
      setFormError(
        firstValidationMessage(error) ||
          mapApiError(error, {
            sessionExpired: texts.errors.sessionExpired,
            forbidden: texts.errors.forbidden,
            generic: texts.errors.generic,
          })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-page__inner">
        <div className="profile-page__toolbar">
          <BackButton to="/home" />
        </div>
        <div className="login-page__card">
          <h1 id="profile-title" className="login-page__title">
            {texts.title}
          </h1>
          <p className="login-page__subtitle">{texts.subtitle}</p>

          {isLoading ? (
            <p className="profile-page__status" role="status">
              {texts.loading}
            </p>
          ) : (
            <form className="login-page__form" onSubmit={onSubmit}>
              {formError && (
                <div className="login-page__error" role="alert">
                  {formError}
                </div>
              )}
              {success && !formError && (
                <div className="login-page__success" role="status">
                  {texts.saved}
                </div>
              )}

              <label className="login-page__field" htmlFor="profile-first-name">
                <span>{texts.fields.firstNameLabel}</span>
                <input
                  id="profile-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setSuccess(false);
                  }}
                  required
                />
              </label>

              <label className="login-page__field" htmlFor="profile-last-name">
                <span>{texts.fields.lastNameLabel}</span>
                <input
                  id="profile-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    setSuccess(false);
                  }}
                  required
                />
              </label>

              <label className="login-page__field" htmlFor="profile-second-last-name">
                <span>{texts.fields.secondLastNameLabel}</span>
                <input
                  id="profile-second-last-name"
                  type="text"
                  autoComplete="additional-name"
                  value={secondLastName}
                  onChange={(event) => {
                    setSecondLastName(event.target.value);
                    setSuccess(false);
                  }}
                />
              </label>

              <label className="login-page__field" htmlFor="profile-email">
                <span>{texts.fields.emailLabel}</span>
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setSuccess(false);
                  }}
                  required
                />
              </label>

              <div className="login-page__actions">
                <button type="submit" className="admin-btn" disabled={isSubmitting}>
                  {isSubmitting ? texts.buttons.saving : texts.buttons.save}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
