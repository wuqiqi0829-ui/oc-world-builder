import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function EditModal({ open, onClose, title, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-[15vw]">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-[rgb(var(--color-surface))] rounded-card shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))] flex-shrink-0 bg-white rounded-t-card">
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))]">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}
