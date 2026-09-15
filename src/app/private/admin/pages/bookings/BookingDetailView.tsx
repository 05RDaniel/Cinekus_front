import {
  Booking,
  formatBookingStatus,
  formatBookingUser,
  formatBuyerName,
} from '../../../../features/bookings/models/booking.model';
import { formatSessionSchedule } from '../../../../features/screenings/models/screening.model';

type BookingDetailViewProps = {
  booking: Booking;
  labels: {
    id: string;
    userId: string;
    sessionId: string;
    movie: string;
    sessionStart: string;
    createdAt: string;
    statusId: string;
    total: string;
    buyerName: string;
    buyerEmail: string;
    seats: string;
    tickets: string;
  };
  statusLabels: {
    confirmed: string;
    cancelled: string;
  };
};

export function BookingDetailView({ booking, labels, statusLabels }: BookingDetailViewProps) {
  return (
    <div className="crud-detail crud-detail--two-cols">
      <dl className="crud-detail__col">
        <div className="crud-detail__item">
          <dt>{labels.id}</dt>
          <dd>{booking.id}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.sessionId}</dt>
          <dd>{booking.session_id}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.movie}</dt>
          <dd>{booking.movie_title ?? '—'}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.sessionStart}</dt>
          <dd>{formatSessionSchedule(booking.session_start_date, booking.session_start_time)}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.createdAt}</dt>
          <dd>{booking.created_at ? new Date(booking.created_at).toLocaleString() : '—'}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.statusId}</dt>
          <dd>{formatBookingStatus(booking, statusLabels)}</dd>
        </div>
      </dl>

      <dl className="crud-detail__col">
        <div className="crud-detail__item">
          <dt>{labels.userId}</dt>
          <dd>{formatBookingUser(booking)}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.buyerName}</dt>
          <dd>{formatBuyerName(booking)}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.buyerEmail}</dt>
          <dd>{booking.buyer_email?.trim() || '—'}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.seats}</dt>
          <dd>{booking.seats?.length ? booking.seats.join(', ') : '—'}</dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.tickets}</dt>
          <dd>
            {booking.tickets?.length ? (
              <ul className="crud-detail__list">
                {booking.tickets.map((line) => (
                  <li key={`${line.ticket_type_id}-${line.code}`}>
                    {line.quantity}× {line.name || line.code} ({Number(line.unit_price).toFixed(2)} €)
                  </li>
                ))}
              </ul>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div className="crud-detail__item">
          <dt>{labels.total}</dt>
          <dd>{booking.total_price != null ? `${Number(booking.total_price).toFixed(2)} €` : '—'}</dd>
        </div>
      </dl>
    </div>
  );
}
