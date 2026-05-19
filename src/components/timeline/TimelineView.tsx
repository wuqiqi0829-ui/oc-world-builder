import { useMemo, useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TimelineEvent } from '@/lib/database';
import { useTimeline } from '@/stores/timeline';
import EmptyState from '@/components/ui/EmptyState';
import { Clock, GripVertical, ChevronDown, ChevronUp, ArrowUpDown, ImageIcon } from 'lucide-react';
import clsx from 'clsx';

function TimelineNode({ event, index, onEdit }: {
  event: TimelineEvent; index: number; onEdit: (id: string) => void;
}) {
  const { update } = useTimeline();
  const isLeft = index % 2 === 0;
  const hasImage = event.images && event.images.length > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={clsx('relative flex items-start gap-2 group', isDragging && 'opacity-50')}>
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-4 cursor-grab active:cursor-grabbing text-[rgb(var(--color-text-secondary))] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <GripVertical size={16} />
      </button>

      {/* Content card */}
      <div className="flex-1">
        {/* Mobile: time label above card */}
        <div className="lg:hidden text-xs font-mono text-primary-500 mb-1 ml-1">{event.time_label || '未标注时间'}</div>

        <div
          className={clsx(
            'card cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
            event.collapsed ? 'py-2' : ''
          )}
          onClick={() => onEdit(event.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">{event.title}</h3>
                {hasImage && <ImageIcon size={12} className="text-[rgb(var(--color-text-secondary))] flex-shrink-0" />}
              </div>
              {!event.collapsed && event.description && (
                <div
                  className="text-xs text-[rgb(var(--color-text-secondary))] mt-1.5 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: event.description.replace(/<[^>]*>/g, '').slice(0, 200) }}
                />
              )}
            </div>
            <button
              className="p-0.5 rounded hover:bg-[rgb(var(--color-border))] flex-shrink-0"
              onClick={(e) => { e.stopPropagation(); update(event.id, { collapsed: !event.collapsed } as Partial<TimelineEvent>); }}
            >
              {event.collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: time label on alternating sides */}
      <div className={clsx(
        'hidden lg:block w-28 flex-shrink-0 text-xs font-mono text-primary-500 pt-4',
        isLeft ? 'text-right order-first' : 'text-left'
      )}>
        {event.time_label || '未标注时间'}
      </div>
    </div>
  );
}

interface Props {
  events: TimelineEvent[];
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export default function TimelineView({ events, onCreate, onEdit }: Props) {
  const { sortOrder, setSortOrder, reorder } = useTimeline();
  const [showCollapsed, setShowCollapsed] = useState(true);

  const sorted = useMemo(() => {
    const visible = showCollapsed ? events : events.filter((e) => !e.collapsed);
    return sortOrder === 'asc' ? visible : [...visible].reverse();
  }, [events, sortOrder, showCollapsed]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sorted.map((e) => e.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    ids.splice(oldIdx, 1);
    ids.splice(newIdx, 0, active.id as string);
    reorder(ids);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          className={clsx('btn-ghost text-xs flex items-center gap-1', '!px-2 !py-1')}
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown size={14} />
          {sortOrder === 'asc' ? '时间正序' : '时间倒序'}
        </button>
        <button
          className={clsx('btn-ghost text-xs !px-2 !py-1', !showCollapsed && 'text-primary-500')}
          onClick={() => setShowCollapsed(!showCollapsed)}
        >
          {showCollapsed ? '隐藏折叠' : '显示全部'}
        </button>
        <div className="flex-1" />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Clock size={48} />}
          title="还没有时间节点"
          description="添加第一个历史事件，构建世界观时间轴"
          action={<button className="btn-primary text-sm" onClick={onCreate}>新建事件</button>}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="relative">
              {/* Timeline center line (desktop) */}
              <div className="hidden lg:block absolute left-8 right-8 top-0 bottom-0 w-0.5 bg-[rgb(var(--color-border))] mx-auto" />

              <div className="space-y-1">
                {sorted.map((event, index) => (
                  <TimelineNode key={event.id} event={event} index={index} onEdit={onEdit} />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
