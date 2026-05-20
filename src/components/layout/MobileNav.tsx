import clsx from 'clsx';
import { Clock, Map, Users, BookOpen, Menu } from 'lucide-react';

interface MobileNavProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
  onOpenSidebar: () => void;
}

const tabs = [
  { id: 'characters', label: '人物', icon: Users },
  { id: 'map', label: '地图', icon: Map },
  { id: 'timeline', label: '时间线', icon: Clock },
  { id: 'storylines', label: '剧情', icon: BookOpen },
];

export default function MobileNav({ activeModule, onSelectModule, onOpenSidebar }: MobileNavProps) {
  return (
    <nav className="lg:hidden h-14 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex items-center flex-shrink-0">
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center flex-1 h-full text-[rgb(var(--color-text-secondary))]"
      >
        <Menu size={20} />
        <span className="text-[10px] mt-0.5">菜单</span>
      </button>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelectModule(t.id)}
          className={clsx(
            'flex flex-col items-center justify-center flex-1 h-full transition-colors',
            activeModule === t.id
              ? 'text-primary-600'
              : 'text-[rgb(var(--color-text-secondary))]'
          )}
        >
          <t.icon size={20} />
          <span className="text-[10px] mt-0.5">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
