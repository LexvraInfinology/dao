import {
  PillarCard,
  NetworkHub,
  LiveActivityEvent,
  RewardPool,
  FaqItem,
  MetricItem,
} from '@/types';

export const HERO_METRICS: MetricItem[] = [
  { value: '12', label: 'LEVELS', sublabel: 'Structured Growth' },
  { value: '4', label: 'POOLS', sublabel: 'Dedicated Yield' },
  { value: '1', label: 'GLOBAL COMMUNITY', sublabel: 'Unified Vision' },
];

export const PILLARS: PillarCard[] = [
  {
    id: 'people-first',
    title: 'People First',
    description: 'A community built on trust and collaboration.',
    icon: 'Users',
  },
  {
    id: 'transparent',
    title: 'Transparent by Design',
    description: 'Every step is clear and verifiable on-chain.',
    icon: 'ShieldCheck',
  },
  {
    id: 'opportunities',
    title: 'Real Opportunities',
    description: 'A structured path to grow and achieve more.',
    icon: 'TrendingUp',
  },
  {
    id: 'better-tomorrow',
    title: 'A Better Tomorrow',
    description: 'Empowering individuals to create a more inclusive world.',
    icon: 'Sparkles',
  },
];

export const ABOUT_STATS: MetricItem[] = [
  { value: '120K+', label: 'Active Members' },
  { value: '50+', label: 'Countries' },
  { value: '$2.4B+', label: 'Total Volume' },
];

export const NETWORK_HUBS: NetworkHub[] = [
  {
    id: 'launchpad',
    title: 'EQUORA Launchpad',
    tagline: 'Ideas to Impact',
    description: 'Nurturing community-backed decentralized ideas from concept to global impact.',
    category: 'Incubation',
    icon: 'Rocket',
  },
  {
    id: 'ventures',
    title: 'EQUORA Ventures',
    tagline: 'Backing Builders',
    description: 'Strategic deployment of community capital for early-stage on-chain pioneers.',
    category: 'Investment',
    icon: 'Compass',
  },
  {
    id: 'community',
    title: 'EQUORA Community',
    tagline: 'People First',
    description: 'Decentralized collective governance where every sovereign seat has a voice.',
    category: 'Governance',
    icon: 'HeartHandshake',
  },
  {
    id: 'capital',
    title: 'EQUORA Capital',
    tagline: 'Fueling Growth',
    description: 'Deep liquidity mechanisms and automated rewards distribution for members.',
    category: 'Treasury',
    icon: 'Coins',
  },
  {
    id: 'labs',
    title: 'EQUORA Labs',
    tagline: "Building What's Next",
    description: 'Researching novel consensus, zero-knowledge verification, and modular scale.',
    category: 'Research',
    icon: 'Cpu',
  },
  {
    id: 'nexus',
    title: 'EQUORA Nexus',
    tagline: 'Connecting Innovators',
    description: 'Cross-chain bridging and communication fabric unifying disparate ecosystems.',
    category: 'Infrastructure',
    icon: 'Network',
  },
];

export const INITIAL_LIVE_EVENTS: LiveActivityEvent[] = [
  {
    id: 'evt-1',
    title: 'New member joined',
    subtitle: 'Welcome to the EQUORA_Fi network!',
    memberId: 'ID 85755',
    timeAgo: 'just now',
    type: 'member_joined',
  },
  {
    id: 'evt-2',
    title: 'New slot opened',
    subtitle: 'A new opportunity is now live.',
    memberId: 'ID 74621',
    timeAgo: '18 sec ago',
    type: 'slot_opened',
  },
  {
    id: 'evt-3',
    title: 'New member joined',
    subtitle: 'Growing stronger, together.',
    memberId: 'ID 32901',
    timeAgo: '32 sec ago',
    type: 'member_joined',
  },
  {
    id: 'evt-4',
    title: 'Level progress updated',
    subtitle: 'Advanced to Level 2',
    memberId: 'ID 27390',
    timeAgo: '1 min ago',
    type: 'level_updated',
  },
  {
    id: 'evt-5',
    title: 'New member joined',
    subtitle: "Excited for what's ahead!",
    memberId: 'ID 91827',
    timeAgo: '2 min ago',
    type: 'member_joined',
  },
];

export const REWARD_POOLS: RewardPool[] = [
  {
    id: 'alpha-pool',
    num: '01',
    name: 'Alpha Pool',
    subtitle: 'Start your journey. Earn as you grow.',
    targetSlot: 'Slot 3',
    monthlyReward: '25%',
    imageRef: '/assets/50dea44df4de3dc218116a16a85c83bc1dd45ca9.png',
    requirements: [
      'Reach Minimum Slot 3 in Genesis Matrix',
      'Hold at least 100 EQUORA Tokens staked',
      'Participate in at least 1 DAO governance vote',
    ],
    perks: [
      '25% Pool Share Distributed Monthly',
      'Entry into Alpha Tier Member Discord',
      'Priority access to Launchpad seed sales',
    ],
  },
  {
    id: 'prime-pool',
    num: '02',
    name: 'Prime Pool',
    subtitle: 'Do more. Get more.',
    targetSlot: 'Slot 6',
    monthlyReward: '25%',
    imageRef: '/assets/9edf63dccd921dfd89f9a95ccd2e1cf3fa277ebf.png',
    requirements: [
      'Reach Minimum Slot 6 in Genesis Matrix',
      'Maintain 80%+ Voting Participation Rate',
      'Direct sponsor of at least 3 active members',
    ],
    perks: [
      '25% Pool Share Distributed Monthly',
      'Quarterly performance milestone bonus',
      'Access to closed Council roundtable calls',
    ],
  },
  {
    id: 'elite-pool',
    num: '03',
    name: 'Elite Pool',
    subtitle: 'Greater contribution. Greater rewards.',
    targetSlot: 'Slot 9',
    monthlyReward: '25%',
    imageRef: '/assets/15eeaba87504113b3bc3eaa6a024acc16318311f.png',
    requirements: [
      'Reach Minimum Slot 9 in Genesis Matrix',
      'Stake 1,000+ EQUORA in Governance Vault',
      'Submit or sponsor an approved proposal',
    ],
    perks: [
      '25% Pool Share Distributed Monthly',
      'Exclusive Soulbound Verified Elite Badge',
      'Co-investment allocation in Ventures fund',
    ],
  },
  {
    id: 'crown-pool',
    num: '04',
    name: 'Crown Pool',
    subtitle: 'Lead the change. Lifetime rewards.',
    targetSlot: 'Slot 12',
    monthlyReward: '25%',
    imageRef: '/assets/e756361d002034de62f5ff6a53bd38d45907e645.png',
    requirements: [
      'Complete Slot 12 Zenith achievement',
      'Hold 1 of 100 Sovereign Genesis Seats',
      'Recognized on-chain council status',
    ],
    perks: [
      '25% Pool Share Distributed Monthly',
      'Lifetime dividend rights in DAO Treasury',
      'Direct veto & proposal creation power',
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What are Ranks?',
    answer:
      'Ranks are long-term milestones that unlock exclusive rewards, global recognition, and higher earning potential as you reach higher slots in the pool. Rather than temporary speculative standings, ranks reflect your cumulative on-chain contribution and grant perpetual access to the designated reward pools.',
  },
  {
    id: 'faq-2',
    question: 'How do I move to a higher rank?',
    answer:
      'You advance through ranks by completing slot milestones across the 12 levels of the EQUORA protocol. Progress is calculated through your active network volume, participation in governance voting, and maintaining staked balances within the DAO smart contracts.',
  },
  {
    id: 'faq-3',
    question: 'What kind of rewards can I earn?',
    answer:
      'Members earn monthly passive rewards in stablecoins and protocol yield from the 4 dedicated reward pools (Alpha, Prime, Elite, and Crown), each receiving an equal 25% allocation of network performance fees. Additionally, higher ranks earn referral boosts and seed-round allocations.',
  },
  {
    id: 'faq-4',
    question: 'Is there a cost to join?',
    answer:
      'Joining the general EQUORA_Fi community is open to everyone with zero barrier to entry. Participating in the Genesis DAO Council Seats or claiming specific matrix slots involves standard on-chain interaction and gas fees on the network.',
  },
  {
    id: 'faq-5',
    question: 'Can I track my progress?',
    answer:
      'Yes, absolutely. The integrated Genesis DAO Dashboard provides real-time tracking of your current slot, level progress, voting power, historical distributions, and transaction ledger directly through your connected Web3 wallet.',
  },
];
