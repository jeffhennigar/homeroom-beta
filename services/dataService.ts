import { supabase } from './supabaseClient';
import { Widget, Student } from '../types';

export const dataService = {
    // --- Profiles & Settings ---
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateProfile(userId: string, updates: any) {
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() });
        if (error) throw error;
    },

    // --- Slides ---
    async getSlides(userId: string) {
        const { data, error } = await supabase
            .from('slides')
            .select('*')
            .eq('user_id', userId)
            .order('slide_index', { ascending: true });
        if (error) throw error;
        return data;
    },

    async saveSlide(userId: string, slideIndex: number, widgets: Widget[]) {
        const { error } = await supabase
            .from('slides')
            .upsert({
                user_id: userId,
                slide_index: slideIndex,
                widgets,
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id,slide_index' });
        if (error) throw error;
    },

    async deleteSlide(userId: string, slideIndex: number) {
        const { error } = await supabase
            .from('slides')
            .delete()
            .eq('user_id', userId)
            .eq('slide_index', slideIndex);
        if (error) throw error;
    },

    // --- Rosters ---
    async getRosters(userId: string) {
        const { data, error } = await supabase
            .from('rosters')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    },

    async saveRoster(userId: string, rosterData: { id?: string; name: string; roster: Student[] }) {
        const { data, error } = await supabase
            .from('rosters')
            .upsert({
                user_id: userId,
                ...rosterData
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteRoster(userId: string, rosterId: string) {
        const { error } = await supabase
            .from('rosters')
            .delete()
            .eq('user_id', userId)
            .eq('id', rosterId);
        if (error) throw error;
    }
};
