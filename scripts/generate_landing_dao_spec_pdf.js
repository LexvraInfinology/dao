const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_HTML = path.join(__dirname, '..', 'docs', 'Equora_Landing_Page_DAO_Design_Specification.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', 'Equora_Landing_Page_DAO_Design_Specification.pdf');
const ASSETS_DIR = path.join(__dirname, '..', 'docs', 'assets');
const SCREENSHOTS_DIR = path.join(ASSETS_DIR, 'screenshots');

const toBase64 = (filePath) => {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

async function main() {
  console.log('🏛️ Encoding Image Assets to Base64...');
  const logoImg = toBase64(path.join(ASSETS_DIR, 'equorafilogo-removebg-preview.png'));
  const heroMockup = toBase64(path.join(ASSETS_DIR, 'dao_landing_hero_mockup.jpg'));
  const matrixMockup = toBase64(path.join(ASSETS_DIR, 'dao_matrix_comparison_mockup.jpg'));

  console.log('📝 Building Landing Page DAO UI/UX Specification HTML...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Landing Page Phase 1 DAO UI/UX Handover Specification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 10mm 12mm 10mm 12mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 7.5pt;
        color: #64748b;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #06080F;
      color: #e2e8f0;
      line-height: 1.45;
      font-size: 8pt;
    }

    .page-break { page-break-before: always; }

    /* COVER PAGE */
    .cover-container {
      height: 94vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 35px 30px;
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 12px;
      background: radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.18) 0%, rgba(6, 8, 15, 0.98) 75%);
    }

    .cover-top-bar { display: flex; justify-content: space-between; align-items: center; }
    .cover-logo { height: 42px; }
    .cover-badge {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid #F59E0B;
      color: #FBBF24;
      border-radius: 999px;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .cover-body { margin-top: 30px; }
    .cover-subtitle {
      font-size: 9pt;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 12px;
      font-family: 'JetBrains Mono', monospace;
    }

    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 26pt;
      font-weight: 900;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #FFFFFF 0%, #FBBF24 50%, #F59E0B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-desc {
      font-size: 10pt;
      color: #94a3b8;
      max-width: 580px;
      line-height: 1.55;
      margin-bottom: 22px;
    }

    .cover-highlight-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 25px;
    }

    .cover-highlight-card h3 {
      font-size: 8.5pt;
      color: #38bdf8;
      margin-bottom: 6px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .cover-highlight-card p {
      font-size: 8pt;
      color: #cbd5e1;
      line-height: 1.5;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .meta-box {
      background: rgba(255, 255, 255, 0.03);
      padding: 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .meta-label {
      font-size: 6.5pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 8.5pt;
      font-weight: 700;
      color: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
    }

    /* SECTION STYLES */
    .section {
      margin-bottom: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(245, 158, 11, 0.25);
      padding-bottom: 5px;
      margin-bottom: 10px;
    }

    .section-num {
      background: linear-gradient(135deg, #F59E0B, #B45309);
      color: #06080F;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 900;
      font-size: 7.5pt;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 12pt;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.5px;
    }

    .section-badge {
      margin-left: auto;
      font-size: 6.5pt;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* CALLOUT BOXES */
    .directive-card {
      background: rgba(245, 158, 11, 0.07);
      border-left: 3px solid #F59E0B;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 10px;
    }

    .directive-card strong {
      color: #FBBF24;
      font-size: 8pt;
      display: block;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .directive-card p {
      color: #e2e8f0;
      font-size: 7.5pt;
      line-height: 1.4;
    }

    /* COMPARISON TABLES */
    table.spec-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 7.2pt;
    }

    table.spec-table th {
      background: rgba(30, 41, 59, 0.85);
      color: #FBBF24;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 6.8pt;
      letter-spacing: 0.5px;
    }

    table.spec-table td {
      padding: 6px 8px;
      border: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(15, 23, 42, 0.4);
      color: #cbd5e1;
      vertical-align: top;
      line-height: 1.35;
    }

    table.spec-table tr:nth-child(even) td {
      background: rgba(15, 23, 42, 0.7);
    }

    .tag-old {
      display: inline-block;
      padding: 1px 5px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .tag-new {
      display: inline-block;
      padding: 1px 5px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .tag-keep {
      display: inline-block;
      padding: 1px 5px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    /* MOCKUP IMAGES */
    .image-container {
      margin: 10px 0 12px 0;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      overflow: hidden;
      background: #000;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
    }

    .image-container img {
      width: 100%;
      display: block;
      max-height: 270px;
      object-fit: cover;
    }

    .image-caption {
      padding: 5px 10px;
      background: rgba(15, 23, 42, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 6.8pt;
      color: #94a3b8;
      font-style: italic;
      display: flex;
      justify-content: space-between;
    }

    .image-caption strong {
      color: #FBBF24;
      font-style: normal;
    }

    /* COMPONENT CARDS */
    .card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 8px 0 12px 0;
    }

    .component-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 10px 12px;
    }

    .component-card h4 {
      font-size: 7.5pt;
      color: #FBBF24;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .component-card p {
      font-size: 7pt;
      color: #94a3b8;
      line-height: 1.35;
    }

    .checklist {
      list-style: none;
      margin: 8px 0;
    }

    .checklist li {
      padding: 5px 0;
      font-size: 7.8pt;
      color: #cbd5e1;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .checklist li::before {
      content: "✔";
      color: #10B981;
      font-weight: bold;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1: COVER PAGE ==================== -->
  <div class="cover-container">
    <div class="cover-top-bar">
      <img src="${logoImg}" alt="Equora.Fi Logo" class="cover-logo" />
      <span class="cover-badge">PHASE 1 GENESIS DAO ONLY</span>
    </div>

    <div class="cover-body">
      <div class="cover-subtitle">UI/UX Designer Handover Specification</div>
      <h1 class="cover-title">Landing Page<br>DAO Transformation</h1>
      <p class="cover-desc">
        A precise, minimal-disruption design handover guide to transition the current Equora landing page into an exclusive <strong>Phase 1 Genesis DAO Council Portal</strong> without rebuilding existing layout structures.
      </p>

      <div class="cover-highlight-card">
        <h3>Design Directive: Minimal Disruption, Maximum Conversion</h3>
        <p>
          Do <strong>NOT</strong> redesign the page from scratch. Preserve the current glassmorphic layout, background scenery, component grids, and responsive containers. Simply swap the copy, badges, metrics, and add a single 21-day countdown timer to shift from a generic retail marketing look to an institutional Web3 founding council experience.
        </p>
      </div>

      <div class="cover-meta-grid">
        <div class="meta-box">
          <div class="meta-label">Target Page</div>
          <div class="meta-value">Public Landing (/)</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Primary Offering</div>
          <div class="meta-value">100 Council Seats</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Entry Standard</div>
          <div class="meta-value">300 TROB ($300)</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Retail Matrix ($30)</div>
          <div class="meta-value">Locked (Day 22)</div>
        </div>
      </div>
    </div>

    <div style="font-size: 7pt; color: #475569; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
      <span>Equora.Fi Core Protocol Architecture • Phase 1 Launch</span>
      <span>Confidential Handover for UI/UX Design Team</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGE 2: VISUAL MOCKUP 1 (HERO) ==================== -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">01</span>
      <h2 class="section-title">Visual Mockup: Phase 1 DAO Hero Section</h2>
      <span class="section-badge">High-Fidelity Reference</span>
    </div>

    <div class="directive-card">
      <strong>Core Requirement for Hero Section</strong>
      <p>
        The hero section must immediately inform the visitor that Equora is currently in <strong>Phase 1: Genesis DAO Exclusive Window</strong>. Exactly 100 sovereign seats exist. Entry is a flat 300 TROB with <strong>0 referrals required</strong>. The visual below demonstrates the exact look and feel required:
      </p>
    </div>

    <div class="image-container">
      <img src="${heroMockup}" alt="Equora Genesis DAO Landing Hero Mockup" />
      <div class="image-caption">
        <span><strong>Figure 1:</strong> Proposed Hero Section with 21-Day Timer, 100 Sovereign Seats Headline & 3D Gold Soulbound NFT Pass.</span>
        <span>apps/web/components/landing/HeroSection.tsx</span>
      </div>
    </div>

    <div class="card-grid">
      <div class="component-card">
        <h4>1. Sticky 21-Day Digital Countdown Timer <span class="tag-new">NEW ELEMENT</span></h4>
        <p>Placed either in the announcement bar or hero header: <code>PHASE 1: GENESIS DAO COUNCIL [ 18d : 14h : 22m : 10s ]</code>. Instantly creates scarcity and reinforces that the retail matrix is locked for 21 days.</p>
      </div>
      <div class="component-card">
        <h4>2. 3D Metallic Soulbound NFT Pass Card <span class="tag-new">VISUAL SWAP</span></h4>
        <p>Replace generic character graphics or decorative badges with the glowing metallic gold VIP Council Card displaying <code>EQUORA DAO PASS #14 - 1.0% VOTING WEIGHT</code>.</p>
      </div>
    </div>

    <div class="card-grid">
      <div class="component-card">
        <h4>3. Flat 300 TROB ($300 USD) Standard <span class="tag-keep">PRICING CLARITY</span></h4>
        <p>Clear, unconfusing entry. 1 TROB = $1.00 USD. No hidden tiers, no complicated packages. Exactly 100 seats available on-chain.</p>
      </div>
      <div class="component-card">
        <h4>4. Zero Recruitment Mandate <span class="tag-new">KEY VALUE PROP</span></h4>
        <p>Prominently display that Genesis Council members require zero direct referrals to receive full automated 300/N cashback.</p>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGE 3: HERO & ABOUT SECTION TABLES ==================== -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">02</span>
      <h2 class="section-title">Hero Section Text & Data Replacements</h2>
      <span class="section-badge">apps/web/components/landing/HeroSection.tsx</span>
    </div>

    <table class="spec-table">
      <thead>
        <tr>
          <th style="width: 22%;">Element</th>
          <th style="width: 38%;">Current (Generic / Retail)</th>
          <th style="width: 40%;">Proposed DAO Specification</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Eyebrow Badge</strong></td>
          <td><span class="tag-old">OLD</span> "EQUORA DECENTRALIZED PLATFORM"</td>
          <td><span class="tag-new">NEW</span> <code>✦ PHASE 1: GENESIS DAO COUNCIL EXCLUSIVE</code></td>
        </tr>
        <tr>
          <td><strong>Main Headline (H1)</strong></td>
          <td><span class="tag-old">OLD</span> "Same People. Bigger Opportunities."</td>
          <td><span class="tag-new">NEW</span> <strong>"100 Sovereign Seats.<br>100% On-Chain Governance."</strong></td>
        </tr>
        <tr>
          <td><strong>Sub-headline</strong></td>
          <td><span class="tag-old">OLD</span> "EQUORA is a global decentralized platform for everyone to earn and grow together..."</td>
          <td><span class="tag-new">NEW</span> "Secure permanent co-ownership in the Equora Genesis DAO. Flat 300 TROB entry with <strong>0 referrals required</strong>. Automated <strong>300/N</strong> redistribution, Soulbound ERC-721 voting rights, and a permanent 35% downstream retail volume share."</td>
        </tr>
        <tr>
          <td><strong>Primary CTA Button</strong></td>
          <td><span class="tag-old">OLD</span> "Join Platform"</td>
          <td><span class="tag-new">NEW</span> <strong>"Claim Genesis Seat (300 TROB)"</strong> &rarr; links to <code>/dao</code></td>
        </tr>
        <tr>
          <td><strong>Secondary CTA Button</strong></td>
          <td><span class="tag-old">OLD</span> "Watch Video"</td>
          <td><span class="tag-new">NEW</span> <strong>"DAO Whitepaper (PDF)"</strong> &rarr; opens whitepaper modal</td>
        </tr>
        <tr>
          <td><strong>4 Key Metric Pills</strong><br><span style="font-size: 6.5pt; color: #64748b;">(Below Buttons)</span></td>
          <td>
            • 10 Active<br>
            • 100K+ Traders<br>
            • $2.4M+ Volume<br>
            • Instant Payouts
          </td>
          <td>
            • <strong>100 Seats Total</strong> (Only 14 Seats Left!)<br>
            • <strong>Flat 300 TROB</strong> ($1.00 = 1 TROB)<br>
            • <strong>Zero Referrals Required</strong> (Autonomous Yield)<br>
            • <strong>5X ($1,500) Cap</strong> (48h Sustainable Re-Topup)
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header">
      <span class="section-num">03</span>
      <h2 class="section-title">About Movement & Live Ledger Replacements</h2>
      <span class="section-badge">Movement & Activity Sections</span>
    </div>

    <table class="spec-table">
      <thead>
        <tr>
          <th style="width: 25%;">Section & Field</th>
          <th style="width: 75%;">New DAO Content & Style Guidance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>About Headline</strong><br><code>AboutMovementSection.tsx</code></td>
          <td><strong>"A Decentralized Autonomous Council Designed to Outlast Centralized Schemes."</strong></td>
        </tr>
        <tr>
          <td><strong>About Paragraph</strong><br><code>AboutMovementSection.tsx</code></td>
          <td>"Traditional platforms collapse because centralized founders control treasury keys and debt spirals accumulate. Equora Genesis DAO operates on immutable smart contracts on the Trobium blockchain: 100% of every 300 TROB deposit is instantly redistributed directly to council wallets without human intermediaries."</td>
        </tr>
        <tr>
          <td><strong>3 Stat Badges</strong><br><code>AboutMovementSection.tsx</code></td>
          <td>
            1. <strong>$300 / N</strong> — Instant Real-Time Redistribution Formula<br>
            2. <strong>500% ($1,500)</strong> — Maximum Earnings Cap per Cycle<br>
            3. <strong>35% Volume Share</strong> — Perpetual Royalty from all Day-22 Retail Matrix Slots
          </td>
        </tr>
        <tr>
          <td><strong>Live Feed Header</strong><br><code>LiveActivityFeedSection.tsx</code></td>
          <td><strong>"Real-Time Genesis Council Ledger"</strong> (Subtitle: <em>Live on-chain seat activations & redistributions</em>)</td>
        </tr>
        <tr>
          <td><strong>Live Feed Rows</strong><br><code>LiveActivityFeedSection.tsx</code></td>
          <td>
            • <code>Seat #14 claimed by 0x71A...9C4</code> &rarr; <em>Instant $21.42 distributed to prior 13 members</em><br>
            • <code>Seat #02 reached 5X ($1,500 TROB)</code> &rarr; <em>48-Hour Re-Topup window active</em><br>
            • <code>Seat #05 48h Re-Topup confirmed</code> &rarr; <em>5X Earnings cap successfully reset to $1,500</em><br>
            • <code>Genesis Council: 86 / 100 Seats Occupied</code> &rarr; <em>Only 14 seats remaining</em>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGE 4: VISUAL MOCKUP 2 (TIERS COMPARISON) ==================== -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">04</span>
      <h2 class="section-title">Visual Mockup: DAO Council vs. Retail Matrix</h2>
      <span class="section-badge">apps/web/components/landing/TierLevelsSection.tsx</span>
    </div>

    <div class="directive-card">
      <strong>Core Requirement for Tier Section</strong>
      <p>
        The current landing page shows retail tiers (Silver, Gold, Diamond). In <strong>Phase 1</strong>, the retail matrix ($30 ID) is <strong>STRICTLY LOCKED behind a 21-day countdown</strong>. The designer should modify this section into a side-by-side comparison illustrating why securing a Genesis DAO seat today is superior to waiting for retail launch:
      </p>
    </div>

    <div class="image-container">
      <img src="${matrixMockup}" alt="Phase 1 DAO vs Phase 2 Retail Matrix Comparison" />
      <div class="image-caption">
        <span><strong>Figure 2:</strong> Tier section converted to Phase 1 (Live Now) vs. Phase 2 Retail Matrix (Locked with 21-Day Timer).</span>
        <span>apps/web/components/landing/TierLevelsSection.tsx</span>
      </div>
    </div>

    <table class="spec-table">
      <thead>
        <tr>
          <th style="width: 25%;">Feature</th>
          <th style="width: 37%;">Phase 1: Genesis DAO Council (LIVE NOW)</th>
          <th style="width: 38%;">Phase 2: Retail Matrix (LOCKED - DAY 22)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Seat Allocation</strong></td>
          <td><strong style="color: #FBBF24;">Strictly 100 Total Seats</strong></td>
          <td>Unlimited Public Retail IDs</td>
        </tr>
        <tr>
          <td><strong>Entry Cost</strong></td>
          <td>Flat 300 TROB ($300 USD)</td>
          <td>$30 Entry (Slot 1)</td>
        </tr>
        <tr>
          <td><strong>Referrals Required</strong></td>
          <td><strong style="color: #34d399;">ZERO (0) Direct Referrals Needed</strong></td>
          <td>Minimum 2 Direct Active Referrals</td>
        </tr>
        <tr>
          <td><strong>Earning Engine</strong></td>
          <td>Instant <strong>300/N</strong> Payouts + 5X Re-Topup Cycle</td>
          <td>600% Direct Cashflow on 14-Node Boards</td>
        </tr>
        <tr>
          <td><strong>Downstream Royalty</strong></td>
          <td><strong style="color: #38bdf8;">Receives 35% of ALL Global Matrix Volume</strong></td>
          <td>Pays 35% protocol fee to DAO Council</td>
        </tr>
        <tr>
          <td><strong>Governance NFT</strong></td>
          <td>Soulbound ERC-721 VIP Council Pass</td>
          <td>Standard Protocol User ID</td>
        </tr>
        <tr>
          <td><strong>Status & CTA</strong></td>
          <td><span class="tag-new">OPEN NOW</span> &rarr; <code>[ Claim Seat Now ]</code></td>
          <td><span class="tag-old">LOCKED</span> &rarr; <code>[ Unlocks in 18d : 14h ]</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGE 5: 6 DAO PILLARS & FAQ SECTION ==================== -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">05</span>
      <h2 class="section-title">6 Pillars Section: Grid Content Swap</h2>
      <span class="section-badge">apps/web/components/landing/GlobalNetworkSection.tsx</span>
    </div>

    <div class="directive-card">
      <strong>Designer Instruction:</strong> Keep the exact 6-card glassmorphic layout. Update the 6 card titles, icons, and descriptions:
    </div>

    <div class="card-grid">
      <div class="component-card">
        <h4>1. Soulbound VIP Council Pass <span class="tag-keep">KEEP CONTAINER</span></h4>
        <p>Immutable ERC-721 token bound to your Web3 wallet. Non-transferable to prevent corporate or whale takeovers, guaranteeing 1.0% voting weight.</p>
      </div>
      <div class="component-card">
        <h4>2. Mathematical $300/N Cashback <span class="tag-keep">KEEP CONTAINER</span></h4>
        <p>Every 300 TROB deposit is instantly disbursed across all active council members. Seat #1 receives 100% instant cashback ($300/1). Zero treasury debt.</p>
      </div>
      <div class="component-card">
        <h4>3. Zero Recruitment Mandate <span class="tag-keep">KEEP CONTAINER</span></h4>
        <p>Genesis DAO members do not need to recruit or refer anyone. Yields are generated purely by protocol growth and automated redistribution.</p>
      </div>
      <div class="component-card">
        <h4>4. 5X Cap & 48h Re-Topup Engine <span class="tag-keep">KEEP CONTAINER</span></h4>
        <p>Each 300 TROB deposit earns up to $1,500 TROB (5X). Re-depositing within 48 hours resets the cap and pumps fresh liquidity back into the council.</p>
      </div>
      <div class="component-card">
        <h4>5. Day 22 Retail Volume Royalty (35%) <span class="tag-keep">KEEP CONTAINER</span></h4>
        <p>When the public $30 matrix launches on Day 22, 35% of all global slot activation fees stream perpetually into the 100 DAO Council seats.</p>
      </div>
      <div class="component-card">
        <h4>6. Trobium Sub-Second Finality <span class="tag-keep">KEEP CONTAINER</span></h4>
        <p>Built on the high-speed Trobium blockchain. Payouts settle in milliseconds with gas fees less than $0.001 per transaction.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <span class="section-num">06</span>
      <h2 class="section-title">DAO FAQ Accordion Replacements</h2>
      <span class="section-badge">apps/web/components/landing/FaqSection.tsx</span>
    </div>

    <table class="spec-table">
      <thead>
        <tr>
          <th style="width: 30%;">Question</th>
          <th style="width: 70%;">Answer Summary for Designer Copy</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>What is the Equora Genesis DAO Council?</strong></td>
          <td>An exclusive governing body of exactly 100 sovereign members who co-own the protocol treasury and governance rights before the public retail launch.</td>
        </tr>
        <tr>
          <td><strong>Do I need to refer people to earn?</strong></td>
          <td><strong>Strictly NO.</strong> Genesis Council seats require zero (0) referrals. Payouts are distributed purely via the mathematical 300/N smart contract formula.</td>
        </tr>
        <tr>
          <td><strong>How does the 300/N formula work?</strong></td>
          <td>When member <i>N</i> joins with 300 TROB, the deposit is divided equally among all <i>N</i> members. Member 1 receives $300 instant cashback ($300/1). Member 10 receives $30 each to members 1–9 and themselves.</td>
        </tr>
        <tr>
          <td><strong>What is the 5X cap and 48-hour rule?</strong></td>
          <td>Each 300 TROB deposit earns up to $1,500 TROB. Once reached, you have 48 hours to re-topup 300 TROB to reset the cap. If expired, the seat becomes vacant and claimable by others.</td>
        </tr>
        <tr>
          <td><strong>What happens on Day 22?</strong></td>
          <td>The public $30 retail matrix unlocks worldwide. 35% of all retail matrix volume is perpetually routed into the Genesis DAO Council pool.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- ==================== PAGE 6: CHECKLIST & COMPONENT MAPPING ==================== -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">07</span>
      <h2 class="section-title">Designer Handover Checklist & Component Map</h2>
      <span class="section-badge">Action Items & File Paths</span>
    </div>

    <div class="directive-card">
      <strong>Summary of Tasks for UI/UX Designer</strong>
      <p>This checklist ensures all changes are implemented cleanly with zero broken components or misaligned containers:</p>
    </div>

    <table class="spec-table" style="margin-bottom: 14px;">
      <thead>
        <tr>
          <th style="width: 25%;">Component File</th>
          <th style="width: 25%;">Section on Page</th>
          <th style="width: 50%;">Design / Content Task</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>HeroSection.tsx</code></td>
          <td>Hero Banner</td>
          <td>Update H1, subheadline, 4 metric pills, and replace character image with 3D Gold Pass.</td>
        </tr>
        <tr>
          <td><code>LandingNavbar.tsx</code></td>
          <td>Sticky Top Header</td>
          <td>Add 21-day digital countdown pill: <code>[ 18d : 14h : 22m : 10s ]</code>.</td>
        </tr>
        <tr>
          <td><code>AboutMovementSection.tsx</code></td>
          <td>Story & Movement</td>
          <td>Replace community text with decentralized autonomous treasury architecture & 3 stat pills.</td>
        </tr>
        <tr>
          <td><code>GlobalNetworkSection.tsx</code></td>
          <td>6 Features Grid</td>
          <td>Keep 6-card layout; replace text with 6 DAO Pillars (Soulbound Pass, 300/N, 5X Cap, etc.).</td>
        </tr>
        <tr>
          <td><code>TierLevelsSection.tsx</code></td>
          <td>Tiers / Cards</td>
          <td>Convert to side-by-side comparison: Phase 1 DAO (Open) vs. Phase 2 Matrix (Locked).</td>
        </tr>
        <tr>
          <td><code>LiveActivityFeedSection.tsx</code></td>
          <td>Activity Feed</td>
          <td>Update rows to show live on-chain seat activations (#14 claimed, 5X re-topup alerts).</td>
        </tr>
        <tr>
          <td><code>FaqSection.tsx</code></td>
          <td>FAQ Accordion</td>
          <td>Insert the 5 DAO-specific questions and answers.</td>
        </tr>
      </tbody>
    </table>

    <ul class="checklist">
      <li><strong>Preserve All CSS Classes & Responsive Breakpoints:</strong> No container widths or flex/grid wrappers need to be changed.</li>
      <li><strong>Scarcity Principle:</strong> Ensure the 21-day countdown timer and "14/100 Seats Remaining" badge are visually prominent.</li>
      <li><strong>Brand Colors:</strong> Use Equora Gold (<code>#F59E0B</code>, <code>#FBBF24</code>), Cyan (<code>#06B6D4</code>), Deep Navy (<code>#06080F</code>), and Glassmorphism (<code>backdrop-blur-md</code>).</li>
    </ul>

    <div style="margin-top: 18px; padding: 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; text-align: center;">
      <span style="color: #34d399; font-weight: 700; font-size: 8.5pt;">
        🎉 Result: The landing page retains 100% of its existing visual beauty while converting visitors exclusively into Genesis DAO Council members!
      </span>
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log(`✅ Saved HTML Specification to: ${OUTPUT_HTML}`);

  console.log('🖨️ Launching Puppeteer to compile Landing Page DAO Handover A4 PDF...');
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
  console.log(`🎉 SUCCESS! Landing Page DAO Handover PDF generated at: ${OUTPUT_PDF}`);
}

main().catch(err => {
  console.error('Error generating Landing Page DAO PDF:', err);
  process.exit(1);
});
