import type { Character } from '@/lib/database';
import Card from '@/components/ui/Card';
import clsx from 'clsx';

interface Props {
  character: Character;
  selected?: boolean;
  onClick: () => void;
}

export default function CharacterCard({ character, selected, onClick }: Props) {
  const avatar = character.images?.[0]?.url;
  const tags = [character.occupation, character.faction].filter(Boolean);

  return (
    <Card hover padding="sm" onClick={onClick} className={clsx(selected && 'ring-2 ring-primary-500')}>
      <div className="flex gap-2.5">
        <div className="w-12 h-12 rounded-lg bg-[rgb(var(--color-bg))] overflow-hidden flex-shrink-0 border border-[rgb(var(--color-border))]">
          {avatar ? (
            <img src={avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-400 font-bold text-base">
              {character.name[0]}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm truncate">{character.name}</h3>
          {character.nickname && <p className="text-[11px] text-[rgb(var(--color-text-secondary))] truncate">「{character.nickname}」</p>}
          <div className="flex items-center gap-1 mt-0.5">
            {character.gender && <span className="text-[10px] bg-[rgb(var(--color-bg))] px-1.5 py-0.5 rounded-full">{character.gender}</span>}
            {character.age && <span className="text-[10px] bg-[rgb(var(--color-bg))] px-1.5 py-0.5 rounded-full">{character.age}</span>}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((t) => (
                <span key={t} className="text-[10px] bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
