import type { Character } from '@/lib/database';
import { Edit3, X } from 'lucide-react';

interface Props {
  character: Character;
  onEdit: () => void;
  onClose: () => void;
}

export default function CharacterDetail({ character, onEdit, onClose }: Props) {
  const fields = [
    { label: '姓名', value: character.name },
    { label: '昵称', value: character.nickname },
    { label: '性别', value: character.gender },
    { label: '年龄', value: character.age },
    { label: '职业', value: character.occupation },
    { label: '阵营', value: character.faction },
    { label: '口头禅', value: character.catchphrase },
    { label: '外貌描述', value: character.appearance, rich: true },
    { label: '性格', value: character.personality, rich: true },
    { label: '背景故事', value: character.background, rich: true },
    { label: '能力设定', value: character.abilities, rich: true },
    { label: '弱点', value: character.weaknesses, rich: true },
  ];

  return (
    <div className="card relative">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-semibold">{character.name}</h2>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={onEdit}>
            <Edit3 size={12} /> 编辑
          </button>
          <button className="btn-ghost text-xs !px-2 !py-1" onClick={onClose}>
            <X size={12} />
          </button>
        </div>
      </div>

      {character.images && character.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-3 mb-4">
          {character.images.map((img, i) => (
            <div key={i} className="flex-shrink-0 w-32">
              <img src={img.url} alt={img.label || character.name}
                className="w-32 h-40 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
              {img.label && <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">{img.label}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {fields.map((f) => {
          if (!f.value) return null;
          return (
            <div key={f.label}>
              <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">{f.label}</span>
              {f.rich ? (
                <div className="text-sm mt-0.5 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: f.value }} />
              ) : (
                <p className="text-sm mt-0.5">{f.value}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
