import { useState, useEffect, useMemo } from 'react';
import { useTables } from '@/stores/tables';
import { supabase } from '@/lib/supabase';
import ImageUploader from '@/components/ui/ImageUploader';
import type { ImageItem } from '@/lib/database';
import { Trash2, Loader2, Search } from 'lucide-react';

interface Props {
  worldId: string;
  tableId: string | null;
  onClose: () => void;
}

const categories = ['单人表格', '双人表格', '多人表格', '其他表格'];

export default function TableEditPanel({ worldId, tableId, onClose }: Props) {
  const { tables, create, update, remove } = useTables();
  const isNew = !tableId;
  const existing = tableId ? tables.find((t) => t.id === tableId) : null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [charSearch, setCharSearch] = useState('');

  // All characters across all worlds
  const [allChars, setAllChars] = useState<{ id: string; name: string; world_id: string }[]>([]);

  useEffect(() => {
    supabase.from('characters').select('id,name,world_id').then(({ data }) => {
      if (data) setAllChars(data as any);
    });
  }, []);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title || '');
      setCategory(existing.category || categories[0]);
      setImages(existing.images || []);
      setLinkedIds(existing.linked_characters || []);
    } else {
      setTitle('');
      setCategory(categories[0]);
      setImages([]);
      setLinkedIds([]);
      setCreatedId(null);
    }
  }, [existing, tableId]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (isNew && !createdId) {
        const item = await create({ world_id: worldId, title: title.trim(), category, images, linked_characters: linkedIds } as any);
        setCreatedId(item.id);
      } else {
        await update((createdId || tableId)!, { title: title.trim(), category, images, linked_characters: linkedIds } as any);
      }
      setSaved(true);
      setError('');
      setTimeout(() => { setSaved(false); onClose(); }, 800);
    } catch (e: any) {
      setError(e?.message || '保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (tableId) { await remove(tableId); onClose(); }
  };

  const toggleChar = (id: string) => {
    setLinkedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filteredChars = useMemo(() => {
    if (!charSearch.trim()) return allChars;
    const q = charSearch.trim().toLowerCase();
    return allChars.filter((ch) => ch.name.toLowerCase().includes(q));
  }, [allChars, charSearch]);

  return (
    <div className="space-y-4">
      <div>
        {saved && <span className="text-xs text-green-500 font-medium">保存成功</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">图片</label>
        <ImageUploader images={images} onChange={setImages} maxImages={1} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">标题 *</label>
          <input type="text" className="input w-full text-sm" placeholder="输入标题" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">分类</label>
          <select className="input w-full text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="border-t border-[rgb(var(--color-border))] pt-4 space-y-3">
        <span className="text-[10px] font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">关联人物（跨世界观）</span>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
          <input type="text" className="input text-xs pl-8 pr-3 py-1.5 w-full" placeholder="搜索人物..."
            value={charSearch} onChange={(e) => setCharSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
          {filteredChars.map((ch) => {
            const sel = linkedIds.includes(ch.id);
            return (
              <button key={ch.id}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${sel ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-700 dark:text-primary-300' : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-primary-300'}`}
                onClick={() => toggleChar(ch.id)}
              >
                {ch.name}
              </button>
            );
          })}
          {charSearch && filteredChars.length === 0 && (
            <p className="text-xs text-[rgb(var(--color-text-secondary))] w-full text-center py-2">没有匹配的人物</p>
          )}
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
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> 保存中...</> : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
