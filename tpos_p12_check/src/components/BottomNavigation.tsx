import { Home, Package, Table2, Settings } from 'lucide-react';
import { useStore } from '../store';

export default function BottomNavigation() {
  const { activeTab, setActiveTab, setMobileView } = useStore();
  const items = [
    { id: 'pos' as const, label: 'အရောင်း', Icon: Home },
    { id: 'tables' as const, label: 'စားပွဲ', Icon: Table2 },
    { id: 'parcels' as const, label: 'ပါဆယ်', Icon: Package },
    { id: 'settings' as const, label: 'ဆက်တင်', Icon: Settings },
  ];
  return (
    <nav className="z-40 flex h-16 shrink-0 items-stretch justify-around border-t border-gray-200/70 bg-surface px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden" aria-label="အောက်ခြေ လမ်းညွှန်">
      {items.map(({ id, label, Icon }) => (
        <button key={id} type="button" onClick={() => { setActiveTab(id); if (id === 'pos') setMobileView('menu'); }} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${activeTab === id ? 'text-primary' : 'text-gray-500'}`} aria-current={activeTab === id ? 'page' : undefined}>
          <span className={`grid h-8 w-12 place-items-center rounded-xl transition ${activeTab === id ? 'bg-primary/10' : ''}`}><Icon size={21} strokeWidth={activeTab === id ? 2.5 : 2} /></span>
          {label}
        </button>
      ))}
    </nav>
  );
}
