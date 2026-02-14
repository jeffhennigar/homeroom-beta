import { Student } from '../types';
import { getRoster } from '../services/storage';
import { DEFAULT_NAMES } from '../constants';

export const getInitialStudents = (): Student[] => {
    const storedNames = getRoster();
    const namesToUse = storedNames && storedNames.length > 0 ? storedNames : DEFAULT_NAMES;

    return namesToUse.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        active: true
    }));
};

// Helper to convert raw names to Student objects
export const createStudentsFromNames = (names: string[]): Student[] => {
    return names.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        active: true
    }));
};
