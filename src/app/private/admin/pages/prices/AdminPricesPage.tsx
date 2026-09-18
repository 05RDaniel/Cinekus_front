import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  normalizePriceMode,
  PriceMode,
  SeatTypePrice,
  TicketType,
} from '../../../../features/bookings/models/ticket.model';
import {
  createSeatType,
  createTicketType,
  deleteSeatType,
  deleteTicketType,
  getAdminPrices,
  updateAdminPrices,
} from '../../../../features/bookings/services/prices.service';
import { AdminPageHeader } from '../../../../shared/components/layout/AdminPageHeader';
import { useInitialLoad } from '../../../../shared/hooks/useInitialLoad';
import { mapApiError } from '../../../../shared/utils/mapApiError';
import { usePageTexts } from '../../../../../lang';

type PriceDraft = { id: number; price: string; price_mode: PriceMode };

function formatDecimal(value: number | string): string {
  const amount = typeof value === 'number' ? value : Number(String(value).replace(',', '.').trim());
  if (!Number.isFinite(amount)) return '';
  return amount.toFixed(2);
}

function toDraft(rows: { id: number; price: number; price_mode?: PriceMode }[]): PriceDraft[] {
  return rows.map((row) => ({
    id: row.id,
    price: formatDecimal(row.price),
    price_mode: normalizePriceMode(row.price_mode),
  }));
}

export function AdminPricesPage() {
  const texts = usePageTexts('admin-prices');
  const loadPrices = useCallback(() => getAdminPrices(), []);
  const { rows, setRows, isLoading, hasLoadError, setHasLoadError } = useInitialLoad(
    loadPrices,
    { ticket_types: [] as TicketType[], seat_types: [] as SeatTypePrice[] }
  );

  const [ticketDrafts, setTicketDrafts] = useState<PriceDraft[]>([]);
  const [seatDrafts, setSeatDrafts] = useState<PriceDraft[]>([]);
  const [newTicketName, setNewTicketName] = useState('');
  const [newTicketPrice, setNewTicketPrice] = useState('0.00');
  const [newTicketMode, setNewTicketMode] = useState<PriceMode>('amount');
  const [newSeatName, setNewSeatName] = useState('');
  const [newSeatPrice, setNewSeatPrice] = useState('0.00');
  const [newSeatMode, setNewSeatMode] = useState<PriceMode>('amount');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [isAddingSeat, setIsAddingSeat] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openModeId, setOpenModeId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || hasLoadError) return;
    setTicketDrafts(toDraft(rows.ticket_types));
    setSeatDrafts(toDraft(rows.seat_types));
  }, [isLoading, hasLoadError, rows]);

  useEffect(() => {
    if (!openModeId) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('.admin-prices__mode')) setOpenModeId(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenModeId(null);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openModeId]);

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

  const onDraftChange = (
    kind: 'ticket' | 'seat',
    id: number,
    patch: Partial<Pick<PriceDraft, 'price' | 'price_mode'>>
  ) => {
    setSuccessMessage(null);
    const setter = kind === 'ticket' ? setTicketDrafts : setSeatDrafts;
    setter((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const parsePrice = (value: string): number | null => {
    const amount = Number(value.replace(',', '.').trim());
    if (!Number.isFinite(amount)) return null;
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
      const created = await createTicketType({ name, price, price_mode: newTicketMode });
      setRows((prev) => ({ ...prev, ticket_types: [...prev.ticket_types, created] }));
      setNewTicketName('');
      setNewTicketPrice('0.00');
      setNewTicketMode('amount');
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
      const created = await createSeatType({ name, price, price_mode: newSeatMode });
      setRows((prev) => ({ ...prev, seat_types: [...prev.seat_types, created] }));
      setNewSeatName('');
      setNewSeatPrice('0.00');
      setNewSeatMode('amount');
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
      return price == null ? null : { id: row.id, price, price_mode: row.price_mode };
    });
    const seat_types = seatDrafts.map((row) => {
      const price = parsePrice(row.price);
      return price == null ? null : { id: row.id, price, price_mode: row.price_mode };
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
        ticket_types: ticket_types.filter((row): row is { id: number; price: number; price_mode: PriceMode } => row != null),
        seat_types: seat_types.filter((row): row is { id: number; price: number; price_mode: PriceMode } => row != null),
      });
      setRows(next);
      setSuccessMessage(texts.saved);
    } catch (error) {
      setFormError(mapApiError(error, texts.errors));
    } finally {
      setIsSaving(false);
    }
  };

  const modeSelect = (
    id: string,
    value: PriceMode,
    onChange: (mode: PriceMode) => void,
    labelledBy?: string
  ) => {
    const open = openModeId === id;
    return (
      <div className={`admin-prices__mode${open ? ' admin-prices__mode--open' : ''}`}>
        <button
          type="button"
          id={id}
          className="admin-prices__mode-btn"
          aria-label={texts.mode}
          aria-labelledby={labelledBy}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpenModeId(open ? null : id)}
        >
          {value === 'percent' ? '%' : '€'}
        </button>
        {open ? (
          <ul className="admin-prices__mode-menu" role="listbox">
            {([
              { value: 'amount', label: '€' },
              { value: 'percent', label: '%' },
            ] as const).map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  className={`admin-prices__mode-option${
                    option.value === value ? ' admin-prices__mode-option--selected' : ''
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpenModeId(null);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
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
              <ul className="admin-prices__list">
                {rows.ticket_types.map((type) => {
                  const draft = ticketDrafts.find((row) => row.id === type.id);
                  const mode = draft?.price_mode ?? 'amount';
                  return (
                    <li key={type.id} className="admin-prices__row">
                      <label className="admin-prices__label" htmlFor={`ticket-price-${type.id}`} id={`ticket-label-${type.id}`}>
                        {ticketLabel(type)}
                      </label>
                      <input
                        id={`ticket-price-${type.id}`}
                        type="text"
                        inputMode="decimal"
                        value={draft?.price ?? ''}
                        onChange={(event) => onDraftChange('ticket', type.id, { price: event.target.value })}
                        onBlur={(event) => {
                          const next = formatDecimal(event.target.value);
                          if (next) onDraftChange('ticket', type.id, { price: next });
                        }}
                      />
                      {modeSelect(`ticket-mode-${type.id}`, mode, (next) => onDraftChange('ticket', type.id, { price_mode: next }), `ticket-label-${type.id}`)}
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
                  type="text"
                  inputMode="decimal"
                  value={newTicketPrice}
                  onChange={(event) => setNewTicketPrice(event.target.value)}
                  onBlur={(event) => {
                    const next = formatDecimal(event.target.value);
                    if (next) setNewTicketPrice(next);
                  }}
                  aria-label={texts.price}
                />
                {modeSelect('new-ticket-mode', newTicketMode, setNewTicketMode)}
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
              <ul className="admin-prices__list">
                {rows.seat_types.map((type) => {
                  const draft = seatDrafts.find((row) => row.id === type.id);
                  const mode = draft?.price_mode ?? 'amount';
                  return (
                    <li key={type.id} className="admin-prices__row">
                      <label className="admin-prices__label" htmlFor={`seat-price-${type.id}`} id={`seat-label-${type.id}`}>
                        {seatLabel(type)}
                      </label>
                      <input
                        id={`seat-price-${type.id}`}
                        type="text"
                        inputMode="decimal"
                        value={draft?.price ?? ''}
                        onChange={(event) => onDraftChange('seat', type.id, { price: event.target.value })}
                        onBlur={(event) => {
                          const next = formatDecimal(event.target.value);
                          if (next) onDraftChange('seat', type.id, { price: next });
                        }}
                      />
                      {modeSelect(`seat-mode-${type.id}`, mode, (next) => onDraftChange('seat', type.id, { price_mode: next }), `seat-label-${type.id}`)}
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
                  type="text"
                  inputMode="decimal"
                  value={newSeatPrice}
                  onChange={(event) => setNewSeatPrice(event.target.value)}
                  onBlur={(event) => {
                    const next = formatDecimal(event.target.value);
                    if (next) setNewSeatPrice(next);
                  }}
                  aria-label={texts.price}
                />
                {modeSelect('new-seat-mode', newSeatMode, setNewSeatMode)}
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
