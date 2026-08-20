import { Booking, formatBookingUser } from '../../../../features/bookings/models/booking.model';
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
  };
};

export function BookingDetailView({ booking, labels }: BookingDetailViewProps) {
  return (
    <dl className="crud-detail">
      <div className="crud-detail__item">
        <dt>{labels.id}</dt>
        <dd>{booking.id}</dd>
      </div>
      <div className="crud-detail__item">
        <dt>{labels.userId}</dt>
        <dd>{formatBookingUser(booking)}</dd>
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
        <dd>{booking.status_id}</dd>
      </div>
    </dl>
  );
}
