/**
 * Deterministic & Random Avatar Generator for Equora Genesis DAO Accounts
 *
 * Provides unique avatars derived from address/account identifiers,
 * with multi-style DiceBear support and offline-safe SVG fallbacks.
 */

export const AVATAR_STYLES = [
  'bottts-neutral', // Cybernetic Web3 robots & guardians
  'lorelei',        // Sleek illustrated human personas
  'adventurer',     // Fantasy & sci-fi explorers
  'avataaars',      // Modern customizable avatars
  'micah',          // Contemporary portrait art
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

/**
 * Fast 32-bit stable hash function
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a persistent or newly initialized random avatar seed for an account
 */
export function getStoredAvatarSeed(accountKey?: string | null): string {
  if (typeof window === 'undefined') {
    return accountKey || 'equora_genesis_member';
  }

  const cleanKey = (accountKey || 'guest').trim().toLowerCase();
  const storageKey = `equora_avatar_seed_${cleanKey}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    return stored;
  }

  // Generate a random seed on first account profile creation/access
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const newSeed = `${cleanKey}_${randomSuffix}`;
  try {
    localStorage.setItem(storageKey, newSeed);
  } catch {
    // Ignore quota/private mode errors
  }
  return newSeed;
}

/**
 * Sets a new randomized avatar seed for an account and triggers sync event
 */
export function randomizeAvatarSeed(accountKey?: string | null): string {
  if (typeof window === 'undefined') return 'random';

  const cleanKey = (accountKey || 'guest').trim().toLowerCase();
  const storageKey = `equora_avatar_seed_${cleanKey}`;
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const newSeed = `${cleanKey}_${randomSuffix}`;

  try {
    localStorage.setItem(storageKey, newSeed);
    window.dispatchEvent(
      new CustomEvent('equora:avatar_changed', {
        detail: { accountKey: cleanKey, seed: newSeed },
      })
    );
  } catch {
    // Ignore quota errors
  }

  return newSeed;
}

/**
 * Generates an offline-safe SVG data URI avatar
 */
export function generateLocalSvgAvatar(seed: string): string {
  const hash = hashString(seed);

  const gradients = [
    ['#0E62E4', '#0A2B66'],
    ['#0284C7', '#0F172A'],
    ['#2563EB', '#1E3A8A'],
    ['#0D9488', '#115E59'],
    ['#4F46E5', '#312E81'],
    ['#0891B2', '#164E63'],
    ['#3B82F6', '#1D4ED8'],
    ['#6366F1', '#4338CA'],
  ];
  const [c1, c2] = gradients[hash % gradients.length];

  const shapes = [
    // Cybernetic visor
    `<rect x="26" y="26" width="48" height="48" rx="14" fill="white" fill-opacity="0.18" />
     <rect x="32" y="42" width="36" height="14" rx="7" fill="white" fill-opacity="0.9" />
     <circle cx="42" cy="49" r="3" fill="${c1}" />
     <circle cx="58" cy="49" r="3" fill="${c1}" />
     <circle cx="50" cy="22" r="3.5" fill="#38BDF8" />`,
    // Octahedron facet
    `<polygon points="50,20 78,36 78,68 50,84 22,68 22,36" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round" />
     <polygon points="50,30 70,42 70,62 50,74 30,62 30,42" fill="white" fill-opacity="0.25" />
     <circle cx="50" cy="52" r="7" fill="white" />`,
    // Soulbound network
    `<circle cx="50" cy="50" r="28" fill="none" stroke="white" stroke-width="3" stroke-dasharray="6 4" stroke-opacity="0.8" />
     <circle cx="50" cy="50" r="14" fill="white" fill-opacity="0.9" />
     <circle cx="50" cy="50" r="6" fill="${c1}" />`,
    // Node triad
    `<circle cx="35" cy="38" r="6" fill="white" />
     <circle cx="65" cy="38" r="6" fill="white" />
     <circle cx="50" cy="66" r="8" fill="#38BDF8" />
     <line x1="35" y1="38" x2="65" y2="38" stroke="white" stroke-width="3" />
     <line x1="35" y1="38" x2="50" y2="66" stroke="white" stroke-width="3" />
     <line x1="65" y1="38" x2="50" y2="66" stroke="white" stroke-width="3" />`,
  ];
  const shape = shapes[hash % shapes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="av_grad_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="24" fill="url(#av_grad_${hash})" />
    <circle cx="50" cy="50" r="44" fill="none" stroke="white" stroke-opacity="0.12" stroke-width="1.5" />
    ${shape}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Gets the primary avatar URL (DiceBear) with style derived from seed
 */
export function getAccountAvatarUrl(seed: string): string {
  const hash = hashString(seed);
  const style = AVATAR_STYLES[hash % AVATAR_STYLES.length];
  const bgColors = 'e0f2fe,dbeafe,f0fdf4,ede9fe,e0e7ff,fef3c7';
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bgColors}&radius=20`;
}
