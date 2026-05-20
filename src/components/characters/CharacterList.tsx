import { useMemo } from 'react';
import type { Character } from '@/lib/database';
import CharacterCard from './CharacterCard';
import EmptyState from '@/components/ui/EmptyState';
import { Users, Search } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface Props {
  characters: Character[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export default function CharacterList({ characters, activeId, onSelect, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [filterOccupation, setFilterOccupation] = useState('');
  const [filterFaction, setFilterFaction] = useState('');

  const occupations = useMemo(() => {
    const set = new Set(characters.map((c) => c.occupation).filter(Boolean));
    return [...set].sort();
  }, [characters]);

  const factions = useMemo(() => {
    const set = new Set(characters.map((c) => c.faction).filter(Boolean));
    return [...set].sort();
  }, [characters]);

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      if (search && !c.name.includes(search) && !c.nickname?.includes(search)) return false;
      if (filterOccupation && c.occupation !== filterOccupation) return false;
      if (filterFaction && c.faction !== filterFaction) return false;
      return true;
    });
  }, [characters, search, filterOccupation, filterFaction]);

  const hasFilters = occupations.length > 0 || factions.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
          <input
            type="text"
            placeholder="搜索角色..."
            className="input pl-8 w-full text-sm h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {hasFilters && (
          <>
            {occupations.length > 0 && (
              <select
                className="input text-sm h-9 w-auto"
                value={filterOccupation}
                onChange={(e) => setFilterOccupation(e.target.value)}
              >
                <option value="">全部职业</option>
                {occupations.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
            {factions.length > 0 && (
              <select
                className="input text-sm h-9 w-auto"
                value={filterFaction}
                onChange={(e) => setFilterFaction(e.target.value)}
              >
                <option value="">全部阵营</option>
                {factions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            )}
            <button
              className={clsx('btn-ghost text-xs', !search && !filterOccupation && !filterFaction && 'hidden')}
              onClick={() => { setSearch(''); setFilterOccupation(''); setFilterFaction(''); }}
            >
              清除筛选
            </button>
          </>
        )}
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
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
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
