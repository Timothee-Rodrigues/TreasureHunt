export const config = await loadConfig();

async function loadConfig(): Promise<Config> {
  try {
    const response = await fetch('./config.json');
    if (response.ok) {
      const config = await response.json() as Config;
      return config;
    }
    else {
      throw new Error(`Failed to load config.json: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Failed to load config.json, using defaults:', error);
    throw error;
  }
}

export interface Config {
  apiEndpoint: string;
  syncIntervalSeconds: number;
  fullResyncMinutes: number;
}