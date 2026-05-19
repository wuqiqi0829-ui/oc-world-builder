import { useState, useRef, useCallback, useEffect } from 'react';
import type { Location } from '@/lib/database';
import { useLocations } from '@/stores/locations';
import { uploadImage } from '@/lib/db';
import { Map, Plus, Upload, MapPin, Filter, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const markerColors: Record<string, string> = {
  '': '#7C5CBF',
  '城市': '#E85D75',
  '自然': '#4CAF50',
  '遗迹': '#FF9800',
  '军事': '#607D8B',
  '其他': '#9C27B0',
};

interface Props {
  locations: Location[];
  onCreate: (x: number, y: number) => void;
  onEdit: (id: string) => void;
  worldId: string;
}

export default function MapView({ locations, onCreate, onEdit, worldId }: Props) {
  const { mapImageUrl, setMapImageUrl, update } = useLocations();
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`oc-map-${worldId}`);
    if (saved) setMapImageUrl(saved);
  }, [worldId, setMapImageUrl]);

  const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'maps');
      setMapImageUrl(url);
      localStorage.setItem(`oc-map-${worldId}`, url);
    } catch { /**/ }
    setUploading(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current || !mapImageUrl || draggingId) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onCreate(x, y);
  };

  const handleMarkerDrag = useCallback(async (id: string, e: React.MouseEvent) => {
    if (!mapRef.current) return;
    e.stopPropagation();
    setDraggingId(id);

    const onMove = (ev: MouseEvent) => {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, Math.round((ev.clientX - rect.left) / rect.width * 100)));
      const y = Math.max(0, Math.min(100, Math.round((ev.clientY - rect.top) / rect.height * 100)));
      const el = document.getElementById(`marker-${id}`);
      if (el) { el.style.left = `${x}%`; el.style.top = `${y}%`; }
    };

    const onUp = (ev: MouseEvent) => {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, Math.round((ev.clientX - rect.left) / rect.width * 100)));
      const y = Math.max(0, Math.min(100, Math.round((ev.clientY - rect.top) / rect.height * 100)));
      update(id, { map_x: x, map_y: y } as Partial<Location>);
      setDraggingId(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [update]);

  const filtered = activeFilter ? locations.filter((l) => l.category === activeFilter) : locations;
  const categories = [...new Set(locations.map((l) => l.category).filter(Boolean))].sort();

  if (!mapImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6">
          <Map size={40} className="text-primary-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">上传世界观地图</h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6 text-center max-w-xs">
          上传一张你的世界观地图底图，然后点击地图添加地点标记
        </p>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleMapUpload}
        />
        <button className="btn-primary text-sm flex items-center gap-2" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
          <Upload size={16} />
          {uploading ? '上传中...' : '上传地图底图'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Map area */}
      <div className="flex-1 min-h-[400px]">
        <div className="flex items-center gap-2 mb-2">
          {categories.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Filter size={14} className="text-[rgb(var(--color-text-secondary))]" />
              <button
                className={clsx('text-xs px-2 py-0.5 rounded-full', !activeFilter ? 'bg-primary-500 text-white' : 'bg-[rgb(var(--color-border))]')}
                onClick={() => setActiveFilter('')}
              >
                全部
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={clsx('text-xs px-2 py-0.5 rounded-full text-white')}
                  style={{ backgroundColor: activeFilter === c ? (markerColors[c] || '#7C5CBF') : `${markerColors[c] || '#7C5CBF'}80` }}
                  onClick={() => setActiveFilter(activeFilter === c ? '' : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <button
            className="btn-ghost text-xs !px-2 !py-1"
            onClick={() => { setMapImageUrl(''); localStorage.removeItem(`oc-map-${worldId}`); }}
          >
            更换底图
          </button>
        </div>

        <div
          ref={mapRef}
          className="relative rounded-card overflow-hidden border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]"
          style={{ aspectRatio: '16/10' }}
          onClick={handleMapClick}
        >
          <img src={mapImageUrl} alt="世界地图" className="w-full h-full object-contain" draggable={false} />
          {filtered.map((loc) => (
            <div
              key={loc.id}
              id={`marker-${loc.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{ left: `${loc.map_x}%`, top: `${loc.map_y}%` }}
              onMouseDown={(e) => handleMarkerDrag(loc.id, e)}
              onClick={(e) => { if (!draggingId) { e.stopPropagation(); onEdit(loc.id); } }}
              onMouseEnter={() => setHoveredId(loc.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <MapPin
                size={24}
                fill={markerColors[loc.category] || '#7C5CBF'}
                color="#fff"
                className="drop-shadow-md hover:scale-125 transition-transform"
              />
              {(hoveredId === loc.id) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[rgb(var(--color-surface))] shadow-lg rounded-card px-2 py-1 text-xs whitespace-nowrap z-20 pointer-events-none">
                  {loc.name}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1 text-center">
          点击地图空白处添加标记 · 拖拽标记调整位置 · 点击标记编辑详情
        </p>
      </div>

      {/* Location list sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">地点列表 ({filtered.length})</h3>
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={() => onCreate(50, 50)}>
            <Plus size={12} /> 新增
          </button>
        </div>
        <div className="space-y-1 max-h-[400px] lg:max-h-full overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-[rgb(var(--color-text-secondary))] px-2 py-4 text-center">暂无地点</p>
          ) : (
            filtered.map((loc) => (
              <button
                key={loc.id}
                className="flex items-center gap-2 w-full px-2.5 py-2 rounded-btn text-sm text-left hover:bg-[rgb(var(--color-border))] transition-colors"
                onClick={() => onEdit(loc.id)}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: markerColors[loc.category] || '#7C5CBF' }} />
                <span className="truncate flex-1">{loc.name}</span>
                <ChevronRight size={14} className="text-[rgb(var(--color-text-secondary))] flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
