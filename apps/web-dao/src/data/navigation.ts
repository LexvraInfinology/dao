import { NavItem } from '@/types';

export const LANDING_NAV_ITEMS: NavItem[] = [
  { label: 'How It Works', href: '#about' },
  { label: 'Levels', href: '#levels' },
  { label: 'Pools', href: '#rewards' },
  { label: 'Network', href: '#network' },
  { label: 'Rewards', href: '#rewards' },
  { label: 'About', href: '#about' },
];

export const DAO_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dao' },
  { label: 'Council Seats', href: '/dao/seats' },
  { label: 'Member Lounge', href: '/dao/lounge' },
  { label: 'Matrix Bridge', href: '/dao/matrix-bridge' },
  { label: 'Treasury', href: '/dao/treasury' },
  { label: 'Transactions', href: '/dao/transactions' },
  { label: 'Profile', href: '/dao/profile' },
  { label: 'Settings', href: '/dao/settings' },
];

export const FOOTER_LINKS = {
  product: [
    { label: 'How It Works', href: '#about' },
    { label: 'Ranks', href: '#rewards' },
    { label: 'Rewards', href: '#rewards' },
    { label: 'Roadmap', href: '#network' },
    { label: 'Download', href: '/dao' },
  ],
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: 'mailto:contact@equora.fi' },
  ],
  resources: [
    { label: 'Help Center', href: '#' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Community', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
  socials: [
    { name: 'Twitter', href: 'https://twitter.com', icon: 'Twitter' },
    { name: 'Discord', href: 'https://discord.com', icon: 'MessageSquare' },
    { name: 'Telegram', href: 'https://telegram.org', icon: 'Send' },
    { name: 'GitHub', href: 'https://github.com', icon: 'Github' },
  ],
};
