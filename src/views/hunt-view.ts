export function displayHuntView() {
  const htmlContent = `
    <!-- Burger Menu Button -->
    <button id="burger-menu" class="burger-menu" aria-label="Ouvrir le menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <!-- Side Panel -->
    <aside id="side-panel" class="side-panel">
      <div class="side-panel-content">
        <h2>Chasses disponibles</h2>
        <nav id="hunts-list" class="hunts-list">
          <!-- Hunts will be populated here -->
        </nav>
      </div>
    </aside>
    
    <!-- Overlay for side panel -->
    <div id="panel-overlay" class="panel-overlay"></div>
    
    <header>
      <h1 id="hunt-title"></h1>
      <p class="subtitle">Entrez votre code pour débloquer les indices</p>
    </header>
    
    <main>
      <!-- Code Input Section -->
      <section class="code-section">
        <form id="code-form">
          <label for="code-input" class="visually-hidden">Entrez un code de 5 caractères</label>
          <input 
            type="text" 
            id="code-input" 
            maxlength="5" 
            placeholder="Entrez le code"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            required
          >
          <button type="submit" class="btn-primary">Débloquer l'indice</button>
        </form>
        
        <div id="message" class="message" style="display: none;"></div>
      </section>
      
      <!-- Unlocked Clues Section -->
      <section class="unlocked-section">
        <h2>Vos indices débloqués</h2>
        <div id="unlocked-clues">
          <p class="no-clues">Aucun indice débloqué pour l'instant. Entrez un code pour commencer !</p>
        </div>
      </section>
    </main>
  `;

  document.getElementById('app')!.innerHTML = htmlContent;
}