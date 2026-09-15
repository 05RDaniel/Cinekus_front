import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/context/AuthContext';
import { Booking } from '../../../features/bookings/models/booking.model';
import { cancelBooking, getBookingsByUser } from '../../../features/bookings/services/bookings.service';
import { formatSessionSchedule } from '../../../features/screenings/models/screening.model';
import { BackButton } from '../../../shared/components/layout/BackButton';
import { useInitialLoad } from '../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../lang';

function isCancelled(booking: Booking): boolean {
  return booking.status === 'cancelled';
}

export function MyBookingsPage() {
  const texts = usePageTexts('my-bookings');
  const { user } = useAuth();
  const userId = user?.id;
  const loadBookings = useCallback(() => {
    if (!userId) return Promise.resolve([] as Booking[]);
    return getBookingsByUser(userId);
  }, [userId]);
  const { rows, setRows, isLoading, hasLoadError } = useInitialLoad<Booking[]>(loadBookings, []);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const onCancel = async (booking: Booking) => {
    if (!window.confirm(texts.confirmCancel)) return;
    setActionError(null);
    setCancellingId(booking.id);
    try {
      const updated = await cancelBooking(booking.id);
      setRows((prev) =>
        prev.map((row) =>
          row.id === booking.id ? { ...row, ...updated, status: 'cancelled', seats: row.seats } : row
        )
      );
    } catch (error) {
      setActionError(mapApiError(error, texts.errors));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="my-bookings">
      <div className="my-bookings__inner">
        <div className="my-bookings__toolbar">
          <BackButton to="/home" />
        </div>
        <header className="my-bookings__header">
          <h1 className="my-bookings__title">{texts.title}</h1>
          <p className="my-bookings__subtitle">{texts.subtitle}</p>
        </header>

        {actionError && (
          <p className="my-bookings__status my-bookings__status--error" role="alert">
            {actionError}
          </p>
        )}

        {isLoading && (
          <p className="my-bookings__status" role="status">
            {texts.loading}
          </p>
        )}

        {!isLoading && hasLoadError && (
          <p className="my-bookings__status my-bookings__status--error" role="alert">
            {texts.errors.load}
          </p>
        )}

        {!isLoading && !hasLoadError && rows.length === 0 && (
          <div className="my-bookings__empty">
            <p>{texts.empty}</p>
            <Link to="/cartelera" className="admin-btn">
              {texts.goToMovies}
            </Link>
          </div>
        )}

        {!isLoading && !hasLoadError && rows.length > 0 && (
          <ul className="my-bookings__list">
            {rows.map((booking) => {
              const cancelled = isCancelled(booking);
              return (
                <li key={booking.id} className={`my-bookings__card${cancelled ? ' my-bookings__card--cancelled' : ''}`}>
                  <div className="my-bookings__card-main">
                    <h2 className="my-bookings__movie">{booking.movie_title ?? `#${booking.session_id}`}</h2>
                    <p className="my-bookings__meta text-meta">
                      {formatSessionSchedule(booking.session_start_date, booking.session_start_time)}
                    </p>
                    <p className="my-bookings__meta">
                      {texts.seats}: {booking.seats?.length ? booking.seats.join(', ') : '—'}
                    </p>
                    <p className="my-bookings__meta">
                      {texts.total}:{' '}
                      {booking.total_price != null ? `${Number(booking.total_price).toFixed(2)} €` : '—'}
                    </p>
                  </div>
                  <div className="my-bookings__card-side">
                    <span className={`my-bookings__badge${cancelled ? ' my-bookings__badge--cancelled' : ''}`}>
                      {cancelled ? texts.status.cancelled : texts.status.confirmed}
                    </span>
                    {!cancelled && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        disabled={cancellingId === booking.id}
                        onClick={() => void onCancel(booking)}
                      >
                        {cancellingId === booking.id ? texts.cancelling : texts.cancel}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
