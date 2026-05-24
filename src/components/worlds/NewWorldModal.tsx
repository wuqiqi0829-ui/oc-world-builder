import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { uploadImage } from '@/lib/db';
import { Loader2, Upload, X, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; cover_url: string }) => Promise<void>;
  onDelete?: () => void;
  initialData?: { name: string; description: string; cover_url: string };
}

export default function NewWorldModal({ open, onClose, onSave, onDelete, initialData }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setCoverUrl(initialData.cover_url);
    } else {
      setName('');
      setDescription('');
      setCoverUrl('');
    }
  }, [initialData, open]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'covers');
      setCoverUrl(url);
    } catch (err) {
      setError('封面上传失败: ' + (err as Error).message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('请输入世界观名称'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), description, cover_url: coverUrl });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? '编辑世界观' : '新建世界观'} maxWidth="max-w-3xl" maxHeight="max-h-[95vh]">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">
            名称 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="input w-full"
            placeholder="给你的世界观起个名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">
            封面图
          </label>
          {coverUrl ? (
            <div className="relative rounded-card overflow-hidden bg-[rgb(var(--color-bg))]">
              <img src={coverUrl} alt="封面" className="w-full h-64 object-cover" />
              <button
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                onClick={() => setCoverUrl('')}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[rgb(var(--color-border))] rounded-card cursor-pointer hover:border-primary-400 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              {uploading ? (
                <Loader2 size={24} className="animate-spin text-primary-500" />
              ) : (
                <>
                  <Upload size={24} className="text-[rgb(var(--color-text-secondary))] mb-1" />
                  <span className="text-xs text-[rgb(var(--color-text-secondary))]">点击上传</span>
                </>
              )}
            </label>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1 block">
            简介
          </label>
          <textarea
            className="input w-full h-32 resize-none"
            placeholder="简单描述这个世界的背景和特色..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-input">{error}</p>
        )}

        <div className="flex justify-between gap-2 pt-2">
          {isEdit && onDelete ? (
            <button className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1" onClick={onDelete}>
              <Trash2 size={14} /> 删除
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button className="btn-ghost text-sm" onClick={onClose} disabled={saving}>取消</button>
            <button className="btn-primary text-sm flex items-center gap-2" onClick={handleSave} disabled={saving || uploading}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? '保存' : '创建'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
