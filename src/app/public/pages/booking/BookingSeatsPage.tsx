import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../auth/context/AuthContext';
import { createBooking } from '../../../features/bookings/services/bookings.service';
import {
  emptyTicketSelection,
  formatPrice,
  TicketSelection,
  TicketTypeId,
  TICKET_PRICES,
  TICKET_TYPE_IDS,
  totalPrice,
  totalTickets,
} from '../../../features/bookings/models/ticket.model';
import { Session, formatSessionSchedule, sessionTypeLabel } from '../../../features/screenings/models/screening.model';
import { getSessionById } from '../../../features/screenings/services/screenings.service';
import { groupSeatsByRow, seatCode, SessionSeat } from '../../../features/seats/models/seat.model';
import { getSeatsBySession } from '../../../features/seats/services/seats.service';
import { useLanguage } from '../../../core/context/LanguageContext';
import { BackButton } from '../../../shared/components/layout/BackButton';
import { mapApiError } from '../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../lang';

type BookingStep = 'tickets' | 'seats' | 'details';

const MAX_TICKETS = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS: BookingStep[] = ['tickets', 'seats', 'details'];

export function BookingSeatsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const texts = usePageTexts('booking');
  const navigate = useNavigate();
  const location = useLocation();

  const parsedSessionId = Number(sessionId);

  const goToLogin = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const [session, setSession] = useState<Session | null>(null);
  const [seats, setSeats] = useState<SessionSeat[]>([]);
  const [step, setStep] = useState<BookingStep>('tickets');
  const [ticketSelection, setTicketSelection] = useState<TicketSelection>(emptyTicketSelection);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [firstName, setFirstName] = useState('');
  const [firstSurname, setFirstSurname] = useState('');
  const [secondSurname, setSecondSurname] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [detailsPrefillDone, setDetailsPrefillDone] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [confirmedSeats, setConfirmedSeats] = useState<string[]>([]);
  const [confirmedTickets, setConfirmedTickets] = useState<TicketSelection | null>(null);

  const ticketCount = totalTickets(ticketSelection);
  const priceTotal = totalPrice(ticketSelection);

  const loadData = async () => {
    if (!Number.isFinite(parsedSessionId)) {
      setSession(null);
      setSeats([]);
      setHasLoadError(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasLoadError(false);
      setActionError(null);
      const [sessionData, seatsData] = await Promise.all([
        getSessionById(parsedSessionId),
        getSeatsBySession(parsedSessionId),
      ]);
      setSession(sessionData);
      setSeats(seatsData);
      if (!sessionData) setHasLoadError(true);
    } catch {
      setSession(null);
      setSeats([]);
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('tickets');
    setTicketSelection(emptyTicketSelection());
    setSelectedIds([]);
    setBookingId(null);
    setConfirmedSeats([]);
    setConfirmedTickets(null);
    setActionError(null);
    setDetailsPrefillDone(false);
  };

  useEffect(() => {
    void loadData();
    resetFlow();
  }, [parsedSessionId]);

  useEffect(() => {
    if (!user || detailsPrefillDone) return;
    setFirstName((prev) => prev || user.username || '');
    setEmail((prev) => prev || user.email || '');
    setEmailConfirmation((prev) => prev || user.email || '');
    setDetailsPrefillDone(true);
  }, [user, detailsPrefillDone]);

  const rows = useMemo(() => groupSeatsByRow(seats), [seats]);
  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedIds.includes(seat.id)),
    [seats, selectedIds]
  );
  const selectedCodes = useMemo(() => selectedSeats.map(seatCode).sort(), [selectedSeats]);

  const backTo = session?.movie_id ? `/cartelera/${session.movie_id}` : '/cartelera';

  const ticketLabel = (id: TicketTypeId) => texts.tickets[id];

  const ticketsSummary = useMemo(() => {
    return TICKET_TYPE_IDS.filter((id) => ticketSelection[id] > 0)
      .map((id) => `${ticketSelection[id]}× ${ticketLabel(id)}`)
      .join(', ');
  }, [ticketSelection, texts.tickets]);

  const setTicketQty = (id: TicketTypeId, next: number) => {
    setActionError(null);
    setTicketSelection((prev) => {
      const clamped = Math.max(0, Math.min(MAX_TICKETS, next));
      const draft = { ...prev, [id]: clamped };
      const total = totalTickets(draft);
      if (total > MAX_TICKETS) {
        setActionError(texts.errors.maxTickets.replace('{max}', String(MAX_TICKETS)));
        return prev;
      }
      return draft;
    });
  };

  const toggleSeat = (seat: SessionSeat) => {
    if (seat.occupied || bookingId != null) return;

    setActionError(null);
    setSelectedIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      }
      if (prev.length >= ticketCount) {
        setActionError(texts.errors.seatsMismatch.replace('{count}', String(ticketCount)));
        return prev;
      }
      return [...prev, seat.id];
    });
  };

  const goNextFromTickets = () => {
    if (ticketCount < 1) {
      setActionError(texts.errors.noTickets);
      return;
    }
    setSelectedIds((prev) => (prev.length > ticketCount ? prev.slice(0, ticketCount) : prev));
    setActionError(null);
    setStep('seats');
  };

  const goNextFromSeats = () => {
    if (selectedIds.length !== ticketCount) {
      setActionError(texts.errors.seatsMismatch.replace('{count}', String(ticketCount)));
      return;
    }
    setActionError(null);
    setStep('details');
  };

  const onConfirm = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedFirstSurname = firstSurname.trim();
    const trimmedEmail = email.trim();
    const trimmedEmailConfirmation = emailConfirmation.trim();

    if (!trimmedFirst || !trimmedFirstSurname || !trimmedEmail || !trimmedEmailConfirmation) {
      setActionError(texts.errors.missingDetails);
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setActionError(texts.errors.invalidEmail);
      return;
    }
    if (trimmedEmail.toLowerCase() !== trimmedEmailConfirmation.toLowerCase()) {
      setActionError(texts.errors.emailMismatch);
      return;
    }
    if (!isAuthenticated || !user) {
      goToLogin();
      return;
    }
    if (selectedIds.length !== ticketCount || ticketCount < 1) {
      setActionError(texts.errors.seatsMismatch.replace('{count}', String(ticketCount)));
      return;
    }
    if (!Number.isFinite(parsedSessionId)) return;

    setIsSaving(true);
    setActionError(null);
    try {
      const booking = await createBooking({
        user_id: user.id,
        session_id: parsedSessionId,
        seat_ids: selectedIds,
      });
      setBookingId(booking.id);
      setConfirmedSeats(selectedCodes);
      setConfirmedTickets({ ...ticketSelection });
      setSelectedIds([]);
      const seatsData = await getSeatsBySession(parsedSessionId);
      setSeats(seatsData);
    } catch (error) {
      setActionError(
        mapApiError(error, {
          sessionExpired: texts.errors.sessionExpired,
          forbidden: texts.errors.forbidden,
          generic: texts.errors.generic,
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="booking-page">
        <div className="booking-page__inner">
          <p className="booking-page__status" role="status">
            {texts.loading}
          </p>
        </div>
      </section>
    );
  }

  if (hasLoadError || !session) {
    return (
      <section className="booking-page">
        <div className="booking-page__inner">
          <div className="booking-page__toolbar">
            <BackButton to="/cartelera" />
          </div>
          <p className="booking-page__status booking-page__status--error" role="alert">
            {hasLoadError ? texts.error : texts.sessionError}
          </p>
        </div>
      </section>
    );
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <section className="booking-page" aria-labelledby="booking-title">
      <div className="booking-page__inner">
        <div className="booking-page__toolbar">
          <BackButton to={backTo} />
        </div>

        <h1 id="booking-title" className="booking-page__title">
          {texts.title}
        </h1>

        {bookingId != null ? (
          <div className="booking-page__success">
            <h2 className="booking-page__success-title">{texts.success.title}</h2>
            <p className="booking-page__success-line">
              <span className="text-meta">{texts.success.bookingId}</span>
              <strong>#{bookingId}</strong>
            </p>
            <p className="booking-page__success-line">
              <span className="text-meta">{texts.success.tickets}</span>
              <strong>
                {confirmedTickets
                  ? TICKET_TYPE_IDS.filter((id) => confirmedTickets[id] > 0)
                      .map((id) => `${confirmedTickets[id]}× ${ticketLabel(id)}`)
                      .join(', ')
                  : texts.summary.none}
              </strong>
            </p>
            <p className="booking-page__success-line">
              <span className="text-meta">{texts.success.seats}</span>
              <strong>{confirmedSeats.join(', ')}</strong>
            </p>
            <div className="booking-page__success-actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => {
                  resetFlow();
                  void loadData();
                }}
              >
                {texts.success.another}
              </button>
              <Link to="/cartelera" className="admin-btn">
                {texts.success.toCartelera}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ol className="booking-page__steps" aria-label={texts.title}>
              {STEPS.map((id, index) => {
                const isCurrent = id === step;
                const isDone = index < stepIndex;
                return (
                  <li
                    key={id}
                    className={[
                      'booking-page__step',
                      isCurrent ? 'booking-page__step--current' : '',
                      isDone ? 'booking-page__step--done' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span className="booking-page__step-index">{index + 1}</span>
                    <span className="booking-page__step-label">{texts.steps[id]}</span>
                  </li>
                );
              })}
            </ol>

            <div className="booking-page__layout">
              <div className="booking-page__main-panel">
                {step === 'tickets' && (
                  <div className="booking-page__panel">
                    <h2 className="booking-page__panel-title">{texts.tickets.title}</h2>
                    <p className="booking-page__panel-hint">{texts.tickets.hint}</p>

                    <ul className="booking-page__ticket-list">
                      {TICKET_TYPE_IDS.map((id) => (
                        <li key={id} className="booking-page__ticket-row">
                          <div className="booking-page__ticket-info">
                            <span className="booking-page__ticket-name">{ticketLabel(id)}</span>
                            <span className="booking-page__ticket-price">
                              {formatPrice(TICKET_PRICES[id], language)}
                            </span>
                          </div>
                          <div className="booking-page__ticket-qty" aria-label={texts.tickets.quantity}>
                            <button
                              type="button"
                              className="booking-page__qty-btn"
                              aria-label="-"
                              disabled={ticketSelection[id] === 0}
                              onClick={() => setTicketQty(id, ticketSelection[id] - 1)}
                            >
                              −
                            </button>
                            <span className="booking-page__qty-value">{ticketSelection[id]}</span>
                            <button
                              type="button"
                              className="booking-page__qty-btn"
                              aria-label="+"
                              disabled={ticketCount >= MAX_TICKETS}
                              onClick={() => setTicketQty(id, ticketSelection[id] + 1)}
                            >
                              +
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="booking-page__ticket-totals">
                      <p>
                        <span className="text-meta">{texts.tickets.total}</span>
                        <strong>{ticketCount}</strong>
                      </p>
                      <p>
                        <span className="text-meta">{texts.tickets.price}</span>
                        <strong>{formatPrice(priceTotal, language)}</strong>
                      </p>
                    </div>

                    {actionError && (
                      <p className="booking-page__status booking-page__status--error" role="alert">
                        {actionError}
                      </p>
                    )}

                    <div className="booking-page__actions">
                      <button type="button" className="admin-btn" onClick={goNextFromTickets}>
                        {texts.actions.next}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'seats' && (
                  <div className="booking-page__map-panel">
                    <h2 className="booking-page__panel-title">{texts.seats.title}</h2>
                    <p className="booking-page__panel-hint">
                      {texts.seats.hint.replace('{count}', String(ticketCount))}
                    </p>

                    <div className="booking-page__screen" aria-hidden="true">
                      {texts.seats.screen}
                    </div>

                    <div className="booking-page__legend">
                      <span className="booking-page__legend-item">
                        <span className="booking-page__seat booking-page__seat--legend" />
                        {texts.legend.available}
                      </span>
                      <span className="booking-page__legend-item">
                        <span className="booking-page__seat booking-page__seat--legend booking-page__seat--selected" />
                        {texts.legend.selected}
                      </span>
                      <span className="booking-page__legend-item">
                        <span className="booking-page__seat booking-page__seat--legend booking-page__seat--occupied" />
                        {texts.legend.occupied}
                      </span>
                    </div>

                    <div className="booking-page__rows">
                      {rows.map(({ row, seats: rowSeats }) => (
                        <div key={row} className="booking-page__row">
                          <span className="booking-page__row-label">{row}</span>
                          <div className="booking-page__row-seats">
                            {rowSeats.map((seat) => {
                              const isSelected = selectedIds.includes(seat.id);
                              const className = [
                                'booking-page__seat',
                                seat.occupied ? 'booking-page__seat--occupied' : '',
                                isSelected ? 'booking-page__seat--selected' : '',
                              ]
                                .filter(Boolean)
                                .join(' ');

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  className={className}
                                  disabled={seat.occupied}
                                  aria-pressed={isSelected}
                                  aria-label={seatCode(seat)}
                                  title={seatCode(seat)}
                                  onClick={() => toggleSeat(seat)}
                                >
                                  {seat.number}
                                </button>
                              );
                            })}
                          </div>
                          <span className="booking-page__row-label">{row}</span>
                        </div>
                      ))}
                    </div>

                    {actionError && (
                      <p className="booking-page__status booking-page__status--error" role="alert">
                        {actionError}
                      </p>
                    )}

                    <div className="booking-page__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={() => {
                          setActionError(null);
                          setStep('tickets');
                        }}
                      >
                        {texts.actions.back}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        onClick={() => {
                          setSelectedIds([]);
                          setActionError(null);
                        }}
                        disabled={selectedIds.length === 0}
                      >
                        {texts.actions.clear}
                      </button>
                      <button type="button" className="admin-btn" onClick={goNextFromSeats}>
                        {texts.actions.next}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'details' && (
                  <div className="booking-page__panel">
                    <h2 className="booking-page__panel-title">{texts.details.title}</h2>
                    <p className="booking-page__panel-hint">{texts.details.hint}</p>

                    <form
                      className="booking-page__details-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void onConfirm();
                      }}
                    >
                      <label className="booking-page__field">
                        <span>{texts.details.firstName}</span>
                        <input
                          type="text"
                          name="firstName"
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(event) => {
                            setFirstName(event.target.value);
                            setActionError(null);
                          }}
                          required
                        />
                      </label>
                      <label className="booking-page__field">
                        <span>{texts.details.firstSurname}</span>
                        <input
                          type="text"
                          name="firstSurname"
                          autoComplete="family-name"
                          value={firstSurname}
                          onChange={(event) => {
                            setFirstSurname(event.target.value);
                            setActionError(null);
                          }}
                          required
                        />
                      </label>
                      <label className="booking-page__field">
                        <span>{texts.details.secondSurname}</span>
                        <input
                          type="text"
                          name="secondSurname"
                          autoComplete="additional-name"
                          value={secondSurname}
                          onChange={(event) => {
                            setSecondSurname(event.target.value);
                            setActionError(null);
                          }}
                        />
                      </label>
                      <label className="booking-page__field">
                        <span>{texts.details.email}</span>
                        <input
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setActionError(null);
                          }}
                          required
                        />
                      </label>
                      <label className="booking-page__field">
                        <span>{texts.details.emailConfirm}</span>
                        <input
                          type="email"
                          name="emailConfirmation"
                          autoComplete="email"
                          value={emailConfirmation}
                          onChange={(event) => {
                            setEmailConfirmation(event.target.value);
                            setActionError(null);
                          }}
                          required
                        />
                      </label>

                      {!isAuthenticated && (
                        <div className="booking-page__auth-hint">
                          <p>{texts.auth.required}</p>
                          <button type="button" className="admin-btn" onClick={goToLogin}>
                            {texts.auth.login}
                          </button>
                        </div>
                      )}

                      {actionError && (
                        <p className="booking-page__status booking-page__status--error" role="alert">
                          {actionError}
                        </p>
                      )}

                      <div className="booking-page__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          onClick={() => {
                            setActionError(null);
                            setStep('seats');
                          }}
                          disabled={isSaving}
                        >
                          {texts.actions.back}
                        </button>
                        <button type="submit" className="admin-btn" disabled={isSaving}>
                          {isSaving ? texts.actions.confirming : texts.actions.confirm}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <aside className="booking-page__summary">
                <h2 className="booking-page__summary-title">{texts.summary.title}</h2>

                <dl className="booking-page__summary-list">
                  <div className="booking-page__summary-item">
                    <dt>{texts.summary.movie}</dt>
                    <dd>{session.movie_title ?? `#${session.movie_id}`}</dd>
                  </div>
                  <div className="booking-page__summary-item">
                    <dt>{texts.summary.schedule}</dt>
                    <dd>
                      {formatSessionSchedule(session.start_date, session.start_time)}
                      {' · '}
                      {sessionTypeLabel(session.session_type, {
                        type2d: '2D',
                        type3d: '3D',
                        type4d: '4D',
                      })}
                    </dd>
                  </div>
                  <div className="booking-page__summary-item">
                    <dt>{texts.summary.room}</dt>
                    <dd>{session.room_name ?? `#${session.room_id}`}</dd>
                  </div>
                  <div className="booking-page__summary-item">
                    <dt>{texts.summary.tickets}</dt>
                    <dd>
                      {ticketCount > 0 ? (
                        <>
                          {ticketsSummary}
                          <span className="booking-page__summary-price">
                            {formatPrice(priceTotal, language)}
                          </span>
                        </>
                      ) : (
                        texts.summary.none
                      )}
                    </dd>
                  </div>
                  <div className="booking-page__summary-item">
                    <dt>{texts.summary.seats}</dt>
                    <dd>
                      {selectedCodes.length > 0
                        ? `${selectedCodes.join(', ')} (${selectedCodes.length}/${ticketCount || '—'})`
                        : texts.summary.none}
                    </dd>
                  </div>
                  {step === 'details' && (firstName || firstSurname || secondSurname || email) && (
                    <div className="booking-page__summary-item">
                      <dt>{texts.summary.buyer}</dt>
                      <dd>
                        {[firstName, firstSurname, secondSurname].filter((part) => part.trim()).join(' ') ||
                          texts.summary.none}
                        {email ? <span className="booking-page__summary-price">{email}</span> : null}
                      </dd>
                    </div>
                  )}
                </dl>
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
