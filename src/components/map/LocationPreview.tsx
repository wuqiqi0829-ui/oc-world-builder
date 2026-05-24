import { useState } from 'react';
import type { Location } from '@/lib/database';
import Lightbox from '@/components/ui/Lightbox';

interface Props {
  location: Location;
}

export default function LocationPreview({ location }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const coverImg = location.images?.[0];

  return (
    <div className="text-center">
      {coverImg && (
        <div className="mb-4">
          <div className="cursor-pointer inline-block rounded-card overflow-hidden border border-[rgb(var(--color-border))]"
            onClick={() => setLightboxOpen(true)}>
            <img src={coverImg.url} alt={location.name} className="max-h-72 object-contain" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">名称</span>
          <p className="text-sm mt-0.5">{location.name}</p>
        </div>
        {location.region && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">所属区域</span>
            <p className="text-sm mt-0.5">{location.region}</p>
          </div>
        )}
        {location.category && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">「{location.category}」</p>
          </div>
        )}
      </div>

      {/* 详细介绍 */}
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
          <div className="text-sm whitespace-pre-wrap leading-relaxed text-left">
            {location.description || '暂无详细介绍'}
          </div>
        </div>
      </div>

      {lightboxOpen && coverImg && (
        <Lightbox images={[coverImg.url]} currentIndex={0} onClose={() => setLightboxOpen(false)} onNavigate={() => {}} />
      )}
    </div>
  );
}
