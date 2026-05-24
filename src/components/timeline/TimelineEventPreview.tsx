import type { TimelineEvent } from '@/lib/database';

function getBrief(desc: string): string {
  const idx = desc.indexOf('<!--brief-->');
  if (idx >= 0) return desc.slice(0, idx);
  return '';
}

function getDetail(desc: string): string {
  const idx = desc.indexOf('<!--brief-->');
  if (idx >= 0) return desc.slice(idx + 12);
  return desc;
}

interface Props { event: TimelineEvent }

export default function TimelineEventPreview({ event }: Props) {
  const brief = getBrief(event.description || '');
  const detail = getDetail(event.description || '');
  const image = event.images?.[0];

  return (
    <div className="text-center">
      {image && (
        <div className="mb-4">
          <div className="inline-block rounded-card overflow-hidden border border-[rgb(var(--color-border))]">
            <img src={image.url} alt={event.title} className="max-h-72 object-contain" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">名称</span>
          <p className="text-sm mt-0.5">{event.title}</p>
        </div>
        {event.time_label && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">时间</span>
            <p className="text-sm mt-0.5 font-mono">{event.time_label}</p>
          </div>
        )}
        {brief && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">「{brief}」</p>
          </div>
        )}
      </div>

      {detail && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[rgb(var(--color-text))] text-center mb-3">
            <span className="text-primary-400/60 mr-2">✦</span>
            详细介绍
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
            <div className="text-sm leading-relaxed text-left max-w-none whitespace-pre-wrap">{detail}</div>
          </div>
        </div>
      )}
    </div>
  );
}
