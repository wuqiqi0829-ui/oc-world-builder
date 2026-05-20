import { useState, useEffect } from 'react';
import { useCharacters } from '@/stores/characters';
import ImageUploader from '@/components/ui/ImageUploader';
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
  const [images, setImages] = useState<{ url: string; label: string; order: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId) {
      setForm(emptyForm);
      setImages([]);
      setCreatedId(null);
      setSaved(false);
      return;
    }
    const ch = characters.find((c) => c.id === characterId);
    if (ch) {
      setForm({
        name: ch.name || '',
        nickname: ch.nickname || '',
        gender: ch.gender || '',
        age: ch.age || '',
        appearance: ch.appearance || '',
        personality: ch.personality || '',
        background: ch.background || '',
        abilities: ch.abilities || '',
        catchphrase: ch.catchphrase || '',
        occupation: ch.occupation || '',
        faction: ch.faction || '',
      });
      setImages(ch.images || []);
    }
    setSaved(false);
  }, [characterId, characters]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
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
    };

    try {
      if (isNew && !createdId) {
        const ch = await create({ world_id: worldId, ...data });
        setCreatedId(ch.id);
      } else {
        await update((createdId || characterId)!, data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* handle error */ }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="btn-primary text-sm" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? '保存中...' : '保存'}
          </button>
          {saved && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <Check size={14} /> 保存成功
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button className="btn-ghost text-xs text-red-500 flex items-center gap-1" onClick={handleDelete}>
              <Trash2 size={12} /> 删除
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('姓名 *', 'name')}
        {field('昵称', 'nickname')}
        {field('性别', 'gender')}
        {field('年龄', 'age')}
        {field('职业', 'occupation')}
        {field('阵营', 'faction')}
      </div>

      {field('口头禅', 'catchphrase')}

      <div className="space-y-3">
        {field('外貌描述', 'appearance', 'richtext')}
        {field('性格', 'personality', 'richtext')}
        {field('背景故事', 'background', 'richtext')}
        {field('能力设定', 'abilities', 'richtext')}
      </div>

      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">立绘 / 头像 / 参考图</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>
    </div>
  );
}
