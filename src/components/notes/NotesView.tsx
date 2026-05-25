import { useEffect, useState, useCallback, useRef } from 'react';
import { notesApi } from '@/lib/db';
import { useReadOnly } from '@/contexts/ReadOnlyContext';
import type { Note } from '@/lib/database';
import EmptyState from '@/components/ui/EmptyState';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Lightbulb, Plus, Trash2 } from 'lucide-react';

interface Props {
  worldId?: string;
}

export default function NotesView({ worldId }: Props) {
  const readOnly = useReadOnly();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleVal, setEditingTitleVal] = useState('');
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef({ activeId, title, content, dirty });
  dirtyRef.current = { activeId, title, content, dirty };

  // auto-save on unmount
  useEffect(() => {
    return () => {
      const d = dirtyRef.current;
      if (d.dirty && d.activeId) {
        notesApi.update(d.activeId, { title: d.title, content: d.content } as any).catch(() => {});
      }
    };
  }, []);

  const fetchNotes = useCallback(async () => {
    const data = await notesApi.list(worldId);
    setNotes(data);
    if (data.length > 0 && !activeId) {
      setActiveId(data[0].id);
      setTitle(data[0].title || '');
      setContent(data[0].content || '');
    } else if (data.length === 0) {
      setActiveId(null);
      setTitle('');
      setContent('');
    }
  }, [worldId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const saveCurrent = useCallback(async (id: string, t: string, c: string) => {
    await notesApi.update(id, { title: t, content: c } as any);
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, title: t, content: c } : n));
  }, []);

  const switchNote = async (note: Note) => {
    if (dirty && activeId) {
      await saveCurrent(activeId, title, content);
      setDirty(false);
    }
    setActiveId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
  };

  const createNote = async () => {
    if (dirty && activeId) {
      await saveCurrent(activeId, title, content);
      setDirty(false);
    }
    const note = await notesApi.create({ world_id: worldId, title: '', content: '' } as any);
    setNotes([note, ...notes]);
    setActiveId(note.id);
    setTitle('');
    setContent('');
  };

  const deleteNote = async (id: string) => {
    await notesApi.delete(id);
    setNotes(notes.filter((n) => n.id !== id));
    if (activeId === id) {
      const next = notes.find((n) => n.id !== id) || null;
      setActiveId(next?.id || null);
      setTitle(next?.title || '');
      setContent(next?.content || '');
    }
  };

  const handleSave = async () => {
    if (!activeId) return;
    await saveCurrent(activeId, title, content);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleTitleRename = async (id: string, newTitle: string) => {
    await notesApi.update(id, { title: newTitle } as any);
    setNotes(notes.map((n) => n.id === id ? { ...n, title: newTitle } : n));
    if (activeId === id) setTitle(newTitle);
    setEditingTitleId(null);
  };

  const activeNote = notes.find((n) => n.id === activeId) || null;

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full bg-primary-50/40 dark:bg-primary-950/20 rounded-xl p-4">
      <div className="md:w-56 flex-shrink-0 overflow-y-auto">
        <div className="backdrop-blur-md bg-white/60 dark:bg-white/5 rounded-xl p-3 border border-primary-100/60 dark:border-primary-800/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1" />
            <h3 className="text-sm font-medium text-primary-700 dark:text-primary-300">速记 ({notes.length})</h3>
            <div className="flex-1 flex justify-end">
              {!readOnly && <button className="btn-ghost text-xs !px-2 !py-1 text-primary-500" onClick={createNote}><Plus size={14} /></button>}
            </div>
          </div>
          {notes.map((n) => (
            <div key={n.id} className="mb-1">
              {editingTitleId === n.id ? (
                <input
                  type="text"
                  className="input w-full text-xs px-2 py-1 rounded-btn"
                  value={editingTitleVal}
                  onChange={(e) => setEditingTitleVal(e.target.value)}
                  onBlur={() => handleTitleRename(n.id, editingTitleVal)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleRename(n.id, editingTitleVal);
                    if (e.key === 'Escape') setEditingTitleId(null);
                  }}
                  autoFocus
                />
              ) : (
                <button
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs truncate transition-all
                    ${activeId === n.id ? 'bg-primary-200/60 dark:bg-primary-700/30 text-primary-800 dark:text-primary-200 font-medium' : 'hover:bg-primary-100/50 dark:hover:bg-primary-800/20 text-[rgb(var(--color-text))]'}`}
                  onClick={() => switchNote(n)}
                  onDoubleClick={() => { setEditingTitleId(n.id); setEditingTitleVal(n.title || ''); }}
                >
                  {n.title || n.content?.replace(/<[^>]*>/g, '').slice(0, 40) || '(空笔记)'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        {activeNote ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                className="input text-sm flex-1 bg-white/70 dark:bg-white/5 backdrop-blur-sm border-primary-100 dark:border-primary-800/30"
                placeholder="笔记标题（可选）"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
              />
              <div className="flex items-center gap-2 ml-3">
                {saved && <span className="text-xs text-green-500">已保存</span>}
                {!readOnly && <button className="btn-primary text-xs" onClick={handleSave}>保存</button>}
                {!readOnly && <button className="btn-ghost text-xs text-red-400" onClick={() => deleteNote(activeNote.id)}>
                  <Trash2 size={14} />
                </button>}
              </div>
            </div>
            <RichTextEditor key={activeId} content={content} onChange={(html) => {
              setContent(html);
              setDirty(true);
            }} minHeight="350px" placeholder="记录碎片想法..." showToolbar={false} />
          </div>
        ) : (
          <EmptyState icon={<Lightbulb size={48} />} title="灵感速记"
            description="快速记录碎片想法，点击保存。后续可关联到具体模块" />
        )}
      </div>
    </div>
  );
}
