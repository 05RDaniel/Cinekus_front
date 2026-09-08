import axios from 'axios';

export type ApiErrorMessages = {
  sessionExpired: string;
  forbidden: string;
  generic: string;
};

export function mapApiError(error: unknown, messages: ApiErrorMessages): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return messages.sessionExpired;
    if (error.response?.status === 403) return messages.forbidden;
    const data = error.response?.data as
      | { message?: string; details?: Record<string, string[] | string> }
      | undefined;
    if (data?.details && typeof data.details === 'object') {
      const first = Object.values(data.details)[0];
      if (Array.isArray(first) && first[0]) return first[0];
      if (typeof first === 'string' && first) return first;
    }
    return data?.message ?? messages.generic;
  }
  return messages.generic;
}
