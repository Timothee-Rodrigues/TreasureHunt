# Technial decisions

This app is for a treasure hunt.

It will be very simple:
- a numeric input where the user enters a CODE
- if the code is valid, it will return a clue (text)

## Constraints:

- Must be usable on mobile devices
- The treasure hunt will be located in a forest where we may lose internet connection
- I don't want to pay any Apple App Store publishing fees (for Android, I can provide a link to download the APK for free)

## The technical options considered:

### 1st option: Web app

- 🟩 Quick to develop
- 🟠 Requires a server
- ❌ Requires internet connection → not reliable due to unstable connectivity

### 2nd option: Mobile app using Flutter

- Cross-platform framework (a single codebase)
- MVP very quick to develop (perfect for this project)
- Can work fully offline once downloaded
- ✅ Quick for Android
- ❌ For iOS, I must publish on the Apple App Store (which requires a fee) for friends to download it
- We can decide to ensure each team has at least one Android user

### 3rd option: React Native mobile app + React web app

- ✅ Provides an offline mobile app
- ✅ Provides a web option for iOS users (though they might struggle if internet connectivity is unstable)
- 🟠 Heavier architecture (mobile + web apps)


## The option selected: PWA first

Build a very small offline-first Progressive Web App.

### Why this is probably the best choice

- no App Store fees
- works on iPhone + Android
- one codebase
- installable like an app
- can cache clues locally
- ultra fast to build
- easiest for users via QR code

### User journey

- Before entering forest:
- Scan QR code
- Open site
- Tap “Add to Home Screen”
- App stores all data locally
- Then in forest:
- no internet needed
- code input works offline
- That avoids App Store hell completely.