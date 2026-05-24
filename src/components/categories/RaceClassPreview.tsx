import type { CustomEntry } from '@/lib/database';

interface Props { entry: CustomEntry; typeLabel: string }

export default function RaceClassPreview({ entry, typeLabel }: Props) {
  const brief = (entry.field_values as Record<string, string> | undefined)?.brief || '';

  return (
    <div className="text-center">
      {entry.images?.[0] && (
        <div className="mb-4">
          <div className="inline-block rounded-card overflow-hidden border border-[rgb(var(--color-border))]">
            <img src={entry.images[0].url} alt={entry.name} className="max-h-72 object-contain" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">{typeLabel}</span>
          <p className="text-sm mt-0.5">{entry.name}</p>
        </div>
        {brief && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">「{brief}」</p>
          </div>
        )}
      </div>

      {entry.description && (
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
            <div className="text-sm leading-relaxed text-left max-w-none whitespace-pre-wrap">{entry.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
