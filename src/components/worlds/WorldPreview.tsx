import type { World } from '@/lib/database';

interface Props { world: World }

export default function WorldPreview({ world }: Props) {
  return (
    <div>
      {world.cover_url && (
        <div className="rounded-lg overflow-hidden mb-4 border border-[rgb(var(--color-border))]">
          <img src={world.cover_url} alt={world.name} className="w-full max-h-64 object-cover" />
        </div>
      )}
      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">名称</span>
          <p className="text-sm mt-0.5">{world.name}</p>
        </div>
        {world.description && (
          <div>
            <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">简介</span>
            <p className="text-sm mt-0.5 whitespace-pre-wrap">{world.description}</p>
          </div>
        )}
        <div>
          <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">创建时间</span>
          <p className="text-sm mt-0.5">{new Date(world.created_at).toLocaleString('zh-CN')}</p>
        </div>
      </div>
    </div>
  );
}
