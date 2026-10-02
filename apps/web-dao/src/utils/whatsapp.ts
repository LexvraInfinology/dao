/**
 * Centralized WhatsApp Community Integration Helper
 *
 * Implements optimized group join logic for:
 * 1. Laptop / Desktop:
 *    - Opens WhatsApp Web (https://web.whatsapp.com/) so the web session activates.
 *    - Opens the group invite link after 1000ms so the user directly enters the group.
 * 2. Mobile (Android & iOS):
 *    - Specifically prevents "net::ERR_UNKNOWN_URL_SCHEME" (which happens when in-app WebViews
 *      try to resolve internal "whatsapp://chat/?code=...&source=ah1t" redirects).
 *    - Uses Android Intent URI (package=com.whatsapp) to instruct Android OS to open the native
 *      WhatsApp application directly (displaying the native "Join group" bottom sheet).
 *    - Safe fallback via dynamic anchor click and universal deep links.
 */

import { WHATSAPP_DAO_GROUP_URL } from '@/config/env';

export const WHATSAPP_GROUP = WHATSAPP_DAO_GROUP_URL || 'https://chat.whatsapp.com/GR19373Pgq7LezBKtXC0ng';

export function getWhatsAppInviteCode(url: string = WHATSAPP_GROUP): string {
  const match = url.match(/chat\.whatsapp\.com\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : 'GR19373Pgq7LezBKtXC0ng';
}

export function joinWhatsApp(groupUrl: string = WHATSAPP_GROUP): void {
  if (typeof window === 'undefined') return;

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isMobile = isAndroid || isIOS;
  const inviteCode = getWhatsAppInviteCode(groupUrl);

  if (isMobile) {
    if (isAndroid) {
      // ── Android Mobile Flow ────────────────────────────────────────────────
      // Standard Android Intent targeting "com.whatsapp" package with https scheme.
      // This tells Android OS to launch native WhatsApp directly, completely bypassing
      // the web page redirect that causes "net::ERR_UNKNOWN_URL_SCHEME" in in-app WebViews.
      const androidIntentUrl = `intent://chat.whatsapp.com/${inviteCode}#Intent;package=com.whatsapp;scheme=https;S.browser_fallback_url=${encodeURIComponent(groupUrl)};end`;

      // 1. Try launching through a temporary hidden anchor to prevent top-level WebView crash
      try {
        const link = document.createElement('a');
        link.href = androidIntentUrl;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (link.parentNode) link.parentNode.removeChild(link);
        }, 500);
      } catch {
        window.location.href = androidIntentUrl;
      }

      // 2. Safe fallback: If user is still on page after 800ms (e.g. in some custom WebViews),
      // try the direct deep link scheme or open the group URL
      setTimeout(() => {
        try {
          window.location.href = `whatsapp://chat?code=${inviteCode}`;
        } catch {
          window.location.href = groupUrl;
        }
      }, 800);
    } else if (isIOS) {
      // ── iOS Mobile Flow ───────────────────────────────────────────────────
      // On iOS, universal link and whatsapp:// deep link trigger native app prompt
      try {
        window.location.href = `whatsapp://chat?code=${inviteCode}`;
        setTimeout(() => {
          window.location.href = groupUrl;
        }, 1000);
      } catch {
        window.location.href = groupUrl;
      }
    } else {
      // Other mobile devices
      window.location.href = groupUrl;
    }
  } else {
    // ── Laptop / Desktop Flow (User Reference Workflow) ────────────────────
    // 1. Open WhatsApp Web in a new tab so the session initializes
    try {
      window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer');
    } catch {}

    // 2. Keep the invite available and open the group invite after 1000ms
    setTimeout(() => {
      try {
        window.open(groupUrl, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = groupUrl;
      }
    }, 1000);
  }
}
