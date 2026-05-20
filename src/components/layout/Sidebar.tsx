import {

  Globe, Clock, Map, Users, Briefcase, Building2,
  Package, GitBranch, BookOpen, Lightbulb, ChevronLeft,
  Trash2, Plus
} from 'lucide-react';
import clsx from 'clsx';

interface World {
  id: string;
  name: string;
  cover_url?: string | null;
}

interface SidebarProps {
  worlds: World[];
  activeWorldId: string | null;
  activeModule: string;
  onSelectWorld: (id: string) => void;
  onDeleteWorld: (id: string) => void;
  onSelectModule: (module: string) => void;
  onNewWorld?: () => void;
  onShowAllWorlds?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const modules = [
  { id: 'characters', label: '人物', icon: Users },
  { id: 'map', label: '地图', icon: Map },
  { id: 'timeline', label: '时间线', icon: Clock },
  { id: 'storylines', label: '主线剧情', icon: BookOpen },
  { id: 'categories', label: '职业/种族', icon: Briefcase },
  { id: 'organizations', label: '组织势力', icon: Building2 },
  { id: 'relationships', label: '关系图谱', icon: GitBranch },
  { id: 'items', label: '物品图鉴', icon: Package },
  { id: 'notes', label: '灵感速记', icon: Lightbulb },
];

export default function Sidebar({
  worlds, activeWorldId, activeModule, onSelectWorld, onDeleteWorld, onSelectModule,
  onNewWorld, onShowAllWorlds, collapsed, onToggleCollapse,
}: SidebarProps) {

  if (collapsed) {
    return (
      <aside className="w-14 border-r border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex flex-col items-center py-3 gap-2 flex-shrink-0">
        <button onClick={onToggleCollapse} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))] mb-2">
          <ChevronLeft size={18} className="rotate-180 text-[rgb(var(--color-text-secondary))]" />
        </button>
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModule(m.id)}
            className={clsx(
              'w-10 h-10 rounded-btn flex items-center justify-center transition-colors',
              activeModule === m.id
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600'
                : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-border))]'
            )}
            title={m.label}
          >
            <m.icon size={20} />
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-60 border-r border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex flex-col flex-shrink-0 overflow-hidden">
      <div className="p-3 border-b border-[rgb(var(--color-border))] flex items-center justify-between">
        <span className="text-sm font-medium">世界观</span>
        <div className="flex items-center gap-1">
          {onNewWorld && (
            <button onClick={onNewWorld} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))] text-primary-500" title="新建世界观">
              <Plus size={16} />
            </button>
          )}
          <button onClick={onToggleCollapse} className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))]">
            <ChevronLeft size={16} className="text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>
      </div>

      <div className="p-2">
        {onShowAllWorlds && (
          <button
            onClick={onShowAllWorlds}
            className="flex items-center gap-2 w-full text-xs text-primary-500 font-medium px-2 py-1.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 mb-1"
          >
            <Globe size={14} /> 全部世界观 ({worlds.length})
          </button>
        )}
        <div className="space-y-0.5">
          {worlds.length === 0 ? (
            <p className="text-xs text-[rgb(var(--color-text-secondary))] px-2 py-2">
              还没有世界观，点击上方 + 新建
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {worlds.map((w) => (
                <div
                  key={w.id}
                  className={clsx(
                    'group relative rounded-card cursor-pointer transition-all overflow-hidden border',
                    activeWorldId === w.id
                      ? 'border-primary-400 ring-1 ring-primary-300'
                      : 'border-[rgb(var(--color-border))] hover:border-primary-300'
                  )}
                  onClick={() => onSelectWorld(w.id)}
                >
                  <div className="aspect-[4/3] bg-[rgb(var(--color-bg))] flex items-center justify-center overflow-hidden">
                    {w.cover_url ? (
                      <img src={w.cover_url} alt={w.name} className="w-full h-full object-cover" />
                    ) : (
                      <Globe size={20} className="text-[rgb(var(--color-border))]" />
                    )}
                  </div>
                  <div className="px-2 py-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium truncate">{w.name}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-[rgb(var(--color-text-secondary))] hover:text-red-500 transition-all flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); onDeleteWorld(w.id); }}
                      title="删除"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-b border-[rgb(var(--color-border))] mt-1">
        <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">模块导航</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModule(m.id)}
            className={clsx(
              'flex items-center gap-3 w-full px-3 py-2 rounded-btn text-sm transition-colors mb-0.5',
              activeModule === m.id
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-border))]'
            )}
          >
            <m.icon size={18} />
            {m.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-[rgb(var(--color-border))]">
        <button className="btn-ghost text-xs w-full text-left">设置</button>
      </div>
    </aside>
  );
}
