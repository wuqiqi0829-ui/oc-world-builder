import { X } from 'lucide-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Drawer({ open, onClose, title, children }: DrawerProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          'fixed right-0 top-0 h-full z-50 bg-[rgb(var(--color-surface))] border-l border-[rgb(var(--color-border))] w-full sm:w-96 shadow-xl transition-transform duration-200 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
          <h2 className="font-semibold text-sm">{title || '编辑'}</h2>
          <button onClick={onClose} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))]">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4" style={{ height: 'calc(100% - 57px)' }}>
          {children}
        </div>
      </aside>
    </>
  );
}
