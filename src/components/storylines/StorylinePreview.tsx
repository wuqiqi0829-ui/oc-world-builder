import type { Storyline } from '@/lib/database';
import { normalizeChapters } from '@/lib/database';

interface Props { storyline: Storyline }

export default function StorylinePreview({ storyline }: Props) {
  const volumes = normalizeChapters(storyline.chapters);
  const chapterCount = volumes.reduce((sum, v) => sum + v.chapters.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs text-[rgb(var(--color-text-secondary))]">{volumes.length} 卷</span>
        <span className="text-xs text-[rgb(var(--color-text-secondary))]">·</span>
        <span className="text-xs text-[rgb(var(--color-text-secondary))]">{chapterCount} 章</span>
      </div>

      {storyline.description && (
        <div
          className="text-sm text-left prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: storyline.description }}
        />
      )}

      {volumes.map((vol, vIdx) => (
        <div key={vol.id} className="border-l-2 border-primary-300 dark:border-primary-700 pl-3">
          <h4 className="text-sm font-medium text-[rgb(var(--color-text))] mb-2">
            {vol.title || `第 ${vIdx + 1} 卷`}
          </h4>
          {vol.chapters.length === 0 ? (
            <p className="text-xs text-[rgb(var(--color-text-secondary))] ml-3 pl-3 border-l border-primary-200 dark:border-primary-800/50">暂无章节</p>
          ) : (
            <div className="space-y-2">
              {vol.chapters.map((ch, chIdx) => (
                <div key={ch.id} className="ml-3 pl-3 border-l border-primary-200 dark:border-primary-800/50">
                  <h5 className="text-xs font-medium text-[rgb(var(--color-text))]">
                    {ch.title || `第 ${chIdx + 1} 章`}
                  </h5>
                  {ch.content && (
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5 whitespace-pre-wrap">{ch.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {volumes.length === 0 && (
        <p className="text-xs text-[rgb(var(--color-text-secondary))] text-center py-4">暂无卷和章节</p>
      )}
    </div>
  );
}
