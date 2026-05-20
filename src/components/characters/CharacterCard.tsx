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
  const badges = [character.gender, character.age, character.occupation, character.faction].filter(Boolean);

  return (
    <Card hover padding="sm" onClick={onClick} className={clsx(selected && 'ring-2 ring-primary-500')}>
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-lg bg-[rgb(var(--color-bg))] overflow-hidden flex-shrink-0 border border-[rgb(var(--color-border))]">
          {avatar ? (
            <img src={avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-400 font-bold text-xl">
              {character.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{character.name}</h3>
          {character.nickname && <p className="text-sm text-[rgb(var(--color-text-secondary))] truncate mt-0.5">「{character.nickname}」</p>}
        </div>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 content-start self-start flex-shrink-0 max-w-[60%] justify-end">
            {badges.map((b) => (
              <span key={b} className="text-[10px] bg-[rgb(var(--color-bg))] px-1.5 py-0.5 rounded-full whitespace-nowrap">{b}</span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
