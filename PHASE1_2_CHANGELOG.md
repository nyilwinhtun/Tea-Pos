# T POS Phase 1.2 — Food Categories & Parcel Management

## Changes
- Added a dedicated Parcel Management page with a Lucide Package icon.
- Added Parcel to desktop Sidebar and mobile Bottom Navigation.
- Added persistent parcel token list using the existing `appMeta` table (`parcelKeys`).
- Preserved v2 data: hydration combines saved parcel keys with existing parcel drafts and the last active parcel.
- Added safe removal of the last parcel only when it has no unpaid order.
- Parcel IDs remain monotonic and are not reused after removing a token.
- Paid parcels leave the active parcel list after checkout; their sales receipt remains in the original receipts store.
- Added a grouped Menu catalog list in Settings with edit and delete actions.
- Existing category creation and menu item creation are retained; new food items can be assigned to any created category.
- No IndexedDB store is deleted or recreated, and no Dexie schema version bump is needed.

## Validation
- Source was reviewed for strict TypeScript patterns; no `any` was introduced.
- Full dependency installation and build could not be run in the packaging environment because `npm install` timed out and no `node_modules` were available. Run `npm install` and `npm run build` on the user's Mac before production use.
