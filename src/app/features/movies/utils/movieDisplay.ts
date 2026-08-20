import type { Lang } from '../../../core/context/LanguageContext';
import type { Movie } from '../models/movie.model';

export function mapApiLanguage(language: Lang): 'es' | 'en' {
  return language === 'en-US' ? 'en' : 'es';
}

export function getMovieDisplay(movie: Movie, language: Lang) {
  const useEnglish =
    language === 'en-US' &&
    movie.translation_en?.is_available &&
    Boolean(movie.translation_en.title);

  if (useEnglish && movie.translation_en) {
    return {
      title: movie.translation_en.title,
      sinopsis: movie.translation_en.sinopsis,
    };
  }

  return {
    title: movie.title,
    sinopsis: movie.sinopsis,
  };
}

export function toYoutubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    const videoId = parsed.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    return null;
  }

  return null;
}
