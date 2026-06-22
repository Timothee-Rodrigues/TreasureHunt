import { getHuntsConfig } from '../hunts-config.js';
import { init } from '../app.js';

export async function displayUpdateView(): Promise<void> {
  const appElement = document.getElementById('app');
  if (!appElement) {
    console.error('App container not found');
    return;
  }

  const htmlContent = `
    <div class="update-container">
      <div class="update-content">
        <div class="spinner"></div>
        <p class="update-message">Mise à jour des parcours...</p>
      </div>
    </div>
  `;

  appElement.innerHTML = htmlContent;

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
      appElement.innerHTML = `
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
    console.error('Error in displayUpdateView:', error);
    
    // Display error with retry button
    appElement.innerHTML = `
      <div class="update-container">
        <div class="update-content">
          <div style="font-size: 3rem; margin-bottom: 1rem; line-height: 1;">⚠️</div>
          <p class="update-message" style="font-size: 1.1rem; font-weight: 600;">Oups, pas de connexion internet 📡</p>
          <p style="font-size: 0.95rem; color: #999; margin: 0.5rem 0 1.5rem 0; max-width: 300px;">Je peux pas mettre à jour pour le moment...</p>
          <button id="retry-btn" style="
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: opacity 0.2s;
          ">
            Essayer à nouveau
          </button>
        </div>
      </div>
    `;
    
    // Add retry functionality
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        displayUpdateView();
      });
      // Visual feedback on button click
      retryBtn.addEventListener('mousedown', () => {
        retryBtn.style.opacity = '0.7';
      });
      retryBtn.addEventListener('mouseup', () => {
        retryBtn.style.opacity = '1';
      });
    }
  }
}
