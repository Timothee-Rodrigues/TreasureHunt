import { GpsCoordinates } from './types.js';

const GPS_TIMEOUT_MS = 3000; // 3 seconds per attempt
const MAX_RETRIES = 5;

/**
 * Get current GPS position with retry logic
 * 
 * Attempts up to 5 times with 3s timeout each.
 * Returns null if user denies permission or if all attempts fail.
 */
export async function getCurrentPosition(): Promise<GpsCoordinates | null> {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser.');
    return null;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const position = await getPositionWithTimeout(GPS_TIMEOUT_MS);
      
      // Success - return coordinates
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.warn(`GPS attempt ${attempt}/${MAX_RETRIES} failed:`, error);
      
      // If permission denied, stop retrying
      if (error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED) {
        console.warn('GPS permission denied by user.');
        return null;
      }
      
      // If this was the last attempt, give up
      if (attempt === MAX_RETRIES) {
        console.error('GPS failed after all retries.');
        return null;
      }
      
      // Otherwise, continue to next retry
    }
  }
  
  return null;
}

/**
 * Wrapper around navigator.geolocation.getCurrentPosition with timeout
 */
function getPositionWithTimeout(timeoutMs: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('GPS timeout'));
    }, timeoutMs);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0
      }
    );
  });
}
