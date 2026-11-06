# T POS Phase 1.1 — Usability Upgrade

## Implemented

1. Dedicated Table Management screen with Lucide table icons.
2. Table count is stored in Dexie `appMeta`; the owner can add tables up to 30 or remove the last table.
3. A table with an unfinished order cannot be removed. This prevents accidental loss of an active order.
4. Mobile bottom navigation for POS, Tables and Settings.
5. Four themes use RGB-channel `data-theme` CSS variables (including Tailwind opacity support such as `bg-primary/10`) and theme-aware gray tokens. The browser theme-color meta tag follows the selected theme.
6. PWA install banner handles Android/Chromium `beforeinstallprompt`; iOS Safari receives Add to Home Screen instructions.
7. PWA manifest now declares 192px, 512px and maskable PNG icons.
8. Custom menu categories are persisted in the existing `appMeta` table. Menu items can be added from Settings and assigned to a category.
9. Shop payment QR image can be uploaded in Settings and displayed during QR checkout.
10. Cash/QR checkout validates the received cash or QR confirmation before saving a receipt.
11. Every completed sale is saved before the active cart is cleared. Pay Only shows a full on-screen receipt summary; Pay & Print prints the saved receipt, not the now-cleared cart.
12. 80mm print view uses the completed receipt with receipt number, payment method, received amount and change.

## Data preservation

- Dexie database name remains `TPOSDatabase_Final_V2`.
- Dexie Version 1 and Version 2 store definitions remain intact.
- Existing `menu`, `settings`, `receipts`, `orderDrafts` and `appMeta` stores are not deleted or recreated.
- New settings properties (`qrBase64`) and app metadata values are additive. Existing settings without a QR image remain valid.

## Important limitation

This release stores orders and settings locally per browser/device. It does not yet synchronize live data between the phone and computer. Shared cross-device data requires the Firebase/cloud sync connection and conflict handling in a later phase. Do not treat local offline persistence as device-to-device sync.

## Verification status

- TypeScript/TSX syntax transpilation: passed.
- ZIP archive integrity: verified after packaging.
- Full `npm run build`: not verified in this environment because `npm install` could not reach `registry.npmjs.org` (DNS/network error `EAI_AGAIN`). Run `npm install` and `npm run build` on the development computer before deploying.
