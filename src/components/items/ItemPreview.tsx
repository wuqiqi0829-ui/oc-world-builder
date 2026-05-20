import type { Item } from '@/lib/database';

interface Props { item: Item }

export default function ItemPreview({ item }: Props) {
  return (
    <div>
      {item.category && (
        <span className="inline-block text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded mb-3">{item.category}</span>
      )}
      <div className="flex gap-3 mb-3 mt-3">
        {item.images && item.images.length > 0 && item.images.map((img, i) => (
          <div key={i} className="flex-shrink-0">
            <img src={img.url} alt={img.label || item.name}
              className="w-36 h-28 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
            {img.label && <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">{img.label}</p>}
          </div>
        ))}
      </div>
      {item.attributes && Object.keys(item.attributes).length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(item.attributes).map(([k, v]) => (
            <div key={k}>
              <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))]">{k}</span>
              <p className="text-sm">{v}</p>
            </div>
          ))}
        </div>
      )}
      {item.description && (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: item.description }} />
      )}
    </div>
  );
}
