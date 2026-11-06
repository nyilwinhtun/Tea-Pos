# PWA Install Banner Fix (Phase 1.2.1)

## What changed
- The custom install banner is now visible on browsers that are not already running the app in standalone mode.
- When `beforeinstallprompt` is available, the banner shows a real Install button and invokes the browser prompt.
- When the event is unavailable, the banner shows a platform-specific manual install guide instead of disappearing.
- iOS guidance explains that installation must be performed from Safari.
- Vite PWA `devOptions.enabled` is enabled so the service worker can be tested during local development.

## Important limitations
- A custom button cannot force an installation prompt when the browser does not expose `beforeinstallprompt`. The fallback button therefore opens instructions, not a fake install action.
- Browser installation eligibility still depends on a valid manifest, service worker, secure context, supported browser, and browser policy.
- On iPhone/iPad, use Safari > Share > Add to Home Screen.

## Test
1. Run `npm install`.
2. Run `npm run dev -- --port 5175 --strictPort`.
3. Open `http://localhost:5175` in Chrome and confirm the banner appears.
4. Check that Android Chrome shows the Install button when the browser fires `beforeinstallprompt`; otherwise use the guide button.
5. Build and preview (`npm run build`, then `npm run preview`) and verify install behavior again.
6. After installing, launch the app from the Home Screen/app launcher and confirm the banner is hidden.
