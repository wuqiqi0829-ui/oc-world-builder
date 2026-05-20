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
  const info = [character.gender, character.age].filter(Boolean);

  return (
    <Card hover padding="sm" onClick={onClick} className={clsx('text-center', selected && 'ring-2 ring-primary-500')}>
      <div className="w-16 h-16 mx-auto rounded-xl bg-[rgb(var(--color-bg))] overflow-hidden border border-[rgb(var(--color-border))]">
        {avatar ? (
          <img src={avatar} alt={character.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-400 text-xl font-bold">
            {character.name[0]}
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm mt-2 truncate">{character.name}</h3>
      {character.nickname && (
        <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">「{character.nickname}」</p>
      )}
      {info.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {info.map((t) => (
            <span key={t} className="text-[10px] text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg))] px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-1.5">
          {tags.map((t) => (
            <span key={t} className="text-[10px] bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
