import { useState, useEffect, useRef } from 'react';
import { useTags } from '@/stores/tags';
import { Plus, X, TagIcon } from 'lucide-react';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  targetType?: string;
  targetId?: string;
}

export default function TagPicker({ selectedIds, onChange }: Props) {
  const { tags, fetch, create } = useTags();
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));
  const availableTags = tags.filter((t) => !selectedIds.includes(t.id));

  const toggleTag = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((tid) => tid !== id)
        : [...selectedIds, id]
    );
  };

  const createAndAdd = async () => {
    if (!newTagName.trim()) return;
    const tag = await create(newTagName.trim());
    onChange([...selectedIds, tag.id]);
    setNewTagName('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-wrap gap-1 min-h-[36px] items-center px-2 py-1.5 border border-[rgb(var(--color-border))] rounded-input cursor-text bg-[rgb(var(--color-bg))]"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}>
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button onClick={(e) => { e.stopPropagation(); toggleTag(tag.id); }}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[80px] border-none outline-none bg-transparent text-sm py-0.5"
          placeholder={selectedTags.length === 0 ? '添加标签...' : ''}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); createAndAdd(); }
          }}
        />
        <button className="p-0.5 text-[rgb(var(--color-text-secondary))] hover:text-primary-500" onClick={() => setOpen(!open)}>
          <TagIcon size={14} />
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-card shadow-lg z-30 max-h-48 overflow-y-auto">
          {newTagName.trim() && !tags.find((t) => t.name === newTagName.trim()) && (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary-500 hover:bg-[rgb(var(--color-border))]"
              onClick={createAndAdd}
            >
              <Plus size={14} />
              创建「{newTagName.trim()}」
            </button>
          )}
          {availableTags.length === 0 && !newTagName.trim() && (
            <p className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">暂无更多标签</p>
          )}
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-[rgb(var(--color-border))]"
              onClick={() => toggleTag(tag.id)}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
