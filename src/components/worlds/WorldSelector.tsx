import { Plus, Globe, Trash2 } from 'lucide-react';
import type { World } from '@/lib/database';
import Card from '@/components/ui/Card';

interface Props {
  worlds: World[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onPreview?: (id: string) => void;
}

export default function WorldSelector({ worlds, onSelect, onNew, onDelete, onPreview }: Props) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">我的世界观</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
            {worlds.length > 0 ? '选择一个世界观进入，或创建新的' : '创建你的第一个世界观'}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={onNew}>
          <Plus size={16} /> 新建世界观
        </button>
      </div>

      {worlds.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe size={36} className="text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">欢迎使用 OC World Builder</h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
              创建你的第一个世界观，开始记录人物、时间线、地图等设定。所有数据自动云端同步。
            </p>
            <button className="btn-primary" onClick={onNew}>创建第一个世界观</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {worlds.map((world) => (
            <div key={world.id} className="group relative">
              <Card hover padding="sm"
                onClick={() => onPreview ? onPreview(world.id) : onSelect(world.id)}
                className="h-full cursor-pointer">
                <div className="aspect-[3/2] rounded-lg bg-[rgb(var(--color-bg))] overflow-hidden mb-3 border border-[rgb(var(--color-border))]">
                  {world.cover_url ? (
                    <img src={world.cover_url} alt={world.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-300">
                      <Globe size={48} />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1">{world.name}</h3>
                {world.description && (
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] line-clamp-2">{world.description}</p>
                )}
                {onPreview && (
                  <button
                    className="btn-primary text-xs w-full mt-2 !py-1"
                    onClick={(e) => { e.stopPropagation(); onSelect(world.id); }}
                  >进入世界观</button>
                )}
              </Card>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1.5 rounded-full bg-white dark:bg-gray-800 shadow text-red-400 hover:text-red-500"
                  onClick={(e) => { e.stopPropagation(); onDelete(world.id); }}
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
