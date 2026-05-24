import { useEffect, useState } from 'react';
import { useItems } from '@/stores/items';
import EmptyState from '@/components/ui/EmptyState';
import ItemCard from './ItemCard';
import { Package, Plus, EyeOff } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface Props {
  worldId: string;
  onPreview: (id: string) => void;
  onCreate: () => void;
}

export default function ItemsView({ worldId, onPreview, onCreate }: Props) {
  const { items, fetch, reorder } = useItems();
  const [showHandle, setShowHandle] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { fetch(worldId); }, [worldId, fetch]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorder(reordered.map((i) => i.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">物品图鉴 ({items.length})</h3>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs flex items-center gap-1" onClick={() => setShowHandle(!showHandle)} title={showHandle ? '隐藏拖拽' : '调整顺序'}>
            <EyeOff size={14} className={showHandle ? '' : 'text-primary-500'} />
          </button>
          <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
            <Plus size={12} /> 新建物品
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Package size={48} />} title="还没有物品"
          description="记录世界观中的特殊物品、武器、道具"
          action={<button className="btn-primary text-sm" onClick={onCreate}>新建物品</button>} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 [&>*]:mb-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} showHandle={showHandle}
                  onClick={() => onPreview(item.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
