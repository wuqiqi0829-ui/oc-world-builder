import type { Note } from '@/lib/database';

interface Props { note: Note }

export default function NotePreview({ note }: Props) {
  return (
    <div>
      <div className="text-xs text-[rgb(var(--color-text-secondary))] mb-3">
        {new Date(note.created_at).toLocaleString('zh-CN')}
        {note.linked_module && <span className="ml-2">关联: {note.linked_module}</span>}
      </div>
      {note.content ? (
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: note.content }} />
      ) : (
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">(空笔记)</p>
      )}
    </div>
  );
}
