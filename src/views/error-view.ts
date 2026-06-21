export function getErrorView(message: string): string {
  return `
    <header class="error-header">
      <h1>Erreur</h1>
    </header>
    <main class="error-main">
      <p>${message}</p>
    </main>
  `;
}