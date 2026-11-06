# T POS — Tea Shop POS

Phase 1 source update for local-first table/parcel order handling.

## Requirements

- Node.js 18 or newer
- npm

## Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Important notes

- The existing IndexedDB database name is intentionally preserved: `TPOSDatabase_Final_V2`.
- Phase 1 adds Dexie version 2 tables without removing the original menu, settings, or receipts tables.
- Table and parcel drafts are saved locally and restored on reload.
- Live sharing between computer and phone still requires the Firebase connection described in `SYNC_ARCHITECTURE.md`.
- Before replacing the old app, finish or manually record any unpaid carts still open in it; the old version kept those carts only in memory. Existing saved menu/settings/receipts remain in IndexedDB on the same browser origin.
- Use `PHASE1_TEST_CHECKLIST.md` to test the update before using it for real sales.
- Before using with real sales, install dependencies, run `npm run build`, then test add/edit/remove, refresh recovery, and parcel numbering on the actual target devices.

## Phase 1.1 updates

- Dedicated Table Management, dynamic table count, add/remove safety.
- Mobile bottom navigation and responsive cart overlay.
- Theme selector fixed with RGB-channel data-theme variables and Tailwind opacity support.
- PWA install banner plus manifest icons.
- Custom categories and menu-item addition.
- Shop QR upload and QR checkout confirmation (upload the shop QR in Settings before taking QR payments).
- Saved receipt summary shown after Pay Only, plus saved-receipt 80mm printing.
- Receipt summary includes itemized items, payment type, received amount and change when the customer does not take a paper receipt.

See `PHASE1_1_CHANGELOG.md` and `PHASE1_1_TEST_CHECKLIST.md`.


### Install and validate

```bash
npm install
npm run build
npm run dev
```

Full build was not run in the packaging environment because npm could not resolve `registry.npmjs.org`; run the commands above on the development computer before deploying. The package has been syntax-checked and its ZIP integrity verified.


## Phase 1.2 updates

- Dedicated Parcel Management page is available from desktop sidebar and mobile bottom navigation.
- Parcel tokens are persisted in `appMeta.parcelKeys`; existing v2 drafts and the previously active parcel are recovered during hydration.
- Parcel tokens use a monotonic sequence (`P-1`, `P-2`, ...); removing the last empty parcel does not reuse its number.
- A parcel with an unpaid draft cannot be removed. A paid parcel is removed from the active parcel list while its receipt remains in `receipts`.
- Settings now lets the owner add categories, add menu items into a selected category, edit menu item details, and remove a menu item. Historical receipts remain unchanged because they store a snapshot of item names and prices.
- No Dexie version change was needed: parcel list metadata uses the existing `appMeta` table. Existing `menu`, `settings`, `receipts`, and `orderDrafts` stores are retained.


## PWA Install Banner
The custom T POS install banner is included. It offers the browser install prompt when supported and platform-specific manual install guidance when the browser does not expose the prompt. PWA dev service-worker support is enabled for localhost testing. See `PWA_INSTALL_BANNER_FIX.md`.
