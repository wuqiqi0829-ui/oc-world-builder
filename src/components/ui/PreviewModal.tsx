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

export default function PreviewModal({ open, onClose, title, children, onEdit, onEnter, contentText, maxWidth = 'max-w-2xl' }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] sm:pt-[15vh]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-[rgb(var(--color-surface))] rounded-card shadow-xl w-full ${maxWidth} max-h-[80vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))] flex-shrink-0">
          <h2 className="font-semibold text-base truncate pr-4">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))] flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-[rgb(var(--color-border))] flex-shrink-0 bg-[rgb(var(--color-bg))]/50">
          <span className="text-xs text-[rgb(var(--color-text-secondary))]">
            {contentText !== undefined && <>总字数 {countChars(contentText).toLocaleString()}</>}
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost text-xs !px-3 !py-1.5" onClick={onClose}>关闭</button>
            {onEnter && (
              <button className="btn-primary text-xs !px-3 !py-1.5" onClick={onEnter}>进入世界观</button>
            )}
            <button className="btn-ghost text-xs !px-3 !py-1.5 flex items-center gap-1.5" onClick={onEdit}>
              <Edit3 size={12} /> 编辑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
