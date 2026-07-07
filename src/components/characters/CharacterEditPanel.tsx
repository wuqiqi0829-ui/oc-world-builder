import { useState, useEffect } from 'react';
import { useCharacters } from '@/stores/characters';
import OutfitImageUploader from '@/components/ui/OutfitImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Trash2, Check } from 'lucide-react';

interface Props {
  worldId: string;
  characterId: string | null;
  onClose: () => void;
}

const emptyForm = {
  name: '',
  nickname: '',
  gender: '',
  age: '',
  appearance: '',
  personality: '',
  background: '',
  abilities: '',
  catchphrase: '',
  occupation: '',
  faction: '',
};

export default function CharacterEditPanel({ worldId, characterId, onClose }: Props) {
  const { characters, create, update, remove } = useCharacters();
  const isNew = !characterId;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<{ url: string; label: string; order: number; subGroup?: string }[]>([]);
  const [outfitDescs, setOutfitDescs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId) {
      setForm(emptyForm);
      setImages([]);
      setOutfitDescs({});
      setCreatedId(null);
      setSaved(false);
      return;
    }
    const ch = characters.find((c) => c.id === characterId);
    if (ch) {
      const combined = [ch.appearance, ch.personality, ch.background, ch.abilities]
        .filter(Boolean)
        .join('<p></p>');
      setForm({
        name: ch.name || '',
        nickname: ch.nickname || '',
        gender: ch.gender || '',
        age: ch.age || '',
        appearance: '',
        personality: '',
        background: combined,
        abilities: '',
        catchphrase: ch.catchphrase || '',
        occupation: ch.occupation || '',
        faction: ch.faction || '',
      });
      setImages(ch.images || []);
      setOutfitDescs(ch.outfit_descriptions || {});
    }
    setSaved(false);
  }, [characterId, characters]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setSaveError('请输入姓名');
      return;
    }
    setSaving(true);
    setSaveError('');
    const data = {
      name: form.name.trim(),
      nickname: form.nickname,
      gender: form.gender,
      age: form.age,
      appearance: form.appearance,
      personality: form.personality,
      background: form.background,
      abilities: form.abilities,
      catchphrase: form.catchphrase,
      occupation: form.occupation,
      faction: form.faction,
      images,
      outfit_descriptions: outfitDescs,
    };

    try {
      if (isNew && !createdId) {
        const ch = await create({ world_id: worldId, ...data });
        setCreatedId(ch.id);
      } else {
        await update((createdId || characterId)!, data);
      }
      setSaved(true);
      setSaveError('');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setSaveError(e?.message || String(e) || '保存失败');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (characterId) { await remove(characterId); onClose(); }
  };

  const field = (label: string, key: keyof typeof form, type: 'input' | 'richtext' = 'input') => (
    <div>
      <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">{label}</label>
      {type === 'input' ? (
        <input
          type="text"
          className="input w-full text-sm"
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ) : (
        <RichTextEditor
          content={form[key]}
          onChange={(html) => setForm((f) => ({ ...f, [key]: html }))}
          minHeight="120px"
          placeholder={`输入${label}...`}
          showToolbar={false}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {saved && (
        <div className="flex items-center gap-2">
          <Check size={14} className="text-green-500" />
          <span className="text-xs text-green-500">保存成功</span>
        </div>
      )}
      {saveError && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{saveError}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {field('姓名 *', 'name')}
        {field('昵称', 'nickname')}
        {field('性别', 'gender')}
        {field('年龄', 'age')}
        {field('职业', 'occupation')}
        {field('阵营', 'faction')}
      </div>

      {field('简介', 'catchphrase')}

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">人物介绍</label>
        <RichTextEditor
          content={form.background}
          onChange={(html) => setForm((f) => ({ ...f, background: html, appearance: '', personality: '', abilities: '' }))}
          minHeight="200px"
          placeholder="外貌、性格、背景、能力..."
          showToolbar={false}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">服设</label>
        <OutfitImageUploader images={images} onChange={setImages} outfitDescriptions={outfitDescs} onDescriptionsChange={setOutfitDescs} />
      </div>

      <div className="flex justify-between gap-2 pt-4 pb-2 border-t border-[rgb(var(--color-border))]">
        {!isNew ? (
          <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={handleDelete}>
            <Trash2 size={14} /> 删除
          </button>
        ) : <div />}
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
          <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
