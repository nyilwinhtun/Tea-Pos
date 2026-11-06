import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useStore } from '../store';
import { db, type Receipt } from '../db';
import { Printer, X, Banknote, QrCode, CheckCircle2 } from 'lucide-react';

type PaymentMethod = 'cash' | 'qr';

export default function CheckoutModal() {
  const { carts, activeOrderKey, setCheckoutOpen, clearActiveCart, setLastCompletedReceipt } = useStore();
  const currentCart = carts[activeOrderKey] ?? [];
  const settingRows = useLiveQuery(() => db.settings.toArray());
  const shopQr = settingRows?.[0]?.qrBase64;
  const totalAmount = currentCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [receivedCash, setReceivedCash] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [qrConfirmed, setQrConfirmed] = useState(false);
  const [error, setError] = useState('');
  const change = receivedCash - totalAmount;

  const handleCheckout = async (shouldPrint: boolean) => {
    setError('');
    if (currentCart.length === 0 || totalAmount <= 0) {
      setError('အော်ဒါထဲမှာ ပစ္စည်းမရှိပါ။');
      return;
    }
    if (paymentMethod === 'cash' && receivedCash < totalAmount) {
      setError('လက်ခံရရှိငွေက ကျသင့်ငွေထက် နည်းနေပါတယ်။');
      return;
    }
    if (paymentMethod === 'qr' && !qrConfirmed) {
      setError('QR ငွေလွှဲပြီးကြောင်း အတည်ပြုပေးပါ။');
      return;
    }

    const date = new Date().toISOString();
    const orderType = activeOrderKey.startsWith('Table-') ? 'dine-in' : 'parcel';
    const receivedAmount = paymentMethod === 'qr' ? totalAmount : receivedCash;
    const changeAmount = paymentMethod === 'qr' ? 0 : Math.max(0, receivedCash - totalAmount);
    const draft: Receipt = {
      date,
      createdAt: date,
      items: currentCart.map((item) => ({ ...item })),
      totalAmount,
      orderType,
      identifier: activeOrderKey,
      paymentMethod,
      receivedAmount,
      changeAmount,
    };

    try {
      const completedReceipt = await db.transaction('rw', db.receipts, async () => {
        const id = await db.receipts.add(draft);
        const receiptNo = `TP-${date.slice(2, 10).replace(/-/g, '')}-${String(id).padStart(4, '0')}`;
        await db.receipts.update(id, { receiptNo });
        return { ...draft, id, receiptNo };
      });
      setLastCompletedReceipt(completedReceipt);
      clearActiveCart();
      setCheckoutOpen(false);
      if (shouldPrint) window.setTimeout(() => window.print(), 350);
    } catch (checkoutError) {
      console.error('T POS could not save this receipt:', checkoutError);
      setError('ဘေလ်သိမ်းဆည်းမရပါ။ အော်ဒါမဖျက်ထားပါ၊ ထပ်မံကြိုးစားပါ။');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/65 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.6rem] bg-surface shadow-2xl">
        <div className="relative shrink-0 bg-primary px-5 py-6 text-center text-white sm:px-8 sm:py-8">
          <button type="button" onClick={() => setCheckoutOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 transition hover:bg-white/25" aria-label="ပိတ်ရန်"><X size={21} /></button>
          <div className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">{activeOrderKey}</div>
          <h2 className="mb-1 text-sm font-semibold text-white/80">ကျသင့်ငွေ စုစုပေါင်း</h2>
          <div className="break-words text-4xl font-black tracking-tight sm:text-6xl">{totalAmount.toLocaleString()} Ks</div>
        </div>

        <div className="min-h-0 overflow-y-auto p-4 sm:p-7">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-background p-1.5">
            <button type="button" onClick={() => { setPaymentMethod('cash'); setQrConfirmed(false); setError(''); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 font-bold ${paymentMethod === 'cash' ? 'bg-surface text-primary shadow-sm' : 'text-gray-500'}`}><Banknote size={19} /> ငွေသား</button>
            <button type="button" onClick={() => { setPaymentMethod('qr'); setQrConfirmed(false); setError(''); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 font-bold ${paymentMethod === 'qr' ? 'bg-surface text-primary shadow-sm' : 'text-gray-500'}`}><QrCode size={19} /> QR Payment</button>
          </div>

          {paymentMethod === 'cash' ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-200/70 bg-background p-3 text-center sm:p-4">
                  <div className="mb-2 text-xs font-bold text-gray-500 sm:text-sm">လက်ခံရရှိငွေ</div>
                  <input type="number" min="0" inputMode="numeric" value={receivedCash === 0 ? '' : receivedCash} onChange={(event) => setReceivedCash(Math.max(0, Number(event.target.value)))} placeholder="0" className="w-full bg-transparent text-center text-2xl font-black text-text outline-none sm:text-3xl" />
                </div>
                <div className="rounded-2xl border border-gray-200/70 bg-background p-3 text-center sm:p-4">
                  <div className="mb-2 text-xs font-bold text-gray-500 sm:text-sm">ပြန်အမ်းငွေ</div>
                  <div className={`pt-1 text-2xl font-black sm:text-3xl ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{Math.max(0, change).toLocaleString()}</div><div className="text-xs text-gray-500">Ks</div>
                </div>
              </div>
              <div className="mb-5 grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setReceivedCash(totalAmount)} className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm font-bold text-primary">အတိ</button>
                <button type="button" onClick={() => setReceivedCash(5000)} className="rounded-xl border border-gray-200/70 bg-background p-3 text-sm font-bold text-text">5,000</button>
                <button type="button" onClick={() => setReceivedCash(10000)} className="rounded-xl border border-gray-200/70 bg-background p-3 text-sm font-bold text-text">10,000</button>
              </div>
            </>
          ) : (
            <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3"><QrCode className="text-primary" size={28} /><div><div className="font-bold text-text">QR ငွေလွှဲရန်</div><div className="text-xs text-gray-500">ဆိုင် QR ဖြင့် ငွေလွှဲပြီးနောက် အတည်ပြုပါ။</div></div></div>
              {shopQr ? <img src={shopQr} alt="ဆိုင်ငွေလက်ခံ QR" className="mx-auto my-3 max-h-44 w-44 rounded-xl bg-white object-contain p-2" /> : <div className="my-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-center text-xs text-amber-700">ဆိုင် QR ပုံ မတင်ရသေးပါ။ Settings မှ KPay / WavePay QR ပုံကို အရင်တင်ပါ။</div>}
              <div className="my-3 text-center text-3xl font-black text-primary">{totalAmount.toLocaleString()} Ks</div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface p-3 text-sm font-semibold text-text"><input type="checkbox" checked={qrConfirmed} onChange={(event) => setQrConfirmed(event.target.checked)} className="h-5 w-5 accent-primary" /><span>ငွေလွှဲဝင်ရောက်ကြောင်း စစ်ဆေးပြီး အတည်ပြုပါသည်။</span></label>
            </div>
          )}

          {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm font-semibold text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => void handleCheckout(false)} className="flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-4 font-bold text-primary transition hover:bg-primary/15"><CheckCircle2 size={19} /> ငွေရှင်းမည်</button>
            <button type="button" onClick={() => void handleCheckout(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-4 font-bold text-white shadow-lg transition hover:opacity-90"><Printer size={19} /> ငွေရှင်း + ဘေလ်ထုတ်</button>
          </div>
          <p className="mt-3 text-center text-[11px] leading-4 text-gray-500">ငွေရှင်းအောင်မြင်ပါက Receipt ကို Database ထဲ အရင်သိမ်းပြီးမှ အော်ဒါကို ရှင်းလင်းပါမယ်။</p>
        </div>
      </div>
    </div>
  );
}
