export type SeatTypeName = 'standard' | 'vip' | 'accessible';

export interface SessionSeat {
  id: number;
  room_id: number;
  seat_row: number | string;
  number: number;
  seat_type_id: number;
  seat_type?: SeatTypeName;
  occupied: boolean;
}

export type SessionSeatsMap = {
  rows: number;
  columns: number;
  seats: SessionSeat[];
};

export function seatRowLabel(seatRow: number | string): string {
  const n = Number(seatRow);
  if (Number.isFinite(n)) return String(n);
  return String(seatRow);
}

export function seatCode(seat: Pick<SessionSeat, 'seat_row' | 'number'>): string {
  return `${seatRowLabel(seat.seat_row)}-${seat.number}`;
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

export function buildSeatLayout(
  rows: number,
  columns: number,
  seats: SessionSeat[]
): { row: string; rowIndex: number; cells: Array<SessionSeat | null> }[] {
  const byPos = new Map<string, SessionSeat>();
  for (const seat of seats) {
    byPos.set(`${Number(seat.seat_row)}-${seat.number}`, seat);
  }

  const safeRows = Math.max(rows, ...seats.map((seat) => Number(seat.seat_row) || 0), 1);
  const safeCols = Math.max(columns, ...seats.map((seat) => seat.number), 1);

  return Array.from({ length: safeRows }, (_, rowIndex) => ({
    rowIndex: rowIndex + 1,
    row: seatRowLabel(rowIndex + 1),
    cells: Array.from({ length: safeCols }, (_, colIndex) => {
      return byPos.get(`${rowIndex + 1}-${colIndex + 1}`) ?? null;
    }),
  }));
}
