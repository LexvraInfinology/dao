const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_HTML = path.join(__dirname, '..', 'docs', 'Equora_Phase1_Genesis_DAO_Only_Specification.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', 'Equora_Phase1_Genesis_DAO_Only_Specification.pdf');
const ASSETS_DIR = path.join(__dirname, '..', 'docs', 'assets');
const SCREENSHOTS_DIR = path.join(ASSETS_DIR, 'screenshots');

const toBase64 = (filePath) => {
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

async function main() {
  console.log('🏛️ Encoding Image Assets to Base64...');
  const logoImg = toBase64(path.join(ASSETS_DIR, 'equorafilogo-removebg-preview.png'));
  const cardImg = toBase64(path.join(ASSETS_DIR, 'dao_card.jpg'));
  const daoDesktop = toBase64(path.join(SCREENSHOTS_DIR, 'dao_desktop.png'));
  const daoMobile = toBase64(path.join(SCREENSHOTS_DIR, 'dao_mobile.png'));
  const matrixDesktop = toBase64(path.join(SCREENSHOTS_DIR, 'matrix_desktop.png'));
  const matrixMobile = toBase64(path.join(SCREENSHOTS_DIR, 'matrix_mobile.png'));

  console.log('📝 Building Phase 1 Dedicated HTML Document...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Phase 1 Genesis DAO Dedicated UI/UX Specification</title>
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

    .cover-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 25px 0;
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
      font-size: 10.5pt;
      color: #ffffff;
      margin: 12px 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    h3::before {
      content: "✦";
      color: #F59E0B;
      font-size: 9pt;
    }

    p { color: #cbd5e1; margin-bottom: 8px; line-height: 1.45; }

    /* SCREENSHOTS CONTAINER */
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
      position: relative;
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

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
    }

    .locked-overlay-card {
      position: absolute;
      top: 30px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(6, 8, 15, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px;
      border: 1px dashed #EF4444;
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

    .callout-crimson {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid #EF4444;
      color: #fca5a5;
    }

    /* DIGITAL CLOCK BOX */
    .countdown-box {
      background: #0B111E;
      border: 2px solid #F59E0B;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      margin: 12px 0;
    }

    .clock-digits {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18pt;
      font-weight: 900;
      color: #FBBF24;
      letter-spacing: 2px;
    }

    .clock-caption {
      font-size: 7.5pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-container">
    <div>
      <div class="cover-top-bar">
        <img src="${logoImg}" class="cover-logo" alt="Equora Logo">
        <div class="cover-badge">Phase 1 Dedicated Launch & Locked Matrix Blueprint</div>
      </div>
      <div class="cover-title-area">
        <div class="cover-title">EQUORA.FI<br><span>PHASE 1: GENESIS DAO ONLY</span></div>
        <div class="cover-subtitle">
          Dedicated UI/UX Specification for the 100-Seat Sovereign Council Portal<br>
          Including the 21-Day Locked Matrix Vault & Day 22 Retail Launch Mechanics
        </div>
      </div>
    </div>

    <div class="cover-stats-grid">
      <div class="cover-stat-box">
        <div class="cover-stat-val">100</div>
        <div class="cover-stat-lbl">Council Seats</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">21 Days</div>
        <div class="cover-stat-lbl">Phase 1 Genesis Window</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">Day 22</div>
        <div class="cover-stat-lbl">$30 ID Matrix Unlocks</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">300 / N</div>
        <div class="cover-stat-lbl">Instant Cashback Math</div>
      </div>
    </div>

    <div class="cover-card-preview">
      <img src="${cardImg}" class="cover-card-img" alt="Soulbound NFT Pass">
      <div>
        <div style="font-family:'Cinzel',serif; font-size:10pt; color:#FBBF24; font-weight:700;">Exclusive Phase 1 Scope</div>
        <div style="font-size:7.5pt; color:#94a3b8; margin-top:3px;">
          The user interface is 100% focused on Genesis DAO co-ownership during Phase 1. Matrix Slot 1 ($30 ID) is locked behind a 21-day countdown timer. On Day 22, the matrix unlocks and begins filling seats dynamically!
        </div>
      </div>
    </div>

    <div class="cover-meta">
      <div><strong>Platform:</strong> Polygon / Trobium Network</div>
      <div><strong>Security:</strong> Hardhat Core Protocol (34 Tests Passing)</div>
      <div><strong>Launch Window:</strong> Phase 1 (Days 1–21) -> Phase 2 (Day 22+)</div>
      <div><strong>Status:</strong> Approved Dedicated Phase 1 Scope</div>
    </div>
  </div>

  <!-- ==================== PAGE 2: STRATEGIC LAUNCH TIMELINE ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>1. Strategic Plan: Phase 1 (Days 1–21) vs. Day 22 Matrix Launch</h2>

    <p>
      The client has confirmed that the protocol must launch with <strong>Phase 1 strictly focused on the Genesis DAO Council</strong>. Designers must not present retail matrix recruitment as active today.
    </p>

    <div class="countdown-box">
      <div class="clock-caption">✦ CURRENT PROTOCOL PHASE: PHASE 1 GENESIS COUNCIL ✦</div>
      <div class="clock-digits">18 DAYS : 14 HOURS : 22 MINS : 10 SEC</div>
      <div class="clock-caption">COUNTDOWN TO DAY 22: NORMAL $30 ID MATRIX UNLOCKS GLOBALLY</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Launch Dimension</th>
          <th style="width: 37.5%;">Phase 1: Genesis DAO (Days 1 to 21)</th>
          <th style="width: 37.5%;">Phase 2: Retail Matrix (Day 22 Onward)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Current Status</strong></td>
          <td class="highlight-cell">100% LIVE & ACTIVE NOW</td>
          <td class="crimson-cell">LOCKED (21-DAY COUNTDOWN TIMER)</td>
        </tr>
        <tr>
          <td><strong>Target Audience</strong></td>
          <td>100 Founding Sovereign Leaders</td>
          <td>Everyday Retail Participants (Global Network)</td>
        </tr>
        <tr>
          <td><strong>Entry Requirement</strong></td>
          <td class="gold-cell">Flat 300 TROB ($300) One-Time</td>
          <td>$30 Slot 1 ID (Progression to Slot 12)</td>
        </tr>
        <tr>
          <td><strong>Referral Requirement</strong></td>
          <td class="highlight-cell">ZERO (0) REFERRALS — 100% Passive</td>
          <td>2 Direct Referrals Required to Qualify</td>
        </tr>
        <tr>
          <td><strong>Earnings Mechanism</strong></td>
          <td class="highlight-cell">Instant 300 / N Cashback + Pushes</td>
          <td>600% Direct Cash ($180) + Pool Routing</td>
        </tr>
        <tr>
          <td><strong>What Happens on Day 22</strong></td>
          <td>Begins receiving 35% global royalties</td>
          <td class="gold-cell">Normal $30 ID seats start filling globally!</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-gold">
      <strong>💎 DESIGNER DIRECTIVE (PHASE 1):</strong><br>
      The UI must make users feel the urgent scarcity of the 100 seats. Explain to users: <em>"Secure your seat in the Genesis Council during Phase 1. When the 21-day timer hits zero on Day 22, normal users will enter the $30 matrix, and 35% of all their transactions will flow into YOUR DAO Treasury!"</em>
    </div>
  </div>

  <!-- ==================== PAGE 3: MAIN APPLICATION SCREEN (DAO PORTAL) ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>2. Primary Screen: Genesis DAO Council Portal (/dao)</h2>

    <p>
      This is the primary operating screen during Phase 1. Users inspect the 100-Seat Grid, claim passes, monitor payouts, and manage re-topups.
    </p>

    <!-- Visual Screenshots -->
    <div class="screenshots-row">
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>DESKTOP VIEWPORT (1440 × 900)</span>
          <span>MAIN PHASE 1 SCREEN</span>
        </div>
        <img src="${daoDesktop}" class="screenshot-img" alt="DAO Desktop View">
      </div>
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MOBILE DAPP (390 × 844)</span>
          <span>TROBSAFE / METAMASK</span>
        </div>
        <img src="${daoMobile}" class="screenshot-img" alt="DAO Mobile View">
      </div>
    </div>

    <!-- Data Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Component / Field</th>
          <th style="width: 30%;">Smart Contract Function</th>
          <th style="width: 10%;">Type</th>
          <th style="width: 18%;">Live Example Value</th>
          <th style="width: 17%;">Formatting Rule</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Seats Claimed</strong></td>
          <td class="code-cell">EquoraDAO.getDAOStats().memberCount</td>
          <td>uint256</td>
          <td class="gold-cell">86</td>
          <td>Format: 86 / 100</td>
        </tr>
        <tr>
          <td><strong>Seats Remaining</strong></td>
          <td class="code-cell">EquoraDAO.getRemainingPositions()</td>
          <td>uint256</td>
          <td class="highlight-cell">14</td>
          <td>Highlight gold if &lt; 20</td>
        </tr>
        <tr>
          <td><strong>Phase 1 Countdown</strong></td>
          <td class="code-cell">EquoraDAO.GENESIS_WINDOW_END()</td>
          <td>timestamp</td>
          <td class="code-cell">1,791,240,000</td>
          <td>Clock: DD:HH:MM:SS</td>
        </tr>
        <tr>
          <td><strong>Soulbound Token ID</strong></td>
          <td class="code-cell">EquoraDAOMembership.tokenOfOwnerByIndex()</td>
          <td>uint256</td>
          <td class="gold-cell">#0012</td>
          <td>4-digit padded number</td>
        </tr>
        <tr>
          <td><strong>Voting Sovereignty</strong></td>
          <td class="code-cell">Constant: 1 / 100</td>
          <td>percent</td>
          <td class="highlight-cell">1.0%</td>
          <td>Badge: 1 Seat = 1 Vote</td>
        </tr>
        <tr>
          <td><strong>5X Cap Earned</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails()[4]</td>
          <td>uint256</td>
          <td class="highlight-cell">$840.00 TROB</td>
          <td>2 decimals + Monospace</td>
        </tr>
        <tr>
          <td><strong>5X Cap Ceiling</strong></td>
          <td class="code-cell">EquoraDAO.getCapProgress()[1]</td>
          <td>uint256</td>
          <td class="gold-cell">$1,500.00 TROB</td>
          <td>Fixed constant ($300 × 5)</td>
        </tr>
        <tr>
          <td><strong>48h Re-Topup Clock</strong></td>
          <td class="code-cell">EquoraDAO.retopupTimeRemaining()</td>
          <td>uint256</td>
          <td class="crimson-cell">172,400s (47h 53m)</td>
          <td>Digital clock: HH:MM:SS</td>
        </tr>
        <tr>
          <td><strong>1-Click Claim Balance</strong></td>
          <td class="code-cell">poolClaimable + fallbackClaimable</td>
          <td>uint256</td>
          <td class="highlight-cell">$420.50 TROB</td>
          <td>Emerald header ticker</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 4: 21-DAY LOCKED MATRIX VAULT SCREEN ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>3. The Locked Matrix Vault Screen & 21-Day Countdown (/matrix)</h2>

    <p>
      When users click the Matrix navigation tab during Phase 1, they do <strong>NOT</strong> see an active purchase interface. Instead, they see the <strong>Locked Matrix Vault</strong> with a 21-day countdown:
    </p>

    <!-- Visual Locked Screen -->
    <div class="screenshots-row">
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MATRIX VAULT (LOCKED STATE)</span>
          <span>COUNTDOWN ACTIVE</span>
        </div>
        <img src="${matrixDesktop}" class="screenshot-img" style="filter: blur(4px) brightness(0.5);" alt="Matrix Locked Desktop">
        <div class="locked-overlay-card">
          <div style="font-size:24pt; margin-bottom:8px;">🔒</div>
          <div style="font-family:'Cinzel',serif; font-size:14pt; color:#FBBF24; font-weight:900;">PHASE 2 MATRIX IS LOCKED</div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:16pt; color:#ffffff; font-weight:700; margin:10px 0; background:rgba(0,0,0,0.6); padding:6px 14px; border-radius:6px; border:1px solid #F59E0B;">
            18d : 14h : 22m : 10s
          </div>
          <div style="font-size:8pt; color:#cbd5e1; max-width:380px; margin-bottom:12px;">
            Normal $30 ID matrix seats will start filling dynamically on <strong>Day 22</strong>! Secure your Phase 1 Genesis Council seat now to capture 35% global matrix royalties.
          </div>
          <div style="background:#F59E0B; color:#06080F; font-weight:700; font-size:8pt; padding:6px 14px; border-radius:4px; text-transform:uppercase;">
            Claim Phase 1 DAO Seat (300 TROB)
          </div>
        </div>
      </div>

      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MOBILE LOCKED VIEW (390 × 844)</span>
          <span>DAPP BROWSER</span>
        </div>
        <img src="${matrixMobile}" class="screenshot-img" style="filter: blur(4px) brightness(0.5);" alt="Matrix Locked Mobile">
      </div>
    </div>

    <!-- Data Table for Locked Matrix -->
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">UI Field</th>
          <th style="width: 35%;">Source / Logic</th>
          <th style="width: 15%;">Type</th>
          <th style="width: 25%;">Display Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Status Badge</strong></td>
          <td class="code-cell">Protocol Launch Phase</td>
          <td>enum</td>
          <td class="crimson-cell">LOCKED (PHASE 1 ACTIVE)</td>
        </tr>
        <tr>
          <td><strong>Digital Countdown</strong></td>
          <td class="code-cell">GENESIS_WINDOW_END - block.timestamp</td>
          <td>timestamp</td>
          <td class="gold-cell">18d : 14h : 22m : 10s</td>
        </tr>
        <tr>
          <td><strong>Unlock Event</strong></td>
          <td class="code-cell">Day 22 Trigger</td>
          <td>string</td>
          <td class="highlight-cell">Day 22: $30 ID Matrix Seats Fill</td>
        </tr>
        <tr>
          <td><strong>Slot 1 Entry Fee</strong></td>
          <td class="code-cell">EquoraMatrix.slotPrice(1)</td>
          <td>uint256</td>
          <td>$30.00 TROB</td>
        </tr>
        <tr>
          <td><strong>DAO Royalty Stream</strong></td>
          <td class="code-cell">EquoraVault.DAO_POOL_BPS()</td>
          <td>percent</td>
          <td class="gold-cell">35% of all matrix volume</td>
        </tr>
        <tr>
          <td><strong>Action CTA</strong></td>
          <td class="code-cell">Router Navigation</td>
          <td>button</td>
          <td class="gold-cell">[ Claim Genesis DAO Seat ]</td>
        </tr>
      </tbody>
    </table>

    <div class="callout callout-crimson">
      <strong>⚡ CRITICAL DESIGN DIRECTIVE FOR THE LOCKED SCREEN:</strong><br>
      • Do <strong>NOT</strong> allow users to buy matrix slots during Phase 1.<br>
      • The 21-day countdown must be visually prominent with flip-clock animations.<br>
      • Highlight that when Day 22 arrives, the $30 normal ID seats start filling dynamically, and 35% of all volume automatically flows to Phase 1 DAO members!
    </div>
  </div>

  <!-- ==================== PAGE 5: 300/N MATHEMATICS & CHECKLIST ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>4. Mathematical Mechanics & Designer Deliverables</h2>

    <p>
      The $300 / N$ instant redistribution formula governs all payouts during Phase 1:
      $$\\text{Payout Per Member} = \\frac{300}{N}$$
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Seat Position ($N$)</th>
          <th>Gross Deposit</th>
          <th>Instant Cashback to Joiner</th>
          <th>Redistributed to Prior Members</th>
          <th>Net Out-of-Pocket Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Seat #1 (Genesis Alpha)</strong></td>
          <td>$300.00</td>
          <td class="highlight-cell">$300.00 (300 / 1)</td>
          <td>$0.00</td>
          <td class="highlight-cell">$0.00 (100% FREE!)</td>
        </tr>
        <tr>
          <td><strong>Seat #2</strong></td>
          <td>$300.00</td>
          <td class="highlight-cell">$150.00 (300 / 2)</td>
          <td>$150.00 to Seat #1</td>
          <td class="gold-cell">$150.00</td>
        </tr>
        <tr>
          <td><strong>Seat #3</strong></td>
          <td>$300.00</td>
          <td class="highlight-cell">$100.00 (300 / 3)</td>
          <td>$100.00 to #1, $100.00 to #2</td>
          <td class="gold-cell">$200.00</td>
        </tr>
        <tr>
          <td><strong>Seat #4</strong></td>
          <td>$300.00</td>
          <td class="highlight-cell">$75.00 (300 / 4)</td>
          <td>$75.00 each to #1, #2, #3</td>
          <td class="gold-cell">$225.00</td>
        </tr>
        <tr>
          <td><strong>Seat #10</strong></td>
          <td>$300.00</td>
          <td class="highlight-cell">$30.00 (300 / 10)</td>
          <td>$30.00 each to Seats #1–#9</td>
          <td class="gold-cell">$270.00</td>
        </tr>
        <tr>
          <td><strong>Seat #50</strong></td>
          <td>$300.00</td>
          <td class="highlight-cell">$6.00 (300 / 50)</td>
          <td>$6.00 each to Seats #1–#49</td>
          <td class="gold-cell">$294.00</td>
        </tr>
        <tr>
          <td><strong>Seat #100 (Final Seat)</strong></td>
          <td>$300.00</td>
          <td class="highlight-cell">$3.00 (300 / 100)</td>
          <td>$3.00 each to Seats #1–#99</td>
          <td class="gold-cell">$297.00</td>
        </tr>
      </tbody>
    </table>

    <h3>4.1 UI/UX Designer Phase 1 Figma Deliverables</h3>
    <div class="callout callout-gold">
      <strong>📐 REQUIRED FIGMA FRAMES (PHASE 1 ONLY):</strong><br>
      • <strong>Frame 1 (Desktop 1440px & Mobile 390px):</strong> Genesis DAO Council Portal ('/dao') with 100-Seat Grid & 300/N Calculator.<br>
      • <strong>Frame 2 (Desktop 1440px & Mobile 390px):</strong> Locked Matrix Vault Screen ('/matrix') with **21-Day Countdown Clock** & Padlock.<br>
      • <strong>Frame 3 (Desktop 1440px & Mobile 390px):</strong> Founder Executive Dashboard ('/dashboard') with VIP badges.<br>
      • <strong>Frame 4 (Desktop 1440px & Mobile 390px):</strong> Treasury Wallet & 1-Click Cashout ('/wallet').<br>
      • <strong>Frame 5 (Modal):</strong> 48-Hour Urgency Re-Topup Countdown Modal ('47:58:22').<br>
      • <strong>Frame 6 (Modal):</strong> Defaulted Vacant Seat Sniping & Fresh NFT Issuance Flow.
    </div>

    <div style="margin-top: 25px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; color: #64748b; font-size: 7.5pt;">
      Equora.Fi Autonomous Governance Protocol • Phase 1 Dedicated Launch Specification • Polygon / Trobium Network
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log(`✓ Phase 1 HTML written at: ${OUTPUT_HTML}`);

  console.log('🖨️ Launching Puppeteer to compile Phase 1 Dedicated A4 PDF...');
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
  console.log(`🎉 SUCCESS! Phase 1 Dedicated PDF generated at: ${OUTPUT_PDF}`);
}

main().catch(err => {
  console.error('Error generating Phase 1 PDF:', err);
  process.exit(1);
});
