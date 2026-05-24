import { useState, useRef, useCallback, useEffect } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Upload, Loader2, Plus, Trash2, ChevronDown } from 'lucide-react';
import { uploadImage } from '@/lib/db';
import type { ImageItem } from '@/lib/database';
import Lightbox from './Lightbox';
import clsx from 'clsx';

function SortableImage({ image, onRemove, onPreview, onSetCover }: {
  image: ImageItem;
  onRemove: () => void;
  onPreview: () => void;
  onSetCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.url });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={clsx('flex-shrink-0 w-24', isDragging && 'shadow-lg z-10 opacity-90')}>
      <div className="relative group">
        <div className={clsx('aspect-square rounded-lg overflow-hidden border-2 cursor-pointer bg-[rgb(var(--color-bg))]',
          image.isCover ? 'border-primary-400 shadow-[0_0_8px_rgba(124,92,191,0.3)]' : 'border-[rgb(var(--color-border))]')}
          onClick={onPreview}>
          <img src={image.url} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        {image.isCover && (
          <span className="absolute top-1 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium shadow">封面</span>
        )}
        <button {...attributes} {...listeners}
          className="absolute top-1 left-1 p-0.5 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-grab"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </button>
        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100">
          {!image.isCover && (
            <button className="p-0.5 rounded-full bg-black/50 text-white hover:bg-primary-500" onClick={(e) => { e.stopPropagation(); onSetCover(); }} title="设为封面">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </button>
          )}
          <button className="p-0.5 rounded-full bg-black/50 text-white hover:bg-red-500" onClick={onRemove}>
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  outfitDescriptions?: Record<string, string>;
  onDescriptionsChange?: (desc: Record<string, string>) => void;
}

export default function OutfitImageUploader({ images, onChange, outfitDescriptions, onDescriptionsChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [extraGroups, setExtraGroups] = useState<string[]>([]);
  const [activeGroup, _setActiveGroup] = useState('默认');
  const [activeSubGroup, _setActiveSubGroup] = useState('');
  const [subGroupsByGroup, setSubGroupsByGroup] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  const activeGroupRef = useRef('默认');
  const activeSubGroupRef = useRef('');
  const scrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  imagesRef.current = images;

  const setActiveGroup = (g: string) => { _setActiveGroup(g); activeGroupRef.current = g; };
  const setActiveSubGroup = (sg: string) => { _setActiveSubGroup(sg); activeSubGroupRef.current = sg; };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const groups = [...new Set([...images.map((i) => i.group || '默认'), ...extraGroups])];
  const sortedGroups = groups.includes('默认') ? ['默认', ...groups.filter(g => g !== '默认')] : groups;

  // Horizontal scroll via wheel
  useEffect(() => {
    const handlers: { el: HTMLDivElement; fn: (e: WheelEvent) => void }[] = [];
    scrollRefs.current.forEach((el) => {
      const fn = (e: WheelEvent) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      el.addEventListener('wheel', fn, { passive: false });
      handlers.push({ el, fn });
    });
    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener('wheel', fn));
    };
  }, [sortedGroups]);

  const handleFiles = useCallback(async (files: FileList | File[], group: string, subGroup: string) => {
    setUploading(true);
    setUploadError('');
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
        newImages.push({ url, label: '', order: newImages.length, group, subGroup: subGroup || undefined });
      } catch (e: any) {
        setUploadError(e?.message || '上传失败');
      }
    }

    if (newImages.length > 0) {
      onChange([...imagesRef.current, ...newImages]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onChange]);

  const triggerUpload = useCallback((group: string, subGroup: string) => {
    setActiveGroup(group);
    setActiveSubGroup(subGroup);
    fileInputRef.current?.click();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const draggedImg = images.find((i) => i.url === active.id);
    if (!draggedImg) return;
    const group = draggedImg.group || '默认';
    const groupImages = images.filter((i) => (i.group || '默认') === group);
    const oldIndex = groupImages.findIndex((i) => i.url === active.id);
    const newIndex = groupImages.findIndex((i) => i.url === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...groupImages];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const otherImages = images.filter((i) => (i.group || '默认') !== group);
    onChange([...otherImages, ...reordered.map((img, i) => ({ ...img, order: i }))]);
  };

  const removeImage = (url: string) => {
    onChange(images.filter((i) => i.url !== url));
  };

  const setCover = (url: string) => {
    const group = images.find((i) => i.url === url)?.group || '默认';
    onChange(images.map((i) => {
      if ((i.group || '默认') === group) return { ...i, isCover: i.url === url };
      return i;
    }));
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const addGroup = () => {
    const name = prompt('输入新服设分组名称：');
    if (!name?.trim() || sortedGroups.includes(name.trim())) return;
    setExtraGroups((prev) => [...prev, name.trim()]);
  };

  const deleteGroup = (group: string) => {
    onChange(images.filter((i) => (i.group || '默认') !== group));
    setExtraGroups((prev) => prev.filter((g) => g !== group));
    // Clean up description
    if (onDescriptionsChange && outfitDescriptions) {
      const next = { ...outfitDescriptions };
      delete next[group];
      onDescriptionsChange(next);
    }
  };

  const renameGroup = (oldName: string) => {
    const newName = prompt('重命名分组：', oldName);
    if (!newName?.trim() || newName.trim() === oldName) return;
    onChange(images.map((i) => (i.group || '默认') === oldName ? { ...i, group: newName.trim() === '默认' ? undefined : newName.trim() } : i));
    setExtraGroups((prev) => prev.map((g) => g === oldName ? newName.trim() : g));
    // Rename in descriptions
    if (onDescriptionsChange && outfitDescriptions && outfitDescriptions[oldName]) {
      const next = { ...outfitDescriptions };
      next[newName.trim()] = next[oldName];
      delete next[oldName];
      onDescriptionsChange(next);
    }
  };

  // Sub-group management
  const subGroupsOf = (group: string) => {
    const fromImages = [...new Set(images.filter((i) => (i.group || '默认') === group && i.subGroup).map((i) => i.subGroup!))];
    const declared = subGroupsByGroup[group] || [];
    return [...new Set([...fromImages, ...declared])];
  };

  const addSubGroup = (group: string) => {
    const name = prompt('输入二级分组名称：');
    if (!name?.trim()) return;
    setSubGroupsByGroup((prev) => ({
      ...prev,
      [group]: [...(prev[group] || []), name.trim()],
    }));
  };

  const deleteSubGroup = (group: string, subGroup: string) => {
    onChange(images.map((i) => (i.group || '默认') === group && i.subGroup === subGroup ? { ...i, subGroup: undefined } : i));
    setSubGroupsByGroup((prev) => {
      const next = { ...prev };
      next[group] = (next[group] || []).filter((s) => s !== subGroup);
      if (next[group].length === 0) delete next[group];
      return next;
    });
  };

  const renameSubGroup = (group: string, oldName: string) => {
    const newName = prompt('重命名二级分组：', oldName);
    if (!newName?.trim() || newName.trim() === oldName) return;
    onChange(images.map((i) => (i.group || '默认') === group && i.subGroup === oldName ? { ...i, subGroup: newName.trim() } : i));
    setSubGroupsByGroup((prev) => {
      const next = { ...prev };
      next[group] = (next[group] || []).map((s) => (s === oldName ? newName.trim() : s));
      return next;
    });
  };

  const groupImageList = (group: string) => images.filter((i) => (i.group || '默认') === group);

  return (
    <div className="space-y-3">
      {uploadError && <p className="text-xs text-red-500 text-center">{uploadError}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files, activeGroupRef.current, activeSubGroupRef.current);
          }
        }}
      />

      {sortedGroups.map((group) => {
        const groupImgs = groupImageList(group);
        const subGroups = subGroupsOf(group);
        const isCollapsed = collapsedGroups.has(group);
        const desc = outfitDescriptions?.[group] || '';

        return (
          <div key={group} className="border border-[rgb(var(--color-border))] rounded-card overflow-hidden">
            {/* Group header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[rgb(var(--color-bg))]">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <button className="p-0.5 hover:bg-[rgb(var(--color-border))] rounded flex-shrink-0" onClick={() => toggleGroup(group)}>
                  <ChevronDown size={14} className={clsx('transition-transform', isCollapsed && '-rotate-90')} />
                </button>
                <button className="text-sm font-medium hover:text-primary-500 truncate" onClick={() => renameGroup(group)} title="点击重命名">
                  {group}
                </button>
                <span className="text-[10px] text-[rgb(var(--color-text-secondary))] flex-shrink-0">({images.filter((i) => (i.group || '默认') === group).length})</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="text"
                  className="text-[10px] w-24 px-1.5 py-0.5 rounded border border-transparent hover:border-[rgb(var(--color-border))] focus:border-primary-400 bg-transparent text-[rgb(var(--color-text-secondary))] outline-none"
                  placeholder="简介..."
                  value={desc}
                  onChange={(e) => onDescriptionsChange?.({ ...outfitDescriptions, [group]: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
                {group !== '默认' && (
                  <button className="p-0.5 text-[rgb(var(--color-text-secondary))] hover:text-red-500" onClick={() => deleteGroup(group)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <div className="p-3">
                {/* Sub-group tabs */}
                <div className="flex items-center gap-1 mb-2 flex-wrap">
                  <button
                    className={clsx('text-[10px] px-2 py-0.5 rounded-full border transition-colors', !activeSubGroup || activeSubGroup !== activeGroup
                      ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900 dark:border-primary-700 dark:text-primary-300'
                      : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-primary-300')}
                    onClick={() => triggerUpload(group, '')}
                  >
                    全部
                  </button>
                  {subGroups.map((sg) => (
                    <div key={sg} className="flex items-center">
                      <button
                        className={clsx('text-[10px] px-2 py-0.5 rounded-l-full border transition-colors',
                          activeGroup === group && activeSubGroup === sg
                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                            : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-primary-300')}
                        onClick={() => { setActiveGroup(group); setActiveSubGroup(sg); }}
                        onDoubleClick={() => renameSubGroup(group, sg)}
                        title="点击选择 / 双击重命名"
                      >
                        {sg}
                      </button>
                      <button
                        className="p-0.5 rounded-r-full border border-l-0 border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:text-red-500"
                        onClick={() => deleteSubGroup(group, sg)}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button className="text-[10px] px-1.5 py-0.5 rounded-full border border-dashed border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-primary-400 hover:text-primary-500"
                    onClick={() => addSubGroup(group)}>
                    <Plus size={10} className="inline mr-0.5" />二级分组
                  </button>
                </div>

                {/* Images in the active sub-group or all */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={groupImgs.map((img) => img.url)} strategy={rectSortingStrategy}>
                    {groupImgs.length > 0 && (
                      <div
                        ref={(el) => { if (el) scrollRefs.current.set(group, el); }}
                        className="flex gap-2 mb-2 overflow-x-auto"
                        style={{ scrollbarWidth: 'none' }}
                      >
                        {groupImgs.map((img, i) => (
                          <SortableImage
                            key={img.url}
                            image={img}
                            onRemove={() => removeImage(img.url)}
                            onSetCover={() => setCover(img.url)}
                            onPreview={() => {
                              const urls = groupImgs.map((x) => x.url);
                              setLightboxImages(urls);
                              setLightboxIdx(i);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </SortableContext>
                </DndContext>

                <div
                  className="border border-dashed border-[rgb(var(--color-border))] rounded-lg p-3 text-center hover:border-primary-400 cursor-pointer transition-colors"
                  onClick={() => triggerUpload(group, activeSubGroup)}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-500'); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-500'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary-500');
                    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files, group, activeSubGroup);
                  }}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-primary-500" />
                      <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">上传中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <Upload size={12} className="text-[rgb(var(--color-text-secondary))]" />
                      <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">上传 / 拖拽 / 粘贴</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button className="btn-ghost text-xs flex items-center gap-1 w-full justify-center" onClick={addGroup}>
        <Plus size={12} /> 新增分组
      </button>

      {lightboxImages.length > 0 && (
        <Lightbox images={lightboxImages} currentIndex={lightboxIdx} onClose={() => setLightboxImages([])} onNavigate={setLightboxIdx} />
      )}
    </div>
  );
}
