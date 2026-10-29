const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Resolve file paths
const ASSETS_DIR = path.join(__dirname, '../equorafidocs/docs/assets');
const OUTPUT_DIR_1 = path.join(__dirname, '../equorafidocs/docs/01_A4_Portrait_Whitepapers');
const OUTPUT_DIR_2 = path.join(__dirname, '../equorafidocs/docs');

const HTML_PATH_1 = path.join(OUTPUT_DIR_1, 'Equora_Matrix_Final_Phase_Master_Whitepaper.html');
const PDF_PATH_1 = path.join(OUTPUT_DIR_1, 'Equora_Matrix_Final_Phase_Master_Whitepaper.pdf');
const HTML_PATH_2 = path.join(OUTPUT_DIR_2, 'Equora_Matrix_Final_Phase_Master_Whitepaper.html');
const PDF_PATH_2 = path.join(OUTPUT_DIR_2, 'Equora_Matrix_Final_Phase_Master_Whitepaper.pdf');

// Helper to encode images as base64
const toBase64 = (filePath) => {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).slice(1);
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
};

async function main() {
  console.log('🏛️ Encoding Image Assets for Final Phase Matrix Whitepaper...');
  const logoImg = toBase64(path.join(ASSETS_DIR, 'equorafilogo-removebg-preview.png'));
  const daoCardImg = toBase64(path.join(ASSETS_DIR, 'dao_card.jpg'));
  const matrixSlotsImg = toBase64(path.join(ASSETS_DIR, 'matrix_slots.jpg'));
  const mysteryBoxImg = toBase64(path.join(ASSETS_DIR, 'mystery_box.jpg'));

  console.log('📝 Compiling Institutional 10-Page Master Whitepaper HTML Content...');

  const logoImgTag = logoImg ? '<img src="' + logoImg + '" alt="Equora Logo">' : '';
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Equora.Fi — Matrix System Final Phase Master Whitepaper & Architectural Roadmap</title>
<style>
  @page {
    size: A4 portrait;
    margin: 8mm 10mm 10mm 10mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #FFFFFF;
    color: #0F172A;
    font-size: 7.8pt;
    line-height: 1.36;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 100%;
    height: 278mm;
    position: relative;
    page-break-after: always;
    page-break-inside: avoid;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .page:last-child {
    page-break-after: auto;
  }

  /* Header & Footer */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #0F172A;
    padding-bottom: 4px;
    margin-bottom: 6px;
  }
  .doc-header .brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .doc-header img {
    height: 19px;
    object-fit: contain;
  }
  .doc-header .doc-title-mini {
    font-size: 7.3pt;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .doc-header .doc-meta {
    font-size: 6.8pt;
    color: #475569;
    font-weight: 600;
  }
  .doc-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #CBD5E1;
    padding-top: 4px;
    margin-top: 5px;
    font-size: 6.6pt;
    color: #64748B;
  }

  /* Typography */
  h1 {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 3px;
    letter-spacing: -0.3px;
  }
  h2 {
    font-size: 10pt;
    font-weight: 700;
    color: #0F172A;
    margin-top: 5px;
    margin-bottom: 3px;
    border-left: 3px solid #0284C7;
    padding-left: 6px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }
  h3 {
    font-size: 8.3pt;
    font-weight: 700;
    color: #1E293B;
    margin-top: 4px;
    margin-bottom: 2px;
  }
  p {
    font-size: 7.6pt;
    line-height: 1.34;
    color: #334155;
    margin-bottom: 3.5px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0 6px 0;
    font-size: 7.1pt;
  }
  th {
    background: #0F172A;
    color: #FFFFFF;
    font-weight: 700;
    text-align: left;
    padding: 3.5px 5.5px;
    border: 1px solid #0F172A;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-size: 6.7pt;
  }
  td {
    padding: 3.2px 5.5px;
    border: 1px solid #CBD5E1;
    color: #1E293B;
    vertical-align: middle;
  }
  tr:nth-child(even) td {
    background: #F8FAFC;
  }
  .highlight-cell {
    font-weight: 700;
    color: #0369A1;
  }
  .badge-cell {
    font-weight: 700;
    background: #F0FDF4;
    color: #15803D;
  }
  .alert-cell {
    font-weight: 700;
    background: #FEF2F2;
    color: #B91C1C;
  }

  /* Callouts & Cards */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    margin: 4px 0;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin: 4px 0;
  }
  .grid-4 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 5px;
    margin: 4px 0;
  }
  .card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 5px 7px;
  }
  .card-navy {
    background: #0F172A;
    color: #FFFFFF;
    border: 1px solid #1E293B;
    border-radius: 4px;
    padding: 7px 9px;
  }
  .card-navy h3 {
    color: #38BDF8;
  }
  .card-navy p {
    color: #E2E8F0;
  }
  .card-blue {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 4px;
    padding: 5px 7px;
  }
  .card-emerald {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 4px;
    padding: 5px 7px;
  }
  .card-amber {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 4px;
    padding: 5px 7px;
  }

  .formula-box {
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    border-left: 3px solid #0284C7;
    border-radius: 3px;
    padding: 4px 7px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 7.1pt;
    color: #0F172A;
    margin: 3px 0 5px 0;
  }

  .watermark-banner {
    background: #0F172A;
    color: #FFFFFF;
    padding: 3.5px 7px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 3px;
    margin-bottom: 5px;
    font-size: 6.6pt;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .watermark-banner span.brand {
    color: #38BDF8;
  }

  /* Visual Diagrams */
  .diagram-container {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 6px 8px;
    margin: 4px 0;
    text-align: center;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 7pt;
    line-height: 1.3;
    color: #1E293B;
  }
</style>
</head>
<body>

<!-- ======================================================================= -->
<!-- PAGE 1: COVER PAGE & EXECUTIVE TITLE BLOCK                             -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="watermark-banner">
      <span>SOVEREIGN ENTERPRISE SPECIFICATION • PARENT BRAND: <span class="brand">LEXVRA</span></span>
      <span>NETWORK: TROBIUM L1 • SPEC VERSION: 5.1.0 FINAL</span>
    </div>

    <div class="doc-header" style="margin-bottom: 10px; border-bottom: 2px solid #0F172A; padding-bottom: 6px;">
      <div class="brand">
        ${logoImgTag}
        <span style="font-size: 13pt; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">EQUORA<span style="color:#0284C7;">.FI</span></span>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 8.5pt; font-weight: 800; color: #0F172A;">FINAL PHASE MASTER WHITEPAPER</div>
        <div style="font-size: 7.2pt; color: #64748B;">COMPLETE ARCHITECTURAL ROADMAP, MATRIX MATH & MONEY FLOW</div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #0A192F 0%, #0F172A 60%, #0284C7 100%); color: #FFFFFF; border-radius: 6px; padding: 14px 18px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(2,132,199,0.15);">
      <div style="font-size: 7.6pt; font-weight: 700; color: #38BDF8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px;">
        EXECUTIVE ARCHITECTURAL BLUEPRINT • CONFIDENTIAL STRATEGIC GUIDE FOR CORE TEAM & LEADERS
      </div>
      <h1 style="color: #FFFFFF; font-size: 16pt; font-weight: 900; line-height: 1.2; margin-bottom: 5px; letter-spacing: -0.5px;">
        EQUORA.FI MATRIX ENGINE & 4 AUTOMATED PROTOCOL POOLS
      </h1>
      <div style="font-size: 8.6pt; color: #E2E8F0; font-weight: 500; line-height: 1.38; max-width: 96%;">
        The Definitive Peer-to-Peer Mathematical Blueprint: 14-Node Single-Leg Board Anatomy, 12 Progressive Matrix Tiers, Dedicated Single-Tier Monthly Salaries (No Stacking), Scarcity-Locked Genesis DAO Yields, and 100% Non-Custodial Money Routing.
      </div>
    </div>

    <div class="grid-3" style="margin-bottom: 8px;">
      <div class="card">
        <div style="font-size: 6.6pt; color: #64748B; font-weight: 700; text-transform: uppercase;">BLOCKCHAIN SETTLEMENT</div>
        <div style="font-size: 8.8pt; font-weight: 800; color: #0F172A; margin: 1px 0;">Trobium Layer-1</div>
        <div style="font-size: 7pt; color: #475569;">10,000+ TPS • 400ms Sub-second Finality • $0.0001 Gas</div>
      </div>
      <div class="card">
        <div style="font-size: 6.6pt; color: #64748B; font-weight: 700; text-transform: uppercase;">SETTLEMENT CURRENCY</div>
        <div style="font-size: 8.8pt; font-weight: 800; color: #0284C7; margin: 1px 0;">Liquid TROB Coin</div>
        <div style="font-size: 7pt; color: #475569;">Live Chainlink-compatible Oracle Pegged to USD Values</div>
      </div>
      <div class="card">
        <div style="font-size: 6.6pt; color: #64748B; font-weight: 700; text-transform: uppercase;">CLIENT INTEGRATION</div>
        <div style="font-size: 8.8pt; font-weight: 800; color: #0F172A; margin: 1px 0;">Trobsafe Non-Custodial</div>
        <div style="font-size: 7pt; color: #475569;">Zero-Knowledge • Biometric Secure Enclave • Direct Push</div>
      </div>
    </div>

    <h2>1. Executive Summary & Document Purpose</h2>
    <p>
      This master whitepaper is compiled for the core development team, tokenomics advisors, and founding leadership council of <strong>Equora.Fi</strong>, engineered under the sovereign stewardship of <strong>LEXVRA</strong>. It establishes the single source of truth for the complete final phase deployment across our entire ecosystem: the 14-Node Single-Leg Matrix, all 12 Board Tiers, the 4 Automated Protocol Pools, and the exact cryptographic accounting of capital.
    </p>
    <p>
      Equora.Fi permanently eliminates the chronic vulnerabilities of legacy crypto networking: <strong>zero corporate custody, zero admin backdoors, zero withdrawal queues, and zero static Ponzi ROI</strong>. Exactly 100.00% of every incoming dollar is programmatically transferred to member wallets and automated community pools in the very same block execution.
    </p>

    <h2>2. Table of Contents & Navigation</h2>
    <table style="margin-top: 3px;">
      <thead>
        <tr>
          <th style="width: 12%;">Section</th>
          <th style="width: 38%;">Chapter Title</th>
          <th style="width: 50%;">Core Content & Engineering Deliverables</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="highlight-cell">Section I</td>
          <td><strong>The Core Thesis & 6 Immutable Guarantees</strong></td>
          <td>Problem statement, legacy platform autopsy, zero-admin architecture, 5-digit referral ID engine.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section II</td>
          <td><strong>Master 3-Phase Roadmap & Readiness Audit</strong></td>
          <td>Phase 1 Genesis DAO (Live), Phase 2 Matrix Engine Core, Phase 3 Global Launch, What We Have vs What We Need.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section III</td>
          <td><strong>The 14-Node Single-Leg Matrix Engine</strong></td>
          <td>Geometry, tree topology, 600% cash ROI mechanics, 3-tier board breakdown, Node-by-Node routing rules.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section IV</td>
          <td><strong>The 12 Progressive Matrix Board Tiers</strong></td>
          <td>$30 to $61,440 slots, $30 lifetime out-of-pocket invariant, Node 5 free auto-upgrade, 2-referral qualification.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section V</td>
          <td><strong>The 4 Automated Protocol Pools</strong></td>
          <td>Nodes 4, 5, 14 inflows, 40% Salary (11th monthly, single-tier allocation), 35% Genesis DAO, 15% Rewards, 10% Blind Box.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section VI</td>
          <td><strong>Complete Flow of Funds & Money Accounting</strong></td>
          <td>End-to-end money routing, mathematical proof of conservation, multi-currency oracle settlement.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section VII</td>
          <td><strong>Financial Projections & Real-World Models</strong></td>
          <td>Case studies on $100K & $1M volume, single-tier salary distribution math, Genesis DAO $1,500 5X cyclic dividend model.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section VIII</td>
          <td><strong>Security, Anti-Sybil & Governance Engine</strong></td>
          <td>Hardware device fingerprinting, 48h retopup, sequential vacancy scan (1–100), renounced ownership.</td>
        </tr>
        <tr>
          <td class="highlight-cell">Section IX</td>
          <td><strong>Execution Checklist & Team Action Plan</strong></td>
          <td>Immediate technical deliverables, deployment sequence, contract addresses, and launch timetable.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 1 OF 10 • EXECUTIVE OVERVIEW & COVER</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 2: PROTOCOL THESIS, THE PROBLEM & 6 IMMUTABLE GUARANTEES           -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION I: PROTOCOL THESIS & 6 UNBREAKABLE GUARANTEES</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. The Problem Statement: Forensic Analysis of Legacy Failure</h2>
    <p>
      For over two decades, direct network distribution models and matrix algorithms have promised financial freedom. However, over <strong>90% of all centralized platforms collapse, rug, or freeze within 18 months of inception</strong>. Through forensic auditing of historical smart contracts, LEXVRA identified the 6 fatal structural vectors responsible for 100% of these collapses:
    </p>

    <div class="grid-2">
      <div class="card" style="border-left: 3px solid #EF4444;">
        <h3 style="color: #B91C1C;">1. Admin Control & Backdoor Rug-Pulls</h3>
        <p>Centralized founders hold private keys or deploy upgradable proxy smart contracts (UUPS). When platform reserves peak, rogue admins alter the code, drain liquidity, and exit-scam.</p>
      </div>
      <div class="card" style="border-left: 3px solid #EF4444;">
        <h3 style="color: #B91C1C;">2. Hidden Platform Fees & Corporate Skimming</h3>
        <p>Platforms advertise "100% payouts" while secretly deducting 10% to 30% through gas fees, withdrawal surcharges, compulsory subscription renewal fees, and administrative margins.</p>
      </div>
      <div class="card" style="border-left: 3px solid #EF4444;">
        <h3 style="color: #B91C1C;">3. Artificial Caps & Flush-Out Rules</h3>
        <p>Operators impose daily, weekly, or rank-based income caps. Hard-working leaders who generate massive team volume see excess earnings "flushed" into the company bank account.</p>
      </div>
      <div class="card" style="border-left: 3px solid #EF4444;">
        <h3 style="color: #B91C1C;">4. Manual Withdrawal Queues & Delays</h3>
        <p>Users must submit withdrawal requests and wait 48 hours to 21 business days. Admins use this delay as a liquidity choke point, selectively freezing accounts of outspoken members.</p>
      </div>
      <div class="card" style="border-left: 3px solid #EF4444;">
        <h3 style="color: #B91C1C;">5. Fake Static ROI Ponzi Insolvency</h3>
        <p>Centralized schemes lure users with promises of "1% daily passive return." With zero real economic utility, the moment new user onboarding slows, mathematical insolvency triggers instant death.</p>
      </div>
      <div class="card" style="border-left: 3px solid #EF4444;">
        <h3 style="color: #B91C1C;">6. Centralized Database Censorship</h3>
        <p>User accounts and downline hierarchies exist on private SQL/MongoDB databases. A disgruntled admin can delete a leader’s genealogy tree or reassign referrals with a single keystroke.</p>
      </div>
    </div>

    <h2>2. The Equora.Fi Solution: 6 Unbreakable Code-Is-Law Guarantees</h2>
    <p>
      Equora.Fi, engineered by <strong>LEXVRA</strong>, permanently eliminates corporate counterparty risk by hardcoding 6 immutable guarantees directly into Solidity bytecode deployed on the immutable ledger of Trobium:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Immutable Guarantee</th>
          <th style="width: 35%;">Smart Contract Architecture</th>
          <th style="width: 40%;">User Benefit & Operational Reality</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="badge-cell">1. NO ADMIN</td>
          <td>Smart contract ownership is permanently renounced (<code>owner = address(0)</code>). Zero upgradable proxies.</td>
          <td>Zero centralized backdoors. No human, executive, or state entity can pause, freeze, or alter contract rules.</td>
        </tr>
        <tr>
          <td class="badge-cell">2. NO FEES</td>
          <td>Exactly 0.00% platform commission hardcoded in math. Zero withdrawal fees, zero maintenance deductions.</td>
          <td>100% of every dollar deposited is redistributed to participants and community protocol pools in real time.</td>
        </tr>
        <tr>
          <td class="badge-cell">3. NO CAPPING</td>
          <td>Zero daily, weekly, or monthly income caps on the matrix board. Unlimited cycling permitted.</td>
          <td>A leader can cycle a matrix board 100 times in 24 hours and collect 100% of commissions with zero flush-out.</td>
        </tr>
        <tr>
          <td class="badge-cell">4. NOT AN INVESTMENT</td>
          <td>Zero static daily ROI promises. Zero speculative capital lockup. 100% mathematical peer-to-peer distribution.</td>
          <td>Completely immune to Ponzi insolvency. Capital moves strictly based on verifiable on-chain matrix progression.</td>
        </tr>
        <tr>
          <td class="badge-cell">5. FULLY WORKING</td>
          <td>100% production-ready bytecode compiled on Solidity 0.8.20+, tested and live on Trobium blockchain.</td>
          <td>Not an unreleased concept paper. Full contract suite is operational, verified on explorer, and verified in CI.</td>
        </tr>
        <tr>
          <td class="badge-cell">6. FULLY DECENTRALIZED</td>
          <td>State transitions execute inside EVM blocks. Zero reliance on central servers or off-chain APIs for payouts.</td>
          <td>Protocol operates indefinitely as long as Trobium validator nodes produce blocks. Permanent digital life.</td>
        </tr>
      </tbody>
    </table>

    <h2>3. The Frictionless 5-Digit Referral Standard (<code>EquoraRegistry.sol</code>)</h2>
    <p>
      In legacy Web3 dApps, users are forced to share cumbersome 42-character hex addresses (e.g. <code>0x71C8...3B9a</code>), causing a <strong>40%+ drop-off rate</strong> during user acquisition. Equora.Fi deploys an on-chain identity registry:
    </p>
    <div class="formula-box">
      EquoraRegistry.sol: Bidirectional Mapping: UserID (uint256, e.g., #10482) &lt;===&gt; Address (42-char Hex / Trobium Base58)
    </div>
    <p>
      When inviting new members, sponsors verbally share their memorable 5-digit code (e.g. <em>"Enter Sponsor Code 10482"</em>). The smart contract automatically resolves the address and places the new node under the correct sponsor hierarchy on-chain.
    </p>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 2 OF 10 • PROTOCOL THESIS & 6 IMMUTABLE GUARANTEES</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 3: THE COMPLETE MASTER ROADMAP (PHASE 1, 2, 3) & READINESS AUDIT  -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION II: 3-PHASE ROADMAP & ARCHITECTURAL READINESS</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. The 3-Phase Strategic Rollout Architecture</h2>
    <p>
      The architecture of Equora.Fi follows a disciplined 3-phase progression engineered to establish governance, build institutional capital reserves, deploy the automated matrix core, and execute global retail onboarding:
    </p>

    <div class="card-navy" style="margin-bottom: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 3px; margin-bottom: 4px;">
        <span style="font-weight: 800; font-size: 8.3pt; color: #38BDF8;">PHASE 1: GENESIS COUNCIL DAO (CURRENT LIVE STATE — 100% COMPLETE & VERIFIED)</span>
        <span style="background: #0284C7; color: #FFFFFF; font-size: 6.6pt; font-weight: 700; padding: 2px 6px; border-radius: 2px;">STATUS: PRODUCTION VERIFIED</span>
      </div>
      <p style="font-size: 7.4pt; color: #E2E8F0; margin-bottom: 3px;">
        <strong>Strategic Objective:</strong> Establish the 100 founding Council leaders through exclusive scarcity seats ($300 USD), minting non-transferable Soulbound ERC-721 Passports, and validating on-chain payout velocity before public retail entry.
      </p>
      <div style="font-size: 7.1pt; color: #94A3B8; line-height: 1.35;">
        • <strong>100 Scarcity Seats:</strong> Strictly capped at 100 seats (<code>maxSeats = 100</code>). Zero referrals required to join.<br>
        • <strong>Queue Push Waterfall:</strong> Incoming deposits distributed immediately to preceding members via formula <code>$300 / (N - 1)</code>.<br>
        • <strong>Universal 5X Cap Engine:</strong> Every seat hard-capped at $1,500 cumulative earnings; triggers an automated 48-hour retopup window ($300).<br>
        • <strong>Sequential Vacancy Scan:</strong> Un-topped expired seats forfeit and reopen for sequential queue claim (Seat #1 to #100).<br>
        • <strong>Neon Postgres Sync:</strong> Dual real-time blockchain event listener synchronizing contract state with Web3 UI.
      </div>
    </div>

    <div class="card-blue" style="margin-bottom: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #BAE6FD; padding-bottom: 3px; margin-bottom: 4px;">
        <span style="font-weight: 800; font-size: 8.3pt; color: #0284C7;">PHASE 2: MATRIX ENGINE CORE & 4 PROTOCOL POOLS (IMMEDIATE ENGINEERING TARGET)</span>
        <span style="background: #D97706; color: #FFFFFF; font-size: 6.6pt; font-weight: 700; padding: 2px 6px; border-radius: 2px;">STATUS: IN-DEVELOPMENT SPECIFICATION</span>
      </div>
      <p style="font-size: 7.4pt; color: #1E293B; margin-bottom: 3px;">
        <strong>Strategic Objective:</strong> Deploy the 14-Node Single-Leg Matrix Engine smart contracts, connect the 4 Automated Protocol Pools via <code>EquoraVault.sol</code>, and configure automated Chainlink keepers for monthly salary distributions.
      </p>
      <div style="font-size: 7.1pt; color: #334155; line-height: 1.35;">
        • <strong>Contract Deployment:</strong> Deploy <code>EquoraMatrix.sol</code> and <code>EquoraVault.sol</code> on Trobium Blockchain.<br>
        • <strong>Automated Vault Routing:</strong> Hardcode Node 4, 5, 14 inflows into 40% Salary, 35% DAO, 15% Rewards, and 10% Magic Box pools.<br>
        • <strong>Dedicated Single-Tier Salary Logic:</strong> Enforce strictly non-stacked 25% pool slice dispatches per qualified leadership rank.<br>
        • <strong>Chainlink Automation:</strong> Schedule recurring keeper jobs for the 11th-of-month salary releases and 91-day Magic Blind Box timers.
      </div>
    </div>

    <div class="card" style="margin-bottom: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-bottom: 4px;">
        <span style="font-weight: 800; font-size: 8.3pt; color: #475569;">PHASE 3: GLOBAL RETAIL MATRIX LAUNCH & LIQUIDITY EXPANSION</span>
        <span style="background: #64748B; color: #FFFFFF; font-size: 6.6pt; font-weight: 700; padding: 2px 6px; border-radius: 2px;">STATUS: FINAL STAGE EXECUTION</span>
      </div>
      <p style="font-size: 7.4pt; color: #475569; margin-bottom: 3px;">
        <strong>Strategic Objective:</strong> Unlock public $30 Slot 1 registration worldwide, stream 35% global pool volume directly into Genesis DAO Council wallets, establish high-depth DEX liquidity, and scale Trobsafe dApp integrations.
      </p>
      <div style="font-size: 7.1pt; color: #64748B; line-height: 1.35;">
        • <strong>Public Registration Launch:</strong> Open Slot 1 ($30) global entry; activate 2-referral qualification engine.<br>
        • <strong>Perpetual DAO Dividend Pipeline:</strong> Genesis DAO members receive continuous 35% matrix volume dividends.<br>
        • <strong>Trobsafe Mobile Integration:</strong> Feature Equora.Fi natively in Trobsafe mobile wallet dApp browser with biometric 1-tap sign.<br>
        • <strong>Global Multi-Language Campaign:</strong> Onboard 50,000+ active participants across Asia, Latin America, Europe, and Africa.
      </div>
    </div>

    <h2>2. Technical Readiness Audit: "What We Have" vs. "What We Need"</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Subsystem Component</th>
          <th style="width: 38%;">Current Production State (What We Have)</th>
          <th style="width: 37%;">Final Phase Deliverables (What We Need)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Genesis DAO Council Engine</strong></td>
          <td class="badge-cell">✓ Fully Working on TrobChain (100 Seats, 5X Cap, 48h Retopup)</td>
          <td>Connect live 35% matrix dividend stream from <code>EquoraVault.sol</code>.</td>
        </tr>
        <tr>
          <td><strong>Anti-Sybil & Identity</strong></td>
          <td class="badge-cell">✓ Hardware Fingerprinting & Soulbound NFT Passports</td>
          <td>Extend 5-digit referral registry (<code>EquoraRegistry.sol</code>) to retail matrix.</td>
        </tr>
        <tr>
          <td><strong>14-Node Matrix Smart Contracts</strong></td>
          <td style="color: #D97706; font-weight: 700;">In Progress (Mathematical Spec Finalized)</td>
          <td>Deploy <code>EquoraMatrix.sol</code> and compile on Trobium Layer-1.</td>
        </tr>
        <tr>
          <td><strong>4 Automated Protocol Pools</strong></td>
          <td style="color: #D97706; font-weight: 700;">In Progress (Architecture Finalized)</td>
          <td>Deploy <code>EquoraVault.sol</code>; link automated Chainlink keepers.</td>
        </tr>
        <tr>
          <td><strong>Database & Event Indexer</strong></td>
          <td class="badge-cell">✓ Neon Serverless Postgres & WebSocket Block Listener</td>
          <td>Add schema models for 12 matrix tiers, downlines, and salary logs.</td>
        </tr>
        <tr>
          <td><strong>Frontend Portal (<code>apps/web-dao</code>)</strong></td>
          <td class="badge-cell">✓ Full Next.js 14 Web Portal Deployed on Utho VM</td>
          <td>Activate Matrix visualization boards and Tree Inspector interfaces.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 3 OF 10 • MASTER ROADMAP & READINESS AUDIT</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 4: THE 14-NODE SINGLE-LEG MATRIX ENGINE ARCHITECTURE               -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION III: 14-NODE SINGLE-LEG MATRIX ENGINE</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. The 14-Node Matrix Geometry & Tree Anatomy</h2>
    <p>
      The core peer-to-peer economic engine of Equora.Fi is the <strong>14-Node Single-Leg Compressed Matrix Board</strong> (<code>EquoraMatrix.sol</code>). Unlike traditional binary systems that suffer from leg imbalance, orphaned downlines, and stalled volume, Equora.Fi uses an elegant 3-tier compressed board under the board owner:
    </p>

    <div class="diagram-container">
      <div style="font-weight: 800; color: #0284C7; margin-bottom: 4px;">=== 14-NODE BOARD VISUAL TOPOLOGY ===</div>
                                    [ YOU (Board Owner) ]
                                          /       \\
                                      [ P1 ]     [ P2 ]             <-- Row 1: 2 Nodes (Mentorship Payout)
                                     /    \\       /    \\
                                 [ P3 ]  [ P4 ] [ P5 ]  [ P6 ]      <-- Row 2: 4 Nodes (Cash, Pools, Auto-Upgrade)
                                 /  \\    /  \\   /  \\    /  \\
                                P7  P8  P9 P10 P11 P12 P13 P14     <-- Row 3: 8 Nodes (Cash, Spillover, Recycle)
      <div style="font-size: 6.8pt; color: #64748B; margin-top: 3px;">Gross Inflow per Slot 1 Board: 14 Nodes × $30.00 = $420.00 Total Volume</div>
    </div>

    <h2>2. Exact Node-by-Node Destination & Accounting Rules</h2>
    <p>
      Every single dollar entering a 14-node board is routed by smart contract logic with zero administrative leakage:
    </p>

    <div class="grid-2">
      <div class="card-emerald">
        <h3 style="color: #15803D;">1. DIRECT CASH TO OWNER: $180.00 (600% ROI)</h3>
        <p>Exactly <strong>6 Nodes</strong> pay 100% direct cash ($30 × 6 = $180.00) straight into the board owner's private Trobsafe wallet on <strong>EVERY SINGLE CYCLE FOREVER</strong>:</p>
        <div style="font-size: 7.1pt; color: #166534; line-height: 1.34;">
          • <strong>Node P3 ($30.00):</strong> Instant 100% Capital Recovery on the first Row 2 seat!<br>
          • <strong>Node P6 ($30.00):</strong> Direct Cash to Trobsafe Wallet.<br>
          • <strong>Node P8 ($30.00):</strong> Direct Cash to Trobsafe Wallet.<br>
          • <strong>Node P9 ($30.00):</strong> Direct Cash to Trobsafe Wallet.<br>
          • <strong>Node P11 ($30.00):</strong> Direct Cash to Trobsafe Wallet.<br>
          • <strong>Node P12 ($30.00):</strong> Direct Cash to Trobsafe Wallet.<br>
          <strong>Total Immediate Take-Home: $180.00 (600% Net ROI).</strong>
        </div>
      </div>

      <div class="card-blue">
        <h3 style="color: #0369A1;">2. PROTOCOL POOLS & RECYCLE: $90.00</h3>
        <p>Exactly <strong>3 Nodes</strong> route 100% ($30 × 3 = $90.00) to <code>EquoraVault.sol</code> to fund the 4 automated pools:</p>
        <div style="font-size: 7.1pt; color: #075985; line-height: 1.34;">
          • <strong>Node P4 ($30.00):</strong> 100% directly funds the 4 Protocol Pools.<br>
          • <strong>Node P5 ($30.00):</strong> Funds 4 Pools + <em>Auto-Upgrades owner to Slot 2 ($60) for FREE on Cycle 1</em>.<br>
          • <strong>Node P14 ($30.00):</strong> Funds 4 Pools + <em>Infinite Recycle (clears board, opens fresh cycle)</em>.<br>
          <strong>Total Protocol Fuel: $90.00 per completed board worldwide.</strong>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 3px;">
      <div class="card">
        <h3>3. Upline Mentorship Rewards: $60.00</h3>
        <p>• <strong>Node P1 ($30.00):</strong> Paid instantly to Upline 1 (direct sponsor).<br>
        • <strong>Node P2 ($30.00):</strong> Paid instantly to Upline 2 (second-generation mentor).<br>
        <strong>Total Mentorship: $60.00 (14.28% of board volume).</strong></p>
      </div>

      <div class="card">
        <h3>4. Downline Team Spillover: $90.00</h3>
        <p>• <strong>Nodes P7, P10, P13 ($30.00 each = $90.00):</strong> Injected into downline matrix legs as spillover placements, accelerating downline progression.<br>
        <strong>Total Downline Spillover: $90.00 (21.43% of board volume).</strong></p>
      </div>
    </div>

    <h2>3. Complete Mathematical Audit Table (Slot 1: $420.00 Gross Inflow)</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 12%;">Node Position</th>
          <th style="width: 25%;">Destination Category</th>
          <th style="width: 15%;">Dollar Amount</th>
          <th style="width: 15%;">Board Ratio</th>
          <th style="width: 33%;">Smart Contract Functional Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700;">Node P1</td>
          <td>Upline Mentorship</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Direct transfer to Upline 1 sponsor wallet</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Node P2</td>
          <td>Upline Mentorship</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Direct transfer to Upline 2 mentor wallet</td>
        </tr>
        <tr class="badge-cell">
          <td>Node P3</td>
          <td>Owner Net Cash</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Instant 100% Capital Recovery (Break-even achieved)</td>
        </tr>
        <tr>
          <td style="font-weight: 700; color: #0284C7;">Node P4</td>
          <td>4 Protocol Pools</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Transferred to <code>EquoraVault.sol</code> for community pools</td>
        </tr>
        <tr style="background: #F0F9FF;">
          <td style="font-weight: 700; color: #0284C7;">Node P5</td>
          <td>4 Pools + Auto-Upgrade</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Funds pools + Auto-purchases Slot 2 ($60) for free on Cycle 1</td>
        </tr>
        <tr class="badge-cell">
          <td>Node P6</td>
          <td>Owner Net Cash</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Paid directly into owner's Trobsafe wallet</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Node P7</td>
          <td>Downline Spillover</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Spillover placement assisting downline organization</td>
        </tr>
        <tr class="badge-cell">
          <td>Node P8</td>
          <td>Owner Net Cash</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Paid directly into owner's Trobsafe wallet</td>
        </tr>
        <tr class="badge-cell">
          <td>Node P9</td>
          <td>Owner Net Cash</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Paid directly into owner's Trobsafe wallet</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Node P10</td>
          <td>Downline Spillover</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Spillover placement assisting downline organization</td>
        </tr>
        <tr class="badge-cell">
          <td>Node P11</td>
          <td>Owner Net Cash</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Paid directly into owner's Trobsafe wallet</td>
        </tr>
        <tr class="badge-cell">
          <td>Node P12</td>
          <td>Owner Net Cash</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Paid directly into owner's Trobsafe wallet</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Node P13</td>
          <td>Downline Spillover</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Spillover placement assisting downline organization</td>
        </tr>
        <tr style="background: #FFFBEB;">
          <td style="font-weight: 700; color: #D97706;">Node P14</td>
          <td>4 Pools + Board Recycle</td>
          <td>$30.00</td>
          <td>7.14%</td>
          <td>Funds pools + Resets board to 0 for infinite replay</td>
        </tr>
        <tr style="background: #0F172A; color: #FFFFFF; font-weight: 800;">
          <td colspan="2" style="color: #FFFFFF;">TOTALS (14 NODES)</td>
          <td style="color: #38BDF8;">$420.00</td>
          <td style="color: #FFFFFF;">100.0%</td>
          <td style="color: #4ADE80;">$180 Cash (600% ROI) + $90 Pools + $60 Upline + $90 Spillover</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 4 OF 10 • 14-NODE SINGLE-LEG MATRIX ENGINE ARCHITECTURE</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 5: THE 12 PROGRESSIVE MATRIX SLOTS & AUTO-UPGRADE MECHANICS        -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION IV: 12 PROGRESSIVE MATRIX TIERS & AUTO-UPGRADE</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. The $30 Lifetime Out-of-Pocket Invariant</h2>
    <p>
      The greatest psychological barrier in retail networking is the constant demand for ongoing capital injections. Equora.Fi permanently eliminates this barrier through an immutable mathematical invariant:
    </p>
    <div class="formula-box" style="text-align: center; font-size: 8.3pt; font-weight: 800; color: #0284C7;">
      TOTAL LIFETIME OUT-OF-POCKET EXPENDITURE = $30.00 ONE-TIME ONLY
    </div>
    <p>
      Every single higher slot (Slots 2 through 12) is <strong>100% self-funded from matrix profit velocity</strong>. When a participant completes Cycle 1 of any slot, the smart contract utilizes the value of <strong>Node P5</strong> to automatically fund, activate, and unlock the next slot level for <strong>FREE</strong> without touching the user's external wallet.
    </p>

    <h2>2. Master Schedule of All 12 Progressive Matrix Levels</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 7%;">Tier</th>
          <th style="width: 12%;">Slot Level</th>
          <th style="width: 17%;">Out-of-Pocket Entry</th>
          <th style="width: 14%;">Slot Value</th>
          <th style="width: 16%;">Direct Cash / Cycle</th>
          <th style="width: 16%;">Pools Funding / Cycle</th>
          <th style="width: 18%;">Auto-Upgrade Target (Cycle 1)</th>
        </tr>
      </thead>
      <tbody>
        <tr class="badge-cell">
          <td>1</td>
          <td>Slot 1</td>
          <td><strong>$30.00 (One-Time)</strong></td>
          <td>$30.00</td>
          <td><strong>$180.00</strong></td>
          <td>$90.00</td>
          <td>Unlocks Slot 2 ($60) for FREE</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Slot 2</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$60.00</td>
          <td class="highlight-cell">$360.00</td>
          <td>$180.00</td>
          <td>Unlocks Slot 3 ($120) for FREE</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Slot 3</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$120.00</td>
          <td class="highlight-cell">$720.00</td>
          <td>$360.00</td>
          <td>Unlocks Slot 4 ($240) for FREE</td>
        </tr>
        <tr>
          <td>4</td>
          <td>Slot 4</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$240.00</td>
          <td class="highlight-cell">$1,440.00</td>
          <td>$720.00</td>
          <td>Unlocks Slot 5 ($480) for FREE</td>
        </tr>
        <tr>
          <td>5</td>
          <td>Slot 5</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$480.00</td>
          <td class="highlight-cell">$2,880.00</td>
          <td>$1,440.00</td>
          <td>Unlocks Slot 6 ($960) for FREE</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Slot 6</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$960.00</td>
          <td class="highlight-cell">$5,760.00</td>
          <td>$2,880.00</td>
          <td>Unlocks Slot 7 ($1,920) for FREE</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Slot 7</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$1,920.00</td>
          <td class="highlight-cell">$11,520.00</td>
          <td>$5,760.00</td>
          <td>Unlocks Slot 8 ($3,840) for FREE</td>
        </tr>
        <tr>
          <td>8</td>
          <td>Slot 8</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$3,840.00</td>
          <td class="highlight-cell">$23,040.00</td>
          <td>$11,520.00</td>
          <td>Unlocks Slot 9 ($7,680) for FREE</td>
        </tr>
        <tr>
          <td>9</td>
          <td>Slot 9</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$7,680.00</td>
          <td class="highlight-cell">$46,080.00</td>
          <td>$23,040.00</td>
          <td>Unlocks Slot 10 ($15,360) for FREE</td>
        </tr>
        <tr>
          <td>10</td>
          <td>Slot 10</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$15,360.00</td>
          <td class="highlight-cell">$92,160.00</td>
          <td>$46,080.00</td>
          <td>Unlocks Slot 11 ($30,720) for FREE</td>
        </tr>
        <tr>
          <td>11</td>
          <td>Slot 11</td>
          <td>$0.00 (Auto-Unlocked)</td>
          <td>$30,720.00</td>
          <td class="highlight-cell">$184,320.00</td>
          <td>$92,160.00</td>
          <td>Unlocks Slot 12 ($61,440) for FREE</td>
        </tr>
        <tr style="background: #0F172A; color: #FFFFFF; font-weight: 800;">
          <td style="color: #38BDF8;">12</td>
          <td style="color: #38BDF8;">Slot 12</td>
          <td style="color: #FFFFFF;">$0.00 (Auto-Unlocked)</td>
          <td style="color: #FFFFFF;">$61,440.00</td>
          <td style="color: #4ADE80;">$368,640.00</td>
          <td style="color: #38BDF8;">$184,320.00</td>
          <td style="color: #FACC15;">PINNACLE CROWN TIER</td>
        </tr>
      </tbody>
    </table>

    <h2>3. The 2-Referral Qualification Rule & Team Compression</h2>
    <div class="grid-2">
      <div class="card">
        <h3>The 2-Direct-Referral Engine Rule</h3>
        <p>To qualify for automatic level upgrades and receive monthly dividends from the 4 Protocol Pools, a participant must have personally registered at least <strong>2 active direct referrals</strong> in Slot 1 (<code>directReferrals &gt;= 2</code>).</p>
        <p><strong>Anti-Parasite Rationale:</strong> This rule prevents passive, non-productive wallets from absorbing community capital while ensuring exponential viral network growth.</p>
      </div>
      <div class="card">
        <h3>"Follow-Me" Infinite Re-Cycling</h3>
        <p>Whenever a participant cycles their board via Node P14, they re-enter their sponsor's active board in the next open position. As downline members complete boards, they follow their original sponsor infinitely.</p>
        <p><strong>Parallel Income:</strong> A member who has reached Slot 6 continues cycling Slots 1, 2, 3, 4, and 5 simultaneously, compounding cash flows.</p>
      </div>
    </div>

    <h2>4. Cumulative Earning Potential on 1 Full Pass (Slots 1 to 12)</h2>
    <div class="card-blue">
      <p style="font-size: 7.8pt; font-weight: 700; color: #0369A1; margin-bottom: 2px;">
        TOTAL CASH GENERATED FROM JUST A SINGLE CYCLE OF ALL 12 TIERS:
      </p>
      <div style="font-size: 10.5pt; font-weight: 900; color: #0F172A; margin: 2px 0;">
        $180 + $360 + $720 + $1,440 + $2,880 + $5,760 + $11,520 + $23,040 + $46,080 + $92,160 + $184,320 + $368,640 = <span style="color:#0284C7;">$737,100.00 USD</span>
      </div>
      <p style="font-size: 7pt; color: #475569;">
        *All generated from an initial one-time out-of-pocket entry of exactly $30.00 USD settled in liquid TROB Coin.
      </p>
    </div>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 5 OF 10 • 12 PROGRESSIVE MATRIX SLOTS & AUTO-UPGRADES</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 6: THE 4 AUTOMATED PROTOCOL POOLS (EXACT DEPOSIT-DISTRIBUTION)     -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION V: THE 4 AUTOMATED PROTOCOL POOLS</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. Protocol Inflow & Master Allocation Ratios</h2>
    <p>
      All community pools in Equora.Fi are continuously financed by <strong>Nodes P4, P5, and P14</strong> from every 14-node board completed across all 12 slots worldwide. Funds stream automatically into <code>EquoraVault.sol</code> and are partitioned with <strong>zero intermediary deductions</strong>:
    </p>

    <div class="formula-box">
      EquoraVault.sol Master Split: 40% Salary Pool + 35% Ecosystem & DAO + 15% Level Rewards + 10% Magic Blind Box = 100%
    </div>

    <h2>2. Deep-Dive Specification of the 4 Automated Pools</h2>

    <div class="card" style="border-left: 3px solid #0284C7; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="color: #0284C7; font-size: 8.8pt;">POOL 1: SALARY TO COMMUNITY POOL (40% OF PROTOCOL VAULT)</h3>
        <span style="font-weight: 700; color: #0284C7; font-size: 7.2pt;">AUTOMATED RELEASE: 11TH OF EVERY MONTH</span>
      </div>
      <p style="font-size: 7.2pt; color: #334155; margin: 2px 0;">
        The Salary Pool transforms Web3 networking into a stable, predictable monthly career. The 40% pool is divided into <strong>4 distinct slices of 25% each</strong>. When a leader qualifies for a new rank tier, they receive <strong>ONLY that current tier's income</strong> (replaces junior rank salary, strictly <strong>NO STACKING</strong>).
      </p>
      <table style="margin: 2px 0;">
        <thead>
          <tr>
            <th style="width: 14%;">Rank Tier</th>
            <th style="width: 18%;">Required Slot</th>
            <th style="width: 32%;">Incremental & Total Nodes Formula</th>
            <th style="width: 20%;">Salary Pool Slice</th>
            <th style="width: 16%;">Income Rule</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 700;">Alpha</td>
            <td>Slot 3 (Level 3)</td>
            <td><strong>42 Total Nodes</strong> (Base Qualification)</td>
            <td class="highlight-cell">25% Alpha Pool Slice</td>
            <td>Current Tier Only</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Prime</td>
            <td>Slot 6 (Level 6)</td>
            <td><strong>42 + 42 = 84 Total Nodes</strong> (+42 incremental)</td>
            <td class="highlight-cell">25% Prime Pool Slice</td>
            <td>Replaces Alpha Tier</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Elite</td>
            <td>Slot 9 (Level 9)</td>
            <td><strong>84 + 42 = 126 Total Nodes</strong> (+42 incremental)</td>
            <td class="highlight-cell">25% Elite Pool Slice</td>
            <td>Replaces Prime Tier</td>
          </tr>
          <tr style="background: #0F172A; color: #FFFFFF; font-weight: 800;">
            <td style="color: #FACC15;">Crown</td>
            <td style="color: #FFFFFF;">Slot 12 (Level 12)</td>
            <td style="color: #38BDF8;"><strong>126 + 42 = 168 Total Nodes</strong> (+42 incremental)</td>
            <td style="color: #4ADE80;">25% Crown Pool Slice</td>
            <td style="color: #FACC15;">Pinnacle Single Tier</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 6.8pt; color: #475569; margin-top: 2px;">
        *<strong>Exclusive Single-Tier Allocation (No Stacking):</strong> Higher ranks receive compensation strictly from their current tier slice. Because higher ranks have significantly fewer qualified leaders (e.g., hundreds of Alphas vs. a few dozen Primes vs. ~6 Elites vs. 1–2 Crowns), each leader's single-tier share grows exponentially larger naturally without needing stacking!
      </p>
    </div>

    <div class="card" style="border-left: 3px solid #10B981; margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="color: #059669; font-size: 8.8pt;">POOL 2: ECOSYSTEM & GENESIS DAO POOL (35% OF PROTOCOL VAULT)</h3>
        <span style="font-weight: 700; color: #059669; font-size: 7.2pt;">REAL-TIME DIVIDEND STREAM TO 100 SEATS</span>
      </div>
      <p style="font-size: 7.2pt; color: #334155; margin: 2px 0;">
        Represents the highest tier of protocol governance and institutional dividend yield, restricted to exactly <strong>100 Scarcity-Locked Genesis Seats</strong>:
      </p>
      <div style="font-size: 7.1pt; color: #065F46; line-height: 1.34;">
        • <strong>Phase 1 Queue Push:</strong> For the first 21 days, 100% of incoming $300 seats fund existing members via <code>$300 / (N - 1)</code>.<br>
        • <strong>Phase 2/3 Matrix Pipeline:</strong> Exactly 35% of all global matrix pool value streams perpetually to the 100 DAO seats.<br>
        • <strong>Universal 5X Cap Engine ($1,500):</strong> Each seat caps at $1,500 total payouts, initiating an automated 48-hour retopup window ($300). Un-topped seats forfeit and reopen for sequential queue claim (Seat #1 to #100).
      </div>
    </div>

    <div class="grid-2">
      <div class="card" style="border-left: 3px solid #F59E0B;">
        <h3 style="color: #D97706;">POOL 3: LEVEL REWARDS POOL (15%)</h3>
        <p><strong>Instant Milestone Cash Bonuses:</strong> Paid on-chain immediately upon reaching rank qualification milestones:</p>
        <div style="font-size: 7pt; color: #78350F; line-height: 1.3;">
          • <strong>Alpha (Level 3 / 42 Nodes):</strong> 10% of Level Pool.<br>
          • <strong>Prime (Level 6 / 84 Nodes):</strong> 15% of Level Pool.<br>
          • <strong>Elite (Level 9 / 126 Nodes):</strong> 25% of Level Pool.<br>
          • <strong>Crown (Level 12 / 168 Nodes [126+42]):</strong> 50% of Level Pool.<br>
          *Also mints Soulbound ERC-721 Rank Badge NFTs.
        </div>
      </div>

      <div class="card" style="border-left: 3px solid #8B5CF6;">
        <h3 style="color: #7C3AED;">POOL 4: MAGIC BLIND BOX POOL (10%)</h3>
        <p><strong>Automated 91-Day Community Retention Vault:</strong> Every active wallet has an individual 3-month countdown timer. Matures into a weighted probabilistic payout cohort:</p>
        <div style="font-size: 7pt; color: #5B21B6; line-height: 1.3;">
          • <strong>85% Common Tier:</strong> $0.50 payout per user.<br>
          • <strong>10% Uncommon Tier:</strong> $0.80 payout per user.<br>
          • <strong>3% Rare Tier:</strong> $1.20 payout per user.<br>
          • <strong>2% Legendary Jackpot:</strong> $5.00 payout per user.<br>
          *Boosts viral dashboard engagement and retention.
        </div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 6 OF 10 • THE 4 AUTOMATED PROTOCOL POOLS</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 7: END-TO-END MONEY FLOW, ACCOUNTING & P2P DISTRIBUTION            -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION VI: MONEY FLOW & MATHEMATICAL CONSERVATION</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. End-to-End Money Routing: Where Does It Come From & Where Does It Go?</h2>
    <p>
      In Equora.Fi, there is zero custodial ambiguity. Every dollar deposited is accounted for with 100% cryptographic transparency. Below is the master accounting flow of capital through the smart contracts:
    </p>

    <div class="diagram-container" style="text-align: left; padding: 8px 12px;">
      <div style="font-weight: 800; color: #0284C7; margin-bottom: 5px; text-align: center;">=== COMPLETE END-TO-END CAPITAL ROUTING ARCHITECTURE ===</div>
      <div style="font-size: 7pt; line-height: 1.42;">
        [ INCOMING USER DEPOSIT: $30 in live TROB Coin via Trobsafe Wallet ]<br>
        &nbsp;&nbsp;&nbsp;&nbsp;│<br>
        &nbsp;&nbsp;&nbsp;&nbsp;▼<br>
        [ EquoraMatrix.sol: Smart Contract EVM Node Evaluator ]<br>
        &nbsp;&nbsp;&nbsp;&nbsp;├─► IF Node P3, P6, P8, P9, P11, P12 ──► <strong>100% DIRECT CASH to Board Owner Trobsafe Wallet</strong> ($180 Cash Total)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;├─► IF Node P1, P2 ──────────────────► <strong>100% UPLINE MENTORSHIP to Sponsor & Mentor Wallets</strong> ($60 Cash Total)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;├─► IF Node P7, P10, P13 ────────────► <strong>100% DOWNLINE SPILLOVER to Active Team Placements</strong> ($90 Spillover Total)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;└─► IF Node P4, P5, P14 ────────────► <strong>100% PROTOCOL INFLOW to EquoraVault.sol</strong> ($90 Total Inflow)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ EquoraVault.sol Master Split ]<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─► <strong>40% SALARY POOL:</strong> Disbursed monthly on 11th (Strict single-tier per rank: Alpha, Prime, Elite, Crown)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─► <strong>35% GENESIS DAO POOL:</strong> Streamed real-time to 100 Council Seats (5X Capped, $1,500)<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─► <strong>15% LEVEL REWARDS:</strong> Paid instantly on-chain upon achieving rank tier milestones<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─► <strong>10% MAGIC BLIND BOX:</strong> Released every 91 days across active participant cohort
      </div>
    </div>

    <h2>2. Mathematical Proof of Zero-Leakage Conservation</h2>
    <p>
      In classical corporate systems, <code>Inflow - Outflow = Corporate Skim (Profit)</code>. In Equora.Fi, the conservation formula is absolute:
    </p>
    <div class="formula-box" style="text-align: center; font-size: 7.8pt; font-weight: 800;">
      ∑ GROSS INFLOW ($420.00) = Direct Cash ($180.00) + Pools ($90.00) + Mentorship ($60.00) + Spillover ($90.00)
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Destination Group</th>
          <th style="width: 20%;">Per Board Share</th>
          <th style="width: 20%;">Percentage of Volume</th>
          <th style="width: 35%;">Custody & Execution Mechanism</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700;">Board Owner Take-Home</td>
          <td class="badge-cell">$180.00</td>
          <td>42.86%</td>
          <td>Pushed instantly into owner's non-custodial Trobsafe address</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Protocol Vault (4 Pools)</td>
          <td style="color: #0284C7; font-weight: 700;">$90.00</td>
          <td>21.43%</td>
          <td>Held temporarily in immutable <code>EquoraVault.sol</code> contract</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Direct & Mentor Uplines</td>
          <td>$60.00</td>
          <td>14.28%</td>
          <td>Pushed instantly to Upline 1 and Upline 2 addresses</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Downline Organization</td>
          <td>$90.00</td>
          <td>21.43%</td>
          <td>Pushed instantly to downline spillover beneficiary wallets</td>
        </tr>
        <tr style="background: #0F172A; color: #FFFFFF; font-weight: 800;">
          <td style="color: #FFFFFF;">TOTAL REDISTRIBUTED</td>
          <td style="color: #38BDF8;">$420.00</td>
          <td style="color: #4ADE80;">100.00%</td>
          <td style="color: #4ADE80;">0.00% Corporate Skim • 0.00% Admin Retention</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Multi-Currency Oracle Settlement Architecture (<code>PriceOracle.sol</code>)</h2>
    <div class="grid-2">
      <div class="card">
        <h3>USD Pricing Stability</h3>
        <p>All slot tiers ($30, $60... $61,440) and Genesis DAO seats ($300) are permanently denominated in USD. This guarantees that real-world participants never experience fluctuating entry prices or unexpected matrix fee inflation.</p>
      </div>
      <div class="card">
        <h3>High-Speed TROB Settlement</h3>
        <p>Transactions execute natively in liquid TROB Coin via <code>PriceOracle.sol</code>. When 1 TROB = $0.05, a $30 slot requires 600 TROB; when 1 TROB = $0.10, it requires 300 TROB. Payouts arrive in liquid TROB, ready for instant swapping.</p>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 7 OF 10 • MONEY FLOW & MATHEMATICAL CONSERVATION</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 8: FINANCIAL CASE STUDIES & PROJECTION MODELS                      -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION VII: FINANCIAL CASE STUDIES & PROJECTIONS</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. Global Monthly Distribution Case Study ($100,000 Inflow)</h2>
    <p>
      To illustrate mathematical execution, consider a standard operating month where <strong>$100,000.00</strong> in total pool volume has been accumulated inside <code>EquoraVault.sol</code> from Nodes 4, 5, and 14 across the global network:
    </p>

    <div class="card-navy" style="margin-bottom: 5px;">
      <div style="font-size: 8.3pt; font-weight: 800; color: #38BDF8; margin-bottom: 2px;">
        TOTAL GLOBAL VAULT POOL INFLOW: $100,000.00 USD
      </div>
      <div style="font-size: 7.1pt; color: #94A3B8;">
        1. Ecosystem & DAO Pool (35%): <strong>$35,000.00</strong> • 2. Salary Pool (40%): <strong>$40,000.00</strong> • 3. Level Rewards (15%): <strong>$15,000.00</strong> • 4. Magic Box (10%): <strong>$10,000.00</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 24%;">Pool / Rank Tier</th>
          <th style="width: 14%;">Total Pool Cash</th>
          <th style="width: 18%;">Sample Cohort</th>
          <th style="width: 20%;">Per Leader Share</th>
          <th style="width: 24%;">Net Monthly Salary (Single-Tier)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700; color: #059669;">Genesis DAO Seats (35%)</td>
          <td>$35,000.00</td>
          <td>100 Active Seats</td>
          <td><strong>$350.00 / Seat</strong></td>
          <td class="badge-cell">$350.00 in Liquid TROB</td>
        </tr>
        <tr>
          <td>Salary: Alpha Slice (25%)</td>
          <td>$10,000.00</td>
          <td>126 Qualified Alphas</td>
          <td>$79.36</td>
          <td>$79.36 / Month (Current Tier Only)</td>
        </tr>
        <tr>
          <td>Salary: Prime Slice (25%)</td>
          <td>$10,000.00</td>
          <td>26 Qualified Primes</td>
          <td>$384.61</td>
          <td class="highlight-cell">$384.61 / Month (Current Tier Only)</td>
        </tr>
        <tr>
          <td>Salary: Elite Slice (25%)</td>
          <td>$10,000.00</td>
          <td>6 Qualified Elites</td>
          <td>$1,666.66</td>
          <td class="highlight-cell">$1,666.66 / Month (Current Tier Only)</td>
        </tr>
        <tr style="background: #0F172A; color: #FFFFFF; font-weight: 800;">
          <td style="color: #FACC15;">Salary: Crown Slice (25%)</td>
          <td style="color: #FFFFFF;">$10,000.00</td>
          <td style="color: #FFFFFF;">1 Qualified Crown</td>
          <td style="color: #4ADE80;">$10,000.00</td>
          <td style="color: #4ADE80;">$10,000.00 / Month (Pinnacle Tier!)</td>
        </tr>
        <tr>
          <td>Level Rewards: Alpha (10%)</td>
          <td>$1,500.00</td>
          <td>Milestone Achievers</td>
          <td>Instant Milestone Cash</td>
          <td>+ Soulbound NFT Rank Badge</td>
        </tr>
        <tr>
          <td>Level Rewards: Crown (50%)</td>
          <td>$7,500.00</td>
          <td>Crown Achievers</td>
          <td>Instant Milestone Cash</td>
          <td>+ Pinnacle Crown Trophy NFT</td>
        </tr>
        <tr>
          <td>Magic Blind Box (10%)</td>
          <td>$10,000.00</td>
          <td>1,000 Active Users Cohort</td>
          <td>$0.50 to $5.00</td>
          <td>Quarterly Loyalty Distribution</td>
        </tr>
      </tbody>
    </table>

    <h2>2. Scaled Model: High-Velocity $1,000,000 Monthly Matrix Volume</h2>
    <div class="grid-2">
      <div class="card-emerald">
        <h3 style="color: #15803D;">Genesis DAO Seat Holders ($350,000 Pool)</h3>
        <p>• <strong>Per Seat Monthly Dividend:</strong> $3,500.00 USD in liquid TROB.<br>
        • <strong>5X Cap Velocity:</strong> Each seat reaches its $1,500 cap multiple times per month.<br>
        • <strong>Net Monthly Profit per Seat:</strong> Generates over $2,800+ in pure passive profit after automated $300 re-topup rollovers.</p>
      </div>

      <div class="card-blue">
        <h3 style="color: #0369A1;">Organizational Leaders ($400,000 Salary Pool)</h3>
        <p>• <strong>Alpha Leaders:</strong> ~$793.00 monthly baseline single-tier salary.<br>
        • <strong>Prime Leaders:</strong> ~$3,846.00 monthly single-tier salary.<br>
        • <strong>Elite Leaders:</strong> ~$16,666.00 monthly single-tier salary.<br>
        • <strong>Crown Leaders:</strong> ~$100,000.00+ monthly pinnacle single-tier income.</p>
      </div>
    </div>

    <h2>3. The Genesis DAO Seat Holder Complete Financial Lifecycle</h2>
    <div class="card" style="margin-top: 5px;">
      <div style="font-size: 7.6pt; font-weight: 700; color: #0F172A; margin-bottom: 3px;">
        How an Investor / Early Leader Generates Maximum ROI from a $300 Genesis Seat:
      </div>
      <p style="font-size: 7.1pt; line-height: 1.34; color: #334155;">
        <strong>Phase 1 Queue Inflow:</strong> Enters for $300. Rapidly recovers initial $300 from subsequent member joins via the <code>$300 / (N - 1)</code> formula.<br>
        <strong>Phase 2/3 Matrix Perpetual Feed:</strong> Receives equal shares of 35% global matrix pool inflow forever.<br>
        <strong>The 5X Capital Recycler:</strong> Reaches $1,500 cap $\rightarrow$ Re-topups $300 within 48 hours $\rightarrow$ <strong>$1,200 Net Profit Pocketed</strong> $\rightarrow$ Re-qualifies for next $1,500 round!
      </p>
    </div>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 8 OF 10 • FINANCIAL CASE STUDIES & PROJECTIONS</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 9: SECURITY, ANTI-SYBIL & GOVERNANCE ARCHITECTURE                 -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION VIII: SECURITY, ANTI-SYBIL & GOVERNANCE ENGINE</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. Multi-Layer Hardware Anti-Sybil Defense</h2>
    <p>
      In decentralized affiliate and matrix platforms, bot farms and Sybil attackers frequently attempt to register hundreds of fake accounts to game spillover, drain pools, or hoard queue seats. Equora.Fi implements a <strong>3-tier hardware and cryptographic defense layer</strong>:
    </p>

    <div class="grid-3">
      <div class="card" style="border-top: 3px solid #0284C7;">
        <h3>1. Hardware Fingerprinting</h3>
        <p>Uses cryptographic Canvas, WebGL, AudioContext, and GPU device hashes. Prevents automated bot scripts from spawning multiple wallets on the same physical device.</p>
      </div>
      <div class="card" style="border-top: 3px solid #0284C7;">
        <h3>2. 1 Seat Per Wallet Invariant</h3>
        <p>The smart contract strictly limits 1 DAO Council Seat per wallet address. Attempts to purchase duplicate seats revert on-chain (<code>WalletAlreadyHasSeat</code>).</p>
      </div>
      <div class="card" style="border-top: 3px solid #0284C7;">
        <h3>3. Non-Transferable Soulbound</h3>
        <p>DAO Passes are minted as Soulbound ERC-721 tokens (<code>_transfer</code> and <code>_approve</code> functions revert). Seats cannot be sold on secondary markets, preserving organic leadership.</p>
      </div>
    </div>

    <h2>2. The 48-Hour Retopup & Sequential Vacancy Queue Algorithm</h2>
    <p>
      To prevent dead capital and inactive accounts from permanently holding top network positions, the Genesis DAO implements an automated vacancy scanning engine:
    </p>

    <div class="diagram-container" style="text-align: left; padding: 7px 10px;">
      <div style="font-weight: 800; color: #0284C7; margin-bottom: 3px;">=== SEQUENTIAL VACANCY QUEUE ALGORITHM (SEATS 1 TO 100) ===</div>
      <div style="font-size: 7.1pt; line-height: 1.38;">
        1. Member hits 5X Earnings Cap ($1,500.00) or holds Underfunded Reservation.<br>
        2. Contract initiates immutable 48-Hour Countdown Timer (<code>retopupDeadline = block.timestamp + 48 hours</code>).<br>
        3. IF member calls <code>retopup()</code> / <code>completeUnderfundedSeat()</code> before deadline ──► Cap resets to $0.00, Seat remains active.<br>
        4. IF 48 hours expire with NO top-up ──► Seat status becomes <code>VACANT</code>.<br>
        5. Next incoming buyer executes sequential scan (<code>for i = 1 to 100</code>) ──► Claims the lowest vacant seat (e.g. Seat #4) instantly!
      </div>
    </div>

    <h2>3. Non-Custodial Smart Contract Security & Renounced Ownership</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Security Vector</th>
          <th style="width: 40%;">Traditional Legacy Platform</th>
          <th style="width: 35%;">Equora.Fi Architecture</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700;">Admin Keys</td>
          <td style="color: #B91C1C;">Retained by CEO / Dev team (Multi-sig or EOA)</td>
          <td class="badge-cell">Ownership permanently renounced to <code>address(0)</code></td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Proxy Upgradability</td>
          <td style="color: #B91C1C;">UUPS / Transparent Proxy with logic override</td>
          <td class="badge-cell">Zero proxies. Direct immutable contract bytecode</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Funds Custody</td>
          <td style="color: #B91C1C;">Central corporate treasury wallet</td>
          <td class="badge-cell">Direct P2P push to private user Trobsafe wallets</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Pausability Backdoor</td>
          <td style="color: #B91C1C;"><code>Pausable.sol</code> allows admin to freeze all transfers</td>
          <td class="badge-cell">No pause functions exist in contract bytecode</td>
        </tr>
      </tbody>
    </table>

    <h2>4. Regulatory Compliance & Global Legal Sovereignty</h2>
    <div class="card-blue">
      <p style="font-size: 7.3pt; color: #0C4A6E; line-height: 1.34;">
        <strong>Pure Peer-to-Peer Non-Custodial Architecture:</strong> Because Equora.Fi never takes custody of user capital, never promises fixed investment yields, charges zero platform fees, and operates as an immutable algorithmic software protocol on Trobium, it operates outside the scope of custodial financial regulations. Participants interact directly peer-to-peer using non-custodial cryptographic key pairs.
      </p>
    </div>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 9 OF 10 • SECURITY, ANTI-SYBIL & GOVERNANCE ENGINE</span>
  </div>
</div>

<!-- ======================================================================= -->
<!-- PAGE 10: TEAM ACTION PLAN, SPRINT DELIVERABLES & SIGN-OFF               -->
<!-- ======================================================================= -->
<div class="page">
  <div>
    <div class="doc-header">
      <div class="brand">
        ${logoImgTag}
        <span class="doc-title-mini">SECTION IX: TEAM ACTION PLAN & IMMEDIATE DELIVERABLES</span>
      </div>
      <div class="doc-meta">LEXVRA • EQUORA.FI</div>
    </div>

    <h2>1. Executive Synthesis for the Core Team</h2>
    <p>
      The foundational infrastructure of Equora.Fi (Phase 1 Genesis DAO) is fully verified, operational, and deployed. Our immediate operational objective is executing <strong>Phase 2: Matrix Engine & 4 Protocol Pools</strong> to prepare for the global Phase 3 retail launch.
    </p>

    <h2>2. Immediate Team Execution Deliverables (Sprint Breakdown)</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 15%;">Team Unit</th>
          <th style="width: 35%;">Sprint Task Deliverable</th>
          <th style="width: 35%;">Success Metric / Verification Standard</th>
          <th style="width: 15%;">Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700;">Smart Contracts</td>
          <td>Deploy <code>EquoraMatrix.sol</code> and <code>EquoraVault.sol</code> on Trobium Mainnet</td>
          <td>14-node board test, P3 instant cash, P5 auto-upgrade verification</td>
          <td style="color: #DC2626; font-weight: 800;">CRITICAL</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Smart Contracts</td>
          <td>Configure Chainlink Keepers for automated monthly salary distributions</td>
          <td>11th of month automated execution test with zero admin intervention</td>
          <td style="color: #DC2626; font-weight: 800;">CRITICAL</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Full-Stack Web</td>
          <td>Integrate Matrix Tree visualizer & Slot upgrade cards in <code>apps/web-dao</code></td>
          <td>Interactive 14-node tree inspector, real-time node occupancy feed</td>
          <td style="color: #0284C7; font-weight: 800;">HIGH</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Indexer & API</td>
          <td>Update event indexer to ingest Matrix board completed and cycle events</td>
          <td>Real-time Neon DB sync, sub-second API latency on <code>/api/dao/matrix</code></td>
          <td style="color: #0284C7; font-weight: 800;">HIGH</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">DevOps</td>
          <td>Continuous integration verification on Utho VM production stack</td>
          <td>Zero-downtime rolling container update, 6 healthy Docker services</td>
          <td style="color: #059669; font-weight: 800;">VERIFIED</td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Leadership & Growth</td>
          <td>Fulfill remaining Genesis Council Seats (1 to 100) before Day 21</td>
          <td>100 active DAO founding leaders seated before retail matrix launch</td>
          <td style="color: #0284C7; font-weight: 800;">HIGH</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Formal Technical Specification Sign-Off</h2>
    <div class="card-navy" style="margin-top: 8px; padding: 10px 14px;">
      <div style="font-size: 8.3pt; font-weight: 800; color: #38BDF8; margin-bottom: 3px;">
        OFFICIAL SOVEREIGN ENTERPRISE RATIFICATION • LEXVRA PROTOCOL GROUP
      </div>
      <p style="font-size: 7.3pt; color: #E2E8F0; line-height: 1.38; margin-bottom: 6px;">
        This document represents the finalized, authoritative architectural, mathematical, and operational standard for the Equora.Fi Matrix Engine and Protocol Pools. All smart contract bytecode, API schemas, and frontend interfaces must conform strictly to the specifications detailed herein.
      </p>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #334155; padding-top: 6px; font-size: 6.8pt; color: #94A3B8;">
        <div>
          <div><strong>PROTOCOL ARCHITECT:</strong> LEXVRA Tokenomics Council</div>
          <div><strong>LEAD SMART CONTRACT ENGINEER:</strong> Equora Core Protocol Team</div>
          <div><strong>BLOCKCHAIN NETWORK:</strong> Trobium L1 (Chain ID: 1000)</div>
        </div>
        <div style="text-align: right;">
          <div><strong>DOCUMENT STATUS:</strong> APPROVED FOR EXECUTION</div>
          <div><strong>VERSION:</strong> 5.1.0 (MASTER FINAL EDITION)</div>
          <div><strong>DATE OF RATIFICATION:</strong> OCTOBER 2026</div>
        </div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>EQUORA.FI • MASTER SPECIFICATION V5.1 • LEXVRA SOVEREIGN INTELLECTUAL PROPERTY</span>
    <span>PAGE 10 OF 10 • TEAM ACTION PLAN & FORMAL SIGN-OFF</span>
  </div>
</div>

</body>
</html>`;

  // Write HTML files
  fs.writeFileSync(HTML_PATH_1, htmlContent, 'utf8');
  fs.writeFileSync(HTML_PATH_2, htmlContent, 'utf8');
  console.log(`✓ Master Whitepaper HTML written at: ${HTML_PATH_1}`);
  console.log(`✓ Master Whitepaper HTML duplicate written at: ${HTML_PATH_2}`);

  console.log('🖨️ Launching Chromium to compile Master Whitepaper A4 PDF...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const htmlUri = 'file:///' + HTML_PATH_1.replace(/\\/g, '/');
  const cmd = `"${browserBin}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${PDF_PATH_1}" "${htmlUri}"`;
  
  execSync(cmd, { stdio: 'inherit' });

  // Also copy to root docs folder for easy sharing
  fs.copyFileSync(PDF_PATH_1, PDF_PATH_2);

  console.log(`🎉 SUCCESS! Master Whitepaper PDF generated at: ${PDF_PATH_1}`);
  console.log(`🎉 SUCCESS! Master Whitepaper PDF copied to: ${PDF_PATH_2}`);
}

main().catch(err => {
  console.error('Error generating Master Whitepaper PDF:', err);
  process.exit(1);
});
