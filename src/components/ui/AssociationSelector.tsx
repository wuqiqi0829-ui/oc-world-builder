import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Props<T> {
  label: string;
  items: T[];
  selected: string[];
  onChange: (ids: string[]) => void;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
}

export default function AssociationSelector<T>({ label, items, selected, onChange, getId, getLabel }: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          'input w-full flex items-center justify-between text-sm',
          selected.length > 0 && 'border-primary-400'
        )}
      >
        <span>{label}{selected.length > 0 ? ` (${selected.length})` : ''}</span>
        <ChevronDown size={14} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-card shadow-xl max-h-48 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-[rgb(var(--color-text-secondary))] px-3 py-2">暂无数据</p>
          ) : (
            items.map((item) => (
              <label
                key={getId(item)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[rgb(var(--color-border))]/50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(getId(item))}
                  onChange={() => toggle(getId(item))}
                  className="rounded accent-primary-500"
                />
                <span className="truncate">{getLabel(item)}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
