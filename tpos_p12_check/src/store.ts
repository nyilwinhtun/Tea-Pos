import { create } from 'zustand';
import {
  db,
  getOrCreateDeviceId,
  type CartItem,
  type MenuItem,
  type OrderDraft,
  type Receipt,
} from './db';

type ActiveTab = 'pos' | 'tables' | 'parcels' | 'settings';
type MobileView = 'menu' | 'cart';

interface AppState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileView: MobileView;
  setMobileView: (view: MobileView) => void;

  activeCategory: string;
  setActiveCategory: (category: string) => void;

  carts: Record<string, CartItem[]>;
  orderDrafts: Record<string, OrderDraft>;
  activeOrderKey: string;
  setActiveOrderKey: (key: string) => void;
  addToCart: (item: MenuItem) => void;
  updateQty: (id: number, delta: number) => void;
  removeCartItem: (id: number) => void;
  clearActiveCart: () => void;

  tableCount: number;
  addTable: () => Promise<boolean>;
  removeLastTable: () => Promise<{ ok: boolean; message: string }>;
  /** Next parcel sequence number (monotonic; never reused after removal). */
  parcelCount: number;
  parcelKeys: string[];
  createNewParcel: () => void;
  removeLastParcel: () => Promise<{ ok: boolean; message: string }>;
  isHydrated: boolean;
  hydrateOrders: () => Promise<void>;

  isCheckoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  lastCompletedReceipt: Receipt | null;
  setLastCompletedReceipt: (receipt: Receipt | null) => void;
}

// Serialize local writes so fast consecutive taps cannot leave stale drafts last.
let persistenceQueue: Promise<void> = Promise.resolve();
function enqueuePersistence(task: () => Promise<void>): void {
  persistenceQueue = persistenceQueue.then(task).catch((error: unknown) => {
    console.error('T POS local persistence failed:', error);
  });
}

function makeOrderDraft(key: string, items: CartItem[], previous: OrderDraft | undefined): OrderDraft {
  const now = new Date().toISOString();
  return {
    key,
    identifier: key,
    orderType: key.startsWith('Table-') ? 'dine-in' : 'parcel',
    items,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    revision: (previous?.revision ?? 0) + 1,
    syncStatus: 'pending',
    deviceId: previous?.deviceId ?? '',
  };
}

function saveDraft(draft: OrderDraft): void {
  enqueuePersistence(async () => {
    const deviceId = await getOrCreateDeviceId();
    const existing = await db.orderDrafts.get(draft.key);
    await db.orderDrafts.put({
      ...draft,
      deviceId,
      revision: Math.max(draft.revision, existing?.revision ?? 0),
      syncStatus: 'pending',
    });
  });
}

function deleteDraft(key: string): void {
  enqueuePersistence(() => db.orderDrafts.delete(key));
}

export const useStore = create<AppState>((set, get) => ({
  activeTab: 'pos',
  setActiveTab: (tab) => set({ activeTab: tab }),
  mobileView: 'menu',
  setMobileView: (view) => set({ mobileView: view }),

  activeCategory: 'အားလုံး',
  setActiveCategory: (category) => set({ activeCategory: category }),

  carts: {},
  orderDrafts: {},
  activeOrderKey: 'Table-1',
  setActiveOrderKey: (key) => {
    set({ activeOrderKey: key, mobileView: 'menu' });
    enqueuePersistence(() => db.appMeta.put({ key: 'activeOrderKey', value: key }).then(() => undefined));
  },

  addToCart: (item) => set((state) => {
    if (typeof item.id !== 'number') return state;
    const key = state.activeOrderKey;
    const currentCart = state.carts[key] ?? [];
    const existing = currentCart.find((cartItem) => cartItem.id === item.id);
    const nextCart = existing
      ? currentCart.map((cartItem) => cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem)
      : [...currentCart, { id: item.id, name: item.name, price: item.price, qty: 1, icon: item.icon }];
    const draft = makeOrderDraft(key, nextCart, state.orderDrafts[key]);
    saveDraft(draft);
    return { carts: { ...state.carts, [key]: nextCart }, orderDrafts: { ...state.orderDrafts, [key]: draft } };
  }),

  updateQty: (id, delta) => set((state) => {
    const key = state.activeOrderKey;
    const currentCart = state.carts[key] ?? [];
    const nextCart = currentCart
      .map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter((item) => item.qty > 0);
    if (nextCart.length === 0) {
      const nextCarts = { ...state.carts };
      const nextDrafts = { ...state.orderDrafts };
      delete nextCarts[key];
      delete nextDrafts[key];
      deleteDraft(key);
      return { carts: nextCarts, orderDrafts: nextDrafts };
    }
    const draft = makeOrderDraft(key, nextCart, state.orderDrafts[key]);
    saveDraft(draft);
    return { carts: { ...state.carts, [key]: nextCart }, orderDrafts: { ...state.orderDrafts, [key]: draft } };
  }),

  removeCartItem: (id) => set((state) => {
    const key = state.activeOrderKey;
    const nextCart = (state.carts[key] ?? []).filter((item) => item.id !== id);
    if (nextCart.length === 0) {
      const nextCarts = { ...state.carts };
      const nextDrafts = { ...state.orderDrafts };
      delete nextCarts[key];
      delete nextDrafts[key];
      deleteDraft(key);
      return { carts: nextCarts, orderDrafts: nextDrafts };
    }
    const draft = makeOrderDraft(key, nextCart, state.orderDrafts[key]);
    saveDraft(draft);
    return { carts: { ...state.carts, [key]: nextCart }, orderDrafts: { ...state.orderDrafts, [key]: draft } };
  }),

  clearActiveCart: () => {
    const state = get();
    const key = state.activeOrderKey;
    const nextCarts = { ...state.carts };
    const nextDrafts = { ...state.orderDrafts };
    delete nextCarts[key];
    delete nextDrafts[key];
    deleteDraft(key);

    // A paid parcel is completed and leaves the active parcel list. Its receipt
    // remains permanently stored in db.receipts.
    if (key.startsWith('P-')) {
      const nextParcelKeys = state.parcelKeys.filter((parcelKey) => parcelKey !== key);
      const fallbackKey = nextParcelKeys[nextParcelKeys.length - 1] ?? 'Table-1';
      enqueuePersistence(() => db.appMeta.bulkPut([
        { key: 'parcelKeys', value: nextParcelKeys },
        { key: 'activeOrderKey', value: fallbackKey },
      ]).then(() => undefined));
      set({
        carts: nextCarts,
        orderDrafts: nextDrafts,
        parcelKeys: nextParcelKeys,
        activeOrderKey: fallbackKey,
        activeTab: 'pos',
        mobileView: 'menu',
      });
      return;
    }

    set({ carts: nextCarts, orderDrafts: nextDrafts });
  },

  tableCount: 6,
  addTable: async () => {
    const current = get().tableCount;
    if (current >= 30) return false;
    const next = current + 1;
    await db.appMeta.put({ key: 'tableCount', value: next });
    set({ tableCount: next });
    return true;
  },
  removeLastTable: async () => {
    const state = get();
    if (state.tableCount <= 1) return { ok: false, message: 'အနည်းဆုံး စားပွဲတစ်လုံးတော့ ရှိရပါမယ်။' };
    const lastKey = `Table-${state.tableCount}`;
    if ((state.carts[lastKey]?.length ?? 0) > 0 || state.orderDrafts[lastKey]) {
      return { ok: false, message: `${lastKey} မှာ အော်ဒါရှိနေတဲ့အတွက် မဖယ်ရှားနိုင်ပါ။ အော်ဒါကို အရင်ရှင်းပါ။` };
    }
    const next = state.tableCount - 1;
    const updates: Partial<AppState> = { tableCount: next };
    if (state.activeOrderKey === lastKey) {
      const fallbackKey = `Table-${next}`;
      updates.activeOrderKey = fallbackKey;
      updates.mobileView = 'menu';
      await db.appMeta.put({ key: 'activeOrderKey', value: fallbackKey });
    }
    await db.appMeta.put({ key: 'tableCount', value: next });
    set(updates);
    return { ok: true, message: `${lastKey} ကို ဖယ်ရှားပြီးပါပြီ။` };
  },

  parcelCount: 1,
  parcelKeys: [],
  createNewParcel: () => set((state) => {
    if (state.parcelKeys.length >= 50) return state;
    const key = `P-${state.parcelCount}`;
    const nextCount = state.parcelCount + 1;
    const nextParcelKeys = [...state.parcelKeys, key];
    enqueuePersistence(() => db.appMeta.bulkPut([
      { key: 'activeOrderKey', value: key },
      { key: 'parcelCount', value: nextCount },
      { key: 'parcelKeys', value: nextParcelKeys },
    ]).then(() => undefined));
    return { activeOrderKey: key, parcelCount: nextCount, parcelKeys: nextParcelKeys, mobileView: 'menu' };
  }),
  removeLastParcel: async () => {
    const state = get();
    const lastKey = state.parcelKeys[state.parcelKeys.length - 1];
    if (!lastKey) return { ok: false, message: 'ဖယ်ရှားရန် ပါဆယ်မရှိသေးပါ။' };
    if ((state.carts[lastKey]?.length ?? 0) > 0 || state.orderDrafts[lastKey]) {
      return { ok: false, message: `${lastKey} မှာ အော်ဒါရှိနေတဲ့အတွက် မဖယ်ရှားနိုင်ပါ။ အော်ဒါကို အရင်ရှင်းပါ။` };
    }

    const nextParcelKeys = state.parcelKeys.slice(0, -1);
    const fallbackKey = nextParcelKeys[nextParcelKeys.length - 1] ?? 'Table-1';
    const updates: Partial<AppState> = { parcelKeys: nextParcelKeys };
    if (state.activeOrderKey === lastKey) {
      updates.activeOrderKey = fallbackKey;
      updates.mobileView = 'menu';
    }
    await db.appMeta.bulkPut([
      { key: 'parcelKeys', value: nextParcelKeys },
      ...(state.activeOrderKey === lastKey ? [{ key: 'activeOrderKey', value: fallbackKey }] : []),
    ]);
    set(updates);
    return { ok: true, message: `${lastKey} ကို ဖယ်ရှားပြီးပါပြီ။` };
  },

  isHydrated: false,
  hydrateOrders: async () => {
    try {
      const [drafts, activeKeyMeta, parcelCountMeta, tableCountMeta, parcelKeysMeta] = await Promise.all([
        db.orderDrafts.toArray(),
        db.appMeta.get('activeOrderKey'),
        db.appMeta.get('parcelCount'),
        db.appMeta.get('tableCount'),
        db.appMeta.get('parcelKeys'),
      ]);
      const carts = Object.fromEntries(drafts.filter((draft) => draft.items.length > 0).map((draft) => [draft.key, draft.items])) as Record<string, CartItem[]>;
      const orderDrafts = Object.fromEntries(drafts.map((draft) => [draft.key, draft])) as Record<string, OrderDraft>;
      const largestTableNumber = drafts.reduce((largest, draft) => {
        if (!draft.key.startsWith('Table-')) return largest;
        const number = Number(draft.key.slice(6));
        return Number.isInteger(number) ? Math.max(largest, number) : largest;
      }, 0);
      const storedTableCount = typeof tableCountMeta?.value === 'number' ? tableCountMeta.value : 6;
      const tableCount = Math.max(storedTableCount, largestTableNumber, 1);
      const activeOrderKey = typeof activeKeyMeta?.value === 'string' ? activeKeyMeta.value : 'Table-1';
      const activeTableNumber = activeOrderKey.startsWith('Table-') ? Number(activeOrderKey.slice(6)) : 0;
      const safeTableCount = Number.isInteger(activeTableNumber) && activeTableNumber > 0 ? Math.max(tableCount, activeTableNumber) : tableCount;

      // Backward compatibility: recover parcels known by v2 drafts and active key,
      // while preserving the explicit parcel list for empty, newly-created parcels.
      const parcelKeysValue: unknown = parcelKeysMeta?.value;
      const storedParcelKeys = Array.isArray(parcelKeysValue)
        ? parcelKeysValue.filter((value: unknown): value is string => typeof value === 'string' && /^P-\d+$/.test(value))
        : [];
      const draftParcelKeys = drafts.map((draft) => draft.key).filter((key) => /^P-\d+$/.test(key));
      const activeParcelKeys = /^P-\d+$/.test(activeOrderKey) ? [activeOrderKey] : [];
      const parcelKeys = Array.from(new Set([...storedParcelKeys, ...draftParcelKeys, ...activeParcelKeys]))
        .sort((left, right) => Number(left.slice(2)) - Number(right.slice(2)));
      const largestParcelNumber = parcelKeys.reduce((largest, key) => Math.max(largest, Number(key.slice(2))), 0);
      const storedParcelCount = typeof parcelCountMeta?.value === 'number' ? parcelCountMeta.value : 1;
      const parcelCount = Math.max(storedParcelCount, largestParcelNumber + 1, 1);

      set({ carts, orderDrafts, parcelCount, parcelKeys, tableCount: safeTableCount, activeOrderKey, isHydrated: true });
      await db.appMeta.bulkPut([
        { key: 'activeOrderKey', value: activeOrderKey },
        { key: 'parcelCount', value: parcelCount },
        { key: 'parcelKeys', value: parcelKeys },
        { key: 'tableCount', value: safeTableCount },
      ]);
      await getOrCreateDeviceId();
    } catch (error) {
      set({ isHydrated: true });
      throw error;
    }
  },

  isCheckoutOpen: false,
  setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
  lastCompletedReceipt: null,
  setLastCompletedReceipt: (receipt) => set({ lastCompletedReceipt: receipt }),
}));
