import { useState } from 'react';
import type { Character } from '@/lib/database';
import Lightbox from '@/components/ui/Lightbox';

interface Props { character: Character }

export default function CharacterPreview({ character }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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

  const imgUrls = (character.images || []).map((img) => img.url);

  return (
    <div>
      {character.images && character.images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {character.images.map((img, i) => (
            <div
              key={i}
              className="w-[calc(50%-4px)] sm:w-[calc(33.33%-6px)] cursor-pointer"
              onClick={() => setLightboxIdx(i)}
            >
              <img
                src={img.url}
                alt={img.label || character.name}
                className="w-full h-40 object-cover rounded-lg hover:opacity-80 transition-opacity"
              />
              {img.label && (
                <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center truncate">{img.label}</p>
              )}
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

      {lightboxIdx !== null && (
        <Lightbox
          images={imgUrls}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNavigate={setLightboxIdx}
        />
      )}
    </div>
  );
}
