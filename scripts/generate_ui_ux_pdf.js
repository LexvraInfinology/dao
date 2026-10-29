const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'assets', 'screenshots');
const OUTPUT_HTML = path.join(__dirname, '..', 'docs', 'Equora_UI_UX_Designer_Catalog.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', 'Equora_UI_UX_Designer_Catalog.pdf');

const PAGES = [
  {
    id: 'landing',
    route: '/',
    title: 'Public Landing Page',
    subtitle: 'Protocol Overview, Mathematical Guarantees & 300/N Calculator',
    description: 'The public-facing portal designed to educate prospective participants, explain the autonomous game theory, showcase verified smart contracts, and drive Genesis DAO Council pass claims.',
    components: [
      { name: 'Sticky Navigation Bar', type: 'Header', details: 'Logo, protocol live status pill, links (DAO, Matrix, Pools, FAQ), language switcher, and Connect Wallet button.' },
      { name: 'Hero Banner & Scarcity Meter', type: 'Hero', details: 'Tagline pill, headline, dual CTA buttons (Enter DApp / Genesis DAO Pass), live metrics ticker (Volume, Cycles, Seats Claimed, Yield).' },
      { name: 'Old vs Equora Comparison', type: 'Comparison Card', details: 'Contrasts fragile legacy models (admin keys, debt spirals) against Equora invariants (zero debt, instant peer payouts).' },
      { name: '4 Protocol Value Pools', type: 'Grid (4 Cards)', details: '35% DAO Treasury, 40% Monthly Salary, 10% Magic Blind Box, 15% Lucky Drops.' },
      { name: 'Interactive Yield Calculator', type: 'Simulator', details: 'Slider to pick matrix slot ($30 to $61,440) and simulate direct recruits, showing 600% direct cashflow and salary milestone progress.' },
      { name: 'Audits & Security Contracts', type: 'Verification', details: 'Verified smart contract addresses with 1-click copy and block explorer links.' },
      { name: 'FAQ & Ecosystem Footer', type: 'Accordion & Footer', details: 'Searchable answers on 300/N math, 48h re-topup, wallet setup, and social community channels.' }
    ]
  },
  {
    id: 'dashboard',
    route: '/dashboard',
    title: 'Executive Portfolio Dashboard',
    subtitle: 'Command Center, Identity, Earnings KPIs & Feature Gateways',
    description: 'The main user screen upon connecting a Web3 wallet. Summarizes the user\'s decentralized identity, 5-digit referral code, qualification status, and cumulative protocol yields.',
    components: [
      { name: 'User Identity & VIP Rank', type: 'Profile Card', details: 'Connected address, 5-digit referral code (#10042) with 1-click copy share link, Direct sponsor ID, Qualification badge (2+ Directs).' },
      { name: '4 Primary KPI Metric Tiles', type: 'Metrics Grid', details: '1. Total Protocol Yield, 2. Direct Matrix Cashflow (600%), 3. DAO Treasury Dividends, 4. Internal Ledger Balance (withdrawable).' },
      { name: 'Feature Gateway 1: Genesis DAO', type: '3D Action Card', details: 'Shows claimed seats (X/100), active seat pass or CTA to claim seat, direct link to 100-seat grid.' },
      { name: 'Feature Gateway 2: 12-Slot Matrix', type: 'Action Card', details: 'Active slot progression (Slots 1-12), upgrade readiness, direct link to visual 14-node board.' },
      { name: 'Feature Gateway 3: Salary & Pools', type: 'Action Card', details: 'Pool balance tickers, personal progress toward next salary milestone (Alpha, Beta, Gamma, Crown).' },
      { name: 'Live Protocol Activity Feed', type: 'Real-Time Stream', details: 'Chronological feed of incoming queue pushes, matrix cycle completions, and network rewards.' }
    ]
  },
  {
    id: 'dao',
    route: '/dao',
    title: 'Genesis DAO Founding Council (100 Seats)',
    subtitle: '100-Seat Grid, 300/N Engine, 5X Cap ($1,500) & 48h Re-Topup',
    description: 'The sovereign governance and founding co-ownership portal. Features the 100-Seat visual matrix grid, the 300/N dynamic redistribution engine, the 5X earnings cap monitor, and the 48-hour re-topup urgency countdown.',
    components: [
      { name: 'Council Header & Genesis Timer', type: 'Status Banner', details: 'Phase 1 21-Day Genesis window countdown, capacity meter (X/100 seats claimed), 1 Seat = 1 Vote (1.0%).' },
      { name: '100-Seat Visual Grid (10x10)', type: 'Interactive Grid', details: 'Gold tiles (Claimed), Pulsing emerald (Next available), Glowing crown (Your seat), Red dashed (Vacant defaulted seat claimable).' },
      { name: 'Seat Hover Tooltip', type: 'Flyout Card', details: 'Seat #, Owner shortened address, Soulbound NFT ID, Cumulative yield pushed, 5X cap progress.' },
      { name: '300 / N Instant Simulator', type: 'Calculator', details: 'Slider (1-100). Live breakdown: 300 TROB deposit, 300/N instant cashback to joiner, split to prior members, Net cost ($0 for Member 1!).' },
      { name: '5X Earnings Cap Monitor', type: 'Progress Tracker', details: 'Tracks earned amount out of 1,500 TROB (5X deposit). Displays percentage and safe/active status.' },
      { name: '48-Hour Re-Topup Alert Box', type: 'Urgency State', details: 'When >= 1,500 TROB earned, triggers digital countdown timer (48:00:00) and [Re-Topup 300 TROB] action to reset cap.' },
      { name: '35% Global Matrix Pool Stream', type: 'Dividend Tracker', details: 'Accumulates 35% of all matrix inflow from Nodes 4, 5, 14. Real-time [Claim Dividends] button.' }
    ]
  },
  {
    id: 'matrix',
    route: '/matrix',
    title: '12-Slot Community Matrix Engine',
    subtitle: '14-Node Single-Leg Board, 600% Cashflow & Auto-Upgrades',
    description: 'The core retail cashflow engine. Displays the 14-node geometric board for each active slot ($30 to $61,440), automated upgrade reservations, and board recycling loops.',
    components: [
      { name: 'Slot Selector Ribbon', type: 'Horizontal Carousel', details: '12 Slots with values: $30, $60, $120, $240, $480, $960, $1,920, $3,840, $7,680, $15,360, $30,720, $61,440.' },
      { name: '14-Node Visual Tree Board', type: 'Interactive Diagram', details: 'Level 1 (Nodes 1, 2: Upline), Level 2 (Nodes 3, 4, 5, 6), Level 3 (Nodes 7-14). Displays node entrant IDs, timestamps, and routing tags.' },
      { name: '600% Direct Cashflow Nodes', type: 'Cash Nodes', details: 'Nodes 3, 6, 7, 8, 9, 11, 12 pay 100% directly to the board owner ($180 net cash on Slot 1).' },
      { name: 'Protocol Value Pools Node', type: 'Routing Node', details: 'Node 4 routes $30 to EquoraVault (35% DAO, 40% Salary, 10% Box, 15% Drops).' },
      { name: 'Auto-Upgrade Nodes', type: 'Progression', details: 'Nodes 5 & 10 accumulate $60 to automatically unlock the next higher slot.' },
      { name: 'Board Recycling Node', type: 'Perpetual Loop', details: 'Node 14 completes the cycle, archives the board, and restarts Cycle #N+1.' },
      { name: 'Cycle Statistics & Spillover', type: 'Analytics', details: 'Total completed cycles, lifetime slot earnings, direct recruits vs spillover members count.' }
    ]
  },
  {
    id: 'referrals',
    route: '/referrals',
    title: 'Partners & Team Genealogy',
    subtitle: '5-Digit ID Center, 2-Referral Status & Network Hierarchy',
    description: 'Empowers network builders with 1-click sharing links, QR code generation, team metrics, qualification tracking, and an interactive downline genealogy tree.',
    components: [
      { name: '5-Digit Referral Code Card', type: 'Share Center', details: 'Monospace code display (e.g. #10042), 1-click copy link, direct share buttons (Telegram, WhatsApp, X).' },
      { name: 'QR Code Generator', type: 'Mobile Tool', details: 'Pop-up QR code for instant in-person scanning at live community events.' },
      { name: '2-Referral Qualification Bar', type: 'Status Alert', details: 'Visual progress (0/2, 1/2, or Qualified). Alerts user to sponsor 2 direct partners for full eligibility.' },
      { name: 'Team KPI Metric Grid', type: 'Metrics', details: 'Total Direct Partners, Total Downline Size (Levels 1-10), Total Referral Commissions Earned ($).' },
      { name: 'Interactive Genealogy Tree', type: 'Tree Explorer', details: 'Collapsible hierarchical tree showing member IDs, join dates, active slots, and direct recruit counts.' }
    ]
  },
  {
    id: 'rewards',
    route: '/rewards',
    title: 'Rewards & 4 Protocol Value Pools',
    subtitle: 'DAO Treasury, Monthly Salary, 3D Magic Box & Lucky Drops',
    description: 'Comprehensive accounting and transparency portal for the 4 autonomous protocol pools fed by Nodes 4, 5, and 14 across the entire global matrix network.',
    components: [
      { name: 'Pool 1: Genesis DAO Treasury (35%)', type: 'Pool Card', details: 'Accumulated matrix royalties split equally among 100 DAO Council members. Real-time claim button.' },
      { name: 'Pool 2: Monthly Salary Pool (40%)', type: 'Pool Card & Tiers', details: 'Settles on the 11th of every month. 4 Tiers: Alpha (5 directs, $1.5k vol), Beta (15 directs, $5k vol), Gamma (30 directs, $20k vol), Crown (50 directs, $100k vol).' },
      { name: 'Personal Salary Stepper', type: 'Progress Stepper', details: 'Shows exact criteria met and remaining volume required to rank up to the next salary tier.' },
      { name: 'Pool 3: Magic Blind Box (10%)', type: '3D Mystery Card', details: '3D interactive mystery box render with particle effects, quarterly unlock countdown, and rarity drop rates.' },
      { name: 'Pool 4: Community Lucky Drops (15%)', type: 'Community Pool', details: 'Automated weekly random yield payouts to active slot holders with live recent winners ticker.' }
    ]
  },
  {
    id: 'wallet',
    route: '/wallet',
    title: 'Treasury Wallet & Financial Ledger',
    subtitle: 'Internal Balances, 1-Click Withdrawals & Audit Trail',
    description: 'Non-custodial internal balance management, instant blockchain withdrawal execution, gas fee estimation, and a full chronological ledger of all earnings.',
    components: [
      { name: 'Internal Balance Card', type: 'Balance', details: 'Withdrawable protocol earnings (e.g. 450.00 TROB / $450.00) held safely in smart contract internal ledger.' },
      { name: 'Connected Web3 Wallet Card', type: 'Balance', details: 'Live balance of TROB coins in user\'s external wallet on Trobium / Polygon network.' },
      { name: '1-Click Instant Withdrawal Widget', type: 'Action Widget', details: 'Amount input, quick-select percentages (25%, 50%, 75%, MAX), gas fee estimate (< $0.01), and Confirm button.' },
      { name: 'Financial Transaction Ledger', type: 'Data Table', details: 'Filterable by: All, Matrix Cash, DAO Queue Push, Salary, Withdrawals. Columns: Type, Amount, Source, Date, Tx Hash.' }
    ]
  },
  {
    id: 'leaderboard',
    route: '/leaderboard',
    title: 'Global Protocol Leaderboard',
    subtitle: 'Top Matrix Cyclers, Elite Sponsors & Community Ranks',
    description: 'Gamified global ranking board highlighting top volume producers, fastest matrix cyclers, and Crown Sovereign leaders.',
    components: [
      { name: 'Podium Rank Display', type: 'Top 3 Visual', details: 'Gold, Silver, Bronze avatar spotlights for Rank #1, Rank #2, and Rank #3 leaders.' },
      { name: 'Global Ranking Table', type: 'Leaderboard', details: 'Columns: Rank (#1 to #100), Member 5-Digit ID, Matrix Cycles Completed, Direct Team Size, Total Protocol Volume.' },
      { name: 'Personal Ranking Pill', type: 'User Rank', details: 'Floating bottom bar showing the connected user\'s current global rank and distance to next spot.' }
    ]
  }
];

async function main() {
  console.log('🚀 Starting Screenshot Capture and PDF Generation Process...');

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Capture Desktop & Mobile Screenshots for all pages
  for (const item of PAGES) {
    console.log(`\n📸 Capturing [${item.title}] (${item.route})...`);
    const targetUrl = `${BASE_URL}${item.route}${item.route.includes('?') ? '&' : '?'}preview=true`;
    
    // Desktop Viewport (1440 x 900)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    try {
      await page.evaluateOnNewDocument(() => {
        try { localStorage.setItem('preview_mode', 'true'); } catch {}
      });
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 35000 });
      // Wait 2.0s for framer-motion animations, matrix charts, and counters to settle
      await new Promise(r => setTimeout(r, 2000));
      
      const desktopPath = path.join(SCREENSHOTS_DIR, `${item.id}_desktop.png`);
      await page.screenshot({ path: desktopPath, fullPage: false });
      console.log(`  ✓ Desktop captured: ${item.id}_desktop.png`);
    } catch (e) {
      console.error(`  ✗ Error capturing desktop ${item.route}:`, e.message);
    }

    // Mobile Viewport (390 x 844)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 2000));

      const mobilePath = path.join(SCREENSHOTS_DIR, `${item.id}_mobile.png`);
      await page.screenshot({ path: mobilePath, fullPage: false });
      console.log(`  ✓ Mobile captured: ${item.id}_mobile.png`);
    } catch (e) {
      console.error(`  ✗ Error capturing mobile ${item.route}:`, e.message);
    }
  }

  // 2. Generate Master HTML Document
  console.log('\n📝 Generating Master HTML Catalog with Screenshots...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Page-by-Page UI/UX Design Catalog & Screenshots</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
      @bottom-right {
        content: counter(page);
        font-family: 'JetBrains Mono', monospace;
        font-size: 9pt;
        color: #64748B;
      }
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0A0E17;
      color: #E2E8F0;
      font-size: 10pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      page-break-after: always;
      position: relative;
      min-height: 98vh;
      display: flex;
      flex-direction: column;
    }

    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40px 20px;
    }

    .brand-emblem {
      width: 100px;
      height: 100px;
      border-radius: 24px;
      border: 2px solid #F59E0B;
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.3);
      margin-bottom: 24px;
      object-fit: cover;
    }

    .cover-badge {
      display: inline-block;
      background: rgba(0, 229, 153, 0.12);
      border: 1px solid #00E599;
      color: #00E599;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 9pt;
      padding: 6px 16px;
      border-radius: 9999px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .cover-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 28pt;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.15;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 13pt;
      color: #94A3B8;
      max-width: 600px;
      margin-bottom: 30px;
      line-height: 1.5;
    }

    .cover-meta {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px 28px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      text-align: left;
      width: 100%;
      max-width: 650px;
    }

    .meta-item h4 {
      font-size: 8pt;
      text-transform: uppercase;
      color: #64748B;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .meta-item p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5pt;
      font-weight: 700;
      color: #F8FAFC;
    }

    .page-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .page-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 16pt;
      font-weight: 800;
      color: #FFFFFF;
    }

    .page-route {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9pt;
      color: #00E599;
      background: rgba(0, 229, 153, 0.1);
      border: 1px solid rgba(0, 229, 153, 0.25);
      padding: 3px 10px;
      border-radius: 6px;
    }

    .page-desc {
      font-size: 9pt;
      color: #94A3B8;
      margin-bottom: 14px;
      line-height: 1.45;
    }

    .screenshots-container {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
      align-items: start;
    }

    .screenshot-card {
      background: #0F172A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    .screenshot-header {
      background: #1E293B;
      padding: 6px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      color: #CBD5E1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }

    .desktop-img {
      max-height: 280px;
      object-position: top;
    }

    .mobile-img {
      max-height: 280px;
      object-position: top;
    }

    .components-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 8pt;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .components-table th {
      background: #1E293B;
      color: #F8FAFC;
      text-align: left;
      padding: 7px 10px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .components-table td {
      padding: 6px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #CBD5E1;
      vertical-align: top;
    }

    .components-table tr:last-child td {
      border-bottom: none;
    }

    .comp-name {
      font-weight: 600;
      color: #FFFFFF;
      white-space: nowrap;
    }

    .comp-type {
      font-family: 'JetBrains Mono', monospace;
      color: #F59E0B;
      font-size: 7pt;
      background: rgba(245, 158, 11, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      white-space: nowrap;
    }

    .callout-box {
      background: rgba(0, 229, 153, 0.06);
      border-left: 3px solid #00E599;
      padding: 8px 12px;
      border-radius: 0 8px 8px 0;
      font-size: 8pt;
      color: #A7F3D0;
      margin-top: 10px;
      line-height: 1.4;
    }

    .callout-gold {
      background: rgba(245, 158, 11, 0.06);
      border-left: 3px solid #F59E0B;
      color: #FDE68A;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="page cover-page">
    <img src="file://${path.join(__dirname, '..', 'docs', 'assets', 'equorafilogo.jpeg').replace(/\\/g, '/')}" class="brand-emblem" alt="Equora Logo">
    <div class="cover-badge">Official UI/UX Design System & Screen Catalog</div>
    <h1 class="cover-title">EQUORA.FI<br><span style="font-size: 20pt; color: #00E599; font-weight: 800;">AUTONOMOUS WEB3 PROTOCOL</span></h1>
    <p class="cover-subtitle">Complete Page-by-Page Visual Specification, Desktop & Mobile In-App Browser Screenshots, Component Hierarchies, and Mathematical Layout Rules for UI/UX Designers.</p>
    
    <div class="cover-meta">
      <div class="meta-item">
        <h4>Target Platform</h4>
        <p>Responsive Web3 DApp</p>
      </div>
      <div class="meta-item">
        <h4>Breakpoints</h4>
        <p>390px (Mobile) / 1440px (Desk)</p>
      </div>
      <div class="meta-item">
        <h4>Core Engine</h4>
        <p>300/N DAO + 14-Node Matrix</p>
      </div>
      <div class="meta-item">
        <h4>DAO Cap</h4>
        <p>5X ($1,500 TROB)</p>
      </div>
      <div class="meta-item">
        <h4>Matrix Slots</h4>
        <p>12 Slots ($30 - $61,440)</p>
      </div>
      <div class="meta-item">
        <h4>Version</h4>
        <p>Release v3.2.0 (Live Preview)</p>
      </div>
    </div>
  </div>

  <!-- PAGE BREAKDOWNS -->
  ${PAGES.map((p, idx) => `
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">${idx + 1}. ${p.title}</h2>
        <div style="font-size: 8.5pt; color: #F59E0B; font-weight: 600; margin-top: 2px;">${p.subtitle}</div>
      </div>
      <span class="page-route">${BASE_URL}${p.route}</span>
    </div>

    <p class="page-desc">${p.description}</p>

    <div class="screenshots-container">
      <!-- Desktop Screenshot Card -->
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>DESKTOP VIEWPORT (1440 x 900)</span>
          <span>CHROME / BRAVE</span>
        </div>
        <img src="file://${path.join(SCREENSHOTS_DIR, `${p.id}_desktop.png`).replace(/\\/g, '/')}" class="screenshot-img desktop-img" alt="${p.title} Desktop">
      </div>

      <!-- Mobile Screenshot Card -->
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MOBILE (390 x 844)</span>
          <span>TROBSAFE / METAMASK</span>
        </div>
        <img src="file://${path.join(SCREENSHOTS_DIR, `${p.id}_mobile.png`).replace(/\\/g, '/')}" class="screenshot-img mobile-img" alt="${p.title} Mobile">
      </div>
    </div>

    <!-- Components Table -->
    <table class="components-table">
      <thead>
        <tr>
          <th style="width: 25%;">Component</th>
          <th style="width: 15%;">Type</th>
          <th style="width: 60%;">Content, Layout & Behavioral Details</th>
        </tr>
      </thead>
      <tbody>
        ${p.components.map(c => `
        <tr>
          <td class="comp-name">${c.name}</td>
          <td><span class="comp-type">${c.type}</span></td>
          <td>${c.details}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    ${p.id === 'dao' ? `
    <div class="callout-box callout-gold">
      <strong>⚡ CRITICAL DESIGNER DIRECTIVE (DAO 300/N & 5X CAP):</strong><br>
      • <strong>300 / N Instant Cashback:</strong> Member 1 gets $300 back instantly ($0 net cost). Member 2 gets $150 back, $150 to Member 1. Member 3 gets $100 back, $100 to M1, $100 to M2.<br>
      • <strong>5X Cap ($1,500 TROB) & 48h Re-Topup:</strong> When a member earns 1,500 TROB, trigger the urgent red 48:00:00 countdown timer. Re-topup 300 TROB resets the cap and preserves seat index.
    </div>
    ` : ''}

    ${p.id === 'matrix' ? `
    <div class="callout-box">
      <strong>⚡ CRITICAL DESIGNER DIRECTIVE (14-NODE MATRIX ENGINE):</strong><br>
      • Nodes 3, 6, 7, 8, 9, 11, 12 = 600% Direct Cash ($180 net cash on Slot 1).<br>
      • Node 4 = $30 split into 4 Value Pools (35% DAO, 40% Salary, 10% Box, 15% Drops). Nodes 5 & 10 = $60 auto-upgrade. Node 14 = Board recycle.
    </div>
    ` : ''}
  </div>
  `).join('')}

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log(`✓ Master HTML generated at: ${OUTPUT_HTML}`);

  // 3. Render PDF via Puppeteer
  console.log('\n🖨️ Rendering High-Quality A4 PDF from HTML...');
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto(`file://${OUTPUT_HTML.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '10mm',
      right: '10mm'
    }
  });

  console.log(`🎉 SUCCESS! Complete PDF Document generated at: ${OUTPUT_PDF}`);

  await browser.close();
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
