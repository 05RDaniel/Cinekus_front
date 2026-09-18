import { DragEvent, MouseEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Movie } from '../../../../features/movies/models/movie.model';
import { Room } from '../../../../features/rooms/models/room.model';
import {
  Session,
  formatSessionTime,
  roomIsOccupied,
  sessionTypeLabel,
  SessionTypeLabels,
} from '../../../../features/screenings/models/screening.model';

const DEFAULT_START_HOUR = 10;
const DEFAULT_END_HOUR = 24;
const DEFAULT_DURATION_MIN = 120;
const SNAP_MINUTES = 15;
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_PX = 12;

const SESSION_COLORS = [
  { bg: '#d9e4fb', ink: '#2c3d86' },
  { bg: '#d8f0d9', ink: '#215c32' },
  { bg: '#f6efc2', ink: '#6b5420' },
  { bg: '#ead6f6', ink: '#5b3978' },
  { bg: '#f6d6e3', ink: '#7a3653' },
  { bg: '#d5eef6', ink: '#27586e' },
  { bg: '#f6dfcc', ink: '#7a4a1b' },
  { bg: '#e4e8f8', ink: '#3a4578' },
];

export type ScheduleView = 'day' | 'week';

export type SessionsWeekLabels = {
  titleDay: string;
  titleWeek: string;
  viewDay: string;
  viewWeek: string;
  prev: string;
  next: string;
  prevDay: string;
  nextDay: string;
  today: string;
  days: readonly [string, string, string, string, string, string, string];
  addAt: string;
  edit: string;
  delete: string;
  loading: string;
  loadError: string;
  emptyHint: string;
  emptyRooms: string;
  types: SessionTypeLabels;
};

type AdminSessionsWeekGridProps = {
  sessions: Session[];
  movies: Movie[];
  rooms: Room[];
  locale: string;
  isLoading: boolean;
  hasLoadError: boolean;
  labels: SessionsWeekLabels;
  onCreateAt: (date: string, time: string, roomId: number) => void;
  onMove: (session: Session, date: string, time: string, roomId: number) => void;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
};

type PlacedSession = {
  session: Session;
  startMin: number;
  endMin: number;
  color: (typeof SESSION_COLORS)[number];
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonday(date: Date): Date {
  const next = startOfDay(date);
  const weekday = next.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + offset);
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function minutesFromTime(time: string): number {
  const [hours, minutes] = formatSessionTime(time).split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function formatClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatHourLabel(hour: number): string {
  if (hour >= 24) return '00:00';
  return `${String(hour).padStart(2, '0')}:00`;
}

function movieDuration(movies: Movie[], movieId: number): number {
  const duration = movies.find((movie) => movie.id === movieId)?.duration;
  return duration && duration > 0 ? duration : DEFAULT_DURATION_MIN;
}

function colorForMovie(movieId: number): (typeof SESSION_COLORS)[number] {
  return SESSION_COLORS[Math.abs(movieId) % SESSION_COLORS.length];
}

function placeSessions(sessions: Session[], movies: Movie[]): PlacedSession[] {
  return sessions
    .map((session) => {
      const startMin = minutesFromTime(session.start_time);
      return {
        session,
        startMin,
        endMin: startMin + movieDuration(movies, session.movie_id),
        color: colorForMovie(session.movie_id),
      };
    })
    .sort((a, b) => a.startMin - b.startMin || a.session.id - b.session.id);
}

function snapTimeFromClientX(
  target: HTMLElement,
  clientX: number,
  startHour: number,
  endHour: number
): string {
  const rect = target.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const rangeMinutes = (endHour - startHour) * 60;
  const raw = startHour * 60 + ratio * rangeMinutes;
  const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
  const lastStart = endHour * 60 - SNAP_MINUTES;
  const clamped = Math.min(lastStart, Math.max(startHour * 60, snapped));
  return formatClock(clamped);
}

type ContextMenuState = {
  session: Session;
  x: number;
  y: number;
};

function clampMenuPosition(x: number, y: number): { x: number; y: number } {
  const menuWidth = 196;
  const menuHeight = 72;
  const margin = 8;
  return {
    x: Math.min(Math.max(margin, x), window.innerWidth - menuWidth - margin),
    y: Math.min(Math.max(margin, y), window.innerHeight - menuHeight - margin),
  };
}

export function AdminSessionsWeekGrid({
  sessions,
  movies,
  rooms,
  locale,
  isLoading,
  hasLoadError,
  labels,
  onCreateAt,
  onMove,
  onEdit,
  onDelete,
}: AdminSessionsWeekGridProps) {
  const pressTimerRef = useRef<number | null>(null);
  const pressPointRef = useRef({ x: 0, y: 0 });
  const pendingMenuRef = useRef<Session | null>(null);
  const suppressClickRef = useRef(false);
  const draggingRef = useRef<Session | null>(null);
  const [view, setView] = useState<ScheduleView>('day');
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropHint, setDropHint] = useState<{
    date: string;
    roomId: number;
    invalid: boolean;
    time: string;
    left: number;
    width: number;
    color: (typeof SESSION_COLORS)[number];
  } | null>(null);

  const visibleDays = useMemo(() => {
    if (view === 'day') return [startOfDay(selectedDate)];
    const monday = startOfMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  }, [selectedDate, view]);

  const todayIso = toIsoDate(new Date());
  const rangeLabel =
    view === 'day'
      ? new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(visibleDays[0])
      : new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).formatRange(visibleDays[0], visibleDays[visibleDays.length - 1]);

  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, Session[]>();
    for (const day of visibleDays) grouped.set(toIsoDate(day), []);
    for (const session of sessions) {
      const bucket = grouped.get(session.start_date);
      if (bucket) bucket.push(session);
    }
    return grouped;
  }, [sessions, visibleDays]);

  const { startHour, endHour } = useMemo(() => {
    let start = DEFAULT_START_HOUR;
    let end = DEFAULT_END_HOUR;
    for (const session of sessions) {
      if (!sessionsByDate.has(session.start_date)) continue;
      const startMin = minutesFromTime(session.start_time);
      const endMin = startMin + movieDuration(movies, session.movie_id);
      start = Math.min(start, Math.floor(startMin / 60));
      end = Math.max(end, Math.ceil(endMin / 60));
    }
    return {
      startHour: Math.max(0, start),
      endHour: Math.min(24, Math.max(end, start + 1)),
    };
  }, [movies, sessions, sessionsByDate]);

  const hourCount = endHour - startHour;
  const hourMarks = Array.from({ length: hourCount + 1 }, (_, index) => startHour + index);
  const rangeMinutes = hourCount * 60;
  const visibleSessionCount = [...sessionsByDate.values()].reduce((total, items) => total + items.length, 0);
  const stepDays = view === 'week' ? 7 : 1;

  const onTrackClick = (event: MouseEvent<HTMLElement>, date: string, roomId: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if ((event.target as HTMLElement).closest('.sessions-week__card')) return;
    onCreateAt(date, snapTimeFromClientX(event.currentTarget, event.clientX, startHour, endHour), roomId);
  };

  const onCardDragStart = (event: DragEvent<HTMLElement>, session: Session) => {
    if ((event.target as HTMLElement).closest('.sessions-week__card-delete')) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(session.id));
    event.dataTransfer.setData('application/x-cinekus-session', String(session.id));
    draggingRef.current = session;
    setDraggingId(session.id);
    suppressClickRef.current = true;
    closeContextMenu();
  };

  const onCardDragEnd = () => {
    draggingRef.current = null;
    setDraggingId(null);
    setDropHint(null);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 200);
  };

  const updateDropHint = (date: string, roomId: number, time: string) => {
    const dragging = draggingRef.current;
    if (!dragging) return;
    const startMin = minutesFromTime(time);
    const duration = movieDuration(movies, dragging.movie_id);
    const left = ((startMin - startHour * 60) / rangeMinutes) * 100;
    const width = (duration / rangeMinutes) * 100;
    const invalid = roomIsOccupied(sessions, movies, roomId, date, time, dragging.movie_id, dragging.id);
    const color = colorForMovie(dragging.movie_id);
    setDropHint((current) =>
      current &&
      current.date === date &&
      current.roomId === roomId &&
      current.time === time &&
      current.invalid === invalid
        ? current
        : { date, roomId, invalid, time, left, width, color }
    );
  };

  const onTrackDragOver = (event: DragEvent<HTMLElement>, date: string, roomId: number) => {
    if (!draggingRef.current) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const track = event.currentTarget.closest('.sessions-week__day') as HTMLElement | null;
    if (!track) return;
    updateDropHint(date, roomId, snapTimeFromClientX(track, event.clientX, startHour, endHour));
  };

  const onTrackDrop = (event: DragEvent<HTMLElement>, date: string, roomId: number) => {
    event.preventDefault();
    event.stopPropagation();
    const raw =
      event.dataTransfer.getData('application/x-cinekus-session') || event.dataTransfer.getData('text/plain');
    const sessionId = Number(raw);
    const session = sessions.find((item) => item.id === sessionId);
    const track = event.currentTarget.closest('.sessions-week__day') as HTMLElement | null;
    draggingRef.current = null;
    setDraggingId(null);
    setDropHint(null);
    if (!session || !track) return;
    const time = snapTimeFromClientX(track, event.clientX, startHour, endHour);
    if (
      session.room_id === roomId &&
      session.start_date === date &&
      formatSessionTime(session.start_time) === time
    ) {
      return;
    }
    onMove(session, date, time, roomId);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const openContextMenu = (session: Session, x: number, y: number) => {
    clearPressTimer();
    pendingMenuRef.current = null;
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 700);
    setContextMenu({ session, ...clampMenuPosition(x, y) });
  };

  const closeContextMenu = () => setContextMenu(null);

  const onCardPointerDown = (event: PointerEvent<HTMLElement>, session: Session) => {
    if (event.pointerType === 'mouse') return;
    clearPressTimer();
    pendingMenuRef.current = null;
    pressPointRef.current = { x: event.clientX, y: event.clientY };
    pressTimerRef.current = window.setTimeout(() => {
      pendingMenuRef.current = session;
      suppressClickRef.current = true;
    }, LONG_PRESS_MS);
  };

  const onCardPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (pressTimerRef.current === null && !pendingMenuRef.current) return;
    const dx = event.clientX - pressPointRef.current.x;
    const dy = event.clientY - pressPointRef.current.y;
    if (dx * dx + dy * dy > LONG_PRESS_MOVE_PX * LONG_PRESS_MOVE_PX) {
      clearPressTimer();
      pendingMenuRef.current = null;
    } else {
      pressPointRef.current = { x: event.clientX, y: event.clientY };
    }
  };

  const onCardPointerEnd = () => {
    const pending = pendingMenuRef.current;
    clearPressTimer();
    if (pending) {
      openContextMenu(pending, pressPointRef.current.x, pressPointRef.current.y);
    }
  };

  const onCardContextMenu = (event: MouseEvent<HTMLElement>, session: Session) => {
    event.preventDefault();
    event.stopPropagation();
    openContextMenu(session, event.clientX, event.clientY);
  };

  const onCardClick = (event: MouseEvent<HTMLElement>, session: Session) => {
    event.stopPropagation();
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onEdit(session);
  };

  useEffect(() => () => clearPressTimer(), []);

  useEffect(() => {
    if (!contextMenu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeContextMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [contextMenu]);

  return (
    <div className={`sessions-week sessions-week--${view}`}>
      <div className="sessions-week__heading">
        <h2 className="sessions-week__title">{view === 'day' ? labels.titleDay : labels.titleWeek}</h2>
        <div className="sessions-week__toolbar">
          <div className="sessions-week__views" role="group" aria-label={labels.viewDay}>
            <button
              type="button"
              className={`sessions-week__view-btn${view === 'day' ? ' is-active' : ''}`}
              onClick={() => setView('day')}
            >
              {labels.viewDay}
            </button>
            <button
              type="button"
              className={`sessions-week__view-btn${view === 'week' ? ' is-active' : ''}`}
              onClick={() => setView('week')}
            >
              {labels.viewWeek}
            </button>
          </div>
          <div className="sessions-week__nav">
            <button
              type="button"
              className="sessions-week__nav-btn"
              onClick={() => setSelectedDate(addDays(selectedDate, -stepDays))}
              aria-label={view === 'day' ? labels.prevDay : labels.prev}
            >
              ‹
            </button>
            <p className="sessions-week__range">{rangeLabel}</p>
            <button
              type="button"
              className="sessions-week__nav-btn"
              onClick={() => setSelectedDate(addDays(selectedDate, stepDays))}
              aria-label={view === 'day' ? labels.nextDay : labels.next}
            >
              ›
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setSelectedDate(startOfDay(new Date()))}
            >
              {labels.today}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? <p className="sessions-week__status">{labels.loading}</p> : null}
      {hasLoadError ? <p className="sessions-week__status sessions-week__status--error">{labels.loadError}</p> : null}
      {!isLoading && !hasLoadError && rooms.length === 0 ? (
        <p className="sessions-week__status">{labels.emptyRooms}</p>
      ) : null}
      {!isLoading && !hasLoadError && rooms.length > 0 && visibleSessionCount === 0 ? (
        <p className="sessions-week__status">{labels.emptyHint}</p>
      ) : null}

      {rooms.length > 0 ? (
        <div className="sessions-week__board">
          <div className="sessions-week__header">
            <div className="sessions-week__gutter" aria-hidden="true" />
            <div
              className="sessions-week__hours"
              aria-hidden="true"
              style={view === 'week' ? undefined : { width: `calc(var(--sessions-hour-w) * ${hourCount})` }}
            >
              {hourMarks.map((hour) => (
                <div
                  key={hour}
                  className="sessions-week__hour-label"
                  style={{ left: `${((hour - startHour) / hourCount) * 100}%` }}
                >
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>
          </div>

          <div className="sessions-week__groups">
            {visibleDays.map((day) => {
              const iso = toIsoDate(day);
              const isToday = iso === todayIso;
              const daySessions = sessionsByDate.get(iso) ?? [];

              return (
                <div key={iso} className={`sessions-week__group${isToday ? ' sessions-week__group--today' : ''}`}>
                  {view === 'week' ? (
                    <div className={`sessions-week__group-title${isToday ? ' sessions-week__group-title--today' : ''}`}>
                      <span>{labels.days[mondayIndex(day)]}</span>
                      <span className="sessions-week__day-number">{day.getDate()}</span>
                    </div>
                  ) : null}

                  {rooms.map((room, roomIndex) => {
                    const placed = placeSessions(
                      daySessions.filter((session) => session.room_id === room.id),
                      movies
                    );
                    const isShaded = roomIndex % 2 === 0;

                    return (
                      <div key={`${iso}-${room.id}`} className="sessions-week__row">
                        <div className="sessions-week__room-label" title={room.name}>
                          {room.name}
                        </div>
                        <div
                          className={`sessions-week__day${isShaded ? ' sessions-week__day--shaded' : ''}${isToday ? ' sessions-week__day--today' : ''}${
                            dropHint?.date === iso && dropHint.roomId === room.id
                              ? dropHint.invalid
                                ? ' sessions-week__day--drop-invalid'
                                : ' sessions-week__day--drop'
                              : ''
                          }`}
                          style={{
                            ...(view === 'week' ? {} : { width: `calc(var(--sessions-hour-w) * ${hourCount})` }),
                            minHeight: 'var(--sessions-lane-h)',
                          }}
                          title={`${labels.addAt} · ${room.name} · ${iso}`}
                          data-date={iso}
                          data-room-id={room.id}
                          onClick={(event) => onTrackClick(event, iso, room.id)}
                          onDragOver={(event) => onTrackDragOver(event, iso, room.id)}
                          onDrop={(event) => onTrackDrop(event, iso, room.id)}
                        >
                          <div className="sessions-week__slots">
                            {Array.from({ length: hourCount }, (_, index) => (
                              <div key={index} className="sessions-week__slot" />
                            ))}
                          </div>

                          {dropHint?.date === iso && dropHint.roomId === room.id ? (
                            <div
                              className={`sessions-week__drop-ghost${dropHint.invalid ? ' sessions-week__drop-ghost--invalid' : ''}`}
                              style={{
                                left: `${dropHint.left}%`,
                                width: `${dropHint.width}%`,
                                backgroundColor: dropHint.color.bg,
                                color: dropHint.color.ink,
                              }}
                              aria-hidden="true"
                            >
                              <span>{dropHint.time}</span>
                            </div>
                          ) : null}

                          {placed.map((item) => {
                            const left = ((item.startMin - startHour * 60) / rangeMinutes) * 100;
                            const width = ((item.endMin - item.startMin) / rangeMinutes) * 100;
                            const movieTitle = item.session.movie_title ?? `#${item.session.movie_id}`;

                            return (
                              <article
                                key={item.session.id}
                                className={`sessions-week__card${item.session.id === draggingId ? ' sessions-week__card--dragging' : ''}`}
                                draggable
                                style={{
                                  left: `${left}%`,
                                  width: `${width}%`,
                                  backgroundColor: item.color.bg,
                                  color: item.color.ink,
                                }}
                                onDragStart={(event) => onCardDragStart(event, item.session)}
                                onDragEnd={onCardDragEnd}
                                onDragOver={(event) => onTrackDragOver(event, iso, room.id)}
                                onDrop={(event) => onTrackDrop(event, iso, room.id)}
                              >
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="sessions-week__card-main"
                                  onPointerDown={(event) => onCardPointerDown(event, item.session)}
                                  onPointerMove={onCardPointerMove}
                                  onPointerUp={onCardPointerEnd}
                                  onPointerCancel={() => {
                                    clearPressTimer();
                                    pendingMenuRef.current = null;
                                  }}
                                  onContextMenu={(event) => onCardContextMenu(event, item.session)}
                                  onClick={(event) => onCardClick(event, item.session)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      onCardClick(event as unknown as MouseEvent<HTMLElement>, item.session);
                                    }
                                  }}
                                  aria-label={`${labels.edit}: ${movieTitle}`}
                                >
                                  <span className="sessions-week__card-movie">{movieTitle}</span>
                                  <span className="sessions-week__card-meta">
                                    {formatSessionTime(item.session.start_time)} ·{' '}
                                    {sessionTypeLabel(item.session.session_type, labels.types)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="sessions-week__card-delete"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onDelete(item.session);
                                  }}
                                  aria-label={`${labels.delete}: ${movieTitle}`}
                                >
                                  ×
                                </button>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {contextMenu ? (
        <>
          <div className="sessions-week__menu-backdrop" onClick={closeContextMenu} />
          <div
            className="sessions-week__menu"
            role="menu"
            aria-label={labels.delete}
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              role="menuitem"
              className="admin-btn admin-btn--danger sessions-week__menu-item"
              onClick={() => {
                const session = contextMenu.session;
                closeContextMenu();
                onDelete(session);
              }}
            >
              {labels.delete}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
