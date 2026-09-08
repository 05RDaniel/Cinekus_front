export type BookableSeatType = 'standard' | 'vip' | 'accessible';

export type LayoutSeatType = BookableSeatType | 'none';

export const BOOKABLE_SEAT_TYPES: BookableSeatType[] = ['standard', 'vip', 'accessible'];

export const LAYOUT_SEAT_TYPES: LayoutSeatType[] = ['standard', 'vip', 'accessible', 'none'];

export const MAX_ROOM_ROWS = 35;
export const MAX_ROOM_COLS = 50;

export interface Room {
  id: number;
  name: string;
  rows?: number;
  columns?: number;
  seat_count?: number;
}

export interface RoomSeat {
  id: number;
  row: number;
  number: number;
  seat_type_id: number;
  type: BookableSeatType;
}

export interface RoomLayout extends Room {
  rows: number;
  columns: number;
  seats: RoomSeat[];
}

export type RoomLayoutPayload = {
  name: string;
  rows: number;
  columns: number;
  seats: Array<{
    row: number;
    number: number;
    type: BookableSeatType;
  }>;
};

export function createSeatGrid(
  rows: number,
  columns: number,
  fill: LayoutSeatType = 'standard'
): LayoutSeatType[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => fill));
}

export function resizeSeatGrid(
  grid: LayoutSeatType[][],
  rows: number,
  columns: number,
  fill: LayoutSeatType = 'standard'
): LayoutSeatType[][] {
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, colIndex) => grid[rowIndex]?.[colIndex] ?? fill)
  );
}

export function gridFromRoomSeats(rows: number, columns: number, seats: RoomSeat[]): LayoutSeatType[][] {
  const grid = createSeatGrid(rows, columns, 'none');
  for (const seat of seats) {
    const rowIndex = seat.row - 1;
    const colIndex = seat.number - 1;
    if (rowIndex < 0 || colIndex < 0 || rowIndex >= rows || colIndex >= columns) continue;
    grid[rowIndex][colIndex] = seat.type;
  }
  return grid;
}

export function seatsFromGrid(grid: LayoutSeatType[][]): RoomLayoutPayload['seats'] {
  const seats: RoomLayoutPayload['seats'] = [];
  grid.forEach((row, rowIndex) => {
    row.forEach((type, colIndex) => {
      if (type === 'none') return;
      seats.push({
        row: rowIndex + 1,
        number: colIndex + 1,
        type,
      });
    });
  });
  return seats;
}

export function clampDimension(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
