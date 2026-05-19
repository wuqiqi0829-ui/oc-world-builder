import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-[rgb(var(--color-surface))] rounded-card shadow-xl w-full ${maxWidth} max-h-[80vh] flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))]">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex-1">{children}</div>
        {footer && (
          <div className="p-4 border-t border-[rgb(var(--color-border))] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
