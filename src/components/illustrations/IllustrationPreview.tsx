import { useState } from 'react';
import type { Illustration, Character, TimelineEvent, Storyline } from '@/lib/database';
import Lightbox from '@/components/ui/Lightbox';

interface Props {
  illustration: Illustration;
  characters: Character[];
  timelineEvents: TimelineEvent[];
  storylines: Storyline[];
}

export default function IllustrationPreview({ illustration, characters, timelineEvents, storylines }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const images = illustration.images || [];
  const imgUrls = images.map((i) => i.url);

  const linkedCharList = characters.filter((c) => illustration.linked_characters?.includes(c.id));
  const linkedTimelineList = timelineEvents.filter((e) => illustration.linked_timeline_events?.includes(e.id));
  const linkedStorylineList = storylines.filter((s) => illustration.linked_storylines?.includes(s.id));

  return (
    <div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((img, i) => (
            <div key={i} className="cursor-pointer" onClick={() => setLightboxIdx(i)}>
              <div className="aspect-square rounded-lg overflow-hidden border border-[rgb(var(--color-border))]">
                <img src={img.url} alt={img.label} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
              </div>
              {img.label && (
                <p className="text-[10px] text-center truncate mt-1 text-[rgb(var(--color-text-secondary))]">{img.label}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {illustration.description && (
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4"
          dangerouslySetInnerHTML={{ __html: illustration.description }} />
      )}

      {(linkedCharList.length > 0 || linkedTimelineList.length > 0 || linkedStorylineList.length > 0) && (
        <div className="space-y-3 mt-4 pt-4 border-t border-[rgb(var(--color-border))]">
          {linkedCharList.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">关联角色</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {linkedCharList.map((c) => (
                  <span key={c.id} className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{c.name}</span>
                ))}
              </div>
            </div>
          )}
          {linkedTimelineList.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">关联时间线</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {linkedTimelineList.map((e) => (
                  <span key={e.id} className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{e.title}</span>
                ))}
              </div>
            </div>
          )}
          {linkedStorylineList.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">关联主线剧情</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {linkedStorylineList.map((s) => (
                  <span key={s.id} className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{s.title}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {lightboxIdx !== null && (
        <Lightbox
          images={imgUrls}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNavigate={setLightboxIdx}
        />
      )}
    </div>
  );
}
