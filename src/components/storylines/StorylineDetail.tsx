import type { Storyline } from '@/lib/database';
import { Edit3, X } from 'lucide-react';

interface Props { storyline: Storyline; onEdit: () => void; onClose: () => void; }

export default function StorylineDetail({ storyline, onEdit, onClose }: Props) {
  return (
    <div className="card relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{storyline.title}</h2>
          <span className="text-xs text-[rgb(var(--color-text-secondary))]">{storyline.chapters?.length || 0} 章</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={onEdit}><Edit3 size={12} /> 编辑</button>
          <button className="btn-ghost text-xs !px-2 !py-1" onClick={onClose}><X size={12} /></button>
        </div>
      </div>
      {storyline.description && (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none mb-4"
          dangerouslySetInnerHTML={{ __html: storyline.description }} />
      )}
      {storyline.chapters && storyline.chapters.length > 0 && (
        <div className="space-y-3">
          {storyline.chapters.map((ch, i) => (
            <div key={ch.id} className="border-l-2 border-primary-300 pl-3">
              <h4 className="text-sm font-medium">第 {i + 1} 章 · {ch.title || '(未命名)'}</h4>
              {ch.content && <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1 whitespace-pre-wrap">{ch.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
