# Deployment & Testing Guide

## ✅ Implementation Complete

All features from PRD 001 have been successfully implemented!

## Quick Test Guide

### 1. Start the Development Server

The server is currently running at:
- **Local**: http://127.0.0.1:8080
- **Network**: http://10.27.109.81:8080

If you need to restart it:
```bash
npm run dev
```

### 2. Test Basic Functionality

1. Open http://127.0.0.1:8080 in your browser
2. You should see "Forest Treasure Hunt" with a code input field
3. Try entering a test code (case-insensitive):
   - `A3X7Q` → Should unlock: "Look under the old oak tree near the stream"
   - `b7k2m` → Should unlock: "Follow the trail north until you see the red marker" (tests case-insensitivity)
   - `invalid` → Should show "Invalid code" error

### 3. Test Unlocked Clues Tracking

1. Enter multiple valid codes (see list below)
2. Verify that the "X of 5 clues unlocked" counter updates
3. Scroll down to see your unlocked clues list
4. Refresh the page - unlocked clues should persist (Local Storage)

### 4. Test Offline Functionality

**Method 1: Browser DevTools**
1. Open DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. Verify service worker is registered and activated
4. Check the **Offline** checkbox
5. Reload the page - it should still work!
6. Try entering codes - should work completely offline

**Method 2: Network Tab**
1. Open DevTools → **Network** tab
2. Select **Offline** from throttling dropdown
3. Reload page and test functionality

### 5. Test PWA Installation (Mobile Simulation)

1. In Chrome DevTools, click the device icon (Toggle device toolbar)
2. Select a mobile device (e.g., iPhone 12 Pro)
3. Reload the page
4. Look for "Install app" prompt or check browser menu for "Install app" option
5. Install and test as a standalone app

## Test Codes

All codes are case-insensitive:

| Code | Clue |
|------|------|
| A3X7Q | Regardez sous le vieux chêne près du ruisseau |
| B7K2M | Suivez le sentier vers le nord jusqu'au panneau rouge |
| C9P4N | L'indice suivant est caché dans la bûche creuse |
| D1W8R | Cherchez près du pont de pierre sur le sentier est |
| E5T6Y | Félicitations ! Vous avez trouvé l'emplacement final du trésor ! |

## Customization for Your Hunt

Edit `public/clues.json`:

```json
{
  "huntTitle": "My Custom Treasure Hunt",
  "clues": [
    {
      "code": "ABC12",
      "clue": "Your custom clue here"
    }
  ]
}
```

After editing, rebuild:
```bash
npm run build
```

## Deployment Checklist

When ready to deploy to production:

- [ ] Update `public/clues.json` with your real treasure hunt codes and clues
- [ ] Customize `huntTitle` in clues.json
- [ ] (Optional) Replace PWA icons in `public/icons/` with custom 192x192 and 512x512 PNG images
- [ ] (Optional) Update theme colors in `public/manifest.json` and `public/styles.css`
- [ ] Run `npm run build` to compile TypeScript
- [ ] Deploy the entire `public/` folder to your web host
- [ ] Test the deployed version in offline mode
- [ ] Share the URL with participants!

## Known Limitations

- Icons are placeholder (simple "TH" text on green background) - replace with custom icons if desired
- No reset/clear functionality (deferred per PRD)
- Clues are visible in the JSON file (client-side only, no encryption)

## Support

For issues or questions, refer to:
- Main README.md
- PRD: docs/product-requirements-documents/001-treasure-hunt-pwa.md
- Implementation plan: (in session folder)
