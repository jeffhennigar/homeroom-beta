import { dataService } from './dataService';
import { Widget, Student } from '../types';
import LZString from 'lz-string';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'pending';

interface SyncState {
    pendingWrites: Map<string, any>;
    lastSyncTime: number | null;
    status: SyncStatus;
    statusListeners: Set<(newState: SyncManagerState) => void>;
}

export interface SyncManagerState {
    status: SyncStatus;
    pendingCount: number;
    lastSyncTime: number | null;
    rawBytesSaved: number;
    compressedBytesSaved: number;
}

const QUIET_PERIOD_MS = 10000; // 10 seconds of no activity
const MAX_IDLE_PERIOD_MS = 30000; // 30 seconds forced flush

class SyncManagerService {
    private queue: Map<string, { type: 'profile' | 'slide' | 'roster' | 'roster_delete' | 'slide_delete', payload: any, timestamp: number }> = new Map();
    private quietTimer: NodeJS.Timeout | null = null;
    private maxTimer: NodeJS.Timeout | null = null;

    private lastSyncTime: number | null = null;
    private status: SyncStatus = 'idle';
    private statusListeners: Set<(state: SyncManagerState) => void> = new Set();

    // Debug metrics
    private rawBytesSaved: number = 0;
    private compressedBytesSaved: number = 0;

    constructor() {
        // Attempt to sync before the user unloads the page
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                if (this.queue.size > 0) {
                    // SendBeacon is notoriously tricky with custom headers/auth needed by Supabase
                    // We will try a synchronous-ish flush if possible, or trust localstorage handles the rebound
                    this.flushNow();
                }
            });
        }
    }

    // Debug monitor listener
    subscribe(listener: (state: SyncManagerState) => void) {
        this.statusListeners.add(listener);
        this.notifyListeners();
        return () => this.statusListeners.delete(listener);
    }

    private notifyListeners() {
        const state: SyncManagerState = {
            status: this.status,
            pendingCount: this.queue.size,
            lastSyncTime: this.lastSyncTime,
            rawBytesSaved: this.rawBytesSaved,
            compressedBytesSaved: this.compressedBytesSaved
        };
        this.statusListeners.forEach(l => l(state));
    }

    private setStatus(newStatus: SyncStatus) {
        this.status = newStatus;
        this.notifyListeners();
    }

    // Compress large JSON objects
    private compressPayload(data: any): any {
        const jsonString = JSON.stringify(data);
        const compressed = LZString.compressToUTF16(jsonString);

        // Update metrics
        this.rawBytesSaved += jsonString.length * 2; // approx utf16 bytes
        this.compressedBytesSaved += compressed.length * 2;
        this.notifyListeners();

        return { _lz_compressed: compressed };
    }

    // Local Storage Mirroring
    private saveToLocalMirror(key: string, data: any) {
        try {
            localStorage.setItem(`homeroom_mirror_${key}`, JSON.stringify(data));
        } catch (e) { console.error('LocalQuota exceeded', e); }
    }

    public getFromLocalMirror(key: string): any | null {
        try {
            const val = localStorage.getItem(`homeroom_mirror_${key}`);
            return val ? JSON.parse(val) : null;
        } catch (e) { return null; }
    }

    // Add event to debounced queue
    private enqueue(id: string, type: 'profile' | 'slide' | 'roster' | 'roster_delete' | 'slide_delete', payload: any) {
        const now = Date.now();
        this.queue.set(id, { type, payload, timestamp: now });
        this.setStatus('pending');

        // Reset quiet timer
        if (this.quietTimer) clearTimeout(this.quietTimer);
        this.quietTimer = setTimeout(() => this.flushNow(), QUIET_PERIOD_MS);

        // Start max timer if not already running
        if (!this.maxTimer) {
            this.maxTimer = setTimeout(() => {
                this.flushNow();
            }, MAX_IDLE_PERIOD_MS);
        }
    }

    // API Methods
    public async updateProfile(userId: string, updates: any) {
        // 1. Instantly update local mirror
        this.saveToLocalMirror(`profile_${userId}`, updates);
        // 2. Queue for db
        this.enqueue(`profile_${userId}`, 'profile', { userId, updates });
    }

    public async saveSlide(userId: string, slideIndex: number, widgets: Widget[]) {
        // 1. Instantly update local mirror
        this.saveToLocalMirror(`slide_${userId}_${slideIndex}`, widgets);
        // 2. Queue
        this.enqueue(`slide_${userId}_${slideIndex}`, 'slide', { userId, slideIndex, widgets });
    }

    public async saveRoster(userId: string, rosterData: { id?: string; name: string; roster: Student[] }) {
        // Provide a dummy ID instantly if generating local-first
        const processingId = rosterData.id && rosterData.id !== 'default' ? rosterData.id : `temp_${Date.now()}`;
        const payload = { ...rosterData, id: processingId };

        let localRosters = this.getFromLocalMirror(`rosters_${userId}`) || [];
        const idx = localRosters.findIndex((r: any) => r.id === processingId);
        if (idx >= 0) localRosters[idx] = payload;
        else localRosters.push(payload);

        this.saveToLocalMirror(`rosters_${userId}`, localRosters);
        this.enqueue(`roster_${processingId}`, 'roster', { userId, rosterData: payload });
        return payload; // Optimistic return
    }

    public async deleteRoster(userId: string, rosterId: string) {
        let localRosters = this.getFromLocalMirror(`rosters_${userId}`) || [];
        localRosters = localRosters.filter((r: any) => r.id !== rosterId);
        this.saveToLocalMirror(`rosters_${userId}`, localRosters);

        // If it was a 'temp_' ID that never synced, just remove it from queue
        if (rosterId.startsWith('temp_')) {
            this.queue.delete(`roster_${rosterId}`);
            this.notifyListeners();
            return;
        }
        this.enqueue(`del_roster_${rosterId}`, 'roster_delete', { userId, rosterId });
    }

    public async deleteSlide(userId: string, slideIndex: number) {
        localStorage.removeItem(`homeroom_mirror_slide_${userId}_${slideIndex}`);
        this.enqueue(`del_slide_${userId}_${slideIndex}`, 'slide_delete', { userId, slideIndex });
    }

    // Force flush to DB
    public async flushNow() {
        if (this.queue.size === 0) return;

        // Clear timers
        if (this.quietTimer) { clearTimeout(this.quietTimer); this.quietTimer = null; }
        if (this.maxTimer) { clearTimeout(this.maxTimer); this.maxTimer = null; }

        this.setStatus('syncing');

        // Convert map to array and sort to ensure deletes happen before creates just in case of weird conflicts
        const tasks = Array.from(this.queue.entries());
        this.queue.clear(); // Clear immediately so new interacting drops into a new buffer
        this.notifyListeners();

        try {
            for (const [key, task] of tasks) {
                if (task.type === 'profile') {
                    await dataService.updateProfile(task.payload.userId, task.payload.updates);
                }
                else if (task.type === 'slide') {
                    const compressedWidgets = this.compressPayload(task.payload.widgets);
                    await dataService.saveSlide(task.payload.userId, task.payload.slideIndex, compressedWidgets as any);
                }
                else if (task.type === 'roster') {
                    // If the ID was a optimistic temporary UI one, we strip it so supabase makes a UUID. 
                    // If already UUID, we pass it along.
                    const isTempId = task.payload.rosterData.id?.startsWith('temp_');
                    const finalPayload = { ...task.payload.rosterData };
                    if (isTempId) delete finalPayload.id;

                    const compressedRoster = {
                        name: finalPayload.name,
                        roster: this.compressPayload(finalPayload.roster)
                    };
                    // We cast payload to any to bypass the Student[] type check in dataService because we compressed it
                    await dataService.saveRoster(task.payload.userId, compressedRoster as any);
                }
                else if (task.type === 'roster_delete') {
                    await dataService.deleteRoster(task.payload.userId, task.payload.rosterId);
                }
                else if (task.type === 'slide_delete') {
                    await dataService.deleteSlide(task.payload.userId, task.payload.slideIndex);
                }
            }

            this.lastSyncTime = Date.now();
            this.setStatus('idle');
        } catch (e) {
            console.error('SyncManager failed to flush queue:', e);
            // Re-queue the failed tasks!
            tasks.forEach(([key, task]) => {
                if (!this.queue.has(key)) this.queue.set(key, task);
            });
            this.setStatus('error');
        }
    }

    // Expose decompression utility to the App loader
    public decompressPayload(raw: any): any {
        if (raw && typeof raw === 'object' && raw._lz_compressed) {
            try {
                const decompressedString = LZString.decompressFromUTF16(raw._lz_compressed);
                if (decompressedString) return JSON.parse(decompressedString);
            } catch (e) {
                console.error('Failed to decompress LZString payload', e);
                return [];
            }
        }
        return raw; // Already flat or generic fallback
    }

}

export const syncManager = new SyncManagerService();
