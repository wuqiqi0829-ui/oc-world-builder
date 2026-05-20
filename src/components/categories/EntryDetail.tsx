import type { CustomEntry, CustomCategory } from '@/lib/database';
import { Edit3, X } from 'lucide-react';

interface Props { entry: CustomEntry; category?: CustomCategory; onEdit: () => void; onClose: () => void; }

export default function EntryDetail({ entry, category, onEdit, onClose }: Props) {
  const fields = category?.fields || [];

  return (
    <div className="card relative">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-semibold">{entry.name}</h2>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={onEdit}><Edit3 size={12} /> 编辑</button>
          <button className="btn-ghost text-xs !px-2 !py-1" onClick={onClose}><X size={12} /></button>
        </div>
      </div>
      {entry.images && entry.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-3 mb-4">
          {entry.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.label || entry.name}
              className="w-32 h-24 object-cover rounded-lg border border-[rgb(var(--color-border))]" />
          ))}
        </div>
      )}
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
