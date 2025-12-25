'use client';
import { useState, useEffect } from 'react';
import { getSections, createSection, updateSection, deleteSection } from '@/app/actions/sections';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from './rich-text-editor';
import { Loader2, Plus, Trash2, Eye, EyeOff, GripVertical, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function SectionBuilder({ pageId }: { pageId: string }) {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadSections();
    }, [pageId]);

    async function loadSections() {
        // Don't set loading true here if we want smoother updates, but simpler for now
        // setLoading(true); 
        const data = await getSections(pageId);
        setSections(data || []);
        if (loading) setLoading(false);
    }

    async function handleAdd(type: string) {
        setAdding(true);
        await createSection(pageId, type);
        await loadSections();
        setAdding(false);
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Content Sections</h2>
                <Select disabled={adding} onValueChange={handleAdd}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Add Section" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="about">About Us</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="benefits">Benefits</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="values">Values</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : sections.length === 0 ? (
                <div className="text-center p-12 border border-dashed rounded-lg bg-gray-50 text-muted-foreground">
                    <p>No sections yet. Add one to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sections.map(section => (
                        <SectionItem key={section.id} section={section} onUpdate={loadSections} />
                    ))}
                </div>
            )}
        </div>
    )
}

function SectionItem({ section, onUpdate }: { section: any, onUpdate: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState(section.title);
    const [content, setContent] = useState(section.content);
    const [hasChanges, setHasChanges] = useState(false);

    async function handleSave() {
        setSaving(true);
        await updateSection(section.id, { title, content });
        setSaving(false);
        setHasChanges(false);
        onUpdate();
    }

    async function toggleVisibility() {
        await updateSection(section.id, { visible: !section.visible });
        onUpdate();
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this section?')) return;
        await deleteSection(section.id);
        onUpdate();
    }

    return (
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="flex items-center p-4 gap-3 bg-white">
                <GripVertical className="text-gray-300 cursor-move" size={20} />
                <div className="flex-1 font-medium truncate">{section.title}</div>
                {!section.visible && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Hidden</span>}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={toggleVisibility} title={section.visible ? "Hide" : "Show"}>
                        {section.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete">
                        <Trash2 size={16} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Done' : 'Edit'}
                    </Button>
                </div>
            </div>
            {expanded && (
                <div className="p-4 border-t space-y-4 bg-gray-50/50">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Section Title</label>
                        <Input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setHasChanges(true);
                            }}
                            className="font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        <RichTextEditor
                            content={content}
                            onChange={(html) => {
                                setContent(html);
                                setHasChanges(true);
                            }}
                        />
                    </div>
                    {hasChanges && (
                        <div className="bg-yellow-50 p-2 text-sm text-yellow-700 flex justify-between items-center rounded border border-yellow-100">
                            <span>You have unsaved changes.</span>
                            <Button 
                                size="sm" 
                                onClick={handleSave} 
                                disabled={saving}
                                className="bg-create-company hover:bg-create-company text-black"
                            >
                                {saving ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <Save className="h-3 w-3 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
