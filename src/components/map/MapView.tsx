import { useState, useRef } from 'react';
import { useLocations } from '@/stores/locations';
import { uploadImage } from '@/lib/db';
import { useReadOnly } from '@/contexts/ReadOnlyContext';
import { Map, Plus, Upload, GripVertical, EyeOff } from 'lucide-react';
import type { Location } from '@/lib/database';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

function SortableLocationCard({ loc, onClick, showHandle }: {
  loc: Location;
  onClick: () => void;
  showHandle: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: loc.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const bgUrl = loc.card_bg_url || loc.images?.[0]?.url;

  return (
    <div ref={setNodeRef} style={style} className={clsx('h-full', isDragging && 'z-10 opacity-90')}>
      <div className="relative group h-full">
        <div className="relative overflow-hidden rounded-xl border border-primary-100 dark:border-primary-900/30 shadow-[0_4px_20px_rgb(var(--primary-600)/0.1)] h-40 flex items-center bg-white hover:shadow-[0_8px_30px_rgb(var(--primary-600)/0.2)] hover:border-primary-200 transition-all cursor-pointer"
          onClick={onClick}>
          {bgUrl && (
            <>
              <div className="absolute inset-0">
                <img src={bgUrl} alt="" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
            </>
          )}
          <div className="relative text-center w-full px-5 z-10">
            <span className="text-lg font-semibold block text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{loc.name}</span>
            <div className="flex flex-col gap-1 mt-3 items-center">
              {loc.region && (
                <span className="text-sm bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">区域：{loc.region}</span>
              )}
              {loc.category && (
                <span className="text-sm bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">简介：{loc.category}</span>
              )}
            </div>
          </div>
        </div>
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
  locations: Location[];
  worldId: string;
  onEdit: (id: string) => void;
  onCreate: () => void;
  onPreview?: (id: string) => void;
}

export default function MapView({ locations, worldId, onEdit, onCreate, onPreview }: Props) {
  const readOnly = useReadOnly();
  const { mapImageUrl, setMapImageUrl, reorder } = useLocations();
  const [uploading, setUploading] = useState(false);
  const [showHandle, setShowHandle] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'maps');
      setMapImageUrl(url, worldId);
      localStorage.setItem(`oc-map-${worldId}`, url);
    } catch { /**/ }
    setUploading(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = locations.findIndex((l) => l.id === active.id);
    const newIndex = locations.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...locations];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorder(reordered.map((l) => l.id));
  };

  if (!mapImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6">
          <Map size={40} className="text-primary-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">上传世界观地图</h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6 text-center max-w-xs">
          上传你的世界观地图底图
        </p>
        <button className="btn-primary text-sm flex items-center gap-2 relative" disabled={uploading}>
          <input ref={imageInputRef} type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleMapUpload} />
          <Upload size={16} />
          {uploading ? '上传中...' : '上传地图底图'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          {!readOnly && <button className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 border border-primary-200 dark:border-primary-700/50 hover:bg-primary-100 transition-colors" onClick={() => { setMapImageUrl('', worldId); }}>更换底图</button>}
        </div>
        <div className="rounded-card overflow-hidden border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]" style={{ aspectRatio: '16/9' }}>
          <img src={mapImageUrl} alt="世界地图" className="w-full h-full object-contain" draggable={false} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">地点列表 ({locations.length})</h3>
          <div className="flex items-center gap-2">
            {!readOnly && <button className="btn-ghost text-xs flex items-center gap-1" onClick={() => setShowHandle(!showHandle)} title={showHandle ? '隐藏拖拽' : '显示拖拽'}>
              <EyeOff size={14} className={showHandle ? '' : 'text-primary-500'} />
            </button>}
            {!readOnly && (
            <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 border border-primary-200 dark:border-primary-700/50 hover:bg-primary-100 transition-colors" onClick={onCreate}>
              <Plus size={12} /> 新建地点
            </button>
            )}
          </div>
        </div>
        {locations.length === 0 ? (
          <p className="text-xs text-[rgb(var(--color-text-secondary))] py-6 text-center">暂无地点</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={locations.map((l) => l.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
                {locations.map((loc) => (
                  <SortableLocationCard key={loc.id} loc={loc}
                    onClick={() => onPreview ? onPreview(loc.id) : onEdit(loc.id)}
                    showHandle={showHandle} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
