import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.15;
const FIT_INSET = 8;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

function viewportContentSize(viewport: HTMLElement) {
  const styles = getComputedStyle(viewport);
  return {
    width:
      viewport.offsetWidth
      - Number.parseFloat(styles.borderLeftWidth)
      - Number.parseFloat(styles.borderRightWidth)
      - Number.parseFloat(styles.paddingLeft)
      - Number.parseFloat(styles.paddingRight),
    height:
      viewport.offsetHeight
      - Number.parseFloat(styles.borderTopWidth)
      - Number.parseFloat(styles.borderBottomWidth)
      - Number.parseFloat(styles.paddingTop)
      - Number.parseFloat(styles.paddingBottom),
  };
}

type UseSeatMapNavOptions = {
  measureKey?: unknown;
  enabled?: boolean;
};

export function useSeatMapNav({ measureKey, enabled = true }: UseSeatMapNavOptions = {}) {
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [spaceDown, setSpaceDown] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panning = useRef(false);
  const panOrigin = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const skipClick = useRef(false);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el || !enabled) return;
    const update = () => setCanvasSize({ width: el.offsetWidth, height: el.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, measureKey]);

  useEffect(() => {
    if (!enabled) {
      setSpaceDown(false);
      return;
    }
    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.isContentEditable;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || isTyping(event.target)) return;
      event.preventDefault();
      setSpaceDown(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      setSpaceDown(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled]);

  const startPan = (event: ReactMouseEvent) => {
    const viewport = viewportRef.current;
    if (!viewport || !enabled) return;
    panning.current = true;
    skipClick.current = true;
    panOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
  };

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!panning.current || !viewportRef.current) return;
      viewportRef.current.scrollLeft = panOrigin.current.left - (event.clientX - panOrigin.current.x);
      viewportRef.current.scrollTop = panOrigin.current.top - (event.clientY - panOrigin.current.y);
    };
    const onUp = () => {
      panning.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !enabled) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      setZoom((prev) => {
        const next = clampZoom(prev + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
        if (next === prev) return prev;
        const ratio = next / prev;
        const mx = viewport.scrollLeft + offsetX;
        const my = viewport.scrollTop + offsetY;
        requestAnimationFrame(() => {
          viewport.scrollLeft = mx * ratio - offsetX;
          viewport.scrollTop = my * ratio - offsetY;
        });
        return next;
      });
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [enabled, zoom]);

  const fitZoom = useCallback(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    const width = canvas?.offsetWidth || canvasSize.width;
    const height = canvas?.offsetHeight || canvasSize.height;
    if (!viewport || width < 8 || height < 8) {
      setZoom(1);
      return;
    }
    const avail = viewportContentSize(viewport);
    const next = clampZoom(
      Math.min((avail.width - FIT_INSET) / width, (avail.height - FIT_INSET) / height)
    );
    setZoom(next);
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    requestAnimationFrame(() => {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    });
  }, [canvasSize.height, canvasSize.width]);

  const consumePanClick = useCallback(() => {
    const skip = skipClick.current;
    skipClick.current = false;
    return skip;
  }, []);

  return {
    zoom,
    canvasSize,
    spaceDown,
    viewportRef,
    canvasRef,
    startPan,
    fitZoom,
    consumePanClick,
  };
}
