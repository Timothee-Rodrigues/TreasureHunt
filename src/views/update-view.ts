import { getHuntsConfig } from '../hunts-config.js';
import { init } from '../app.js';

export async function displayUpdateView(): Promise<void> {
  const htmlContent = `
    <div class="update-container">
      <div class="update-content">
        <div class="spinner"></div>
        <p class="update-message">Mise à jour des parcours...</p>
      </div>
    </div>
  `;

  document.getElementById('app')!.innerHTML = htmlContent;

  // Start loading hunts config from server
  try {
    const huntsConfig = await getHuntsConfig();
    if (huntsConfig) {
      // Successfully loaded, run init with isHuntsConfigUpToDate = true
      // This means we skip version checking and use the loaded config from storage
      await init(true);
    } else {
      throw new Error('Failed to load hunts config');
    }
  } catch (error) {
    console.error('Error loading hunts config:', error);
    const { displayErrorView } = await import('./error-view.js');
    displayErrorView('Impossible de charger la configuration de l\'application. C\'est pas bon du tout... Va voir avec Tim 😊');
  }
}
