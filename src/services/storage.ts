import { Student } from '../types';

export const ROSTER_STORAGE_KEY = 'homeroom_roster';

export const getRoster = (): Student[] | null => {
    try {
        const stored = localStorage.getItem(ROSTER_STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        // Migration check: if array of strings, convert to objects
        if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
            return parsed.map(name => ({
                id: Math.random().toString(36).substr(2, 9),
                name,
                active: true
            }));
        }
        return parsed;
    } catch (e) {
        console.error("Failed to load roster", e);
        return null;
    }
};

export const saveRoster = (roster: Student[]): void => {
    try {
        localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
    } catch (e) {
        console.error("Failed to save roster", e);
    }
};

export const hasRoster = (): boolean => {
    return !!localStorage.getItem(ROSTER_STORAGE_KEY);
};
