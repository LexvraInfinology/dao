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
    window.postMessage({ target: 'trobsafe-inpage', action: 'connect' }, '*');
    window.postMessage({ type: 'TROBSAFE_CONNECT' }, '*');
    window.postMessage({ type: 'TROBSAFE_REQUEST_ACCOUNTS' }, '*');
    window.dispatchEvent(new CustomEvent('trob_requestAccounts'));
    window.dispatchEvent(new CustomEvent('trobSafe_connect'));
    window.dispatchEvent(new CustomEvent('trobReady'));
  } catch {
    // Ignore message errors
  }
}

/**
 * Primary Smart Connect Wallet flow:
 *
 * 1. PC / Laptop:
 *    - If extension is installed: Automatically wakes up and opens the TrobSafe extension.
 *    - If extension is NOT installed (new user): Automatically opens the Chrome Web Store extension page
 *      in a new tab AND opens the modal for quick connection once added.
 *
 * 2. Mobile:
 *    - If inside TrobSafe in-app dApp browser: Connects immediately.
 *    - Otherwise: Automatically triggers download/redirect to the .apk file and opens modal with setup info.
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
    // If inside TrobSafe's in-app dApp browser where wallet is already injected
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
  if (wallet.isInstalled) {
    // Existing user or installed extension:
    // Automatically wake up and prompt the extension
    wakeUpExtension();
    try {
      const addr = await wallet.connect();
      if (addr) {
        const addrStr = addr.base58 || addr.hex || '';
        if (addrStr && onConnected) onConnected(addrStr);
        return;
      }
    } catch {
      // User cancelled, locked, or error -> show modal
      openModal();
      return;
    }
  } else {
    // New user on PC/Laptop without extension:
    // Automatically open the Chrome Web Store extension page in a new tab
    window.open(TROBSAFE_CHROME_STORE_URL, '_blank', 'noopener,noreferrer');
    openModal();
  }
}
