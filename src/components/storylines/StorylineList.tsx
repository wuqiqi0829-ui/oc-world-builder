import { useEffect, useState } from 'react';
import { useStorylines } from '@/stores/storylines';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

interface Props {
  worldId: string;
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export default function StorylineList({ worldId, activeId, onSelect }: Props) {
  const { storylines, fetch, create, remove } = useStorylines();
  const [newTitle, setNewTitle] = useState('');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { fetch(worldId); }, [worldId, fetch]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const s = await create({ world_id: worldId, title: newTitle.trim() });
    setNewTitle('');
    setShowNew(false);
    onSelect(s.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">主线剧情 ({storylines.length})</h3>
        <button className="btn-primary text-xs flex items-center gap-1" onClick={() => setShowNew(true)}>
          <Plus size={12} /> 新建故事线
        </button>
      </div>

      {storylines.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="还没有主线剧情"
          description="创建故事线，记录世界观的主线故事和章节"
          action={<button className="btn-primary text-sm" onClick={() => setShowNew(true)}>新建故事线</button>} />
      ) : (
        <div className="space-y-2">
          {storylines.map((s) => (
            <Card key={s.id} hover padding="sm" onClick={() => onSelect(s.id)}
              className={activeId === s.id ? 'ring-2 ring-primary-500' : ''}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">{s.title}</h4>
                  <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">
                    {s.chapters?.length || 0} 章
                  </span>
                </div>
                <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-400 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); remove(s.id); }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="新建故事线">
        <input type="text" className="input w-full text-sm" placeholder="故事线标题" value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)} autoFocus />
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-ghost text-sm" onClick={() => setShowNew(false)}>取消</button>
          <button className="btn-primary text-sm" onClick={handleCreate} disabled={!newTitle.trim()}>创建</button>
        </div>
      </Modal>
    </div>
  );
}
