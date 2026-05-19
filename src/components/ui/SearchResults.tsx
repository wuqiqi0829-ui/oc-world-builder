import { Users, Clock, Map, Building2, Package, BookOpen, Lightbulb } from 'lucide-react';
import type { SearchResult } from '@/lib/db';

const typeConfig: Record<string, { icon: typeof Users; label: string }> = {
  character: { icon: Users, label: '人物' },
  timeline: { icon: Clock, label: '时间线' },
  location: { icon: Map, label: '地点' },
  organization: { icon: Building2, label: '组织' },
  item: { icon: Package, label: '物品' },
  storyline: { icon: BookOpen, label: '剧情' },
  note: { icon: Lightbulb, label: '笔记' },
};

interface Props {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  loading?: boolean;
  query?: string;
}

export default function SearchResults({ results, onSelect, loading, query }: Props) {
  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-[rgb(var(--color-text-secondary))]">
        搜索中...
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-[rgb(var(--color-text-secondary))]">
        未找到「{query}」相关结果
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {results.map((r) => {
        const config = typeConfig[r.type] || typeConfig.note;
        const Icon = config.icon;
        return (
          <button
            key={`${r.type}-${r.id}`}
            className="flex items-start gap-3 w-full px-4 py-2.5 text-left hover:bg-[rgb(var(--color-border))] transition-colors"
            onClick={() => onSelect(r)}
          >
            <div className="mt-0.5 flex-shrink-0">
              <Icon size={16} className="text-[rgb(var(--color-text-secondary))]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{r.title || '(无标题)'}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-primary-500 bg-primary-100 dark:bg-primary-900 px-1 rounded">
                  {config.label}
                </span>
                {r.subtitle && (
                  <span className="text-[10px] text-[rgb(var(--color-text-secondary))] truncate">{r.subtitle}</span>
                )}
                <span className="text-[10px] text-[rgb(var(--color-text-secondary))] ml-auto flex-shrink-0">
                  {r.world_name}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
