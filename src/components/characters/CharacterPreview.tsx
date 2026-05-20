import { useState } from 'react';
import type { Character } from '@/lib/database';
import Lightbox from '@/components/ui/Lightbox';

interface Props { character: Character }

export default function CharacterPreview({ character }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const basicInfo = [character.nickname ? `「${character.nickname}」` : '', character.gender, character.age, character.occupation, character.faction].filter(Boolean).join(' | ');

  const fields = [
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {character.images.map((img, i) => (
            <div key={i} className="cursor-pointer" onClick={() => setLightboxIdx(i)}>
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={img.url}
                  alt={img.label || character.name}
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
              </div>
              {img.label && (
                <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center truncate">{img.label}</p>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {basicInfo && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">基础信息</span>
            <p className="text-sm mt-0.5">{basicInfo}</p>
          </div>
        )}
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
