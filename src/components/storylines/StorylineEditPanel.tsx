import { useState, useEffect } from 'react';
import { useStorylines } from '@/stores/storylines';
import { useBooks } from '@/stores/books';
import { normalizeChapters, type Volume, type Chapter } from '@/lib/database';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Props {
  worldId: string;
  storylineId: string | null;
  volumeId?: string;
  onClose: () => void;
  hideChapters?: boolean;
  showSlTitle?: boolean;
  onCreated?: (storylineId: string) => void;
}

function ChapterItem({ chapter, index, onUpdate, onDelete }: {
  chapter: Chapter; index: number; onUpdate: (ch: Chapter) => void;
  onDelete: () => void;
}) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg))] px-1.5 py-0.5 rounded flex-shrink-0">
          第 {index + 1} 章
        </span>
        <input type="text" className="input flex-1 text-sm h-8" placeholder="章节标题" value={chapter.title}
          onChange={(e) => onUpdate({ ...chapter, title: e.target.value })} />
        <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-400 flex-shrink-0" onClick={onDelete}>
          <Trash2 size={14} /></button>
      </div>
      <textarea className="input w-full text-sm h-36 resize-y" placeholder="章节内容..." value={chapter.content}
        onChange={(e) => onUpdate({ ...chapter, content: e.target.value })} />
    </div>
  );
}

export default function StorylineEditPanel({ worldId, storylineId, volumeId, onClose, hideChapters, showSlTitle, onCreated }: Props) {
  const { storylines, create, update, remove } = useStorylines();
  const isNew = !storylineId;

  const [volumeTitle, setVolumeTitle] = useState('');
  const [slTitle, setSlTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [createdVolumeId, setCreatedVolumeId] = useState<string | null>(null);

  useEffect(() => {
    if (storylineId && volumeId) {
      const sl = storylines.find(s => s.id === storylineId);
      if (sl) {
        setSlTitle(sl.title || '');
        setDescription(sl.description || '');
        const volumes = normalizeChapters(sl.chapters);
        const vol = volumes.find(v => v.id === volumeId);
        if (vol) {
          setVolumeTitle(vol.title);
          setChapters(vol.chapters);
        }
      }
    } else if (storylineId) {
      const sl = storylines.find(s => s.id === storylineId);
      if (sl) setSlTitle(sl.title || '');
      setVolumeTitle('');
      setDescription('');
      setChapters([]);
    } else {
      setSlTitle('');
      setVolumeTitle('');
      setDescription('');
      setChapters([]);
      setCreatedVolumeId(null);
    }
  }, [storylineId, volumeId, storylines]);

  const addChapter = () => {
    setChapters([...chapters, { id: crypto.randomUUID(), title: '', content: '', order: chapters.length }]);
  };
  const updateChapter = (chIdx: number, chapter: Chapter) => {
    setChapters(chapters.map((c, j) => (j === chIdx ? chapter : c)));
  };
  const removeChapter = (chIdx: number) => {
    setChapters(chapters.filter((_, j) => j !== chIdx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        // Create new storyline with one default volume
        const newVolume: Volume = {
          id: crypto.randomUUID(),
          title: volumeTitle.trim() || '正文',
          order: 0,
          chapters,
        };
        const newSl = await create({
          world_id: worldId,
          title: slTitle.trim() || volumeTitle.trim() || '新故事线',
          description,
          chapters: [newVolume],
        } as any);
        setCreatedVolumeId(newVolume.id);
        if (onCreated) onCreated(newSl.id);
      } else {
        // Update the specific volume within the storyline
        const sl = storylines.find(s => s.id === storylineId);
        if (!sl) { setSaving(false); return; }
        const volumes = normalizeChapters(sl.chapters);
        const vIdx = volumes.findIndex(v => v.id === (volumeId || createdVolumeId));
        if (vIdx >= 0) {
          volumes[vIdx] = { ...volumes[vIdx], title: volumeTitle, chapters };
        } else {
          // New volume being saved for the first time
          volumes.push({
            id: volumeId || createdVolumeId || crypto.randomUUID(),
            title: volumeTitle || '正文',
            order: volumes.length,
            chapters,
          });
        }
        await update(storylineId!, { title: slTitle || volumeTitle || sl.title, description, chapters: volumes } as any);
      }
      setSaved(true);
      setError('');
      setSaved(true); onClose();
    } catch (e: any) {
      setError(e?.message || '保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!storylineId) return;
    if (volumeId) {
      // Delete just this volume
      const sl = storylines.find(s => s.id === storylineId);
      if (!sl) return;
      const volumes = normalizeChapters(sl.chapters).filter(v => v.id !== volumeId);
      await update(storylineId, { chapters: volumes } as any);
    } else {
      await remove(storylineId);
      useBooks.getState().unassignStoryline(storylineId);
    }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      {showSlTitle && (
      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">故事线标题</label>
        <input
          type="text"
          className="input w-full text-sm"
          placeholder="如：正传"
          value={slTitle}
          onChange={(e) => setSlTitle(e.target.value)}
        />
      </div>
      )}

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">卷标题</label>
        <input
          type="text"
          className="input w-full text-sm"
          placeholder="如：起源篇"
          value={volumeTitle}
          onChange={(e) => setVolumeTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
        <RichTextEditor
          content={description}
          onChange={setDescription}
          minHeight="60px"
          placeholder="故事线简介..."
          showToolbar={false}
        />
      </div>

      {!isNew && !hideChapters && (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">章节 ({chapters.length})</span>
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={addChapter}>
            <Plus size={12} /> 添加章节
          </button>
        </div>

        <div className="space-y-2">
          {chapters.map((ch, chIdx) => (
            <ChapterItem key={ch.id} chapter={ch} index={chIdx}
              onUpdate={(c) => updateChapter(chIdx, c)}
              onDelete={() => removeChapter(chIdx)} />
          ))}
        </div>

        {chapters.length === 0 && (
          <p className="text-xs text-[rgb(var(--color-text-secondary))] text-center py-6">还没有章节，点击上方按钮添加</p>
        )}
      </div>
      )}

      <div className="flex justify-between gap-2">
        <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={handleDelete}>
          <Trash2 size={14} /> {isNew ? '取消' : '删除此卷'}
        </button>
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
