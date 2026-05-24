import { useState, useCallback, useRef } from 'react';
import { useSettings, themePresets } from '@/stores/settings';
import ImageUploader from '@/components/ui/ImageUploader';
import type { ImageItem } from '@/lib/database';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { cropAndUpload } from '@/lib/imageCrop';
import { uploadImageOriginal } from '@/lib/db';
import { Crop, Loader2, Upload, X, Check } from 'lucide-react';

const fonts = [
  { value: 'sans', label: 'Inter / Noto Sans SC（默认）' },
  { value: 'serif', label: '思源宋体 / Noto Serif SC' },
  { value: 'mono', label: '等宽 / JetBrains Mono' },
  { value: 'rounded', label: '圆体 / Varela Round' },
];

export default function SettingsView() {
  const { font, bgImage, customFont, themeColor, setFont, setBgImage, setCustomFont, clearCustomFont, setThemeColor } = useSettings();
  const [images, setImages] = useState<ImageItem[]>(bgImage ? [{ url: bgImage, label: '', order: 0 }] : []);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFont, setUploadingFont] = useState(false);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);

  const handleBgChange = (imgs: ImageItem[]) => {
    setImages(imgs);
    if (imgs.length > 0) {
      openCropWith(imgs[0].url);
    } else {
      setBgImage(null);
    }
  };

  const openCropWith = (url: string) => {
    setCropImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setCropZoom(1);
    setCropPixels(null);
    setCropOpen(true);
  };

  const handleCropComplete = useCallback((_: Area, cp: Area) => setCropPixels(cp), []);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['ttf', 'otf', 'woff', 'woff2'].includes(ext)) return;
    setUploadingFont(true);
    try {
      const url = await uploadImageOriginal(file, 'fonts');
      const name = file.name.replace(/\.[^.]+$/, '');
      setCustomFont(name, url);
    } catch { /* skip */ }
    setUploadingFont(false);
  };

  const handleCropConfirm = async () => {
    if (!cropPixels) return;
    setCropping(true);
    try {
      const url = await cropAndUpload(cropImageUrl, cropPixels);
      setBgImage(url);
    } catch { /* skip */ }
    setCropping(false);
    setCropOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-4">全局颜色</h3>
        <div className="grid grid-cols-4 gap-3">
          {themePresets.map((t) => (
            <button key={t.id} className="flex flex-col items-center gap-2" onClick={() => setThemeColor(t.id as any)}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all"
                style={{ backgroundColor: t.color, borderColor: themeColor === t.id ? 'rgb(var(--color-text))' : 'transparent' }}>
                {themeColor === t.id && <Check size={16} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />}
              </div>
              <span className="text-xs text-[rgb(var(--color-text-secondary))]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">字体</h3>
        <select className="input w-full text-sm mb-3" value={customFont ? 'custom' : font} onChange={(e) => {
          if (e.target.value === 'custom') return;
          clearCustomFont();
          setFont(e.target.value);
        }}>
          {fonts.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
          {customFont && <option value="custom">{customFont.name}（已导入）</option>}
        </select>
        <div className="flex items-center gap-2">
          <input ref={fontInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleFontUpload} />
          <button className="btn-ghost text-xs flex items-center gap-1" onClick={() => fontInputRef.current?.click()} disabled={uploadingFont}>
            {uploadingFont ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            导入字体文件
          </button>
          {customFont && (
            <button className="btn-ghost text-xs text-red-400 flex items-center gap-1" onClick={clearCustomFont}>
              <X size={12} /> 清除
            </button>
          )}
        </div>
        <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-2">支持 .ttf / .otf / .woff / .woff2 格式</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-4">网页背景图</h3>
        <ImageUploader images={images} onChange={handleBgChange} maxImages={1} />
        {images.length > 0 && (
          <button className="btn-ghost text-xs flex items-center gap-1 text-primary-500 mt-2" onClick={() => openCropWith(images[0].url)}>
            <Crop size={12} /> 框选展示区域
          </button>
        )}
        <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-2">上传一张图片作为网页全局背景。可框选裁剪。删除图片即可恢复纯色背景。</p>
      </div>

      {cropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setCropOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[90vw] h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgb(var(--color-border))]">
              <h3 className="font-semibold text-sm">框选背景区域</h3>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs" onClick={() => setCropOpen(false)}>取消</button>
                <button className="btn-primary text-xs flex items-center gap-1" onClick={handleCropConfirm} disabled={cropping}>
                  {cropping ? <Loader2 size={12} className="animate-spin" /> : null}
                  确认框选
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-gray-900">
              <Cropper image={cropImageUrl} crop={crop} zoom={cropZoom} aspect={16/9}
                onCropChange={setCrop} onZoomChange={setCropZoom} onCropComplete={handleCropComplete}
                cropShape="rect" objectFit="contain" />
            </div>
            <div className="px-5 py-3 border-t border-[rgb(var(--color-border))] flex items-center gap-3">
              <span className="text-xs text-[rgb(var(--color-text-secondary))]">缩放</span>
              <input type="range" min={1} max={3} step={0.01} value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))} className="flex-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
