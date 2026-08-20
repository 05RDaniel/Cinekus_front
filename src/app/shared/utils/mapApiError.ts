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
    const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
    return apiMessage ?? messages.generic;
  }
  return messages.generic;
}
