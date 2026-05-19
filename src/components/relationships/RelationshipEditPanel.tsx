import { useState } from 'react';
import { useRelationships } from '@/stores/relationships';
import type { Character, Organization, Location } from '@/lib/database';
// lucide icons not needed for this panel

const relationTypes = [
  { value: 'friend', label: '亲友' },
  { value: 'enemy', label: '敌对' },
  { value: 'mentor', label: '师徒' },
  { value: 'lover', label: '恋人' },
  { value: 'colleague', label: '同僚' },
  { value: 'belong', label: '所属' },
  { value: 'located', label: '位于' },
  { value: 'other', label: '其他' },
];

interface Props {
  worldId: string;
  characters: Character[];
  organizations: Organization[];
  locations: Location[];
  prefillSourceType?: string;
  prefillSourceId?: string;
  onClose: () => void;
}

export default function RelationshipEditPanel({ worldId, characters, organizations, locations, prefillSourceType, prefillSourceId, onClose }: Props) {
  const { create } = useRelationships();
  const [sourceType, setSourceType] = useState(prefillSourceType || 'character');
  const [sourceId, setSourceId] = useState(prefillSourceId || '');
  const [targetType, setTargetType] = useState('character');
  const [targetId, setTargetId] = useState('');
  const [relationType, setRelationType] = useState('friend');
  const [label, setLabel] = useState('');

  const sourceOptions = sourceType === 'character' ? characters : sourceType === 'organization' ? organizations : locations;
  const targetOptions = targetType === 'character' ? characters : targetType === 'organization' ? organizations : locations;

  const handleSave = async () => {
    if (!sourceId || !targetId) return;
    await create({ world_id: worldId, source_type: sourceType, source_id: sourceId, target_type: targetType, target_id: targetId, relation_type: relationType, label });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">来源</label>
        <div className="flex gap-2 mb-1">
          {['character', 'organization', 'location'].map((t) => (
            <button key={t} className={`text-xs px-2 py-0.5 rounded-full ${sourceType === t ? 'bg-primary-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}
              onClick={() => { setSourceType(t); setSourceId(''); }}>
              {{ character: '人物', organization: '组织', location: '地点' }[t]}
            </button>
          ))}
        </div>
        <select className="input w-full text-sm" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
          <option value="">选择来源...</option>
          {sourceOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-center">
        <div className="text-center">
          <select className="input text-xs" value={relationType} onChange={(e) => setRelationType(e.target.value)}>
            {relationTypes.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">目标</label>
        <div className="flex gap-2 mb-1">
          {['character', 'organization', 'location'].map((t) => (
            <button key={t} className={`text-xs px-2 py-0.5 rounded-full ${targetType === t ? 'bg-primary-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}
              onClick={() => { setTargetType(t); setTargetId(''); }}>
              {{ character: '人物', organization: '组织', location: '地点' }[t]}
            </button>
          ))}
        </div>
        <select className="input w-full text-sm" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="">选择目标...</option>
          {targetOptions.filter((e) => e.id !== sourceId).map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">自定义标签（可选）</label>
        <input type="text" className="input w-full text-sm" placeholder="如：青梅竹马、结拜兄弟..."
          value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>

      <button className="btn-primary text-sm w-full" onClick={handleSave} disabled={!sourceId || !targetId}>
        添加关系
      </button>
    </div>
  );
}
