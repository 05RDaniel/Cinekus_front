import { useCallback, useEffect, useRef, useState } from 'react';

export function useInitialLoad<T>(loader: () => Promise<T>, emptyValue: T) {
  const [rows, setRows] = useState<T>(emptyValue);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const emptyRef = useRef(emptyValue);
  emptyRef.current = emptyValue;

  const reload = useCallback(async () => {
    const data = await loader();
    setRows(data);
    return data;
  }, [loader]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        await reload();
        if (mounted) setHasLoadError(false);
      } catch {
        if (mounted) {
          setRows(emptyRef.current);
          setHasLoadError(true);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [reload]);

  return { rows, setRows, isLoading, hasLoadError, setHasLoadError, reload, setIsLoading };
}
