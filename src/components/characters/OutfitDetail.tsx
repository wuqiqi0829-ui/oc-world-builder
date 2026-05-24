import { useState, useRef, useEffect } from 'react';
import type { ImageItem } from '@/lib/database';
import Lightbox from '@/components/ui/Lightbox';
import { ArrowLeft } from 'lucide-react';

interface Props {
  groupName: string;
  images: ImageItem[];
  onBack: () => void;
}

function buildSections(images: ImageItem[]) {
  const sections: { title: string; images: ImageItem[] }[] = [];
  const unlabeled: ImageItem[] = [];

  for (const img of images) {
    const tag = img.subGroup || img.label;
    if (tag) {
      const existing = sections.find((s) => s.title === tag);
      if (existing) existing.images.push(img);
      else sections.push({ title: tag, images: [img] });
    } else {
      unlabeled.push(img);
    }
  }

  if (unlabeled.length > 0 || sections.length === 0) {
    sections.unshift({ title: '全部图片', images: unlabeled.length > 0 ? unlabeled : images });
  }

  return sections;
}

export default function OutfitDetail({ groupName, images, onBack }: Props) {
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const sections = buildSections(images);
  const allUrls = images.map((i) => i.url);

  // Wheel-to-scroll horizontal
  useEffect(() => {
    const handlers: { el: HTMLDivElement; fn: (e: WheelEvent) => void }[] = [];
    rowRefs.current.forEach((el) => {
      const fn = (e: WheelEvent) => {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      el.addEventListener('wheel', fn, { passive: false });
      handlers.push({ el, fn });
    });
    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener('wheel', fn));
    };
  }, [sections]);

  const openLightbox = (urls: string[], idx: number) => {
    setLightboxImages(urls);
    setLightboxIdx(idx);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <button
          className="p-1 rounded-btn hover:bg-[rgb(var(--color-border))] flex-shrink-0 mt-0.5"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="font-semibold text-lg text-[rgb(var(--color-text))]">{groupName}</h3>
          <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">共 {images.length} 张图片</p>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 uppercase tracking-wider">
            {section.title}
          </h4>
          <div
            ref={(el) => { if (el) rowRefs.current.set(section.title, el); }}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {section.images.map((img, i) => {
              const globalIdx = allUrls.indexOf(img.url);
              return (
                <div
                  key={i}
                  className="cursor-pointer flex-shrink-0 w-32"
                  onClick={() => openLightbox(allUrls, globalIdx)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]">
                    <img
                      src={img.url}
                      alt={img.label || groupName}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxImages([])}
          onNavigate={setLightboxIdx}
        />
      )}
    </div>
  );
}
