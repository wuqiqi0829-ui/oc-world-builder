import { useEffect, useState } from 'react';
import { useOrganizations } from '@/stores/organizations';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, Plus, GripVertical, EyeOff } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

function SortableOrgCard({ org, onEdit, showHandle }: {
  org: { id: string; name: string; type?: string; images?: { url: string }[] };
  onEdit: () => void;
  showHandle: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: org.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={clsx(isDragging && 'z-10 opacity-90')}>
      <div className="relative group">
        <Card hover padding="sm" onClick={onEdit}>
          <div className="flex gap-3">
            {org.images?.[0]?.url && (
              <img src={org.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{org.name}</h4>
              {org.type && (
                <span className="text-[10px] bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-full">
                  {org.type}
                </span>
              )}
            </div>
          </div>
        </Card>
        {showHandle && (
          <button {...attributes} {...listeners}
            className="absolute top-2 left-2 p-1 rounded bg-white/70 dark:bg-white/10 backdrop-blur-sm text-primary-400 border border-white/50 shadow-sm cursor-grab active:cursor-grabbing hover:bg-white/90 dark:hover:bg-white/20 transition-colors touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  worldId: string;
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export default function OrganizationView({ worldId, onCreate, onEdit }: Props) {
  const { organizations, fetch, reorder } = useOrganizations();
  const [showHandle, setShowHandle] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { fetch(worldId); }, [worldId, fetch]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = organizations.findIndex((o) => o.id === active.id);
    const newIndex = organizations.findIndex((o) => o.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...organizations];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorder(reordered.map((o) => o.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">组织势力 ({organizations.length})</h3>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs flex items-center gap-1" onClick={() => setShowHandle(!showHandle)} title={showHandle ? '隐藏拖拽' : '显示拖拽'}>
            <EyeOff size={14} className={showHandle ? '' : 'text-primary-500'} />
          </button>
          <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
            <Plus size={12} /> 新建组织
          </button>
        </div>
      </div>

      {organizations.length === 0 ? (
        <EmptyState icon={<Building2 size={48} />} title="还没有组织"
          description="记录国家、帮派、公会等集团信息"
          action={<button className="btn-primary text-sm" onClick={onCreate}>新建组织</button>} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={organizations.map((o) => o.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {organizations.map((org) => (
                <SortableOrgCard key={org.id} org={org} onEdit={() => onEdit(org.id)} showHandle={showHandle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
