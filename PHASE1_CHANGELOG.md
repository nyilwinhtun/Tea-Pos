# T POS Phase 1 changelog

## Included

- Kept the existing Dexie database name `TPOSDatabase_Final_V2`.
- Added Dexie schema version 2 with `orderDrafts` and `appMeta`; retained the original `menu`, `settings`, and `receipts` tables.
- Added typed `MenuItem`, `CartItem`, `OrderDraft`, `AppMeta`, settings, receipt, theme, order-type, and sync-status models.
- Removed the original `any` parameters and item arrays from the source files.
- Persisted each active table/parcel cart locally when a menu item is added, quantity changes, or an item is removed.
- Restored unfinished orders and the last active table/parcel after refresh or reopening the app.
- Persisted the next parcel number so parcel identifiers do not restart at P-1 after a refresh.
- Added a stable local device ID and draft revision/sync metadata for the planned shared-device sync layer.
- Added a basic mobile POS workflow: show the menu first, then open the cart view without forcing the desktop split layout onto a phone.
- Updated the document language and browser title for the tea-shop app.
- Preserved the existing seed menu and existing shop settings/receipt data model.

## Important data-preservation note

The old ZIP kept unfinished carts only in Zustand memory; it did not persist them to IndexedDB. Menu, shop settings, and saved receipts remain in the existing database, but any unpaid cart that is still open in the old running app must be completed or manually recorded before replacing/reloading that app. The new Phase 1 version preserves existing persistent data when used on the same browser origin.

## Not included yet

- Live computer/phone cloud sync. Firebase credentials, shop ID, and authentication are not present in the supplied ZIP. See `SYNC_ARCHITECTURE.md`.
- A previous browser origin/device does not share IndexedDB automatically. Use the cloud-sync phase or a dedicated data export/import to move records to another origin/device.
- Menu CRUD, payment method selection (Cash/QR), final receipt/print workflow, day-close summary, and advanced analytics. These belong to later phases.
- Automatic remote backup. Local Dexie persistence is not a substitute for a cloud backup.

## Run locally

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

The source environment used to prepare this Phase 1 archive did not have npm packages cached and could not reach `registry.npmjs.org`, so a dependency install/full TypeScript build could not be completed here. TS/TSX syntax transpilation passed, but this is not a substitute for `npm run build`. Run the build after `npm install` on a machine with npm registry access before deploying to the shop.
