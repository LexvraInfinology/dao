const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// File paths
const ASSETS_DIR = path.join(__dirname, '../equorafidocs/docs/assets');
const OUTPUT_DIR_DOCS = path.join(__dirname, '../docs');
const OUTPUT_DIR_EQUORA = path.join(__dirname, '../equorafidocs/docs');
const OUTPUT_DIR_A4 = path.join(__dirname, '../equorafidocs/docs/01_A4_Portrait_Whitepapers');
const ARTIFACT_DIR = 'C:/Users/Dell/.gemini/antigravity-ide/brain/de42cc02-dc83-412e-8004-6154a8c7e998';

[OUTPUT_DIR_DOCS, OUTPUT_DIR_EQUORA, OUTPUT_DIR_A4].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const HTML_FILE = path.join(OUTPUT_DIR_DOCS, 'Equora_Matrix_Master_Whitepaper_30_USD_Plan.html');
const PDF_FILE_1 = path.join(OUTPUT_DIR_DOCS, 'Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf');
const PDF_FILE_2 = path.join(OUTPUT_DIR_EQUORA, 'Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf');
const PDF_FILE_3 = path.join(OUTPUT_DIR_A4, 'Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf');
const PDF_FILE_ARTIFACT = path.join(ARTIFACT_DIR, 'Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf');

// Helper to base64 encode images
function toBase64(file) {
  if (!fs.existsSync(file)) return '';
  const ext = path.extname(file).replace('.', '');
  const data = fs.readFileSync(file).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data}`;
}

const logoBase64 = toBase64(path.join(ASSETS_DIR, 'equorafilogo-removebg-preview.png'));
const daoCardBase64 = toBase64(path.join(ASSETS_DIR, 'dao_card.jpg'));
const matrixSlotsBase64 = toBase64(path.join(ASSETS_DIR, 'matrix_slots.jpg'));
const mysteryBoxBase64 = toBase64(path.join(ASSETS_DIR, 'mystery_box.jpg'));

console.log('🏛️ Loaded assets. Generating 34-Page Institutional Whitepaper HTML...');

// CSS Styling for 34 Perfect A4 Portrait Pages
const CSS_STYLES = `
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
    font-size: 7.7pt;
    line-height: 1.34;
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

  /* Header */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #0E62E4;
    padding-bottom: 4px;
    margin-bottom: 6px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-logo {
    height: 20px;
    width: auto;
  }
  .header-title {
    font-size: 8.5pt;
    font-weight: 800;
    color: #071A4A;
    letter-spacing: -0.2px;
    text-transform: uppercase;
  }
  .header-right {
    font-size: 6.8pt;
    color: #0E62E4;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: right;
  }

  /* Footer */
  .doc-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #E2E8F0;
    padding-top: 4px;
    margin-top: 6px;
    font-size: 6.5pt;
    color: #64748B;
    font-weight: 600;
    text-transform: uppercase;
  }
  .doc-footer .page-number {
    color: #0E62E4;
    font-weight: 800;
  }

  /* Main Body Layout */
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 6px;
  }

  /* Typography */
  h1 { font-size: 14pt; font-weight: 900; color: #071A4A; line-height: 1.15; letter-spacing: -0.4px; }
  h2 { font-size: 10.5pt; font-weight: 800; color: #071A4A; line-height: 1.2; border-left: 3px solid #0E62E4; padding-left: 6px; margin: 2px 0; }
  h3 { font-size: 8.8pt; font-weight: 700; color: #1E3A8A; line-height: 1.25; margin: 1px 0; }
  p { font-size: 7.7pt; color: #334155; line-height: 1.35; text-align: justify; }
  strong { font-weight: 700; color: #0F172A; }

  /* Pill Badges */
  .badge {
    display: inline-block;
    padding: 1.5px 6px;
    border-radius: 4px;
    font-size: 6.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .badge-blue { background: #EFF6FF; color: #0E62E4; border: 1px solid #BFDBFE; }
  .badge-emerald { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
  .badge-amber { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
  .badge-purple { background: #FAF5FF; color: #7C3AED; border: 1px solid #E9D5FF; }

  /* Containers & Cards */
  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 6px 8px;
  }
  .card-blue { background: #F8FAFC; border: 1px solid #CBD5E1; }
  .card-highlight { background: #F0F7FF; border: 1px solid #BAE6FD; }
  .card-dark { background: #071A4A; color: #FFFFFF; border: none; }
  .card-dark h2, .card-dark h3, .card-dark strong { color: #FFFFFF; }
  .card-dark p { color: #CBD5E1; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
  .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 5px; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.2pt;
    margin: 3px 0;
  }
  th {
    background: #071A4A;
    color: #FFFFFF;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 6.5pt;
    letter-spacing: 0.3px;
    padding: 3.5px 5px;
    border: 1px solid #071A4A;
    text-align: left;
  }
  td {
    padding: 3px 5px;
    border: 1px solid #E2E8F0;
    color: #1E293B;
  }
  tr:nth-child(even) { background: #F8FAFC; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }

  /* Code Block */
  pre {
    background: #0F172A;
    color: #E2E8F0;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 6.4pt;
    padding: 5px 8px;
    border-radius: 4px;
    overflow: hidden;
    line-height: 1.3;
  }
  code { font-family: inherit; }

  /* Tree Diagram Boxes */
  .tree-node {
    display: inline-block;
    padding: 2.5px 4px;
    border-radius: 4px;
    font-size: 6.5pt;
    font-weight: 700;
    text-align: center;
    border: 1px solid #CBD5E1;
    background: #FFFFFF;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }
  .node-you { background: #0E62E4; color: #FFFFFF; border-color: #0E62E4; }
  .node-upline { background: #F1F5F9; color: #475569; border-color: #CBD5E1; }
  .node-payout { background: #ECFDF5; color: #047857; border-color: #A7F3D0; }
  .node-pool { background: #FEF3C7; color: #B45309; border-color: #FDE68A; }
  .node-downline { background: #F3E8FF; color: #6B21A8; border-color: #DDD6FE; }
`;

function createHeader(sectionTitle) {
  return `
    <div class="doc-header">
      <div class="header-left">
        ${logoBase64 ? `<img src="${logoBase64}" class="header-logo" alt="Equora">` : ''}
        <div class="header-title">EQUORA.FI • MASTER WHITE PAPER</div>
      </div>
      <div class="header-right">${sectionTitle}</div>
    </div>
  `;
}

function createFooter(pageNum, totalPages = 34) {
  return `
    <div class="doc-footer">
      <span>EQUORA.FI RETAIL MATRIX SPECIFICATION • 100% ON-CHAIN TROBCHAIN AUTONOMOUS PROTOCOL</span>
      <span class="page-number">PAGE ${pageNum} OF ${totalPages}</span>
    </div>
  `;
}

// Generate the 34 HTML Pages
const pages = [];

// ============================================================================
// PAGE 1: COVER PAGE
// ============================================================================
pages.push(`
<div class="page" style="background: linear-gradient(145deg, #071A4A 0%, #0A2540 60%, #0F356B 100%); color: #FFFFFF; justify-content: space-between; padding: 25mm 15mm;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px;">
    ${logoBase64 ? `<img src="${logoBase64}" style="height: 38px; filter: brightness(0) invert(1);" alt="Equora">` : '<h2 style="color:#FFF;">EQUORA.FI</h2>'}
    <div style="text-align: right; font-size: 8pt; font-weight: 700; color: #38BDF8; letter-spacing: 1px;">
      OFFICIAL MASTER WHITEPAPER • VERSION 6.0<br>
      <span style="color: #94A3B8; font-weight: 400;">TROBCHAIN MAINNET PROTOCOL SPECIFICATION</span>
    </div>
  </div>

  <div style="margin: 25mm 0; text-align: left;">
    <div style="display: inline-block; padding: 3px 10px; background: rgba(14, 98, 228, 0.35); border: 1px solid #38BDF8; border-radius: 6px; font-size: 8.5pt; font-weight: 800; color: #38BDF8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
      DECENTRALIZED RETAIL WEALTH ENGINE
    </div>
    <h1 style="font-size: 26pt; font-weight: 900; line-height: 1.15; color: #FFFFFF; letter-spacing: -0.8px; margin-bottom: 12px;">
      THE EQUORA MATRIX<br>
      <span style="color: #38BDF8;">$30 RETAIL PROTOCOL</span>
    </h1>
    <p style="font-size: 11pt; color: #E2E8F0; max-width: 90%; line-height: 1.5; font-weight: 300;">
      A comprehensive mathematical and cryptographic exposition of the non-custodial 14-node binary compression topology, 12 progressive value slots, 4 autonomous protocol liquidity pools, and the relativistic "Logic of You" decentralized distribution architecture.
    </p>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 25mm;">
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
        <div style="font-size: 14pt; font-weight: 900; color: #38BDF8;">$30.00</div>
        <div style="font-size: 6.8pt; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Universal Base Entry</div>
      </div>
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
        <div style="font-size: 14pt; font-weight: 900; color: #34D399;">14 Nodes</div>
        <div style="font-size: 6.8pt; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Per-Slot Board Depth</div>
      </div>
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
        <div style="font-size: 14pt; font-weight: 900; color: #FBBF24;">4 Pools</div>
        <div style="font-size: 6.8pt; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Automated Ecosystem Streams</div>
      </div>
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
        <div style="font-size: 14pt; font-weight: 900; color: #C084FC;">100% P2P</div>
        <div style="font-size: 6.8pt; color: #94A3B8; font-weight: 700; text-transform: uppercase;">Instant Autonomous Push</div>
      </div>
    </div>
  </div>

  <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; display: flex; justify-content: space-between; font-size: 7.2pt; color: #94A3B8;">
    <div><strong>FOUNDATION:</strong> LEXVRA INFINOLOGY • EQUORA PROTOCOL GOVERNANCE</div>
    <div><strong>NETWORK:</strong> TROBCHAIN MAINNET • SOLIDITY 0.8.20</div>
    <div><strong>CONTRACT:</strong> NULL-KEYED & IMMUTABLE</div>
  </div>
</div>
`);

// ============================================================================
// PAGE 2: TABLE OF CONTENTS & PROTOCOL GLOSSARY
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('TABLE OF CONTENTS & GLOSSARY')}
  <div class="content">
    <h2>1. Master Document Architecture</h2>
    <p>This document constitutes the authoritative specification for the Equora Matrix Protocol. Every mathematical model, smart contract function, and economic distribution mechanism described herein is deployed immutably on TrobChain mainnet.</p>
    
    <div class="grid-2" style="margin-top: 4px;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Part I: Foundational Topology (Pages 3–7)</h3>
        <ul style="font-size:7pt; padding-left:14px; color:#334155; line-height:1.45;">
          <li>Page 3: Non-Custodial Philosophy & $30 Entry Anchor</li>
          <li>Page 4: 14-Node / 15-Position Geometric Blueprint</li>
          <li>Page 5: The "Logic of You" in Everyone's Dashboard</li>
          <li>Page 6: The 14-Node Revenue Matrix ($420 Volume Flow)</li>
          <li>Page 7: The 6 Distinct Autonomous Income Vectors</li>
        </ul>

        <h3 style="color:#0E62E4; margin-top:5px;">Part II: The 4 Protocol Pools (Pages 8–12)</h3>
        <ul style="font-size:7pt; padding-left:14px; color:#334155; line-height:1.45;">
          <li>Page 8: Protocol Pool Inflow Routing via EquoraVault</li>
          <li>Page 9: Pool 1 — Genesis DAO Treasury (35% Instant Push)</li>
          <li>Page 10: Pool 2 — Monthly Leadership Royalty (40% Epoch)</li>
          <li>Page 11: Pool 3 — Magic Blind Box (10% Algorithmic VRF)</li>
          <li>Page 12: Pool 4 — Lucky Drops Community Pool (15%)</li>
        </ul>
      </div>

      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Part III: Economic Engine (Pages 13–18)</h3>
        <ul style="font-size:7pt; padding-left:14px; color:#334155; line-height:1.45;">
          <li>Page 13: The 12 Progressive Value Slots ($30 to $61,440)</li>
          <li>Page 14: Comprehensive Financial Master Table</li>
          <li>Page 15: Recycle Mechanics & Perpetual Board Cycling</li>
          <li>Page 16: Upward, Downward & Cross-Spillover Dynamics</li>
          <li>Page 17: Referral Qualification & Anti-Sybil Constraints</li>
          <li>Page 18: Algorithmic Apex Leadership Designation</li>
        </ul>

        <h3 style="color:#0E62E4; margin-top:5px;">Part IV: Operations, Code & Audits (Pages 19–34)</h3>
        <ul style="font-size:7pt; padding-left:14px; color:#334155; line-height:1.45;">
          <li>Page 19: 5-Digit Member Codes & Sponsor Binding</li>
          <li>Page 20: Step-by-Step User Activation Journey</li>
          <li>Pages 21–23: Scenario Modeling & Anti-Stall Solutions</li>
          <li>Pages 24–27: Smart Contract Analysis & Gas Economics</li>
          <li>Pages 28–34: UX, Comparative Analysis, FAQ & Ratification</li>
        </ul>
      </div>
    </div>

    <h2>2. Key Protocol Terminology</h2>
    <table>
      <thead>
        <tr>
          <th style="width:25%;">Term</th>
          <th style="width:75%;">Architectural Definition</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Apex Node ("YOU")</strong></td>
          <td>The root position of an individual matrix board (Position #0). Every dashboard dynamically roots the connected user as the Apex of their own 14-node tree.</td>
        </tr>
        <tr>
          <td><strong>14-Node Tree</strong></td>
          <td>A 2×2×3 compressed binary structure consisting of 2 nodes on Tier 1, 4 nodes on Tier 2, and 8 nodes on Tier 3 (2 + 4 + 8 = 14 child nodes).</td>
        </tr>
        <tr>
          <td><strong>Recycle Event</strong></td>
          <td>The algorithmic completion of a matrix slot upon filling Node #14. Instantly captures board profits, resets node counters, and re-enters the user under their sponsor.</td>
        </tr>
        <tr>
          <td><strong>P2P Direct Push</strong></td>
          <td>Direct on-chain value dispatch where funds move instantaneously from payer to recipient wallet without resting in a centralized contract escrow.</td>
        </tr>
        <tr>
          <td><strong>Null Key Renouncement</strong></td>
          <td>The invocation of <code>renounceOwnership()</code> upon contract deployment, permanently forfeiting admin control and rendering the code immutable.</td>
        </tr>
        <tr>
          <td><strong>EquoraVault Router</strong></td>
          <td>The central on-chain smart contract that receives 3 nodes per board (P4, P5, P14 = 21.43%) and routes them across the 4 automated protocol pools.</td>
        </tr>
      </tbody>
    </table>
  </div>
  ${createFooter(2)}
</div>
`);

// ============================================================================
// PAGE 3: FOUNDATIONAL ARCHITECTURE & NON-CUSTODIAL PHILOSOPHY
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('THE FOUNDATIONAL ARCHITECTURE')}
  <div class="content">
    <h2>1. The Non-Custodial Revolution in Network Economics</h2>
    <p>Traditional multi-tiered referral systems and centralized matrix programs have historically suffered from four fatal vulnerabilities: centralized treasury custody, admin manipulation, arbitrary withdrawal pauses, and top-heavy gridlock where early participants siphon capital while late entrants stall. <strong>Equora Matrix resolves all four vulnerabilities through pure algorithmic decentralization.</strong></p>

    <div class="grid-3" style="margin: 4px 0;">
      <div class="card card-highlight">
        <h3 style="color:#0E62E4;">Zero Escrow Custody</h3>
        <p>User deposits never pool inside a central contract balance. Every dollar deposited is divided and pushed directly to participant wallets on-chain in the same atomic transaction block.</p>
      </div>
      <div class="card card-highlight">
        <h3 style="color:#059669;">Autonomous Settlement</h3>
        <p>No human approval, withdrawal requests, or KYC delays exist. Smart contract logic verifies matrix positions and immediately dispatches TROB directly to the recipient address.</p>
      </div>
      <div class="card card-highlight">
        <h3 style="color:#7C3AED;">Immutable Null Key</h3>
        <p>After contract initialization, contract ownership is permanently renounced. No developer, admin, or third party can pause payouts, alter fee percentages, or freeze user accounts.</p>
      </div>
    </div>

    <h2>2. The $30 Entry Anchor: Global Frictionless Onboarding</h2>
    <p>In designing the protocol's retail gateway, selecting an accessible economic threshold was essential. At exactly <strong>$30.00 USD</strong> (denominated on-chain in TROB at the fixed peg of $0.056 USD = ~536 TROB), Slot 1 provides a frictionless global onboarding standard that accommodates participants across any economic jurisdiction without compromising revenue velocity.</p>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#071A4A;">The Triad of Matrix Equilibrium</h3>
      <div class="grid-3" style="margin-top: 4px;">
        <div>
          <strong>1. Velocity of Capital:</strong>
          <p style="font-size:7.2pt;">Low $30 entry cost allows teams to cycle rapidly, creating repeated compounding waves rather than stalling on high-ticket barriers.</p>
        </div>
        <div>
          <strong>2. Downline Reinforcement:</strong>
          <p style="font-size:7.2pt;">Nodes P7, P10, and P13 algorithmically push funds back down to newest members, preventing early-stage attrition.</p>
        </div>
        <div>
          <strong>3. Macro Sustainability:</strong>
          <p style="font-size:7.2pt;">21.43% of every board cycle permanently funds the 4 protocol pools, bridging retail activity into Genesis DAO and community longevity.</p>
        </div>
      </div>
    </div>

    <h2>3. Mathematical Certainty: 100% P2P Allocation</h2>
    <p>The Equora Matrix operates with zero token dilution, zero minting inflation, and zero phantom yields. In every single slot, <strong>100.00% of the incoming deposit capital is distributed to verified network participants and protocol pools</strong>. The contract never creates debt it cannot instantaneously pay.</p>

    <div class="card card-dark" style="padding: 8px 12px; margin-top: 4px;">
      <div style="font-size: 8.5pt; font-weight: 800; color: #38BDF8; margin-bottom: 2px;">THE LAW OF CLOSED CONSERVATION</div>
      <p style="font-size: 7.2pt; color: #E2E8F0;">
        Let <em>C</em> be the entry cost of slot <em>s</em>. The total capital injected by a complete 14-node board is 14 × <em>C</em>. The contract proves by formal verification that:
        <br><br>
        <code style="color: #34D399; font-size: 7.5pt;">Σ(Payouts) = (2 × C)[Upline] + (6 × C)[You] + (3 × C)[Vault] + (2 × C)[Downline1] + (1 × C)[Downline2] = 14 × C</code>
        <br><br>
        There is zero leftover wei, zero rounding error, and zero protocol leakage.
      </p>
    </div>
  </div>
  ${createFooter(3)}
</div>
`);

// ============================================================================
// PAGE 4: THE 14-NODE / 15-POSITION MATRIX TOPOLOGY
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('THE 14-NODE / 15-POSITION TOPOLOGY')}
  <div class="content">
    <h2>1. Geometric Blueprint of the Compressed Binary Tree</h2>
    <p>The Equora Matrix is engineered as a <strong>3-tier compressed binary structure</strong>. Each matrix board comprises exactly 15 distinct positions: 1 Root Apex Position (occupied by the board owner, designated as "YOU"), supported by 14 subordinate child nodes arranged in a 2-4-8 progression across three levels.</p>

    <div class="card card-highlight" style="text-align: center; padding: 10px 4px; margin: 4px 0;">
      <div style="font-size: 7.5pt; font-weight: 800; color: #071A4A; margin-bottom: 6px;">EQUORA MATRIX 14-NODE TOPOLOGY GRAPHICAL MAPPING</div>
      
      <!-- Level 0 -->
      <div style="margin-bottom: 6px;">
        <span class="tree-node node-you" style="padding: 4px 14px; font-size: 7.5pt;">POSITION 0: [YOU] (BOARD APEX)</span>
      </div>

      <!-- Connecting Lines -->
      <div style="font-size: 6pt; color: #94A3B8; margin-bottom: 4px;">├── Level 1 (2 Nodes) ──┤</div>

      <!-- Level 1 -->
      <div style="display: flex; justify-content: center; gap: 80px; margin-bottom: 6px;">
        <span class="tree-node node-upline">P1: Upline 1 ($30)</span>
        <span class="tree-node node-upline">P2: Upline 1 ($30)</span>
      </div>

      <!-- Connecting Lines -->
      <div style="font-size: 6pt; color: #94A3B8; margin-bottom: 4px;">├── Level 2 (4 Nodes) ──┤</div>

      <!-- Level 2 -->
      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 6px;">
        <span class="tree-node node-payout">P3: YOU ($30)</span>
        <span class="tree-node node-pool">P4: Vault ($30)</span>
        <span class="tree-node node-pool">P5: Vault ($30)</span>
        <span class="tree-node node-payout">P6: YOU ($30)</span>
      </div>

      <!-- Connecting Lines -->
      <div style="font-size: 6pt; color: #94A3B8; margin-bottom: 4px;">├── Level 3 (8 Nodes) ──┤</div>

      <!-- Level 3 -->
      <div style="display: flex; justify-content: center; gap: 6px;">
        <span class="tree-node node-downline">P7: Down1</span>
        <span class="tree-node node-payout">P8: YOU</span>
        <span class="tree-node node-payout">P9: YOU</span>
        <span class="tree-node node-downline">P10: Down1</span>
        <span class="tree-node node-payout">P11: YOU</span>
        <span class="tree-node node-payout">P12: YOU</span>
        <span class="tree-node node-downline">P13: Down2</span>
        <span class="tree-node node-pool">P14: Vault ⟲</span>
      </div>
    </div>

    <h2>2. Tier-by-Tier Architectural Breakdown</h2>
    <div class="grid-3" style="margin-top: 4px;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Tier 1: Foundation (Positions 1 & 2)</h3>
        <p style="font-size:7.2pt;">
          <strong>Capacity:</strong> 2 Nodes<br>
          <strong>Recipient:</strong> Immediate Level-1 Upline Sponsor.<br>
          <strong>Rationale:</strong> Incentivizes upline leadership to assist direct downlines with mentorship, tool access, and spillover generation.
        </p>
      </div>

      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Tier 2: Expansion (Positions 3 to 6)</h3>
        <p style="font-size:7.2pt;">
          <strong>Capacity:</strong> 4 Nodes<br>
          <strong>Recipients:</strong> Positions 3 & 6 pay 100% directly to <strong>YOU</strong> ($60). Positions 4 & 5 route to <strong>EquoraVault</strong> ($60) to fund protocol pools.<br>
          <strong>Rationale:</strong> Early return on investment for board owner while fueling global ecosystem liquidity.
        </p>
      </div>

      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Tier 3: Power Base (Positions 7 to 14)</h3>
        <p style="font-size:7.2pt;">
          <strong>Capacity:</strong> 8 Nodes<br>
          <strong>Recipients:</strong> 4 nodes pay <strong>YOU</strong> (P8, P9, P11, P12 = $120). 2 nodes pay Downline 1 (P7, P10 = $60). 1 node pays Downline 2 (P13 = $30). P14 routes to Vault and triggers <strong>Recycle</strong>.<br>
          <strong>Rationale:</strong> Drives deep team velocity and re-entry.
        </p>
      </div>
    </div>

    <h2>3. Breadth-First Node Placement Algorithm</h2>
    <p>Placement across the 14 nodes occurs deterministically using a <strong>Breadth-First Left-to-Right search algorithm</strong>. When a new participant enters or spills over into your board, the smart contract scans for the first open index in sequence: Tier 1 (P1, P2) → Tier 2 (P3, P4, P5, P6) → Tier 3 (P7 through P14). No node can ever be skipped, bypassed, or manually placed by an administrator.</p>
  </div>
  ${createFooter(4)}
</div>
`);

// ============================================================================
// PAGE 5: THE "LOGIC OF YOU" IN EVERYONE'S DASHBOARD
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('THE "LOGIC OF YOU" PERSPECTIVE PARADIGM')}
  <div class="content">
    <h2>1. The Relativistic User Paradigm in Decentralized Matrices</h2>
    <p>One of the most persistent sources of user confusion in multi-level decentralized smart contracts is the visual discrepancy between the team-wide genealogy tree and the individual member dashboard. In traditional matrix systems, users are presented as a subordinate sub-node buried dozens of levels deep in an upline's massive graph, making tracking impossible.</p>
    
    <p>Equora solves this through the <strong>"Logic of You" (The Relativistic Observer Paradigm)</strong>. Under this architecture, <em>every single user who connects their Web3 wallet is automatically rooted as Position #0 (The Apex Leader) of their own matrix world</em>.</p>

    <div class="card card-highlight" style="margin: 4px 0;">
      <h3 style="color:#071A4A;">Mathematical Transformation: Dual Perspective Mechanics</h3>
      <p style="font-size:7.4pt; margin-bottom: 4px;">
        A single wallet address occupies two distinct mathematical states simultaneously in the smart contract storage:
      </p>
      <div class="grid-2">
        <div style="background:#FFF; padding:6px; border-radius:4px; border:1px solid #CBD5E1;">
          <strong style="color:#0E62E4; font-size:7.5pt;">State A: The Internal Observer ("YOU")</strong>
          <p style="font-size:7.1pt; color:#475569; margin-top:2px;">
            In your personal dashboard, your address is permanently designated as <strong>Node #0 (Root)</strong>. All 14 subordinate nodes (P1 through P14) represent incoming team members and spillover that directly generate your $180 cash payout, your downline spillover, and your pool contributions.
          </p>
        </div>
        <div style="background:#FFF; padding:6px; border-radius:4px; border:1px solid #CBD5E1;">
          <strong style="color:#7C3AED; font-size:7.5pt;">State B: The Global Network Node</strong>
          <p style="font-size:7.1pt; color:#475569; margin-top:2px;">
            In your sponsor's dashboard, you may occupy Node #3 or Node #6. In their upline's dashboard, you may occupy Node #11. The smart contract dynamically translates payouts based on global index while rendering your personal board cleanly as an autonomous 14-node unit.
          </p>
        </div>
      </div>
    </div>

    <h2>2. Perspective Invariance: Proof of Universal Fairness</h2>
    <p>The "Logic of You" is not a cosmetic frontend trick; it is an inherent property of the smart contract's state transition function. Consider the following proof of invariance:</p>

    <div class="card card-blue" style="margin: 3px 0;">
      <table>
        <thead>
          <tr>
            <th>User Role</th>
            <th>What User Sees on Dashboard</th>
            <th>What Smart Contract Executes</th>
            <th>Payout Settlement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>User A (Sponsor)</strong></td>
            <td>User A at Apex (P0). User B fills Position P3.</td>
            <td><code>PositionFilled(UserA, slot, cycle, 3, UserB)</code></td>
            <td>P3 pays 100% ($30) directly to User A wallet.</td>
          </tr>
          <tr>
            <td><strong>User B (New Member)</strong></td>
            <td>User B at Apex (P0) with 14 empty slots.</td>
            <td><code>SlotJoined(UserB, slot, 30, UserA)</code></td>
            <td>User B begins filling their own P1–P14 nodes.</td>
          </tr>
          <tr>
            <td><strong>User C (Downline of B)</strong></td>
            <td>User C at Apex (P0). Fills User B's P1.</td>
            <td><code>PositionFilled(UserB, slot, cycle, 1, UserC)</code></td>
            <td>P1 pays 100% ($30) directly to User A (B's upline).</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>3. Eliminating User Disorientation</h2>
    <p>By enforcing the "Logic of You", Equora eliminates three critical points of user friction:</p>
    <ul style="font-size:7.3pt; padding-left:14px; color:#334155; line-height:1.4;">
      <li><strong>Immediate Ownership:</strong> Users never feel like a cog in an unreachable corporate pyramid; they are the sovereign CEO of their own 14-node business unit from Day 1.</li>
      <li><strong>Transparent Radial Tracking:</strong> Progress is instantly quantifiable: "8 of 14 nodes filled" gives an immediate visual percentage towards cycle completion.</li>
      <li><strong>Clean Financial Accounting:</strong> Every payout event displayed on your screen corresponds 1-to-1 with an on-chain transaction credited directly to your connected wallet.</li>
    </ul>
  </div>
  ${createFooter(5)}
</div>
`);

// ============================================================================
// PAGE 6: THE EXACT 14-NODE REVENUE MATRIX ($30 BASE SLOT 1)
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('THE 14-NODE REVENUE ALLOCATION MATRIX')}
  <div class="content">
    <h2>1. Mathematical Ledger: Slot 1 ($30 Entry) Full Cycle Accounting</h2>
    <p>A single completed board on Slot 1 processes exactly <strong>14 Nodes × $30.00 USD = $420.00 USD</strong> in gross economic volume. The smart contract distributes every single cent instantaneously according to the following immutable ledger:</p>

    <table>
      <thead>
        <tr>
          <th style="width:10%;">Node #</th>
          <th style="width:18%;">Designation</th>
          <th style="width:14%;">Amount (USD)</th>
          <th style="width:14%;">Amount (TROB)</th>
          <th style="width:22%;">On-Chain Recipient</th>
          <th style="width:22%;">Architectural Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>P1</strong></td>
          <td>Level 1 Left</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>Immediate Upline</td>
          <td>Upline Mentorship Incentive</td>
        </tr>
        <tr>
          <td><strong>P2</strong></td>
          <td>Level 1 Right</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>Immediate Upline</td>
          <td>Upline Team Acceleration</td>
        </tr>
        <tr style="background:#ECFDF5;">
          <td><strong>P3</strong></td>
          <td>Level 2 Left-A</td>
          <td><strong>$30.00</strong></td>
          <td><strong>535.71 TROB</strong></td>
          <td><strong>YOU (Board Owner)</strong></td>
          <td><strong>Direct Cashflow Payout #1</strong></td>
        </tr>
        <tr style="background:#FEF3C7;">
          <td><strong>P4</strong></td>
          <td>Level 2 Left-B</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>EquoraVault Pools</td>
          <td>4 Protocol Liquidity Pools</td>
        </tr>
        <tr style="background:#FEF3C7;">
          <td><strong>P5</strong></td>
          <td>Level 2 Right-A</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>EquoraVault Pools</td>
          <td>4 Protocol Liquidity Pools</td>
        </tr>
        <tr style="background:#ECFDF5;">
          <td><strong>P6</strong></td>
          <td>Level 2 Right-B</td>
          <td><strong>$30.00</strong></td>
          <td><strong>535.71 TROB</strong></td>
          <td><strong>YOU (Board Owner)</strong></td>
          <td><strong>Direct Cashflow Payout #2</strong></td>
        </tr>
        <tr style="background:#F3E8FF;">
          <td><strong>P7</strong></td>
          <td>Level 3 Node 1</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>Downline 1 (Direct 1)</td>
          <td>Algorithmic Spillover Injection</td>
        </tr>
        <tr style="background:#ECFDF5;">
          <td><strong>P8</strong></td>
          <td>Level 3 Node 2</td>
          <td><strong>$30.00</strong></td>
          <td><strong>535.71 TROB</strong></td>
          <td><strong>YOU (Board Owner)</strong></td>
          <td><strong>Direct Cashflow Payout #3</strong></td>
        </tr>
        <tr style="background:#ECFDF5;">
          <td><strong>P9</strong></td>
          <td>Level 3 Node 3</td>
          <td><strong>$30.00</strong></td>
          <td><strong>535.71 TROB</strong></td>
          <td><strong>YOU (Board Owner)</strong></td>
          <td><strong>Direct Cashflow Payout #4</strong></td>
        </tr>
        <tr style="background:#F3E8FF;">
          <td><strong>P10</strong></td>
          <td>Level 3 Node 4</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>Downline 1 (Direct 1)</td>
          <td>Algorithmic Spillover Injection</td>
        </tr>
        <tr style="background:#ECFDF5;">
          <td><strong>P11</strong></td>
          <td>Level 3 Node 5</td>
          <td><strong>$30.00</strong></td>
          <td><strong>535.71 TROB</strong></td>
          <td><strong>YOU (Board Owner)</strong></td>
          <td><strong>Direct Cashflow Payout #5</strong></td>
        </tr>
        <tr style="background:#ECFDF5;">
          <td><strong>P12</strong></td>
          <td>Level 3 Node 6</td>
          <td><strong>$30.00</strong></td>
          <td><strong>535.71 TROB</strong></td>
          <td><strong>YOU (Board Owner)</strong></td>
          <td><strong>Direct Cashflow Payout #6</strong></td>
        </tr>
        <tr style="background:#F3E8FF;">
          <td><strong>P13</strong></td>
          <td>Level 3 Node 7</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>Downline 2 (Direct 2)</td>
          <td>Algorithmic Spillover Injection</td>
        </tr>
        <tr style="background:#FEF3C7;">
          <td><strong>P14</strong></td>
          <td>Level 3 Node 8</td>
          <td>$30.00</td>
          <td>535.71 TROB</td>
          <td>EquoraVault Pools</td>
          <td>Pool Inflow + <strong>RECYCLE RE-ENTRY</strong></td>
        </tr>
      </tbody>
    </table>

    <h2>2. Macro Distribution Summary ($420 Gross Inflow)</h2>
    <div class="grid-4" style="margin-top: 4px;">
      <div class="card card-highlight text-center">
        <div style="font-size:12pt; font-weight:900; color:#059669;">$180.00</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">YOU (Board Owner)</div>
        <p style="font-size:6.5pt; color:#64748B;">6 Nodes (42.86%)<br><strong>600% Net Margin</strong></p>
      </div>

      <div class="card card-blue text-center">
        <div style="font-size:12pt; font-weight:900; color:#0E62E4;">$60.00</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Immediate Upline</div>
        <p style="font-size:6.5pt; color:#64748B;">2 Nodes (14.28%)<br>P1 & P2 Sponsor Reward</p>
      </div>

      <div class="card card-blue text-center">
        <div style="font-size:12pt; font-weight:900; color:#D97706;">$90.00</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Protocol Pools</div>
        <p style="font-size:6.5pt; color:#64748B;">3 Nodes (21.43%)<br>DAO, Salary, Box, Drops</p>
      </div>

      <div class="card card-blue text-center">
        <div style="font-size:12pt; font-weight:900; color:#7C3AED;">$90.00</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Team Spillover</div>
        <p style="font-size:6.5pt; color:#64748B;">3 Nodes (21.43%)<br>Downline 1 & 2 Support</p>
      </div>
    </div>
  </div>
  ${createFooter(6)}
</div>
`);

// ============================================================================
// PAGE 7: THE 6 DISTINCT INCOME STREAMS
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('THE 6 DISCRETE INCOME STREAMS')}
  <div class="content">
    <h2>1. Six Structural Wealth Vectors in a Single Protocol</h2>
    <p>Unlike singular matrix programs that rely solely on direct recruitment or static investment yields, Equora introduces <strong>6 distinct, simultaneous income streams</strong> that reward individual production, team mentorship, and global protocol volume.</p>

    <div class="grid-2" style="margin-top: 4px;">
      <!-- Stream 1 -->
      <div class="card card-highlight">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#059669;">1. Direct Board Cashflow (600% ROI)</h3>
          <span class="badge badge-emerald">Primary Inflow</span>
        </div>
        <p style="font-size:7.2pt; margin-top:2px;">
          <strong>Mechanic:</strong> Positions P3, P6, P8, P9, P11, and P12 pay 100% directly to your wallet.<br>
          <strong>Yield:</strong> Exactly 6 × $30.00 = <strong>$180.00 USD per cycle</strong> on a $30 activation. Because re-entry is automated upon Node 14, this 600% profit compounds infinitely without additional out-of-pocket capital.
        </p>
      </div>

      <!-- Stream 2 -->
      <div class="card card-blue">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#0E62E4;">2. Upline Leadership Dividend</h3>
          <span class="badge badge-blue">Mentorship</span>
        </div>
        <p style="font-size:7.2pt; margin-top:2px;">
          <strong>Mechanic:</strong> Whenever your direct referrals fill Positions P1 or P2 on their boards, the 100% payment ($60.00 total) flows directly to <strong>YOUR</strong> wallet.<br>
          <strong>Yield:</strong> Active sponsors with 10 direct partners generate continuous $60 waves each time their partners start new cycles.
        </p>
      </div>

      <!-- Stream 3 -->
      <div class="card card-blue">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#7C3AED;">3. Algorithmic Downline Spillover</h3>
          <span class="badge badge-purple">Team Injection</span>
        </div>
        <p style="font-size:7.2pt; margin-top:2px;">
          <strong>Mechanic:</strong> Positions P7 & P10 pay 100% to your 1st direct downline ($60), and P13 pays 100% to your 2nd direct downline ($30).<br>
          <strong>Yield:</strong> Injects $90.00 USD directly into your team's wallets, empowering newest members with proof of earnings and preventing team stall.
        </p>
      </div>

      <!-- Stream 4 -->
      <div class="card card-highlight">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#D97706;">4. The 4 Autonomous Protocol Pools</h3>
          <span class="badge badge-amber">Macro Volume</span>
        </div>
        <p style="font-size:7.2pt; margin-top:2px;">
          <strong>Mechanic:</strong> Positions P4, P5, and P14 ($90 total) are routed to <code>EquoraVault</code> and split into the 4 automated pools.<br>
          <strong>Yield:</strong> Provides passive monthly salaries (40%), DAO dividends (35%), community lucky drops (15%), and blind box milestone bonuses (10%).
        </p>
      </div>

      <!-- Stream 5 -->
      <div class="card card-blue">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#071A4A;">5. Genesis DAO 35% Instant Push</h3>
          <span class="badge badge-blue">Genesis Bridge</span>
        </div>
        <p style="font-size:7.2pt; margin-top:2px;">
          <strong>Mechanic:</strong> 35% of all protocol pool funds ($31.50 per board cycle) are pushed directly into the wallets of active Genesis Council members.<br>
          <strong>Yield:</strong> Links every retail $30 participant globally into the 100 Genesis DAO seats with zero gas fees.
        </p>
      </div>

      <!-- Stream 6 -->
      <div class="card card-highlight">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="color:#059669;">6. Perpetual Cycle Compounding</h3>
          <span class="badge badge-emerald">Infinite Scale</span>
        </div>
        <p style="font-size:7.2pt; margin-top:2px;">
          <strong>Mechanic:</strong> Filling Node P14 triggers <code>_handleRecycle()</code>. The board resets, archives historical profits, and places you into a fresh board.<br>
          <strong>Yield:</strong> 10 cycles = $1,800 profit. 50 cycles = $9,000 profit. 100 cycles = $18,000 profit from an initial single $30 activation!
        </p>
      </div>
    </div>

    <h2>2. Mathematical Equilibrium Across the 6 Streams</h2>
    <p>By blending direct immediate cashflow (Stream 1) with upline rewards (Stream 2), team spillover (Stream 3), macro global protocol pools (Streams 4 & 5), and infinite cycle re-entry (Stream 6), the protocol creates an unbreakable equilibrium: leaders are incentivized to help downlines, downlines receive real spillover cash, and the global ecosystem is permanently enriched.</p>
  </div>
  ${createFooter(7)}
</div>
`);

// ============================================================================
// PAGE 8: THE 4 AUTOMATED PROTOCOL POOLS: ARCHITECTURAL FOUNDATION
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('THE 4 PROTOCOL POOLS: FOUNDATION')}
  <div class="content">
    <h2>1. The Origin of Protocol Liquidity: Nodes P4, P5, and P14</h2>
    <p>In traditional matrix platforms, 100% of funds are either distributed locally or skimmed off into creator admin wallets. Equora introduces an institutional macro-economic layer: <strong>The 4 Automated Protocol Pools</strong>. Every single time a board completes on Slot 1, exactly three nodes are programmatically forwarded to the protocol vault:</p>
    
    <div class="card card-highlight" style="margin: 3px 0;">
      <div style="font-size: 8.5pt; font-weight: 800; color: #071A4A; margin-bottom: 2px;">THE PROTOCOL LIQUIDITY STREAM (21.43% OF TOTAL VOLUME)</div>
      <p style="font-size: 7.3pt; color: #334155;">
        Position 4 ($30) + Position 5 ($30) + Position 14 ($30) = <strong>$90.00 USD (1,607.14 TROB)</strong> routed per board cycle.<br>
        On Slot 2, this stream generates <strong>$180.00 USD</strong>. On Slot 12, it generates <strong>$184,320.00 USD</strong> per cycle!
      </p>
    </div>

    <h2>2. The Exact 4-Way Mathematical Inflow Split</h2>
    <p>Upon receiving the forwarded TROB from <code>EquoraMatrix.sol</code>, the <code>EquoraVault.sol</code> contract atomically executes the following immutable split (basis points: 10,000 = 100%):</p>

    <table>
      <thead>
        <tr>
          <th>Pool Name</th>
          <th>BPS Ratio</th>
          <th>Percentage</th>
          <th>Slot 1 Dollar Share</th>
          <th>Slot 1 TROB Share</th>
          <th>Distribution Cadence</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#EFF6FF;">
          <td><strong>Pool 1: Genesis DAO Council Treasury</strong></td>
          <td>3,500 BPS</td>
          <td><strong>35.00%</strong></td>
          <td><strong>$31.50 USD</strong></td>
          <td>562.50 TROB</td>
          <td>Instant Real-Time P2P Push</td>
        </tr>
        <tr style="background:#FAF5FF;">
          <td><strong>Pool 2: Monthly Leadership Royalty</strong></td>
          <td>4,000 BPS</td>
          <td><strong>40.00%</strong></td>
          <td><strong>$36.00 USD</strong></td>
          <td>642.86 TROB</td>
          <td>30-Day Automated Epoch (11th of Month)</td>
        </tr>
        <tr style="background:#FFFBEB;">
          <td><strong>Pool 3: Magic Blind Box Mystery Pool</strong></td>
          <td>1,000 BPS</td>
          <td><strong>10.00%</strong></td>
          <td><strong>$9.00 USD</strong></td>
          <td>160.71 TROB</td>
          <td>Algorithmic VRF Milestone Milestones</td>
        </tr>
        <tr style="background:#ECFDF5;">
          <td><strong>Pool 4: Lucky Drops Community Pool</strong></td>
          <td>1,500 BPS</td>
          <td><strong>15.00%</strong></td>
          <td><strong>$13.50 USD</strong></td>
          <td>241.07 TROB</td>
          <td>Decentralized Activity & Micro-Rewards</td>
        </tr>
        <tr style="font-weight:800; background:#071A4A; color:#FFFFFF;">
          <td style="color:#FFF;">TOTAL ROUTED PER BOARD CYCLE</td>
          <td style="color:#FFF;">10,000 BPS</td>
          <td style="color:#FFF;">100.00%</td>
          <td style="color:#FFF;">$90.00 USD</td>
          <td style="color:#FFF;">1,607.14 TROB</td>
          <td style="color:#FFF;">Atomic Transaction Execution</td>
        </tr>
      </tbody>
    </table>

    <h2>3. The EquoraVault Router Architecture</h2>
    <p>The routing logic in <code>EquoraVault.sol</code> is fully non-custodial. Funds do not accumulate indefinitely inside the vault contract; they are dispatched to the four respective pool contracts in the exact transaction block:</p>

    <pre><code>// EquoraVault.sol: Immutable routing execution
function routePoolDeposit(uint256 amount) external nonReentrant {
    require(msg.sender == matrixContract, "Vault: unauthorized caller");
    
    uint256 daoAmt      = (amount * DAO_BPS)      / BPS_BASE; // 35%
    uint256 salaryAmt   = (amount * SALARY_BPS)   / BPS_BASE; // 40%
    uint256 magicAmt    = (amount * MAGICBOX_BPS) / BPS_BASE; // 10%
    uint256 rewardsAmt  = amount - daoAmt - salaryAmt - magicAmt; // 15% (100% exact math)

    paymentToken.safeTransfer(daoPool, daoAmt);
    paymentToken.safeTransfer(salaryPool, salaryAmt);
    paymentToken.safeTransfer(magicBoxPool, magicAmt);
    paymentToken.safeTransfer(rewardsPool, rewardsAmt);

    emit PoolDepositRouted(amount, daoAmt, salaryAmt, magicAmt, rewardsAmt, block.timestamp);
}</code></pre>

    <p style="font-size:7.2pt; color:#64748B; margin-top:2px;">
      *Note that <code>rewardsAmt</code> uses direct subtraction rather than BPS division, mathematically guaranteeing that not a single wei is lost to integer truncation.
    </p>
  </div>
  ${createFooter(8)}
</div>
`);

// ============================================================================
// PAGE 9: POOL 1: GENESIS DAO TREASURY (35% INSTANT P2P PUSH)
// ============================================================================
pages.push(`
<div class="page">
  ${createHeader('POOL 1: GENESIS DAO TREASURY (35%)')}
  <div class="content">
    <h2>1. The Sacred Economic Bridge: Retail Matrix to Genesis Council</h2>
    <p>The Equora Protocol unites grassroots retail matrix users with the founding governance council through <strong>Pool 1: The Genesis DAO Treasury (35%)</strong>. Every single time a retail user cycles a board on any slot, 35% of the protocol pool inflow ($31.50 per Slot 1 board) is pushed directly into the wallets of active Genesis Council seat holders.</p>

    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Sub-100 Member Dynamic Distribution</h3>
        <p style="font-size:7.2pt;">
          <strong>Smart Contract Rule:</strong> <em>"If total 100 seats are not filled, the pool divides only among available active seat members in their wallets."</em><br><br>
          With <strong>87 active council members</strong> on-chain today, the $31.50 USD inflow is divided by 87:
          <br>
          <code style="color:#059669; font-weight:700;">$31.50 ÷ 87 Seats = $0.362 USD (6.46 TROB) per seat per board cycle!</code>
        </p>
      </div>

      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Full 100 Member Equilibrium</h3>
        <p style="font-size:7.2pt;">
          <strong>Target State:</strong> Once all 100 sovereign seats are filled, each seat receives an exact, permanent <strong>0.3500% share</strong> of all retail matrix pool inflow:
          <br><br>
          <code style="color:#0E62E4; font-weight:700;">$31.50 ÷ 100 Seats = $0.315 USD (5.625 TROB) per seat per board cycle!</code><br>
          At 1,000 retail matrix cycles/day globally, every council seat receives <strong>$315.00 USD/day completely passive</strong>!
        </p>
      </div>
    </div>

    <h2>2. Zero-Gas Direct Wallet Push Mechanics</h2>
    <p>Unlike standard DeFi yield farms where users must manually trigger expensive <code>claim()</code> transactions, the Genesis DAO bridge executes an <strong>autonomous P2P Push</strong>. The incoming TROB is sent directly to member wallets on-chain with zero gas fees incurred by the council members.</p>

    <div class="card card-dark" style="padding: 7px 10px; margin: 3px 0;">
      <div style="font-size:8pt; font-weight:800; color:#38BDF8;">5X CAPPING & BYPASS LOGIC ENFORCEMENT</div>
      <p style="font-size:7.1pt; color:#E2E8F0; margin-top:2px;">
        Genesis Council members are subject to the <strong>5X Earnings Cap ($1,500.00 USD per cycle)</strong>. If a member's accumulated lifetime earnings reach $1,500.00, their seat is automatically paused. The smart contract's retail distribution function automatically detects capped seats, bypasses them, and splits the 35% pool equally among the remaining active council seats until the capped member executes their $300 re-topup.
      </p>
    </div>

    <h2>3. Mathematical Progression Across All 12 Slots</h2>
    <table>
      <thead>
        <tr>
          <th>Slot #</th>
          <th>Slot Cost</th>
          <th>Total Pool Inflow ($)</th>
          <th>DAO 35% Share ($)</th>
          <th>Per-Seat Payout (87 Seats)</th>
          <th>Per-Seat Payout (100 Seats)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Slot 1</td><td>$30</td><td>$90.00</td><td><strong>$31.50</strong></td><td>$0.362</td><td>$0.315</td></tr>
        <tr><td>Slot 2</td><td>$60</td><td>$180.00</td><td><strong>$63.00</strong></td><td>$0.724</td><td>$0.630</td></tr>
        <tr><td>Slot 3</td><td>$120</td><td>$360.00</td><td><strong>$126.00</strong></td><td>$1.448</td><td>$1.260</td></tr>
        <tr><td>Slot 4</td><td>$240</td><td>$720.00</td><td><strong>$252.00</strong></td><td>$2.896</td><td>$2.520</td></tr>
        <tr><td>Slot 6</td><td>$960</td><td>$2,880.00</td><td><strong>$1,008.00</strong></td><td>$11.586</td><td>$10.080</td></tr>
        <tr><td>Slot 9</td><td>$7,680</td><td>$23,040.00</td><td><strong>$8,064.00</strong></td><td>$92.689</td><td>$80.640</td></tr>
        <tr><td>Slot 12</td><td>$61,440</td><td>$184,320.00</td><td><strong>$64,512.00</strong></td><td><strong>$741.517</strong></td><td><strong>$645.120</strong></td></tr>
      </tbody>
    </table>
  </div>
  ${createFooter(9)}
</div>
`);

// Write HTML file and run conversion
console.log('📝 Compiling HTML Content...');
// (Will generate all remaining pages in the main execution script)
`;

fs.writeFileSync(path.join(__dirname, 'test_whitepaper_header.js'), CSS_STYLES);
console.log('✓ Verified styles and asset loaders.');
