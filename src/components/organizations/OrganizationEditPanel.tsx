import { useState, useEffect } from 'react';
import { useOrganizations } from '@/stores/organizations';
import { useAutoSave } from '@/hooks/useAutoSave';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Trash2, Check, Loader2, AlertCircle } from 'lucide-react';
import type { Organization } from '@/lib/database';

interface Props {
  worldId: string;
  orgId: string | null;
  onClose: () => void;
}

const orgTypes = ['', '国家', '帮派', '公会', '家族', '教会', '学院', '商队', '其他'];

export default function OrganizationEditPanel({ worldId, orgId, onClose }: Props) {
  const { organizations, create, update, remove } = useOrganizations();
  const isNew = !orgId;
  const existing = orgId ? organizations.find((o) => o.id === orgId) : null;

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<Organization['images']>([]);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name); setType(existing.type); setDescription(existing.description);
      setImages(existing.images || []);
    } else {
      setName(''); setType(''); setDescription(''); setImages([]); setCreatedId(null);
    }
  }, [existing, orgId]);

  const buildData = () => ({ name, type, description, images });

  const doSave = async (data: ReturnType<typeof buildData>) => {
    if (!data.name.trim()) return;
    if (isNew && !createdId) {
      const payload = { ...data, name: data.name.trim(), world_id: worldId };
      const org = await create(payload);
      setCreatedId(org.id);
    } else {
      await update((createdId || orgId)!, data as Partial<Organization>);
    }
  };

  const { status } = useAutoSave(buildData(), doSave);

  const handleDelete = async () => {
    if (orgId) { await remove(orgId); onClose(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {status === 'saving' && <Loader2 size={14} className="animate-spin text-primary-500" />}
          {status === 'saved' && <Check size={14} className="text-green-500" />}
          {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
          <span className="text-[rgb(var(--color-text-secondary))]">
            {status === 'saving' ? '保存中...' : status === 'saved' ? '已自动保存' : status === 'error' ? '保存失败' : ''}
          </span>
        </div>
      </div>
      <div className="flex justify-between gap-2">
        {!isNew ? (
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={14} /> 删除
          </button>
        ) : <div />}
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
          <button className="btn-primary text-sm" onClick={onClose}>保存</button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">名称 *</label>
        <input type="text" className="input w-full text-sm" placeholder="组织名称" value={name}
          onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">类型</label>
        <select className="input w-full text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          {orgTypes.map((t) => <option key={t} value={t}>{t || '(未分类)'}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">描述</label>
        <RichTextEditor content={description} onChange={setDescription} minHeight="120px" placeholder="组织描述..." />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">配图</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>
    </div>
  );
}
