import { useEffect, useState } from 'react';
import { Download, X, Share, Smartphone, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type InstallPlatform = 'ios' | 'android' | 'desktop';

export default function InstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<InstallPlatform>('desktop');
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const userAgent = navigator.userAgent.toLowerCase();
    const detectedPlatform: InstallPlatform = /iphone|ipad|ipod/.test(userAgent)
      ? 'ios'
      : /android/.test(userAgent)
        ? 'android'
        : 'desktop';
    setPlatform(detectedPlatform);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setShowInstructions(false);
      setDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') setDismissed(true);
    } catch (error) {
      console.error('T POS install prompt failed:', error);
      setShowInstructions(true);
    } finally {
      setInstallEvent(null);
    }
  };

  if (dismissed) return null;

  const instruction = platform === 'ios'
    ? 'Safari ဖြင့်ဖွင့်ပြီး Share ကိုနှိပ်ပါ။ ထို့နောက် Add to Home Screen ကိုရွေးပါ။'
    : platform === 'android'
      ? 'Chrome ၏ ⋮ Menu ကိုနှိပ်ပြီး Install app သို့မဟုတ် Add to Home screen ကိုရွေးပါ။'
      : 'Chrome ၏ ⋮ Menu မှ Cast, save and share > Install page as app ကိုရွေးပါ။';

  return (
    <>
      <div className="fixed bottom-[146px] left-3 right-3 z-[45] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-primary/20 bg-surface p-3 shadow-2xl md:bottom-4 md:left-auto md:right-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Smartphone size={23} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-text">T POS App ထည့်သွင်းရန်</div>
          <p className="text-xs leading-4 text-gray-500">
            {installEvent
              ? 'Home Screen မှာ App အဖြစ် ထည့်သွင်းအသုံးပြုနိုင်ပါပြီ။'
              : platform === 'ios'
                ? <>Share <Share size={12} className="inline" /> ကိုနှိပ်ပြီး Add to Home Screen ကိုရွေးပါ။</>
                : 'ဒီ Browser မှာ Install ခလုတ် မရသေးပါက Install လုပ်နည်းကို ကြည့်ပါ။'}
          </p>
        </div>
        {installEvent ? (
          <button
            type="button"
            onClick={() => void install()}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white"
          >
            <Download size={16} /> Install
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white"
          >
            <Info size={16} /> လမ်းညွှန်
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="ပိတ်ရန်"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-background"
        >
          <X size={18} />
        </button>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-3 md:items-center">
          <div className="w-full max-w-md rounded-2xl bg-surface p-5 text-text shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">T POS Install လုပ်နည်း</h2>
              <button type="button" onClick={() => setShowInstructions(false)} aria-label="ပိတ်ရန်" className="rounded-lg p-2 hover:bg-background">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm leading-6 text-gray-600">{instruction}</p>
            {platform === 'ios' && <p className="mt-2 text-xs text-gray-500">မှတ်ချက် - iPhone တွင် Safari မှတစ်ဆင့် Install လုပ်ပါ။ Chrome မှာ Add to Home Screen ရွေးချယ်မှု မပေါ်နိုင်ပါ။</p>}
            <button type="button" onClick={() => setShowInstructions(false)} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-bold text-white">နားလည်ပါပြီ</button>
          </div>
        </div>
      )}
    </>
  );
}
