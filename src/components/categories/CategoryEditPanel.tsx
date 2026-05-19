import { useState, useEffect } from 'react';
import { useCategories } from '@/stores/categories';
import type { CustomField } from '@/lib/database';
import { Trash2, Plus, X } from 'lucide-react';

interface Props {
  worldId: string;
  categoryId: string | null;
  onClose: () => void;
}

export default function CategoryEditPanel({ worldId, categoryId, onClose }: Props) {
  const { categories, createCategory, updateCategory, removeCategory } = useCategories();
  const isNew = !categoryId;
  const existing = categoryId ? categories.find((c) => c.id === categoryId) : null;

  const [name, setName] = useState('');
  const [fields, setFields] = useState<CustomField[]>([]);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setFields(existing.fields || []);
    } else {
      setName('');
      setFields([]);
    }
  }, [existing, categoryId]);

  const addField = () => {
    setFields((f) => [...f, { key: `field_${Date.now()}`, label: '', type: 'text' }]);
  };

  const updateField = (index: number, changes: Partial<CustomField>) => {
    setFields((f) => f.map((fd, i) => (i === index ? { ...fd, ...changes } : fd)));
  };

  const removeField = (index: number) => {
    setFields((f) => f.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (isNew) {
      await createCategory({ world_id: worldId, name: name.trim(), fields });
    } else {
      await updateCategory(categoryId, { name: name.trim(), fields });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (categoryId) { await removeCategory(categoryId); onClose(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{isNew ? '新建分类' : '编辑分类'}</h3>
        {!isNew && (
          <button className="btn-ghost text-xs text-red-500 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={12} /> 删除
          </button>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">分类名称 *</label>
        <input type="text" className="input w-full text-sm" placeholder="如：职业、势力、种族..."
          value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">自定义字段</label>
          <button className="btn-ghost text-xs !px-2 !py-1 flex items-center gap-1" onClick={addField}>
            <Plus size={12} /> 添加
          </button>
        </div>
        <div className="space-y-2">
          {fields.length === 0 && (
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">暂无自定义字段，点击添加如：技能、等级、外貌特征等</p>
          )}
          {fields.map((field, i) => (
            <div key={field.key} className="flex items-center gap-2">
              <input type="text" className="input flex-1 text-xs" placeholder="字段名" value={field.label}
                onChange={(e) => updateField(i, { label: e.target.value })} />
              <select className="input w-20 text-xs" value={field.type}
                onChange={(e) => updateField(i, { type: e.target.value as CustomField['type'] })}>
                <option value="text">文本</option>
                <option value="textarea">长文本</option>
                <option value="number">数字</option>
              </select>
              <button className="p-1 text-[rgb(var(--color-text-secondary))] hover:text-red-500" onClick={() => removeField(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary text-sm w-full" onClick={handleSave} disabled={!name.trim()}>
        {isNew ? '创建分类' : '保存修改'}
      </button>
    </div>
  );
}
