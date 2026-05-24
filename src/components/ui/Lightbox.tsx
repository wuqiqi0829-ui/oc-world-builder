import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }: Props) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const goPrev = useCallback(() => {
    onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  }, [currentIndex, images.length, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft') { goPrev(); return; }
      if (e.key === 'ArrowRight') { goNext(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((z) => Math.max(0.5, Math.min(5, z + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.stopPropagation();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = position;
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  }, [zoom]);

  if (!images[currentIndex]) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10" onClick={onClose}>
        <X size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
        <button
          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(0.5, z - 0.5)); }}
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">{(zoom * 100).toFixed(0)}%</span>
        <button
          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(5, z + 0.5)); }}
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      <img
        src={images[currentIndex]}
        alt="预览"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        style={{
          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
          transition: dragging ? 'none' : 'transform 0.15s ease-out',
        }}
        draggable={false}
        onClick={(e) => { e.stopPropagation(); }}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
