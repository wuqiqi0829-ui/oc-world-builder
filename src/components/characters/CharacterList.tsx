import { useMemo, useState } from 'react';
import type { Character } from '@/lib/database';
import CharacterCard from './CharacterCard';
import EmptyState from '@/components/ui/EmptyState';
import { Users, Search, Plus, GripVertical, EyeOff } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { useCharacters } from '@/stores/characters';

function SortableCharacterCard({ character, selected, onClick, showHandle }: {
  character: Character;
  selected: boolean;
  onClick: () => void;
  showHandle: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: character.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={clsx('relative h-full', isDragging && 'z-10 opacity-90')}>
      {showHandle && (
        <button {...attributes} {...listeners}
          className="absolute top-2 left-2 z-10 p-1 rounded bg-white/70 dark:bg-white/10 backdrop-blur-sm text-primary-400 border border-white/50 shadow-sm cursor-grab active:cursor-grabbing hover:bg-white/90 dark:hover:bg-white/20 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </button>
      )}
      <CharacterCard character={character} selected={selected} onClick={onClick} />
    </div>
  );
}

interface Props {
  characters: Character[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export default function CharacterList({ characters, activeId, onSelect, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [showHandle, setShowHandle] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { reorder } = useCharacters();

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      if (search && !c.name.includes(search) && !c.nickname?.includes(search)) return false;
      return true;
    });
  }, [characters, search]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filtered.findIndex((c) => c.id === active.id);
    const newIndex = filtered.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...filtered];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorder(reordered.map((c) => c.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
          <input
            type="text"
            placeholder="搜索角色..."
            className="input pl-8 w-full text-sm h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-ghost text-sm !px-2 flex items-center gap-1 flex-shrink-0" onClick={() => setShowHandle(!showHandle)} title={showHandle ? '隐藏拖拽' : '显示拖拽'}>
          <EyeOff size={14} className={showHandle ? '' : 'text-primary-500'} />
        </button>
        <button className="btn-primary text-sm !px-3 !py-1.5 flex items-center gap-1 flex-shrink-0" onClick={onCreate}>
          <Plus size={14} /> 新建人物
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title={characters.length === 0 ? '还没有角色' : '没有匹配的角色'}
          description={characters.length === 0 ? '创建你的第一个OC人设卡' : '试试调整搜索条件'}
          action={
            characters.length === 0 ? (
              <button className="btn-primary text-sm" onClick={onCreate}>新建角色</button>
            ) : undefined
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((c) => c.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {filtered.map((c) => (
                <SortableCharacterCard
                  key={c.id}
                  character={c}
                  selected={activeId === c.id}
                  onClick={() => onSelect(c.id)}
                  showHandle={showHandle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
