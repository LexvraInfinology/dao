const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_HTML = path.join(__dirname, '..', 'docs', 'Equora_All_Pages_UI_UX_Designer_Reference_Guide.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', 'Equora_All_Pages_UI_UX_Designer_Reference_Guide.pdf');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'assets', 'screenshots');

const toBase64 = (filePath) => {
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

const PAGES = [
  {
    id: 'dao',
    route: '/dao',
    title: 'Genesis DAO Founding Council (100 Seats)',
    subtitle: 'Sovereign VIP Co-Ownership, 100-Seat Grid, 300/N Engine, 5X Cap & 48h Urgency',
    description: 'The sovereign founding tier of Equora.Fi. 100 maximum seats, Soulbound non-transferable ERC-721 governance passes, 300/N instant redistribution, and 35% ongoing global matrix dividend stream.',
    dataRows: [
      { element: 'Seats Claimed', func: 'EquoraDAO.getDAOStats().memberCount', type: 'uint256', val: '86', rule: 'Padded integer: 86 / 100' },
      { element: 'Seats Remaining', func: 'EquoraDAO.getRemainingPositions()', type: 'uint256', val: '14', rule: 'Highlight gold if < 20' },
      { element: 'Genesis Deadline', func: 'EquoraDAO.GENESIS_WINDOW_END()', type: 'timestamp', val: '1,791,240,000', rule: 'Digital clock: DD:HH:MM:SS' },
      { element: 'Soulbound Token ID', func: 'EquoraDAOMembership.tokenOfOwnerByIndex()', type: 'uint256', val: '#0012', rule: '4-digit zero-padded' },
      { element: 'Voting Power', func: 'Constant: 1 / 100', type: 'percent', val: '1.0%', rule: 'Badge: 1 Seat = 1 Vote' },
      { element: '5X Cap Earned', func: 'EquoraDAO.getMemberDetails()[4]', type: 'uint256', val: '$840.00 TROB', rule: '2 decimals + Monospace' },
      { element: '5X Cap Ceiling', func: 'EquoraDAO.getCapProgress()[1]', type: 'uint256', val: '$1,500.00 TROB', rule: 'Fixed constant ($300 × 5)' },
      { element: '48h Countdown Clock', func: 'EquoraDAO.retopupTimeRemaining()', type: 'uint256', val: '172,400s (47h 53m)', rule: 'Digital clock: HH:MM:SS' },
      { element: 'Matrix Pool Claimable', func: 'EquoraDAO.getMemberDetails()[8]', type: 'uint256', val: '$300.00 TROB', rule: '1-Click Claim Action' },
      { element: 'Queue Fallback Claim', func: 'EquoraDAO.getMemberDetails()[3]', type: 'uint256', val: '$120.50 TROB', rule: 'Auto-swept during claim' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (DAO): Keep completely distinct from retail matrix. Member 1 effective cost is $0.00 (100% instant cashback). When earnings hit $1,500, trigger the crimson 48:00:00 countdown clock.'
  },
  {
    id: 'dashboard',
    route: '/dashboard',
    title: 'Executive Portfolio Dashboard',
    subtitle: 'Command Center, Web3 Decentralized Identity, 4 Core KPIs & Feature Gateways',
    description: 'The primary screen upon connecting a Web3 wallet. Summarizes the user identity, 5-digit referral code, qualification status, and cumulative protocol yields across all modules.',
    dataRows: [
      { element: 'Connected Wallet', func: 'Wagmi / Web3 Provider', type: 'address', val: '0x4B71a...89F2', rule: 'Shortened 0x... with copy' },
      { element: '5-Digit Referral Code', func: 'EquoraRegistry.userCode()', type: 'uint24', val: '#10042', rule: 'Monospace gold badge' },
      { element: 'Sponsor Code', func: 'EquoraRegistry.sponsorOf()', type: 'uint24', val: '#10000 (Root)', rule: 'Subtitle under referral code' },
      { element: 'Qualification Badge', func: 'EquoraRegistry.isQualified()', type: 'bool', val: 'QUALIFIED (2+ Directs)', rule: 'Green badge if qualified' },
      { element: 'KPI 1: Protocol Yield', func: 'Aggregated yield sum', type: 'uint256', val: '$2,480.50 TROB', rule: 'Large header metric' },
      { element: 'KPI 2: Matrix Cashflow', func: 'EquoraMatrix.totalEarned()', type: 'uint256', val: '$1,200.00 TROB', rule: '600% Direct cashflow' },
      { element: 'KPI 3: DAO Dividends', func: 'EquoraDAO.totalEarned()', type: 'uint256', val: '$860.00 TROB', rule: 'DAO royalty revenue' },
      { element: 'KPI 4: Withdrawable', func: 'internalLedgerBalance()', type: 'uint256', val: '$420.50 TROB', rule: 'Emerald ticker with Withdraw' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (DASHBOARD): Eliminate all loading flashes. Feature gateways should provide 1-click access to DAO, Matrix, and Pools with real-time status badges.'
  },
  {
    id: 'matrix',
    route: '/matrix',
    title: '12-Slot Matrix Engine',
    subtitle: '14-Node Visual Single-Leg Board, 600% Direct Cash, Pool Splits & Perpetual Cycles',
    description: 'The autonomous network progression engine. Participants activate Slots 1 through 12 ($30 to $61,440), visual single-leg tree hierarchy, auto-upgrades via Nodes 5 & 10, and cycle reset at Node 14.',
    dataRows: [
      { element: 'Active Slot Index', func: 'User selection state', type: 'uint8', val: 'Slot 1 ($30)', rule: 'Pill selector (Slots 1 to 12)' },
      { element: 'Slot Unlock Status', func: 'EquoraMatrix.userSlotActive()', type: 'bool', val: 'ACTIVE', rule: 'Gold if active, Buy if locked' },
      { element: 'Current Cycle Number', func: 'EquoraMatrix.currentCycle()', type: 'uint32', val: 'Cycle #3', rule: 'Monospace cycle counter' },
      { element: 'Occupied Nodes Count', func: 'EquoraMatrix.getFilledNodesCount()', type: 'uint8', val: '8 / 14 Nodes', rule: 'Visual counter / radial progress' },
      { element: 'Nodes P1 & P2', func: 'Upline routing logic', type: 'address', val: 'Upline 1 & Upline 2', rule: 'Tag: Upline Commission' },
      { element: 'Direct Cash Nodes', func: 'P3, P6, P8, P9, P11, P12', type: 'uint256', val: '600% ROI ($180)', rule: 'Tag: Direct Cash to Owner' },
      { element: 'Pool Routing Node', func: 'P4 Flow', type: 'uint256', val: '$30 split to 4 Pools', rule: 'Tag: 35% DAO, 40% Sal, 10% Box, 15% Rew' },
      { element: 'Auto-Upgrade Nodes', func: 'P5 & P10 Flow', type: 'uint256', val: '$60 reserved for Slot 2', rule: 'Tag: Auto-Slot Upgrade' },
      { element: 'Cycle Recycler', func: 'P14 Flow', type: 'trigger', val: 'Recycles to Cycle #N+1', rule: 'Tag: Perpetual Loop' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (MATRIX): Nodes 3, 6, 8, 9, 11, 12 must clearly indicate 600% direct cash to owner. Node 4 routes $30 to protocol pools (including 35% to DAO!).'
  },
  {
    id: 'referrals',
    route: '/referrals',
    title: 'Partners & Team Genealogy',
    subtitle: '5-Digit ID Center, 1-Click Copy Links, QR Code Generator & Organization Tree',
    description: 'Equips community promoters with frictionless sharing tools, real-time qualification monitoring (0/2, 1/2, or Qualified), downline KPIs, and an interactive tree visualizer.',
    dataRows: [
      { element: 'Referral Link', func: 'Formatted domain with ID', type: 'string', val: 'equora.fi/?ref=10042', rule: '1-Click copy with toast' },
      { element: 'QR Code Modal', func: 'Generated SVG QR', type: 'image', val: 'Rendered QR Data', rule: 'Tap to expand for events' },
      { element: '2-Direct Qualification', func: 'EquoraRegistry.directCount()', type: 'uint8', val: '5 / 2 Directs', rule: 'Green if >= 2, Warning if < 2' },
      { element: 'Direct Partners Count', func: 'EquoraRegistry.getDirects().length', type: 'uint256', val: '5 Members', rule: 'Primary metric tile' },
      { element: 'Total Downline Size', func: 'Indexer aggregated tree', type: 'uint256', val: '142 Members (L1-L10)', rule: 'Multi-tier network count' },
      { element: 'Total Referral Commissions', func: 'Indexer commission ledger', type: 'uint256', val: '$3,420.00 TROB', rule: '2 decimals + Monospace' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (REFERRALS): Prominently alert unqualified members to sponsor 2 directs to unlock full matrix withdrawal rights.'
  },
  {
    id: 'rewards',
    route: '/rewards',
    title: 'Rewards & 4 Protocol Value Pools',
    subtitle: 'DAO Treasury (35%), Monthly Salary (40%), Magic Blind Box (10%) & Lucky Drops (15%)',
    description: 'Complete transparency into the 4 autonomous protocol pools fed by Nodes 4, 5, and 14 across the entire global matrix network.',
    dataRows: [
      { element: 'Pool 1: DAO Treasury (35%)', func: 'EquoraVault.daoPoolBalance()', type: 'uint256', val: '$42,800.00 TROB', rule: 'Dividends split to 100 DAO seats' },
      { element: 'Pool 2: Monthly Salary (40%)', func: 'EquoraSalaryPool.pendingPoolBalance()', type: 'uint256', val: '$48,914.00 TROB', rule: 'Monthly settlement on the 11th' },
      { element: 'Salary Countdown Clock', func: 'Monthly recurring schedule', type: 'timestamp', val: '14d : 08h : 12m', rule: 'Countdown to next salary run' },
      { element: 'Personal Salary Rank', func: 'EquoraSalaryPool.userTier()', type: 'enum', val: 'BETA LEADER (Tier 2)', rule: 'Badge: Alpha, Beta, Gamma, Crown' },
      { element: 'Pool 3: Magic Box (10%)', func: 'EquoraMagicBox.poolBalance()', type: 'uint256', val: '$12,228.00 TROB', rule: '3D Mystery Box interactive card' },
      { element: 'Box Unlock Countdown', func: 'Quarterly unlock schedule', type: 'timestamp', val: '42d : 11h : 05m', rule: 'Quarterly loot drop countdown' },
      { element: 'Pool 4: Lucky Drops (15%)', func: 'EquoraRewardPool.poolBalance()', type: 'uint256', val: '$18,342.00 TROB', rule: 'Weekly random reward drops' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (REWARDS): Ensure the 35% DAO pool card is linked directly to the DAO member claim interface.'
  },
  {
    id: 'wallet',
    route: '/wallet',
    title: 'Treasury Wallet & Financial Ledger',
    subtitle: 'Internal Balance Management, 1-Click Blockchain Withdrawals & Transaction Audit Trail',
    description: 'Non-custodial balance accounting, instant blockchain withdrawal execution to TrobSafe on Polygon/Trobium, gas fee preview, and filterable ledger history.',
    dataRows: [
      { element: 'Internal Ledger Balance', func: 'EquoraMatrix.withdrawable()', type: 'uint256', val: '$420.50 TROB', rule: 'Large withdrawable ticker' },
      { element: 'External Wallet Balance', func: 'ERC-20 balanceOf()', type: 'uint256', val: '$1,420.00 TROB', rule: 'Monospace balance in wallet' },
      { element: 'Withdraw Amount Input', func: 'User input state', type: 'number', val: '250.00', rule: 'Quick chips: 25%, 50%, 75%, MAX' },
      { element: 'Estimated Gas Fee', func: 'Provider estimateGas()', type: 'string', val: '< $0.005 USD', rule: 'Footnote text' },
      { element: 'Ledger Filter Tabs', func: 'UI state filter', type: 'tabs', val: 'All, Matrix, DAO, Salary, Withdraw', rule: 'Filter buttons' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (WALLET): 1-Click withdrawal should preview exact net gas fees and provide instant transaction hash links.'
  },
  {
    id: 'landing',
    route: '/',
    title: 'Public Conversion Landing Page',
    subtitle: 'Protocol Overview, Scarcity Hero, Old vs Equora Matrix, Yield Simulator & FAQ',
    description: 'Public-facing gateway designed to educate prospective Web3 participants, explain mathematical game theory, showcase verified smart contracts, and drive Genesis DAO claims.',
    dataRows: [
      { element: 'Live Protocol Volume', func: 'Indexer volume accumulator', type: 'uint256', val: '$1,420,850 TROB', rule: 'Pulsing pill in hero' },
      { element: 'Genesis Seats Scarcity', func: 'EquoraDAO.getRemainingPositions()', type: 'uint256', val: '14 / 100 Available', rule: 'Scarcity progress bar' },
      { element: 'Completed Cycles Ticker', func: 'EquoraMatrix.totalCyclesCompleted()', type: 'uint256', val: '12,480 Cycles', rule: 'Metric card in hero' },
      { element: 'Old vs Equora Matrix', func: 'Static architectural matrix', type: 'table', val: '6 Comparative Invariants', rule: 'High-contrast table' },
      { element: 'Interactive Yield Simulator', func: 'Client calculator engine', type: 'slider', val: 'Slot 1 to 12 Simulator', rule: 'Real-time 600% ROI calc' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (LANDING): Hero must prominently feature the dual CTAs: [ ENTER DAPP ] and [ CLAIM GENESIS DAO PASS ].'
  },
  {
    id: 'leaderboard',
    route: '/leaderboard',
    title: 'Global Protocol Leaderboard',
    subtitle: 'Top Matrix Cyclers, Elite Team Sponsors & Crown Sovereign Hall of Fame',
    description: 'Gamified ranking board highlighting top volume producers, fastest matrix cyclers, and community leaders.',
    dataRows: [
      { element: 'Podium Rank #1', func: 'Top volume indexer record', type: 'Leader', val: 'ID #10001 ($240k Vol)', rule: 'Gold trophy avatar spotlight' },
      { element: 'Podium Rank #2', func: 'Second volume indexer record', type: 'Leader', val: 'ID #10024 ($185k Vol)', rule: 'Silver trophy spotlight' },
      { element: 'Podium Rank #3', func: 'Third volume indexer record', type: 'Leader', val: 'ID #10008 ($142k Vol)', rule: 'Bronze trophy spotlight' },
      { element: 'Global Ranking Table', func: 'Indexer query (Top 100)', type: 'Leader[]', val: 'Top 100 Leader records', rule: 'Rank, ID, Cycles, Team, Vol' },
      { element: 'Personal Rank Pill', func: 'Current user indexer rank', type: 'struct', val: 'Your Rank: #14 (Top 1%)', rule: 'Floating bottom bar' }
    ],
    directive: 'CRITICAL DESIGNER DIRECTIVE (LEADERBOARD): Show top 3 podium spotlights with luxury gold, silver, and bronze ambient halos.'
  }
];

async function main() {
  console.log('🏛️ Encoding Image Assets to Base64...');
  const logoImg = toBase64(path.join(__dirname, '..', 'docs', 'assets', 'equorafilogo-removebg-preview.png'));
  const cardImg = toBase64(path.join(__dirname, '..', 'docs', 'assets', 'dao_card.jpg'));

  console.log('📸 Encoding 16 Desktop and Mobile Screenshots...');
  const encodedScreenshots = {};
  for (const p of PAGES) {
    encodedScreenshots[`${p.id}_desktop`] = toBase64(path.join(SCREENSHOTS_DIR, `${p.id}_desktop.png`));
    encodedScreenshots[`${p.id}_mobile`] = toBase64(path.join(SCREENSHOTS_DIR, `${p.id}_mobile.png`));
  }

  console.log('📝 Building Master HTML Document...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Complete All-Pages UI/UX Designer Reference Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 8mm 10mm 10mm 10mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #06080F;
      color: #e2e8f0;
      line-height: 1.4;
      font-size: 8.5pt;
    }

    .page-break { page-break-before: always; }

    /* COVER PAGE */
    .cover-container {
      height: 96vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px 25px;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      background: radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.15) 0%, rgba(6, 8, 15, 0.98) 75%);
    }

    .cover-top-bar { display: flex; justify-content: space-between; align-items: center; }
    .cover-logo { height: 44px; }
    .cover-badge {
      display: inline-block;
      padding: 5px 12px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid #F59E0B;
      color: #FBBF24;
      border-radius: 999px;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .cover-title-area { margin-top: 20px; }
    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 26pt;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.15;
    }

    .cover-title span {
      background: linear-gradient(135deg, #F59E0B 0%, #00E599 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-subtitle {
      font-size: 11pt;
      color: #94a3b8;
      margin-top: 10px;
      line-height: 1.4;
    }

    .cover-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 20px 0;
    }

    .cover-stat-box {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 8px;
      padding: 12px 8px;
      text-align: center;
    }

    .cover-stat-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15pt;
      font-weight: 700;
      color: #FBBF24;
    }

    .cover-stat-lbl {
      font-size: 6.5pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }

    .cover-card-preview {
      display: flex;
      gap: 15px;
      align-items: center;
      background: rgba(11, 17, 30, 0.7);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin: 10px 0;
    }

    .cover-card-img {
      width: 120px;
      height: 75px;
      object-fit: cover;
      border-radius: 5px;
      border: 1px solid #F59E0B;
    }

    .cover-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #64748b;
    }

    /* CONTENT PAGES */
    .content-page { padding: 10px 0; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 2px solid rgba(245, 158, 11, 0.3);
      padding-bottom: 5px;
      margin-bottom: 8px;
    }

    .page-title {
      font-family: 'Cinzel', serif;
      font-size: 14pt;
      color: #FBBF24;
      letter-spacing: 0.5px;
    }

    .page-route {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #00E599;
      background: rgba(0, 229, 153, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid rgba(0, 229, 153, 0.3);
    }

    .page-subtitle {
      font-size: 8pt;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    /* SCREENSHOTS CONTAINER */
    .screenshots-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 12px;
      margin: 8px 0 10px 0;
    }

    .screenshot-card {
      background: #0B111E;
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 6px;
      overflow: hidden;
    }

    .screenshot-header {
      background: rgba(15, 23, 42, 0.85);
      padding: 4px 8px;
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      font-weight: 700;
      color: #FBBF24;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* DATA TABLES */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 7.5pt;
    }

    .data-table th {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      font-weight: 700;
      text-align: left;
      padding: 5px 7px;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .data-table td {
      padding: 5px 7px;
      border: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(15, 23, 42, 0.45);
    }

    .data-table tr:nth-child(even) td {
      background: rgba(15, 23, 42, 0.7);
    }

    .highlight-cell { color: #00E599; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .gold-cell { color: #FBBF24; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .code-cell { font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-size: 7pt; }

    .callout {
      border-radius: 5px;
      padding: 8px 12px;
      margin: 8px 0;
      font-size: 7.5pt;
      line-height: 1.35;
    }

    .callout-gold {
      background: rgba(245, 158, 11, 0.08);
      border-left: 3px solid #F59E0B;
      color: #fde68a;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-container">
    <div>
      <div class="cover-top-bar">
        <img src="${logoImg}" class="cover-logo" alt="Equora Logo">
        <div class="cover-badge">Master UI/UX Designer Reference Guide</div>
      </div>
      <div class="cover-title-area">
        <div class="cover-title">EQUORA.FI<br><span>ALL-PAGES VISUAL & DATA SPEC</span></div>
        <div class="cover-subtitle">
          Complete Page-by-Page Visual Reference, Desktop & Mobile In-App Browser Screenshots,<br>
          Component Hierarchies, and Smart Contract Data Schemas ("Sata") for UI/UX Designers
        </div>
      </div>
    </div>

    <div class="cover-stats-grid">
      <div class="cover-stat-box">
        <div class="cover-stat-val">8</div>
        <div class="cover-stat-lbl">Full DApp Pages</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">16</div>
        <div class="cover-stat-lbl">Screenshots (Desk + Mob)</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">100%</div>
        <div class="cover-stat-lbl">Contract-Backed Data</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">300 / N</div>
        <div class="cover-stat-lbl">DAO Math Formula</div>
      </div>
    </div>

    <div class="cover-card-preview">
      <img src="${cardImg}" class="cover-card-img" alt="Soulbound Pass">
      <div>
        <div style="font-family:'Cinzel',serif; font-size:10pt; color:#FBBF24; font-weight:700;">Dual-Tier Protocol Ecosystem</div>
        <div style="font-size:7.5pt; color:#94a3b8; margin-top:3px;">
          Includes complete separation between Tier 1 (Genesis DAO Sovereign Council — 100 seats, zero referrals, 300/N cashback, 35% matrix pool) and Tier 2 (Everyday Matrix Users — 12 slots, 600% direct cashflow, team genealogy).
        </div>
      </div>
    </div>

    <div class="cover-meta">
      <div><strong>Platform:</strong> Polygon / Trobium Network</div>
      <div><strong>Security:</strong> Hardhat Core Protocol (34 Tests Passing)</div>
      <div><strong>Resolution:</strong> Desktop 1440 × 900 / Mobile 390 × 844</div>
      <div><strong>Status:</strong> Ready for Figma / Sketch Handoff</div>
    </div>
  </div>

  <!-- ==================== PAGES 1 TO 8 ==================== -->
  ${PAGES.map((p, idx) => `
  <div class="page-break"></div>
  <div class="content-page">
    <div class="page-header">
      <div class="page-title">${idx + 1}. ${p.title}</div>
      <div class="page-route">${p.route}</div>
    </div>
    <div class="page-subtitle"><strong>Context:</strong> ${p.subtitle}</div>

    <!-- Visual Screenshots Row -->
    <div class="screenshots-row">
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>DESKTOP VIEWPORT (1440 × 900)</span>
          <span>CHROME / BRAVE / OPERA</span>
        </div>
        <img src="${encodedScreenshots[`${p.id}_desktop`]}" class="screenshot-img" alt="${p.title} Desktop">
      </div>
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MOBILE (390 × 844)</span>
          <span>TROBSAFE / METAMASK</span>
        </div>
        <img src="${encodedScreenshots[`${p.id}_mobile`]}" class="screenshot-img" alt="${p.title} Mobile">
      </div>
    </div>

    <!-- Data Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 22%;">UI Element</th>
          <th style="width: 32%;">Smart Contract Function</th>
          <th style="width: 10%;">Type</th>
          <th style="width: 18%;">Live Example Value</th>
          <th style="width: 18%;">Formatting Rule</th>
        </tr>
      </thead>
      <tbody>
        ${p.dataRows.map(row => `
        <tr>
          <td><strong>${row.element}</strong></td>
          <td class="code-cell">${row.func}</td>
          <td>${row.type}</td>
          <td class="highlight-cell">${row.val}</td>
          <td>${row.rule}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="callout callout-gold">
      ${p.directive}
    </div>
  </div>
  `).join('')}

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log(`✓ Master HTML written at: ${OUTPUT_HTML}`);

  console.log('🖨️ Launching Puppeteer to compile high-resolution A4 Master PDF...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto(`file://${OUTPUT_HTML.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '8mm',
      bottom: '10mm',
      left: '10mm',
      right: '10mm'
    }
  });

  await browser.close();
  console.log(`🎉 SUCCESS! Complete All-Pages Reference PDF generated at: ${OUTPUT_PDF}`);
}

main().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
