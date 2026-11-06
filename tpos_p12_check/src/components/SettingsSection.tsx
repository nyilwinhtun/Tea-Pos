import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MenuItem, type ThemeName } from '../db';
import { Store, Image as ImageIcon, Download, Palette, Plus, Tag, Utensils, Trash2, Pencil, Save, X } from 'lucide-react';
import Papa from 'papaparse';

const themeOptions: { value: ThemeName; label: string; detail: string }[] = [
  { value: 'light', label: 'Light', detail: 'အလင်းရောင်' },
  { value: 'dark', label: 'Dark', detail: 'အမှောင်ရောင်' },
  { value: 'tea', label: 'Tea Brown', detail: 'လက်ဖက်ရောင်' },
  { value: 'matcha', label: 'Matcha Green', detail: 'မက်ချာစိမ်း' },
];

export default function SettingsSection() {
  const settings = useLiveQuery(() => db.settings.toArray());
  const receipts = useLiveQuery(() => db.receipts.toArray()) ?? [];
  const menuItems = useLiveQuery(() => db.menu.toArray()) ?? [];
  const categoryMeta = useLiveQuery(() => db.appMeta.get('menuCategories'));
  const setting = settings?.[0];
  const savedCategories = Array.isArray(categoryMeta?.value) ? categoryMeta.value.filter((value): value is string => typeof value === 'string') : [];
  const categories = useMemo(() => Array.from(new Set([...savedCategories, ...menuItems.map((item) => item.category)])).sort(), [savedCategories, menuItems]);

  const [shopName, setShopName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuIcon, setMenuIcon] = useState('☕');
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => { if (setting) setShopName(setting.shopName); }, [setting]);
  useEffect(() => { if (categories.length > 0 && !categories.includes(menuCategory)) setMenuCategory(categories[0]); }, [categories, menuCategory]);

  const ensureSettings = async (): Promise<number> => {
    if (setting?.id !== undefined) return setting.id;
    const id = await db.settings.add({ shopName: 'T POS', logoBase64: '', theme: 'light' });
    return id;
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextName = event.target.value;
    setShopName(nextName);
    void (async () => {
      const id = await ensureSettings();
      await db.settings.update(id, { shopName: nextName });
    })();
  };

  const handleThemeChange = async (theme: ThemeName) => {
    const id = await ensureSettings();
    await db.settings.update(id, { theme });
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  };

  const readImageUpload = async (event: ChangeEvent<HTMLInputElement>, field: 'logoBase64' | 'qrBase64') => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setNotice('ပုံဖိုင်အရွယ်အစား 3MB ထက် မကြီးစေရပါ။');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      const id = await ensureSettings();
      if (field === 'logoBase64') await db.settings.update(id, { logoBase64: reader.result });
      else await db.settings.update(id, { qrBase64: reader.result });
      setNotice(field === 'qrBase64' ? 'ဆိုင် QR ပုံ သိမ်းပြီးပါပြီ။' : 'ဆိုင် Logo သိမ်းပြီးပါပြီ။');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => { void readImageUpload(event, 'logoBase64'); };
  const handleQrUpload = (event: ChangeEvent<HTMLInputElement>) => { void readImageUpload(event, 'qrBase64'); };

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = newCategory.trim();
    if (!value) return;
    if (categories.some((category) => category.toLocaleLowerCase() === value.toLocaleLowerCase())) {
      setNotice('ဒီ Category ရှိပြီးသားပါ။');
      return;
    }
    await db.appMeta.put({ key: 'menuCategories', value: [...categories, value] });
    setNewCategory('');
    setMenuCategory(value);
    setNotice(`“${value}” Category ထည့်ပြီးပါပြီ။`);
  };

  const removeCategory = async (category: string) => {
    const used = menuItems.some((item) => item.category === category);
    if (used) {
      setNotice('ဒီ Category ကို Menu ပစ္စည်းတွေမှာ အသုံးပြုထားတဲ့အတွက် မဖျက်နိုင်ပါ။');
      return;
    }
    const next = categories.filter((item) => item !== category);
    await db.appMeta.put({ key: 'menuCategories', value: next });
    setNotice(`“${category}” Category ကို ဖယ်ရှားပြီးပါပြီ။`);
  };

  const resetMenuForm = () => {
    setMenuName('');
    setMenuPrice('');
    setMenuIcon('☕');
    setEditingMenuId(null);
  };

  const addMenuItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(menuPrice);
    if (!menuName.trim() || !Number.isFinite(price) || price <= 0 || !menuCategory) {
      setNotice('Menu အမည်၊ ဈေးနှုန်းနဲ့ Category ကို မှန်ကန်စွာ ဖြည့်ပါ။');
      return;
    }
    const item: Omit<MenuItem, 'id'> = { name: menuName.trim(), price, category: menuCategory, icon: menuIcon.trim() || '🍽️' };
    if (editingMenuId !== null) {
      await db.menu.update(editingMenuId, item);
      setNotice('Menu ပစ္စည်းကို ပြင်ဆင်သိမ်းဆည်းပြီးပါပြီ။');
    } else {
      await db.menu.add(item);
      setNotice('Menu ပစ္စည်းအသစ် ထည့်ပြီးပါပြီ။');
    }
    resetMenuForm();
  };

  const startEditMenuItem = (item: MenuItem) => {
    if (typeof item.id !== 'number') return;
    setEditingMenuId(item.id);
    setMenuName(item.name);
    setMenuPrice(String(item.price));
    setMenuIcon(item.icon ?? '🍽️');
    setMenuCategory(item.category);
    setNotice(`“${item.name}” ကို ပြင်ဆင်နေပါတယ်။`);
  };

  const deleteMenuItem = async (item: MenuItem) => {
    if (typeof item.id !== 'number') return;
    if (!window.confirm(`“${item.name}” ကို Menu မှ ဖယ်ရှားမှာ သေချာပါသလား။ အရောင်း Receipt အဟောင်းများကိုတော့ မဖျက်ပါ။`)) return;
    await db.menu.delete(item.id);
    if (editingMenuId === item.id) resetMenuForm();
    setNotice(`“${item.name}” ကို Menu မှ ဖယ်ရှားပြီးပါပြီ။`);
  };

  const exportToExcel = () => {
    if (receipts.length === 0) { window.alert('အရောင်းစာရင်း မရှိသေးပါ။'); return; }
    const flatData = receipts.flatMap((receipt) => receipt.items.map((item) => ({
      'နေ့စွဲ (Date)': new Date(receipt.date).toLocaleString('en-GB'),
      'ဘေလ်အမှတ် (Receipt)': receipt.receiptNo ?? receipt.id ?? '',
      'အော်ဒါ (Order)': receipt.identifier,
      'ငွေပေးချေမှု (Payment)': receipt.paymentMethod ?? '',
      'မီနူး (Item)': item.name,
      'အရေအတွက် (Qty)': item.qty,
      'ဈေးနှုန်း (Price)': item.price,
      'စုစုပေါင်း (Total)': item.qty * item.price,
      'ဘေလ်စုစုပေါင်း (Bill Total)': receipt.totalAmount,
    })));
    const csv = Papa.unparse(flatData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `T_POS_Sales_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDayClose = () => {
    if (window.confirm('အရောင်းစာရင်းအားလုံးကို CSV ဖိုင်အဖြစ် ဒေါင်းလုဒ်ရယူမလား?')) exportToExcel();
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-background p-4 pb-8 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-black text-text lg:text-3xl">ဆက်တင်များ (Settings)</h2>
        {notice && <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">{notice}<button type="button" onClick={() => setNotice('')} className="float-right">ပိတ်ရန်</button></div>}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <label className="mb-3 flex items-center gap-2 text-lg font-bold text-text"><Store className="text-primary" /> ဆိုင်အမည် (Shop Name)</label>
              <input type="text" value={shopName} onChange={handleNameChange} className="w-full rounded-xl border-2 border-gray-200/70 bg-background p-4 text-lg text-text outline-none transition focus:border-primary" placeholder="ဆိုင်အမည်" />
            </div>

            <div className="mb-6">
              <label className="mb-3 flex items-center gap-2 text-lg font-bold text-text"><Palette className="text-primary" /> အရောင် Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((option) => (
                  <button key={option.value} type="button" onClick={() => void handleThemeChange(option.value)} className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${setting?.theme === option.value ? 'border-primary bg-primary/5' : 'border-gray-200/70 bg-background hover:border-primary/40'}`}>
                    <span className={`h-8 w-8 shrink-0 rounded-full border border-black/10 ${option.value === 'light' ? 'bg-white' : option.value === 'dark' ? 'bg-gray-900' : option.value === 'tea' ? 'bg-amber-800' : 'bg-green-700'}`} />
                    <span><span className="block text-sm font-bold text-text">{option.label}</span><span className="block text-xs text-gray-500">{option.detail}</span></span>
                    {setting?.theme === option.value && <span className="ml-auto text-xs font-black text-primary">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-lg font-bold text-text"><ImageIcon className="text-primary" /> ဆိုင်လိုဂို (Logo)</label>
              <div className="flex items-center gap-5">
                {setting?.logoBase64 ? <img src={setting.logoBase64} alt="Shop logo" className="h-20 w-20 rounded-2xl border border-gray-200 object-cover shadow-sm" /> : <div className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-dashed border-gray-300 bg-background text-xs text-gray-400">No Logo</div>}
                <label className="cursor-pointer rounded-xl border-2 border-primary px-5 py-3 font-bold text-primary transition hover:bg-primary/5">ပုံရွေးမည်<input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label>
              </div>
            </div>
            <div className="mt-6 border-t border-gray-200/70 pt-5">
              <label className="mb-3 flex items-center gap-2 text-lg font-bold text-text"><ImageIcon className="text-primary" /> KPay / WavePay QR ပုံ</label>
              <div className="flex items-center gap-5">
                {setting?.qrBase64 ? <img src={setting.qrBase64} alt="Shop payment QR" className="h-24 w-24 rounded-xl border border-gray-200 bg-white object-contain p-1" /> : <div className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-gray-300 bg-background text-center text-xs text-gray-400">QR မရှိသေးပါ</div>}
                <div className="min-w-0"><label className="inline-block cursor-pointer rounded-xl border-2 border-primary px-4 py-3 text-sm font-bold text-primary hover:bg-primary/5">QR ပုံတင်မည်<input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} /></label><p className="mt-2 text-xs text-gray-500">ငွေရှင်းချိန် QR Payment ရွေးပါက ဒီပုံကို ပြသပါမယ်။ 3MB အောက်ပုံကို အသုံးပြုပါ။</p></div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2"><Tag className="text-primary" /><h3 className="text-lg font-black text-text">အစားအသောက် / Menu Category စီမံခန့်ခွဲမှု</h3></div>
            <p className="mb-3 text-xs leading-5 text-gray-500">ဥပမာ — လက်ဖက်ရည်၊ ကော်ဖီ၊ မုန့်၊ အကြော်၊ အသုပ်၊ ထမင်း/ဟင်း စသည်ဖြင့် ဆိုင်မှာရောင်းတဲ့အမျိုးအစားအလိုက် ကိုယ်တိုင် Category အသစ်ထည့်နိုင်ပါတယ်။</p>
            <form onSubmit={(event) => void addCategory(event)} className="mb-4 flex gap-2">
              <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-200/70 bg-background px-3 py-3 text-text outline-none focus:border-primary" placeholder="Category အသစ်အမည်" />
              <button type="submit" className="flex shrink-0 items-center gap-1 rounded-xl bg-primary px-4 py-3 font-bold text-white"><Plus size={17} /> ထည့်မည်</button>
            </form>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-background px-3 py-2.5"><span className="font-semibold text-text">{category}</span><button type="button" onClick={() => void removeCategory(category)} className="rounded-lg p-2 text-red-500 hover:bg-red-500/10" aria-label={`${category} ဖယ်ရှားရန်`}><Trash2 size={16} /></button></div>
              ))}
              {categories.length === 0 && <p className="py-4 text-center text-sm text-gray-500">Category မရှိသေးပါ။</p>}
            </div>

            <div className="mb-4 mt-7 flex items-center gap-2"><Utensils className="text-primary" /><h3 className="text-lg font-black text-text">အစားအသောက် / Menu ပစ္စည်းထည့်ရန်</h3></div>
            <form onSubmit={(event) => void addMenuItem(event)} className="grid grid-cols-2 gap-2">
              <input value={menuName} onChange={(event) => setMenuName(event.target.value)} className="col-span-2 rounded-xl border border-gray-200/70 bg-background px-3 py-3 text-text outline-none focus:border-primary" placeholder="ပစ္စည်းအမည်" />
              <input value={menuPrice} onChange={(event) => setMenuPrice(event.target.value)} type="number" min="1" className="min-w-0 rounded-xl border border-gray-200/70 bg-background px-3 py-3 text-text outline-none focus:border-primary" placeholder="ဈေးနှုန်း (Ks)" />
              <input value={menuIcon} onChange={(event) => setMenuIcon(event.target.value)} className="min-w-0 rounded-xl border border-gray-200/70 bg-background px-3 py-3 text-text outline-none focus:border-primary" placeholder="Emoji Icon" />
              <select value={menuCategory} onChange={(event) => setMenuCategory(event.target.value)} className="col-span-2 rounded-xl border border-gray-200/70 bg-background px-3 py-3 text-text outline-none focus:border-primary"><option value="">Category ရွေးပါ</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
              <button type="submit" disabled={categories.length === 0} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white disabled:opacity-40">{editingMenuId !== null ? <><Save size={18} /> ပြင်ဆင်မှုသိမ်းမည်</> : <><Plus size={18} /> Menu ထည့်မည်</>}</button>
              {editingMenuId !== null && <button type="button" onClick={resetMenuForm} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 font-bold text-gray-500"><X size={17} /> မပြင်တော့ပါ</button>}
            </form>

            <div className="mb-3 mt-7 flex items-center justify-between gap-3">
              <h4 className="font-black text-text">ရှိပြီးသား Menu များ</h4>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{menuItems.length} မျိုး</span>
            </div>
            <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
              {categories.map((category) => {
                const categoryItems = menuItems.filter((item) => item.category === category);
                if (categoryItems.length === 0) return null;
                return (
                  <div key={category} className="overflow-hidden rounded-xl border border-gray-200/70">
                    <div className="flex items-center justify-between bg-background px-3 py-2"><span className="text-sm font-black text-primary">{category}</span><span className="text-xs text-gray-500">{categoryItems.length} မျိုး</span></div>
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 border-t border-gray-200/60 px-3 py-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-xl">{item.icon || '🍽️'}</span>
                        <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-text">{item.name}</div><div className="text-xs font-semibold text-primary">{item.price.toLocaleString()} Ks</div></div>
                        <button type="button" onClick={() => startEditMenuItem(item)} className="rounded-lg p-2 text-primary hover:bg-primary/10" aria-label={`${item.name} ပြင်ရန်`}><Pencil size={16} /></button>
                        <button type="button" onClick={() => void deleteMenuItem(item)} className="rounded-lg p-2 text-red-500 hover:bg-red-500/10" aria-label={`${item.name} ဖယ်ရှားရန်`}><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                );
              })}
              {menuItems.length === 0 && <p className="rounded-xl bg-background py-5 text-center text-sm text-gray-500">Menu မရှိသေးပါ။ အပေါ်က Form မှ ပထမဆုံးပစ္စည်းကို ထည့်နိုင်ပါတယ်။</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200/70 bg-surface p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="text-xl font-black text-text">စာရင်းပိတ် / အရောင်း Backup</h3><p className="mt-1 text-sm text-gray-500">သိမ်းထားသော Receipt များကို Myanmar စာလုံးမှန်ကန်စွာဖတ်နိုင်သည့် UTF-8 CSV အဖြစ် ထုတ်ယူပါ။</p></div>
              <div className="flex items-center gap-4 rounded-xl bg-primary/5 px-4 py-3"><div><div className="text-xs font-bold text-gray-500">Receipt အရေအတွက်</div><div className="text-2xl font-black text-primary">{receipts.length} စောင်</div></div><button type="button" onClick={handleDayClose} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-sm"><Download size={18} /> CSV Export</button></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
