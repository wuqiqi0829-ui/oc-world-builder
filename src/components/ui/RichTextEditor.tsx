import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, List, ListOrdered, Quote, Minus, ImageIcon,
  Undo2, Redo2,
} from 'lucide-react';
import clsx from 'clsx';
import { uploadImage } from '@/lib/db';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
}

export default function RichTextEditor({
  content, onChange, placeholder = '开始输入...', minHeight = '200px', readOnly = false, showToolbar = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  // Sync external content changes into the editor (e.g. when editing different item)
  useEffect(() => {
    if (!editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await uploadImage(file, 'editor');
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // silently fail for inline images
      }
    };
    input.click();
  };

  const ToolBtn = ({ active, onClick, children, title }: {
    active?: boolean; onClick: () => void; children: React.ReactNode; title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        'p-1.5 rounded hover:bg-[rgb(var(--color-border))] transition-colors',
        active && 'bg-primary-100 dark:bg-primary-900 text-primary-600'
      )}
    >
      {children}
    </button>
  );

  return (
    <div
      className={clsx(
        'border border-[rgb(var(--color-border))] rounded-input overflow-hidden cursor-text',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent'
      )}
      onClick={() => editor.commands.focus()}
    >
      {!readOnly && showToolbar && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] flex-wrap">
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="加粗">
            <Bold size={16} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="斜体">
            <Italic size={16} />
          </ToolBtn>
          <div className="w-px h-5 bg-[rgb(var(--color-border))] mx-1" />
          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="无序列表">
            <List size={16} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="有序列表">
            <ListOrdered size={16} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="引用">
            <Quote size={16} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分割线">
            <Minus size={16} />
          </ToolBtn>
          <div className="w-px h-5 bg-[rgb(var(--color-border))] mx-1" />
          <ToolBtn onClick={addImage} title="插入图片">
            <ImageIcon size={16} />
          </ToolBtn>
          <div className="w-px h-5 bg-[rgb(var(--color-border))] mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="撤销">
            <Undo2 size={16} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="重做">
            <Redo2 size={16} />
          </ToolBtn>
        </div>
      )}
      <EditorContent editor={editor} style={{ minHeight }} className="p-3" />
    </div>
  );
}
