# Phase 1 test checklist

Run these tests on a test copy before using the app for actual sales.

## Install and build

- [ ] Run `npm install`.
- [ ] Run `npm run build`; confirm TypeScript and Vite finish without errors.
- [ ] Run `npm run dev` and open the local app.

## Existing data safety

- [ ] Open the updated app on the same browser origin where the old T POS used `TPOSDatabase_Final_V2`.
- [ ] Confirm the existing menu, shop name, logo, theme, and historical receipts are still visible.
- [ ] Do not clear browser site data or delete the IndexedDB database during this test.

## Table draft persistence

- [ ] Open Table-1 and add two different menu items.
- [ ] Switch to Table-2 and add a different item.
- [ ] Switch back to Table-1; verify its items and quantities remain unchanged.
- [ ] Refresh the browser; verify both Table-1 and Table-2 drafts return.
- [ ] Increase, decrease, and remove a line item; refresh and verify the updated cart.

## Parcel numbering and persistence

- [ ] Create a new parcel; confirm the new key is P-1 on a fresh database.
- [ ] Add an item and refresh; confirm P-1 and its item return.
- [ ] Create another parcel; confirm it uses P-2 rather than reusing P-1.

## Phone layout

- [ ] Open the same deployed app on a phone.
- [ ] Confirm the menu appears first and the bottom Cart button opens the cart view.
- [ ] Return to the menu and confirm the selected table/parcel remains selected.

## Shared-device sync boundary

- [ ] Do not expect a new order on one device to appear on the other device yet.
- [ ] Cross-device sync is not active until Firebase configuration, authentication, Firestore rules, and sync-worker implementation are completed and tested.
