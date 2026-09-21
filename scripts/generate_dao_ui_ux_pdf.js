const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_HTML = path.join(__dirname, '..', 'docs', 'Equora_DAO_Exclusive_UI_UX_Specification.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', 'Equora_DAO_Exclusive_UI_UX_Specification.pdf');

const toBase64 = (filePath) => {
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

async function main() {
  console.log('🏛️ Encoding Image Assets to Base64...');
  const desktopImg = toBase64(path.join(__dirname, '..', 'docs', 'assets', 'screenshots', 'dao_desktop.png'));
  const mobileImg = toBase64(path.join(__dirname, '..', 'docs', 'assets', 'screenshots', 'dao_mobile.png'));
  const cardImg = toBase64(path.join(__dirname, '..', 'docs', 'assets', 'dao_card.jpg'));
  const logoImg = toBase64(path.join(__dirname, '..', 'docs', 'assets', 'equorafilogo-removebg-preview.png'));

  console.log('📝 Generating Enhanced Master HTML with Visual Designs and Data Specifications...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Exclusive DAO UI/UX Design Specification & Data Guide</title>
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

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #06080F;
      color: #e2e8f0;
      line-height: 1.45;
      font-size: 9pt;
    }

    .page-break {
      page-break-before: always;
    }

    /* COVER PAGE */
    .cover-container {
      height: 96vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 35px 30px;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      background: radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.15) 0%, rgba(6, 8, 15, 0.98) 70%);
    }

    .cover-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cover-logo {
      height: 48px;
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid #F59E0B;
      color: #FBBF24;
      border-radius: 999px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .cover-title-area {
      margin-top: 25px;
    }

    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 28pt;
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
      font-size: 12pt;
      color: #94a3b8;
      margin-top: 12px;
      line-height: 1.4;
      font-weight: 400;
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
      font-size: 16pt;
      font-weight: 700;
      color: #FBBF24;
    }

    .cover-stat-lbl {
      font-size: 7pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }

    .cover-card-preview {
      display: flex;
      gap: 20px;
      align-items: center;
      background: rgba(11, 17, 30, 0.7);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 10px;
      padding: 16px;
      margin: 15px 0;
    }

    .cover-card-img {
      width: 140px;
      height: 90px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #F59E0B;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
    }

    .cover-card-text {
      flex: 1;
    }

    .cover-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #64748b;
    }

    /* HEADERS & TYPOGRAPHY */
    h2 {
      font-family: 'Cinzel', serif;
      font-size: 15pt;
      color: #FBBF24;
      border-bottom: 2px solid rgba(245, 158, 11, 0.3);
      padding-bottom: 6px;
      margin-bottom: 12px;
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

    p {
      color: #cbd5e1;
      margin-bottom: 8px;
      line-height: 1.45;
    }

    /* VISUAL GALLERY BLOCKS */
    .gallery-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 15px;
      margin: 12px 0;
    }

    .screenshot-card {
      background: #0B111E;
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 8px;
      overflow: hidden;
    }

    .screenshot-header {
      background: rgba(15, 23, 42, 0.8);
      padding: 6px 10px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      font-weight: 700;
      color: #FBBF24;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* TABLES */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8pt;
    }

    .data-table th {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .data-table td {
      padding: 6px 8px;
      border: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(15, 23, 42, 0.4);
    }

    .data-table tr:nth-child(even) td {
      background: rgba(15, 23, 42, 0.7);
    }

    .highlight-cell {
      color: #00E599;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .gold-cell {
      color: #FBBF24;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .crimson-cell {
      color: #EF4444;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .code-cell {
      font-family: 'JetBrains Mono', monospace;
      color: #38bdf8;
      font-size: 7.5pt;
    }

    /* CALLOUT BOXES */
    .callout {
      border-radius: 6px;
      padding: 10px 14px;
      margin: 10px 0;
      font-size: 8pt;
      line-height: 1.4;
    }

    .callout-gold {
      background: rgba(245, 158, 11, 0.08);
      border-left: 4px solid #F59E0B;
      color: #fde68a;
    }

    .callout-emerald {
      background: rgba(0, 229, 153, 0.08);
      border-left: 4px solid #00E599;
      color: #a7f3d0;
    }

    .callout-crimson {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #EF4444;
      color: #fca5a5;
    }

    /* GRID DEMO */
    .grid-visual-demo {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 4px;
      margin: 10px 0;
    }

    .grid-tile {
      height: 26px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7pt;
      font-weight: 700;
    }

    .tile-claimed { background: rgba(245, 158, 11, 0.25); border: 1px solid #F59E0B; color: #FBBF24; }
    .tile-user { background: rgba(0, 229, 153, 0.35); border: 2px solid #00E599; color: #ffffff; box-shadow: 0 0 8px rgba(0, 229, 153, 0.4); }
    .tile-next { background: rgba(6, 182, 212, 0.2); border: 1px dashed #06B6D4; color: #67e8f9; }
    .tile-defaulted { background: rgba(239, 68, 68, 0.25); border: 1px dashed #EF4444; color: #fca5a5; }
    .tile-locked { background: #1e293b; border: 1px solid #334155; color: #64748b; }

    .legend-bar {
      display: flex;
      gap: 12px;
      font-size: 7.5pt;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .legend-item { display: flex; align-items: center; gap: 5px; }
    .legend-swatch { width: 12px; height: 12px; border-radius: 2px; }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1: COVER PAGE ==================== -->
  <div class="cover-container">
    <div>
      <div class="cover-top-bar">
        <img src="${logoImg}" class="cover-logo" alt="Equora Logo">
        <div class="cover-badge">Sovereign VIP Experience & Data Spec</div>
      </div>
      <div class="cover-title-area">
        <div class="cover-title">EQUORA.FI<br><span>GENESIS DAO COUNCIL</span></div>
        <div class="cover-subtitle">
          UI/UX Designer Visual Blueprint, Page Layouts & Component Data Catalog<br>
          Dedicated Sovereign Portal for Exactly 100 Founding Seats
        </div>
      </div>
    </div>

    <div class="cover-stats-grid">
      <div class="cover-stat-box">
        <div class="cover-stat-val">100</div>
        <div class="cover-stat-lbl">Strict Seat Cap</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">300 / N</div>
        <div class="cover-stat-lbl">Instant Cashback</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">35%</div>
        <div class="cover-stat-lbl">Matrix Fee Stream</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">5X Cap</div>
        <div class="cover-stat-lbl">48h Re-Topup Cycle</div>
      </div>
    </div>

    <div class="cover-card-preview">
      <img src="${cardImg}" class="cover-card-img" alt="Soulbound NFT Pass">
      <div class="cover-card-text">
        <div style="font-family:'Cinzel',serif; font-size:11pt; color:#FBBF24; font-weight:700;">Soulbound VIP Council Governance Pass</div>
        <div style="font-size:8pt; color:#94a3b8; margin-top:4px;">
          Non-transferable ERC-721 token bound permanently to the council member's Web3 wallet. Grants 1.0% voting sovereignty, 300/N queue distributions, and 35% global matrix royalties.
        </div>
      </div>
    </div>

    <div class="cover-meta">
      <div><strong>Designer Blueprint:</strong> UI/UX Team & Product Leads</div>
      <div><strong>Verified Contracts:</strong> Hardhat Core Suite (34 Tests Passing)</div>
      <div><strong>Network:</strong> Polygon / Trobium Blockchain</div>
      <div><strong>Status:</strong> Approved DAO-Exclusive Scope</div>
    </div>
  </div>

  <!-- ==================== PAGE 2: VISUAL DESIGNS & SCREEN GALLERY ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>1. Visual Page Designs & Screen Mockups</h2>
    
    <p>
      The visual renderings below showcase the sovereign dark obsidian aesthetic, gold accents, and live UI components built for the Genesis DAO experience.
    </p>

    <div class="gallery-container">
      <!-- Desktop Viewport -->
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>DESKTOP COMMAND CENTER (1440 × 900)</span>
          <span>CHROME / BRAVE / OPERA</span>
        </div>
        <img src="${desktopImg}" class="screenshot-img" alt="DAO Desktop Viewport">
      </div>

      <!-- Mobile DApp Browser Viewport -->
      <div class="screenshot-card">
        <div class="screenshot-header">
          <span>MOBILE (390 × 844)</span>
          <span>TROBSAFE / METAMASK</span>
        </div>
        <img src="${mobileImg}" class="screenshot-img" alt="DAO Mobile Viewport">
      </div>
    </div>

    <div class="callout callout-gold">
      <strong>💎 UI/UX DESIGN DIRECTIVE:</strong><br>
      The DAO member portal must not look like an MLM or retail matrix dashboard. It should look like an institutional Web3 private wealth terminal. Use obsidian-black backgrounds (#06080F), sovereign gold accents (#F59E0B), emerald glowing metric values (#00E599), and monospace numbers.
    </div>

    <h3>1.1 Strategic Plan: Segregation of DAO vs. Normal Matrix Users</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Feature Dimension</th>
          <th style="width: 37.5%;">Normal Matrix Users (Retail)</th>
          <th style="width: 37.5%;">Genesis DAO Council (VIP Sovereign)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Access Barrier</strong></td>
          <td>Tiered entry from $30 (Slot 1) up to $61,440 (Slot 12)</td>
          <td class="gold-cell">Flat 300 TROB ($300) one-time buy-in</td>
        </tr>
        <tr>
          <td><strong>Referral Requirement</strong></td>
          <td>Requires 2 direct referrals to qualify for withdrawals</td>
          <td class="highlight-cell">ZERO REFERRALS (0) — 100% Pure Co-Ownership</td>
        </tr>
        <tr>
          <td><strong>Payout Engine</strong></td>
          <td>Cyclical 14-position single-leg matrix (600% direct cash)</td>
          <td class="highlight-cell">Instant 300 / N Cashback + Direct Distribution</td>
        </tr>
        <tr>
          <td><strong>Network Royalties</strong></td>
          <td>Earnings tied to personal downline & team spillover</td>
          <td class="gold-cell">Permanent 35% cut of ALL network-wide matrices</td>
        </tr>
        <tr>
          <td><strong>Governance Identity</strong></td>
          <td>Standard 5-digit referral code account (#10042)</td>
          <td class="gold-cell">Soulbound Non-Transferable ERC-721 NFT (#01–#100)</td>
        </tr>
        <tr>
          <td><strong>Earnings Lifecycle</strong></td>
          <td>Recycles upon Node 14 completion (Cycle 1, 2, 3...)</td>
          <td class="gold-cell">Permanent queue; 5X ($1,500) cap with 48h re-topup</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 3: 300/N MATHEMATICS ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>2. Core Mathematical Mechanics (Designer Reference)</h2>

    <p>
      The smart contract enforces a strictly zero-debt, instant peer-to-peer distribution formula on every join:
      $$\\text{Payout Per Member} = \\frac{300}{N}$$
      Where $N$ is the total active seat count <strong>including the incoming member</strong>.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Seat Number ($N$)</th>
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
          <td>$0.00 (No prior members)</td>
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

    <div class="callout callout-emerald">
      <strong>✓ ZERO-DEBT INVARIANT:</strong><br>
      Total payouts on every join are strictly: $\\sum_{i=1}^N \\frac{300}{N} = N \\times \\frac{300}{N} = 300\\text{ TROB}$.<br>
      The smart contract never creates unbacked liabilities, never borrows from future reserves, and settles immediately on-chain.
    </div>

    <h3>2.1 The 5X ($1,500 TROB) Earnings Cap & 48-Hour Urgency Window</h3>
    <ul>
      <li><strong>5X Cap Limit:</strong> Each 300 TROB deposit entitles the member to earn up to <strong>$1,500 TROB (500%)</strong> in cumulative earnings.</li>
      <li><strong>Safe Zone (0 – $1,200):</strong> Progress bar is green. Member earns passive dividends uninterrupted.</li>
      <li><strong>Advisory Zone ($1,200 – $1,499):</strong> Amber bar. Alerts user that re-topup will soon be required.</li>
      <li><strong>Critical 48h Countdown ($\ge $1,500):</strong> The card turns crimson. A 48:00:00 digital clock starts. A 300 TROB re-topup resets the cap and preserves the seat index.</li>
      <li><strong>Default & Sniping:</strong> If 48h expires, the seat turns into a <em>Defaulted Vacant Seat</em> claimable by any new user.</li>
    </ul>
  </div>

  <!-- ==================== PAGE 4: COMPONENT DATA SPECIFICATIONS (PART 1) ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>3. Component-by-Component Data Schemas ("Sata" Specifications)</h2>

    <p>
      Below are the exact data models, smart contract functions, data types, and live values that the UI must display across each section of the page:
    </p>

    <h3>3.1 Genesis Council Scarcity & Capacity Header</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>UI Element</th>
          <th>Contract Function</th>
          <th>Type</th>
          <th>Live Production Value</th>
          <th>Empty / Fallback State</th>
          <th>Formatting Rule</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Seats Claimed</strong></td>
          <td class="code-cell">EquoraDAO.getDAOStats().memberCount</td>
          <td>uint256</td>
          <td class="gold-cell">86</td>
          <td>0</td>
          <td>Decimal integer</td>
        </tr>
        <tr>
          <td><strong>Total Capacity</strong></td>
          <td class="code-cell">EquoraDAO.MAX_MEMBERS()</td>
          <td>uint256</td>
          <td class="gold-cell">100</td>
          <td>100</td>
          <td>Fixed constant</td>
        </tr>
        <tr>
          <td><strong>Seats Remaining</strong></td>
          <td class="code-cell">EquoraDAO.getRemainingPositions()</td>
          <td>uint256</td>
          <td class="highlight-cell">14</td>
          <td>100</td>
          <td>Highlight gold if &lt; 20</td>
        </tr>
        <tr>
          <td><strong>Capacity Progress</strong></td>
          <td class="code-cell">(memberCount / 100) * 100</td>
          <td>percent</td>
          <td class="highlight-cell">86.0%</td>
          <td>0%</td>
          <td>Emerald progress bar</td>
        </tr>
        <tr>
          <td><strong>Genesis Deadline</strong></td>
          <td class="code-cell">EquoraDAO.GENESIS_WINDOW_END()</td>
          <td>uint256</td>
          <td class="code-cell">1,791,240,000</td>
          <td>Active</td>
          <td>Digital clock: DD:HH:MM:SS</td>
        </tr>
        <tr>
          <td><strong>Total Distributed</strong></td>
          <td class="code-cell">EquoraDAO.getDAOStats().totalDistributed</td>
          <td>uint256</td>
          <td class="highlight-cell">25,800.00 TROB</td>
          <td>0.00 TROB</td>
          <td>2 decimals + Monospace</td>
        </tr>
      </tbody>
    </table>

    <h3>3.2 Soulbound NFT Governance Identity Card</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>UI Element</th>
          <th>Contract Function</th>
          <th>Type</th>
          <th>Live Production Value</th>
          <th>Empty / Fallback State</th>
          <th>Formatting Rule</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Is Member</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails(addr)[0]</td>
          <td>bool</td>
          <td class="highlight-cell">true</td>
          <td>false</td>
          <td>If false, show visitor view</td>
        </tr>
        <tr>
          <td><strong>Seat Index</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails(addr)[1]</td>
          <td>uint256</td>
          <td class="gold-cell">12</td>
          <td>0</td>
          <td>Format: Council Seat #12</td>
        </tr>
        <tr>
          <td><strong>NFT Token ID</strong></td>
          <td class="code-cell">EquoraDAOMembership.tokenOfOwnerByIndex(addr, 0)</td>
          <td>uint256</td>
          <td class="gold-cell">#0012</td>
          <td>N/A</td>
          <td>4-digit padded number</td>
        </tr>
        <tr>
          <td><strong>Owner Address</strong></td>
          <td class="code-cell">userAddress (from Web3 provider)</td>
          <td>address</td>
          <td class="code-cell">0x4B71a...89F2</td>
          <td>Not Connected</td>
          <td>Shortened 0x... with copy icon</td>
        </tr>
        <tr>
          <td><strong>Voting Weight</strong></td>
          <td class="code-cell">Fixed constant: 1 / 100</td>
          <td>percent</td>
          <td class="highlight-cell">1.0%</td>
          <td>0.0%</td>
          <td>Tag badge: 1 Seat = 1 Vote</td>
        </tr>
        <tr>
          <td><strong>Soulbound Status</strong></td>
          <td class="code-cell">EquoraDAOMembership.isSoulbound()</td>
          <td>bool</td>
          <td class="gold-cell">true</td>
          <td>true</td>
          <td>Lock icon: Non-Transferable</td>
        </tr>
      </tbody>
    </table>

    <h3>3.3 5X Earnings Cap ($1,500 TROB) Health Monitor</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>UI Element</th>
          <th>Contract Function</th>
          <th>Type</th>
          <th>Live Production Value</th>
          <th>Empty / Fallback State</th>
          <th>Formatting Rule</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Cumulative Earned</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails(addr)[4]</td>
          <td>uint256</td>
          <td class="highlight-cell">840.00 TROB</td>
          <td>0.00 TROB</td>
          <td>Formatted ether, 2 decimals</td>
        </tr>
        <tr>
          <td><strong>Max Cap Ceiling</strong></td>
          <td class="code-cell">EquoraDAO.getCapProgress(addr)[1]</td>
          <td>uint256</td>
          <td class="gold-cell">1,500.00 TROB</td>
          <td>1,500.00 TROB</td>
          <td>Fixed constant ($300 × 5)</td>
        </tr>
        <tr>
          <td><strong>Cap Percentage</strong></td>
          <td class="code-cell">(earned / 1500) * 100</td>
          <td>percent</td>
          <td class="gold-cell">56.0%</td>
          <td>0%</td>
          <td>Dynamic: Green / Amber / Red</td>
        </tr>
        <tr>
          <td><strong>Cap Triggered</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails(addr)[5]</td>
          <td>bool</td>
          <td class="crimson-cell">false (isCapped)</td>
          <td>false</td>
          <td>If true, activates 48h clock</td>
        </tr>
        <tr>
          <td><strong>48h Countdown</strong></td>
          <td class="code-cell">EquoraDAO.retopupTimeRemaining(addr)</td>
          <td>uint256</td>
          <td class="crimson-cell">172,400s (47h 53m)</td>
          <td>0s</td>
          <td>Digital clock HH:MM:SS</td>
        </tr>
        <tr>
          <td><strong>Seat Blanked Flag</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails(addr)[7]</td>
          <td>bool</td>
          <td class="crimson-cell">false (isBlank)</td>
          <td>false</td>
          <td>If true, seat is defaulted</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 5: COMPONENT DATA SPECIFICATIONS (PART 2) ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>4. Component Data Schemas (Part 2) & Interactive States</h2>

    <h3>4.1 Claimable Revenue & 1-Click Withdrawal Hub</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>UI Element</th>
          <th>Contract Function</th>
          <th>Type</th>
          <th>Live Production Value</th>
          <th>Empty State</th>
          <th>Action / Interaction</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Matrix Pool Claimable</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails(addr)[8]</td>
          <td>uint256</td>
          <td class="highlight-cell">300.00 TROB</td>
          <td>0.00 TROB</td>
          <td>1-Click Claim Action</td>
        </tr>
        <tr>
          <td><strong>Fallback Claimable</strong></td>
          <td class="code-cell">EquoraDAO.getMemberDetails(addr)[3]</td>
          <td>uint256</td>
          <td class="gold-cell">120.50 TROB</td>
          <td>0.00 TROB</td>
          <td>Auto-swept on Claim</td>
        </tr>
        <tr>
          <td><strong>Total Withdrawable</strong></td>
          <td class="code-cell">poolClaimable + fallbackClaimable</td>
          <td>uint256</td>
          <td class="highlight-cell">420.50 TROB</td>
          <td>0.00 TROB</td>
          <td>Large emerald header ticker</td>
        </tr>
        <tr>
          <td><strong>Gas Fee Estimation</strong></td>
          <td class="code-cell">Provider estimateGas()</td>
          <td>string</td>
          <td class="code-cell">&lt; $0.005 USD</td>
          <td>~ $0.005</td>
          <td>Monospace footnote</td>
        </tr>
      </tbody>
    </table>

    <h3>4.2 100-Seat Council Grid Tile Array Data</h3>
    <p>
      The 100 tiles on the holographic council matrix are generated by querying <span class="code-cell">EquoraDAO.getAllMembers()</span>.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Tile Element</th>
          <th>Contract Property</th>
          <th>Type</th>
          <th>Values / States</th>
          <th>Visual UI Representation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Seat Index</strong></td>
          <td class="code-cell">arrayIndex + 1</td>
          <td>uint8</td>
          <td class="gold-cell">1 to 100</td>
          <td>Centered tile numeral label</td>
        </tr>
        <tr>
          <td><strong>Occupant Address</strong></td>
          <td class="code-cell">members[i].memberAddress</td>
          <td>address</td>
          <td class="code-cell">0x4B71...89F2</td>
          <td>Tooltip flyout occupant line</td>
        </tr>
        <tr>
          <td><strong>Seat Status</strong></td>
          <td class="code-cell">State evaluation</td>
          <td>enum</td>
          <td>CLAIMED, USER, NEXT, DEFAULTED, LOCKED</td>
          <td>Tile background and border color</td>
        </tr>
        <tr>
          <td><strong>Cumulative Yield</strong></td>
          <td class="code-cell">members[i].totalEarned</td>
          <td>uint256</td>
          <td class="highlight-cell">1,280.40 TROB</td>
          <td>Tooltip flyout earnings metric</td>
        </tr>
        <tr>
          <td><strong>Cap Health %</strong></td>
          <td class="code-cell">(totalEarned / 1500) * 100</td>
          <td>percent</td>
          <td class="gold-cell">85.3%</td>
          <td>Tooltip flyout mini progress bar</td>
        </tr>
      </tbody>
    </table>

    <h3>4.3 300 / N Dynamic Calculator State Schema</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>UI Field</th>
          <th>Calculation Formula</th>
          <th>Type</th>
          <th>Example at Seat #35</th>
          <th>Example at Seat #1 (Genesis)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Selected Seat ($N$)</strong></td>
          <td class="code-cell">User slider position (1..100)</td>
          <td>integer</td>
          <td class="gold-cell">35</td>
          <td class="gold-cell">1</td>
        </tr>
        <tr>
          <td><strong>Gross Entry Fee</strong></td>
          <td class="code-cell">Fixed deposit constant</td>
          <td>number</td>
          <td>$300.00 TROB</td>
          <td>$300.00 TROB</td>
        </tr>
        <tr>
          <td><strong>Instant Cashback to Joiner</strong></td>
          <td class="code-cell">300 / calcSeat</td>
          <td>number</td>
          <td class="highlight-cell">$8.57 TROB</td>
          <td class="highlight-cell">$300.00 TROB (100% FREE!)</td>
        </tr>
        <tr>
          <td><strong>Split to Prior Members</strong></td>
          <td class="code-cell">300 / calcSeat to each</td>
          <td>number</td>
          <td class="gold-cell">$8.57 each ($291.43 total)</td>
          <td>$0.00 (No prior members)</td>
        </tr>
        <tr>
          <td><strong>Net Out-of-Pocket Cost</strong></td>
          <td class="code-cell">300 - (300 / calcSeat)</td>
          <td>number</td>
          <td class="gold-cell">$291.43 TROB</td>
          <td class="highlight-cell">$0.00 (FREE!)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 6: 100-SEAT VISUAL MATRIX & DESIGN TOKENS ==================== -->
  <div class="page-break"></div>
  <div class="content-page">
    <h2>5. Visual 10x10 Council Matrix & Design Tokens</h2>

    <p>
      The 100 Genesis Council seats are arranged in a 10x10 responsive matrix grid. Each tile exhibits one of five strict visual states:
    </p>

    <!-- Visual 10x10 Matrix -->
    <div class="grid-visual-demo">
      <div class="grid-tile tile-claimed">01</div>
      <div class="grid-tile tile-claimed">02</div>
      <div class="grid-tile tile-claimed">03</div>
      <div class="grid-tile tile-claimed">04</div>
      <div class="grid-tile tile-claimed">05</div>
      <div class="grid-tile tile-claimed">06</div>
      <div class="grid-tile tile-claimed">07</div>
      <div class="grid-tile tile-claimed">08</div>
      <div class="grid-tile tile-claimed">09</div>
      <div class="grid-tile tile-claimed">10</div>

      <div class="grid-tile tile-claimed">11</div>
      <div class="grid-tile tile-user">★12★</div>
      <div class="grid-tile tile-claimed">13</div>
      <div class="grid-tile tile-claimed">14</div>
      <div class="grid-tile tile-claimed">15</div>
      <div class="grid-tile tile-claimed">16</div>
      <div class="grid-tile tile-claimed">17</div>
      <div class="grid-tile tile-claimed">18</div>
      <div class="grid-tile tile-claimed">19</div>
      <div class="grid-tile tile-claimed">20</div>

      <div class="grid-tile tile-claimed">21</div>
      <div class="grid-tile tile-claimed">22</div>
      <div class="grid-tile tile-claimed">23</div>
      <div class="grid-tile tile-claimed">24</div>
      <div class="grid-tile tile-claimed">25</div>
      <div class="grid-tile tile-claimed">26</div>
      <div class="grid-tile tile-claimed">27</div>
      <div class="grid-tile tile-claimed">28</div>
      <div class="grid-tile tile-claimed">29</div>
      <div class="grid-tile tile-claimed">30</div>

      <div class="grid-tile tile-claimed">31</div>
      <div class="grid-tile tile-claimed">32</div>
      <div class="grid-tile tile-claimed">33</div>
      <div class="grid-tile tile-claimed">34</div>
      <div class="grid-tile tile-claimed">35</div>
      <div class="grid-tile tile-claimed">36</div>
      <div class="grid-tile tile-claimed">37</div>
      <div class="grid-tile tile-claimed">38</div>
      <div class="grid-tile tile-claimed">39</div>
      <div class="grid-tile tile-claimed">40</div>

      <div class="grid-tile tile-claimed">41</div>
      <div class="grid-tile tile-claimed">42</div>
      <div class="grid-tile tile-claimed">43</div>
      <div class="grid-tile tile-defaulted">⚡44</div>
      <div class="grid-tile tile-claimed">45</div>
      <div class="grid-tile tile-claimed">46</div>
      <div class="grid-tile tile-claimed">47</div>
      <div class="grid-tile tile-claimed">48</div>
      <div class="grid-tile tile-claimed">49</div>
      <div class="grid-tile tile-claimed">50</div>

      <div class="grid-tile tile-claimed">51</div>
      <div class="grid-tile tile-claimed">52</div>
      <div class="grid-tile tile-claimed">53</div>
      <div class="grid-tile tile-claimed">54</div>
      <div class="grid-tile tile-claimed">55</div>
      <div class="grid-tile tile-claimed">56</div>
      <div class="grid-tile tile-claimed">57</div>
      <div class="grid-tile tile-claimed">58</div>
      <div class="grid-tile tile-claimed">59</div>
      <div class="grid-tile tile-claimed">60</div>

      <div class="grid-tile tile-claimed">61</div>
      <div class="grid-tile tile-claimed">62</div>
      <div class="grid-tile tile-claimed">63</div>
      <div class="grid-tile tile-claimed">64</div>
      <div class="grid-tile tile-claimed">65</div>
      <div class="grid-tile tile-claimed">66</div>
      <div class="grid-tile tile-claimed">67</div>
      <div class="grid-tile tile-claimed">68</div>
      <div class="grid-tile tile-claimed">69</div>
      <div class="grid-tile tile-claimed">70</div>

      <div class="grid-tile tile-claimed">71</div>
      <div class="grid-tile tile-claimed">72</div>
      <div class="grid-tile tile-claimed">73</div>
      <div class="grid-tile tile-claimed">74</div>
      <div class="grid-tile tile-claimed">75</div>
      <div class="grid-tile tile-claimed">76</div>
      <div class="grid-tile tile-claimed">77</div>
      <div class="grid-tile tile-claimed">78</div>
      <div class="grid-tile tile-claimed">79</div>
      <div class="grid-tile tile-claimed">80</div>

      <div class="grid-tile tile-claimed">81</div>
      <div class="grid-tile tile-claimed">82</div>
      <div class="grid-tile tile-claimed">83</div>
      <div class="grid-tile tile-claimed">84</div>
      <div class="grid-tile tile-claimed">85</div>
      <div class="grid-tile tile-claimed">86</div>
      <div class="grid-tile tile-next">⚡87</div>
      <div class="grid-tile tile-locked">88</div>
      <div class="grid-tile tile-locked">89</div>
      <div class="grid-tile tile-locked">90</div>

      <div class="grid-tile tile-locked">91</div>
      <div class="grid-tile tile-locked">92</div>
      <div class="grid-tile tile-locked">93</div>
      <div class="grid-tile tile-locked">94</div>
      <div class="grid-tile tile-locked">95</div>
      <div class="grid-tile tile-locked">96</div>
      <div class="grid-tile tile-locked">97</div>
      <div class="grid-tile tile-locked">98</div>
      <div class="grid-tile tile-locked">99</div>
      <div class="grid-tile tile-locked">100</div>
    </div>

    <!-- Legend -->
    <div class="legend-bar">
      <div class="legend-item"><div class="legend-swatch tile-claimed"></div> Claimed Seat (Gold)</div>
      <div class="legend-item"><div class="legend-swatch tile-user"></div> Your Personal Seat (Emerald Crown)</div>
      <div class="legend-item"><div class="legend-swatch tile-next"></div> Next Available in Line (Cyan Pulse)</div>
      <div class="legend-item"><div class="legend-swatch tile-defaulted"></div> Defaulted Vacant Seat (Crimson Dashed)</div>
      <div class="legend-item"><div class="legend-swatch tile-locked"></div> Future Unclaimed Seat (Slate)</div>
    </div>

    <h3>5.1 Visual Design Tokens & Styling</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>Design Token</th>
          <th>Hex / Value</th>
          <th>Semantic Application in DAO Interface</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Base Obsidian</strong></td>
          <td class="gold-cell">#06080F</td>
          <td>Full page background (deep void aesthetic)</td>
        </tr>
        <tr>
          <td><strong>Slate Card Surface</strong></td>
          <td class="gold-cell">#0B111E (Blur 16px)</td>
          <td>Elevated container surfaces with glassmorphism</td>
        </tr>
        <tr>
          <td><strong>Sovereign Gold Accent</strong></td>
          <td class="gold-cell">#F59E0B / #FBBF24</td>
          <td>Primary buttons, VIP badges, seat crowns, and headings</td>
        </tr>
        <tr>
          <td><strong>Radiant Emerald</strong></td>
          <td class="highlight-cell">#00E599</td>
          <td>Cashback values, claim buttons, positive yields, safe zone</td>
        </tr>
        <tr>
          <td><strong>Urgency Crimson</strong></td>
          <td class="crimson-cell">#EF4444</td>
          <td>48h countdown clock, default warnings, vacancy alerts</td>
        </tr>
        <tr>
          <td><strong>Cyber Cyan</strong></td>
          <td style="color:#06B6D4; font-weight:700;">#06B6D4</td>
          <td>Next seat in line indicator, interactive simulation sliders</td>
        </tr>
        <tr>
          <td><strong>Headline Typography</strong></td>
          <td>Cinzel / Cabinet Grotesk</td>
          <td>Institutional titles, council badges, VIP prestige cards</td>
        </tr>
        <tr>
          <td><strong>Monospace Typography</strong></td>
          <td>JetBrains Mono</td>
          <td>All monetary numbers, TROB amounts, countdown timers</td>
        </tr>
      </tbody>
    </table>

    <h3>5.2 Designer Figma Deliverables Checklist</h3>
    <div class="callout callout-gold">
      <strong>📐 REQUIRED FIGMA FRAMES & ARTIFACTS:</strong><br>
      • <strong>Frame 1 (Desktop 1440px):</strong> Public DAO Council Gateway (Pre-Claim state with Scarcity Meter).<br>
      • <strong>Frame 2 (Desktop 1440px):</strong> Active Member Command Center (Soulbound NFT, Yield Meters, 1-Click Claim).<br>
      • <strong>Frame 3 (Desktop 1440px):</strong> 10x10 Council Seat Map with all 5 state variations & Hover Flyout.<br>
      • <strong>Frame 4 (Desktop 1440px):</strong> 300 / N Dynamic Calculator with draggable slider and breakdown tiles.<br>
      • <strong>Frame 5 (Modal):</strong> 48-Hour Urgency Re-Topup Countdown Modal with digital flip clock.<br>
      • <strong>Frame 6 (Modal):</strong> Defaulted Vacant Seat Sniping & Takeover Flow.<br>
      • <strong>Frame 7 (Mobile 390px):</strong> Responsive Mobile DApp layouts for iOS / Android Web3 wallets.
    </div>

    <div style="margin-top: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; color: #64748b; font-size: 7.5pt;">
      Equora.Fi Autonomous Governance Protocol • Confidential Design & Data Specification • Smart Contract Verified Suite
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log(`✓ Master HTML written at: ${OUTPUT_HTML}`);

  console.log('🖨️ Launching Puppeteer to compile high-resolution A4 PDF with embedded images and data tables...');
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
  console.log(`🎉 SUCCESS! Enhanced DAO-Exclusive PDF generated at: ${OUTPUT_PDF}`);
}

main().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
