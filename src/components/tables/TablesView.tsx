import { useEffect, useState, useMemo } from 'react';
import { useTables } from '@/stores/tables';
import { supabase } from '@/lib/supabase';
import EmptyState from '@/components/ui/EmptyState';
import Lightbox from '@/components/ui/Lightbox';
import TableCard from './TableCard';
import { Plus, Eye, EyeOff, Search } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface Props {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

const categories = ['单人表格', '双人表格', '多人表格', '其他表格'];

export default function TablesView({ onEdit, onCreate }: Props) {
  const { tables, fetch, reorder } = useTables();
  const [tab, setTab] = useState(categories[0]);
  const [search, setSearch] = useState('');
  const [showHandle, setShowHandle] = useState(false);
  const [allChars, setAllChars] = useState<{ id: string; name: string }[]>([]);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number>(0);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    supabase.from('characters').select('id,name').then(({ data }) => {
      if (data) setAllChars(data as any);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = tables.filter((t) => t.category === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => {
        if (t.title?.toLowerCase().includes(q)) return true;
        const linkedNames = (t.linked_characters || [])
          .map((id) => allChars.find((c) => c.id === id)?.name || '')
          .filter(Boolean);
        return linkedNames.some((name) => name.toLowerCase().includes(q));
      });
    }
    return list;
  }, [tables, tab, search, allChars]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = filtered.findIndex((t) => t.id === active.id);
    const newIdx = filtered.findIndex((t) => t.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const allIds = tables.map((t) => t.id);
    const filteredIds = filtered.map((t) => t.id);
    const reorderedFiltered = [...filteredIds];
    const [moved] = reorderedFiltered.splice(oldIdx, 1);
    reorderedFiltered.splice(newIdx, 0, moved);
    const reorderedAll = [...allIds];
    let fi = 0;
    for (let i = 0; i < reorderedAll.length; i++) {
      if (filteredIds.includes(reorderedAll[i])) {
        reorderedAll[i] = reorderedFiltered[fi++];
      }
    }
    reorder(reorderedAll);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">OC表格 ({tables.length})</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
            <input type="text" className="input text-xs pl-8 pr-3 py-1.5 w-48" placeholder="搜索标题或人物..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-ghost text-xs flex items-center gap-1" onClick={() => setShowHandle(!showHandle)}>
            {showHandle ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
            <Plus size={12} /> 新建
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {categories.map((cat) => (
          <button key={cat}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${tab === cat ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-border))]'}`}
            onClick={() => setTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无内容"
          description={search ? '没有匹配的结果' : `还没有"${tab}"类型的表格`}
          action={!search ? <button className="btn-primary text-sm" onClick={onCreate}>新建</button> : undefined} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={rectSortingStrategy}>
            <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 [&>*]:mb-3">
              {filtered.map((t) => (
                <TableCard key={t.id} table={t} allChars={allChars}
                  showHandle={showHandle} onClick={() => onEdit(t.id)}
                  onPreviewImage={() => {
                    const allUrls = tables.flatMap((x) => (x.images || []).map((i) => i.url).filter(Boolean) as string[]);
                    const idx = tables.findIndex((x) => x.id === t.id);
                    setLightboxImages(allUrls);
                    setLightboxIdx(idx >= 0 ? idx : 0);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxImages([])}
          onNavigate={setLightboxIdx}
        />
      )}
    </div>
  );
}
