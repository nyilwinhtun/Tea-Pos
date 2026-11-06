import { useMemo } from 'react';
import { ArrowRight, CheckCircle2, Minus, Package, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';

export default function ParcelManagementSection() {
  const {
    parcelKeys,
    createNewParcel,
    removeLastParcel,
    carts,
    activeOrderKey,
    setActiveOrderKey,
    setActiveTab,
  } = useStore();

  const parcels = useMemo(
    () => [...parcelKeys].sort((left, right) => Number(left.slice(2)) - Number(right.slice(2))),
    [parcelKeys],
  );

  const handleRemove = async () => {
    const lastKey = parcels[parcels.length - 1];
    if (!lastKey) {
      window.alert('ဖယ်ရှားရန် ပါဆယ်မရှိသေးပါ။');
      return;
    }
    if (!window.confirm(`${lastKey} ကို ဖယ်ရှားမှာ သေချာပါသလား။ အော်ဒါရှိပါက ဖယ်ရှားလို့မရပါ။`)) return;
    const result = await removeLastParcel();
    if (!result.ok) window.alert(result.message);
  };

  const openParcel = (key: string) => {
    setActiveOrderKey(key);
    setActiveTab('pos');
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-background p-4 pb-24 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary"><Package size={22} /><span className="font-bold">PARCEL MANAGEMENT</span></div>
            <h1 className="text-2xl font-black text-text sm:text-3xl">ပါဆယ် စီမံခန့်ခွဲမှု</h1>
            <p className="mt-1 text-sm text-gray-500">ပါဆယ်အသစ်ဖွင့်ခြင်း၊ အော်ဒါကြည့်ခြင်းနှင့် အလွတ်ပါဆယ် ဖယ်ရှားခြင်း</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-surface p-2 shadow-sm">
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={parcels.length === 0}
              className="grid h-11 w-11 place-items-center rounded-xl border border-gray-200 text-text transition hover:bg-background disabled:opacity-40"
              aria-label="နောက်ဆုံးပါဆယ်တစ်ခုလျှော့ရန်"
              title="နောက်ဆုံးပါဆယ်ဖယ်ရှားရန်"
            >
              <Minus size={20} />
            </button>
            <div className="min-w-20 text-center">
              <div className="text-2xl font-black text-primary">{parcels.length}</div>
              <div className="text-[11px] font-semibold text-gray-500">ပါဆယ်</div>
            </div>
            <button
              type="button"
              onClick={createNewParcel}
              disabled={parcels.length >= 50}
              className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
              aria-label="ပါဆယ်အသစ်ထည့်ရန်"
              title="ပါဆယ်အသစ်ထည့်ရန်"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> အော်ဒါရှိ</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> လက်ရှိရွေးထား</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> အလွတ်</span>
        </div>

        {parcels.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-surface px-5 text-center">
            <div className="mb-3 rounded-2xl bg-primary/10 p-4 text-primary"><Package size={32} /></div>
            <h2 className="text-lg font-black text-text">ပါဆယ်မရှိသေးပါ</h2>
            <p className="mt-1 max-w-sm text-sm text-gray-500">+ ကိုနှိပ်ပြီး ပါဆယ်အသစ်ဖွင့်ပါ။ P-1, P-2 အစဉ်လိုက် အလိုအလျောက်နံပါတ်ပေးပါမယ်။</p>
            <button type="button" onClick={createNewParcel} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white"><Plus size={18} /> ပါဆယ်အသစ်ဖွင့်မည်</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {parcels.map((key) => {
              const items = carts[key] ?? [];
              const quantity = items.reduce((sum, item) => sum + item.qty, 0);
              const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
              const hasOrder = items.length > 0;
              const isActive = activeOrderKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openParcel(key)}
                  className={`relative flex min-h-40 flex-col rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-44 sm:p-5 ${isActive ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-gray-200/70 bg-surface'}`}
                >
                  <div className="mb-4 flex w-full items-start justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${hasOrder ? 'bg-emerald-500/10 text-emerald-600' : 'bg-background text-primary'}`}><ShoppingBag size={26} strokeWidth={1.9} /></div>
                    {isActive ? <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">ရွေးထား</span> : hasOrder ? <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600">အော်ဒါရှိ</span> : <CheckCircle2 size={18} className="text-gray-300" />}
                  </div>
                  <div className="text-lg font-black text-text">{key}</div>
                  {hasOrder ? (
                    <div className="mt-2 w-full">
                      <div className="flex items-center justify-between text-xs text-gray-500"><span>{quantity} ခု</span><ShoppingBag size={14} /></div>
                      <div className="mt-1 text-base font-black text-primary">{total.toLocaleString()} Ks</div>
                    </div>
                  ) : <div className="mt-2 text-xs text-gray-500">အော်ဒါမရှိသေးပါ</div>}
                  <div className="mt-auto flex items-center justify-end gap-1 pt-3 text-xs font-bold text-primary">အော်ဒါဖွင့်ရန် <ArrowRight size={14} /></div>
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-gray-500">
          မှတ်ချက် — နောက်ဆုံးပါဆယ်မှာ အော်ဒါရှိနေပါက ဖယ်ရှားလို့မရပါ။ ငွေရှင်းပြီးတဲ့ ပါဆယ်ကို အလုပ်လုပ်နေသောစာရင်းမှ အလိုအလျောက်ဖယ်ရှားပြီး Receipt မှတ်တမ်းကိုတော့ မဖျက်ပါ။ ပါဆယ်နံပါတ်ဟောင်းကို ထပ်မသုံးဘဲ နံပါတ်အသစ် ဆက်ပေးပါမယ်။
        </p>
      </div>
    </section>
  );
}
