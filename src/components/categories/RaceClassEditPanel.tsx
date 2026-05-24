import { useState, useEffect, useCallback } from 'react';
import { useCategories } from '@/stores/categories';

import ImageUploader from '@/components/ui/ImageUploader';
import type { ImageItem } from '@/lib/database';
import { Trash2, Loader2, Crop } from 'lucide-react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { cropAndUpload } from '@/lib/imageCrop';

interface Props {
  entryId: string | null;
  categoryId: string;
  onClose: () => void;
}

export default function RaceClassEditPanel({ entryId, categoryId, onClose }: Props) {
  const { entries, createEntry, updateEntry, removeEntry } = useCategories();
  const isNew = !entryId;
  const existing = entryId ? Object.values(entries).flat().find(e => e.id === entryId) : null;

  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
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
      const fv = (existing.field_values as Record<string, unknown> | undefined) || {};
      setName(existing.name);
      setBrief(fv.brief as string || '');
      setDescription(existing.description || '');
      setImages((existing.images || []).slice(0, 1));
      setThumbUrl(fv.thumb_url as string | null);
    } else {
      setName('');
      setBrief('');
      setDescription('');
      setImages([]);
      setCreatedId(null);
      setThumbUrl(null);
    }
  }, [existing, entryId]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const field_values = { ...(existing?.field_values || {}), brief: brief.trim(), thumb_url: thumbUrl };
    try {
      if (isNew && !createdId) {
        const entry = await createEntry({ category_id: categoryId, name: name.trim(), description, images, field_values } as any);
        setCreatedId(entry.id);
      } else {
        await updateEntry((createdId || entryId)!, { name: name.trim(), description, images, field_values } as any);
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
    if (entryId) { await removeEntry(entryId); onClose(); }
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

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
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

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">名称 *</label>
        <input type="text" className="input w-full text-sm" placeholder="如：精灵" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
        <textarea className="input w-full text-sm min-h-[60px] resize-none" placeholder="简短介绍..." value={brief} onChange={(e) => setBrief(e.target.value)} rows={2} />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">详细介绍</label>
        <textarea className="input w-full text-sm min-h-[150px] resize-y whitespace-pre-wrap" placeholder="详细介绍..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

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
                aspect={2 / 3}
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
    </div>
  );
}
