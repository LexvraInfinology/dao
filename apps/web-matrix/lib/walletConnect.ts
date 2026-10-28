/**
 * TrobSafe Wallet Smart Connect & Device Flow Manager (apps/web-matrix/lib/walletConnect.ts)
 * Reused and aligned with apps/web-dao/src/utils/walletConnect.ts
 *
 * Direct links:
 * - Chrome Web Store: https://chromewebstore.google.com/detail/trobsafe-wallet/hmijkpcbnkmkijljblhojfndfapidkkk
 * - Android APK: /downloads/trobsafe.apk
 * - iOS App Store / TestFlight
 */

export const TROBSAFE_CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/trobsafe-wallet/hmijkpcbnkmkijljblhojfndfapidkkk";

export const TROBSAFE_APK_URL = "/downloads/trobsafe.apk";

export const TROBSAFE_APP_STORE_URL = "https://apps.apple.com/app/trobsafe/id0000000000";
export const TROBSAFE_TESTFLIGHT_URL = "https://testflight.apple.com/join/trobsafe";

/**
 * Checks if the current client is on a mobile device (Android, iOS, etc.)
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  return isMobileUa || (isTouch && window.innerWidth <= 800);
}

/**
 * Checks if the client is specifically on Android
 */
export function isAndroidDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

/**
 * Checks if the client is specifically on iOS (iPhone, iPad, iPod)
 */
export function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/**
 * Opens current DApp link directly inside the TrobSafe Mobile App DApp Browser
 */
export function openInTrobSafeApp(targetUrl?: string): void {
  if (typeof window === "undefined") return;
  const path = targetUrl || "/matrix";
  const current = path.startsWith("http") ? path : `${window.location.origin}${path}`;
  const encoded = encodeURIComponent(current);

  const isAndroid = isAndroidDevice();
  const deepLink = `trobsafe://browser?url=${encoded}`;

  if (isAndroid) {
    const targetPath = path.startsWith("http") ? new URL(path).pathname : path;
    const intentUrl = `intent://${window.location.host}${targetPath}#Intent;scheme=trobsafe;package=com.trobium.trobsafe;S.browser_fallback_url=${encoded};end`;
    try {
      window.location.href = deepLink;
    } catch {
      window.location.href = intentUrl;
    }
  } else {
    window.location.href = deepLink;
  }
}

/**
 * Triggers download of the TrobSafe Android APK
 */
export function triggerApkDownload(): void {
  if (typeof window === "undefined") return;
  try {
    const a = document.createElement("a");
    a.href = TROBSAFE_APK_URL;
    a.download = "trobsafe.apk";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 200);
  } catch (err) {
    window.location.href = TROBSAFE_APK_URL;
  }
}

/**
 * Triggers wakeup signals for the TrobSafe browser extension in-page bridge
 */
export function wakeUpExtension(): void {
  if (typeof window === "undefined") return;
  try {
    window.postMessage({ target: "trobsafe-inpage", action: "connect" }, "*");
    window.postMessage({ type: "TROBSAFE_CONNECT" }, "*");
    window.postMessage({ type: "TROBSAFE_REQUEST_ACCOUNTS" }, "*");
    window.postMessage({ target: "trobsafe-contentscript", type: "OPEN_SIDEBAR" }, "*");
    window.postMessage({ target: "trobsafe-contentscript", type: "OPEN_POPUP" }, "*");
    window.postMessage({ target: "trobsafe", action: "open" }, "*");

    window.dispatchEvent(new CustomEvent("trob_requestAccounts"));
    window.dispatchEvent(new CustomEvent("trobSafe_connect"));
    window.dispatchEvent(new CustomEvent("trobReady"));
    window.dispatchEvent(new CustomEvent("trobLinkReady"));
    window.dispatchEvent(new CustomEvent("trobsafe_ready"));

    const w = window as any;
    if (typeof w.chrome?.runtime?.sendMessage === "function") {
      try {
        w.chrome.runtime.sendMessage(
          "hmijkpcbnkmkijljblhojfndfapidkkk",
          { type: "TROBSAFE_PING" },
          () => {}
        );
      } catch {}
    }
  } catch {}
}
