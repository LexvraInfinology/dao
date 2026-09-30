/**
 * TrobSafe Wallet Smart Connect & Device Flow Manager
 *
 * Direct links:
 * - Chrome Web Store: https://chromewebstore.google.com/detail/trobsafe-wallet/hmijkpcbnkmkijljblhojfndfapidkkk
 * - Android APK: /downloads/trobsafe.apk
 */

export const TROBSAFE_CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/trobsafe-wallet/hmijkpcbnkmkijljblhojfndfapidkkk';

export const TROBSAFE_APK_URL = '/downloads/trobsafe.apk';

/**
 * Checks if the current client is on a mobile device (Android, iOS, etc.)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  return isMobileUa || (isTouch && window.innerWidth <= 800);
}

/**
 * Checks if the client is specifically on Android
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}

/**
 * Triggers automatic download of the TrobSafe Android APK
 */
export function triggerApkDownload(): void {
  if (typeof window === 'undefined') return;
  try {
    const a = document.createElement('a');
    a.href = TROBSAFE_APK_URL;
    a.download = 'trobsafe.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    // Fallback: direct window location
    window.location.href = TROBSAFE_APK_URL;
  }
}

/**
 * Triggers wakeup signals for the TrobSafe browser extension in-page bridge
 */
export function wakeUpExtension(): void {
  if (typeof window === 'undefined') return;
  try {
    // Standard window postMessage targets
    window.postMessage({ target: 'trobsafe-inpage', action: 'connect' }, '*');
    window.postMessage({ type: 'TROBSAFE_CONNECT' }, '*');
    window.postMessage({ type: 'TROBSAFE_REQUEST_ACCOUNTS' }, '*');
    window.postMessage({ target: 'trobsafe-contentscript', type: 'OPEN_SIDEBAR' }, '*');
    window.postMessage({ target: 'trobsafe-contentscript', type: 'OPEN_POPUP' }, '*');
    window.postMessage({ target: 'trobsafe', action: 'open' }, '*');

    // Custom events
    window.dispatchEvent(new CustomEvent('trob_requestAccounts'));
    window.dispatchEvent(new CustomEvent('trobSafe_connect'));
    window.dispatchEvent(new CustomEvent('trobReady'));
    window.dispatchEvent(new CustomEvent('trobLinkReady'));
    window.dispatchEvent(new CustomEvent('trobsafe_ready'));
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Optional Chromium extension runtime ping if available
    const w = window as any;
    if (typeof w.chrome?.runtime?.sendMessage === 'function') {
      try {
        w.chrome.runtime.sendMessage(
          'hmijkpcbnkmkijljblhojfndfapidkkk',
          { type: 'TROBSAFE_PING' },
          () => {}
        );
      } catch {
        /* runtime messaging restricted or unavailable */
      }
    }
  } catch {
    // Ignore message errors
  }
}

/**
 * Primary Smart Connect Wallet flow:
 *
 * 1. PC / Laptop:
 *    - Always broadcasts extension wakeup signals and attempts direct in-page connection.
 *    - Opens the connection modal if extension requires user approval or unlock.
 *    - Does NOT hijack the tab to Chrome Web Store when the user already has the extension.
 *
 * 2. Mobile:
 *    - If inside TrobSafe in-app dApp browser: Connects immediately.
 *    - Otherwise: Triggers download of the .apk file and opens modal with setup info.
 */
export async function triggerSmartConnectWallet({
  wallet,
  openModal,
  onConnected,
}: {
  wallet: {
    isInstalled: boolean;
    isConnected: boolean;
    connect: () => Promise<any>;
  };
  openModal: () => void;
  onConnected?: (address: string) => void;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  const isMobile = isMobileDevice();

  // 1. MOBILE FLOW:
  if (isMobile) {
    if (wallet.isInstalled) {
      try {
        wakeUpExtension();
        const addr = await wallet.connect();
        if (addr) {
          const addrStr = addr.base58 || addr.hex || '';
          if (addrStr && onConnected) onConnected(addrStr);
          return;
        }
      } catch {
        openModal();
        return;
      }
    }

    // Regular mobile browser: Automatically redirect/download the .apk file
    triggerApkDownload();
    openModal();
    return;
  }

  // 2. PC / LAPTOP (DESKTOP) FLOW:
  // Always wake up extension and try connecting directly
  wakeUpExtension();

  try {
    const addr = await wallet.connect();
    if (addr) {
      const addrStr = addr.base58 || addr.hex || '';
      if (addrStr && onConnected) onConnected(addrStr);
      return;
    }
  } catch {
    // User cancelled prompt or extension is locked -> open modal to help user
    openModal();
    return;
  }

  // If wallet.connect() returned null (e.g. extension injects slowly or needs unlock):
  // Open the modal so the user can wake it up or enter address
  openModal();
}
