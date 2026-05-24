import { useState, useEffect, useCallback } from 'react';
import { useLocations } from '@/stores/locations';
import ImageUploader from '@/components/ui/ImageUploader';
import type { ImageItem, Location } from '@/lib/database';
import { Trash2, Loader2, Crop } from 'lucide-react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { cropAndUpload } from '@/lib/imageCrop';

interface Props {
  worldId: string;
  locationId: string | null;
  onClose: () => void;
  defaultX?: number;
  defaultY?: number;
}

const emptyForm = { name: '', brief: '', description: '', region: '' };

export default function LocationEditPanel({ worldId, locationId, onClose, defaultX = 50, defaultY = 50 }: Props) {
  const { locations, create, update, remove } = useLocations();
  const isNew = !locationId;
  const existing = locationId ? locations.find((l) => l.id === locationId) : null;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [cardBgUrl, setCardBgUrl] = useState<string | null>(null);

  // crop modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({ name: existing.name, brief: existing.category || '', description: existing.description, region: existing.region });
      setImages((existing.images || []).slice(0, 1));
      setCardBgUrl(existing.card_bg_url || null);
    } else {
      setForm(emptyForm);
      setImages([]);
      setCreatedId(null);
      setCardBgUrl(null);
    }
  }, [existing, locationId]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const data = {
      name: form.name.trim(),
      category: form.brief,
      description: form.description,
      region: form.region,
      images,
      card_bg_url: cardBgUrl,
      map_x: defaultX,
      map_y: defaultY,
    };
    try {
      if (isNew && !createdId) {
        const loc = await create({ ...data, world_id: worldId } as any);
        setCreatedId(loc.id);
      } else {
        await update((createdId || locationId)!, data as Partial<Location>);
      }
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || '保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const id = createdId || locationId;
    if (id) { await remove(id); onClose(); }
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
      setCardBgUrl(url);
    } catch { /* skip */ }
    setCropping(false);
    setCropOpen(false);
  };

  const handleClearCrop = () => {
    setCardBgUrl(null);
  };

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <input type="text" className="input w-full text-sm" placeholder="地点名称 *" value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />

      <input type="text" className="input w-full text-sm" placeholder="所属区域" value={form.region}
        onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />

      <textarea className="input w-full text-sm min-h-[60px] resize-none" placeholder="简介（卡片标签显示）" value={form.brief}
        onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))} rows={2} />

      <textarea className="input w-full text-sm min-h-[140px] resize-none" placeholder="详细介绍（浏览卡片显示）"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">配图</label>
        <ImageUploader images={images} onChange={(imgs) => { setImages(imgs); setCardBgUrl(null); }} maxImages={1} />
        {images.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <button className="btn-ghost text-xs flex items-center gap-1 text-primary-500" onClick={openCrop}>
              <Crop size={12} /> {cardBgUrl ? '重新框选' : '框选展示区'}
            </button>
            {cardBgUrl && (
              <button className="btn-ghost text-xs text-[rgb(var(--color-text-secondary))]" onClick={handleClearCrop}>
                清除框选
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2">
        {!isNew ? (
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={14} /> 删除
          </button>
        ) : <div />}
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving || !form.name.trim()}>
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
                aspect={5 / 1}
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
