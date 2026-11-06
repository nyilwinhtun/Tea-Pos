import { useStore } from '../store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function PrintReceipt() {
  const receipt = useStore((state) => state.lastCompletedReceipt);
  const settings = useLiveQuery(() => db.settings.toArray());
  const setting = settings?.[0];
  if (!receipt) return null;

  return (
    <div id="printable-receipt" aria-hidden="true">
      <div className="text-center">
        {setting?.logoBase64 && <img src={setting.logoBase64} alt="Logo" className="mx-auto mb-2 h-16 w-16 object-contain" />}
        <h1 className="text-xl font-black">{setting?.shopName || 'T POS'}</h1>
        <p className="text-xs">{new Date(receipt.date).toLocaleString()}</p>
        <p className="my-2 border-y border-dashed border-black py-1 text-base font-bold">{receipt.identifier}</p>
        <p className="text-xs">{receipt.receiptNo ?? `Receipt #${receipt.id ?? ''}`}</p>
      </div>
      <table className="my-3 w-full text-xs">
        <thead><tr className="border-b border-black"><th className="py-1 text-left">Item</th><th className="py-1 text-center">Qty</th><th className="py-1 text-right">Amount</th></tr></thead>
        <tbody>{receipt.items.map((item, index) => <tr key={`${item.id}-${index}`} className="border-b border-dashed border-gray-400"><td className="py-1.5 pr-1">{item.name}<div className="text-[10px]">{item.price.toLocaleString()} Ks</div></td><td className="py-1.5 text-center">{item.qty}</td><td className="py-1.5 text-right">{(item.price * item.qty).toLocaleString()}</td></tr>)}</tbody>
      </table>
      <div className="space-y-1 border-t border-dashed border-black pt-2 text-xs">
        <div className="flex justify-between"><span>Payment</span><span>{receipt.paymentMethod === 'qr' ? 'QR' : 'Cash'}</span></div>
        <div className="flex justify-between"><span>Total</span><strong>{receipt.totalAmount.toLocaleString()} Ks</strong></div>
        <div className="flex justify-between"><span>Received</span><span>{(receipt.receivedAmount ?? receipt.totalAmount).toLocaleString()} Ks</span></div>
        {receipt.paymentMethod === 'cash' && <div className="flex justify-between"><span>Change</span><span>{(receipt.changeAmount ?? 0).toLocaleString()} Ks</span></div>}
      </div>
      <p className="mt-4 text-center text-xs font-bold">Thank You! Please come again.</p>
    </div>
  );
}
