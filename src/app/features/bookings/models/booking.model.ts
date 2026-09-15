export interface Booking {
  id: number;
  user_id: number;
  session_id: number;
  created_at: string;
  status_id: number;
  total_price?: number;
  session_start_date?: string | null;
  session_start_time?: string | null;
  movie_title?: string | null;
  user_username?: string | null;
  buyer_first_name?: string | null;
  buyer_last_name?: string | null;
  buyer_second_last_name?: string | null;
  buyer_email?: string | null;
  status?: string | null;
  seats?: string[];
  tickets?: BookingTicketLine[];
}

export type BookingTicketLine = {
  ticket_type_id: number;
  code: string;
  name?: string | null;
  quantity: number;
  unit_price: number;
};

export function isBookingCancelled(booking: Booking): boolean {
  return booking.status === 'cancelled';
}

export function formatBookingStatus(
  booking: Booking,
  labels: { confirmed: string; cancelled: string }
): string {
  if (booking.status === 'confirmed') return labels.confirmed;
  if (booking.status === 'cancelled') return labels.cancelled;
  return booking.status?.trim() || (booking.status_id ? String(booking.status_id) : '—');
}

export function formatBuyerName(booking: Booking): string {
  const name = [booking.buyer_first_name, booking.buyer_last_name, booking.buyer_second_last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  return name || '—';
}

export function formatBookingUser(booking: Booking): string {
  const buyer = formatBuyerName(booking);
  if (buyer !== '—') return buyer;
  const username = booking.user_username?.trim();
  return username || '—';
}
