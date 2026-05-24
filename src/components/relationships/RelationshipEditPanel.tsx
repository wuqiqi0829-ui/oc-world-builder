import { useState, useEffect } from 'react';
import { useRelationships } from '@/stores/relationships';
import type { Character, Relationship } from '@/lib/database';
import { parseLabel, encodeLabel } from '@/lib/labelUtils';


const presetColors = [
  '#7C5CBF', '#E85D75', '#4CAF50', '#5B9BD5',
  '#F4A460', '#EC4899', '#8B5CF6', '#06B6D4',
  '#F97316', '#84CC16', '#999999',
];

interface Props {
  worldId: string;
  characters: Character[];
  prefillSourceId?: string;
  prefillTargetId?: string;
  editData?: {
    sourceId: string;
    targetId: string;
    forward: Relationship;
    backward?: Relationship;
  };
  onClose: () => void;
}

export default function RelationshipEditPanel({ worldId, characters, prefillSourceId, prefillTargetId, editData, onClose }: Props) {
  const { create, update, remove } = useRelationships();
  const isEdit = !!editData;

  const [sourceId, setSourceId] = useState(editData?.sourceId || prefillSourceId || '');
  const [targetId, setTargetId] = useState(editData?.targetId || prefillTargetId || '');

  const fwdParsed = parseLabel(editData?.forward.label || '');
  const [fwdType, setFwdType] = useState(editData?.forward.relation_type || '');
  const [fwdColor, setFwdColor] = useState(fwdParsed.color || presetColors[0]);
  const [fwdOpinion, setFwdOpinion] = useState(fwdParsed.opinion);
  const hasBackward = !!editData?.backward;
  const [reverseEnabled, setReverseEnabled] = useState(hasBackward);
  const bwdParsed = parseLabel(editData?.backward?.label || '');
  const [bwdType, setBwdType] = useState(editData?.backward?.relation_type || '');
  const [bwdColor, setBwdColor] = useState(bwdParsed.color || presetColors[1]);
  const [bwdOpinion, setBwdOpinion] = useState(bwdParsed.opinion);
  const [sharedDetails, setSharedDetails] = useState(fwdParsed.details || bwdParsed.details);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData && !reverseEnabled && editData.backward) {
      remove(editData.backward.id).catch(() => {});
    }
  }, [reverseEnabled]);

  const handleSave = async () => {
    if (!sourceId || !targetId || !fwdType.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await update(editData!.forward.id, {
          source_id: sourceId,
          target_id: targetId,
          relation_type: fwdType.trim(),
          label: encodeLabel(fwdColor, fwdOpinion, sharedDetails),
        } as any);

        if (reverseEnabled && bwdType.trim()) {
          if (editData!.backward) {
            await update(editData!.backward.id, {
              source_id: targetId,
              target_id: sourceId,
              relation_type: bwdType.trim(),
              label: encodeLabel(bwdColor, bwdOpinion, sharedDetails),
            } as any);
          } else {
            await create({
              world_id: worldId, source_type: 'character', source_id: targetId,
              target_type: 'character', target_id: sourceId,
              relation_type: bwdType.trim(),
              label: encodeLabel(bwdColor, bwdOpinion, sharedDetails),
            } as any);
          }
        } else if (editData!.backward) {
          await remove(editData!.backward.id);
        }
      } else {
        await create({
          world_id: worldId, source_type: 'character', source_id: sourceId,
          target_type: 'character', target_id: targetId,
          relation_type: fwdType.trim(),
          label: encodeLabel(fwdColor, fwdOpinion, sharedDetails),
        } as any);

        if (reverseEnabled && bwdType.trim()) {
          await create({
            world_id: worldId, source_type: 'character', source_id: targetId,
            target_type: 'character', target_id: sourceId,
            relation_type: bwdType.trim(),
            label: encodeLabel(bwdColor, bwdOpinion, sharedDetails),
          } as any);
        }
      }
      onClose();
    } catch (e: any) {
      setError(e?.message || '保存失败');
    }
    setSaving(false);
  };

  const colorPicker = (value: string, onChange: (c: string) => void) => (
    <div>
      <div className="flex flex-wrap gap-1 mb-1">
        {presetColors.map((c) => (
          <button key={c}
            className={`w-5 h-5 rounded-full border-2 transition-transform ${value === c ? 'scale-125 border-[rgb(var(--color-text))]' : 'border-transparent hover:scale-110'}`}
            style={{ backgroundColor: c }} onClick={() => onChange(c)} />
        ))}
      </div>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-7 rounded cursor-pointer border border-[rgb(var(--color-border))]" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">来源人物</label>
          <select className="input w-full text-sm" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
            <option value="">选择...</option>
            {characters.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">目标人物</label>
          <select className="input w-full text-sm" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">选择...</option>
            {characters.filter((c) => c.id !== sourceId).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
      </div>

      {/* 正向关系 */}
      <div className="border border-[rgb(var(--color-border))] rounded-lg p-3 space-y-3">
        <span className="text-[10px] font-medium text-primary-500">正向关系 A→B</span>
        <input type="text" className="input w-full text-sm" placeholder="关系名称：如亲友、师徒..."
          value={fwdType} onChange={(e) => setFwdType(e.target.value)} />
        <div>
          <label className="text-[10px] text-[rgb(var(--color-text-secondary))] mb-1 block">颜色</label>
          {colorPicker(fwdColor, setFwdColor)}
        </div>
        <input type="text" className="input w-full text-sm" placeholder="看法/备注（可选）"
          value={fwdOpinion} onChange={(e) => setFwdOpinion(e.target.value)} />
      </div>

      {/* 反向关系开关 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={reverseEnabled}
          onChange={(e) => setReverseEnabled(e.target.checked)}
          className="w-4 h-4 rounded accent-primary-500" />
        <span className="text-xs">同时添加/编辑反向关系 B→A</span>
      </label>

      {reverseEnabled && (
        <div className="border border-[rgb(var(--color-border))] rounded-lg p-3 space-y-3">
          <span className="text-[10px] font-medium text-rose-500">反向关系 B→A</span>
          <input type="text" className="input w-full text-sm" placeholder="反向关系名称"
            value={bwdType} onChange={(e) => setBwdType(e.target.value)} />
          <div>
            <label className="text-[10px] text-[rgb(var(--color-text-secondary))] mb-1 block">颜色</label>
            {colorPicker(bwdColor, setBwdColor)}
          </div>
          <input type="text" className="input w-full text-sm" placeholder="反向看法/备注（可选）"
            value={bwdOpinion} onChange={(e) => setBwdOpinion(e.target.value)} />
        </div>
      )}

      <div>
        <label className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">详细补充</label>
        <textarea className="input w-full text-sm min-h-[100px] resize-y whitespace-pre-wrap" placeholder="补充说明这组关系的背景、细节等（可选）" value={sharedDetails} onChange={(e) => setSharedDetails(e.target.value)} />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-between gap-2">
        <div />
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
          <button className="btn-primary text-sm" onClick={handleSave}
            disabled={saving || !sourceId || !targetId || !fwdType.trim() || (reverseEnabled && !bwdType.trim())}>
            {saving ? '保存中...' : isEdit ? '更新关系' : '添加关系'}
          </button>
        </div>
      </div>
    </div>
  );
}
