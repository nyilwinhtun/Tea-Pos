import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MenuSection from './components/MenuSection';
import CartSection from './components/CartSection';
import SettingsSection from './components/SettingsSection';
import TableManagementSection from './components/TableManagementSection';
import ParcelManagementSection from './components/ParcelManagementSection';
import BottomNavigation from './components/BottomNavigation';
import InstallBanner from './components/InstallBanner';
import CheckoutModal from './components/CheckoutModal';
import ReceiptSummary from './components/ReceiptSummary';
import PrintReceipt from './components/PrintReceipt';
import { useStore } from './store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

export default function App() {
  const { activeTab, isCheckoutOpen, mobileView, isHydrated, hydrateOrders, lastCompletedReceipt, setLastCompletedReceipt } = useStore();
  const settings = useLiveQuery(() => db.settings.toArray());
  const theme = settings?.[0]?.theme ?? 'light';

  useEffect(() => {
    void hydrateOrders().catch((error: unknown) => console.error('T POS could not restore saved orders:', error));
  }, [hydrateOrders]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    const themeColors = { light: '#f3f4f6', dark: '#111827', tea: '#f7efe4', matcha: '#edf5eb' } as const;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme]);
  }, [theme]);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-background font-sans text-text md:flex-row">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {activeTab === 'pos' ? (
          <>
            <div className={`${mobileView === 'menu' ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-1 md:flex`}><MenuSection /></div>
            <CartSection />
          </>
        ) : activeTab === 'tables' ? <TableManagementSection /> : activeTab === 'parcels' ? <ParcelManagementSection /> : <SettingsSection />}
      </main>
      <BottomNavigation />

      {!isHydrated && activeTab === 'pos' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 text-text">
          <div className="rounded-2xl bg-surface px-6 py-5 text-center shadow-lg"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /><p className="font-bold">သိမ်းထားသော အော်ဒါများကို ပြန်ဖွင့်နေသည်...</p></div>
        </div>
      )}
      {isCheckoutOpen && <CheckoutModal />}
      {lastCompletedReceipt && <ReceiptSummary receipt={lastCompletedReceipt} onClose={() => setLastCompletedReceipt(null)} />}
      <InstallBanner />
      <PrintReceipt />
    </div>
  );
}
