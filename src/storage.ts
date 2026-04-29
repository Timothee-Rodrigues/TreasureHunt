import { UnlockedClue, StorageData } from './types.js';

const STORAGE_KEY = 'treasureHuntData';

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
export function saveUnlockedClue(code: string, clue: string): void {
  try {
    const unlockedClues = getUnlockedClues();
    
    // Check if already unlocked
    if (unlockedClues.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      return; // Already unlocked, don't duplicate
    }
    
    const newClue: UnlockedClue = {
      code: code.toUpperCase(),
      clue,
      unlockedAt: new Date().toISOString()
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
