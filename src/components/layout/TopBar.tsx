import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Moon, Sun, Download, Upload, Plus, Globe, LogOut, User } from 'lucide-react';
import { useTheme } from '@/stores/theme';
import { globalSearch, type SearchResult } from '@/lib/db';
import SearchResults from '@/components/ui/SearchResults';

interface TopBarProps {
  onNew?: () => void;
  onNewWorld?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSelectSearchResult?: (result: SearchResult) => void;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onProfile?: () => void;
}

export default function TopBar({ onNew, onNewWorld, onExport, onImport, onSelectSearchResult, userEmail, userName, userAvatar, onLogout, onProfile }: TopBarProps) {
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await globalSearch(q);
      setResults(res);
      setOpen(true);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    onSelectSearchResult?.(result);
  };

  return (
    <header className="h-14 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex items-center gap-4 px-4 flex-shrink-0">
      <h1 className="text-base font-semibold text-primary-600 whitespace-nowrap hidden md:block min-w-[80px] max-w-[160px] truncate flex-shrink-0">
        {userName ? `${userName}的世界` : 'OC Builder'}
      </h1>

      <div className="flex-1 max-w-lg mx-auto relative" ref={containerRef}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))] z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索人物、事件、标签..."
          className="input pl-9 w-full text-sm h-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-card shadow-lg z-40 overflow-hidden">
            <SearchResults results={results} onSelect={handleSelect} loading={loading} query={query} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
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
        {userEmail && (
          <div className="relative group">
            <button className="btn-ghost h-9 px-2 flex items-center gap-1.5 text-xs" title={userEmail}>
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[rgb(var(--color-border))]" />
              ) : (
                <User size={16} />
              )}
              <span className="hidden lg:inline max-w-[100px] truncate">{userName || userEmail.split('@')[0]}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-card shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[160px]">
              <div className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))] border-b border-[rgb(var(--color-border))] truncate">
                {userEmail}
              </div>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-[rgb(var(--color-border))]"
                onClick={onProfile}
              >
                <User size={12} /> 个人主页
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-card"
                onClick={onLogout}
              >
                <LogOut size={12} /> 退出登录
              </button>
            </div>
          </div>
        )}
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
