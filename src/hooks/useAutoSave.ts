import { useEffect, useRef, useState, useCallback } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  delay = 1500,
): { status: SaveStatus; saveNow: () => Promise<void> } {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const valueRef = useRef(value);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const doSave = useCallback(async (val: T) => {
    setStatus('saving');
    try {
      await save(val);
      if (mountedRef.current) setStatus('saved');
      setTimeout(() => { if (mountedRef.current) setStatus('idle'); }, 2000);
    } catch {
      if (mountedRef.current) setStatus('error');
    }
  }, [save]);

  useEffect(() => {
    valueRef.current = value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doSave(valueRef.current);
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, delay, doSave]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await doSave(valueRef.current);
  }, [doSave]);

  return { status, saveNow };
}
