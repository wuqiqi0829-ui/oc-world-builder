import type { TableItem } from '@/lib/database';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  table: TableItem;
  allChars: { id: string; name: string }[];
  onClick: () => void;
  onPreviewImage: () => void;
  showHandle: boolean;
}

export default function TableCard({ table, allChars, onClick, onPreviewImage, showHandle }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: table.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const linkedNames = table.linked_characters
    ?.map((id) => allChars.find((c) => c.id === id)?.name)
    .filter((n): n is string => !!n) || [];

  const imageUrl = table.images?.[0]?.url;

  return (
    <div ref={setNodeRef} style={style} className={clsx('break-inside-avoid', isDragging && 'z-10 opacity-90')}>
      <div className="relative group">
        {imageUrl ? (
          <div className="rounded-card overflow-hidden border border-[rgb(var(--color-border))] hover:shadow-md transition-all">
            <img
              src={imageUrl}
              alt={table.title}
              className="w-full object-contain cursor-pointer"
              loading="lazy"
              onClick={(e) => { e.stopPropagation(); onPreviewImage(); }}
            />
          </div>
        ) : (
          <div
            className="rounded-card border aspect-[4/3] bg-[rgb(var(--color-bg))] flex items-center justify-center cursor-pointer hover:shadow-md transition-all border-[rgb(var(--color-border))]"
            onClick={onClick}
          >
            <span className="text-3xl font-bold text-primary-300">{table.title?.charAt(0) || '?'}</span>
          </div>
        )}
        <div className="text-center mt-1.5 cursor-pointer" onClick={onClick}>
          <h4 className="text-sm truncate text-[rgb(var(--color-text-secondary))]">{table.title || '(无标题)'}</h4>
          {linkedNames.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-1">
              {linkedNames.map((name) => (
                <span key={name} className="text-[10px] text-primary-500 bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">{name}</span>
              ))}
            </div>
          )}
        </div>
        {showHandle && (
          <button {...attributes} {...listeners}
            className="absolute top-1 left-1 p-1 rounded bg-white/70 backdrop-blur-sm text-primary-400 border border-white/50 shadow-sm cursor-grab active:cursor-grabbing touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
