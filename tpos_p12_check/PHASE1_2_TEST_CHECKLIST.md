# T POS Phase 1.2 Test Checklist

## Menu Categories & Food Items
1. Open Settings and add categories such as `မုန့်`, `အကြော်`, `အသုပ်`, or the shop's own categories.
2. Add food items and assign each to the intended category.
3. Return to POS and check category filters show the food item only under its assigned category.
4. Edit an item's name, price, icon, and category; confirm POS reflects the changes.
5. Delete a menu item after confirming; verify old receipts still show their saved item names and prices.
6. Try to delete a category that still has menu items; it should be blocked until those items are reassigned or removed.

## Parcel Management
1. Open Parcel from the desktop sidebar or mobile bottom navigation.
2. Add parcels; verify IDs progress as `P-1`, `P-2`, `P-3`.
3. Open P-1, add an item, return to Parcel Management, and check item count and total.
4. Refresh the page and confirm parcel list and unpaid items are restored.
5. Try to remove the last parcel while it has an unpaid order; the app should block removal.
6. Remove an empty last parcel; confirm the prior parcel remains and the removed number is not reused.
7. Complete payment for a parcel; confirm it leaves the active parcel list but its receipt remains in Sales/CSV history.
8. Check Table Management and dine-in orders still work unchanged.

## Regression
- Test all four themes.
- Test phone bottom navigation and cart view.
- Test cash and QR checkout.
- Test Pay Only and Pay & Print.
- Run `npm install`, then `npm run build` before real shop use.
