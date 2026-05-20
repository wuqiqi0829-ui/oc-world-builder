import type { CustomEntry, CustomCategory } from '@/lib/database';

interface Props { entry: CustomEntry; category?: CustomCategory }

export default function EntryPreview({ entry, category }: Props) {
  const fields = category?.fields || [];

  return (
    <div>
      <div className="flex gap-3 mb-3">
        {entry.images && entry.images.length > 0 && entry.images.map((img, i) => (
          <div key={i} className="flex-shrink-0">
            <img src={img.url} alt={img.label || entry.name}
              className="w-36 h-28 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
            {img.label && <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">{img.label}</p>}
          </div>
        ))}
      </div>
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {fields.map((f) => {
            const val = entry.field_values?.[f.key];
            if (!val) return null;
            return (
              <div key={f.key}>
                <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))]">{f.label}</span>
                <p className="text-sm">{val}</p>
              </div>
            );
          })}
        </div>
      )}
      {entry.description && (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.description }} />
      )}
    </div>
  );
}
