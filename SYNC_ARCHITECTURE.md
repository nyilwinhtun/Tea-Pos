# T POS shared-device data architecture

## Confirmed operating model

- One cashier uses the POS at a time.
- The same shop data must be available on the computer and Android phone.
- The app must continue taking orders when the internet is unavailable.
- Stock/inventory management is intentionally out of scope for now.

## Architecture decision

Use a local-first model:

1. Dexie/IndexedDB is the immediate local database on each device. Order drafts are written locally as soon as an item is added, changed, or removed.
2. Firebase Firestore is the planned shared cloud database for syncing menu, shop settings, active orders, and receipts across the phone and computer.
3. A sync worker will push local records marked `pending` and pull remote updates when connectivity is available.
4. The single-cashier operating rule reduces simultaneous-edit conflicts. The sync layer must still use revisions and timestamps to detect stale writes rather than silently overwriting newer data.

## Local schema added in Phase 1

The existing database name remains `TPOSDatabase_Final_V2`.

- Existing v1 tables remain: `menu`, `settings`, `receipts`.
- New `orderDrafts` table is keyed by the stable order key (`Table-1`, `P-1`, etc.). It stores line-item snapshots, order type, created/updated timestamps, revision, `syncStatus`, and the originating `deviceId`.
- New `appMeta` table stores the selected order key, next parcel number, and stable local device ID.

The Dexie database is upgraded to version 2 by adding tables only. No existing table is deleted, cleared, or recreated. Existing local browser data is preserved when this updated app is opened on the same browser origin (same protocol, host, and port). Moving to a different domain/origin or a different physical device does not automatically move IndexedDB data; that requires an export/import or the future cloud-sync step.

## Planned cloud collection layout

Under a shop-scoped path (the real `shopId` must be configured before sync is enabled):

- `shops/{shopId}/menu/{menuItemId}`
- `shops/{shopId}/activeOrders/{orderKey}`
- `shops/{shopId}/receipts/{receiptId}`
- `shops/{shopId}/settings/main`

Each synced record should carry `schemaVersion`, `revision`, `updatedAt`, and `updatedByDeviceId`. The cloud rules must restrict access to the authenticated shop owner/cashier. Never ship an unrestricted Firestore rule set.

## Phase 1 boundary

Phase 1 implements and persists local order drafts and makes the data model sync-ready. It does **not** yet perform live phone-to-computer cloud sync because this source ZIP contains no Firebase project configuration, shop ID, or authentication setup for this tea-shop app. The next sync phase must add the Firebase SDK/configuration, authentication and Firestore security rules, then test online sync and offline conflict recovery on both devices.
