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

  // Ensure minimum display times
  const viewStartTime = Date.now();
  const MIN_BEFORE_CHECKMARK = 4000; // 4 seconds - minimum before showing checkmark

  // Start loading hunts config from server
  try {
    const huntsConfig = await getHuntsConfig();
    if (huntsConfig) {
      // Calculate how much time has elapsed
      const elapsedTime = Date.now() - viewStartTime;
      const timeBeforeCheckmark = Math.max(0, MIN_BEFORE_CHECKMARK - elapsedTime);

      // Wait until 4 seconds have elapsed before showing checkmark
      if (timeBeforeCheckmark > 0) {
        await new Promise(resolve => setTimeout(resolve, timeBeforeCheckmark));
      }

      // Show check mark
      const appContainer = document.getElementById('app')!;
      appContainer.innerHTML = `
        <div class="update-container">
          <div class="update-content">
            <div class="checkmark">✓</div>
            <p class="update-message">Mise à jour complète !</p>
          </div>
        </div>
      `;

      // Show checkmark for 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));

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
