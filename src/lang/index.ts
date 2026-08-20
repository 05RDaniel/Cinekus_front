import { Lang, useLanguage } from '../app/core/context/LanguageContext';

import enHeader from './en/header';
import esHeader from './es/header';
import enFooter from './en/footer';
import esFooter from './es/footer';
import enLogin from './en/login';
import esLogin from './es/login';
import enRegister from './en/register';
import esRegister from './es/register';
import enHome from './en/home';
import esHome from './es/home';
import enCartelera from './en/cartelera';
import esCartelera from './es/cartelera';
import enMovieDetail from './en/movie-detail';
import esMovieDetail from './es/movie-detail';
import enBooking from './en/booking';
import esBooking from './es/booking';
import enAdminHome from './en/admin-home';
import esAdminHome from './es/admin-home';
import enAdminMovies from './en/admin-movies';
import esAdminMovies from './es/admin-movies';
import enAdminSessions from './en/admin-sessions';
import esAdminSessions from './es/admin-sessions';
import enAdminRooms from './en/admin-rooms';
import esAdminRooms from './es/admin-rooms';
import enAdminUsers from './en/admin-users';
import esAdminUsers from './es/admin-users';
import enAdminBookings from './en/admin-bookings';
import esAdminBookings from './es/admin-bookings';

export type LangKey = 'en' | 'es';

export const langToKey = (l: Lang): LangKey => (l === 'en-US' ? 'en' : 'es');

export const dictionaries = {
  header: { en: enHeader, es: esHeader },
  footer: { en: enFooter, es: esFooter },
  login: { en: enLogin, es: esLogin },
  register: { en: enRegister, es: esRegister },
  home: { en: enHome, es: esHome },
  cartelera: { en: enCartelera, es: esCartelera },
  'movie-detail': { en: enMovieDetail, es: esMovieDetail },
  booking: { en: enBooking, es: esBooking },
  'admin-home': { en: enAdminHome, es: esAdminHome },
  'admin-movies': { en: enAdminMovies, es: esAdminMovies },
  'admin-sessions': { en: enAdminSessions, es: esAdminSessions },
  'admin-rooms': { en: enAdminRooms, es: esAdminRooms },
  'admin-users': { en: enAdminUsers, es: esAdminUsers },
  'admin-bookings': { en: enAdminBookings, es: esAdminBookings },
} as const;

export type PageKey = keyof typeof dictionaries;

export function usePageTexts<K extends PageKey>(page: K): (typeof dictionaries)[K]['es'] {
  const { language } = useLanguage();
  return dictionaries[page][langToKey(language)] as (typeof dictionaries)[K]['es'];
}
