# T POS Phase 1.1 Manual Test Checklist

## Before updating
- Export/backup sales CSV if the old app contains important sales records.
- Keep a copy of the prior project and do not clear the browser site data.
- Deploy to the same website origin when retaining the same browser's IndexedDB data.

## Table management
- Open Tables from desktop sidebar and phone bottom navigation.
- Add a table; confirm the table count and new tile appear.
- Refresh; confirm the new table count remains.
- Open an empty table and return to Tables.
- Try removing a table that has an unfinished order; confirm it is blocked.
- Remove an empty last table; confirm the count decreases by one.

## Orders and receipts
- Add menu items to Table-1, switch to Table-2, and confirm carts stay separate.
- Refresh and confirm both unfinished orders return.
- Open a parcel and confirm its order is separate.
- Cash checkout with insufficient amount must be blocked.
- Cash checkout with enough amount must show the saved receipt summary and correct change.
- QR checkout must require confirmation and use the configured shop QR image.
- Pay Only must show a complete on-screen receipt without opening the print dialog.
- Pay & Print must print the saved receipt even after the active cart is cleared.

## Themes, categories and mobile
- Switch through Light, Dark, Tea Brown and Matcha Green; confirm background, card, text and gray elements change.
- Add a category and confirm it appears in the POS category tabs after navigation/refresh.
- Add a menu item under the new category and confirm it filters correctly.
- On a phone-sized viewport, confirm the bottom navigation is visible and the cart overlay leaves room for it.

## PWA and printer
- On supported Android Chrome, wait for the install banner and test Install.
- On iOS Safari, follow Share > Add to Home Screen instructions.
- Test 80mm print dialog and printer output on the actual target printer/browser.
