# Quiniela2026 — Anchored Summary

## Goal
Build a quiniela (World Cup 2026 prediction) app with role-based admin access (super admin + client-level gestor), Spanish-first UX, and Firebase persistence.

## Constraints & Preferences
- Scotland flag uses `gb-sct` code for flagcdn compatibility; internal code `sco` mapped via `getFlagCode()`
- User management delegation: super admins (`isAdmin`) can assign `canManageUsers` flag to any user; gestores can only see and toggle users in their own client
- Groups page uses container queries (`@container`) to show compact table (only #, Equipo, PJ, DG, PTS) when card width < 480px; full table on wider cards
- Google Analytics loaded as direct gtag script in `<head>` for minimal performance impact
- Confirmation modals for user enable/disable and gestor assignment use dark gradient style (`bg-gradient-to-b from-gray-800 to-gray-900`)
- New users created with `enabled: false` (must be approved); backward-compat for users without `enabled` field

## Progress
### Done
- Predictions sorted by date ascending with "Solo pendientes" filter
- Ranking podium hidden when all users have 0 points; all users shown in list in that case
- Admin: super admins create clients with optional `enableUserControl` toggle; gestores with `canManageUsers` can enable/disable users within their client
- AuthContext: new users created with `enabled: isFirstUser`; legacy users default to `enabled: true`
- Predictions + Ranking respect client-level `enableUserControl`
- CountrySelector: added all World Cup teams, English aliases, accent-insensitive search
- Country names centralized in `src/utils/countries.js` via `getCountryName(code)`
- `getFlagCode(code)` helper maps internal codes (e.g. `sco`→`gb-sct`) for flagcdn URLs
- Groups page (`/groups`) with standings table using container queries for responsive column visibility
- Google Analytics gtag script added to `index.html` (ID: `G-JF4R4HW38C`)
- Confirmation modals for user enable/disable and gestor assignment (MatchCard-style dark gradient)
- Result entry modal restyled to match dark gradient theme
- Navbar shows Admin link for both `isAdmin` and `canManageUsers`
- Netlify `_redirects` SPA fix
- Firestore persistence via `initializeFirestore` with `persistentLocalCache`
- Fix enable/disable toggle for gestor users: moved `onClick` from `<label>` to outer `<div>` to avoid mobile browser label-input interaction that prevented the confirmation modal from opening
- Fix enable/disable for gestores toggling OTHER users (not just themselves): added Firestore security rules (`firestore.rules`) allowing gestores to update `enabled` field of users in the same client; added user-friendly error banner when `updateDoc` fails with permission error
- Created `firebase.json` referencing rules file

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- **Country names centralized:** One `getCountryName(code)` function – all display goes through it
- **User control is per-client:** `enableUserControl` stored on client doc, checked at runtime
- **Container queries for responsive table:** `@container` + `@max-[479px]:hidden` on extra columns instead of viewport breakpoints, so narrow cards auto-compact even on desktop
- **Gestor role client-side + Firestore:** `canManageUsers` flag stored on user doc; Firestore security rules must allow writes from gestores (currently assumed open)
- **Analytics via gtag script direct:** No `react-ga4` library – just `<script async>` in `<head>` to minimize bundle size

## Next Steps
- Deploy Firestore rules: run `firebase deploy --only firestore` or copy rules into Firebase Console > Firestore > Rules

## Critical Context
- The enable/disable toggle for gestors uses `onClick` on a `<div>` (not `<label>`) to avoid mobile browser label-input interaction issues
- Firestore billing: persistence cache reduces reads ~80-90% for returning users
- `canManageUsers` allows a user to see only their own client's users and toggle enable/disable
- Super admin has no `clientId` associated – they see all users across all clients

## Firestore Rules
- `firestore.rules` allows gestores to write `enabled` field on same-client users; requires Firebase deployment or manual copy to Firebase Console
- `firebase.json` references rules for CLI deployment

## Relevant Files
- `src/utils/countries.js`: `getCountryName()`, `getFlagCode()` with Scottish code mapping
- `src/pages/Groups.jsx`: standings table with container-query responsive columns
- `src/pages/Admin.jsx`: admin panel – role-based sections (client creation, gestor assignment, user enable/disable via confirmation modal, match management)
- `src/pages/Predictions.jsx`: prediction page with user-enable check and client-level feature toggle
- `src/pages/Ranking.jsx`: ranking page filtering by enabled users and podium logic
- `src/contexts/AuthContext.jsx`: user creation with `enabled: isFirstUser`
- `src/components/MatchCard.jsx`: dark-gradient confirmation modal for predictions
- `src/components/ui/CountrySelector.jsx`: searchable country dropdown
- `src/components/Navbar.jsx`: admin link visible for both `isAdmin` and `canManageUsers`
- `index.html`: Google Analytics gtag script
- `src/firebase/config.js`: Firestore persistence config
- `public/_redirects`: Netlify SPA redirect rule
