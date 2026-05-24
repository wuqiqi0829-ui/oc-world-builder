import type { Item } from '@/lib/database';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  item: Item;
  selected?: boolean;
  onClick: () => void;
  showHandle?: boolean;
}

export default function ItemCard({ item, selected, onClick, showHandle }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const thumbUrl = item.attributes?.thumb_url as string | undefined;
  const imageUrl = thumbUrl || item.images?.[0]?.url;
  const brief = item.attributes?.brief || '';

  return (
    <div ref={setNodeRef} style={style} className={clsx('break-inside-avoid', isDragging && 'z-10 opacity-90')}>
      <div className="relative group">
        <div
          className={clsx(
            'rounded-card border bg-primary-50/60 dark:bg-primary-900/10 overflow-hidden cursor-pointer transition-shadow backdrop-blur-sm',
            selected ? 'ring-2 ring-primary-500 shadow-md' : 'border-[rgb(var(--color-border))] hover:shadow-md'
          )}
          onClick={onClick}
        >
          <div className="aspect-[4/3] bg-[rgb(var(--color-bg))] flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary-300">{item.name.charAt(0)}</span>
            )}
          </div>
          <div className="p-3 text-center">
            <h4 className="text-sm font-semibold truncate">{item.name}</h4>
            {brief && <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1 whitespace-pre-wrap text-center">「{brief}」</p>}
          </div>
        </div>
        {showHandle && (
          <button {...attributes} {...listeners}
            className="absolute top-1 left-1 p-1 rounded bg-white/70 dark:bg-white/10 backdrop-blur-sm text-primary-400 border border-white/50 shadow-sm cursor-grab active:cursor-grabbing hover:bg-white/90 dark:hover:bg-white/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
