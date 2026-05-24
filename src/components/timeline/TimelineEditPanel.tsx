import { useState, useEffect } from 'react';
import { useTimeline } from '@/stores/timeline';
import ImageUploader from '@/components/ui/ImageUploader';

import { Trash2, Loader2 } from 'lucide-react';
import type { TimelineEvent } from '@/lib/database';

interface Props {
  worldId: string;
  eventId: string | null;
  onClose: () => void;
  timelineId?: string;
  initialTimeLabel?: string;
  parentTimelineId?: string;
}

const emptyForm = { title: '', time_label: '', brief: '', description: '' };

function splitDesc(raw: string): { brief: string; detail: string } {
  const idx = raw.indexOf('<!--brief-->');
  if (idx >= 0) return { brief: raw.slice(0, idx), detail: raw.slice(idx + 12) };
  return { brief: '', detail: raw };
}

export default function TimelineEditPanel({ worldId, eventId, onClose, timelineId, initialTimeLabel, parentTimelineId }: Props) {
  const { events, create, update, remove, createTimeline } = useTimeline();
  const isNew = !eventId;
  const existing = eventId ? events.find((e) => e.id === eventId) : null;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<TimelineEvent['images']>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [subTimelineId, setSubTimelineId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      const { brief, detail } = splitDesc(existing.description || '');
      setForm({ title: existing.title, time_label: existing.time_label, brief, description: detail });
      setImages((existing.images || []).slice(0, 1));
    } else {
      setForm({ ...emptyForm, time_label: initialTimeLabel || '' });
      setImages([]);
      setCreatedId(null);
    }
  }, [existing, eventId]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const combinedDesc = form.brief ? form.brief + '<!--brief-->' + form.description : form.description;
    const tlId = subTimelineId || timelineId || '';
    const data = { title: form.title.trim(), time_label: form.time_label, description: combinedDesc, images, timeline_id: tlId };
    try {
      if (isNew && !createdId) {
        // Create sub-timeline on first save if parentTimelineId is provided
        let finalTlId = tlId;
        if (!finalTlId && parentTimelineId) {
          const tl = await createTimeline({ world_id: worldId, name: form.time_label || form.title, parent_id: parentTimelineId });
          finalTlId = tl.id;
          setSubTimelineId(tl.id);
        }
        const ev = await create({ ...data, world_id: worldId, timeline_id: finalTlId } as any);
        setCreatedId(ev.id);
      } else {
        await update((createdId || eventId)!, data as Partial<TimelineEvent>);
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
    if (eventId) { await remove(eventId); onClose(); }
  };

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
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
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
        <textarea
          className="input w-full text-sm min-h-[60px] resize-none"
          placeholder="简短介绍，显示在时间轴卡片上..."
          value={form.brief}
          onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))}
          rows={2}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">详细描述</label>
        <textarea className="input w-full text-sm min-h-[150px] resize-y whitespace-pre-wrap"
          placeholder="描述这个事件的经过..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">配图</label>
        <ImageUploader images={images} onChange={setImages} maxImages={1} />
      </div>

      <div className="flex justify-between gap-2">
        {!isNew ? (
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={14} /> 删除
          </button>
        ) : <div />}
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving || !form.title.trim()}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> 保存中...</> : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
