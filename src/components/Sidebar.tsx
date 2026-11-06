import { Coffee, Package, Settings, ShoppingCart, Table2 } from 'lucide-react';
import { useStore } from '../store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function Sidebar() {
  const { activeTab, setActiveTab, setMobileView } = useStore();
  const settings = useLiveQuery(() => db.settings.toArray());
  const logo = settings?.[0]?.logoBase64;
  const navigation = [
    { id: 'pos' as const, label: 'POS', Icon: ShoppingCart },
    { id: 'tables' as const, label: 'Tables', Icon: Table2 },
    { id: 'parcels' as const, label: 'Parcel', Icon: Package },
    { id: 'settings' as const, label: 'Settings', Icon: Settings },
  ];
  return (
    <aside className="z-30 hidden h-full w-20 shrink-0 flex-col items-center gap-5 border-r border-gray-200/70 bg-surface py-5 shadow-sm lg:w-24 md:flex">
      {logo ? <img src={logo} alt="Shop Logo" className="mb-1 h-12 w-12 rounded-xl border border-gray-200/50 object-cover shadow-sm lg:h-14 lg:w-14" /> : <div className="mb-1 rounded-xl bg-primary/10 p-3 text-primary"><Coffee size={25} /></div>}
      {navigation.map(({ id, label, Icon }) => (
        <button key={id} type="button" onClick={() => { setActiveTab(id); if (id === 'pos') setMobileView('menu'); }} className={`flex w-14 flex-col items-center gap-1 rounded-2xl p-2.5 transition-all ${activeTab === id ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-background'}`} title={label} aria-label={label}>
          <Icon size={22} /><span className="text-[10px] font-bold">{label}</span>
        </button>
      ))}
    </aside>
  );
}
