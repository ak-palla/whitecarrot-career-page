'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSection(pageId: string, type: string, title?: string) {
    const supabase = await createClient();

    // Get max order
    const { data: maxOrderData } = await supabase
        .from('page_sections')
        .select('order')
        .eq('career_page_id', pageId)
        .order('order', { ascending: false })
        .limit(1)
        .single();

    const nextOrder = (maxOrderData?.order ?? -1) + 1;

    const defaultTitles: Record<string, string> = {
        'about': 'About Us',
        'culture': 'Our Culture',
        'benefits': 'Benefits & Perks',
        'team': 'Meet the Team',
        'values': 'Our Values',
        'custom': 'New Section'
    };

    const { error } = await supabase
        .from('page_sections')
        .insert({
            career_page_id: pageId,
            type,
            title: title || defaultTitles[type] || 'New Section',
            content: '<p>Write something here...</p>',
            order: nextOrder,
            visible: true
        });

    if (error) return { error: error.message };

    revalidatePath('/[companySlug]/edit', 'page');
    return { success: true };
}

export async function updateSection(sectionId: string, updates: any) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('page_sections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sectionId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteSection(sectionId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', sectionId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function getSections(pageId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('career_page_id', pageId)
        .order('order', { ascending: true });

    if (error) return [];
    return data;
}
