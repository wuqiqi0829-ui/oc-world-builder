import type { TimelineEvent } from '@/lib/database';

interface Props { event: TimelineEvent }

export default function TimelineEventPreview({ event }: Props) {
  return (
    <div>
      {event.time_label && (
        <span className="inline-block text-sm font-mono text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded mb-3">
          {event.time_label}
        </span>
      )}
      {event.images && event.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 mt-3">
          {event.images.map((img, i) => (
            <div key={i} className="flex-shrink-0">
              <img src={img.url} alt={img.label || event.title}
                className="w-48 h-28 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
              {img.label && <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">{img.label}</p>}
            </div>
          ))}
        </div>
      )}
      {event.description && (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: event.description }} />
      )}
    </div>
  );
}
