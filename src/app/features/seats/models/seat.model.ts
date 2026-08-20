export interface SessionSeat {
  id: number;
  room_id: number;
  seat_row: number | string;
  number: number;
  seat_type_id: number;
  occupied: boolean;
}

export function seatRowLabel(seatRow: number | string): string {
  const n = Number(seatRow);
  if (Number.isFinite(n) && n >= 1 && n <= 26) {
    return String.fromCharCode(64 + n);
  }
  return String(seatRow);
}

export function seatCode(seat: Pick<SessionSeat, 'seat_row' | 'number'>): string {
  return `${seatRowLabel(seat.seat_row)}${seat.number}`;
}

export function groupSeatsByRow(seats: SessionSeat[]): { row: string; seats: SessionSeat[] }[] {
  const map = new Map<string, SessionSeat[]>();

  for (const seat of seats) {
    const row = seatRowLabel(seat.seat_row);
    const list = map.get(row) ?? [];
    list.push(seat);
    map.set(row, list);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([row, rowSeats]) => ({
      row,
      seats: [...rowSeats].sort((a, b) => a.number - b.number),
    }));
}
