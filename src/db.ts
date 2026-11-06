import Dexie, { type Table } from 'dexie';

export type OrderType = 'dine-in' | 'parcel';
export type SyncStatus = 'pending' | 'synced';
export type ThemeName = 'light' | 'dark' | 'tea' | 'matcha';

export interface MenuItem {
  id?: number;
  name: string;
  price: number;
  category: string;
  icon?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  icon?: string;
}

/** An unpaid order saved locally so it survives refreshes and app restarts. */
export interface OrderDraft {
  key: string;
  identifier: string;
  orderType: OrderType;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  revision: number;
  syncStatus: SyncStatus;
  deviceId: string;
}

export interface AppSettings {
  id?: number;
  shopName: string;
  logoBase64: string;
  qrBase64?: string;
  theme: ThemeName;
}

/** The original receipt fields remain unchanged for compatibility with v1 data. */
export interface Receipt {
  id?: number;
  date: string;
  items: CartItem[];
  totalAmount: number;
  orderType: OrderType | string;
  identifier: string;
  receiptNo?: string;
  paymentMethod?: 'cash' | 'qr';
  receivedAmount?: number;
  changeAmount?: number;
  createdAt?: string;
}

export interface AppMeta {
  key: string;
  value: string | number | boolean | string[];
}

export class POSDB extends Dexie {
  menu!: Table<MenuItem, number>;
  settings!: Table<AppSettings, number>;
  receipts!: Table<Receipt, number>;
  orderDrafts!: Table<OrderDraft, string>;
  appMeta!: Table<AppMeta, string>;

  constructor() {
    super('TPOSDatabase_Final_V2');

    // Version 1 is retained exactly. Version 2 only adds tables; it does not
    // clear, recreate, or rewrite the existing menu/settings/receipts tables.
    this.version(1).stores({
      menu: '++id, category',
      settings: '++id',
      receipts: '++id, date',
    });

    this.version(2).stores({
      menu: '++id, category',
      settings: '++id',
      receipts: '++id, date',
      orderDrafts: '&key, orderType, updatedAt, syncStatus',
      appMeta: '&key',
    });
  }
}

export const db = new POSDB();

// A stable local device identifier is included in draft records so a future
// cloud-sync layer can identify their origin without changing the data model.
let deviceIdPromise: Promise<string> | undefined;
export function getOrCreateDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = (async () => {
      const saved = await db.appMeta.get('deviceId');
      if (typeof saved?.value === 'string' && saved.value.length > 0) {
        return saved.value;
      }
      const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      await db.appMeta.put({ key: 'deviceId', value: generatedId });
      return generatedId;
    })();
  }
  return deviceIdPromise;
}

db.on('populate', async () => {
  await db.menu.bulkAdd([
    { name: 'လက်ဖက်ရည် (ပုံမှန်)', price: 1000, category: 'သောက်စရာ', icon: '☕' },
    { name: 'လက်ဖက်ရည် (ခွက်ကြီး)', price: 1500, category: 'သောက်စရာ', icon: '☕' },
    { name: 'ကော်ဖီ', price: 1200, category: 'သောက်စရာ', icon: '☕' },
    { name: 'စမူဆာ (၁ ခု)', price: 300, category: 'အစားအစာ', icon: '🥟' },
    { name: 'အီကြာကွေး (၁ ခု)', price: 300, category: 'အစားအစာ', icon: '🥖' },
    { name: 'ပလာတာ', price: 1500, category: 'အစားအစာ', icon: '🫓' },
  ]);
  await db.settings.add({ shopName: 'T POS', logoBase64: '', theme: 'light' });
  await db.appMeta.bulkPut([
    { key: 'activeOrderKey', value: 'Table-1' },
    { key: 'parcelCount', value: 1 },
    { key: 'tableCount', value: 6 },
    { key: 'menuCategories', value: ['သောက်စရာ', 'အစားအစာ'] },
  ]);
});
