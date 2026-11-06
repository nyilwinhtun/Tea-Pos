import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle2, Printer, X, Banknote, QrCode, Receipt as ReceiptIcon } from 'lucide-react';
import { db, type Receipt } from '../db';

interface ReceiptSummaryProps {
  receipt: Receipt;
  onClose: () => void;
}

export default function ReceiptSummary({ receipt, onClose }: ReceiptSummaryProps) {
  const settingRows = useLiveQuery(() => db.settings.toArray());
  const shopName = settingRows?.[0]?.shopName ?? 'T POS';
  const date = new Date(receipt.date);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/70 p-3 backdrop-blur-sm sm:p-5">
      <section className="flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
        <header className="shrink-0 bg-emerald-600 px-5 py-5 text-center text-white">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-white/15"><CheckCircle2 size={29} /></div>
          <h2 className="text-xl font-black">ငွေရှင်းအောင်မြင်ပါပြီ</h2>
          <p className="mt-1 text-sm text-white/80">{receipt.receiptNo ?? `Receipt #${receipt.id ?? ''}`}</p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="mb-4 text-center"><div className="text-lg font-black text-text">{shopName}</div><div className="mt-1 text-xs text-gray-500">{date.toLocaleString()}</div></div>
          <div className="mb-4 flex items-center justify-between rounded-xl bg-background p-3"><div><div className="text-xs text-gray-500">အော်ဒါအမှတ်</div><div className="font-black text-text">{receipt.identifier}</div></div><div className="text-right"><div className="text-xs text-gray-500">ငွေပေးချေမှု</div><div className="flex items-center justify-end gap-1 font-bold text-primary">{receipt.paymentMethod === 'qr' ? <><QrCode size={15} /> QR</> : <><Banknote size={15} /> Cash</>}</div></div></div>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-text"><ReceiptIcon size={17} className="text-primary" /> အရောင်းစာရင်းအသေးစိတ်</div>
          <div className="overflow-hidden rounded-xl border border-gray-200/70">
            <div className="grid grid-cols-[minmax(0,1fr)_48px_92px] gap-2 bg-background px-3 py-2 text-[11px] font-bold text-gray-500"><span>ပစ္စည်း</span><span className="text-center">အရေ</span><span className="text-right">ကျသင့်ငွေ</span></div>
            {receipt.items.map((item, index) => <div key={`${item.id}-${index}`} className="grid grid-cols-[minmax(0,1fr)_48px_92px] gap-2 border-t border-gray-200/60 px-3 py-3 text-sm"><div className="min-w-0"><div className="break-words font-semibold text-text">{item.name}</div><div className="text-[11px] text-gray-500">{item.price.toLocaleString()} Ks / ခု</div></div><div className="self-center text-center font-bold text-text">{item.qty}</div><div className="self-center text-right font-bold text-text">{(item.qty * item.price).toLocaleString()}</div></div>)}
          </div>
          <div className="mt-4 space-y-2 rounded-xl bg-background p-3 text-sm">
            <div className="flex justify-between text-gray-500"><span>ကျသင့်ငွေ</span><span>{receipt.totalAmount.toLocaleString()} Ks</span></div>
            <div className="flex justify-between text-gray-500"><span>လက်ခံရရှိငွေ</span><span>{(receipt.receivedAmount ?? receipt.totalAmount).toLocaleString()} Ks</span></div>
            {receipt.paymentMethod === 'cash' && <div className="flex justify-between text-gray-500"><span>ပြန်အမ်းငွေ</span><span>{(receipt.changeAmount ?? 0).toLocaleString()} Ks</span></div>}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-black text-primary"><span>စုစုပေါင်း</span><span>{receipt.totalAmount.toLocaleString()} Ks</span></div>
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">စာရွက်ဘေလ် မယူလည်း ဒီဖုန်းမျက်နှာပြင်မှာ စာရင်းကို ပြန်လည်စစ်ဆေးနိုင်ပါတယ်။</p>
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-gray-200/60 bg-surface p-4">
          <button type="button" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 font-bold text-text"><X size={17} /> ပြီးပါပြီ</button>
          <button type="button" onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 font-bold text-white"><Printer size={17} /> ဘေလ်ထုတ်မည်</button>
        </footer>
      </section>
    </div>
  );
}
