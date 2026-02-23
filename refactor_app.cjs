const fs = require('fs');

try {
    let content = fs.readFileSync('src/App.tsx', 'utf8');

    // 1. Swap import
    content = content.replace("import { dataService } from './services/dataService';", "import { syncManager } from './services/SyncManager';\nimport { dataService } from './services/dataService';");

    // 2. Modify `syncToCloud` to use syncManager and remove timeout
    // We replace the wait dataService calls
    content = content.replace(/await dataService\.saveSlide\(/g, "syncManager.saveSlide(");

    // For roster, syncManager.saveRoster is async but we don't need to await it for the UI if we trust the optimistic ID
    content = content.replace(/const updated = await dataService\.saveRoster\(user\.id, r\);/g, "const updated = await syncManager.saveRoster(user.id, r);");

    content = content.replace(/await dataService\.updateProfile\(/g, "syncManager.updateProfile(");

    // Remove the 10s timeout in the syncToCloud useEffect:
    const timeoutStringRegex = /const timer = setTimeout\(syncToCloud, 10000\);\s*\/\/ 10s Debounce\s*return \(\) => clearTimeout\(timer\);/g;
    content = content.replace(timeoutStringRegex, "syncToCloud();");

    // 3. Decompress fetches
    content = content.replace(/const slides = await dataService\.getSlides\(user\.id\);/g, "const rawSlides = await dataService.getSlides(user.id);\n                const slides = rawSlides ? rawSlides.map(s => ({ ...s, widgets: syncManager.decompressPayload(s.widgets) })) : [];");

    content = content.replace(/const cloudRosters = await dataService\.getRosters\(user\.id\);/g, "const rawRosters = await dataService.getRosters(user.id);\n                const cloudRosters = rawRosters ? rawRosters.map(r => ({ ...r, roster: syncManager.decompressPayload(r.roster) })) : [];");

    // We also need to hook tracking SyncManager status so UI shows "Saved" vs "Syncing"
    // Find the state declarations and inject ours
    const stateHookStr = "const [isSyncing, setIsSyncing] = useState(false);";
    const syncHookStr = `const [isSyncing, setIsSyncing] = useState(false);
    const [syncStats, setSyncStats] = useState({ pending: 0, raw: 0, comp: 0, lastSync: null });
    
    useEffect(() => {
        return syncManager.subscribe((state) => {
            setIsSyncing(state.status === 'syncing' || state.status === 'pending');
            setSyncStats({ pending: state.pendingCount, raw: state.rawBytesSaved, comp: state.compressedBytesSaved, lastSync: state.lastSyncTime });
        });
    }, []);`;

    if (content.includes(stateHookStr) && !content.includes('syncStats')) {
        content = content.replace(stateHookStr, syncHookStr);
    }

    fs.writeFileSync('src/App.tsx', content);
    console.log("App.tsx refactored successfully.");
} catch (e) {
    console.error(e);
}
