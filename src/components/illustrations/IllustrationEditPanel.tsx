import { useEffect, useState, useRef, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { useIllustrations } from '@/stores/illustrations';
import type { Illustration } from '@/lib/database';
import { uploadImageOriginal } from '@/lib/db';
import { urlToBlob } from '@/lib/imageCrop';
import { Trash2, Loader2, Upload, X, ZoomIn } from 'lucide-react';

async function cropImage(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

interface Props {
  worldId: string;
  illustrationId: string | null;
  onClose: () => void;
}

export default function IllustrationEditPanel({ worldId, illustrationId, onClose }: Props) {
  const { illustrations, fetch, create, update, remove } = useIllustrations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [blobImageUrl, setBlobImageUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');

  useEffect(() => {
    if (imageUrl) { urlToBlob(imageUrl).then(setBlobImageUrl); }
    else setBlobImageUrl('');
  }, [imageUrl]);
  const [uploading, setUploading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);

  const existing = illustrationId ? illustrations.find((i) => i.id === illustrationId) : null;
  const isNew = !illustrationId;

  useEffect(() => {
    fetch(worldId);
  }, [worldId, fetch]);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      const img = existing.images?.[0];
      setImageUrl(img?.url || '');
      setDisplayUrl(img?.displayUrl || '');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      setName('');
      setImageUrl('');
      setDisplayUrl('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCreatedId(null);
    }
  }, [existing, illustrationId]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCropPixels(croppedPixels);
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImageOriginal(file, 'illustrations');
      setImageUrl(url);
      setDisplayUrl('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch {
      setError('上传失败');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      let finalDisplayUrl = displayUrl;
      // Generate cropped display thumbnail if we have crop data
      if (imageUrl && cropPixels && (zoom !== 1 || cropPixels.x !== 0 || cropPixels.y !== 0)) {
        const blob = await cropImage(imageUrl, cropPixels);
        const file = new File([blob], `thumb-${Date.now()}.png`, { type: 'image/png' });
        finalDisplayUrl = await uploadImageOriginal(file, 'illustrations');
      }
      const images = imageUrl ? [{
        url: imageUrl,
        label: '',
        order: 0,
        displayUrl: finalDisplayUrl || undefined,
      }] : [];
      if (isNew && !createdId) {
        const ill = await create({ name: name.trim(), images, world_id: worldId } as any);
        setCreatedId(ill.id);
      } else {
        await update((createdId || illustrationId)!, { name: name.trim(), images } as Partial<Illustration>);
      }
      setDisplayUrl(finalDisplayUrl);
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || e?.error_description || String(e) || '保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const id = createdId || illustrationId;
    if (id) {
      await remove(id);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <input
        type="text"
        className="input w-full text-sm"
        placeholder="插图名称 *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus={!imageUrl}
      />

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">
          图片（无损上传 / 滚轮缩放 / 拖拽调整展示区域）
        </label>

        {imageUrl ? (
          <div className="space-y-2">
            <div className="relative w-full aspect-[4/3] rounded-card overflow-hidden border border-[rgb(var(--color-border))] bg-black">
              <Cropper
                image={blobImageUrl || imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <button
                className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-white hover:bg-red-500 z-10"
                onClick={() => { setImageUrl(''); setDisplayUrl(''); setCropPixels(null); }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn size={14} className="text-[rgb(var(--color-text-secondary))]" />
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] text-[rgb(var(--color-text-secondary))] w-8 text-right">{zoom.toFixed(1)}x</span>
            </div>
            <p className="text-[10px] text-[rgb(var(--color-text-secondary))]">
              展示图会按框选区域生成缩略图。点开查看和编辑时仍然使用无损原图。
            </p>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-card p-6 text-center transition-colors hover:border-primary-400 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-500'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-500'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-primary-500');
              const file = e.dataTransfer.files[0];
              if (file?.type.startsWith('image/')) handleUpload(file);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-primary-500" />
                <span className="text-xs text-[rgb(var(--color-text-secondary))]">上传中...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload size={24} className="text-[rgb(var(--color-text-secondary))]" />
                <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                  点击上传 / 拖拽图片 / Ctrl+V 粘贴
                </span>
              </div>
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
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> 保存中...</> : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
