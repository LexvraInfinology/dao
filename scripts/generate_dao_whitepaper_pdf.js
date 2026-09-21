const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_HTML = path.join(__dirname, '..', 'docs', '01_A4_Portrait_Whitepapers', 'Equora_Genesis_DAO_Whitepaper_A4.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', '01_A4_Portrait_Whitepapers', 'Equora_Genesis_DAO_Whitepaper_A4.pdf');

// Also update the investor named file so anyone opening either link gets the updated file
const ALT_PDF = path.join(__dirname, '..', 'docs', '01_A4_Portrait_Whitepapers', 'Equora_Genesis_DAO_Investor_Whitepaper_A4.pdf');
const ALT_HTML = path.join(__dirname, '..', 'docs', '01_A4_Portrait_Whitepapers', 'Equora_Genesis_DAO_Investor_Whitepaper_A4.html');

const BRANDING_LOGO = path.join(__dirname, '..', 'apps', 'web', 'public', 'assets', 'branding', 'equoralogo.jpeg');

const toBase64 = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

async function main() {
  console.log('🏛️ Encoding Brand Logo Asset for Genesis DAO Document...');
  const logoImg = toBase64(BRANDING_LOGO);

  console.log('📝 Generating Simplified, Institutional A4 HTML Document...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Genesis DAO</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 15mm 15mm 15mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Times New Roman', serif;
        font-size: 8pt;
        color: #555555;
      }
      @bottom-left {
        content: "EQUORA.FI — GENESIS DAO PROTOCOL SPECIFICATION";
        font-family: 'Times New Roman', serif;
        font-size: 7.5pt;
        letter-spacing: 0.04em;
        color: #777777;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Times New Roman', Times, Georgia, serif;
      font-size: 9pt;
      line-height: 1.44;
      color: #111111;
      background: #FFFFFF;
      text-align: justify;
    }

    .page-break {
      page-break-before: always;
    }

    .no-break {
      page-break-inside: avoid;
    }

    /* Header */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2pt solid #000000;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    .doc-header .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .doc-header img.logo {
      height: 64px;
      width: auto;
      object-fit: contain;
      border-radius: 4px;
    }

    .brand-text h2 {
      font-size: 17pt;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0;
      color: #000000;
      border: none;
      padding: 0;
    }

    .brand-text p {
      font-size: 8pt;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #444444;
      margin: 0;
    }

    .header-badge {
      text-align: right;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      line-height: 1.35;
      color: #333333;
    }

    .official-tag {
      display: inline-block;
      background: #000000;
      color: #FFFFFF;
      font-weight: bold;
      padding: 2.5px 8px;
      font-size: 7pt;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }

    /* Top Title Block: Strictly GENESIS DAO */
    h1.doc-title {
      font-size: 22pt;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 6px;
      margin-bottom: 4px;
      line-height: 1.2;
      color: #000000;
    }

    .doc-subtitle {
      font-size: 9.5pt;
      font-style: italic;
      text-align: center;
      margin-bottom: 14px;
      color: #333333;
    }

    /* Metadata Block */
    .meta-block {
      border-top: 1pt solid #000000;
      border-bottom: 1pt solid #000000;
      padding: 6px 0;
      margin-bottom: 14px;
      font-size: 8pt;
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      background: #FBFBFB;
    }

    .meta-item {
      text-align: center;
      flex: 1;
      border-right: 0.5pt solid #D0D0D0;
      padding: 0 4px;
    }

    .meta-item:last-child {
      border-right: none;
    }

    .meta-item span.label {
      font-size: 6.5pt;
      color: #666666;
      display: block;
    }

    .meta-item span.val {
      font-weight: bold;
      font-size: 8pt;
      color: #000000;
    }

    /* Headings */
    h2 {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 13px;
      margin-bottom: 5px;
      padding-bottom: 2px;
      border-bottom: 1pt solid #000000;
      color: #000000;
      page-break-after: avoid;
    }

    h3 {
      font-size: 9.5pt;
      font-weight: bold;
      font-style: italic;
      margin-top: 8px;
      margin-bottom: 3px;
      color: #111111;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 5px;
      text-indent: 0;
    }

    ul, ol {
      margin-left: 18px;
      margin-bottom: 5px;
    }

    li {
      margin-bottom: 2.5px;
    }

    /* Tables */
    table.formal-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 8pt;
      page-break-inside: avoid;
    }

    table.formal-table th {
      border-top: 1.5pt solid #000000;
      border-bottom: 1pt solid #000000;
      padding: 4px 6px;
      text-align: left;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 7pt;
      letter-spacing: 0.03em;
      background: #F4F4F4;
      color: #000000;
    }

    table.formal-table td {
      padding: 3.5px 6px;
      border-bottom: 0.5pt solid #E5E5E5;
      vertical-align: middle;
    }

    table.formal-table tr.highlight-row td {
      background: #F0FBF6;
      font-weight: bold;
    }

    table.formal-table tr:last-child td {
      border-bottom: 1.5pt solid #000000;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: 'Courier New', Courier, monospace; font-size: 7.5pt; }
    .font-bold { font-weight: bold; }
    .color-gold { color: #8A6500; font-weight: bold; }
    .color-green { color: #047857; font-weight: bold; }
    .color-crimson { color: #B91C1C; font-weight: bold; }

    /* Callout Boxes */
    .formal-box {
      border: 1pt solid #000000;
      padding: 8px 12px;
      margin: 8px 0;
      background: #FDFDFD;
      page-break-inside: avoid;
    }

    .formal-box-title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.05em;
      border-bottom: 0.5pt solid #000000;
      padding-bottom: 2px;
      margin-bottom: 5px;
      color: #000000;
    }

    .grid-2col {
      display: flex;
      gap: 10px;
      margin: 6px 0;
    }

    .col {
      flex: 1;
      border: 0.5pt solid #CCCCCC;
      padding: 7px 9px;
      background: #FAFAFA;
      font-size: 8pt;
    }

    .col-title {
      font-weight: bold;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 3px;
      border-bottom: 0.5pt solid #DDD;
      padding-bottom: 2px;
    }

    .math-equation {
      font-family: 'Courier New', Courier, monospace;
      font-size: 8.5pt;
      font-style: normal;
      font-weight: bold;
      text-align: center;
      margin: 4px 0;
      padding: 4px;
      background: #EEEEEE;
      border: 0.5pt solid #CCCCCC;
    }

    pre.ascii-diagram {
      font-family: 'Courier New', Courier, monospace;
      font-size: 6.8pt;
      line-height: 1.2;
      background: #F9F9F9;
      border: 0.5pt solid #CCCCCC;
      padding: 6px 8px;
      margin: 6px 0;
      white-space: pre;
      overflow: hidden;
      page-break-inside: avoid;
      color: #111111;
    }

    .signature-grid {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      border-top: 1pt solid #000000;
      padding-top: 10px;
      font-size: 7.5pt;
    }

    .sig-col {
      width: 45%;
    }

    .sig-line {
      margin-top: 22px;
      border-bottom: 0.75pt solid #000000;
      padding-bottom: 2px;
      font-weight: bold;
    }
  </style>
</head>
<body>

  <!-- ==================== HEADER ==================== -->
  <div class="doc-header">
    <div class="brand">
      ${logoImg ? `<img src="${logoImg}" class="logo" alt="Equora.Fi Brand Logo" />` : ''}
      <div class="brand-text">
        <h2>EQUORA.FI</h2>
        <p>Autonomous Decentralized Protocol</p>
      </div>
    </div>
    <div class="header-badge">
      <div class="official-tag">OFFICIAL PROTOCOL SPECIFICATION</div>
      <div>DAO Domain: equorafidao.com</div>
      <div>Matrix Domain: equorafi.com</div>
      <div>100% Solidity Automation &bull; Zero Admin Control</div>
    </div>
  </div>

  <!-- STRICT TITLE: GENESIS DAO ONLY -->
  <h1 class="doc-title">GENESIS DAO</h1>
  <div class="doc-subtitle">Official Protocol Specification &amp; Decentralized Co-Ownership Architecture</div>

  <!-- ==================== METADATA BAR ==================== -->
  <div class="meta-block">
    <div class="meta-item">
      <span class="label">Council Hard Cap</span>
      <span class="val">Exactly 100 Seats</span>
    </div>
    <div class="meta-item">
      <span class="label">Capital Commitment</span>
      <span class="val">One-Time $300 in live TROB</span>
    </div>
    <div class="meta-item">
      <span class="label">Referral Requirement</span>
      <span class="val">0 Directs (100% Passive)</span>
    </div>
    <div class="meta-item">
      <span class="label">Seat #1 Net Cost</span>
      <span class="val">$0.00 (100% Instant Refund)</span>
    </div>
    <div class="meta-item">
      <span class="label">DAO Inflow Royalty</span>
      <span class="val">35% Instant Push</span>
    </div>
    <div class="meta-item">
      <span class="label">Decentralization</span>
      <span class="val">Zero Admin Interference</span>
    </div>
  </div>

  <!-- ==================== SECTION 1: EXECUTIVE OVERVIEW ==================== -->
  <h2>1. Executive Overview</h2>
  <p>
    The <strong>Genesis DAO</strong> is the sovereign founding tier of the Equora.Fi decentralized ecosystem. It is an exclusive, mathematically secured co-ownership council limited strictly to <strong>100 seats worldwide</strong>.
  </p>
  <p>
    To secure permanent membership, a participant makes a <strong>single, one-time deposit of $300 worth of live rate of TROB coin</strong>. There are <strong>no monthly fees, no renewal costs, and no recurring subscriptions</strong>.
  </p>
  <p>
    Council members co-own the protocol with <strong>zero mandatory referrals (0 directs required)</strong>, enjoying instant peer-to-peer cashbacks and a permanent <strong>35% instant push from all global retail matrix volume</strong>. Furthermore, DAO members have full access to also fill and earn from upcoming $30 matrix seats.
  </p>

  <div class="formal-box">
    <div class="formal-box-title">GENESIS DAO: CORE PILLARS AT A GLANCE</div>
    <ul style="margin-bottom:0; font-size: 8pt;">
      <li><strong>Strict Scarcity:</strong> Only 100 seats will ever exist globally. Code prevents minting past Seat #100.</li>
      <li><strong>One-Time Commitment:</strong> Deposit $300 worth of live rate of TROB coin once. Never pay monthly fees.</li>
      <li><strong>Zero Referrals Required:</strong> 100% passive co-ownership entitlement; 0 personal referrals needed.</li>
      <li><strong>Instant 1st Member Cashback:</strong> Seat #1 receives 100% of their $300 back into their wallet in the very same block ($0 net cost).</li>
      <li><strong>35% Permanent Instant Push:</strong> Real-time direct push to all 100 DAO member wallets from global matrix volume.</li>
      <li><strong>Dual Earning Access:</strong> DAO members can ALSO activate and fill upcoming $30 matrix seats on <code>equorafi.com</code>.</li>
      <li><strong>100% Smart Contract Automation:</strong> Zero admin keys, zero owner control, non-custodial direct-to-wallet execution.</li>
    </ul>
  </div>

  <!-- ==================== SECTION 2: WHAT IS EQUORA.FI & DOMAINS ==================== -->
  <h2>2. What is Equora.Fi &amp; Ecosystem Domains</h2>
  <p>
    <strong>Equora.Fi</strong> is an autonomous Web3 protocol designed for self-sovereign wealth co-ownership on the Polygon / Trobium blockchain. The ecosystem operates across two dedicated domains:
  </p>

  <div class="grid-2col">
    <div class="col" style="border: 1pt solid #047857; background: #F4FBF7;">
      <div class="col-title" style="color: #047857;">DAO PORTAL: equorafidao.com</div>
      <p><strong>Audience:</strong> 100 Sovereign Genesis DAO Council Members</p>
      <p><strong>Entry:</strong> One-Time Deposit of $300 worth of live rate of TROB</p>
      <p><strong>Earnings:</strong> Instant 300 / N queue distributions + 35% instant push from all global matrix boards worldwide.</p>
      <p><strong>Governance:</strong> Soulbound non-transferable ERC-721 voting pass.</p>
    </div>

    <div class="col" style="border: 1pt solid #8A6500; background: #FFFDF5;">
      <div class="col-title" style="color: #8A6500;">COMMUNITY MATRIX PORTAL: equorafi.com</div>
      <p><strong>Audience:</strong> Mass Retail Community &amp; Active Builders</p>
      <p><strong>Entry:</strong> $30 Slot 1 Normal ID (12 progressive slots)</p>
      <p><strong>Earnings:</strong> 14-node cyclical spillover boards, auto-upgrades, and monthly leadership salaries.</p>
      <p><strong>DAO Access:</strong> Genesis DAO members can ALSO participate here!</p>
    </div>
  </div>

  <!-- ==================== SECTION 3: WHAT PROBLEMS DOES IT SOLVE ==================== -->
  <h2>3. What Problems Does Equora.Fi Solve? (Simplified &amp; Direct)</h2>
  <p>
    Equora.Fi was built from first principles to solve the real problems that plague traditional crypto and affiliate projects:
  </p>

  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 25%;">Industry Problem</th>
        <th style="width: 35%;">Traditional System Failure</th>
        <th style="width: 40%;">How Equora.Fi Solves It</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Admin Theft &amp; "Rug Pulls"</td>
        <td>Founders hold company wallets, can freeze accounts, alter rules, or run away with funds.</td>
        <td class="font-bold color-green">100% Solidity Code Automation: Zero admin keys, zero backdoors. No human can touch your funds.</td>
      </tr>
      <tr>
        <td class="font-bold">Ineligible Upline Leakage</td>
        <td>When an upline does not qualify to earn, the company steals the commission as hidden profit.</td>
        <td class="font-bold color-green">Ineligible upline money routes 100% into the 4 community pools! Nothing is kept by developers.</td>
      </tr>
      <tr>
        <td class="font-bold">Capital Loss &amp; Risk</td>
        <td>Participants put money in and risk losing it if platform growth slows down.</td>
        <td class="font-bold color-green">Seat #1 gets 100% refunded instantly ($0 net cost). Subsequent seats get rapid cashbacks + 35% global push.</td>
      </tr>
      <tr>
        <td class="font-bold">Forced Recruitment Pressure</td>
        <td>Users are forced to recruit dozens of people just to break even, trapping passive participants.</td>
        <td class="font-bold color-green">Strictly 0 Referrals Required for DAO: Entitlement is 100% passive and mathematically automated.</td>
      </tr>
      <tr>
        <td class="font-bold">Volatile Token Crashes</td>
        <td>Rewards are paid in speculative coins that dump 95% on exchanges.</td>
        <td class="font-bold color-green">Paid in live rate of TROB coins pegged 1:1 to USD, maintaining pure dollar purchasing power.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== SECTION 4: THE 4 PROTOCOL POOLS ==================== -->
  <h2>4. The 4 Automated Protocol Pools: Sourcing &amp; Distribution</h2>
  <p>
    Equora.Fi routes protocol revenue autonomously into four dedicated pools. These pools are sourced transparently from <strong>Node 4, Node 5, and Node 14</strong> on every retail matrix board globally on <code>equorafi.com</code>, <strong>PLUS all funds from ineligible uplines</strong>:
  </p>

  <div class="formal-box" style="background: #F8FAFC; border: 1.5pt solid #000000;">
    <div class="formal-box-title">REVENUE SOURCING FOR THE 4 PROTOCOL POOLS</div>
    <p style="font-size: 8pt; margin-bottom: 4px;">
      <strong>1. Sourced from Retail Matrix:</strong> Every time Node 4, Node 5, or Node 14 fills on any 14-node board across all 12 slots.<br>
      <strong>2. Sourced from Ineligible Uplines:</strong> Whenever an upline lacks the required referrals to receive commissions, 100% of those funds are automatically swept into these 4 pools!
    </p>
  </div>

  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 22%;">Pool Name</th>
        <th style="width: 14%;">Share %</th>
        <th style="width: 28%;">Distribution Timing</th>
        <th style="width: 36%;">Eligible Beneficiaries</th>
      </tr>
    </thead>
    <tbody>
      <tr class="highlight-row">
        <td class="font-bold color-green">DAO Treasury Pool</td>
        <td class="font-bold font-mono color-green">35%</td>
        <td class="font-bold color-green">INSTANT PUSH (Real-Time)</td>
        <td>Direct atomic push into all 100 Genesis DAO member wallets!</td>
      </tr>
      <tr>
        <td class="font-bold">Global Salary Pool</td>
        <td class="font-bold font-mono">40%</td>
        <td class="font-bold">Monthly on the 11th</td>
        <td>Distributed monthly to qualified leadership ranks (Alpha, Sigma, Apex, Crown).</td>
      </tr>
      <tr>
        <td class="font-bold">Magic Blind Box</td>
        <td class="font-bold font-mono">10%</td>
        <td class="font-bold">3-Month Unlock Timer</td>
        <td>Gamified protocol rewards unlocking 3 months from ID creation date.</td>
      </tr>
      <tr>
        <td class="font-bold">Level Rewards</td>
        <td class="font-bold font-mono">15%</td>
        <td class="font-bold">Instant Rank Completion</td>
        <td>One-time instant rewards unlocked upon achieving milestone network tiers.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 5: DISTRIBUTION EXPLAINED SIMPLY ==================== -->
  <h2>5. How the $300 / N Distribution Works (Simple &amp; Clear)</h2>
  <p>
    When a participant joins the Genesis DAO with a one-time deposit of $300 worth of live rate of TROB coin, the contract performs an instant, fair peer split:
  </p>
  <div class="math-equation">
    Instant Payout Per Member = 300.00 / N &nbsp;(TROB) &nbsp;&bull;&nbsp; Total Payout = N &times; (300 / N) &equiv; 300.00 TROB
  </div>
  <p>
    Where <strong>N</strong> is the active seat number (including the person who just joined):
    <strong>Incoming Member N</strong> gets $\frac{300}{N}$ immediately back into their wallet as <strong>instant cashback</strong>, while <strong>every prior member (1 to N-1)</strong> gets $\frac{300}{N}$ sent immediately as passive profit.
  </p>

  <h3>Simplified Milestone Seat Overview</h3>
  <table class="formal-table">
    <thead>
      <tr>
        <th class="text-center" style="width: 14%;">Council Seat (N)</th>
        <th class="text-right" style="width: 16%;">One-Time Deposit</th>
        <th class="text-right" style="width: 22%;">Instant Cashback</th>
        <th class="text-right" style="width: 18%;">Net Out-of-Pocket</th>
        <th style="width: 30%;">How it Works &amp; Key Benefit</th>
      </tr>
    </thead>
    <tbody>
      <tr class="highlight-row">
        <td class="text-center font-bold font-mono">Seat #1 (Alpha)</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green font-bold">$300.00 (300/1)</td>
        <td class="text-right font-mono color-green font-bold">$0.00 (100% FREE!)</td>
        <td><strong>Gets all $300 back instantly.</strong> Receives dividends from all 99 seats!</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #2</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green">$150.00 (300/2)</td>
        <td class="text-right font-mono font-bold">$150.00</td>
        <td>Recovers 50% immediately; recovers remaining $150 as Seats 3+ join.</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #3</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green">$100.00 (300/3)</td>
        <td class="text-right font-mono font-bold">$200.00</td>
        <td>Recovers 33% immediately; steadily pushes into pure profit.</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #5</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green">$60.00 (300/5)</td>
        <td class="text-right font-mono font-bold">$240.00</td>
        <td>Recovers from subsequent 95 seats + Day 22 matrix volume.</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #10</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green">$30.00 (300/10)</td>
        <td class="text-right font-mono font-bold">$270.00</td>
        <td>Earns compounding queue push dividends across remaining seats.</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #25</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green">$12.00 (300/25)</td>
        <td class="text-right font-mono font-bold">$288.00</td>
        <td>Steady queue returns + permanent 35% global matrix push.</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #50</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green">$6.00 (300/50)</td>
        <td class="text-right font-mono font-bold">$294.00</td>
        <td>Recovers majority in Phase 1; permanent Day 22 cashflow.</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #100</td>
        <td class="text-right font-mono">$300 in TROB</td>
        <td class="text-right font-mono color-green">$3.00 (300/100)</td>
        <td class="text-right font-mono font-bold">$297.00</td>
        <td>Backed permanently by the 35% instant push from all matrix boards!</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 6: DUAL EARNING ACCESS ==================== -->
  <h2>6. Dual Earning Access: DAO Members Can Also Fill $30 Matrix Seats</h2>
  <p>
    Genesis DAO council members are not restricted to passive queue distributions:
  </p>
  <ul>
    <li>When the public retail matrix launches on <code>equorafi.com</code>, <strong>DAO members can ALSO activate and fill upcoming $30 matrix seats</strong>.</li>
    <li>This provides council members with <strong>two simultaneous earning engines</strong>:
      <ol style="margin-left: 18px; margin-top: 3px;">
        <li><strong>Passive DAO Engine:</strong> Continuous <strong>35% instant push</strong> to their wallet from every matrix board worldwide.</li>
        <li><strong>Active Matrix Engine:</strong> Direct matrix cycle income ($180 pure cash per 14-node board cycle) and automatic tier upgrades across all 12 slots.</li>
      </ol>
    </li>
  </ul>

  <!-- ==================== SECTION 7: 35% ONGOING MATRIX ROYALTIES ==================== -->
  <h2>7. Permanent 35% Instant Push from Global Matrix Volume</h2>
  <p>
    On Day 22, the retail matrix goes live globally on <code>equorafi.com</code>. Every Genesis DAO seat owns an <strong>equal 1/100th claim</strong> on the entire 35% DAO Treasury pool. Every time a board node triggers a pool cut or an ineligible upline rolls over, funds are <strong>instantly pushed directly to members' Web3 wallets</strong>:
  </p>

  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 24%;">Global Matrix Activity</th>
        <th class="text-right" style="width: 22%;">35% Monthly Pool</th>
        <th class="text-right" style="width: 20%;">Monthly per Seat (1/100)</th>
        <th class="text-right" style="width: 18%;">Annual per Seat</th>
        <th class="text-right" style="width: 16%;">Effective Return</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">1,000 Cycles / mo</td>
        <td class="text-right font-mono">$35,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$350.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$4,200.00 / yr</td>
        <td class="text-right font-mono font-bold">1,400% Annual</td>
      </tr>
      <tr class="highlight-row">
        <td class="font-bold">5,000 Cycles / mo</td>
        <td class="text-right font-mono">$175,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$1,750.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$21,000.00 / yr</td>
        <td class="text-right font-mono font-bold">7,000% Annual</td>
      </tr>
      <tr>
        <td class="font-bold">20,000 Cycles / mo</td>
        <td class="text-right font-mono">$700,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$7,000.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$84,000.00 / yr</td>
        <td class="text-right font-mono font-bold">28,000% Annual</td>
      </tr>
      <tr>
        <td class="font-bold">50,000 Cycles / mo</td>
        <td class="text-right font-mono">$1,750,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$17,500.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$210,000.00 / yr</td>
        <td class="text-right font-mono font-bold">70,000% Annual</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 8: 5X CAP & 48H URGENCY ==================== -->
  <div class="no-break">
    <h2>8. 5X Earnings Cap &amp; 48-Hour Urgency Re-Topup Flywheel</h2>
    <pre class="ascii-diagram">
         [ ONE-TIME DEPOSIT: $300 IN LIVE TROB ]
                            │
                            ▼
         [ ACCUMULATE EARNINGS: UP TO $1,500.00 (5X) ]
                            │
                            ▼
         [ CAP REACHED: AT EXACTLY $1,500.00 EARNINGS ]
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
   [ RE-TOPUP 300 WITHIN 48H ]    [ 48-HOUR TIMER EXPIRES ]
            │                               │
            ▼                               ▼
   • Cap resets to $0 / $1,500    • Seat marked VACANT
   • KEEP YOUR SEAT INDEX #1-#100 • Assigned to next applicant via 1-100 scan
   • HARVEST $1,200 NET PROFIT    • Original member keeps their $1,500 earned
   • 300 re-enters the pool       • Eliminates inactive "zombie" seats
    </pre>

    <ul>
      <li><strong>$1,200 Net Clean Profit Every Cycle:</strong> Put in 300, earn 1,500, re-topup 300, and keep <strong>$1,200 net clean profit</strong> per cycle indefinitely.</li>
      <li><strong>Zero Dead Seats:</strong> If someone goes inactive and misses the 48-hour window, their seat is automatically reassigned to an active participant via sequential 1–100 scan, ensuring <strong>the council always stays 100% active</strong>.</li>
    </ul>

    <div class="signature-grid">
      <div class="sig-col">
        <div><strong>AUTHORIZED PROTOCOL STANDARD:</strong></div>
        <div class="sig-line">Equora.Fi Autonomous Governance Council</div>
        <div style="font-size: 7pt; color: #555; margin-top: 3px;">100% Autonomous Solidity Suite &bull; Polygon / Trobium</div>
      </div>
      <div class="sig-col" style="text-align: right;">
        <div><strong>OFFICIAL DOMAINS:</strong></div>
        <div class="sig-line" style="text-align: right;">equorafidao.com &bull; equorafi.com</div>
        <div style="font-size: 7pt; color: #555; margin-top: 3px;">Zero Admin Interference &bull; Non-Custodial Direct Settlement</div>
      </div>
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  fs.writeFileSync(ALT_HTML, htmlContent, 'utf8');
  console.log(`✓ Institutional HTML written at: ${OUTPUT_HTML}`);

  console.log('🖨️ Launching Puppeteer to compile Genesis DAO PDF...');
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
      top: '14mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    }
  });

  // Also mirror to ALT_PDF
  fs.copyFileSync(OUTPUT_PDF, ALT_PDF);

  await browser.close();
  console.log(`🎉 SUCCESS! Genesis DAO PDF generated at: ${OUTPUT_PDF}`);
  console.log(`🎉 Also mirrored to: ${ALT_PDF}`);
}

main().catch(err => {
  console.error('Error compiling Genesis DAO PDF:', err);
  process.exit(1);
});
