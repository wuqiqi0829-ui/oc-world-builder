import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Moon, Sun, Download, Upload, Plus, Globe } from 'lucide-react';
import { useTheme } from '@/stores/theme';
import { globalSearch, type SearchResult } from '@/lib/db';
import SearchResults from '@/components/ui/SearchResults';

interface TopBarProps {
  onNew?: () => void;
  onNewWorld?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSelectSearchResult?: (result: SearchResult) => void;
}

export default function TopBar({ onNew, onNewWorld, onExport, onImport, onSelectSearchResult }: TopBarProps) {
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
    <header className="h-14 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex items-center gap-3 px-4 flex-shrink-0">
      <h1 className="text-base font-semibold text-primary-600 whitespace-nowrap hidden sm:block">
        OC Builder
      </h1>

      <div className="flex-1 max-w-md relative" ref={containerRef}>
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
