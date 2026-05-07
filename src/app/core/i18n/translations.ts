export type TranslationLanguage = 'en-US' | 'es-ES';
type TranslationKey = 'en' | 'es';

export function langToKey(language: TranslationLanguage): TranslationKey {
  return language === 'en-US' ? 'en' : 'es';
}

export const translations = {
  header: {
    branding: {
      en: { appName: 'Cinekus' },
      es: { appName: 'Cinekus' },
    },
    navigation: {
      en: { nowShowing: 'Now Showing', offers: 'Offers', admin: 'Admin' },
      es: { nowShowing: 'Cartelera', offers: 'Ofertas', admin: 'Admin' },
    },
    menu: {
      en: {
        openMenuAriaLabel: 'Open menu',
        languageLabel: 'Language',
        languageSpanish: 'Spanish',
        languageEnglish: 'English',
        loginButton: 'Sign in',
      },
      es: {
        openMenuAriaLabel: 'Abrir menu',
        languageLabel: 'Idioma',
        languageSpanish: 'Espanol',
        languageEnglish: 'English',
        loginButton: 'Iniciar sesion',
      },
    },
  },
  home: {
    hero: {
      en: { title: 'You might like...' },
      es: { title: 'Quizas te gusten...' },
    },
    loading: {
      en: { spinnerAriaLabel: 'Loading movies' },
      es: { spinnerAriaLabel: 'Cargando peliculas' },
    },
    alerts: {
      en: { retryingMessage: 'Movies could not be loaded. Retrying...' },
      es: { retryingMessage: 'No se pudieron cargar peliculas. Reintentando...' },
    },
    card: {
      en: { imageAlt: 'Featured movie', ratingLabel: 'Rating' },
      es: { imageAlt: 'Pelicula destacada', ratingLabel: 'Calificacion' },
    },
  },
  footer: {
    main: {
      en: { copyright: 'Cinekus © 2026' },
      es: { copyright: 'Cinekus © 2026' },
    },
  },
} as const;
