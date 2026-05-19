import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-[rgb(var(--color-text-secondary))]/40 mb-4">
        {icon || <Inbox size={48} />}
      </div>
      <h3 className="text-sm font-medium text-[rgb(var(--color-text))] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[rgb(var(--color-text-secondary))] max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
