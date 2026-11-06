import { useMemo } from 'react';
import { useStore } from '../store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Package, ShoppingCart, ClipboardList } from 'lucide-react';

export default function MenuSection() {
  const { activeCategory, setActiveCategory, addToCart, activeOrderKey, carts, setMobileView, setActiveTab } = useStore();
  const allItems = useLiveQuery(() => db.menu.toArray()) ?? [];
  const categoryMeta = useLiveQuery(() => db.appMeta.get('menuCategories'));
  const savedCategories = Array.isArray(categoryMeta?.value) ? categoryMeta.value : [];
  const categories = useMemo(
    () => ['အားလုံး', ...Array.from(new Set([...savedCategories, ...allItems.map((item) => item.category)])).filter((value): value is string => typeof value === 'string' && value.trim().length > 0).sort()],
    [allItems, savedCategories],
  );
  const displayedItems = activeCategory === 'အားလုံး' ? allItems : allItems.filter((item) => item.category === activeCategory);
  const currentCart = carts[activeOrderKey] ?? [];
  const cartItemCount = currentCart.reduce((total, item) => total + item.qty, 0);
  const cartTotal = currentCart.reduce((total, item) => total + item.price * item.qty, 0);

  return (
    <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="z-20 flex-shrink-0 border-b border-gray-200/70 bg-surface p-3 shadow-sm sm:p-4 lg:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardList size={19} className="shrink-0 text-primary" />
            <div className="min-w-0"><div className="text-xs font-semibold text-gray-500">လက်ရှိအော်ဒါ</div><div className="truncate text-lg font-black text-text">{activeOrderKey}</div></div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab(activeOrderKey.startsWith('P-') ? 'parcels' : 'tables')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/10"
          >
            {activeOrderKey.startsWith('P-') ? <Package size={16} /> : <ClipboardList size={16} />}
            {activeOrderKey.startsWith('P-') ? 'ပါဆယ်စီမံ' : 'စားပွဲစီမံ'}
          </button>
        </div>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${activeCategory === category ? 'bg-primary text-white shadow-md' : 'bg-background text-gray-600 hover:bg-gray-200/50'}`}>{category}</button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-24 sm:p-4 lg:p-6">
        {displayedItems.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center text-center text-gray-400">ဒီ Category မှာ Menu မရှိသေးပါ။ Settings မှ Menu ပစ္စည်းအသစ်ထည့်နိုင်ပါတယ်။</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {displayedItems.map((item) => (
              <button key={item.id} type="button" onClick={() => addToCart(item)} className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-gray-200/70 bg-surface p-3 text-center shadow-sm transition hover:border-primary hover:shadow-lg active:scale-[0.98] sm:min-h-40 sm:p-4 lg:min-h-48 lg:p-6">
                <span className="mb-2 text-3xl sm:mb-3 sm:text-5xl">{item.icon || '🍽️'}</span>
                <span className="mb-1 text-sm font-bold text-text sm:text-base lg:text-lg">{item.name}</span>
                <span className="text-base font-bold text-primary sm:text-lg lg:text-xl">{item.price.toLocaleString()} Ks</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={() => setMobileView('cart')} className="fixed bottom-[76px] right-4 z-30 flex items-center gap-3 rounded-2xl bg-primary px-5 py-3 font-bold text-white shadow-xl md:hidden">
        <ShoppingCart size={20} /><span>အော်ဒါ ({cartItemCount})</span><span className="border-l border-white/30 pl-3">{cartTotal.toLocaleString()} Ks</span>
      </button>
    </section>
  );
}
