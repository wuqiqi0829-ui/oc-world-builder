import { useState } from 'react';
import { useIllustrations } from '@/stores/illustrations';
import type { Illustration } from '@/lib/database';
import EmptyState from '@/components/ui/EmptyState';
import Lightbox from '@/components/ui/Lightbox';
import { Image, Plus, GripVertical, EyeOff } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

function SortableImageCard({ ill, onEdit, onPreviewImage, showHandle }: {
  ill: Illustration;
  onEdit: () => void;
  onPreviewImage: () => void;
  showHandle: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ill.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const img = ill.images?.[0];
  const displayImg = img?.displayUrl || img?.url;

  return (
    <div ref={setNodeRef} style={style} className={clsx('group relative h-full', isDragging && 'opacity-50 z-10')}>
      <div className="relative">
        {displayImg ? (
          <div
            className="w-full aspect-[4/3] rounded-card overflow-hidden border border-[rgb(var(--color-border))] cursor-pointer"
            onClick={onPreviewImage}
          >
            <img
              src={displayImg}
              alt={ill.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className="w-full aspect-[4/3] rounded-card bg-[rgb(var(--color-bg))] flex items-center justify-center cursor-pointer border border-[rgb(var(--color-border))]"
            onClick={onPreviewImage}
          >
            <Image size={32} className="text-[rgb(var(--color-border))]" />
          </div>
        )}
        {showHandle && (
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </button>
        )}
        {ill.images.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {ill.images.length}
          </span>
        )}
      </div>
      <button
        className="text-sm mt-1.5 truncate w-full text-center text-[rgb(var(--color-text-secondary))] opacity-70 hover:text-primary-500 transition-colors"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        title={ill.name}
      >
        {ill.name}
      </button>
    </div>
  );
}

interface Props {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export default function IllustrationGallery({ onEdit, onCreate }: Props) {
  const { illustrations, reorder } = useIllustrations();
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number>(0);
  const [showHandle, setShowHandle] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = illustrations.findIndex((i) => i.id === active.id);
    const newIndex = illustrations.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...illustrations];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorder(reordered.map((i) => i.id));
  };

  const sorted = [...illustrations].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">插图集 ({illustrations.length})</h3>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs flex items-center gap-1" onClick={() => setShowHandle(!showHandle)} title={showHandle ? '隐藏拖拽' : '显示拖拽'}>
            <EyeOff size={14} className={showHandle ? '' : 'text-primary-500'} />
          </button>
          <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
            <Plus size={12} /> 新建插图
          </button>
        </div>
      </div>

      {illustrations.length === 0 ? (
        <EmptyState icon={<Image size={48} />} title="还没有插图"
          description="上传和管理世界观相关的插图素材，支持无损画质" />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map((ill) => (
                <SortableImageCard
                  key={ill.id}
                  ill={ill}
                  showHandle={showHandle}
                  onEdit={() => onEdit(ill.id)}
                  onPreviewImage={() => {
                    const allUrls = sorted.flatMap((x) => (x.images || []).map((i) => i.url));
                    const idx = sorted.findIndex((x) => x.id === ill.id);
                    setLightboxImages(allUrls);
                    setLightboxIdx(idx >= 0 ? idx : 0);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxImages([])}
          onNavigate={setLightboxIdx}
        />
      )}
    </div>
  );
}
