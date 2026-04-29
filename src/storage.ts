import { UnlockedClue, StorageData, GpsCoordinates } from './types.js';

const STORAGE_KEY = 'treasureHuntData';
const LAST_SYNC_KEY = 'treasureHuntLastSync';

/**
 * Get all unlocked clues from local storage
 */
export function getUnlockedClues(): UnlockedClue[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed: StorageData = JSON.parse(data);
    return parsed.unlockedClues || [];
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return [];
  }
}

/**
 * Save a newly unlocked clue to local storage
 */
export function saveUnlockedClue(code: string, clue: string, gpsCoordinates?: GpsCoordinates | null): void {
  try {
    const unlockedClues = getUnlockedClues();
    
    // Check if already unlocked
    if (unlockedClues.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      return; // Already unlocked, don't duplicate
    }
    
    const newClue: UnlockedClue = {
      code: code.toUpperCase(),
      clue,
      unlockedAt: new Date().toISOString(),
      gpsCoordinates: gpsCoordinates ?? null,
      synced: false // New clues are not synced yet
    };
    
    unlockedClues.push(newClue);
    
    const data: StorageData = {
      unlockedClues
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
}

/**
 * Check if a clue has already been unlocked
 */
export function isClueUnlocked(code: string): boolean {
  const unlockedClues = getUnlockedClues();
  return unlockedClues.some(c => c.code.toUpperCase() === code.toUpperCase());
}

/**
 * Clear all unlocked clues (for future reset functionality)
 */
export function clearAllClues(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
}

/**
 * Get unsynced clues (synced === false)
 */
export function getUnsyncedClues(): UnlockedClue[] {
  const allClues = getUnlockedClues();
  return allClues.filter(c => !c.synced);
}

/**
 * Mark specific clues as synced
 */
export function markCluesAsSynced(codes: string[]): void {
  try {
    const unlockedClues = getUnlockedClues();
    const upperCodes = codes.map(c => c.toUpperCase());
    
    // Update synced flag for matching codes
    unlockedClues.forEach(clue => {
      if (upperCodes.includes(clue.code.toUpperCase())) {
        clue.synced = true;
      }
    });
    
    const data: StorageData = {
      unlockedClues
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error marking clues as synced:', error);
  }
}

/**
 * Get the timestamp of the last successful sync
 */
export function getLastSyncTimestamp(): string | null {
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error('Error reading last sync timestamp:', error);
    return null;
  }
}

/**
 * Set the timestamp of the last successful sync
 */
export function setLastSyncTimestamp(timestamp: string): void {
  try {
    localStorage.setItem(LAST_SYNC_KEY, timestamp);
  } catch (error) {
    console.error('Error saving last sync timestamp:', error);
  }
}
