import { HuntsConfig, Clue, Hunt } from './types.js';
import { getUnlockedClues, saveUnlockedClue, isClueUnlocked } from './storage.js';
import { getCurrentPosition } from './geolocation.js';
import { startBackgroundSync } from './sync.js';
import { getCurrentHuntNumber, getHuntsConfig, setCurrentHuntNumber } from './hunts-config.js';
import { displayHuntView } from './views/hunt-view.js';
import { displayErrorView } from './views/error-view.js';

let huntsConfig: HuntsConfig | null = null;
let currentHunt: Hunt | null = null;

/**
 * Apply theme color to the UI
 * Generates lighter and darker variants from the base color
 */
function applyThemeColor(baseColor: string): void {
  const root = document.documentElement;
  
  // Set the primary color
  root.style.setProperty('--primary-color', baseColor);
  
  // Update meta theme-color for browser UI
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', baseColor);
  }
  
  // Generate darker variant (darken by 15%)
  const darker = adjustBrightness(baseColor, -0.15);
  root.style.setProperty('--primary-dark', darker);
  
  // Generate lighter variant (lighten by 20%)
  const lighter = adjustBrightness(baseColor, 0.2);
  root.style.setProperty('--primary-light', lighter);
  
  // Generate shadow/darker variant for button shadows
  const shadow = adjustBrightness(baseColor, -0.35);
  root.style.setProperty('--primary-shadow', shadow);
}

/**
 * Helper function to adjust color brightness
 * @param color - Hex color string
 * @param percent - Adjustment percentage (-1 to 1)
 */
function adjustBrightness(color: string, percent: number): string {
  // Remove '#' if present
  const hex = color.replace('#', '');
  
  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = Math.round(value + 255 * percent);
    return Math.max(0, Math.min(255, adjusted));
  };
  
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);
  
  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Switch to a different hunt
 * @param huntId 
 * @returns 
 */
function switchHunt(huntId: number): void {
  if (!huntsConfig) return;

  const hunt = huntsConfig.hunts.find(h => h.huntNumber === huntId);
  if (hunt) {
    setCurrentHuntNumber(hunt.huntNumber);
    currentHunt = hunt;
    updateHuntTitle();
    applyThemeColor(hunt.themeColor);
    renderUnlockedClues();
    renderHuntsInPanel();
    closeSidePanel();
  }
}

/**
 * Update the hunt title in the UI
 */
function updateHuntTitle(): void {
  if (currentHunt) {
    const titleElement = document.getElementById('hunt-title');
    if (titleElement) {
      titleElement.textContent = currentHunt.huntTitle;
    }
  }
}

/**
 * Find a clue by code (case-insensitive)
 */
function findClueByCode(code: string): Clue | undefined {
  if (!currentHunt) return undefined;
  
  const normalizedInput = code.toUpperCase().trim();
  return currentHunt.clues.find(c => c.code.toUpperCase() === normalizedInput);
}

/**
 * Handle code submission
 */
async function handleCodeSubmit(event: Event): Promise<void> {
  event.preventDefault();
  
  const input = document.getElementById('code-input') as HTMLInputElement;
  const code = input.value.trim();
  
  if (!code) {
    showError('Veuillez entrer un code');
    return;
  }
  
  if (code.length !== 5) {
    showError('Le code doit comporter 5 caractères');
    return;
  }
  
  const clue = findClueByCode(code);
  
  if (clue) {
    // Save
    saveUnlockedClue(clue.code);
    showSuccess(clue.description);
    renderUnlockedClues();
    input.value = ''; // Clear input
  } else {
    // Invalid code
    showError('Code invalide');
    input.value = ''; // Clear input
  }
}

/**
 * Show error message
 */
function showError(message: string): void {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.className = 'message error';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }
}

/**
 * Show success message with clue
 */
function showSuccess(clue: string): void {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.className = 'message success';
    messageDiv.textContent = `🎉 Indice : ${clue}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 10000);
  }
}

/**
 * Render the list of unlocked clues
 */
function renderUnlockedClues(): void {
  const unlockedClues = getUnlockedClues();
  const container = document.getElementById('unlocked-clues');
  
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  if (unlockedClues.length === 0) {
    container.innerHTML = '<p class="no-clues">Aucun indice débloqué pour l\'instant. Entrez un code pour commencer !</p>';
    return;
  }
  
  // Render each unlocked clue
  unlockedClues.forEach((unlockedClue, index) => {
    const clueElement = document.createElement('div');
    clueElement.className = 'unlocked-clue';
    
    const codeElement = document.createElement('div');
    codeElement.className = 'clue-code';
    codeElement.textContent = `Code : ${unlockedClue.code}`;
    
    const textElement = document.createElement('div');
    textElement.className = 'clue-text';
    
    // Look up clue text from config by code
    const clueData = findClueByCode(unlockedClue.code);
    textElement.textContent = clueData?.description || '[Clue not found]';
    
    const timeElement = document.createElement('div');
    timeElement.className = 'clue-time';
    const date = new Date(unlockedClue.unlockedAt);
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    timeElement.textContent = `Débloqué : ${timeStr}`;
    
    clueElement.appendChild(codeElement);
    clueElement.appendChild(textElement);
    clueElement.appendChild(timeElement);
    
    container.appendChild(clueElement);
  });
}

/**
 * Register service worker for offline functionality
 */
async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

/**
 * Toggle the side panel
 */
function toggleSidePanel(): void {
  const sidePanel = document.getElementById('side-panel');
  const burgerMenu = document.getElementById('burger-menu');
  const overlay = document.getElementById('panel-overlay');
  
  if (sidePanel && burgerMenu && overlay) {
    sidePanel.classList.toggle('active');
    burgerMenu.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

/**
 * Close the side panel
 */
function closeSidePanel(): void {
  const sidePanel = document.getElementById('side-panel');
  const burgerMenu = document.getElementById('burger-menu');
  const overlay = document.getElementById('panel-overlay');
  
  if (sidePanel && burgerMenu && overlay) {
    sidePanel.classList.remove('active');
    burgerMenu.classList.remove('active');
    overlay.classList.remove('active');
  }
}

/**
 * Render hunts in the side panel
 */
function renderHuntsInPanel(): void {
  if (!huntsConfig) return;
  
  const huntsList = document.getElementById('hunts-list');
  if (!huntsList) return;
  
  huntsList.innerHTML = '';
  
  huntsConfig.hunts.forEach(hunt => {
    const huntItem = document.createElement('button');
    huntItem.className = 'hunt-item';
    if (currentHunt?.huntNumber === hunt.huntNumber) {
      huntItem.classList.add('active');
    }
    huntItem.textContent = hunt.huntTitle;
    huntItem.addEventListener('click', () => switchHunt(hunt.huntNumber));
    
    huntsList.appendChild(huntItem);
  });
}

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  // Load hunts configuration
  huntsConfig = await getHuntsConfig();
  if (!huntsConfig) {
    displayErrorView('Impossible de charger la configuration de l\'application. C\'est pas bon du tout... Va voir avec Tim 😊');
    return;
  }

  const currentHuntNumber = await getCurrentHuntNumber();

  // If no current hunt is set: take the first hunt as default
  currentHunt = 
    currentHuntNumber !== null
    ? huntsConfig.hunts.find(h => h.huntNumber === currentHuntNumber) ?? huntsConfig.hunts[0]
    : huntsConfig.hunts[0];

  // Check if a hunt was successfully resolved
  if (!currentHunt) {
    displayErrorView('Aucun parcours n\'a pu être chargé... En gros: Va voir avec Tim 😊');
    return;
  }

  // Display hunt view
  displayHuntView();
  switchHunt(currentHunt.huntNumber);

  // Render hunts in the side panel
  renderHuntsInPanel();
  
  // Setup event listeners
  const form = document.getElementById('code-form');
  if (form) {
    form.addEventListener('submit', handleCodeSubmit);
  }
  
  // Setup burger menu
  const burgerMenu = document.getElementById('burger-menu');
  if (burgerMenu) {
    burgerMenu.addEventListener('click', toggleSidePanel);
  }
  
  // Close panel when clicking overlay
  const overlay = document.getElementById('panel-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeSidePanel);
  }
  
  // Add click animation to button
  const submitButton = document.querySelector('.btn-primary') as HTMLButtonElement;
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      submitButton.classList.add('clicked');
      setTimeout(() => {
        submitButton.classList.remove('clicked');
      }, 400);
    });
  }
  
  // Register service worker
  await registerServiceWorker();
  
  // Start background sync to server
  await startBackgroundSync();
  
  // Focus on input
  const input = document.getElementById('code-input') as HTMLInputElement;
  if (input) {
    input.focus();
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
