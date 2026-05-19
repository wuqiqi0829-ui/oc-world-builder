import { useState, useEffect } from 'react';
import { useTimeline } from '@/stores/timeline';
import { useAutoSave } from '@/hooks/useAutoSave';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Trash2, Check, Loader2, AlertCircle } from 'lucide-react';
import type { TimelineEvent } from '@/lib/database';

interface Props {
  worldId: string;
  eventId: string | null;
  onClose: () => void;
}

const emptyForm = { title: '', time_label: '', description: '' };

export default function TimelineEditPanel({ worldId, eventId, onClose }: Props) {
  const { events, create, update, remove } = useTimeline();
  const isNew = !eventId;
  const existing = eventId ? events.find((e) => e.id === eventId) : null;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<TimelineEvent['images']>([]);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({ title: existing.title, time_label: existing.time_label, description: existing.description });
      setImages(existing.images || []);
    } else {
      setForm(emptyForm);
      setImages([]);
      setCreatedId(null);
    }
  }, [existing, eventId]);

  const buildData = () => ({ ...form, images });

  const doSave = async (data: ReturnType<typeof buildData>) => {
    const payload = { ...data, title: data.title.trim(), world_id: worldId };
    if (!payload.title) return;
    if (isNew && !createdId) {
      const ev = await create(payload);
      setCreatedId(ev.id);
    } else {
      await update((createdId || eventId)!, data as Partial<TimelineEvent>);
    }
  };

  const { status } = useAutoSave(buildData(), doSave);

  const handleDelete = async () => {
    if (eventId) { await remove(eventId); onClose(); }
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
        <div className="flex gap-2">
          {!isNew && (
            <button className="btn-ghost text-xs text-red-500 flex items-center gap-1" onClick={handleDelete}>
              <Trash2 size={12} /> 删除
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">事件标题 *</label>
        <input
          type="text"
          className="input w-full text-sm"
          placeholder="如：大灾变纪元"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">时间标签</label>
        <input
          type="text"
          className="input w-full text-sm font-mono"
          placeholder="如：纪元前300年 / 星历2048 / 第一章"
          value={form.time_label}
          onChange={(e) => setForm((f) => ({ ...f, time_label: e.target.value }))}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">详细描述</label>
        <RichTextEditor
          content={form.description}
          onChange={(html) => setForm((f) => ({ ...f, description: html }))}
          minHeight="150px"
          placeholder="描述这个事件的经过..."
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">配图</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>
    </div>
  );
}
