import { useEffect, useState } from 'react';
import { useCategories } from '@/stores/categories';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, GripVertical, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CustomEntry } from '@/lib/database';

function SortableEntryCard({ entry, onPreview, showHandle }: { entry: CustomEntry; onPreview: () => void; showHandle: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const fv = (entry.field_values as Record<string, unknown> | undefined) || {};
  const brief = fv.brief as string || '';
  const thumbUrl = fv.thumb_url as string | undefined;
  const imgSrc = thumbUrl || entry.images?.[0]?.url;

  const imageEl = imgSrc && (
    <div className="w-full rounded-lg overflow-hidden mb-8 h-48 sm:h-64 md:h-80 lg:h-96 flex-shrink-0">
      <img src={imgSrc} alt={entry.name} className="w-full h-full object-cover" />
    </div>
  );

  return (
    <div ref={setNodeRef} style={style} className={clsx('relative group/card break-inside-avoid', isDragging && 'z-10 opacity-90')}>
      {showHandle && (
        <button {...attributes} {...listeners}
          className="absolute top-2 left-2 z-10 p-1 rounded bg-white/70 dark:bg-white/10 backdrop-blur-sm text-primary-400 border border-white/50 shadow-sm cursor-grab active:cursor-grabbing hover:bg-white/90 dark:hover:bg-white/20 transition-colors touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </button>
      )}
      <Card hover padding="sm" onClick={onPreview} className="flex flex-col">
        <div className="text-center pt-1 pb-2 sm:pb-4 px-1 flex flex-col">
          {imageEl || <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 flex-shrink-0 mb-4 sm:mb-8" />}
          <div className="flex-1 flex flex-col items-center">
            <h4 className="text-base font-semibold">{entry.name}</h4>
            {brief && (
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-2 sm:mt-4 whitespace-pre-wrap">「{brief}」</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

interface Props {
  worldId: string;
  onCreateEntry: (categoryId: string) => void;
  onPreviewEntry: (categoryId: string, entryId: string) => void;
}

export default function RaceClassView({ worldId, onCreateEntry, onPreviewEntry }: Props) {
  const { categories, entries, fetchCategories, fetchEntries } = useCategories();
  const [tab, setTab] = useState<'种族' | '职业'>('种族');
  const [showHandle, setShowHandle] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { fetchCategories(worldId); }, [worldId, fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      categories.forEach(cat => fetchEntries(cat.id));
    }
  }, [categories, fetchEntries]);

  const cat = categories.find(c => c.name === tab);
  const items = cat ? (entries[cat.id] || []) : [];

  const reorderEntries = useCategories((s) => s.reorderEntries);
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id || !cat) return;
    const oldIdx = items.findIndex(x => x.id === active.id);
    const newIdx = items.findIndex(x => x.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = [...items];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    useCategories.setState(s => ({
      entries: { ...s.entries, [cat.id]: reordered }
    }));
    reorderEntries(cat.id, reordered.map(x => x.id));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[rgb(var(--color-bg))] rounded-lg p-0.5 border border-[rgb(var(--color-border))]">
          <button
            className={clsx('text-xs px-3 py-1.5 rounded-md transition-colors', tab === '种族' ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]')}
            onClick={() => setTab('种族')}
          >种族</button>
          <button
            className={clsx('text-xs px-3 py-1.5 rounded-md transition-colors', tab === '职业' ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]')}
            onClick={() => setTab('职业')}
          >职业</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={() => setShowHandle(!showHandle)} title={showHandle ? '隐藏拖拽' : '显示拖拽'}>
            <EyeOff size={14} className={showHandle ? '' : 'text-primary-500'} />
          </button>
          <button className="btn-primary text-xs flex items-center gap-1" onClick={() => cat && onCreateEntry(cat.id)}>
            <Plus size={12} /> 新建{tab}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title={`还没有${tab}`} description={`点击新建${tab}来添加`} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(e => e.id)} strategy={rectSortingStrategy}>
            <div className="columns-2 sm:columns-4 lg:columns-5 gap-2 [&>*]:mb-2">
              {items.map((entry) => (
                <SortableEntryCard key={entry.id} entry={entry} showHandle={showHandle}
                  onPreview={() => cat && onPreviewEntry(cat.id, entry.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
