import { useStore } from '../store';
import { Plus, Minus, Table2, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TableManagementSection() {
  const { tableCount, addTable, removeLastTable, carts, activeOrderKey, setActiveOrderKey, setActiveTab } = useStore();
  const tables = Array.from({ length: tableCount }, (_, index) => `Table-${index + 1}`);

  const handleRemove = async () => {
    const result = await removeLastTable();
    if (!result.ok) window.alert(result.message);
  };

  const openTable = (key: string) => {
    setActiveOrderKey(key);
    setActiveTab('pos');
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-background p-4 pb-8 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary"><Table2 size={22} /><span className="font-bold">TABLE MANAGEMENT</span></div>
            <h1 className="text-2xl font-black text-text sm:text-3xl">စားပွဲဝိုင်း စီမံခန့်ခွဲမှု</h1>
            <p className="mt-1 text-sm text-gray-500">စားပွဲအသစ်ထည့်ခြင်း၊ လျှော့ခြင်းနှင့် အော်ဒါဖွင့်ခြင်း</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-surface p-2 shadow-sm">
            <button type="button" onClick={() => void handleRemove()} disabled={tableCount <= 1} className="grid h-11 w-11 place-items-center rounded-xl border border-gray-200 text-text transition hover:bg-background disabled:opacity-40" aria-label="စားပွဲတစ်လုံးလျှော့ရန်" title="စားပွဲလျှော့ရန်"><Minus size={20} /></button>
            <div className="min-w-20 text-center"><div className="text-2xl font-black text-primary">{tableCount}</div><div className="text-[11px] font-semibold text-gray-500">စားပွဲ</div></div>
            <button type="button" onClick={() => void addTable()} disabled={tableCount >= 30} className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-sm transition hover:opacity-90 disabled:opacity-40" aria-label="စားပွဲအသစ်ထည့်ရန်" title="စားပွဲတိုးရန်"><Plus size={20} /></button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> အော်ဒါရှိ</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> လက်ရှိရွေးထား</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> အလွတ်</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {tables.map((key) => {
            const items = carts[key] ?? [];
            const quantity = items.reduce((sum, item) => sum + item.qty, 0);
            const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
            const hasOrder = items.length > 0;
            const isActive = activeOrderKey === key;
            return (
              <button key={key} type="button" onClick={() => openTable(key)} className={`relative flex min-h-40 flex-col rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-44 sm:p-5 ${isActive ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-gray-200/70 bg-surface'}`}>
                <div className="mb-4 flex w-full items-start justify-between">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${hasOrder ? 'bg-emerald-500/10 text-emerald-600' : 'bg-background text-primary'}`}><Table2 size={27} strokeWidth={1.9} /></div>
                  {isActive ? <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white">ရွေးထား</span> : hasOrder ? <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600">အော်ဒါရှိ</span> : <CheckCircle2 size={18} className="text-gray-300" />}
                </div>
                <div className="text-lg font-black text-text">စားပွဲ {key.slice(6)}</div>
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
        <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-gray-500">မှတ်ချက် — နောက်ဆုံးစားပွဲမှာ အော်ဒါရှိနေပါက စားပွဲလျှော့လို့မရပါ။ အော်ဒါမရှင်းဘဲ စားပွဲကိုဖျက်မိခြင်းကြောင့် စာရင်းပျောက်မသွားစေရန် ကာကွယ်ထားပါတယ်။</p>
      </div>
    </section>
  );
}
