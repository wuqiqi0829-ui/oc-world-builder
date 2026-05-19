import { useEffect, useState, useCallback } from 'react';
import { notesApi } from '@/lib/db';
import type { Note } from '@/lib/database';
import EmptyState from '@/components/ui/EmptyState';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Lightbulb, Plus, Trash2 } from 'lucide-react';

interface Props {
  worldId?: string;
}

export default function NotesView({ worldId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const fetchNotes = useCallback(async () => {
    const data = await notesApi.list(worldId);
    setNotes(data);
    if (data.length > 0 && !activeNote) setActiveNote(data[0]);
  }, [worldId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const createNote = async () => {
    const note = await notesApi.create({ world_id: worldId, content: '' });
    setNotes([note, ...notes]);
    setActiveNote(note);
  };

  const deleteNote = async (id: string) => {
    await notesApi.delete(id);
    setNotes(notes.filter((n) => n.id !== id));
    if (activeNote?.id === id) setActiveNote(notes.find((n) => n.id !== id) || null);
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="w-56 flex-shrink-0 border-r border-[rgb(var(--color-border))] pr-2 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">速记 ({notes.length})</h3>
          <button className="btn-ghost text-xs !px-2 !py-1" onClick={createNote}><Plus size={12} /></button>
        </div>
        {notes.map((n) => (
          <button key={n.id}
            className={`w-full text-left px-2.5 py-2 rounded-btn text-xs mb-0.5 truncate transition-colors
              ${activeNote?.id === n.id ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:bg-[rgb(var(--color-border))]'}`}
            onClick={() => { setActiveNote(n); }}>
            {n.content ? n.content.replace(/<[^>]*>/g, '').slice(0, 50) || '(空)' : '(空笔记)'}
          </button>
        ))}
      </div>
      <div className="flex-1">
        {activeNote ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">
                {new Date(activeNote.created_at).toLocaleString('zh-CN')}
              </span>
              <button className="btn-ghost text-xs text-red-500" onClick={() => deleteNote(activeNote.id)}>
                <Trash2 size={14} />
              </button>
            </div>
            <RichTextEditor content={activeNote.content} onChange={(html) => {
              setActiveNote({ ...activeNote, content: html });
              notesApi.update(activeNote.id, { content: html });
            }} minHeight="300px" placeholder="记录碎片想法..." />
          </div>
        ) : (
          <EmptyState icon={<Lightbulb size={48} />} title="灵感速记"
            description="快速记录碎片想法，自动保存。后续可关联到具体模块" />
        )}
      </div>
    </div>
  );
}
