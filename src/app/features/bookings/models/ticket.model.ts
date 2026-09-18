export type TicketTypeCode = string;

export type TicketSelection = Record<number, number>;

export type PriceMode = 'amount' | 'percent';

export interface TicketType {
  id: number;
  code: TicketTypeCode;
  name: string;
  price: number;
  price_mode: PriceMode;
}

export interface SeatTypePrice {
  id: number;
  name: string;
  label: string;
  price: number;
  price_mode: PriceMode;
}

export const KNOWN_TICKET_CODES = ['adult', 'child', 'senior'] as const;

export function emptyTicketSelection(types: TicketType[] = []): TicketSelection {
  return Object.fromEntries(types.map((type) => [type.id, 0]));
}

export function totalTickets(selection: TicketSelection): number {
  return Object.values(selection).reduce((sum, qty) => sum + qty, 0);
}

export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount);
}

export function normalizePriceMode(mode?: string | null): PriceMode {
  return mode === 'percent' ? 'percent' : 'amount';
}

export function applyPriceValue(value: number, mode: PriceMode, base: number): number {
  const amount = mode === 'percent' ? (base * value) / 100 : value;
  return Math.round(amount * 100) / 100;
}

export function ticketReferenceAmount(types: TicketType[]): number {
  const reference = types.find((type) => normalizePriceMode(type.price_mode) === 'amount');
  return reference ? Number(reference.price) : 0;
}

export function ticketUnitPrice(type: TicketType, types: TicketType[]): number {
  return applyPriceValue(Number(type.price), normalizePriceMode(type.price_mode), ticketReferenceAmount(types));
}

export function formatPriceModifier(value: number, mode: PriceMode, locale: string): string {
  if (mode === 'percent') {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} %`;
  }
  return formatPrice(value, locale);
}

export function ticketsSubtotal(selection: TicketSelection, types: TicketType[]): number {
  return Object.entries(selection).reduce((sum, [id, qty]) => {
    const type = types.find((item) => item.id === Number(id));
    if (!type) return sum;
    return sum + qty * ticketUnitPrice(type, types);
  }, 0);
}

export function seatsSurcharge(
  seatTypeIds: number[],
  seatTypes: SeatTypePrice[],
  ticketSubtotal: number,
  ticketCount: number
): number {
  const averageTicket = ticketCount > 0 ? ticketSubtotal / ticketCount : 0;
  const byId = new Map(seatTypes.map((type) => [type.id, type]));
  return seatTypeIds.reduce((sum, id) => {
    const type = byId.get(id);
    if (!type) return sum;
    return sum + applyPriceValue(Number(type.price), normalizePriceMode(type.price_mode), averageTicket);
  }, 0);
}

export function bookingTotal(ticketsAmount: number, seatsAmount: number): number {
  return Math.max(0, Math.round((ticketsAmount + seatsAmount) * 100) / 100);
}

export function layoutSeatClass(type: string): string {
  if (type === 'none' || type === 'vip' || type === 'accessible' || type === 'standard') return type;
  return 'standard';
}
