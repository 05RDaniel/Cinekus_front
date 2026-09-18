import { API_ENDPOINTS } from '../../../core/config/api.config';
import { http } from '../../../core/http/http';
import { normalizePriceMode, PriceMode, SeatTypePrice, TicketType } from '../models/ticket.model';

export type PriceUpdateItem = {
  id: number;
  price: number;
  price_mode: PriceMode;
};

export type PricesPayload = {
  ticket_types: TicketType[];
  seat_types: SeatTypePrice[];
};

export type UpdatePricesPayload = {
  ticket_types: PriceUpdateItem[];
  seat_types: PriceUpdateItem[];
};

function normalizeTicket(type: TicketType): TicketType {
  return {
    ...type,
    name: type.name || type.code,
    price: Number(type.price),
    price_mode: normalizePriceMode(type.price_mode),
  };
}

function normalizeSeat(type: SeatTypePrice): SeatTypePrice {
  return {
    ...type,
    label: type.label || type.name,
    price: Number(type.price),
    price_mode: normalizePriceMode(type.price_mode),
  };
}

export async function getTicketTypes(): Promise<TicketType[]> {
  const { data } = await http.get<TicketType[]>(`${API_ENDPOINTS.cine}/tipos-entrada`);
  return data.map(normalizeTicket);
}

export async function getSeatTypePrices(): Promise<SeatTypePrice[]> {
  const { data } = await http.get<SeatTypePrice[]>(`${API_ENDPOINTS.cine}/tipos-asiento`);
  return data.map(normalizeSeat);
}

function normalizePrices(payload: PricesPayload): PricesPayload {
  return {
    ticket_types: payload.ticket_types.map(normalizeTicket),
    seat_types: payload.seat_types.map(normalizeSeat),
  };
}

export async function getAdminPrices(): Promise<PricesPayload> {
  const { data } = await http.get<PricesPayload>(`${API_ENDPOINTS.cine}/precios`);
  return normalizePrices(data);
}

export async function updateAdminPrices(payload: UpdatePricesPayload): Promise<PricesPayload> {
  const { data } = await http.put<PricesPayload>(`${API_ENDPOINTS.cine}/precios`, payload);
  return normalizePrices(data);
}

export async function createTicketType(payload: {
  name: string;
  price: number;
  price_mode: PriceMode;
}): Promise<TicketType> {
  const { data } = await http.post<TicketType>(`${API_ENDPOINTS.cine}/tipos-entrada`, payload);
  return normalizeTicket(data);
}

export async function createSeatType(payload: {
  name: string;
  price: number;
  price_mode: PriceMode;
}): Promise<SeatTypePrice> {
  const { data } = await http.post<SeatTypePrice>(`${API_ENDPOINTS.cine}/tipos-asiento`, payload);
  return normalizeSeat(data);
}

export async function deleteTicketType(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/tipos-entrada/${id}`);
}

export async function deleteSeatType(id: number): Promise<void> {
  await http.delete(`${API_ENDPOINTS.cine}/tipos-asiento/${id}`);
}
