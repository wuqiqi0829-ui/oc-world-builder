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
import { Clock, GripVertical, ArrowUpDown, EyeOff, Plus, ArrowLeftRight } from 'lucide-react';
import clsx from 'clsx';

function getBrief(desc: string): string {
  const idx = desc.indexOf('<!--brief-->');
  if (idx >= 0) return desc.slice(0, idx);
  return desc.replace(/<[^>]*>/g, '').slice(0, 80);
}

function TimelineCard({ event, onPreview, onEdit, isLeft, showHandle, dragProps, onFlip }: {
  event: TimelineEvent;
  onPreview?: (id: string) => void;
  onEdit?: (id: string) => void;
  isLeft: boolean;
  showHandle: boolean;
  dragProps: { attributes: any; listeners: any };
  onFlip: () => void;
}) {
  const brief = getBrief(event.description || '');

  return (
    <div className="relative group/card">
      {showHandle && (
        <button
          {...dragProps.attributes}
          {...dragProps.listeners}
          className={clsx('absolute top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-primary-500 transition-colors touch-none', isLeft ? '-right-7' : '-left-7')}
        >
          <GripVertical size={14} />
        </button>
      )}
      <div
        className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
        onClick={() => (onPreview || onEdit)?.(event.id)}
      >
        <div className="text-center">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">{event.title}</h3>
          {brief && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed whitespace-pre-wrap line-clamp-2">{brief}</p>
          )}
        </div>
      </div>
      <button
        className="absolute top-2 right-2 p-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-primary-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); onFlip(); }}
        title="切换左右"
      >
        <ArrowLeftRight size={12} />
      </button>
    </div>
  );
}

function TimelineNode({ event, onPreview, onEdit, showHandle, onFlip, onCreateSubTimeline }: {
  event: TimelineEvent; onPreview?: (id: string) => void; onEdit?: (id: string) => void;
  showHandle: boolean; onFlip: () => void; onCreateSubTimeline?: (timeLabel: string) => void;
}) {
  const isLeft = !event.collapsed;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: event.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={clsx('relative', isDragging && 'opacity-50')}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start relative">
        {/* Left side */}
        <div className="flex justify-end pr-2 sm:pr-6 lg:pr-12">
          {isLeft && <TimelineCard event={event} onPreview={onPreview} onEdit={onEdit} isLeft={true} showHandle={showHandle} dragProps={{ attributes, listeners }} onFlip={onFlip} />}
        </div>

        {/* Center dot + label */}
        <div className="flex flex-col items-center z-10" style={{ paddingTop: 12 }}>
          <button
            className="w-5 h-5 rounded-full bg-primary-300 hover:bg-primary-400 border-2 border-white dark:border-gray-800 shadow-sm cursor-pointer hover:scale-125 transition-all"
            onClick={() => onCreateSubTimeline?.(event.time_label || event.title)}
            title="创建子时间轴"
          />
          {event.time_label && (
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 whitespace-nowrap font-mono text-center">{event.time_label}</span>
          )}
        </div>

        {/* Right side */}
        <div className="flex pl-2 sm:pl-6 lg:pl-12">
          {!isLeft && <TimelineCard event={event} onPreview={onPreview} onEdit={onEdit} isLeft={false} showHandle={showHandle} dragProps={{ attributes, listeners }} onFlip={onFlip} />}
        </div>
      </div>
    </div>
  );
}

interface Props {
  events: TimelineEvent[];
  onCreate?: () => void;
  onCreateSubTimeline?: (timeLabel: string) => void;
  onEdit: (id: string) => void;
  onPreview?: (id: string) => void;
  title?: string;
}

export default function TimelineView({ events, onCreate, onCreateSubTimeline, onEdit, onPreview, title }: Props) {
  const { sortOrder, setSortOrder, reorder, update } = useTimeline();
  const [showHandle, setShowHandle] = useState(false);

  const sorted = useMemo(() => {
    return sortOrder === 'asc' ? events : [...events].reverse();
  }, [events, sortOrder]);

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
    <div className="space-y-4 pb-16">
      <div className="flex items-center gap-2 relative">
        <button
          className={clsx('btn-ghost text-xs flex items-center gap-1', '!px-2 !py-1')}
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown size={14} />
          {sortOrder === 'asc' ? '时间正序' : '时间倒序'}
        </button>
        <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={() => setShowHandle(!showHandle)} title={showHandle ? '隐藏拖拽' : '显示拖拽'}>
          <EyeOff size={14} className={showHandle ? '' : 'text-primary-500'} />
        </button>
        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-primary-600 dark:text-primary-400">{title}</span>
        )}
        <div className="flex-1" />
        {onCreate && (
          <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
            <Plus size={12} /> 新建事件
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Clock size={48} />}
          title="还没有时间节点"
          description="添加第一个历史事件，构建世界观时间轴"
          action={onCreate ? <button className="btn-primary text-sm" onClick={onCreate}>新建事件</button> : undefined}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="relative">
              <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gray-300 dark:bg-gray-600 -translate-x-1/2" />

              <div className="space-y-6 lg:space-y-8">
                {sorted.map((event) => (
                  <TimelineNode key={event.id} event={event}
                    onPreview={onPreview} onEdit={onEdit} showHandle={showHandle}
                    onCreateSubTimeline={onCreateSubTimeline}
                    onFlip={() => update(event.id, { collapsed: !event.collapsed } as Partial<TimelineEvent>)} />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
