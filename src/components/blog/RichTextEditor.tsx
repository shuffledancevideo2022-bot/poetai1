import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({ pressed, onPressedChange, children, title }: {
  pressed: boolean;
  onPressedChange: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Toggle
      size="sm"
      pressed={pressed}
      onPressedChange={onPressedChange}
      title={title}
      className="h-8 w-8 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
    >
      {children}
    </Toggle>
  );
}

export function RichTextEditor({ content, onChange, placeholder = 'Начните писать...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto' } }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL ссылки:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL изображения:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-input bg-muted/30">
        <ToolbarButton pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} title="Жирный">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} title="Курсив">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} title="Подчёркнутый">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()} title="Зачёркнутый">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Заголовок 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Заголовок 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('heading', { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Заголовок 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} title="Маркированный список">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} title="Нумерованный список">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} title="Цитата">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive('codeBlock')} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} title="Блок кода">
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} title="По левому краю">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} title="По центру">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} title="По правому краю">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton pressed={editor.isActive('link')} onPressedChange={addLink} title="Ссылка">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton pressed={false} onPressedChange={addImage} title="Изображение">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Разделитель">
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Отменить">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Повторить">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
