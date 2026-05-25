import { createContext, useContext, useEffect, type ReactNode } from 'react';

const ReadOnlyContext = createContext(false);

export function ReadOnlyProvider({ value, children }: { value: boolean; children: ReactNode }) {
  useEffect(() => {
    if (value) {
      document.documentElement.setAttribute('data-readonly', '');
    }
    return () => { document.documentElement.removeAttribute('data-readonly'); };
  }, [value]);
  return <ReadOnlyContext.Provider value={value}>{children}</ReadOnlyContext.Provider>;
}

export function useReadOnly(): boolean {
  return useContext(ReadOnlyContext);
}
