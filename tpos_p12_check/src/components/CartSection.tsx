import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export default function CartSection() {
  const {
    carts,
    activeOrderKey,
    updateQty,
    removeCartItem,
    setCheckoutOpen,
    mobileView,
    setMobileView,
  } = useStore();
  const currentCart = carts[activeOrderKey] ?? [];
  const totalAmount = currentCart.reduce((total, item) => total + item.price * item.qty, 0);
  const isMobileCartVisible = mobileView === 'cart';

  return (
    <aside className={`z-40 flex min-h-0 flex-col border-l border-gray-200/20 bg-surface shadow-2xl ${
      isMobileCartVisible
        ? 'fixed bottom-16 left-0 right-0 top-0'
        : 'hidden'
    } md:static md:flex md:h-full md:w-[300px] md:flex-shrink-0 lg:w-[400px]`}>
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200/30 bg-background p-4 lg:p-6">
        <div className="flex items-center gap-2 text-xl font-bold text-text lg:text-2xl">
          <button
            type="button"
            onClick={() => setMobileView('menu')}
            className="mr-1 rounded-lg p-2 text-gray-500 hover:bg-surface md:hidden"
            aria-label="မီနူးသို့ပြန်သွားရန်"
          >
            <ArrowLeft size={20} />
          </button>
          <ShoppingCart className="text-primary" size={24} /> အော်ဒါ
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-bold text-primary lg:px-4 lg:text-base">
          {activeOrderKey}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-background/50 p-3 lg:p-4">
        {currentCart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <ShoppingCart size={56} className="mb-4 opacity-20" />
            <p className="text-base font-medium">မီနူးမှ ရွေးချယ်ပါ</p>
          </div>
        ) : currentCart.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-gray-200/50 bg-surface p-3 shadow-sm lg:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-base font-bold leading-tight text-text lg:text-lg">{item.name}</h3>
                <p className="text-sm font-medium text-gray-500">{item.price.toLocaleString()} Ks</p>
              </div>
              <button
                type="button"
                onClick={() => removeCartItem(item.id)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                title="ပစ္စည်းဖယ်ရှားရန်"
                aria-label={`${item.name} ဖယ်ရှားရန်`}
              >
                <Trash2 size={17} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-gray-200/50 bg-background p-1">
                <button
                  type="button"
                  onClick={() => updateQty(item.id, -1)}
                  className="rounded p-2 text-red-500 hover:bg-surface"
                  aria-label={`${item.name} အရေအတွက်လျှော့ရန်`}
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-lg font-bold text-text">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.id, 1)}
                  className="rounded p-2 text-green-600 hover:bg-surface"
                  aria-label={`${item.name} အရေအတွက်တိုးရန်`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-right text-base font-black text-primary lg:text-lg">
                {(item.price * item.qty).toLocaleString()} Ks
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 border-t border-gray-200/30 bg-surface p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:p-6">
        <div className="mb-4 flex justify-between text-xl font-black text-text lg:text-2xl">
          <span>Total:</span>
          <span className="text-primary">{totalAmount.toLocaleString()} Ks</span>
        </div>
        <button
          type="button"
          disabled={currentCart.length === 0}
          onClick={() => setCheckoutOpen(true)}
          className="w-full rounded-xl bg-primary py-4 text-xl font-bold text-surface shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 lg:py-5 lg:text-2xl"
        >
          ငွေရှင်းမည်
        </button>
      </div>
    </aside>
  );
}
