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
 * GPS coordinates
 */
export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Unlocked clue with metadata
 * 
 * Note: Clue text is not stored - it's looked up from config by code
 */
export interface UnlockedClue {
  code: string;
  unlockedAt: string; // ISO 8601 timestamp
  gpsCoordinates?: GpsCoordinates | null; // Optional GPS location when unlocked
  synced: boolean; // Whether this clue has been synced to the server
}

/**
 * Local storage data structure
 */
export interface StorageData {
  unlockedClues: UnlockedClue[];
}
