export function displayErrorView(message: string) {
  const htmlContent = `
    <header class="error-header">
      <h1>Erreur</h1>
    </header>
    <main class="error-main">
      <p>${message}</p>
    </main>
  `;

  document.getElementById('app')!.innerHTML = htmlContent;
}