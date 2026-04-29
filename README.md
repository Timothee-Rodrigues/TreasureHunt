# Treasure Hunt PWA

An offline-first Progressive Web App for treasure hunt events. Participants enter 5-character codes to unlock clues. All data is stored locally, and unlocked clues automatically sync to a backend server with GPS coordinates.

## Features

- ✅ **Offline-First**: Works completely offline after first load
- ✅ **Code-Based Unlocking**: 5-character alphanumeric codes (case-insensitive)
- ✅ **Local Storage**: Persistent unlocked clues in browser localStorage
- ✅ **PWA Installable**: Add to home screen on mobile devices
- ✅ **French UI**: Fully localized French interface
- ✅ **Server Sync**: Automatic background sync of unlocked clues with GPS
- ✅ **GPS Tracking**: Optional geolocation capture (graceful fallback if denied)
- ✅ **Smart Retry**: Queues data when offline, syncs when connection restored

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run dev
```

Open http://127.0.0.1:8080 in your browser.

### Test Codes (French clues)

| Code | Clue |
|------|------|
| A3X7Q | Regardez sous le vieux chêne près du ruisseau |
| B7K2M | Suivez le sentier vers le nord jusqu'au panneau rouge |
| C9P4N | L'indice suivant est caché dans la bûche creuse |
| D1W8R | Cherchez près du pont de pierre sur le sentier est |
| E5T6Y | Félicitations ! Vous avez trouvé l'emplacement final du trésor ! |

## Server Sync

### Overview

The app automatically syncs unlocked clues to a backend server:
- **Background sync**: Every 20 seconds (configurable)
- **Smart strategy**: Sends only unsynced clues OR all clues if last sync > 5 minutes
- **GPS capture**: 5 retries with 3s timeout each
- **Resilient**: Silent failures, automatic retry

### Configuration

Edit `public/config.json`:

```json
{
  "apiEndpoint": "https://your-server.com/api/unlock",
  "syncIntervalSeconds": 20,
  "fullResyncMinutes": 5
}
```

### Server API Specification

**Endpoint**: `POST /api/unlock` (or your configured endpoint)

**Request Body**:
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

**Response**: 
- `200 OK` on success
- Handle duplicate submissions (same code sent multiple times)

**Server Requirements**:
- Accept JSON POST requests
- Enable CORS if frontend is on different domain
- Use HTTPS (HTTP blocks GPS in most browsers)

### Example Server (Node.js/Express)

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/unlock', (req, res) => {
  const { clues } = req.body;
  
  // Store in database (handle duplicates with upsert)
  clues.forEach(clue => {
    console.log(`Code ${clue.code} unlocked at ${clue.unlockedAt}`);
    console.log(`GPS: ${clue.gpsCoordinates?.latitude}, ${clue.gpsCoordinates?.longitude}`);
    // TODO: Save to database
  });
  
  res.status(200).json({ success: true });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### GPS Permissions

- First code unlock triggers browser permission prompt
- 5 retry attempts with 3-second timeout each
- If denied: clues unlock anyway, GPS sent as `null`
- **Requires HTTPS** in production (browsers block geolocation on HTTP)

### Offline Behavior

- Unlocked clues are queued in localStorage with `synced: false` flag
- Background task attempts sync every 20 seconds
- When connection restored, all unsynced clues are sent
- Every 5 minutes, ALL clues are resent (prevents data loss if server had issues)

## Project Structure

```
TreasureHunt/
├── public/               # Static assets (deployed)
│   ├── index.html       # Main HTML page
│   ├── styles.css       # UI styles (forest theme)
│   ├── manifest.json    # PWA manifest
│   ├── service-worker.js # Offline caching
│   ├── clues.json       # Hunt configuration & clues
│   ├── config.json      # Server sync configuration
│   ├── icons/           # PWA icons
│   └── dist/            # Compiled JavaScript (generated)
├── src/                 # TypeScript source
│   ├── app.ts           # Main app logic
│   ├── storage.ts       # localStorage management
│   ├── types.ts         # TypeScript interfaces
│   ├── geolocation.ts   # GPS capture with retry
│   └── sync.ts          # Background server sync
├── docs/                # Documentation
│   ├── DEPLOYMENT.md    # Deployment & testing guide
│   └── product-requirements-documents/
│       └── 001-treasure-hunt-pwa.md
├── package.json         # Dependencies & scripts
└── tsconfig.json        # TypeScript compiler config
```

## Customization

### Change Clues

Edit `public/clues.json`:

```json
{
  "huntTitle": "Ma chasse personnalisée",
  "clues": [
    { "code": "XYZ12", "clue": "Votre indice ici" }
  ]
}
```

Run `npm run build` after changes.

### Change Server Endpoint

Edit `public/config.json`:

```json
{
  "apiEndpoint": "https://your-backend.com/api/unlock"
}
```

No rebuild needed (loaded at runtime).

### Styling

- Colors and theme: `public/styles.css`
- PWA colors: `public/manifest.json` (theme_color)
- Icons: Replace `public/icons/icon-192.png` and `icon-512.png`

## Deployment

1. Update `public/clues.json` with your codes
2. Configure `public/config.json` with your server endpoint
3. Build: `npm run build`
4. Deploy `public/` folder to any static host (Netlify, Vercel, GitHub Pages, S3, etc.)
5. **Use HTTPS** (required for GPS and service workers)

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed guide.

## Tech Stack

- **TypeScript** (vanilla, no framework)
- **Build**: TypeScript compiler (`tsc`) only, no bundler
- **Offline**: Service Worker (cache-first strategy)
- **Storage**: localStorage for persistence
- **GPS**: Navigator Geolocation API
- **Sync**: Background fetch with retry logic

## Browser Support

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+ (iOS requires Add to Home Screen for full offline support)
- Service Worker + localStorage required

## License

MIT

## Support

For questions or issues:
- See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- Check console for sync errors
- Verify HTTPS for GPS functionality
