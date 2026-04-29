/**
 * Clue data structure from configuration file
 */
export interface Clue {
  code: string;
  clue: string;
}

/**
 * Configuration structure for the treasure hunt
 */
export interface ClueConfig {
  huntTitle: string;
  clues: Clue[];
}

/**
 * Unlocked clue with metadata
 */
export interface UnlockedClue {
  code: string;
  clue: string;
  unlockedAt: string; // ISO 8601 timestamp
}

/**
 * Local storage data structure
 */
export interface StorageData {
  unlockedClues: UnlockedClue[];
}
