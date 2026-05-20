import type { Storyline } from '@/lib/database';

interface Props { storyline: Storyline }

export default function StorylinePreview({ storyline }: Props) {
  return (
    <div>
      <span className="text-xs text-[rgb(var(--color-text-secondary))] mb-3 inline-block">{storyline.chapters?.length || 0} 章</span>
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
