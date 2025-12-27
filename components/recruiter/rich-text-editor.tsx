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
                class: 'min-h-[150px] w-full bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none'
            }
        },
        immediatelyRender: false, // Fix hydration mismatch in Next.js
    });

    if (!editor) return null;

    return (
        <div className="border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring flex flex-col max-h-[300px] sm:max-h-[400px]">
            <div className="flex items-center gap-1 p-1 sm:p-1.5 border-b bg-muted/50 flex-wrap flex-shrink-0">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold">B</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic">I</ToolbarButton>
                <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="H2">H2</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} label="H3">H3</ToolbarButton>
                <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet List">• list</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Ordered List">1. list</ToolbarButton>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
                <div className="h-full">
                    <EditorContent editor={editor} />
                </div>
            </div>
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
