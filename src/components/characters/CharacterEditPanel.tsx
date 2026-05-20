import { useState, useEffect, useCallback } from 'react';
import { useCharacters } from '@/stores/characters';
import { useAutoSave } from '@/hooks/useAutoSave';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Trash2, Loader2, Check, AlertCircle } from 'lucide-react';

interface Props {
  worldId: string;
  characterId: string | null; // null = create new
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
  const existing = characterId ? characters.find((c) => c.id === characterId) : null;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<{ url: string; label: string; order: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        nickname: existing.nickname || '',
        gender: existing.gender || '',
        age: existing.age || '',
        appearance: existing.appearance || '',
        personality: existing.personality || '',
        background: existing.background || '',
        abilities: existing.abilities || '',
        catchphrase: existing.catchphrase || '',
        occupation: existing.occupation || '',
        faction: existing.faction || '',
      });
      setImages(existing.images || []);
    } else {
      setForm(emptyForm);
      setImages([]);
    }
  }, [existing, characterId]);

  const buildData = useCallback(() => ({
    name: form.name,
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
  }), [form, images]);

  const doSave = useCallback(async (data: ReturnType<typeof buildData>) => {
    const payload = { ...data, name: data.name.trim(), world_id: worldId };
    if (!payload.name) return;
    if (isNew && !createdId) {
      const ch = await create(payload);
      setCreatedId(ch.id);
    } else {
      await update((createdId || characterId)!, data);
    }
  }, [isNew, createdId, characterId, worldId, create, update]);

  const { status } = useAutoSave(buildData(), doSave);

  const handleDelete = async () => {
    if (characterId) {
      await remove(characterId);
      onClose();
    }
  };

  const handleSaveNow = async () => {
    setSaving(true);
    await doSave(buildData());
    setSaving(false);
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
      {/* 保存状态 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {status === 'saving' && <Loader2 size={14} className="animate-spin text-primary-500" />}
          {status === 'saved' && <Check size={14} className="text-green-500" />}
          {status === 'error' && <AlertCircle size={14} className="text-red-500" />}
          <span className="text-[rgb(var(--color-text-secondary))]">
            {status === 'saving' ? '保存中...' : status === 'saved' ? '已自动保存' : status === 'error' ? '保存失败' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button className="btn-ghost text-xs text-red-500 flex items-center gap-1" onClick={handleDelete}>
              <Trash2 size={12} /> 删除
            </button>
          )}
          <button className="btn-primary text-xs" onClick={handleSaveNow} disabled={saving || !form.name.trim()}>
            保存
          </button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-3">
        {field('姓名 *', 'name')}
        {field('昵称', 'nickname')}
        {field('性别', 'gender')}
        {field('年龄', 'age')}
        {field('职业', 'occupation')}
        {field('阵营', 'faction')}
      </div>

      {field('口头禅', 'catchphrase')}

      {/* 富文本区域 */}
      <div className="space-y-3">
        {field('外貌描述', 'appearance', 'richtext')}
        {field('性格', 'personality', 'richtext')}
        {field('背景故事', 'background', 'richtext')}
        {field('能力设定', 'abilities', 'richtext')}
      </div>

      {/* 图片 */}
      <div>
        <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2 block">立绘 / 头像 / 参考图</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>
    </div>
  );
}
