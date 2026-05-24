import { useState, useEffect, useCallback } from 'react';
import { useItems } from '@/stores/items';
import { useCharacters } from '@/stores/characters';
import { useLocations } from '@/stores/locations';
import { useCategories } from '@/stores/categories';
import ImageUploader from '@/components/ui/ImageUploader';
import type { ImageItem } from '@/lib/database';
import { Trash2, Loader2, Plus, X, Crop, GripVertical } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { cropAndUpload } from '@/lib/imageCrop';

interface Props {
  worldId: string;
  itemId: string | null;
  onClose: () => void;
}

interface Associations {
  characters: string[];
  locations: string[];
  entries: string[];
}

function parseAssociations(attrs: Record<string, string>): Associations {
  try {
    const raw = attrs._associations;
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { characters: [], locations: [], entries: [] };
}

function buildAssociations(assoc: Associations): string {
  return JSON.stringify(assoc);
}

function SortableAttrRow({ attrKey, attrVal, onRemove }: { attrKey: string; attrVal: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: attrKey });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-1 text-xs bg-[rgb(var(--color-bg))] rounded px-2 py-1 ${isDragging ? 'z-10 opacity-80 shadow-md' : ''}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))] flex-shrink-0">
        <GripVertical size={12} />
      </button>
      <span className="font-medium text-[rgb(var(--color-text-secondary))]">{attrKey}:</span>
      <span className="flex-1">{attrVal}</span>
      <button className="text-red-400 hover:text-red-600 flex-shrink-0" onClick={onRemove}>
        <X size={12} />
      </button>
    </div>
  );
}

export default function ItemEditPanel({ worldId, itemId, onClose }: Props) {
  const { items, create, update, remove } = useItems();
  const { characters } = useCharacters();
  const { locations } = useLocations();
  const { entries: catEntries } = useCategories();
  const isNew = !itemId;
  const existing = itemId ? items.find((i) => i.id === itemId) : null;

  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [attrs, setAttrs] = useState<[string, string][]>([]);
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');
  const [associations, setAssociations] = useState<Associations>({ characters: [], locations: [], entries: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  // crop modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setBrief(existing.attributes?.brief || '');
      setCategory(existing.category || '');
      setDescription(existing.description || '');
      setImages((existing.images || []).slice(0, 1));
      const { _associations, brief: _b, thumb_url, ...rest } = existing.attributes || {};
      setThumbUrl((thumb_url as string) || null);
      setAttrs(Object.entries(rest));
      setAssociations(parseAssociations(existing.attributes || {}));
    } else {
      setName('');
      setBrief('');
      setCategory('');
      setDescription('');
      setImages([]);
      setAttrs([]);
      setAssociations({ characters: [], locations: [], entries: [] });
      setCreatedId(null);
      setThumbUrl(null);
    }
  }, [existing, itemId]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const attrsRecord: Record<string, string> = {};
    for (const [k, v] of attrs) attrsRecord[k] = v;
    const attributes = {
      ...attrsRecord,
      _attrOrder: attrs.map(([k]) => k),
      brief: brief.trim(),
      thumb_url: thumbUrl,
      ...(buildAssociations(associations) !== '{"characters":[],"locations":[],"entries":[]}'
        ? { _associations: buildAssociations(associations) }
        : {}),
    };
    try {
      if (isNew && !createdId) {
        const item = await create({ world_id: worldId, name: name.trim(), category: category.trim(), description, images, attributes } as any);
        setCreatedId(item.id);
      } else {
        await update((createdId || itemId)!, { name: name.trim(), category: category.trim(), description, images, attributes } as any);
      }
      setSaved(true);
      setError('');
      setTimeout(() => { setSaved(false); onClose(); }, 800);
    } catch (e: any) {
      setError(e?.message || '保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (itemId) { await remove(itemId); onClose(); }
  };

  const addAttr = () => {
    if (attrKey.trim()) {
      const key = attrKey.trim();
      if (attrs.some(([k]) => k === key)) return;
      setAttrs([...attrs, [key, attrVal]]);
      setAttrKey('');
      setAttrVal('');
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAttrDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = attrs.findIndex(([k]) => k === active.id);
    const newIdx = attrs.findIndex(([k]) => k === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = [...attrs];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    setAttrs(reordered);
  };

  const openCrop = () => {
    if (images.length > 0) {
      setCropImageUrl(images[0].url);
      setCrop({ x: 0, y: 0 });
      setCropZoom(1);
      setCropPixels(null);
      setCropOpen(true);
    }
  };

  const handleCropComplete = useCallback((_croppedAreaPercentages: Area, croppedAreaPixels: Area) => {
    setCropPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!cropPixels) return;
    setCropping(true);
    try {
      const url = await cropAndUpload(cropImageUrl, cropPixels);
      setThumbUrl(url);
    } catch { /* skip */ }
    setCropping(false);
    setCropOpen(false);
  };

  const handleClearCrop = () => {
    setThumbUrl(null);
  };

  const allEntries = Object.values(catEntries).flat();

  const toggleAssoc = (type: keyof Associations, id: string) => {
    setAssociations((prev) => {
      const list = prev[type];
      return { ...prev, [type]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });
  };

  const assocSection = (label: string, type: keyof Associations, options: { id: string; name: string }[]) => {
    if (options.length === 0) return null;
    const selected = associations[type];
    return (
      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">{label}</label>
        <div className="flex flex-wrap gap-1 min-h-[28px]">
          {options.map((opt) => {
            const isSel = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${isSel ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-700 dark:text-primary-300' : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-primary-300'}`}
                onClick={() => toggleAssoc(type, opt.id)}
              >
                {opt.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">物品名称 *</label>
          <input type="text" className="input w-full text-sm" placeholder="如：星陨剑" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">物品种类</label>
          <input type="text" className="input w-full text-sm" placeholder="如：武器、防具、道具..." value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
        <textarea className="input w-full text-sm min-h-[60px] resize-none" placeholder="简短介绍，显示在卡片上..." value={brief} onChange={(e) => setBrief(e.target.value)} rows={2} />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">自定义属性</label>
        <div className="flex gap-1 mb-2">
          <input type="text" className="input flex-1 text-xs" placeholder="属性名" value={attrKey}
            onChange={(e) => setAttrKey(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttr(); } }} />
          <input type="text" className="input flex-1 text-xs" placeholder="值" value={attrVal}
            onChange={(e) => setAttrVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttr(); } }} />
          <button className="btn-ghost text-xs !px-2 flex items-center gap-0.5" onClick={addAttr}>
            <Plus size={14} /> 添加
          </button>
        </div>
        {attrs.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAttrDragEnd}>
            <SortableContext items={attrs.map(([k]) => k)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {attrs.map(([k, v]) => (
                  <SortableAttrRow key={k} attrKey={k} attrVal={v} onRemove={() => setAttrs(attrs.filter(([key]) => key !== k))} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">详细介绍</label>
        <textarea className="input w-full text-sm min-h-[150px] resize-y whitespace-pre-wrap" placeholder="详细介绍..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">配图</label>
        <ImageUploader images={images} onChange={(imgs) => { setImages(imgs); setThumbUrl(null); }} maxImages={1} />
        {images.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <button className="btn-ghost text-xs flex items-center gap-1 text-primary-500" onClick={openCrop}>
              <Crop size={12} /> {thumbUrl ? '重新框选' : '框选展示区'}
            </button>
            {thumbUrl && (
              <button className="btn-ghost text-xs text-[rgb(var(--color-text-secondary))]" onClick={handleClearCrop}>
                清除框选
              </button>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-[rgb(var(--color-border))] pt-4 space-y-3">
        <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">关联</span>
        {assocSection('人物', 'characters', characters.map((c) => ({ id: c.id, name: c.name })))}
        {assocSection('地点', 'locations', locations.map((l) => ({ id: l.id, name: l.name })))}
        {assocSection('种族/职业/组织/势力', 'entries', allEntries.map((e) => ({ id: e.id, name: e.name })))}
      </div>

      {/* Crop Modal */}
      {cropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setCropOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[90vw] h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgb(var(--color-border))]">
              <h3 className="font-semibold text-sm">框选展示区域</h3>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs" onClick={() => setCropOpen(false)}>取消</button>
                <button className="btn-primary text-xs flex items-center gap-1" onClick={handleCropConfirm} disabled={cropping}>
                  {cropping ? <Loader2 size={12} className="animate-spin" /> : null}
                  确认框选
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-gray-900">
              <Cropper
                image={cropImageUrl}
                crop={crop}
                zoom={cropZoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setCropZoom}
                onCropComplete={handleCropComplete}
                cropShape="rect"
                objectFit="contain"
              />
            </div>
            <div className="px-5 py-3 border-t border-[rgb(var(--color-border))] flex items-center gap-3">
              <span className="text-xs text-[rgb(var(--color-text-secondary))]">缩放</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between gap-2">
        {!isNew ? (
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={14} /> 删除
          </button>
        ) : <div />}
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> 保存中...</> : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
