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
