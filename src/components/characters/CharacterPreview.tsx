import type { Character } from '@/lib/database';

interface Props { character: Character }

export default function CharacterPreview({ character }: Props) {
  const fields = [
    ['昵称', character.nickname],
    ['性别', character.gender],
    ['年龄', character.age],
    ['职业', character.occupation],
    ['阵营', character.faction],
    ['口头禅', character.catchphrase],
    ['外貌描述', character.appearance, true],
    ['性格', character.personality, true],
    ['背景故事', character.background, true],
    ['能力设定', character.abilities, true],
  ] as const;

  return (
    <div>
      {character.images && character.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2">
          {character.images.map((img, i) => (
            <div key={i} className="flex-shrink-0 w-36">
              <img src={img.url} alt={img.label || character.name}
                className="w-36 h-48 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
              {img.label && <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">{img.label}</p>}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {fields.map(([label, value, rich]) => {
          if (!value) return null;
          return (
            <div key={label as string}>
              <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">{label as string}</span>
              {rich ? (
                <div className="text-sm mt-0.5 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: value as string }} />
              ) : (
                <p className="text-sm mt-0.5 whitespace-pre-wrap">{value as string}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
