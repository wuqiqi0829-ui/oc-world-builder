import type { Relationship } from '@/lib/database';
import { parseLabel } from '@/lib/labelUtils';
import { Trash2 } from 'lucide-react';

const relationLabels: Record<string, string> = {
  friend: '亲友', enemy: '敌对', mentor: '师徒', lover: '恋人',
  colleague: '同僚', belong: '所属', located: '位于', other: '其他',
};

interface Props {
  relationships: Relationship[];
  characterNames: Record<string, string>;
  onEdit: (rel: Relationship) => void;
  onDelete: (id: string) => void;
}

export default function RelationshipList({ relationships, characterNames, onEdit, onDelete }: Props) {
  return (
    <div className="w-[260px] flex-shrink-0 border-l border-[rgb(var(--color-border))] flex flex-col bg-[rgb(var(--color-bg))] dark:bg-gray-800">
      <div className="px-4 py-3 border-b border-[rgb(var(--color-border))]">
        <h3 className="text-xs font-semibold text-center">关系列表 · {relationships.length}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {relationships.length === 0 ? (
          <p className="text-xs text-[rgb(var(--color-text-secondary))] text-center py-8">暂无关系</p>
        ) : (
          relationships.map((rel) => {
            const srcName = characterNames[rel.source_id] || '未知';
            const tgtName = characterNames[rel.target_id] || '未知';
            const { color, opinion } = parseLabel(rel.label);
            const typeLabel = relationLabels[rel.relation_type] || rel.relation_type || '关联';
            return (
              <div
                key={rel.id}
                className="group relative px-3 py-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-all shadow-sm border border-[rgb(var(--color-border))]"
                onClick={() => onEdit(rel)}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  {color && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  )}
                  <span className="text-[11px] font-medium truncate">{srcName}</span>
                  <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">→</span>
                  <span className="text-[11px] font-medium truncate">{tgtName}</span>
                </div>
                <div className="text-[10px] text-[rgb(var(--color-text-secondary))] ml-4 truncate">
                  {typeLabel}{opinion ? ` · ${opinion}` : ''}
                </div>
                <button
                  className="absolute right-2 top-2 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-[rgb(var(--color-text-secondary))] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onDelete(rel.id); }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
