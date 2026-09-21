const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_HTML = path.join(__dirname, '..', 'docs', '01_A4_Portrait_Whitepapers', 'Equora_Genesis_DAO_Investor_Whitepaper_A4.html');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', '01_A4_Portrait_Whitepapers', 'Equora_Genesis_DAO_Investor_Whitepaper_A4.pdf');
const ASSETS_DIR = path.join(__dirname, '..', 'docs', 'assets');

const toBase64 = (filePath) => {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

async function main() {
  console.log('🏛️ Encoding Image Assets for Investor Whitepaper...');
  const logoImg = toBase64(path.join(ASSETS_DIR, 'equorafilogo-removebg-preview.png'));
  const daoCardImg = toBase64(path.join(ASSETS_DIR, 'dao_card.jpg'));

  console.log('📝 Generating Institutional A4 HTML Whitepaper...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora.Fi — Genesis DAO Council Investor Whitepaper</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 16mm 18mm 16mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Times New Roman', serif;
        font-size: 8pt;
        color: #555555;
      }
      @bottom-left {
        content: "EQUORA.FI — CONFIDENTIAL INVESTOR MEMORANDUM (DAO PHASE ONLY)";
        font-family: 'Times New Roman', serif;
        font-size: 8pt;
        letter-spacing: 0.05em;
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
      font-size: 9.5pt;
      line-height: 1.5;
      color: #111111;
      background: #FFFFFF;
      text-align: justify;
    }

    /* Page Breaks */
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
      padding-bottom: 12px;
      margin-bottom: 16px;
    }

    .doc-header .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .doc-header img.logo {
      height: 48px;
      width: auto;
      object-fit: contain;
    }

    .brand-text h2 {
      font-size: 16pt;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin: 0;
      color: #000000;
      border: none;
      padding: 0;
    }

    .brand-text p {
      font-size: 8pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #555555;
      margin: 0;
    }

    .header-badge {
      text-align: right;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.4;
      color: #333333;
    }

    .confidential-tag {
      display: inline-block;
      background: #000000;
      color: #FFFFFF;
      font-weight: bold;
      padding: 2px 8px;
      font-size: 7pt;
      letter-spacing: 0.1em;
      margin-bottom: 3px;
    }

    /* Title Block */
    h1.doc-title {
      font-size: 19pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 10px;
      margin-bottom: 4px;
      line-height: 1.25;
      color: #000000;
    }

    .doc-subtitle {
      font-size: 10pt;
      font-style: italic;
      text-align: center;
      margin-bottom: 16px;
      color: #333333;
    }

    /* Metadata Block */
    .meta-block {
      border-top: 1pt solid #000000;
      border-bottom: 1pt solid #000000;
      padding: 8px 0;
      margin-bottom: 18px;
      font-size: 8.5pt;
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
      letter-spacing: 0.04em;
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
      font-size: 7pt;
      color: #666666;
      display: block;
    }

    .meta-item span.val {
      font-weight: bold;
      font-size: 8.5pt;
      color: #000000;
    }

    /* Section Headings */
    h2 {
      font-size: 11.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 16px;
      margin-bottom: 6px;
      padding-bottom: 3px;
      border-bottom: 1pt solid #000000;
      color: #000000;
      page-break-after: avoid;
    }

    h3 {
      font-size: 10pt;
      font-weight: bold;
      font-style: italic;
      margin-top: 10px;
      margin-bottom: 4px;
      color: #111111;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 8px;
      text-indent: 0;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 8px;
    }

    li {
      margin-bottom: 3px;
    }

    /* Formal Financial Tables */
    table.formal-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    table.formal-table th {
      border-top: 1.5pt solid #000000;
      border-bottom: 1pt solid #000000;
      padding: 5px 6px;
      text-align: left;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.04em;
      background: #F4F4F4;
      color: #000000;
    }

    table.formal-table td {
      padding: 4.5px 6px;
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
    .font-mono { font-family: 'Courier New', Courier, monospace; font-size: 8pt; }
    .font-bold { font-weight: bold; }
    .color-gold { color: #8A6500; font-weight: bold; }
    .color-green { color: #047857; font-weight: bold; }
    .color-crimson { color: #B91C1C; font-weight: bold; }

    /* Visual Boxed Callouts */
    .formal-box {
      border: 1pt solid #000000;
      padding: 10px 14px;
      margin: 10px 0;
      background: #FDFDFD;
      page-break-inside: avoid;
    }

    .formal-box-title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.06em;
      border-bottom: 0.5pt solid #000000;
      padding-bottom: 3px;
      margin-bottom: 6px;
      color: #000000;
    }

    .grid-2col {
      display: flex;
      gap: 12px;
      margin: 8px 0;
    }

    .col {
      flex: 1;
      border: 0.5pt solid #CCCCCC;
      padding: 8px 10px;
      background: #FAFAFA;
      font-size: 8.5pt;
    }

    .col-title {
      font-weight: bold;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 5px;
      border-bottom: 0.5pt solid #DDD;
      padding-bottom: 2px;
    }

    /* Mathematical Box */
    .math-callout {
      border-left: 3pt solid #000000;
      background: #F8F8F8;
      padding: 8px 12px;
      margin: 8px 0;
      font-style: italic;
      page-break-inside: avoid;
    }

    .math-equation {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      font-style: normal;
      font-weight: bold;
      text-align: center;
      margin: 6px 0;
      padding: 4px;
      background: #EEEEEE;
      border: 0.5pt solid #CCCCCC;
    }

    /* ASCII Diagrams */
    pre.ascii-diagram {
      font-family: 'Courier New', Courier, monospace;
      font-size: 7.2pt;
      line-height: 1.25;
      background: #F9F9F9;
      border: 0.5pt solid #CCCCCC;
      padding: 8px 10px;
      margin: 8px 0;
      white-space: pre;
      overflow: hidden;
      page-break-inside: avoid;
      color: #111111;
    }

    /* Footer / Signoff */
    .signature-grid {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      border-top: 1pt solid #000000;
      padding-top: 12px;
      font-size: 8pt;
    }

    .sig-col {
      width: 45%;
    }

    .sig-line {
      margin-top: 30px;
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
      ${logoImg ? `<img src="${logoImg}" class="logo" alt="Equora.Fi Logo" />` : ''}
      <div class="brand-text">
        <h2>EQUORA.FI</h2>
        <p>Autonomous Co-Ownership Protocol</p>
      </div>
    </div>
    <div class="header-badge">
      <div class="confidential-tag">CONFIDENTIAL MEMORANDUM</div>
      <div>Genesis DAO Tier • Hard Cap 100 Seats</div>
      <div>Solidity Verified • Zero Admin Keys</div>
    </div>
  </div>

  <h1 class="doc-title">Genesis DAO Council Investor Whitepaper</h1>
  <div class="doc-subtitle">Institutional Co-Ownership Charter, Mathematical Payout Proofs &amp; Structural Economics (DAO Phase Only)</div>

  <!-- ==================== METADATA BAR ==================== -->
  <div class="meta-block">
    <div class="meta-item">
      <span class="label">Council Cap</span>
      <span class="val">Exactly 100 Seats</span>
    </div>
    <div class="meta-item">
      <span class="label">Entry Capital</span>
      <span class="val">300 TROB ($300 USD)</span>
    </div>
    <div class="meta-item">
      <span class="label">Referral Requirement</span>
      <span class="val">0 Directs (None)</span>
    </div>
    <div class="meta-item">
      <span class="label">Instant Formula</span>
      <span class="val">300 / N Distributed</span>
    </div>
    <div class="meta-item">
      <span class="label">Seat #1 Net Cost</span>
      <span class="val">$0.00 (100% Free)</span>
    </div>
    <div class="meta-item">
      <span class="label">Token Standard</span>
      <span class="val">Soulbound ERC-721</span>
    </div>
  </div>

  <!-- ==================== SECTION 1: EXECUTIVE SUMMARY ==================== -->
  <h2>1. Executive Summary &amp; Investment Highlights</h2>
  <p>
    The <strong>Equora Genesis DAO Council</strong> is the institutional sovereign co-ownership foundation of the Equora.Fi protocol. Unlike conventional network marketing or speculative algorithmic tokens, the Genesis DAO Council is an <strong>exclusive, mathematical co-ownership consortium limited strictly to 100 seats globally</strong>.
  </p>
  <p>
    Council participants co-own the protocol's sovereign infrastructure with <strong>zero recruitment requirements, zero sponsor obligations, zero direct referrals, and zero lockup forfeiture</strong>. Capital is allocated peer-to-peer instantly via verified Solidity smart contracts with zero debt generation.
  </p>

  <div class="formal-box">
    <div class="formal-box-title">Genesis DAO Council: 6 Institutional Investment Pillars</div>
    <ul style="margin-bottom:0;">
      <li><strong>1. Absolute Scarcity:</strong> Fixed hard cap of exactly 100 seats worldwide. Smart contract prevents minting past Seat #100.</li>
      <li><strong>2. Extreme Capital Efficiency:</strong> Flat 300 TROB ($300.00 USD) commitment. High ROI multiple with minimal down-side.</li>
      <li><strong>3. 100% Passive Co-Ownership:</strong> Zero personal referrals required to earn queue dividends, matrix royalties, or governance voting rights.</li>
      <li><strong>4. Instant $300 / N Cashback:</strong> The incoming registrant receives instant capital return in the exact same transaction block.</li>
      <li><strong>5. Day 22 Global Matrix Royalties:</strong> Permanent entitlement to 35% of all retail matrix volume generated worldwide.</li>
      <li><strong>6. Self-Rejuvenating Flywheel:</strong> 5X ($1,500 TROB) cap with 48-hour re-topup urgency window guarantees continuous active liquidity.</li>
    </ul>
  </div>

  <!-- ==================== SECTION 2: KEY FINANCIAL METRICS ==================== -->
  <h2>2. Key Financial Metrics at a Glance</h2>
  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 28%;">Parameter</th>
        <th style="width: 32%;">Contract Specification</th>
        <th style="width: 40%;">Institutional Significance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Total Council Hard Cap</td>
        <td class="font-mono">100 Seats (Grid 10x10)</td>
        <td>Strictly limited supply; guarantees high per-seat royalty yield.</td>
      </tr>
      <tr>
        <td class="font-bold">Entry Capital</td>
        <td class="font-mono">300.00 TROB ($300 USD)</td>
        <td>Flat, accessible barrier for founding leaders and funds.</td>
      </tr>
      <tr class="highlight-row">
        <td class="font-bold">Direct Referrals Required</td>
        <td class="font-mono color-green">0 Direct Referrals (None)</td>
        <td>100% passive co-ownership; pure mathematical entitlement.</td>
      </tr>
      <tr>
        <td class="font-bold">Cashback &amp; Dividend Rule</td>
        <td class="font-mono color-gold">Payout = 300 / N</td>
        <td>Instant cashback to joiner + equal split across all prior seated members.</td>
      </tr>
      <tr class="highlight-row">
        <td class="font-bold">Seat #1 Net Out-of-Pocket</td>
        <td class="font-mono color-green">$0.00 (100% FREE NET)</td>
        <td>Deposits $300, receives $300 instant cashback in the exact same block.</td>
      </tr>
      <tr>
        <td class="font-bold">Earnings Cap per Deposit</td>
        <td class="font-mono">5X Gross ($1,500.00 TROB)</td>
        <td>Yields <strong>$1,200.00 net clean profit</strong> per 300 TROB cycle.</td>
      </tr>
      <tr>
        <td class="font-bold">Urgency Re-Topup Window</td>
        <td class="font-mono color-crimson">48 Hours Countdown</td>
        <td>Prevents deadweight; automated sniper reassignment for defaults.</td>
      </tr>
      <tr class="highlight-row">
        <td class="font-bold">Retail Matrix Inflow Share</td>
        <td class="font-mono color-green">35% Global Treasury Pool</td>
        <td>Permanent royalty stream commencing on Day 22 retail unlock.</td>
      </tr>
      <tr>
        <td class="font-bold">Governance Weight</td>
        <td class="font-mono">1 Vote per Seat (1.0%)</td>
        <td>Unweighted, anti-whale sovereign governance.</td>
      </tr>
      <tr>
        <td class="font-bold">Token Architecture</td>
        <td class="font-mono">Soulbound ERC-721</td>
        <td>Non-transferable; bound to recipient wallet, anti-sybil.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 3: TWO-PHASE STRATEGIC LAUNCH ==================== -->
  <div class="no-break">
    <h2>3. Two-Phase Strategic Launch Architecture</h2>
    <p>
      Equora enforces a strict chronological roadmap that completely isolates the Genesis DAO founding tier from the mass retail matrix phase:
    </p>

    <div class="grid-2col">
      <div class="col" style="border: 1pt solid #047857; background: #F4FBF7;">
        <div class="col-title" style="color: #047857;">PHASE 1: DAYS 1 TO 21 &bull; GENESIS DAO ONLY</div>
        <p><strong>Status:</strong> 100% Live &amp; Filling Right Now</p>
        <p><strong>Dedicated Domain:</strong> <span class="font-mono font-bold">dao.equora.fi</span></p>
        <p><strong>Audience:</strong> Founding Co-Owners &amp; Angel Backers</p>
        <p><strong>Key Mechanics:</strong></p>
        <ul style="margin-left: 14px; font-size: 8pt;">
          <li>Only 100 seats open worldwide ($300 TROB flat).</li>
          <li>Instant peer redistribution: 300 / N formula.</li>
          <li>Retail matrix remains <strong>100% LOCKED</strong> with a live 21-day countdown clock.</li>
          <li>Establishes foundational treasury liquidity and governance.</li>
        </ul>
      </div>

      <div class="col" style="border: 1pt solid #8A6500; background: #FFFDF5;">
        <div class="col-title" style="color: #8A6500;">PHASE 2: DAY 22+ &bull; RETAIL MATRIX UNLOCK</div>
        <p><strong>Status:</strong> Activates Automatically on Day 22</p>
        <p><strong>Dedicated Domain:</strong> <span class="font-mono font-bold">matrix.equora.fi</span></p>
        <p><strong>Audience:</strong> Global Retail Community ($30 Normal IDs)</p>
        <p><strong>Key Mechanics:</strong></p>
        <ul style="margin-left: 14px; font-size: 8pt;">
          <li>Public matrix opens; seats 1–14 across 12 slots fill globally.</li>
          <li><strong>35% of all retail matrix volume</strong> streams directly into the Genesis DAO Treasury.</li>
          <li>All 100 seated DAO members receive daily automated dividends without recruiting a single retail participant.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== SECTION 4: MATHEMATICAL PROOF ==================== -->
  <h2>4. Mathematical Proof: The $300 / N Instant Redistribution Engine</h2>
  
  <h3>4.1 Redistribution Formulation</h3>
  <p>
    When Member $N$ (where $N \in [1, 100]$) deposits 300 TROB into the <code>EquoraDAO.sol</code> smart contract, the contract executes the deterministic redistribution algorithm in a single atomic transaction:
  </p>

  <div class="math-callout">
    <div class="math-equation">Payout Per Member = 300.00 / N &nbsp;(TROB)</div>
    <p style="font-size: 8.5pt; margin-bottom: 0;">
      Where $N$ represents the <strong>total active member count after including the incoming registrant</strong>. The calculated payout is distributed immediately to all $N$ members: Member $N$ receives instant cashback, and all prior $N-1$ members receive an instant queue dividend.
    </p>
  </div>

  <h3>4.2 Absolute Zero-Debt Invariant Proof</h3>
  <p>
    Traditional high-yield protocols fail because they issue unbacked IOUs. Equora.Fi mathematically eliminates insolvency by enforcing the following algebraic identity on every single block:
  </p>
  <div class="math-equation" style="background:#FFF;">
    &sum;<sub>i=1</sub><sup>N</sup> (300 / N) = N &times; (300 / N) &equiv; 300.00 TROB &nbsp;&nbsp;|&nbsp;&nbsp; &Delta;Assets - &Delta;Liabilities &equiv; 0.000000
  </div>
  <p>
    <strong>Audited Solvency Guarantee:</strong> Exactly 300.00 TROB enters the contract, and exactly 300.00 TROB is credited to verified ledger accounts. The protocol carries <strong>zero unbacked debt, zero cumulative liabilities, and zero structural exposure</strong>.
  </p>

  <h3>4.3 Seat-by-Seat Capital Allocation Table (Seat 1 to 100)</h3>
  <p>
    The table below demonstrates the exact cashflow mechanics at key milestone seats across the 100-seat continuum:
  </p>

  <table class="formal-table">
    <thead>
      <tr>
        <th class="text-center" style="width: 12%;">Seat # (N)</th>
        <th class="text-right" style="width: 14%;">Gross Deposit</th>
        <th class="text-right" style="width: 20%;">Instant Cashback to Joiner</th>
        <th class="text-right" style="width: 20%;">Total to Prior Members</th>
        <th class="text-right" style="width: 18%;">Per Prior Member</th>
        <th class="text-right" style="width: 16%;">Net Out-of-Pocket</th>
      </tr>
    </thead>
    <tbody>
      <tr class="highlight-row">
        <td class="text-center font-bold font-mono">Seat #1</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$300.00 (300/1)</td>
        <td class="text-right font-mono">$0.00</td>
        <td class="text-right font-mono">$0.00</td>
        <td class="text-right font-mono color-green font-bold">$0.00 (100% FREE)</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #2</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$150.00 (300/2)</td>
        <td class="text-right font-mono">$150.00</td>
        <td class="text-right font-mono">$150.00 to #1</td>
        <td class="text-right font-mono font-bold">$150.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #3</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$100.00 (300/3)</td>
        <td class="text-right font-mono">$200.00</td>
        <td class="text-right font-mono">$100.00 to #1, #2</td>
        <td class="text-right font-mono font-bold">$200.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #4</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$75.00 (300/4)</td>
        <td class="text-right font-mono">$225.00</td>
        <td class="text-right font-mono">$75.00 to #1–#3</td>
        <td class="text-right font-mono font-bold">$225.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #5</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$60.00 (300/5)</td>
        <td class="text-right font-mono">$240.00</td>
        <td class="text-right font-mono">$60.00 to #1–#4</td>
        <td class="text-right font-mono font-bold">$240.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #10</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$30.00 (300/10)</td>
        <td class="text-right font-mono">$270.00</td>
        <td class="text-right font-mono">$30.00 to #1–#9</td>
        <td class="text-right font-mono font-bold">$270.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #20</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$15.00 (300/20)</td>
        <td class="text-right font-mono">$285.00</td>
        <td class="text-right font-mono">$15.00 to #1–#19</td>
        <td class="text-right font-mono font-bold">$285.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #35</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$8.57 (300/35)</td>
        <td class="text-right font-mono">$291.43</td>
        <td class="text-right font-mono">$8.57 to #1–#34</td>
        <td class="text-right font-mono font-bold">$291.43</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #50</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$6.00 (300/50)</td>
        <td class="text-right font-mono">$294.00</td>
        <td class="text-right font-mono">$6.00 to #1–#49</td>
        <td class="text-right font-mono font-bold">$294.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #75</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$4.00 (300/75)</td>
        <td class="text-right font-mono">$296.00</td>
        <td class="text-right font-mono">$4.00 to #1–#74</td>
        <td class="text-right font-mono font-bold">$296.00</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #100</td>
        <td class="text-right font-mono">$300.00</td>
        <td class="text-right font-mono color-green">$3.00 (300/100)</td>
        <td class="text-right font-mono">$297.00</td>
        <td class="text-right font-mono">$3.00 to #1–#99</td>
        <td class="text-right font-mono font-bold">$297.00</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 5: CUMULATIVE EARNINGS & HARMONIC SERIES ==================== -->
  <h2>5. Cumulative Earnings Analysis: Harmonic Series Economics</h2>
  <p>
    Because dividends follow the partial harmonic sum, earlier seats benefit from exponential seniority compounding. For any member joining at Seat $S$, their cumulative dividend yield across the initial 100-seat fill is:
  </p>

  <div class="math-equation">
    Cumulative Queue Earnings(S) = (300 / S) + &sum;<sub>k=S+1</sub><sup>100</sup> (300 / k) = 300 &times; &sum;<sub>k=S</sub><sup>100</sup> (1 / k)
  </div>

  <table class="formal-table">
    <thead>
      <tr>
        <th class="text-center" style="width: 14%;">Council Seat</th>
        <th class="text-right" style="width: 18%;">Net Out-of-Pocket</th>
        <th class="text-right" style="width: 22%;">Total Queue Return</th>
        <th class="text-right" style="width: 22%;">Net Profit (Phase 1 Only)</th>
        <th class="text-right" style="width: 24%;">ROI on Out-of-Pocket</th>
      </tr>
    </thead>
    <tbody>
      <tr class="highlight-row">
        <td class="text-center font-bold font-mono">Seat #1</td>
        <td class="text-right font-mono color-green font-bold">$0.00</td>
        <td class="text-right font-mono color-gold font-bold">$1,556.21 TROB</td>
        <td class="text-right font-mono color-green font-bold">+$1,556.21 TROB</td>
        <td class="text-right font-mono color-green font-bold">&infin; (Infinite ROI)</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #2</td>
        <td class="text-right font-mono">$150.00</td>
        <td class="text-right font-mono color-gold">$1,256.21 TROB</td>
        <td class="text-right font-mono color-green">+$1,106.21 TROB</td>
        <td class="text-right font-mono color-green font-bold">+737.5%</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #3</td>
        <td class="text-right font-mono">$200.00</td>
        <td class="text-right font-mono color-gold">$1,106.21 TROB</td>
        <td class="text-right font-mono color-green">+$906.21 TROB</td>
        <td class="text-right font-mono color-green font-bold">+453.1%</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #5</td>
        <td class="text-right font-mono">$240.00</td>
        <td class="text-right font-mono color-gold">$931.21 TROB</td>
        <td class="text-right font-mono color-green">+$691.21 TROB</td>
        <td class="text-right font-mono color-green font-bold">+288.0%</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #10</td>
        <td class="text-right font-mono">$270.00</td>
        <td class="text-right font-mono color-gold">$700.12 TROB</td>
        <td class="text-right font-mono color-green">+$430.12 TROB</td>
        <td class="text-right font-mono color-green font-bold">+159.3%</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #25</td>
        <td class="text-right font-mono">$288.00</td>
        <td class="text-right font-mono color-gold">$433.09 TROB</td>
        <td class="text-right font-mono color-green">+$145.09 TROB</td>
        <td class="text-right font-mono color-green font-bold">+50.4%</td>
      </tr>
      <tr>
        <td class="text-center font-bold font-mono">Seat #50</td>
        <td class="text-right font-mono">$294.00</td>
        <td class="text-right font-mono color-gold">$214.28 TROB</td>
        <td class="text-right font-mono">Recovers 73% in Phase 1</td>
        <td class="text-right font-mono font-bold color-gold">Day 22 Multiplier Activates</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== SECTION 6: DAY 22 RETAIL MATRIX ROYALTIES ==================== -->
  <h2>6. Permanent 35% Global Matrix Royalties (Day 22+ Stream)</h2>
  <p>
    While Phase 1 provides instant queue redistribution, the primary long-term wealth engine for the 100 Genesis DAO seats is the <strong>35% permanent royalty cut from the global retail matrix</strong>, which unlocks automatically on Day 22 on <code>matrix.equora.fi</code>.
  </p>
  <p>
    Across all 12 matrix tiers ($30 Slot 1 up to Slot 12), whenever <strong>Node 4, Node 5, or Node 14</strong> fills in any user's 14-node board worldwide, the smart contract routes the funds into the protocol vault:
  </p>
  <div class="math-equation" style="background:#F0FDF4; border: 1pt solid #047857;">
    Protocol Inflow Split: 35% Genesis DAO Treasury &nbsp;|&nbsp; 40% Salary Pool &nbsp;|&nbsp; 10% Magic Box &nbsp;|&nbsp; 15% Lucky Drops
  </div>

  <h3>6.1 Projected Cashflow Modeling: 100 DAO Seats Sharing 35% Retail Matrix Volume</h3>
  <p>
    Every Genesis DAO seat owns an exact <strong>1/100th equal claim</strong> on the entire 35% DAO Treasury inflow. The table below illustrates the projected passive monthly dividend per seat across realistic retail volume projections:
  </p>

  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 20%;">Global Retail Activity</th>
        <th class="text-right" style="width: 22%;">35% Monthly DAO Pool</th>
        <th class="text-right" style="width: 20%;">Monthly per Seat (1/100)</th>
        <th class="text-right" style="width: 20%;">Annual per Seat</th>
        <th class="text-right" style="width: 18%;">Effective APR ($300 Entry)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Conservative (1,000 Cycles/mo)</td>
        <td class="text-right font-mono">$35,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$350.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$4,200.00 / yr</td>
        <td class="text-right font-mono font-bold">1,400% APR</td>
      </tr>
      <tr class="highlight-row">
        <td class="font-bold">Moderate (5,000 Cycles/mo)</td>
        <td class="text-right font-mono">$175,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$1,750.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$21,000.00 / yr</td>
        <td class="text-right font-mono font-bold">7,000% APR</td>
      </tr>
      <tr>
        <td class="font-bold">Accelerated (20,000 Cycles/mo)</td>
        <td class="text-right font-mono">$700,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$7,000.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$84,000.00 / yr</td>
        <td class="text-right font-mono font-bold">28,000% APR</td>
      </tr>
      <tr>
        <td class="font-bold">Global Scale (50,000 Cycles/mo)</td>
        <td class="text-right font-mono">$1,750,000.00 TROB</td>
        <td class="text-right font-mono color-green font-bold">$17,500.00 / mo</td>
        <td class="text-right font-mono color-green font-bold">$210,000.00 / yr</td>
        <td class="text-right font-mono font-bold">70,000% APR</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 7: 5X CAP & 48H URGENCY ==================== -->
  <h2>7. Risk Architecture: 5X Earnings Cap &amp; 48-Hour Urgency Re-Topup</h2>
  <p>
    To eliminate deadweight early-mover rent extraction and guarantee eternal liquidity velocity, the protocol enforces an automated <strong>5X Earnings Cap ($1,500.00 TROB)</strong> with a strict 48-hour re-topup mechanism:
  </p>

  <pre class="ascii-diagram">
         [ CAPITAL COMMITMENT: 300 TROB ]
                         │
                         ▼
        [ ACCUMULATE DIVIDENDS: $0.00 ──► $1,500.00 (5X CAP) ]
                         │
                         ▼
        [ CAP TRIGGERED: EXACTLY AT $1,500.00 CUMULATIVE ]
                         │
         ┌───────────────┴─────────────────────────────┐
         ▼                                             ▼
  [ RE-TOPUP 300 TROB WITHIN 48H ]           [ 48-HOUR TIMER EXPIRES ]
         │                                             │
         ▼                                             ▼
  • Cap resets to $0.00 / $1,500.00             • Seat declared VACANT (isBlank = true)
  • Member keeps their Seat Index #01-#100      • Vacancy listed for public external sniper
  • HARVEST $1,200.00 NET CLEAN PROFIT          • Old wallet forfeit; new buyer claims index
  • Re-topup $300 re-enters the pool            • Original holder retains harvested $1,500
  </pre>

  <h3>7.1 Flywheel Economic Dynamics</h3>
  <ul>
    <li><strong>Predictable $1,200 Net Profit Harvesting:</strong> For each 300 TROB invested, the council member pockets $1,500 TROB gross, re-tops up 300 TROB, and walks away with <strong>$1,200 net clean profit</strong> per cycle.</li>
    <li><strong>Guaranteed Active Seats:</strong> No passive whale can freeze a seat indefinitely. If an investor goes dormant, the smart contract's automated vacancy scan immediately reallocates the seat to an active participant.</li>
    <li><strong>Perpetual Liquidity Re-injection:</strong> Every re-topup of 300 TROB triggers another round of the $300/N redistribution, ensuring that later seats continually receive dividend boosts.</li>
  </ul>

  <!-- ==================== SECTION 8: GOVERNANCE & SMART CONTRACTS ==================== -->
  <h2>8. Governance Sovereignty &amp; Smart Contract Verification</h2>
  
  <p>
    Genesis DAO members hold legal and technical sovereignty over the Equora autonomous ecosystem:
  </p>
  <ul>
    <li><strong>Soulbound ERC-721 Token:</strong> Non-transferable governance NFT minted directly to member wallets (<code>#0001</code> to <code>#0100</code>). Prevents hostile takeovers, secondary market scalping, or centralized manipulation.</li>
    <li><strong>1 Seat = 1 Vote (1.0% Sovereignty):</strong> Every seat commands an identical 1.0% vote. System parameter modifications, treasury grants, and chain bridges require a 51% council consensus.</li>
  </ul>

  <h3>8.1 Verified Smart Contract Architecture</h3>
  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 25%;">Contract Module</th>
        <th style="width: 25%;">Solidity File</th>
        <th style="width: 50%;">Verified On-Chain Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">EquoraDAO</td>
        <td class="font-mono">EquoraDAO.sol</td>
        <td>Controls 100-seat ledger, $300/N formula, 5X cap, and 48h vacancy scan.</td>
      </tr>
      <tr>
        <td class="font-bold">EquoraDAOMembership</td>
        <td class="font-mono">EquoraDAOMembership.sol</td>
        <td>Soulbound ERC-721 governance NFT. Transfer restrictions enforced on-chain.</td>
      </tr>
      <tr>
        <td class="font-bold">EquoraVault</td>
        <td class="font-mono">EquoraVault.sol</td>
        <td>Autonomous fee split: 35% DAO / 40% Salary / 10% Box / 15% Drops.</td>
      </tr>
      <tr>
        <td class="font-bold">EquoraRegistry</td>
        <td class="font-mono">EquoraRegistry.sol</td>
        <td>Resolves global 5-digit user IDs and multi-domain tree mappings.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 9: CONCLUSION & SIGN OFF ==================== -->
  <div class="no-break">
    <h2>9. Sovereign Investor Conclusion</h2>
    <p>
      The Equora Genesis DAO Council represents an unprecedented convergence of mathematical certainty, immediate capital safety, and permanent commercial royalties:
    </p>
    <ol>
      <li><strong>Asymmetric Risk/Reward:</strong> Maximum capital exposure is capped at $300.00; Seat #1 achieves 100% free entry; Seat #2 costs only $150; early queue compounding quickly covers 100% of basis.</li>
      <li><strong>Zero Debt &amp; Immutable Code:</strong> The protocol operates without debt, margin, or human administrative intermediaries. What code dictates is settled instantaneously on-chain.</li>
      <li><strong>Dual-Engine Wealth Generation:</strong> High-velocity queue redistributions in Phase 1 (Days 1–21) followed by massive permanent 35% global royalties in Phase 2 (Day 22+).</li>
    </ol>

    <div class="signature-grid">
      <div class="sig-col">
        <div><strong>AUTHORIZED BY PROTOCOL:</strong></div>
        <div class="sig-line">Equora.Fi Autonomous Governance Council</div>
        <div style="font-size: 7pt; color: #555; margin-top: 3px;">Autonomous Smart Contract Suite • Polygon / Trobium</div>
      </div>
      <div class="sig-col" style="text-align: right;">
        <div><strong>MEMORANDUM STATUS:</strong></div>
        <div class="sig-line" style="text-align: right;">Verified Production Release • 100 Seats Live</div>
        <div style="font-size: 7pt; color: #555; margin-top: 3px;">Direct On-Chain Verification: dao.equora.fi</div>
      </div>
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
  console.log(`✓ Institutional HTML written at: ${OUTPUT_HTML}`);

  console.log('🖨️ Launching Puppeteer to compile Genesis DAO Investor Whitepaper PDF...');
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
      top: '16mm',
      bottom: '18mm',
      left: '16mm',
      right: '16mm'
    }
  });

  await browser.close();
  console.log(`🎉 SUCCESS! Genesis DAO Investor Whitepaper PDF generated at: ${OUTPUT_PDF}`);
}

main().catch(err => {
  console.error('Error compiling Investor Whitepaper PDF:', err);
  process.exit(1);
});
