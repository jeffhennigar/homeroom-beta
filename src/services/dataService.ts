import { supabase } from './supabaseClient';
import { Widget, Student } from '../types';

export const dataService = {
    // --- Profiles & Settings ---
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateProfile(userId: string, updates: any) {
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ ...updates, id: userId });
            if (error) {
                console.error("Profile update error:", error);
                throw error;
            }
        } catch (e) {
            console.error("dataService.updateProfile failed:", e);
            throw e;
        }
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
        if (slideIndex < 0 || slideIndex >= 25) {
            throw new Error('Maximum of 25 dashboards allowed');
        }
        const { error } = await supabase
            .from('slides')
            .upsert({
                user_id: userId,
                slide_index: slideIndex,
                widgets
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
        const { id, ...rest } = rosterData;
        const payload: any = { ...rest, user_id: userId };

        // Don't send 'default' as a string ID to Supabase (expects UUID)
        if (id && id !== 'default') {
            payload.id = id;
        }

        const { data, error } = await supabase
            .from('rosters')
            .upsert(payload)
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
    },

    // --- Debug ---
    async testConnection(userId: string) {
        // Try to read profiles
        const { error: readError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

        if (readError) return { success: false, error: `Read Error: ${readError.message}` };

        // Try to write access (update timestamp or similar - harmless update)
        const { error: writeError } = await supabase
            .from('profiles')
            .upsert({ id: userId, updated_at: new Date().toISOString() });

        if (writeError) return { success: false, error: `Write Error: ${writeError.message}` };

        return { success: true, error: null };
    }
};
