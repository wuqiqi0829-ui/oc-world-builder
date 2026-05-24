import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import type { Character } from '@/lib/database';
import { useCharacters } from '@/stores/characters';
import { uploadImageOriginal } from '@/lib/db';
import Card from '@/components/ui/Card';
import { X, Camera, Check, Loader2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

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
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

interface Props {
  character: Character;
  selected?: boolean;
  onClick: () => void;
}

export default function CharacterCard({ character, selected, onClick }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const { update } = useCharacters();
  const allImages = character.images || [];
  const bgUrl = character.card_bg_url || character.avatar_url || allImages.find((i) => i.isCover)?.url || allImages[0]?.url;
  const infoTags = [character.gender, character.age].filter(Boolean);

  const onCropComplete = useCallback((_: Area, cp: Area) => setCropPixels(cp), []);

  const confirmCrop = async () => {
    if (!cropImageSrc || !cropPixels) return;
    setSaving(true);
    try {
      const blob = await cropImage(cropImageSrc, cropPixels);
      const file = new File([blob], `card-bg-${Date.now()}.png`, { type: 'image/png' });
      const url = await uploadImageOriginal(file, 'card-bgs');
      update(character.id, { card_bg_url: url } as any);
      setPickerOpen(false);
      setCropImageSrc(null);
    } catch { /* */ }
    setSaving(false);
  };

  return (
    <>
      <Card hover padding="sm" onClick={onClick} className={clsx('relative overflow-hidden group/card h-full flex flex-col min-h-[150px] !bg-white', selected && 'ring-2 ring-primary-500')}>
        {bgUrl && (
          <>
            <div className="absolute inset-0">
              <img src={bgUrl} alt="" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
          </>
        )}
        <div className="relative flex-1 flex flex-col justify-center z-10">
          <div className="text-center">
            <h3 className="font-semibold text-base truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{character.name}</h3>
            {character.nickname && <p className="text-sm text-white/80 truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">「{character.nickname}」</p>}
            <div className="flex flex-col gap-1.5 mt-1">
              {infoTags.length > 0 && (
                <div className="flex gap-1.5 justify-center">
                  {infoTags.map((t) => (
                    <span key={t} className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">{t}</span>
                  ))}
                </div>
              )}
              {character.catchphrase && (
                <p className="text-[10px] text-white/80 truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">「{character.catchphrase}」</p>
              )}
            </div>
          </div>
          <button
            className="absolute top-0 right-0 p-1 rounded opacity-0 group-hover/card:opacity-100 hover:bg-black/10 transition-opacity"
            onClick={(e) => { e.stopPropagation(); if (allImages.length > 0) setPickerOpen(true); }}
            title={allImages.length > 0 ? '选择卡片背景' : undefined}
          >
            <Camera size={12} className="text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>
      </Card>

      {pickerOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => { setPickerOpen(false); setCropImageSrc(null); }}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-[rgb(var(--color-surface))] rounded-card shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {cropImageSrc ? (
              <>
                <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
                  <button className="p-1 hover:bg-[rgb(var(--color-border))] rounded flex items-center gap-1 text-sm" onClick={() => setCropImageSrc(null)}>
                    <ArrowLeft size={14} /> 返回
                  </button>
                  <button className="btn-primary text-xs flex items-center gap-1" onClick={confirmCrop} disabled={saving}>
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    确认
                  </button>
                </div>
                <div className="relative w-full aspect-video bg-black">
                  <Cropper image={cropImageSrc} crop={crop} zoom={zoom} aspect={16 / 9} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                </div>
                <div className="p-3">
                  <input type="range" min={1} max={5} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border))]">
                  <h3 className="font-semibold text-sm">选择卡片背景</h3>
                  <button onClick={() => setPickerOpen(false)} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))]"><X size={16} /></button>
                </div>
                <div className="overflow-y-auto p-4 grid grid-cols-3 gap-3">
                  {allImages.map((img, i) => (
                    <div
                      key={i}
                      className={clsx('cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                        bgUrl === (img.url) ? 'border-primary-400 shadow-[0_0_8px_rgb(var(--primary-600)/0.3)]' : 'border-transparent hover:border-[rgb(var(--color-border))]')}
                      onClick={() => { setCropImageSrc(img.url); setCrop({ x: 0, y: 0 }); setZoom(1); }}
                    >
                      <div className="aspect-video bg-[rgb(var(--color-bg))]">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
