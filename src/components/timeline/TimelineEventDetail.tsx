import type { TimelineEvent } from '@/lib/database';
import { Edit3, X } from 'lucide-react';
import Lightbox from '@/components/ui/Lightbox';
import { useState } from 'react';

interface Props { event: TimelineEvent; onEdit: () => void; onClose: () => void; }

export default function TimelineEventDetail({ event, onEdit, onClose }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <div className="card relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{event.title}</h2>
          {event.time_label && <span className="text-sm font-mono text-primary-500">{event.time_label}</span>}
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={onEdit}><Edit3 size={12} /> 编辑</button>
          <button className="btn-ghost text-xs !px-2 !py-1" onClick={onClose}><X size={12} /></button>
        </div>
      </div>

      {event.images && event.images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-3 mb-3">
          {event.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.label || event.title}
              className="w-40 h-24 object-cover rounded-lg border border-[rgb(var(--color-border))] cursor-pointer hover:opacity-80"
              onClick={() => setLightboxIdx(i)} />
          ))}
        </div>
      )}

      {event.description && (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: event.description }} />
      )}

      {lightboxIdx !== null && (
        <Lightbox images={event.images?.map(i => i.url) || []} currentIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)} onNavigate={setLightboxIdx} />
      )}
    </div>
  );
}
