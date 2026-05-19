import { useState, useEffect } from 'react';
import { useLocations } from '@/stores/locations';
import { useAutoSave } from '@/hooks/useAutoSave';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Trash2, Check, Loader2, AlertCircle } from 'lucide-react';
import type { Location } from '@/lib/database';

interface Props {
  worldId: string;
  locationId: string | null;
  onClose: () => void;
  defaultX?: number;
  defaultY?: number;
}

const emptyForm = { name: '', description: '', category: '', region: '' };
const categories = ['', '城市', '自然', '遗迹', '军事', '其他'];

export default function LocationEditPanel({ worldId, locationId, onClose, defaultX = 50, defaultY = 50 }: Props) {
  const { locations, create, update, remove } = useLocations();
  const isNew = !locationId;
  const existing = locationId ? locations.find((l) => l.id === locationId) : null;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<Location['images']>([]);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({ name: existing.name, description: existing.description, category: existing.category, region: existing.region });
      setImages(existing.images || []);
    } else {
      setForm(emptyForm);
      setImages([]);
      setCreatedId(null);
    }
  }, [existing, locationId]);

  const buildData = () => ({ ...form, images, map_x: defaultX, map_y: defaultY });

  const doSave = async (data: ReturnType<typeof buildData>) => {
    if (!data.name.trim()) return;
    if (isNew && !createdId) {
      const payload = { ...data, name: data.name.trim(), world_id: worldId };
      const loc = await create(payload);
      setCreatedId(loc.id);
    } else {
      await update((createdId || locationId)!, data as Partial<Location>);
    }
  };

  const { status } = useAutoSave(buildData(), doSave);

  const handleDelete = async () => {
    if (locationId) { await remove(locationId); onClose(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {status === 'saving' && <Loader2 size={14} className="animate-spin text-primary-500" />}
          {status === 'saved' && <Check size={14} className="text-green-500" />}
          {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
          <span className="text-[rgb(var(--color-text-secondary))]">
            {status === 'saving' ? '保存中...' : status === 'saved' ? '已自动保存' : status === 'error' ? '保存失败' : ''}
          </span>
        </div>
        {!isNew && (
          <button className="btn-ghost text-xs text-red-500 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={12} /> 删除地点
          </button>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">地点名称 *</label>
        <input type="text" className="input w-full text-sm" placeholder="如：星落城" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">分类</label>
          <select className="input w-full text-sm" value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {categories.map((c) => (
              <option key={c} value={c}>{c || '(未分类)'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">所属区域</label>
          <input type="text" className="input w-full text-sm" placeholder="如：北方大陆" value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
        <RichTextEditor content={form.description} onChange={(html) => setForm((f) => ({ ...f, description: html }))}
          minHeight="120px" placeholder="描述这个地点的特征..." />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">配图</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {isNew && (
        <p className="text-[10px] text-[rgb(var(--color-text-secondary))]">
          保存后可在拖拽地图上的标记调整位置
        </p>
      )}
    </div>
  );
}
