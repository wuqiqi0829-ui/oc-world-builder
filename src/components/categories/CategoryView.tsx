import { useEffect } from 'react';
import { useCategories } from '@/stores/categories';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Briefcase, Plus, Edit3, LayoutList } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  worldId: string;
  onCreateCategory: () => void;
  onEditCategory: (id: string) => void;
  onEditEntry: (categoryId: string, entryId: string | null) => void;
  onPreviewEntry?: (categoryId: string, entryId: string) => void;
}

export default function CategoryView({ worldId, onCreateCategory, onEditCategory, onEditEntry, onPreviewEntry }: Props) {
  const { categories, entries, activeCategoryId, setActiveCategory, fetchCategories, fetchEntries } = useCategories();

  useEffect(() => { fetchCategories(worldId); }, [worldId, fetchCategories]);

  useEffect(() => {
    if (activeCategoryId) fetchEntries(activeCategoryId);
  }, [activeCategoryId, fetchEntries]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const currentEntries = activeCategoryId ? (entries[activeCategoryId] || []) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Categories sidebar */}
      <div className="lg:w-56 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">设定分类</h3>
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={onCreateCategory}>
            <Plus size={12} /> 新建
          </button>
        </div>
        <div className="space-y-1">
          {categories.length === 0 ? (
            <p className="text-xs text-[rgb(var(--color-text-secondary))] px-2 py-4 text-center">暂无分类</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="group relative">
                <button
                  className={clsx(
                    'flex items-center gap-2 w-full px-2.5 py-2 rounded-btn text-sm text-left transition-colors',
                    activeCategoryId === cat.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-[rgb(var(--color-border))]'
                  )}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <LayoutList size={14} className="flex-shrink-0" />
                  <span className="truncate flex-1">{cat.name}</span>
                  <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">
                    {(entries[cat.id] || []).length}
                  </span>
                </button>
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))]"
                  onClick={() => onEditCategory(cat.id)}
                >
                  <Edit3 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Entries area */}
      <div className="flex-1">
        {!activeCategory ? (
          <EmptyState icon={<Briefcase size={48} />} title="选择或创建分类"
            description="左侧选择已有的设定分类，或新建一个（如职业、势力、种族）" />
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">{activeCategory.name}</h3>
                {activeCategory.fields && activeCategory.fields.length > 0 && (
                  <p className="text-[10px] text-[rgb(var(--color-text-secondary))]">
                    自定义字段：{activeCategory.fields.map((f) => f.label).join('、')}
                  </p>
                )}
              </div>
              <button className="btn-primary text-xs flex items-center gap-1" onClick={() => onEditEntry(activeCategoryId!, null)}>
                <Plus size={12} /> 新建条目
              </button>
            </div>

            {currentEntries.length === 0 ? (
              <EmptyState icon={<LayoutList size={36} />} title="暂无条目" description="在这个分类下创建第一个条目" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentEntries.map((entry) => (
                  <Card key={entry.id} hover padding="sm" onClick={() => {
                  if (onPreviewEntry && entry.id) onPreviewEntry(activeCategoryId!, entry.id);
                  else onEditEntry(activeCategoryId!, entry.id);
                }}>
                    <div className="flex gap-3">
                      {entry.images?.[0]?.url && (
                        <img src={entry.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{entry.name}</h4>
                        {entry.description && (
                          <p className="text-[10px] text-[rgb(var(--color-text-secondary))] line-clamp-2 mt-0.5"
                            dangerouslySetInnerHTML={{ __html: entry.description.replace(/<[^>]*>/g, '') }} />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
