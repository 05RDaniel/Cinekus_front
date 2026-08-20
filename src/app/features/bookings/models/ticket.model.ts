export type TicketTypeId = 'adult' | 'child' | 'senior';

export type TicketSelection = Record<TicketTypeId, number>;

export const TICKET_TYPE_IDS: TicketTypeId[] = ['adult', 'child', 'senior'];

export const TICKET_PRICES: Record<TicketTypeId, number> = {
  adult: 8,
  child: 5.5,
  senior: 6.5,
};

export const emptyTicketSelection = (): TicketSelection => ({
  adult: 0,
  child: 0,
  senior: 0,
});

export function totalTickets(selection: TicketSelection): number {
  return TICKET_TYPE_IDS.reduce((sum, id) => sum + selection[id], 0);
}

export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount);
}

export function totalPrice(selection: TicketSelection): number {
  return TICKET_TYPE_IDS.reduce((sum, id) => sum + selection[id] * TICKET_PRICES[id], 0);
}
