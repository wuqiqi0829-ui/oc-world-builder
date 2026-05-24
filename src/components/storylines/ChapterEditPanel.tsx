import { useState, useEffect } from 'react';
import { useStorylines } from '@/stores/storylines';
import { normalizeChapters } from '@/lib/database';
import { Trash2, Loader2 } from 'lucide-react';

interface Props {
  storylineId: string;
  volumeId: string;
  chapterId: string | null;
  onClose: () => void;
}

export default function ChapterEditPanel({ storylineId, volumeId, chapterId, onClose }: Props) {
  const { storylines, update } = useStorylines();
  const isNew = !chapterId;

  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (storylineId && volumeId && chapterId) {
      const sl = storylines.find(s => s.id === storylineId);
      if (sl) {
        const volumes = normalizeChapters(sl.chapters);
        const vol = volumes.find(v => v.id === volumeId);
        if (vol) {
          const ch = vol.chapters.find(c => c.id === chapterId);
          if (ch) {
            setTitle(ch.title);
            setBrief(ch.brief || '');
            setContent(ch.content);
          }
        }
      }
    } else {
      setTitle('');
      setBrief('');
      setContent('');
    }
  }, [storylineId, volumeId, chapterId, storylines]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const sl = storylines.find(s => s.id === storylineId);
      if (!sl) { setSaving(false); return; }
      const volumes = normalizeChapters(sl.chapters);
      const vol = volumes.find(v => v.id === volumeId);
      if (!vol) { setSaving(false); return; }

      if (isNew) {
        vol.chapters.push({
          id: crypto.randomUUID(),
          title: title.trim(),
          brief: brief.trim() || undefined,
          content,
          order: vol.chapters.length,
          created_at: new Date().toISOString(),
        });
      } else {
        const chIdx = vol.chapters.findIndex(c => c.id === chapterId);
        if (chIdx >= 0) {
          vol.chapters[chIdx] = {
            ...vol.chapters[chIdx],
            title: title.trim(),
            brief: brief.trim() || undefined,
            content,
          };
        }
      }
      await update(storylineId, { chapters: volumes } as any);
      setSaved(true);
      setError('');
      setSaved(true); onClose();
    } catch (e: any) {
      setError(e?.message || '保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!chapterId) return;
    const sl = storylines.find(s => s.id === storylineId);
    if (!sl) return;
    const volumes = normalizeChapters(sl.chapters);
    const vol = volumes.find(v => v.id === volumeId);
    if (vol) {
      vol.chapters = vol.chapters.filter(c => c.id !== chapterId);
      await update(storylineId, { chapters: volumes } as any);
    }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">章节标题</label>
        <input
          type="text"
          className="input w-full text-sm"
          placeholder="如：冒险的开始"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
        <textarea
          className="input w-full text-sm min-h-[60px] resize-none"
          placeholder="章节简介..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">章节内容</label>
        <textarea
          className="input w-full text-sm h-[70vh] resize-y"
          placeholder="章节内容..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="flex justify-between gap-2">
        {!isNew ? (
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={14} /> 删除章节
          </button>
        ) : <div />}
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> 保存中...</> : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
