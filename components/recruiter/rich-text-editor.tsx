'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

export function RichTextEditor({ content, onChange }: { content?: string, onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4',
                },
            })
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none'
            }
        },
        immediatelyRender: false, // Fix hydration mismatch in Next.js
    });

    if (!editor) return null;

    return (
        <div className="border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
            <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold">B</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic">I</ToolbarButton>
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="H2">H2</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} label="H3">H3</ToolbarButton>
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet List">• list</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Ordered List">1. list</ToolbarButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}

function ToolbarButton({ children, onClick, isActive, label }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
            {children}
        </button>
    )
}
