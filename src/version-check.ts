import { config } from './config.js';
import { displayUpdateView } from './views/update-view.js';

/**
 * Check if hunts config version has changed on the server
 * Returns true if an update is needed
 */
async function checkHuntsConfigVersion(): Promise<boolean> {
  try {
    const infoResponse = await fetch(`${config.apiEndpoint}/info`);
    if (infoResponse.ok) {
      const infoData = await infoResponse.json() as { version: string };
      const remoteVersion = infoData.version;
      
      const cachedVersion = localStorage.getItem('huntsConfigVersion');
      
      // If we don't have a cached version or it's different from remote, we need to update
      return cachedVersion !== remoteVersion;
    }
    return false;
  } catch (error) {
    console.error('Error checking hunts config version:', error);
    return false;
  }
}

/**
 * Start a background version check (non-blocking)
 * If an update is needed, displays the update view
 */
export function startBackgroundVersionCheck(): void {
  // Fire and forget - don't await
  (async () => {
    try {
      const updateNeeded = await checkHuntsConfigVersion();
      if (updateNeeded) {
        console.log('Update available, displaying update view');
        displayUpdateView();
      }
    } catch (error) {
      console.error('Background version check failed:', error);
    }
  })();
}
