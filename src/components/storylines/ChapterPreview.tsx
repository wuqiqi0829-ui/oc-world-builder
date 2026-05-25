import { useState } from 'react';
import type { Chapter } from '@/lib/database';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChapterEntry extends Chapter {
  _volTitle: string;
  _volChIdx: number;
}

interface Props {
  entries: ChapterEntry[];
  initialIndex: number;
}

export default function ChapterPreview({ entries, initialIndex }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const entry = entries[index];
  if (!entry) return null;

  const goTo = (i: number) => {
    if (i >= 0 && i < entries.length) setIndex(i);
  };

  return (
    <div className="text-center">
      {entry.brief && (
        <div className="mb-4">
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
          <p className="text-sm mt-0.5 whitespace-pre-wrap">「{entry.brief}」</p>
        </div>
      )}

      {entry.content && (
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--color-text))] text-center mb-3">
            <span className="text-primary-400/60 mr-2">✦</span>
            章节内容
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
            <div className="text-sm leading-relaxed text-left whitespace-pre-wrap">{entry.content}</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 sm:gap-10 mt-6 pt-4 border-t border-[rgb(var(--color-border))]">
        <button
          className="btn-ghost text-sm !px-2 sm:!px-3 !py-1.5 flex items-center gap-1 disabled:opacity-30 flex-shrink-0"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          <ChevronLeft size={16} /> 上一章
        </button>

        <select
          className="text-sm h-10 pl-3 pr-8 sm:pr-10 w-32 sm:w-48 rounded-md border border-primary-200 dark:border-primary-700/30 bg-white dark:bg-gray-800 outline-none"
          value={index}
          onChange={(e) => goTo(Number(e.target.value))}
        >
          {entries.map((e, i) => (
            <option key={`${e.id}-${i}`} value={i}>
              {e._volTitle} · 第{e._volChIdx + 1}章 {e.title || '(未命名)'}
            </option>
          ))}
        </select>

        <button
          className="btn-ghost text-sm !px-2 sm:!px-3 !py-1.5 flex items-center gap-1 disabled:opacity-30 flex-shrink-0"
          disabled={index === entries.length - 1}
          onClick={() => goTo(index + 1)}
        >
          下一章 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
