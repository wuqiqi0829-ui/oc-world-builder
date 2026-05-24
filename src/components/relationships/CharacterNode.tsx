import { Handle, Position } from 'reactflow';
import type { Character } from '@/lib/database';

interface Props {
  data: { character: Character; color: string };
}

export default function CharacterNode({ data }: Props) {
  const { character: c, color } = data;
  const avatarUrl = c.avatar_url || c.images?.[0]?.url || '';
  const initial = c.name?.charAt(0) || '?';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-md"
          style={{ background: avatarUrl ? 'transparent' : `${color}40` }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={c.name} className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: color }}>{initial}</span>
          )}
        </div>
      </div>
      <span className="text-[10px] font-medium mt-2 text-center leading-tight whitespace-nowrap" style={{ maxWidth: 80 }}>
        {c.name}
      </span>
    </div>
  );
}
