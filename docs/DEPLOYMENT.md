# Deployment & Testing Guide

## ✅ Implementation Complete

All features from PRD 001 have been successfully implemented, plus server sync functionality!

## 🆕 Server Sync Feature

The app now automatically syncs unlocked clues to a backend server with GPS coordinates.

### How it works:
- **GPS Capture**: When a code is unlocked, the app tries to capture GPS coordinates (5 retries × 3s timeout)
- **Background Sync**: Every 20 seconds, the app attempts to send unsynced clues to the server
- **Smart Retry**: If offline, clues are queued and sent when connection is restored
- **Periodic Full Resync**: Every 5 minutes, ALL clues are resent (to prevent data loss if server had issues)
- **Optional GPS**: If user denies GPS permission, clues are still unlocked (GPS sent as `null`)

### Server Endpoint Configuration

Edit `public/config.json` to set your API endpoint:

```json
{
  "apiEndpoint": "https://your-server.com/api/unlock",
  "syncIntervalSeconds": 20,
  "fullResyncMinutes": 5
}
```

### Expected Server API

The app sends POST requests to your endpoint with this payload:

```json
{
  "clues": [
    {
      "code": "A3X7Q",
      "unlockedAt": "2026-04-29T15:30:00.000Z",
      "gpsCoordinates": {
        "latitude": 48.8566,
        "longitude": 2.3522
      }
    }
  ]
}
```

**Server Requirements:**
- Accept POST requests with JSON body
- Respond with 200 OK on success (any 2xx will work)
- Handle duplicate submissions gracefully (same code sent multiple times)
- Enable CORS headers if app is hosted on different domain
- Use HTTPS in production (HTTP blocks GPS in most browsers)

### GPS Permissions

- First unlock will trigger browser permission prompt for location access
- If denied: clues unlock anyway, GPS sent as `null`
- Retries: 5 attempts with 3-second timeout each
- Works best on HTTPS (browsers block geolocation on HTTP in production)

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

### 1. Update Clues

Edit `public/clues.json`:

```json
{
  "huntTitle": "Ma chasse au trésor personnalisée",
  "clues": [
    {
      "code": "ABC12",
      "clue": "Votre indice personnalisé ici"
    }
  ]
}
```

### 2. Configure Server Endpoint

Edit `public/config.json`:

```json
{
  "apiEndpoint": "https://your-backend.com/api/unlock",
  "syncIntervalSeconds": 20,
  "fullResyncMinutes": 5
}
```

**Important**: If you don't have a server yet, the app works perfectly offline! Just ignore sync errors in the console.

After editing, rebuild:
```bash
npm run build
```

## Deployment Checklist

When ready to deploy to production:

- [ ] Update `public/clues.json` with your real treasure hunt codes and clues
- [ ] Customize `huntTitle` in clues.json
- [ ] **Configure server endpoint** in `public/config.json` (or use mock/offline mode)
- [ ] Set up backend server to receive unlocked clue data (see Server API spec above)
- [ ] Enable CORS on your backend if frontend is on different domain
- [ ] (Optional) Replace PWA icons in `public/icons/` with custom 192x192 and 512x512 PNG images
- [ ] (Optional) Update theme colors in `public/manifest.json` and `public/styles.css`
- [ ] Run `npm run build` to compile TypeScript
- [ ] **Deploy to HTTPS** (required for GPS to work on most browsers)
- [ ] Deploy the entire `public/` folder to your web host
- [ ] Test the deployed version in offline mode
- [ ] Test GPS permission prompt and verify data sent to server
- [ ] Share the URL with participants!

## Known Limitations

- Icons are placeholder (simple "TH" text on green background) - replace with custom icons if desired
- No reset/clear functionality (deferred per PRD)
- Clues are visible in the JSON file (client-side only, no encryption)
- **Server sync requires HTTPS** in production for GPS to work (browsers block geolocation on HTTP)
- Background sync uses setInterval (may drain battery slightly on long sessions)

## Support

For issues or questions, refer to:
- Main README.md
- PRD: docs/product-requirements-documents/001-treasure-hunt-pwa.md
- Implementation plan: (in session folder)
