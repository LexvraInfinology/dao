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

export const WHATSAPP_GROUP =
  WHATSAPP_DAO_GROUP_URL ||
  'https://chat.whatsapp.com/CncHdH2u76s95lRSURuKaW?s=cl&p=a&mlu=4&ilr=4';

export function getWhatsAppInviteCode(url: string = WHATSAPP_GROUP): string {
  const match = url.match(/chat\.whatsapp\.com\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : 'CncHdH2u76s95lRSURuKaW';
}

export function joinWhatsApp(groupUrl: string = WHATSAPP_GROUP): void {
  if (typeof window === 'undefined') return;

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobileOrTablet = isAndroid || isIOS || /Mobile|Tablet/i.test(ua);
  const inviteCode = getWhatsAppInviteCode(groupUrl);

  if (isMobileOrTablet) {
    if (isAndroid) {
      // ── Android Mobile & Tablet Flow ───────────────────────────────────────
      // Android Intent targeting "com.whatsapp" package with https scheme.
      // Launches native WhatsApp directly, displaying the native "Join group" bottom sheet.
      const androidIntentUrl = `intent://chat.whatsapp.com/${inviteCode}#Intent;package=com.whatsapp;scheme=https;S.browser_fallback_url=${encodeURIComponent(groupUrl)};end`;

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

      // Safe fallback if intent doesn't fire
      setTimeout(() => {
        try {
          window.location.href = `whatsapp://chat?code=${inviteCode}`;
        } catch {
          window.location.href = groupUrl;
        }
      }, 700);
    } else if (isIOS) {
      // ── iOS iPhone & iPad Flow ─────────────────────────────────────────────
      // Universal deep link scheme triggers native iOS WhatsApp prompt
      try {
        window.location.href = `whatsapp://chat?code=${inviteCode}`;
        setTimeout(() => {
          window.location.href = groupUrl;
        }, 800);
      } catch {
        window.location.href = groupUrl;
      }
    } else {
      // Other mobile / tablet browsers
      try {
        window.location.href = `whatsapp://chat?code=${inviteCode}`;
        setTimeout(() => {
          window.location.href = groupUrl;
        }, 800);
      } catch {
        window.location.href = groupUrl;
      }
    }
  } else {
    // ── Laptop / PC / Desktop Flow ──────────────────────────────────────────
    // Open the official group invite page directly in a clean new tab.
    // The WhatsApp official page provides "Join Chat" with 1-click open in WhatsApp Desktop or WhatsApp Web.
    try {
      const win = window.open(groupUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = groupUrl;
      }
    } catch {
      window.location.href = groupUrl;
    }
  }
}
