import { type ReactNode } from 'react';
import { X, Edit3 } from 'lucide-react';
import { countChars } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onEdit: () => void;
  onEnter?: () => void;
  contentText?: string;
  maxWidth?: string;
}

export default function PreviewModal({ open, onClose, title, children, onEdit, onEnter, contentText, maxWidth = 'max-w-3xl' }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" />
      <div className={`relative bg-[rgb(var(--color-surface))] rounded-card w-full ${maxWidth} max-h-[90vh] flex flex-col shadow-[0_0_32px_rgb(var(--primary-600)/0.12),0_8px_32px_rgba(0,0,0,0.18)]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--color-border))] flex-shrink-0 bg-white rounded-t-card relative">
          <div className="w-8 flex-shrink-0" />
          <h2 className="font-semibold text-lg truncate flex-1 text-center">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-btn hover:bg-[rgb(var(--color-border))] flex-shrink-0 w-8 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[rgb(var(--color-border))] flex-shrink-0 bg-white rounded-b-card">
          <span className="text-xs text-[rgb(var(--color-text-secondary))]">
            {contentText !== undefined && <>总字数 {countChars(contentText).toLocaleString()}</>}
          </span>
          <div className="flex gap-2">
            {onEnter && (
              <button className="btn-primary text-xs !px-4 !py-2" onClick={onEnter}>进入世界观</button>
            )}
            <button className="btn-ghost text-xs !px-4 !py-2 flex items-center gap-1.5" onClick={onEdit}>
              <Edit3 size={12} /> 编辑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
