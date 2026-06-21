import { config } from './config.js';
import { HuntsConfig } from './types.js';

const huntsConfigKey = 'huntsConfig';
const huntsConfigVersionKey = 'huntsConfigVersion';
const currentHuntKey = 'currentHunt';

export async function getHuntsConfig(): Promise<HuntsConfig | null> {
  await loadHuntsConfig();
  const cachedConfig = localStorage.getItem(huntsConfigKey);
  return cachedConfig ? JSON.parse(cachedConfig) as HuntsConfig : null;
}

export async function getCurrentHuntNumber(): Promise<number | null> {
  const currentHuntNumber = localStorage.getItem(currentHuntKey);
  return currentHuntNumber ? parseInt(currentHuntNumber) : null;
}

export async function setCurrentHuntNumber(huntNumber: number): Promise<void> {
  localStorage.setItem(currentHuntKey, huntNumber.toString());
}

/**
 * Load hunts configuration from localStorage or server
 * 
 * Returns true if the config changed.
 */
async function loadHuntsConfig(): Promise<boolean> {
  try {
    // Step 1: Check if there is any huntsConfig in localStorage
    const cachedConfig = localStorage.getItem(huntsConfigKey);
    const cachedVersion = localStorage.getItem(huntsConfigVersionKey);

    // Check if there is any cached hunts config in localStorage
    // If there is, check if the version matches the server's version.
    if (cachedConfig && cachedVersion) {
      const infoResponse = await fetch(`${config.apiEndpoint}/info`);
      if (infoResponse.ok) {
        const infoData = await infoResponse.json() as { version: string };
        const remoteVersion = infoData.version;

        if (remoteVersion === cachedVersion) {
          // If the version is the same,
          // keep using cached huntsConfig
          return false;
        }
      }
    }

    // If no cached config or the version is different,
    // fetch the huntsConfig from the server and store it in localStorage
    await fetchHuntsConfigFromServer();
    return true;
  } catch (error) {
    // The server might be unreachable (the app will be used in possible offline areas).
    console.warn('Error loading hunts config:', error);
    return false;
  }
}

async function fetchHuntsConfigFromServer(): Promise<void> { 
  const huntsResponse = await fetch(`${config.apiEndpoint}/hunts`);
  if (huntsResponse.ok) {
    const huntsData = await huntsResponse.json() as HuntsConfig;

    localStorage.setItem(huntsConfigKey, JSON.stringify(huntsData));
    localStorage.setItem(huntsConfigVersionKey, huntsData.version);

    console.log('Fetched and stored hunts config from server. version:', huntsData.version);
  }
  else {
    console.warn('Failed to fetch hunts config from server');
  }
}