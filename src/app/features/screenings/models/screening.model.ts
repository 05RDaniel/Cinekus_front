export type SessionType = '2d' | '3d' | '4d';

export type SessionSubtitles = 'none' | 'es' | 'en';

export interface CinemaLanguage {
  id: number;
  code: string;
  name: string;
}

export interface Session {
  id: number;
  movie_id: number;
  room_id: number;
  language_id: number;
  language_code?: string | null;
  language_name?: string | null;
  session_type: SessionType;
  subtitles: SessionSubtitles | null;
  start_date: string;
  start_time: string;
  movie_title?: string | null;
  room_name?: string | null;
}

export interface SessionPayload {
  movie_id: number;
  room_id: number;
  language_id: number;
  session_type: SessionType;
  subtitles?: SessionSubtitles | null;
  start_date: string;
  start_time: string;
}

export const PRIMARY_SESSION_LANGUAGE_CODE = 'es';

export const SESSION_TYPES: SessionType[] = ['2d', '3d', '4d'];

export const SESSION_SUBTITLE_OPTIONS: SessionSubtitles[] = ['none', 'es', 'en'];

export type SessionTypeLabels = {
  type2d: string;
  type3d: string;
  type4d: string;
};

export function sessionTypeLabel(type: SessionType, labels: SessionTypeLabels): string {
  if (type === '3d') return labels.type3d;
  if (type === '4d') return labels.type4d;
  return labels.type2d;
}

export function formatSessionTime(time: string | null | undefined): string {
  if (!time) return '';
  return time.slice(0, 5);
}

export function formatSessionSchedule(
  date: string | null | undefined,
  time: string | null | undefined
): string {
  if (!date) return '—';
  const formattedTime = formatSessionTime(time);
  return formattedTime ? `${date} ${formattedTime}` : date;
}
