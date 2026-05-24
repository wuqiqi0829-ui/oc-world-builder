import { useState, useEffect } from 'react';
import { useCategories } from '@/stores/categories';
import { useAutoSave } from '@/hooks/useAutoSave';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Trash2, Check, Loader2, AlertCircle } from 'lucide-react';
import type { CustomEntry, CustomCategory } from '@/lib/database';

interface Props {
  worldId: string;
  categoryId: string;
  entryId: string | null;
  category: CustomCategory | undefined;
  onClose: () => void;
}

export default function EntryEditPanel({ worldId: _worldId, categoryId, entryId, category, onClose }: Props) {
  const { entries, createEntry, updateEntry, removeEntry } = useCategories();
  const isNew = !entryId;
  const existing = entryId ? (entries[categoryId] || []).find((e) => e.id === entryId) : null;
  const customFields = category?.fields || [];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<CustomEntry['images']>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description);
      setImages(existing.images || []);
      setFieldValues(existing.field_values || {});
    } else {
      setName('');
      setDescription('');
      setImages([]);
      setFieldValues({});
      setCreatedId(null);
    }
  }, [existing, entryId]);

  const buildData = () => ({ name, description, images, field_values: fieldValues });

  const doSave = async (data: ReturnType<typeof buildData>) => {
    if (!data.name.trim()) return;
    if (isNew && !createdId) {
      const payload = { ...data, name: data.name.trim(), category_id: categoryId };
      const entry = await createEntry(payload as any);
      setCreatedId(entry.id);
    } else {
      await updateEntry((createdId || entryId)!, data as Partial<CustomEntry>);
    }
  };

  const { status } = useAutoSave(buildData(), doSave);

  const handleDelete = async () => {
    if (entryId) { await removeEntry(entryId); onClose(); }
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
        <input type="text" className="input w-full text-sm" placeholder="条目名称" value={name}
          onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      {customFields.map((field) => (
        <div key={field.key}>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">{field.label || field.key}</label>
          {field.type === 'textarea' ? (
            <textarea className="input w-full text-sm h-20 resize-none" placeholder={field.label}
              value={fieldValues[field.key] || ''}
              onChange={(e) => setFieldValues((v) => ({ ...v, [field.key]: e.target.value }))} />
          ) : (
            <input type={field.type === 'number' ? 'number' : 'text'} className="input w-full text-sm" placeholder={field.label}
              value={fieldValues[field.key] || ''}
              onChange={(e) => setFieldValues((v) => ({ ...v, [field.key]: e.target.value }))} />
          )}
        </div>
      ))}

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">简介</label>
        <RichTextEditor content={description} onChange={setDescription} minHeight="120px" placeholder="条目描述..." />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">配图</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>
    </div>
  );
}
