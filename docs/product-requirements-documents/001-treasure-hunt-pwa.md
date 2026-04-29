# PRD 001: Treasure Hunt PWA

## Status

| Date       | Status   | Owner |
| ---------- | -------- | ----- |
| 2026-04-29 | 🌱 Draft | TI    |

## Overview

An offline-first Progressive Web App (PWA) that enables friends and family to participate in treasure hunts in remote locations with unreliable internet connectivity. Users enter 5-character alphanumeric codes to unlock text-based clues.

## Context

Traditional treasure hunt apps require either native mobile apps (which incur App Store publishing fees and platform-specific development) or web apps (which fail without internet connectivity). This creates barriers for casual treasure hunt organizers who want to run events in outdoor locations like forests where internet connectivity is unstable or unavailable.

Existing approaches considered include:
- **Web app**: Quick to develop but requires constant internet connection, making it unreliable in remote locations
- **Flutter mobile app**: Works offline but requires Apple App Store fees for iOS distribution (undesirable for casual use)
- **React Native + React web**: Provides both offline mobile and web options but introduces unnecessary architectural complexity for a simple use case

The PWA approach eliminates App Store fees, works on both iPhone and Android, supports offline functionality through service workers, and can be installed like a native app while maintaining a single codebase.

## Goals

- Enable treasure hunts in locations with unreliable or no internet connectivity
- Avoid Apple App Store publishing fees while supporting iOS users
- Minimize development and deployment complexity with a single codebase
- Provide an installation experience comparable to native apps
- Support reusable app structure for different treasure hunt events

## Stakeholders

- Treasure hunt organizer (event creator)
- Participants (friends/family using the app during the hunt)

## Functional Requirements

### Core Functionality
- Users can enter a 5-character alphanumeric code (e.g., "A3X7Q")
- **Code matching is case-insensitive** (e.g., "a3x7q" and "A3X7Q" are equivalent)
- Valid codes display a corresponding text clue
- Invalid codes display "Invalid code" message
- All codes and clues are stored locally and work without internet connection after initial load
- Previously unlocked clues are tracked and accessible (users can view clues they've already discovered)
- Users can navigate through their unlocked clues

### Installation & Access
- Users access the PWA via a simple shareable URL
- App prompts users to "Add to Home Screen" for installation
- Once installed, app functions fully offline

### Content Management
- Codes and clues are defined in a JSON configuration file
- Configuration file is bundled with the app at build time
- Support variable number of codes/clues per treasure hunt (hunt organizer decides)
- Unlocked clue history is stored in browser local storage

### Mobile Support
- PWA must be fully functional on mobile devices (phones and tablets)
- Interface optimized for small screens and touch input
- Works on both iOS and Android devices

## Non-Goals (Out of Scope)

- Admin interface or CMS for creating/editing hunts
- Real-time multiplayer features or leaderboards
- GPS/location-based features
- Image, video, or audio clues (text only)
- User accounts or authentication
- Analytics or usage tracking
- Server-side code validation (all validation happens client-side)
- Clear/reset functionality to restart the hunt (deferred for future consideration)

## Options Considered

### ✅ Option 1: Progressive Web App (PWA)

- **Pros**:
  - No App Store fees
  - Works on iPhone and Android
  - Single codebase
  - Installable like a native app
  - Can cache all clues locally for offline use
  - Fast to build and deploy
  - Simple URL-based distribution
- **Cons**:
  - Requires initial internet connection to load the PWA
  - "Add to Home Screen" UX is less polished than app store installation
- **Why chosen**: Best balance of offline capability, cross-platform support, zero publishing fees, and development speed

### ❌ Option 2: Flutter Mobile App

- **Pros**:
  - Cross-platform with single codebase
  - Native app experience
  - Works fully offline once downloaded
  - Free distribution for Android (APK sideloading)
- **Cons**:
  - Requires Apple App Store fees for iOS distribution
  - More complex deployment than web URL
  - Forces participants to ensure each team has at least one Android user
- **Why not chosen**: iOS distribution fees and complexity are deal-breakers for casual treasure hunt use

### ❌ Option 3: React Native Mobile + React Web App

- **Pros**:
  - Provides offline mobile app
  - Provides web fallback for iOS users
- **Cons**:
  - Heavier architecture (two apps to maintain)
  - iOS users still need internet connectivity (defeats primary constraint)
  - Unnecessary complexity for simple use case
- **Why not chosen**: Architectural complexity not justified for this simple use case

### ❌ Option 4: Web App Only

- **Pros**:
  - Quick to develop
- **Cons**:
  - Requires server
  - Requires constant internet connection (unusable in forest)
- **Why not chosen**: Fails the primary constraint of unreliable forest connectivity

## Design Considerations

- Interface must be simple and intuitive for casual users
- Code input should be mobile-friendly (large touch targets, appropriate keyboard)
- Error messages should be clear and non-technical
- Visual feedback for successful code validation
- Display of unlocked clues should be easily accessible (e.g., list or history view)
- Consider visual indicators to show progress (e.g., "3 of 10 clues unlocked")

## Technical Considerations

- Service Worker implementation required for offline caching
- PWA manifest file required for "Add to Home Screen" functionality
- All assets (HTML, CSS, JS, JSON config) must be cacheable
- Client-side code validation (no backend required)
- **Case-insensitive code matching required** (normalize input before validation)
- Browser local storage used to persist unlocked clue history
- JSON config schema should be simple and self-documenting

## Success Metrics

- Users can successfully install the PWA to their home screen
- App functions offline after installation (verified in airplane mode)
- All codes validate correctly without internet connection
- Zero App Store fees incurred
- App loads and functions on both iOS and Android devices

## Open Questions

- What visual styling/theming should the app use?
- Should unlocked clues be shown in the order they were discovered, or in a predefined order from the config file?
