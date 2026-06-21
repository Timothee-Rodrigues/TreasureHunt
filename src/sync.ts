import { UnlockedClue } from './types.js';
import { getUnlockedClues, getUnsyncedClues, markCluesAsSynced, getLastSyncTimestamp, setLastSyncTimestamp } from './storage.js';

let syncIntervalId: number | null = null;
let syncInProgress = false;
let apiEndpoint: string;
let syncIntervalSeconds: number;
let fullResyncMinutes: number;

/**
 * Load configuration from config.json
 */
async function loadConfig(): Promise<void> {
  try {
    const response = await fetch('./config.json');
    if (response.ok) {
      const config = await response.json();
      apiEndpoint = config.apiEndpoint as string;
      syncIntervalSeconds = config.syncIntervalSeconds as number;
      fullResyncMinutes = config.fullResyncMinutes as number;
    }
  } catch (error) {
    console.warn('Failed to load config.json, using defaults:', error);
  }
}

/**
 * Start background sync with periodic retry
 */
export async function startBackgroundSync(): Promise<void> {
  // Load config first
  await loadConfig();
  
  // Clear any existing interval
  if (syncIntervalId !== null) {
    stopBackgroundSync();
  }
  
  // Run first sync immediately
  attemptSync();
  
  // Then start periodic sync
  syncIntervalId = window.setInterval(() => {
    attemptSync();
  }, syncIntervalSeconds * 1000);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', stopBackgroundSync);
  
  console.log(`Background sync started (interval: ${syncIntervalSeconds}s, full resync: ${fullResyncMinutes}min)`);
}

/**
 * Stop background sync
 */
export function stopBackgroundSync(): void {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('Background sync stopped');
  }
}

/**
 * Attempt to sync unlocked clues to the server
 * 
 * Logic:
 * - If last successful sync > 5 minutes ago, send ALL clues (periodic full resync)
 * - Otherwise, send only unsynced clues
 * - On success, mark sent clues as synced and update lastSyncTimestamp
 */
async function attemptSync(): Promise<void> {
  // Prevent concurrent sync attempts
  if (syncInProgress) {
    console.log('Sync already in progress, skipping...');
    return;
  }
  
  try {
    syncInProgress = true;
    
    // Determine which clues to send
    const lastSyncTimestamp = getLastSyncTimestamp();
    const shouldDoFullResync = shouldPerformFullResync(lastSyncTimestamp);
    
    let cluesToSync: UnlockedClue[];
    if (shouldDoFullResync) {
      cluesToSync = getUnlockedClues();
      console.log(`Performing full resync (${cluesToSync.length} clues)`);
    } else {
      cluesToSync = getUnsyncedClues();
      if (cluesToSync.length === 0) {
        // Nothing to sync
        return;
      }
      console.log(`Syncing ${cluesToSync.length} unsynced clue(s)`);
    }
    
    // Take snapshot of codes before sending (to avoid race condition)
    const codesBeingSynced = cluesToSync.map(c => c.code);
    
    // Send to server
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        clues: cluesToSync.map(c => ({
          code: c.code,
          unlockedAt: c.unlockedAt,
          gpsCoordinates: c.gpsCoordinates
        }))
      })
    });
    
    if (response.ok) {
      // Success! Mark these clues as synced
      markCluesAsSynced(codesBeingSynced);
      setLastSyncTimestamp(new Date().toISOString());
      console.log(`✅ Sync successful (${codesBeingSynced.length} clue(s))`);
    } else {
      console.warn(`Sync failed with status ${response.status}, will retry in ${syncIntervalSeconds}s`);
    }
  } catch (error) {
    // Silent failure - will retry on next interval
    console.warn(`Sync error (will retry in ${syncIntervalSeconds}s):`, error);
  } finally {
    syncInProgress = false;
  }
}

/**
 * Check if we should perform a full resync
 */
function shouldPerformFullResync(lastSyncTimestamp: string | null): boolean {
  if (!lastSyncTimestamp) {
    // Never synced before
    return false;
  }
  
  const lastSync = new Date(lastSyncTimestamp);
  const now = new Date();
  const minutesSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);
  
  return minutesSinceLastSync > fullResyncMinutes;
}
