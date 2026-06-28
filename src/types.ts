/**
 * Clue data structure from configuration file
 */
export interface Clue {
  sequenceNumber: number;
  code: string;
  description: string;
  imageName?: string;
}

/**
 * Configuration structure for the treasure hunt
 */
export interface Hunt {
  huntNumber: number;
  huntTitle: string;
  themeColor: string;
  clues: Clue[];
}

export interface HuntsConfig {
  version: string;
  hunts: Hunt[];
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
  huntNumber: number; // Hunt this clue belongs to
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
