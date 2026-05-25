import { useState } from 'react';
import { Plus, Globe, GripVertical, EyeOff } from 'lucide-react';
import type { World } from '@/lib/database';
import Card from '@/components/ui/Card';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

function SortableWorldCard({ world, onSelect, onPreview, showHandle }: {
  world: World;
  onSelect: (id: string) => void;
  onPreview?: (id: string) => void;
  showHandle: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: world.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={clsx('break-inside-avoid mb-4', isDragging && 'z-10 opacity-90')}>
      <div className="relative group">
        <Card hover padding="sm"
          onClick={() => onPreview ? onPreview(world.id) : onSelect(world.id)}
          className="h-full cursor-pointer">
          <div className="aspect-[3/2] rounded-lg bg-[rgb(var(--color-bg))] overflow-hidden mb-3 border border-[rgb(var(--color-border))]">
            {world.cover_url ? (
              <img src={world.cover_url} alt={world.name} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-300">
                <Globe size={48} />
              </div>
            )}
          </div>
          <h3 className="font-semibold text-sm mb-1 text-center">{world.name}</h3>
          {world.description && (
            <p className="text-xs text-[rgb(var(--color-text-secondary))] whitespace-pre-wrap text-center">{world.description}</p>
          )}
          {onPreview && (
            <button className="btn-primary text-xs w-full mt-2 !py-1"
              onClick={(e) => { e.stopPropagation(); onSelect(world.id); }}>
              进入世界观
            </button>
          )}
        </Card>
        {showHandle && (
          <button {...attributes} {...listeners}
            className="absolute top-3 left-3 p-1.5 rounded-lg bg-white/70 dark:bg-white/10 backdrop-blur-sm text-primary-400 border border-white/50 dark:border-white/10 shadow-sm cursor-grab active:cursor-grabbing hover:bg-white/90 dark:hover:bg-white/20 transition-colors touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  worlds: World[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onPreview?: (id: string) => void;
  onReorder: (ids: string[]) => void;
}

export default function WorldSelector({ worlds, onSelect, onNew, onPreview, onReorder }: Props) {
  const [showHandle, setShowHandle] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = worlds.findIndex((w) => w.id === active.id);
    const newIndex = worlds.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...worlds];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((w) => w.id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">我的世界观</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
            {worlds.length > 0 ? '选择一个世界观进入，或创建新的' : '创建你的第一个世界观'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost text-sm flex items-center gap-1"
            onClick={() => setShowHandle(!showHandle)}
            title={showHandle ? '隐藏拖拽手柄' : '显示拖拽手柄'}
          >
            <EyeOff size={16} className={showHandle ? '' : 'text-primary-500'} />
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={onNew}>
            <Plus size={16} /> 新建世界观
          </button>
        </div>
      </div>

      {worlds.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe size={36} className="text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">欢迎使用 OC World Builder</h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
              创建你的第一个世界观，开始记录人物、时间线、地图等设定。所有数据自动云端同步。
            </p>
            <button className="btn-primary" onClick={onNew}>创建第一个世界观</button>
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={worlds.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {worlds.map((world) => (
                <SortableWorldCard key={world.id} world={world}
                  onSelect={onSelect} onPreview={onPreview}
                  showHandle={showHandle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
