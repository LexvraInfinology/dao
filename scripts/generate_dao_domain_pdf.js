const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_HTML = path.join(__dirname, '..', 'docs', 'Equora_DAO_Separate_Domain_Design_Guide.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', 'Equora_DAO_Separate_Domain_Design_Guide.pdf');
const ASSETS_DIR = path.join(__dirname, '..', 'docs', 'assets');
const SCREENSHOTS_DIR = path.join(ASSETS_DIR, 'screenshots');

const toBase64 = (filePath) => {
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

async function main() {
  console.log('🏛️ Encoding Image Assets to Base64 for DAO Separate Domain...');
  const logoImg = toBase64(path.join(ASSETS_DIR, 'equorafilogo-removebg-preview.png'));
  const cardImg = toBase64(path.join(ASSETS_DIR, 'dao_card.jpg'));
  const daoDesktop = toBase64(path.join(SCREENSHOTS_DIR, 'dao_desktop.png'));
  const daoMobile = toBase64(path.join(SCREENSHOTS_DIR, 'dao_mobile.png'));
  const matrixDesktop = toBase64(path.join(SCREENSHOTS_DIR, 'matrix_desktop.png'));

  console.log('📝 Building Standalone DAO Domain HTML Document...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Standalone DAO Domain UI/UX Specification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 10mm 12mm 12mm 12mm;
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
      line-height: 1.45;
      font-size: 8.5pt;
    }

    .page-break { page-break-before: always; }

    /* COVER PAGE */
    .cover-container {
      height: 96vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 35px 30px;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      background: radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.15) 0%, rgba(6, 8, 15, 0.98) 75%);
    }

    .cover-top-bar { display: flex; justify-content: space-between; align-items: center; }
    .cover-logo { height: 44px; }
    .cover-badge {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid #F59E0B;
      color: #FBBF24;
      border-radius: 999px;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .cover-title-area { margin-top: 25px; }
    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 26pt;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.15;
    }

    .cover-title span {
      background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-subtitle {
      font-size: 11pt;
      color: #94a3b8;
      margin-top: 10px;
      line-height: 1.4;
    }

    .cover-domain-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11pt;
      color: #00E599;
      background: rgba(0, 229, 153, 0.1);
      border: 1px solid rgba(0, 229, 153, 0.3);
      padding: 6px 14px;
      border-radius: 6px;
      margin-top: 12px;
    }

    .cover-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
    }

    .cover-stat-box {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 8px;
      padding: 14px 10px;
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
      gap: 18px;
      align-items: center;
      background: rgba(11, 17, 30, 0.7);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 8px;
      padding: 14px;
      margin: 15px 0;
    }

    .cover-card-img {
      width: 130px;
      height: 80px;
      object-fit: cover;
      border-radius: 5px;
      border: 1px solid #F59E0B;
    }

    .cover-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #64748b;
    }

    /* CONTENT PAGES */
    .content-page { padding: 12px 0; }

    h2 {
      font-family: 'Cinzel', serif;
      font-size: 14.5pt;
      color: #FBBF24;
      border-bottom: 2px solid rgba(245, 158, 11, 0.3);
      padding-bottom: 5px;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }

    h3 {
      font-size: 10pt;
      color: #ffffff;
      margin: 10px 0 5px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    h3::before { content: "✦"; color: #F59E0B; font-size: 8.5pt; }

    p { color: #cbd5e1; margin-bottom: 8px; line-height: 1.45; }

    /* GALLERY */
    .screenshots-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 12px;
      margin: 10px 0;
    }

    .screenshot-card {
      background: #0B111E;
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 6px;
      overflow: hidden;
    }

    .screenshot-header {
      background: rgba(15, 23, 42, 0.85);
      padding: 5px 8px;
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      font-weight: 700;
      color: #FBBF24;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .screenshot-img { width: 100%; height: auto; display: block; }

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

    .data-table tr:nth-child(even) td { background: rgba(15, 23, 42, 0.7); }

    .highlight-cell { color: #00E599; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .gold-cell { color: #FBBF24; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .crimson-cell { color: #EF4444; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .code-cell { font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-size: 7pt; }

    .callout {
      border-radius: 5px;
      padding: 9px 12px;
      margin: 10px 0;
      font-size: 8pt;
      line-height: 1.4;
    }

    .callout-gold {
      background: rgba(245, 158, 11, 0.08);
      border-left: 3px solid #F59E0B;
      color: #fde68a;
    }

    .callout-emerald {
      background: rgba(0, 229, 153, 0.08);
      border-left: 3px solid #00E599;
      color: #a7f3d0;
    }

    /* DIGITAL CLOCK BOX */
    .countdown-box {
      background: #0B111E;
      border: 2px solid #F59E0B;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      margin: 10px 0;
    }

    .clock-digits {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16pt;
      font-weight: 900;
      color: #FBBF24;
      letter-spacing: 2px;
    }

    .clock-caption {
      font-size: 7pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 3px;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-container">
    <div>
      <div class="cover-top-bar">
        <img src="${logoImg}" class="cover-logo" alt="Equora Logo">
        <div class="cover-badge">Dedicated Standalone DAO Domain</div>
      </div>
      <div class="cover-title-area">
        <div class="cover-title">EQUORA.FI<br><span>STANDALONE DAO PORTAL</span></div>
        <div class="cover-subtitle">
          UI/UX Designer Page-by-Page Blueprint, Wireframes & Content Specifications<br>
          For the Sovereign Web Application Hosted on <strong>dao.equora.fi</strong>
        </div>
        <div class="cover-domain-badge">
          🌐 Dedicated Domain: dao.equora.fi (Separated from matrix.equora.fi)
        </div>
      </div>
    </div>

    <div class="cover-stats-grid">
      <div class="cover-stat-box">
        <div class="cover-stat-val">100</div>
        <div class="cover-stat-lbl">Strict Seat Cap</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">0</div>
        <div class="cover-stat-lbl">Referrals Required</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">300 / N</div>
        <div class="cover-stat-lbl">Instant Cashback</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">Day 22</div>
        <div class="cover-stat-lbl">Retail Domain Unlocks</div>
      </div>
    </div>

    <div class="cover-card-preview">
      <img src="${cardImg}" class="cover-card-img" alt="Soulbound NFT Pass">
      <div>
        <div style="font-family:'Cinzel',serif; font-size:10pt; color:#FBBF24; font-weight:700;">Complete Domain Separation</div>
        <div style="font-size:7.5pt; color:#94a3b8; margin-top:3px;">
          The DAO portal is completely decoupled from the retail matrix application. Genesis members on <strong>dao.equora.fi</strong> enjoy pure co-ownership with zero MLM friction, while capturing 35% of all retail matrix volume from <strong>matrix.equora.fi</strong> on Day 22!
        </div>
      </div>
    </div>

    <div class="cover-meta">
      <div><strong>Target Domain:</strong> dao.equora.fi</div>
      <div><strong>Security:</strong> Hardhat Core Protocol (34 Tests Passing)</div>
      <div><strong>Launch Window:</strong> Phase 1 Live (21-Day Genesis Countdown)</div>
      <div><strong>Status:</strong> Approved Dedicated DAO Web App Scope</div>
    </div>
  </div>

  <!-- ==================== PAGE 2: ARCHITECTURE & REFERENCE IMAGES ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>1. Strategic Architecture & Reference Visuals</h2>

    <p>
      The client requires two completely separate domains. The UI/UX designer must design <strong>dao.equora.fi</strong> as an institutional sovereign terminal.
    </p>

    <!-- Visual Gallery -->
    <div class="screenshots-row">
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MAIN DAO DESKTOP (1440 × 900)</span>
          <span>dao.equora.fi</span>
        </div>
        <img src="${daoDesktop}" class="screenshot-img" alt="DAO Desktop View">
      </div>
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MOBILE VIEWPORT (390 × 844)</span>
          <span>TROBSAFE / METAMASK</span>
        </div>
        <img src="${daoMobile}" class="screenshot-img" alt="DAO Mobile View">
      </div>
    </div>

    <h3>1.1 The Domain Interconnection on Day 22</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Feature Dimension</th>
          <th style="width: 37.5%;">Domain A: dao.equora.fi (VIP Council)</th>
          <th style="width: 37.5%;">Domain B: matrix.equora.fi (Retail Network)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Primary Audience</strong></td>
          <td class="gold-cell">100 Founding Sovereign Co-Owners</td>
          <td>Everyday Retail Users & Network Promoters</td>
        </tr>
        <tr>
          <td><strong>Current Status</strong></td>
          <td class="highlight-cell">100% ACTIVE NOW (PHASE 1)</td>
          <td class="crimson-cell">LOCKED (21-DAY COUNTDOWN TIMER)</td>
        </tr>
        <tr>
          <td><strong>Entry Requirement</strong></td>
          <td class="gold-cell">Flat 300 TROB ($300) One-Time</td>
          <td>$30 Slot 1 Normal ID (Progression to Slot 12)</td>
        </tr>
        <tr>
          <td><strong>Referral Requirement</strong></td>
          <td class="highlight-cell">ZERO (0) REFERRALS — 100% Passive</td>
          <td>2 Direct Referrals Required to Cash Out</td>
        </tr>
        <tr>
          <td><strong>Day 22 Interconnection</strong></td>
          <td class="gold-cell">Receives 35% on-chain royalties automatically</td>
          <td>Starts filling normal $30 ID matrix seats dynamically!</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-gold">
      <strong>💎 DESIGN DIRECTIVE:</strong><br>
      The DAO application on <strong>dao.equora.fi</strong> must feel like an exclusive institutional private terminal (Swiss private wealth meets high-end Web3). Do NOT include retail matrix slot purchase buttons here!
    </div>
  </div>

  <!-- ==================== PAGE 3: PAGES 1 & 2 CONTENT BREAKDOWN ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>2. Pages to Design for dao.equora.fi (Pages 1 & 2)</h2>

    <h3>Page 1: Sovereign DAO Gateway & Public Onboarding ('/')</h3>
    <p>
      The public entry point to <strong>dao.equora.fi</strong> for visitors, displaying live scarcity, 21-day countdown, and 300/N instant cashback calculator.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">UI Field</th>
          <th style="width: 35%;">Smart Contract Source</th>
          <th style="width: 15%;">Type</th>
          <th style="width: 25%;">Live Display Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Seats Available</strong></td>
          <td class="code-cell">EquoraDAO.getRemainingPositions()</td>
          <td>uint256</td>
          <td class="highlight-cell">14 / 100 Seats Available</td>
        </tr>
        <tr>
          <td><strong>Genesis Countdown</strong></td>
          <td class="code-cell">EquoraDAO.GENESIS_WINDOW_END()</td>
          <td>timestamp</td>
          <td class="gold-cell">18d : 14h : 22m : 10s</td>
        </tr>
        <tr>
          <td><strong>Next Seat Position</strong></td>
          <td class="code-cell">memberCount + 1</td>
          <td>uint8</td>
          <td class="gold-cell">Seat #87 in Line</td>
        </tr>
        <tr>
          <td><strong>Instant Cashback</strong></td>
          <td class="code-cell">300 / 87</td>
          <td>number</td>
          <td class="highlight-cell">$3.45 TROB (Instant to Wallet)</td>
        </tr>
        <tr>
          <td><strong>Net Out-of-Pocket</strong></td>
          <td class="code-cell">300 - (300 / 87)</td>
          <td>number</td>
          <td class="gold-cell">$296.55 TROB</td>
        </tr>
        <tr>
          <td><strong>Primary CTA Button</strong></td>
          <td class="code-cell">Web3 Transaction Trigger</td>
          <td>button</td>
          <td class="gold-cell">[ Claim Seat #87 (300 TROB) ]</td>
        </tr>
      </tbody>
    </table>

    <h3>Page 2: 100-Seat Council Matrix Grid & Seat Inspector ('/seats')</h3>
    <p>
      Interactive 10x10 matrix showing all 100 seats, real-time owner addresses, lifetime earnings, and vacant sniping opportunities.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 20%;">Seat State</th>
          <th style="width: 15%;">Tile Color</th>
          <th style="width: 35%;">Condition / Logic</th>
          <th style="width: 30%;">User Action on Click</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Claimed Active</strong></td>
          <td class="gold-cell">🟡 Solid Gold (#F59E0B)</td>
          <td>Seats occupied by active council members</td>
          <td>Opens Tooltip Inspector with stats</td>
        </tr>
        <tr>
          <td><strong>Your Seat</strong></td>
          <td class="highlight-cell">🟢 Emerald Crown (#00E599)</td>
          <td>Connected user's personal seat</td>
          <td>Opens Personal Lounge Drawer</td>
        </tr>
        <tr>
          <td><strong>Next Available</strong></td>
          <td style="color:#06B6D4; font-weight:700;">🔵 Cyan Pulse (#06B6D4)</td>
          <td>Next seat in line to be claimed (e.g. #87)</td>
          <td>Opens 300 TROB Claim Modal</td>
        </tr>
        <tr>
          <td><strong>Defaulted Vacancy</strong></td>
          <td class="crimson-cell">🔴 Crimson Dashed (#EF4444)</td>
          <td>Prior occupant missed 48h re-topup</td>
          <td>Opens Sniping Takeover Modal!</td>
        </tr>
        <tr>
          <td><strong>Locked Future</strong></td>
          <td>⚫ Dark Slate (#1E293B)</td>
          <td>Unclaimed future seats in council</td>
          <td>Disabled / Locked preview</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-emerald">
      <strong>✓ TOOLTIP FLYOUT DATA ON TILE HOVER:</strong><br>
      • <strong>Seat:</strong> Council Seat #12 | • <strong>Occupant:</strong> 0x4B71...89F2 | • <strong>Soulbound NFT:</strong> #0012<br>
      • <strong>Total Earnings:</strong> $1,280.40 TROB | • <strong>5X Cap Health:</strong> 85.3% ($1,280.40 / $1,500.00) | • <strong>Voting Power:</strong> 1.0%
    </div>
  </div>

  <!-- ==================== PAGE 4: PAGES 3 & 4 CONTENT BREAKDOWN ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>3. Pages to Design for dao.equora.fi (Pages 3 & 4)</h2>

    <h3>Page 3: Council Member Lounge & Command Center ('/lounge')</h3>
    <p>
      The authenticated personal view for Soulbound NFT holders to track dividends, manage the 5X cap, and cash out.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Component / Card</th>
          <th style="width: 30%;">Smart Contract Function</th>
          <th style="width: 15%;">Type</th>
          <th style="width: 30%;">Live Content / Values</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Soulbound NFT Badge</strong></td>
          <td class="code-cell">tokenOfOwnerByIndex()</td>
          <td>uint256</td>
          <td class="gold-cell">Pass #0012 • 1.0% Voting Power</td>
        </tr>
        <tr>
          <td><strong>5X Cap Health Meter</strong></td>
          <td class="code-cell">EquoraDAO.getCapProgress()</td>
          <td>percent</td>
          <td class="highlight-cell">$840.00 / $1,500.00 (56% Safe)</td>
        </tr>
        <tr>
          <td><strong>48h Re-Topup Clock</strong></td>
          <td class="code-cell">retopupTimeRemaining()</td>
          <td>timestamp</td>
          <td class="crimson-cell">Active when earned &ge; $1,500 (47:58:22)</td>
        </tr>
        <tr>
          <td><strong>Claimable Dividends</strong></td>
          <td class="code-cell">poolClaimable + fallbackClaimable</td>
          <td>uint256</td>
          <td class="highlight-cell">$420.50 TROB (Ready to Cash Out)</td>
        </tr>
        <tr>
          <td><strong>1-Click Cashout Action</strong></td>
          <td class="code-cell">EquoraDAO.claimAll()</td>
          <td>button</td>
          <td class="gold-cell">[ ⚡ Withdraw to TrobSafe Wallet ]</td>
        </tr>
      </tbody>
    </table>

    <h3>Page 4: Day 22 Retail Matrix Bridge & Royalty Forecast ('/matrix-bridge')</h3>
    <p>
      Illustrates the on-chain bridge to the separate retail domain (<strong>matrix.equora.fi</strong>) launching on Day 22.
    </p>

    <div class="countdown-box">
      <div class="clock-caption">COUNTDOWN TO RETAIL LAUNCH ON matrix.equora.fi:</div>
      <div class="clock-digits">18 DAYS : 14 HOURS : 22 MINS : 10 SEC</div>
      <div class="clock-caption">ON DAY 22, NORMAL $30 ID SEATS START FILLING & STREAMING 35% TO DAO!</div>
    </div>

    <!-- Visual Teaser of Matrix -->
    <div class="screenshot-card" style="margin:8px 0;">
      <div class="screenshot-header">
        <span>DOMAIN B PREVIEW (matrix.equora.fi) — 12-SLOT MATRIX ENGINE</span>
        <span>LAUNCHES ON DAY 22</span>
      </div>
      <img src="${matrixDesktop}" class="screenshot-img" style="max-height:160px; object-fit:cover;" alt="Matrix Preview">
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Retail Matrix Volume on Domain B</th>
          <th>Total 35% Pool Generated</th>
          <th>Monthly Dividend per DAO Seat (1/100th)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1,000 Retail Matrix Cycles</strong></td>
          <td class="gold-cell">$35,000.00 TROB</td>
          <td class="highlight-cell">$350.00 TROB / month</td>
        </tr>
        <tr>
          <td><strong>5,000 Retail Matrix Cycles</strong></td>
          <td class="gold-cell">$175,000.00 TROB</td>
          <td class="highlight-cell">$1,750.00 TROB / month</td>
        </tr>
        <tr>
          <td><strong>20,000 Retail Matrix Cycles</strong></td>
          <td class="gold-cell">$700,000.00 TROB</td>
          <td class="highlight-cell">$7,000.00 TROB / month</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 5: PAGE 5 & MODALS ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>4. Page 5: Treasury Wallet & Core Modals</h2>

    <h3>Page 5: Treasury Wallet & Financial Ledger ('/treasury')</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">UI Field</th>
          <th style="width: 30%;">Source</th>
          <th style="width: 15%;">Type</th>
          <th style="width: 30%;">Live Content / Values</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Internal Balance</strong></td>
          <td class="code-cell">DAO Internal Ledger</td>
          <td>uint256</td>
          <td class="highlight-cell">$420.50 TROB (Withdrawable)</td>
        </tr>
        <tr>
          <td><strong>Wallet Balance</strong></td>
          <td class="code-cell">ERC-20 balanceOf()</td>
          <td>uint256</td>
          <td class="gold-cell">$1,420.00 TROB (TrobSafe)</td>
        </tr>
        <tr>
          <td><strong>Withdraw Amount Input</strong></td>
          <td class="code-cell">User input state</td>
          <td>number</td>
          <td>Amount + Chips (25%, 50%, 75%, MAX)</td>
        </tr>
        <tr>
          <td><strong>Estimated Gas Fee</strong></td>
          <td class="code-cell">estimateGas()</td>
          <td>string</td>
          <td class="code-cell">&lt; $0.005 USD (Polygon / Trobium)</td>
        </tr>
        <tr>
          <td><strong>Transaction Audit Ledger</strong></td>
          <td class="code-cell">On-chain transaction logs</td>
          <td>Tx[]</td>
          <td>Type, Amount, Source Seat, Date, Hash</td>
        </tr>
      </tbody>
    </table>

    <h3>4.1 Modal 1: 48-Hour Urgency Re-Topup Modal</h3>
    <div class="callout callout-crimson">
      <strong>⚠️ 48-HOUR URGENCY RE-TOPUP MODAL SPECIFICATION:</strong><br>
      • <strong>Trigger:</strong> Member earned $\ge \$1,500$ TROB (5X Cap).<br>
      • <strong>Visuals:</strong> Flashing crimson border, digital flip clock ('47:58:22') counting down to zero.<br>
      • <strong>Content:</strong> <em>"Your Council Seat #12 has reached the 5X Cap ($1,500). Deposit 300 TROB within 48 hours to reset your cap to 0% and protect your seat from forfeiture."</em><br>
      • <strong>Action:</strong> <strong>[ RE-TOPUP 300 TROB NOW ]</strong> resets cap and preserves seat co-ownership.
    </div>

    <h3>4.2 Modal 2: Defaulted Vacant Seat Sniping Modal</h3>
    <div class="callout callout-gold">
      <strong>🎯 DEFAULTED SEAT SNIPING MODAL SPECIFICATION:</strong><br>
      • <strong>Trigger:</strong> User clicks a red dashed tile on the 10x10 grid.<br>
      • <strong>Content:</strong> <em>"Council Seat #44 Vacancy Available! Prior occupant defaulted after 48h deadline. Pay 300 TROB to claim Seat #44, become a sovereign co-owner, and mint a fresh Soulbound NFT."</em><br>
      • <strong>Action:</strong> <strong>[ CLAIM DEFAULTED SEAT (300 TROB) ]</strong> transfers seat co-ownership instantly.
    </div>

    <h3>4.3 Design System Tokens for dao.equora.fi</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>Token Name</th>
          <th>Hex / Value</th>
          <th>Application in dao.equora.fi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Obsidian Void</strong></td>
          <td class="gold-cell">#06080F</td>
          <td>Deep space canvas background</td>
        </tr>
        <tr>
          <td><strong>Slate Card</strong></td>
          <td class="gold-cell">#0B111E (Blur 16px)</td>
          <td>Glassmorphic card panels</td>
        </tr>
        <tr>
          <td><strong>Sovereign Gold</strong></td>
          <td class="gold-cell">#F59E0B / #FBBF24</td>
          <td>Primary buttons, VIP badges, crowns, and titles</td>
        </tr>
        <tr>
          <td><strong>Radiant Emerald</strong></td>
          <td class="highlight-cell">#00E599</td>
          <td>Instant cashback, positive yields, safe zone</td>
        </tr>
        <tr>
          <td><strong>Urgency Crimson</strong></td>
          <td class="crimson-cell">#EF4444</td>
          <td>48h countdown clock, default warnings</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; color: #64748b; font-size: 7.5pt;">
      Equora.Fi Autonomous Governance Protocol • Dedicated dao.equora.fi Specification • Polygon / Trobium Network
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log(`✓ Standalone DAO HTML written at: ${OUTPUT_HTML}`);

  console.log('🖨️ Launching Puppeteer to compile Standalone DAO Domain PDF...');
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
      top: '10mm',
      bottom: '10mm',
      left: '10mm',
      right: '10mm'
    }
  });

  await browser.close();
  console.log(`🎉 SUCCESS! Standalone DAO Domain PDF generated at: ${OUTPUT_PDF}`);
}

main().catch(err => {
  console.error('Error generating DAO Domain PDF:', err);
  process.exit(1);
});
