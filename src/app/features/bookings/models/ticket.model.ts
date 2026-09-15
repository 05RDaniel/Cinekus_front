export type TicketTypeCode = string;

export type TicketSelection = Record<number, number>;

export interface TicketType {
  id: number;
  code: TicketTypeCode;
  name: string;
  price: number;
}

export interface SeatTypePrice {
  id: number;
  name: string;
  label: string;
  price: number;
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

export function ticketsSubtotal(selection: TicketSelection, types: TicketType[]): number {
  const byId = new Map(types.map((type) => [type.id, type.price]));
  return Object.entries(selection).reduce((sum, [id, qty]) => sum + qty * (byId.get(Number(id)) ?? 0), 0);
}

export function seatsSurcharge(seatTypeIds: number[], seatTypes: SeatTypePrice[]): number {
  const byId = new Map(seatTypes.map((type) => [type.id, type.price]));
  return seatTypeIds.reduce((sum, id) => sum + (byId.get(id) ?? 0), 0);
}

export function layoutSeatClass(type: string): string {
  if (type === 'none' || type === 'vip' || type === 'accessible' || type === 'standard') return type;
  return 'standard';
}
