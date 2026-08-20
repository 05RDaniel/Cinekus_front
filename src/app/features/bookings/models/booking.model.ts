export interface Booking {
  id: number;
  user_id: number;
  session_id: number;
  created_at: string;
  status_id: number;
  session_start_date?: string | null;
  session_start_time?: string | null;
  movie_title?: string | null;
  user_username?: string | null;
  user_email?: string | null;
}

export function formatBookingUser(booking: Booking): string {
  const label = booking.user_username || booking.user_email;
  return label ? `${booking.user_id} (${label})` : String(booking.user_id);
}
