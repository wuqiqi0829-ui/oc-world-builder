import { useState, useRef, useCallback } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/db';
import type { ImageItem } from '@/lib/database';
import Lightbox from './Lightbox';
import clsx from 'clsx';

interface Props {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

function SortableImage({ image, index, onRemove, onPreview, hideHandle }: {
  image: ImageItem;
  index: number;
  onRemove: () => void;
  onPreview: () => void;
  hideHandle?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: index.toString() });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'card flex items-start group relative',
        isDragging && 'shadow-lg z-10 opacity-90',
        hideHandle ? 'gap-0' : 'gap-3'
      )}
    >
      {!hideHandle && (
        <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]">
          <GripVertical size={16} />
        </button>
      )}
      <div
        className="w-full h-36 rounded-card bg-[rgb(var(--color-bg))] overflow-hidden flex-shrink-0 cursor-pointer border border-[rgb(var(--color-border))]"
        onClick={onPreview}
      >
        <img src={image.url} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <button
        className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
        onClick={onRemove}
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function ImageUploader({ images, onChange, maxImages }: Props) {
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const newImages: ImageItem[] = [];
    const { default: imageCompression } = await import('browser-image-compression');

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const url = await uploadImage(compressed, 'images');
        newImages.push({ url, label: '', order: images.length + newImages.length });
      } catch {
        // skip failed uploads
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
  }, [images, onChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    const reordered = [...images];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onChange(reordered.map((img, i) => ({ ...img, order: i })));
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) handleFiles(files);
  }, [handleFiles]);

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  };

  return (
    <div onPaste={handlePaste} className="space-y-3">
      {maxImages === 1 ? (
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={`${img.url}-${i}`} className="group relative">
              <div
                className="w-full h-48 rounded-card bg-[rgb(var(--color-bg))] overflow-hidden cursor-pointer border border-[rgb(var(--color-border))]"
                onClick={() => setLightboxIndex(i)}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <button
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                onClick={() => removeImage(i)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((_, i) => i.toString())} strategy={rectSortingStrategy}>
            <div className="space-y-2">
              {images.map((img, i) => (
                <SortableImage
                  key={`${img.url}-${i}`}
                  image={img}
                  index={i}
                  onRemove={() => removeImage(i)}
                  onPreview={() => setLightboxIndex(i)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {(!maxImages || images.length < maxImages) && (
      <div
        ref={dropZoneRef}
        className={clsx(
          'border-2 border-dashed border-[rgb(var(--color-border))] rounded-card p-6 text-center transition-colors',
          'hover:border-primary-400 cursor-pointer relative'
        )}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-500'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-500'); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-primary-500');
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <Loader2 size={24} className="animate-spin text-primary-500" />
            <span className="text-xs text-[rgb(var(--color-text-secondary))]">压缩上传中...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 pointer-events-none">
            <Upload size={24} className="text-[rgb(var(--color-text-secondary))]" />
            <span className="text-xs text-[rgb(var(--color-text-secondary))]">
              点击上传 / 拖拽图片 / Ctrl+V 粘贴
            </span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={maxImages !== 1}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images.map((i) => i.url)}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
