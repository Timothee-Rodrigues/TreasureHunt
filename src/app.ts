import { Config, Clue, Hunt } from './types.js';
import { getUnlockedClues, saveUnlockedClue, isClueUnlocked } from './storage.js';
import { getCurrentPosition } from './geolocation.js';
import { startBackgroundSync } from './sync.js';

let config: Config | null = null;
let currentHunt: Hunt | null = null;

/**
 * Load clues configuration from JSON file
 */
async function loadConfig(): Promise<void> {
  try {
    const response = await fetch('./clues.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    config = await response.json();
    if (!config) {
      throw new Error('Configuration is null or undefined');
    }

    currentHunt = config.hunts[0]; // Assuming the first hunt is the active one
    updateHuntTitle();
    renderUnlockedClues();
  } catch (error) {
    console.error('Error loading clues configuration:', error);
    showError('Failed to load treasure hunt data. Please refresh the page.');
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
    // Valid code found - capture GPS first (non-blocking)
    const gpsCoordinates = await getCurrentPosition();
    
    // Save with GPS coordinates (may be null if GPS failed/denied)
    saveUnlockedClue(clue.code, gpsCoordinates);
    showSuccess(clue.clue);
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
    textElement.textContent = clueData?.clue || '[Clue not found]';
    
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
 * Initialize the application
 */
async function init(): Promise<void> {
  // Load configuration
  await loadConfig();
  
  // Setup event listeners
  const form = document.getElementById('code-form');
  if (form) {
    form.addEventListener('submit', handleCodeSubmit);
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
