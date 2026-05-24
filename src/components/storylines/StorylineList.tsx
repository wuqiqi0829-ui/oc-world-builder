import { useEffect, useMemo, useRef, useState } from 'react';
import { useStorylines } from '@/stores/storylines';
import { useBooks } from '@/stores/books';
import { normalizeChapters } from '@/lib/database';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

interface Props {
  worldId: string;
  onPreviewChapter: (storylineId: string, volumeId: string, chapterId: string) => void;
  onAddChapter: (storylineId: string, volumeId: string) => void;
  onCreate: () => void;
  onCreateBook: () => void;
}

function InlineEdit({ value, onSave, className }: { value: string; onSave: (v: string) => void; className: string }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(value);
  const handleSubmit = () => { if (editVal.trim()) onSave(editVal.trim()); else setEditVal(value); setEditing(false); };
  if (editing) return <input type="text" className={`px-1 py-0.5 rounded border border-primary-300 bg-white dark:bg-gray-800 outline-none ${className}`} value={editVal} onChange={(e) => setEditVal(e.target.value)} onBlur={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setEditVal(value); setEditing(false); } }} autoFocus />;
  return <div className={`cursor-pointer hover:text-primary-500 transition-colors px-1 py-0.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 ${className}`} onDoubleClick={() => { setEditVal(value); setEditing(true); }} title="双击编辑">{value || '(空)'}</div>;
}

function VolumeTitle({ title, onRename }: { title: string; onRename: (name: string) => void }) {
  return <InlineEdit value={title || '未命名'} onSave={onRename} className="text-sm font-semibold text-[rgb(var(--color-text))] w-full text-center" />;
}

export default function StorylineList({ worldId, onPreviewChapter, onAddChapter, onCreate, onCreateBook }: Props) {
  const { storylines, fetch, update } = useStorylines();
  const { books, activeBookId, bookSlMap, fetchBooks, setActiveBook } = useBooks();
  const [selectedSlId, setSelectedSlId] = useState<string | null>(null);
  const [slDropdownOpen, setSlDropdownOpen] = useState(false);
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const prevSlCount = useRef(0);

  useEffect(() => { fetch(worldId); }, [worldId, fetch]);
  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Auto-assign unassigned storylines to first book on load
  useEffect(() => {
    if (books.length > 0 && storylines.length > 0) {
      const map = bookSlMap;
      const unassigned = storylines.filter(sl => !map[sl.id]);
      if (unassigned.length > 0) {
        unassigned.forEach(sl => useBooks.getState().assignStoryline(sl.id, books[0].id));
      }
    }
  }, [books, storylines]);

  // Filter storylines by active book
  const bookStorylines = useMemo(() => storylines.filter(sl => {
    if (!bookSlMap[sl.id]) return false;
    return bookSlMap[sl.id] === activeBookId;
  }), [storylines, bookSlMap, activeBookId]);

  // Auto-select latest storyline
  useEffect(() => {
    if (bookStorylines.length > 0) {
      if (!selectedSlId || !bookStorylines.find(s => s.id === selectedSlId) || bookStorylines.length > prevSlCount.current) {
        setSelectedSlId(bookStorylines[bookStorylines.length - 1].id);
      }
    } else {
      setSelectedSlId(null);
    }
    prevSlCount.current = bookStorylines.length;
  }, [bookStorylines]);

  const selectedSl = bookStorylines.find(s => s.id === selectedSlId);

  const handleRenameVol = (storylineId: string, volId: string, name: string) => {
    const sl = storylines.find(s => s.id === storylineId);
    if (!sl) return;
    const volumes = normalizeChapters(sl.chapters);
    const vol = volumes.find(v => v.id === volId);
    if (vol) vol.title = name;
    update(storylineId, { chapters: volumes });
  };

  const handleDeleteVolume = async (storylineId: string, volId: string) => {
    const sl = storylines.find(s => s.id === storylineId);
    if (!sl) return;
    const volumes = normalizeChapters(sl.chapters).filter(v => v.id !== volId);
    if (volumes.length === 0) {
      // Last volume deleted → delete the storyline too
      const { remove } = useStorylines.getState();
      await remove(storylineId);
      useBooks.getState().unassignStoryline(storylineId);
    } else {
      update(storylineId, { chapters: volumes });
    }
  };

  const handleRenameDesc = (storylineId: string, desc: string) => {
    update(storylineId, { description: desc } as any);
  };

  const allVolumes = (selectedSl ? [selectedSl] : []).flatMap(sl =>
    normalizeChapters(sl.chapters).map(vol => ({ vol, sl }))
  );

  const activeBook = books.find(b => b.id === activeBookId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            {/* Book selector */}
            {books.length > 0 && (
              <div className="relative">
                <button
                  className="text-xs h-8 px-3 rounded-xl border border-primary-200/50 dark:border-primary-700/20 bg-primary-100/30 dark:bg-primary-900/10 backdrop-blur-sm outline-none text-center"
                  onClick={() => setBookDropdownOpen(!bookDropdownOpen)}
                  onBlur={() => setTimeout(() => setBookDropdownOpen(false), 150)}
                >
                  {activeBook?.name || '主线'}
                </button>
                {bookDropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 border border-[rgb(var(--color-border))] rounded-lg shadow-lg z-20 py-1 whitespace-nowrap">
                    {books.map((b) => (
                      <button key={b.id} className={`block w-full text-left text-xs px-3 py-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${b.id === activeBookId ? 'text-primary-600 font-medium' : 'text-[rgb(var(--color-text))]'}`}
                        onMouseDown={() => { setActiveBook(b.id); setBookDropdownOpen(false); }}>
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Storyline selector */}
            {bookStorylines.length > 1 && (
              <div className="relative">
                <button
                  className="text-xs h-8 px-3 rounded-xl border border-primary-200 dark:border-primary-700/30 bg-white dark:bg-gray-800 outline-none text-center"
                  onClick={() => setSlDropdownOpen(!slDropdownOpen)}
                  onBlur={() => setTimeout(() => setSlDropdownOpen(false), 150)}
                >
                  第{bookStorylines.findIndex(s => s.id === selectedSlId) + 1}卷
                </button>
                {slDropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 border border-[rgb(var(--color-border))] rounded-lg shadow-lg z-20 py-1 whitespace-nowrap">
                    {bookStorylines.map((sl, i) => (
                      <button key={sl.id} className={`block w-full text-left text-xs px-3 py-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${sl.id === selectedSlId ? 'text-primary-600 font-medium' : 'text-[rgb(var(--color-text))]'}`}
                        onMouseDown={() => { setSelectedSlId(sl.id); setSlDropdownOpen(false); }}>
                        第{i + 1}卷 {sl.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <InlineEdit value={activeBook?.name || '主线剧情'} onSave={(v) => { if (activeBookId) useBooks.getState().renameBook(activeBookId, v); }} className="text-base font-semibold" />
          </div>
          <div className="flex items-center gap-2 group/header">
            <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
              <Plus size={12} /> 新建卷
            </button>
            <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreateBook}>
              <Plus size={12} /> 新建故事线
            </button>
            <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1 text-red-400" onClick={() => {
                if (confirm(`确定删除「${activeBook?.name}」及其所有卷？`)) {
                  const { removeBook } = useBooks.getState();
                  const { remove } = useStorylines.getState();
                  const slIds = Object.entries(bookSlMap).filter(([, bid]) => bid === activeBookId).map(([sid]) => sid);
                  Promise.all(slIds.map(sid => remove(sid))).then(() => {
                    removeBook(activeBookId!);
                  });
                }
              }}>
                <Trash2 size={14} /> 删除
              </button>
          </div>
        </div>
      </div>

      {bookStorylines.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <EmptyState icon={<BookOpen size={48} />} title="还没有故事线"
            description="创建一本新书来开始写作"
            action={<button className="btn-primary text-sm" onClick={onCreateBook}>新建故事线</button>} />
        </div>
      ) : allVolumes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <EmptyState icon={<BookOpen size={48} />} title="还没有卷"
            description="新建卷来添加第一卷"
            action={<button className="btn-primary text-sm" onClick={onCreate}>新建卷</button>} />
        </div>
      ) : (
        <div className="space-y-3">
              {allVolumes.map(({ vol, sl }) => {
                return (
                    <div className="bg-primary-100/20 dark:bg-primary-900/10 backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/20 rounded-card p-4 space-y-2 shadow-sm">
                <div className="flex items-center gap-1 relative">
                  <div className="absolute left-1/2 -translate-x-1/2">
                    <VolumeTitle title={vol.title || `第${vol.order + 1}卷`} onRename={(name) => handleRenameVol(sl.id, vol.id, name)} />
                  </div>
                  <div className="flex-1" />
                  <span className="text-[10px] text-[rgb(var(--color-text-secondary))] flex-shrink-0">{vol.chapters.length} 章</span>
                  <button className="btn-ghost text-[10px] !px-1.5 !py-0.5 flex items-center gap-0.5 flex-shrink-0" onClick={() => onAddChapter(sl.id, vol.id)} title="添加章节"><Plus size={10} /></button>
                  <button className="p-0.5 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0" onClick={() => { if (confirm('确定删除此卷及其所有章节？')) handleDeleteVolume(sl.id, vol.id); }} title="删除卷"><Trash2 size={12} /></button>
                </div>
                <div className="text-center">
                  <InlineEdit value={sl.description?.replace(/<[^>]*>/g, '') || ''} onSave={(v) => handleRenameDesc(sl.id, v)} className="text-[11px] text-[rgb(var(--color-text-secondary))]" />
                </div>
                {vol.chapters.length === 0 ? (
                  <p className="text-[10px] text-[rgb(var(--color-text-secondary))] text-center py-2">暂无章节</p>
                ) : (
                  <div className="space-y-1.5">
                    {vol.chapters.map((ch, chIdx) => (
                      <Card key={ch.id} hover padding="sm" onClick={() => onPreviewChapter(sl.id, vol.id, ch.id)} className="group bg-white/70 dark:bg-gray-800/60">
                        <div className="flex items-center gap-0 min-w-0">
                          <div className="flex items-center gap-0 flex-shrink-0 w-64">
                            <span className="text-xs font-medium w-14 text-center flex-shrink-0">第{chIdx + 1}章</span>
                            <span className="text-[rgb(var(--color-border))] mx-5 flex-shrink-0">|</span>
                            <span className="text-xs font-medium text-center flex-1 min-w-0">{ch.title || '(未命名)'}</span>
                            <span className="text-[rgb(var(--color-border))] mx-5 flex-shrink-0">|</span>
                          </div>
                          <span className="text-xs text-[rgb(var(--color-text-secondary))] flex-1 min-w-0 text-center">{ch.brief || ''}</span>
                          <span className="text-[rgb(var(--color-border))] mx-5 flex-shrink-0">|</span>
                          <span className="text-[10px] text-[rgb(var(--color-text-secondary))] w-14 text-center flex-shrink-0">{ch.content?.length.toLocaleString() || 0}字</span>
                          <span className="text-[rgb(var(--color-border))] mx-5 flex-shrink-0">|</span>
                          <span className="text-[10px] text-[rgb(var(--color-text-secondary))] w-20 text-center flex-shrink-0">{ch.created_at ? new Date(ch.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
                );
              })}
            </div>
      )}
    </div>
  );
}
