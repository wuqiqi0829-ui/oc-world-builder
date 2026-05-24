import type { Item } from '@/lib/database';
import { useCharacters } from '@/stores/characters';
import { useLocations } from '@/stores/locations';
import { useCategories } from '@/stores/categories';

interface Props { item: Item }

function parseAssociations(attrs: Record<string, string>): { characters: string[]; locations: string[]; entries: string[] } {
  try {
    const raw = attrs._associations;
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { characters: [], locations: [], entries: [] };
}

export default function ItemPreview({ item }: Props) {
  const { characters } = useCharacters();
  const { locations } = useLocations();
  const { entries: catEntries } = useCategories();
  const allEntries = Object.values(catEntries).flat();

  const imageUrl = item.images?.[0]?.url;
  const brief = item.attributes?.brief || '';
  const { _associations: _, brief: _b, thumb_url: _t, _attrOrder, ...restAttrs } = item.attributes || {};
  const attrOrder: string[] = (Array.isArray(_attrOrder) ? _attrOrder : []) as string[];
  const orderedKeys = attrOrder.length > 0 ? attrOrder : Object.keys(restAttrs);
  const extraKeys = Object.keys(restAttrs).filter((k) => !orderedKeys.includes(k));
  const attrs = [...orderedKeys, ...extraKeys].filter((k) => k in restAttrs).map((k) => [k, restAttrs[k] || ''] as [string, string]);
  const assoc = parseAssociations(item.attributes || {});

  const charLabels = assoc.characters.map((id) => {
    const name = characters.find((c) => c.id === id)?.name || id;
    return `所属人物：${name}`;
  });
  const locLabels = assoc.locations.map((id) => {
    const name = locations.find((l) => l.id === id)?.name || id;
    return `所属地点：${name}`;
  });
  const entryLabels = assoc.entries.map((id) => {
    const entry = allEntries.find((e) => e.id === id);
    const catId = entry?.category_id;
    const cat = useCategories.getState().categories.find((c) => c.id === catId);
    return `所属${cat?.name || '条目'}：${entry?.name || id}`;
  });
  const allAssocLabels = [...charLabels, ...locLabels, ...entryLabels];

  const attrChunks: [string, string][][] = [];
  for (let i = 0; i < attrs.length; i += 3) attrChunks.push(attrs.slice(i, i + 3));
  const assocChunks: string[][] = [];
  for (let i = 0; i < allAssocLabels.length; i += 3) assocChunks.push(allAssocLabels.slice(i, i + 3));

  return (
    <div className="text-center">
      {imageUrl && (
        <div className="mb-4">
          <div className="inline-block rounded-card overflow-hidden border border-[rgb(var(--color-border))]">
            <img src={imageUrl} alt={item.name} className="max-h-72 object-contain" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">物品名称</span>
          <p className="text-sm mt-0.5">{item.name}</p>
        </div>
        {item.category && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">种类</span>
            <p className="text-sm mt-0.5">{item.category}</p>
          </div>
        )}
        {brief && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">「{brief}」</p>
          </div>
        )}
        {attrs.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">属性</span>
            <div className="space-y-1.5 mt-1">
              {attrChunks.map((chunk, ci) => (
                <div key={ci} className="flex justify-center gap-1.5">
                  {chunk.map(([k, v]) => (
                    <span key={k} className="text-xs text-primary-500 bg-primary-100 dark:bg-primary-800/40 px-2 py-0.5 rounded-full">{v ? `${k}: ${v}` : k}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {allAssocLabels.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">关联</span>
            <div className="space-y-1.5 mt-1">
              {assocChunks.map((chunk, ci) => (
                <div key={ci} className="flex justify-center gap-1.5">
                  {chunk.map((name) => (
                    <span key={name} className="text-xs text-primary-500 bg-primary-100 dark:bg-primary-800/40 px-2 py-0.5 rounded-full">{name}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {item.description && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[rgb(var(--color-text))] text-center mb-3">
            <span className="text-primary-400/60 mr-2">✦</span>
            详细介绍
            <span className="text-primary-400/60 ml-2">✦</span>
          </p>
          <div className="relative p-5 pt-4">
            <span className="absolute top-0 left-4 right-4 h-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute bottom-0 left-4 right-4 h-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute left-0 top-4 bottom-4 w-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute right-0 top-4 bottom-4 w-px bg-primary-200/80 dark:bg-primary-800/80" />
            <span className="absolute -top-2 -left-2 text-primary-400/60 select-none text-base">◇</span>
            <span className="absolute -top-2 -right-2 text-primary-400/60 select-none text-base">◇</span>
            <span className="absolute -bottom-2 -left-2 text-primary-400/60 select-none text-base">◇</span>
            <span className="absolute -bottom-2 -right-2 text-primary-400/60 select-none text-base">◇</span>
            <div className="text-sm leading-relaxed text-left max-w-none whitespace-pre-wrap">{item.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
