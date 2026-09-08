import { useEffect, useMemo, useRef, useState } from 'react';
import {
  clampDimension,
  createSeatGrid,
  LAYOUT_SEAT_TYPES,
  LayoutSeatType,
  MAX_ROOM_COLS,
  MAX_ROOM_ROWS,
  resizeSeatGrid,
} from '../../../../features/rooms/models/room.model';
import { SeatIcon } from '../../../../shared/components/icons/SeatIcon';
import { useSeatMapNav } from '../../../../shared/hooks/useSeatMapNav';
import { seatRowLabel } from '../../../../features/seats/models/seat.model';

export type RoomFormValues = {
  name: string;
  rows: number;
  columns: number;
  grid: LayoutSeatType[][];
};

type CellPos = { row: number; col: number };

type AdminRoomFormProps = {
  values: RoomFormValues;
  onChange: (values: RoomFormValues) => void;
  labels: {
    name: string;
    rows: string;
    columns: string;
    map: string;
    screen: string;
    types: Record<LayoutSeatType, string>;
    selectAll: string;
    clearSelection: string;
    selectedCount: string;
    assign: string;
    zoomReset: string;
  };
};

function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function cellsInRect(start: CellPos, end: CellPos): string[] {
  const rowMin = Math.min(start.row, end.row);
  const rowMax = Math.max(start.row, end.row);
  const colMin = Math.min(start.col, end.col);
  const colMax = Math.max(start.col, end.col);
  const keys: string[] = [];
  for (let row = rowMin; row <= rowMax; row += 1) {
    for (let col = colMin; col <= colMax; col += 1) {
      keys.push(cellKey(row, col));
    }
  }
  return keys;
}

export function AdminRoomForm({ values, onChange, labels }: AdminRoomFormProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragCurrent, setDragCurrent] = useState<CellPos | null>(null);
  const { zoom, canvasSize, spaceDown, viewportRef, canvasRef, startPan, fitZoom, consumePanClick } =
    useSeatMapNav({ measureKey: `${values.rows}x${values.columns}` });

  const dragStart = useRef<CellPos | null>(null);
  const didDrag = useRef(false);
  const additiveDrag = useRef(false);
  const keepSelectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<string>();
      for (const key of prev) {
        const [row, col] = key.split('-').map(Number);
        if (row < values.rows && col < values.columns) next.add(key);
      }
      return next;
    });
  }, [values.rows, values.columns]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (keepSelectionRef.current?.contains(event.target as Node)) return;
      setSelected(new Set());
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const onUp = () => {
      const start = dragStart.current;
      const current = dragCurrent;
      if (consumePanClick()) {
        dragStart.current = null;
        didDrag.current = false;
        additiveDrag.current = false;
        setDragCurrent(null);
        return;
      }
      if (!start) return;

      if (didDrag.current && current) {
        const rect = cellsInRect(start, current);
        setSelected((prev) => {
          const next = additiveDrag.current ? new Set(prev) : new Set<string>();
          for (const key of rect) next.add(key);
          return next;
        });
      } else if (!didDrag.current) {
        const key = cellKey(start.row, start.col);
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
        });
      }

      dragStart.current = null;
      didDrag.current = false;
      additiveDrag.current = false;
      setDragCurrent(null);
    };

    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mouseup', onUp);
    };
  }, [consumePanClick, dragCurrent]);

  const previewKeys = useMemo(() => {
    if (!dragStart.current || !dragCurrent || !didDrag.current) return null;
    return new Set(cellsInRect(dragStart.current, dragCurrent));
  }, [dragCurrent]);

  const selectedCount = previewKeys
    ? new Set([...(additiveDrag.current ? selected : []), ...previewKeys]).size
    : selected.size;

  const isCellSelected = (row: number, col: number) => {
    const key = cellKey(row, col);
    if (previewKeys) {
      if (previewKeys.has(key)) return true;
      return additiveDrag.current && selected.has(key);
    }
    return selected.has(key);
  };

  const setRows = (next: number) => {
    const rows = clampDimension(next, 1, MAX_ROOM_ROWS);
    onChange({
      ...values,
      rows,
      grid: resizeSeatGrid(values.grid, rows, values.columns),
    });
  };

  const setColumns = (next: number) => {
    const columns = clampDimension(next, 1, MAX_ROOM_COLS);
    onChange({
      ...values,
      columns,
      grid: resizeSeatGrid(values.grid, values.rows, columns),
    });
  };

  const beginDrag = (row: number, col: number, additive: boolean) => {
    dragStart.current = { row, col };
    didDrag.current = false;
    additiveDrag.current = additive;
    setDragCurrent({ row, col });
  };

  const moveDrag = (row: number, col: number) => {
    if (!dragStart.current) return;
    if (dragStart.current.row !== row || dragStart.current.col !== col) {
      didDrag.current = true;
    }
    setDragCurrent({ row, col });
  };

  const applyType = (type: LayoutSeatType) => {
    if (selected.size === 0) return;
    const grid = values.grid.map((row) => [...row]);
    for (const key of selected) {
      const [row, col] = key.split('-').map(Number);
      if (grid[row]?.[col] !== undefined) grid[row][col] = type;
    }
    onChange({ ...values, grid });
    setSelected(new Set());
  };

  const selectAll = () => {
    const next = new Set<string>();
    for (let row = 0; row < values.rows; row += 1) {
      for (let col = 0; col < values.columns; col += 1) {
        next.add(cellKey(row, col));
      }
    }
    setSelected(next);
  };

  const selectRow = (row: number, additive: boolean) => {
    setSelected((prev) => {
      const next = additive ? new Set(prev) : new Set<string>();
      for (let col = 0; col < values.columns; col += 1) {
        next.add(cellKey(row, col));
      }
      return next;
    });
  };

  return (
    <div className="crud-form room-layout">
      <div className="room-layout__dims">
        <div className="crud-field room-layout__field-name">
          <label className="crud-field__label" htmlFor="room-name">
            {labels.name}
          </label>
          <input
            id="room-name"
            value={values.name}
            onChange={(event) => onChange({ ...values, name: event.target.value })}
            required
          />
        </div>
        <div className="crud-field room-layout__field-dim">
          <label className="crud-field__label" htmlFor="room-rows">
            {labels.rows}
          </label>
          <input
            id="room-rows"
            type="number"
            min={1}
            max={MAX_ROOM_ROWS}
            value={values.rows}
            onChange={(event) => setRows(Number(event.target.value))}
            required
          />
        </div>
        <div className="crud-field room-layout__field-dim">
          <label className="crud-field__label" htmlFor="room-cols">
            {labels.columns}
          </label>
          <input
            id="room-cols"
            type="number"
            min={1}
            max={MAX_ROOM_COLS}
            value={values.columns}
            onChange={(event) => setColumns(Number(event.target.value))}
            required
          />
        </div>
      </div>

      <div className="room-layout__map">
        <p className="room-layout__map-title">{labels.map}</p>

        <div ref={keepSelectionRef} className="room-layout__workspace">
          <div className="room-layout__toolbar">
            <p className="room-layout__count">
              {labels.selectedCount.replace('{count}', String(selectedCount))}
            </p>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={selectAll}>
              {labels.selectAll}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setSelected(new Set())}
              disabled={selected.size === 0}
            >
              {labels.clearSelection}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={fitZoom}>
              {labels.zoomReset}
            </button>
            <div className="room-layout__brushes" role="group" aria-label={labels.assign}>
              {LAYOUT_SEAT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`room-layout__brush room-layout__brush--${type}`}
                  disabled={selected.size === 0}
                  onClick={() => applyType(type)}
                >
                  <span className={`room-layout__swatch room-layout__swatch--${type}`}>
                    {type !== 'none' ? <SeatIcon /> : null}
                  </span>
                  {labels.types[type]}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={viewportRef}
            className={`room-layout__viewport${spaceDown ? ' room-layout__viewport--pan' : ''}`}
            onMouseDown={(event) => {
              if (event.button === 1 || spaceDown) {
                event.preventDefault();
                startPan(event);
              }
            }}
          >
            <div className="room-layout__track">
              <div
                className="room-layout__sizer"
                style={{ width: canvasSize.width * zoom, height: canvasSize.height * zoom }}
              >
              <div
                ref={canvasRef}
                className="room-layout__canvas"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="room-layout__screen" aria-hidden="true">
                  {labels.screen}
                </div>
                <div className="room-layout__grid">
                  {values.grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="room-layout__row">
                      <button
                        type="button"
                        className="room-layout__row-label"
                        title={labels.selectAll}
                        onClick={(event) => selectRow(rowIndex, event.shiftKey)}
                      >
                        {seatRowLabel(rowIndex + 1)}
                      </button>
                      <div className="room-layout__cells">
                        {row.map((type, colIndex) => {
                          const selectedCell = isCellSelected(rowIndex, colIndex);
                          return (
                            <button
                              key={`${rowIndex}-${colIndex}`}
                              type="button"
                              className={[
                                'room-layout__cell',
                                `room-layout__cell--${type}`,
                                selectedCell ? 'room-layout__cell--selected' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              aria-pressed={selectedCell}
                              aria-label={`${seatRowLabel(rowIndex + 1)}-${colIndex + 1}: ${labels.types[type]}`}
                              title={`${seatRowLabel(rowIndex + 1)}-${colIndex + 1} · ${labels.types[type]}`}
                              onMouseDown={(event) => {
                                if (event.button === 1 || spaceDown) {
                                  event.preventDefault();
                                  startPan(event);
                                  return;
                                }
                                if (event.button !== 0) return;
                                event.preventDefault();
                                beginDrag(rowIndex, colIndex, event.shiftKey);
                              }}
                              onMouseEnter={() => moveDrag(rowIndex, colIndex)}
                            >
                              {type !== 'none' ? <SeatIcon /> : null}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        className="room-layout__row-label"
                        title={labels.selectAll}
                        onClick={(event) => selectRow(rowIndex, event.shiftKey)}
                      >
                        {seatRowLabel(rowIndex + 1)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const emptyRoomForm: RoomFormValues = {
  name: '',
  rows: 5,
  columns: 8,
  grid: createSeatGrid(5, 8, 'standard'),
};
