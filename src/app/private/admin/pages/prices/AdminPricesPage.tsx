import { FormEvent, useCallback, useEffect, useState } from 'react';
import { formatPrice, SeatTypePrice, TicketType } from '../../../../features/bookings/models/ticket.model';
import {
  createSeatType,
  createTicketType,
  deleteSeatType,
  deleteTicketType,
  getAdminPrices,
  updateAdminPrices,
} from '../../../../features/bookings/services/prices.service';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useLanguage } from '../../../../core/context/LanguageContext';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';

type PriceDraft = { id: number; price: string };

function toDraft(rows: { id: number; price: number }[]): PriceDraft[] {
  return rows.map((row) => ({ id: row.id, price: String(row.price) }));
}

export function AdminPricesPage() {
  const texts = usePageTexts('admin-prices');
  const { language } = useLanguage();
  const loadPrices = useCallback(() => getAdminPrices(), []);
  const { rows, setRows, isLoading, hasLoadError, setHasLoadError } = useInitialLoad(
    loadPrices,
    { ticket_types: [] as TicketType[], seat_types: [] as SeatTypePrice[] }
  );

  const [ticketDrafts, setTicketDrafts] = useState<PriceDraft[]>([]);
  const [seatDrafts, setSeatDrafts] = useState<PriceDraft[]>([]);
  const [newTicketName, setNewTicketName] = useState('');
  const [newTicketPrice, setNewTicketPrice] = useState('0');
  const [newSeatName, setNewSeatName] = useState('');
  const [newSeatPrice, setNewSeatPrice] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [isAddingSeat, setIsAddingSeat] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || hasLoadError) return;
    setTicketDrafts(toDraft(rows.ticket_types));
    setSeatDrafts(toDraft(rows.seat_types));
  }, [isLoading, hasLoadError, rows]);

  const ticketLabel = (type: TicketType) => {
    if (type.code === 'adult' || type.code === 'child' || type.code === 'senior') {
      return texts.tickets[type.code];
    }
    return type.name;
  };

  const seatLabel = (type: SeatTypePrice) => {
    if (type.name === 'standard' || type.name === 'vip' || type.name === 'accessible') {
      return texts.seats[type.name];
    }
    return type.label || type.name;
  };

  const onPriceChange = (kind: 'ticket' | 'seat', id: number, value: string) => {
    setSuccessMessage(null);
    const setter = kind === 'ticket' ? setTicketDrafts : setSeatDrafts;
    setter((prev) => prev.map((row) => (row.id === id ? { ...row, price: value } : row)));
  };

  const parsePrice = (value: string): number | null => {
    const amount = Number(value.replace(',', '.').trim());
    if (!Number.isFinite(amount) || amount < 0) return null;
    return Math.round(amount * 100) / 100;
  };

  const onAddTicket = async () => {
    const name = newTicketName.trim();
    const price = parsePrice(newTicketPrice);
    if (!name) {
      setFormError(texts.errors.missingName);
      return;
    }
    if (price == null) {
      setFormError(texts.errors.invalidPrice);
      return;
    }
    setIsAddingTicket(true);
    setFormError(null);
    setSuccessMessage(null);
    try {
      const created = await createTicketType({ name, price });
      setRows((prev) => ({ ...prev, ticket_types: [...prev.ticket_types, created] }));
      setNewTicketName('');
      setNewTicketPrice('0');
    } catch (error) {
      setFormError(mapApiError(error, texts.errors));
    } finally {
      setIsAddingTicket(false);
    }
  };

  const onAddSeat = async () => {
    const name = newSeatName.trim();
    const price = parsePrice(newSeatPrice);
    if (!name) {
      setFormError(texts.errors.missingName);
      return;
    }
    if (price == null) {
      setFormError(texts.errors.invalidPrice);
      return;
    }
    setIsAddingSeat(true);
    setFormError(null);
    setSuccessMessage(null);
    try {
      const created = await createSeatType({ name, price });
      setRows((prev) => ({ ...prev, seat_types: [...prev.seat_types, created] }));
      setNewSeatName('');
      setNewSeatPrice('0');
    } catch (error) {
      setFormError(mapApiError(error, texts.errors));
    } finally {
      setIsAddingSeat(false);
    }
  };

  const onDeleteTicket = async (type: TicketType) => {
    if (rows.ticket_types.length <= 1) {
      setFormError(texts.errors.lastTicket);
      return;
    }
    if (!window.confirm(texts.confirmDeleteTicket)) return;
    setDeletingId(`ticket-${type.id}`);
    setFormError(null);
    setSuccessMessage(null);
    try {
      await deleteTicketType(type.id);
      setRows((prev) => ({
        ...prev,
        ticket_types: prev.ticket_types.filter((item) => item.id !== type.id),
      }));
      setSuccessMessage(texts.deleted);
    } catch (error) {
      setFormError(mapApiError(error, texts.errors));
    } finally {
      setDeletingId(null);
    }
  };

  const onDeleteSeat = async (type: SeatTypePrice) => {
    if (rows.seat_types.length <= 1) {
      setFormError(texts.errors.lastSeat);
      return;
    }
    if (!window.confirm(texts.confirmDeleteSeat)) return;
    setDeletingId(`seat-${type.id}`);
    setFormError(null);
    setSuccessMessage(null);
    try {
      await deleteSeatType(type.id);
      setRows((prev) => ({
        ...prev,
        seat_types: prev.seat_types.filter((item) => item.id !== type.id),
      }));
      setSuccessMessage(texts.deleted);
    } catch (error) {
      setFormError(mapApiError(error, texts.errors));
    } finally {
      setDeletingId(null);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ticket_types = ticketDrafts.map((row) => {
      const price = parsePrice(row.price);
      return price == null ? null : { id: row.id, price };
    });
    const seat_types = seatDrafts.map((row) => {
      const price = parsePrice(row.price);
      return price == null ? null : { id: row.id, price };
    });

    if (ticket_types.includes(null) || seat_types.includes(null)) {
      setFormError(texts.errors.invalidPrice);
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);
    try {
      const next = await updateAdminPrices({
        ticket_types: ticket_types.filter((row): row is { id: number; price: number } => row != null),
        seat_types: seat_types.filter((row): row is { id: number; price: number } => row != null),
      });
      setRows(next);
      setSuccessMessage(texts.saved);
    } catch (error) {
      setFormError(mapApiError(error, texts.errors));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page__inner">
        <AdminPageHeader backTo="/admin/home" title={texts.title} subtitle={texts.subtitle} />

        {isLoading && <p className="admin-alert">{texts.loading}</p>}
        {hasLoadError && <p className="admin-alert admin-alert--error">{texts.errors.generic}</p>}

        {!isLoading && !hasLoadError && (
          <form className="admin-prices" onSubmit={(event) => void onSubmit(event)}>
            {formError && <p className="admin-alert admin-alert--error">{formError}</p>}
            {successMessage && <p className="admin-alert admin-alert--success">{successMessage}</p>}

            <section className="admin-prices__section">
              <h2 className="admin-prices__heading">{texts.tickets.title}</h2>
              <p className="admin-prices__hint">{texts.tickets.hint}</p>
              <ul className="admin-prices__list">
                {rows.ticket_types.map((type) => {
                  const draft = ticketDrafts.find((row) => row.id === type.id);
                  return (
                    <li key={type.id} className="admin-prices__row">
                      <label className="admin-prices__label" htmlFor={`ticket-price-${type.id}`}>
                        {ticketLabel(type)}
                      </label>
                      <input
                        id={`ticket-price-${type.id}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={draft?.price ?? ''}
                        onChange={(event) => onPriceChange('ticket', type.id, event.target.value)}
                      />
                      <span className="admin-prices__preview">
                        {formatPrice(parsePrice(draft?.price ?? '') ?? 0, language)}
                      </span>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => void onDeleteTicket(type)}
                        disabled={rows.ticket_types.length <= 1 || deletingId === `ticket-${type.id}`}
                      >
                        {texts.delete}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="admin-prices__add">
                <input
                  type="text"
                  value={newTicketName}
                  onChange={(event) => setNewTicketName(event.target.value)}
                  placeholder={texts.tickets.namePlaceholder}
                  aria-label={texts.tickets.namePlaceholder}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={newTicketPrice}
                  onChange={(event) => setNewTicketPrice(event.target.value)}
                  aria-label={texts.price}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={() => void onAddTicket()}
                  disabled={isAddingTicket}
                >
                  {isAddingTicket ? texts.adding : texts.add}
                </button>
              </div>
            </section>

            <section className="admin-prices__section">
              <h2 className="admin-prices__heading">{texts.seats.title}</h2>
              <p className="admin-prices__hint">{texts.seats.hint}</p>
              <ul className="admin-prices__list">
                {rows.seat_types.map((type) => {
                  const draft = seatDrafts.find((row) => row.id === type.id);
                  return (
                    <li key={type.id} className="admin-prices__row">
                      <label className="admin-prices__label" htmlFor={`seat-price-${type.id}`}>
                        {seatLabel(type)}
                      </label>
                      <input
                        id={`seat-price-${type.id}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={draft?.price ?? ''}
                        onChange={(event) => onPriceChange('seat', type.id, event.target.value)}
                      />
                      <span className="admin-prices__preview">
                        {formatPrice(parsePrice(draft?.price ?? '') ?? 0, language)}
                      </span>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        onClick={() => void onDeleteSeat(type)}
                        disabled={rows.seat_types.length <= 1 || deletingId === `seat-${type.id}`}
                      >
                        {texts.delete}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="admin-prices__add">
                <input
                  type="text"
                  value={newSeatName}
                  onChange={(event) => setNewSeatName(event.target.value)}
                  placeholder={texts.seats.namePlaceholder}
                  aria-label={texts.seats.namePlaceholder}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={newSeatPrice}
                  onChange={(event) => setNewSeatPrice(event.target.value)}
                  aria-label={texts.price}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={() => void onAddSeat()}
                  disabled={isAddingSeat}
                >
                  {isAddingSeat ? texts.adding : texts.add}
                </button>
              </div>
            </section>

            <div className="admin-prices__actions">
              <button type="submit" className="admin-btn" disabled={isSaving}>
                {isSaving ? texts.saving : texts.save}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
