import type { Location } from '@/lib/database';

interface Props { location: Location }

export default function LocationPreview({ location }: Props) {
  return (
    <div>
      <div className="flex gap-3 mb-3 text-xs text-[rgb(var(--color-text-secondary))]">
        {location.category && <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded">{location.category}</span>}
        {location.region && <span>{location.region}</span>}
        <span>坐标 ({location.map_x}%, {location.map_y}%)</span>
      </div>
      {location.images && location.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2">
          {location.images.map((img, i) => (
            <div key={i} className="flex-shrink-0">
              <img src={img.url} alt={img.label || location.name}
                className="w-48 h-28 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
              {img.label && <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">{img.label}</p>}
            </div>
          ))}
        </div>
      )}
      {location.description && (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: location.description }} />
      )}
    </div>
  );
}
