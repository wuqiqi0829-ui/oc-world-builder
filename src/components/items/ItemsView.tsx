import { useEffect, useState } from 'react';
import { useItems } from '@/stores/items';
import type { Item } from '@/lib/database';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { useAutoSave } from '@/hooks/useAutoSave';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Package, Plus, Trash2, Check, Loader2, AlertCircle } from 'lucide-react';

const categories = ['', '武器', '防具', '道具', '魔法物品', '科技装置', '载具', '书籍', '食材', '其他'];

interface Props {
  worldId: string;
  onEdit: (id: string) => void;
  onCreate: () => void;
  editId: string | null;
  onCloseEdit: () => void;
  onPreview?: (id: string) => void;
}

export default function ItemsView({ worldId, onEdit, onCreate, editId, onCloseEdit, onPreview }: Props) {
  const { items, fetch, create, update, remove } = useItems();
  const [form, setForm] = useState({ name: '', category: '', description: '' });
  const [images, setImages] = useState<Item['images']>([]);
  const [attrs, setAttrs] = useState<Item['attributes']>({});
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);

  const existing = editId ? items.find((i) => i.id === editId) : null;
  const isNew = !editId;

  useEffect(() => { fetch(worldId); }, [worldId, fetch]);

  useEffect(() => {
    if (existing) { setForm({ name: existing.name, category: existing.category, description: existing.description }); setImages(existing.images || []); setAttrs(existing.attributes || {}); }
    else { setForm({ name: '', category: '', description: '' }); setImages([]); setAttrs({}); setCreatedId(null); }
  }, [existing, editId]);

  const buildData = () => ({ ...form, images, attributes: attrs });

  const doSave = async (data: ReturnType<typeof buildData>) => {
    if (!data.name.trim()) return;
    if (isNew && !createdId) {
      const payload = { ...data, name: data.name.trim(), world_id: worldId };
      const item = await create(payload as any);
      setCreatedId(item.id);
    } else {
      await update((createdId || editId)!, data as Partial<Item>);
    }
  };

  const { status } = useAutoSave(buildData(), doSave);

  const filtered = items;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">物品图鉴 ({filtered.length})</h3>
        <button className="btn-primary text-xs flex items-center gap-1" onClick={onCreate}>
          <Plus size={12} /> 新建物品
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          {filtered.length === 0 ? (
            <EmptyState icon={<Package size={48} />} title="还没有物品"
              description="记录世界观中的特殊物品、武器、道具" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((item) => (
                <Card key={item.id} hover padding="sm" onClick={() => (onPreview || onEdit)(item.id)}
                  className={editId === item.id ? 'ring-2 ring-primary-500' : ''}>
                  <div className="flex gap-2">
                    {item.images?.[0]?.url && <img src={item.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.name}</h4>
                      {item.category && <span className="text-[10px] text-primary-500">{item.category}</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {(editId || isNew) && (
          <div className="w-72 flex-shrink-0 border-l border-[rgb(var(--color-border))] pl-4 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {status === 'saving' && <Loader2 size={14} className="animate-spin text-primary-500" />}
                {status === 'saved' && <Check size={14} className="text-green-500" />}
                {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
              </div>
              <div className="flex gap-2">
                {!isNew && <button className="btn-ghost text-xs text-red-500" onClick={() => { if (editId) remove(editId); onCloseEdit(); }}><Trash2 size={14} /></button>}
                <button className="btn-ghost text-xs" onClick={onCloseEdit}>关闭</button>
              </div>
            </div>
            <input type="text" className="input w-full text-sm" placeholder="物品名称 *" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            <select className="input w-full text-sm" value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {categories.map((c) => <option key={c} value={c}>{c || '(未分类)'}</option>)}
            </select>
            <RichTextEditor content={form.description} onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              minHeight="100px" placeholder="物品描述..." />
            <div>
              <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">自定义属性</label>
              <div className="flex gap-1 mb-2">
                <input type="text" className="input flex-1 text-xs" placeholder="属性名" value={attrKey}
                  onChange={(e) => setAttrKey(e.target.value)} />
                <input type="text" className="input flex-1 text-xs" placeholder="值" value={attrVal}
                  onChange={(e) => setAttrVal(e.target.value)} />
                <button className="btn-ghost text-xs !px-2" onClick={() => { if (attrKey) { setAttrs({ ...attrs, [attrKey]: attrVal }); setAttrKey(''); setAttrVal(''); } }}>
                  <Plus size={14} /></button>
              </div>
              {Object.entries(attrs).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1 text-xs mb-1">
                  <span className="text-[rgb(var(--color-text-secondary))]">{k}:</span>
                  <span>{v}</span>
                  <button className="ml-auto text-red-400" onClick={() => { const { [k]: _, ...rest } = attrs; setAttrs(rest); }}>×</button>
                </div>
              ))}
            </div>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        )}
      </div>
    </div>
  );
}
