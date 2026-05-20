import { useMemo } from 'react';
import type { Character } from '@/lib/database';
import CharacterCard from './CharacterCard';
import EmptyState from '@/components/ui/EmptyState';
import { Users, Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
  characters: Character[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export default function CharacterList({ characters, activeId, onSelect, onCreate }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      if (search && !c.name.includes(search) && !c.nickname?.includes(search)) return false;
      return true;
    });
  }, [characters, search]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
          <input
            type="text"
            placeholder="搜索角色..."
            className="input pl-8 w-full text-sm h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary text-sm !px-3 !py-1.5 flex items-center gap-1 flex-shrink-0" onClick={onCreate}>
          <Plus size={14} /> 新建人物
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title={characters.length === 0 ? '还没有角色' : '没有匹配的角色'}
          description={characters.length === 0 ? '创建你的第一个OC人设卡' : '试试调整搜索条件'}
          action={
            characters.length === 0 ? (
              <button className="btn-primary text-sm" onClick={onCreate}>新建角色</button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filtered.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              selected={activeId === c.id}
              onClick={() => onSelect(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
