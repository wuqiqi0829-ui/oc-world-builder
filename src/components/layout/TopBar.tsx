import { Search, Moon, Sun, Download, Upload, Plus, Globe } from 'lucide-react';
import { useTheme } from '@/stores/theme';

interface TopBarProps {
  onSearch?: (query: string) => void;
  onNew?: () => void;
  onNewWorld?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export default function TopBar({ onSearch, onNew, onNewWorld, onExport, onImport }: TopBarProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="h-14 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex items-center gap-3 px-4 flex-shrink-0">
      <h1 className="text-base font-semibold text-primary-600 whitespace-nowrap hidden sm:block">
        OC Builder
      </h1>

      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
        <input
          type="text"
          placeholder="搜索人物、事件、标签..."
          className="input pl-9 w-full text-sm h-9"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1">
        <button className="btn-ghost h-9 w-9 p-0 flex items-center justify-center" title="新建世界观" onClick={onNewWorld}>
          <Globe size={18} />
        </button>
        <button className="btn-ghost h-9 w-9 p-0 flex items-center justify-center" title="新建" onClick={onNew}>
          <Plus size={18} />
        </button>
        <button className="btn-ghost h-9 w-9 p-0 flex items-center justify-center" title="导出" onClick={onExport}>
          <Download size={18} />
        </button>
        <button className="btn-ghost h-9 w-9 p-0 flex items-center justify-center" title="导入" onClick={onImport}>
          <Upload size={18} />
        </button>
        <button
          className="btn-ghost h-9 w-9 p-0 flex items-center justify-center"
          title={theme === 'dark' ? '切换亮色' : '切换暗色'}
          onClick={toggle}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
