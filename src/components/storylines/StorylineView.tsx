import { useEffect, useState } from 'react';
import type { Storyline, Chapter } from '@/lib/database';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function ChapterItem({ chapter, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  chapter: Chapter; index: number; onUpdate: (ch: Chapter) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="card flex gap-3 group">
      <button {...attributes} {...listeners} className="mt-1 cursor-grab text-[rgb(var(--color-text-secondary))]">
        <GripVertical size={16} />
      </button>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg))] px-1.5 py-0.5 rounded">
            第 {index + 1} 章
          </span>
          <input type="text" className="input flex-1 text-sm" placeholder="章节标题" value={chapter.title}
            onChange={(e) => onUpdate({ ...chapter, title: e.target.value })} />
          <div className="flex gap-0.5">
            <button disabled={isFirst} className="p-1 hover:bg-[rgb(var(--color-border))] rounded disabled:opacity-30" onClick={onMoveUp}>
              <ChevronUp size={14} /></button>
            <button disabled={isLast} className="p-1 hover:bg-[rgb(var(--color-border))] rounded disabled:opacity-30" onClick={onMoveDown}>
              <ChevronDown size={14} /></button>
            <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-400" onClick={onDelete}>
              <Trash2 size={14} /></button>
          </div>
        </div>
        <textarea className="input w-full text-xs h-16 resize-none" placeholder="章节内容摘要..." value={chapter.content}
          onChange={(e) => onUpdate({ ...chapter, content: e.target.value })} />
      </div>
    </div>
  );
}

interface Props {
  storyline?: Storyline;
  onSaveChapters: (chapters: Chapter[]) => Promise<void>;
}

export default function StorylineView({ storyline, onSaveChapters }: Props) {
  if (!storyline) return null;
  const [chapters, setChapters] = useState<Chapter[]>(storyline.chapters || []);
  const [title, setTitle] = useState(storyline.title);
  const [description, setDescription] = useState(storyline.description);

  useEffect(() => { setChapters(storyline.chapters || []); setTitle(storyline.title); setDescription(storyline.description); }, [storyline]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = chapters.findIndex((c) => c.id === active.id);
    const newIdx = chapters.findIndex((c) => c.id === over.id);
    const reordered = [...chapters];
    reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, chapters[oldIdx]);
    setChapters(reordered);
  };

  const addChapter = () => {
    setChapters([...chapters, { id: crypto.randomUUID(), title: '', content: '', order: chapters.length }]);
  };

  const updateChapter = (index: number, ch: Chapter) => {
    setChapters(chapters.map((c, i) => (i === index ? ch : c)));
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const moveChapter = (index: number, direction: -1 | 1) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    const reordered = [...chapters];
    [reordered[index], reordered[newIdx]] = [reordered[newIdx], reordered[index]];
    setChapters(reordered);
  };

  const handleSave = () => onSaveChapters(chapters);

  return (
    <div className="space-y-4">
      <input type="text" className="input w-full text-lg font-semibold" placeholder="故事线标题" value={title}
        onChange={(e) => setTitle(e.target.value)} />

      <RichTextEditor content={description} onChange={setDescription} minHeight="100px" placeholder="故事线简介..." />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">章节 ({chapters.length})</h3>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={addChapter}>
            <Plus size={12} /> 添加章节
          </button>
          <button className="btn-primary text-xs !px-2 !py-1 flex items-center gap-1" onClick={handleSave}>
            <Save size={12} /> 保存章节
          </button>
        </div>
      </div>

      {chapters.length === 0 ? (
        <p className="text-xs text-[rgb(var(--color-text-secondary))] text-center py-8">还没有章节，点击上方按钮添加</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {chapters.map((ch, i) => (
                <ChapterItem key={ch.id} chapter={ch} index={i} onUpdate={(c) => updateChapter(i, c)}
                  onDelete={() => removeChapter(i)} onMoveUp={() => moveChapter(i, -1)} onMoveDown={() => moveChapter(i, 1)}
                  isFirst={i === 0} isLast={i === chapters.length - 1} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
