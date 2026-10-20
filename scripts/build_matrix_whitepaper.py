import os
import sys
import base64
import subprocess
import shutil

ASSETS_DIR = r"c:\Users\Dell\Documents\codes\equorafi\equorafidocs\docs\assets"
DOCS_DIR = r"c:\Users\Dell\Documents\codes\equorafi\docs"
EQUORA_DOCS_DIR = r"c:\Users\Dell\Documents\codes\equorafi\equorafidocs\docs"
A4_DIR = r"c:\Users\Dell\Documents\codes\equorafi\equorafidocs\docs\01_A4_Portrait_Whitepapers"
ARTIFACT_DIR = r"C:\Users\Dell\.gemini\antigravity-ide\brain\de42cc02-dc83-412e-8004-6154a8c7e998"

for d in [DOCS_DIR, EQUORA_DOCS_DIR, A4_DIR, ARTIFACT_DIR]:
    os.makedirs(d, exist_ok=True)

HTML_FILE = os.path.join(DOCS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.html")
PDF_FILE_1 = os.path.join(DOCS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
PDF_FILE_2 = os.path.join(EQUORA_DOCS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
PDF_FILE_3 = os.path.join(A4_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
PDF_FILE_ARTIFACT = os.path.join(ARTIFACT_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")

def to_base64(filepath):
    if not os.path.exists(filepath):
        return ""
    ext = os.path.splitext(filepath)[1].lower().replace(".", "")
    if ext == "jpg":
        ext = "jpeg"
    with open(filepath, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{ext};base64,{data}"

logo_b64 = to_base64(os.path.join(ASSETS_DIR, "equorafilogo-removebg-preview.png"))

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

print("Asset loaded. Compiling 34-Page Master Whitepaper HTML...")

CSS = """
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
    margin-bottom: 5px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-logo {
    height: 19px;
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
    margin-top: 5px;
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
    gap: 5px;
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
    padding: 5px 8px;
  }
  .card-blue { background: #F8FAFC; border: 1px solid #CBD5E1; }
  .card-highlight { background: #F0F7FF; border: 1px solid #BAE6FD; }
  .card-dark { background: #071A4A; color: #FFFFFF; border: none; }
  .card-dark h2, .card-dark h3, .card-dark strong { color: #FFFFFF; }
  .card-dark p { color: #CBD5E1; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
  .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 5px; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.2pt;
    margin: 2px 0;
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
    padding: 2.8px 5px;
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
"""

def header(sec):
    logo_tag = f'<img src="{logo_b64}" class="header-logo" alt="Equora">' if logo_b64 else ""
    return f"""
    <div class="doc-header">
      <div class="header-left">
        {logo_tag}
        <div class="header-title">EQUORA.FI • MASTER SPECIFICATION V6.0</div>
      </div>
      <div class="header-right">{sec}</div>
    </div>
    """

def footer(n, total=34):
    return f"""
    <div class="doc-footer">
      <span>EQUORA.FI RETAIL MATRIX SPECIFICATION • 100% ON-CHAIN TROBCHAIN AUTONOMOUS PROTOCOL</span>
      <span class="page-number">PAGE {n} OF {total}</span>
    </div>
    """

pages = []

# ==================== PAGE 1: COVER ====================
pages.append(f"""
<div class="page" style="background: linear-gradient(145deg, #071A4A 0%, #0A2540 60%, #0F356B 100%); color: #FFFFFF; justify-content: space-between; padding: 22mm 14mm;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px;">
    {f'<img src="{logo_b64}" style="height: 38px; filter: brightness(0) invert(1);" alt="Equora">' if logo_b64 else '<h2 style="color:#FFF;">EQUORA.FI</h2>'}
    <div style="text-align: right; font-size: 7.5pt; font-weight: 700; color: #38BDF8; letter-spacing: 1px;">
      OFFICIAL MASTER WHITEPAPER • VERSION 6.0<br>
      <span style="color: #94A3B8; font-weight: 400;">TROBCHAIN MAINNET PROTOCOL SPECIFICATION</span>
    </div>
  </div>

  <div style="margin: 20mm 0; text-align: left;">
    <div style="display: inline-block; padding: 3px 10px; background: rgba(14, 98, 228, 0.35); border: 1px solid #38BDF8; border-radius: 6px; font-size: 8pt; font-weight: 800; color: #38BDF8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
      DECENTRALIZED RETAIL WEALTH ENGINE
    </div>
    <h1 style="font-size: 26pt; font-weight: 900; line-height: 1.15; color: #FFFFFF; letter-spacing: -0.8px; margin-bottom: 12px;">
      THE EQUORA MATRIX<br>
      <span style="color: #38BDF8;">$30 RETAIL PROTOCOL</span>
    </h1>
    <p style="font-size: 10.5pt; color: #E2E8F0; max-width: 92%; line-height: 1.5; font-weight: 300;">
      A comprehensive mathematical and cryptographic exposition of the non-custodial 14-node binary compression topology, 12 progressive value slots, 4 automated protocol liquidity pools, and the relativistic "Logic of You" decentralized distribution architecture.
    </p>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 22mm;">
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
""")

# ==================== PAGE 2: TABLE OF CONTENTS ====================
pages.append(f"""
<div class="page">
  {header('TABLE OF CONTENTS & GLOSSARY')}
  <div class="content">
    <h2>1. Master Document Architecture</h2>
    <p>This document constitutes the authoritative specification for the Equora Matrix Protocol. Every mathematical model, smart contract function, and economic distribution mechanism described herein is deployed immutably on TrobChain mainnet.</p>
    
    <div class="grid-2" style="margin-top: 3px;">
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
  {footer(2)}
</div>
""")

# ==================== PAGE 3: FOUNDATIONAL ARCHITECTURE ====================
pages.append(f"""
<div class="page">
  {header('THE FOUNDATIONAL ARCHITECTURE')}
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
  {footer(3)}
</div>
""")

# ==================== PAGE 4: 14-NODE TOPOLOGY ====================
pages.append(f"""
<div class="page">
  {header('THE 14-NODE / 15-POSITION TOPOLOGY')}
  <div class="content">
    <h2>1. Geometric Blueprint of the Compressed Binary Tree</h2>
    <p>The Equora Matrix is engineered as a <strong>3-tier compressed binary structure</strong>. Each matrix board comprises exactly 15 distinct positions: 1 Root Apex Position (occupied by the board owner, designated as "YOU"), supported by 14 subordinate child nodes arranged in a 2-4-8 progression across three levels.</p>

    <div class="card card-highlight" style="text-align: center; padding: 10px 4px; margin: 4px 0;">
      <div style="font-size: 7.5pt; font-weight: 800; color: #071A4A; margin-bottom: 6px;">EQUORA MATRIX 14-NODE TOPOLOGY GRAPHICAL MAPPING</div>
      
      <div style="margin-bottom: 6px;">
        <span class="tree-node node-you" style="padding: 4px 14px; font-size: 7.5pt;">POSITION 0: [YOU] (BOARD APEX)</span>
      </div>

      <div style="font-size: 6pt; color: #94A3B8; margin-bottom: 4px;">├── Level 1 (2 Nodes) ──┤</div>

      <div style="display: flex; justify-content: center; gap: 80px; margin-bottom: 6px;">
        <span class="tree-node node-upline">P1: Upline 1 ($30)</span>
        <span class="tree-node node-upline">P2: Upline 1 ($30)</span>
      </div>

      <div style="font-size: 6pt; color: #94A3B8; margin-bottom: 4px;">├── Level 2 (4 Nodes) ──┤</div>

      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 6px;">
        <span class="tree-node node-payout">P3: YOU ($30)</span>
        <span class="tree-node node-pool">P4: Vault ($30)</span>
        <span class="tree-node node-pool">P5: Vault ($30)</span>
        <span class="tree-node node-payout">P6: YOU ($30)</span>
      </div>

      <div style="font-size: 6pt; color: #94A3B8; margin-bottom: 4px;">├── Level 3 (8 Nodes) ──┤</div>

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
  {footer(4)}
</div>
""")

# ==================== PAGE 5: LOGIC OF YOU ====================
pages.append(f"""
<div class="page">
  {header('THE "LOGIC OF YOU" PERSPECTIVE PARADIGM')}
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
  {footer(5)}
</div>
""")

# ==================== PAGE 6: 14-NODE REVENUE MATRIX ====================
pages.append(f"""
<div class="page">
  {header('THE 14-NODE REVENUE ALLOCATION MATRIX')}
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
  {footer(6)}
</div>
""")

# ==================== PAGE 7: THE 6 INCOME STREAMS ====================
pages.append(f"""
<div class="page">
  {header('THE 6 DISCRETE INCOME STREAMS')}
  <div class="content">
    <h2>1. Six Structural Wealth Vectors in a Single Protocol</h2>
    <p>Unlike singular matrix programs that rely solely on direct recruitment or static investment yields, Equora introduces <strong>6 distinct, simultaneous income streams</strong> that reward individual production, team mentorship, and global protocol volume.</p>

    <div class="grid-2" style="margin-top: 4px;">
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
  {footer(7)}
</div>
""")

# ==================== PAGE 8: 4 PROTOCOL POOLS FOUNDATION ====================
pages.append(f"""
<div class="page">
  {header('THE 4 PROTOCOL POOLS: FOUNDATION')}
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
function routePoolDeposit(uint256 amount) external nonReentrant {{
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
}}</code></pre>

    <p style="font-size:7.2pt; color:#64748B; margin-top:2px;">
      *Note that <code>rewardsAmt</code> uses direct subtraction rather than BPS division, mathematically guaranteeing that not a single wei is lost to integer truncation.
    </p>
  </div>
  {footer(8)}
</div>
""")

# ==================== PAGE 9: POOL 1 GENESIS DAO ====================
pages.append(f"""
<div class="page">
  {header('POOL 1: GENESIS DAO TREASURY (35%)')}
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
  {footer(9)}
</div>
""")

# ==================== PAGE 10: POOL 2 MONTHLY ROYALTY ====================
pages.append(f"""
<div class="page">
  {header('POOL 2: LEADERSHIP ROYALTY (40%)')}
  <div class="content">
    <h2>1. The 30-Day Automated Epoch Royalty Engine</h2>
    <p><strong>Pool 2: The Monthly Leadership Royalty Pool (40%)</strong> represents the protocol's premier long-term incentive for builders, community leaders, and ecosystem organizers. Exactly 40.00% of all protocol pool funds ($36.00 per Slot 1 board cycle) accumulate inside <code>EquoraSalaryPool.sol</code> and are disbursed on the <strong>11th of every month</strong> across four qualified leadership tiers.</p>

    <div class="grid-4" style="margin: 4px 0;">
      <div class="card card-blue text-center">
        <span class="badge badge-blue">Tier 1: Alpha</span>
        <div style="font-size:11pt; font-weight:900; color:#0E62E4; margin-top:2px;">10% Pool Share</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Requirement:</strong> Milestones ≥ 42<br>
          (14 nodes × 3 levels unlocked)
        </p>
      </div>

      <div class="card card-blue text-center">
        <span class="badge badge-emerald">Tier 2: Prime</span>
        <div style="font-size:11pt; font-weight:900; color:#059669; margin-top:2px;">10% Pool Share</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Requirement:</strong> Milestones ≥ 84<br>
          (14 nodes × 6 levels unlocked)
        </p>
      </div>

      <div class="card card-blue text-center">
        <span class="badge badge-amber">Tier 3: Elite</span>
        <div style="font-size:11pt; font-weight:900; color:#D97706; margin-top:2px;">10% Pool Share</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Requirement:</strong> Milestones ≥ 126<br>
          (14 nodes × 9 levels unlocked)
        </p>
      </div>

      <div class="card card-blue text-center">
        <span class="badge badge-purple">Tier 4: Crown</span>
        <div style="font-size:11pt; font-weight:900; color:#7C3AED; margin-top:2px;">10% Pool Share</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Requirement:</strong> Milestones ≥ 168<br>
          (14 nodes × 12 levels unlocked)
        </p>
      </div>
    </div>

    <h2>2. Cumulative Stacking Advantage</h2>
    <p>A crucial architectural feature of the Royalty Pool is <strong>Cumulative Stacking</strong>. Higher-ranking leaders do not lose access to subordinate pools upon promotion; instead, they participate in all tiers for which they qualify:</p>
    <ul style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45;">
      <li><strong>Prime Leaders</strong> participate in both the Prime Pool (10%) AND the Alpha Pool (10%).</li>
      <li><strong>Elite Leaders</strong> participate in the Elite (10%), Prime (10%), AND Alpha (10%) Pools.</li>
      <li><strong>Crown Leaders</strong> participate in ALL FOUR tiers, earning 40% of the entire monthly royalty accumulation!</li>
    </ul>

    <h2>3. Projected Monthly Leadership Salary Scenarios</h2>
    <table>
      <thead>
        <tr>
          <th>Global Matrix Volume/Month</th>
          <th>Total Pool 2 Inflow (40%)</th>
          <th>Alpha Pool (10%)</th>
          <th>Prime Pool (10%)</th>
          <th>Elite Pool (10%)</th>
          <th>Crown Pool (10%)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>$100,000 USD (Base Retail)</td><td>$8,571.43</td><td>$2,142.86</td><td>$2,142.86</td><td>$2,142.86</td><td>$2,142.86</td></tr>
        <tr><td>$500,000 USD (Expansion)</td><td>$42,857.14</td><td>$10,714.29</td><td>$10,714.29</td><td>$10,714.29</td><td>$10,714.29</td></tr>
        <tr><td>$2,000,000 USD (Global Scale)</td><td>$171,428.57</td><td>$42,857.14</td><td>$42,857.14</td><td>$42,857.14</td><td>$42,857.14</td></tr>
        <tr><td>$10,000,000 USD (Maturity)</td><td><strong>$857,142.86</strong></td><td><strong>$214,285.71</strong></td><td><strong>$214,285.71</strong></td><td><strong>$214,285.71</strong></td><td><strong>$214,285.71</strong></td></tr>
      </tbody>
    </table>

    <div class="card card-dark" style="padding: 7px 10px; margin-top: 3px;">
      <div style="font-size:8pt; font-weight:800; color:#38BDF8;">UNCLAIMED CARRY-OVER GUARANTEE</div>
      <p style="font-size:7.1pt; color:#E2E8F0; margin-top:2px;">
        If a specific tier has zero qualified leaders in an epoch (for example, in Month 1 before any user achieves Crown status), the unallocated TROB does NOT burn or return to creators. It carries over automatically into the next 30-day epoch, creating a supercharged jackpot for the first qualified pioneer.
      </p>
    </div>
  </div>
  {footer(10)}
</div>
""")

# Build Pages 11 to 34 via specialized generator functions
def make_page_11():
    return f"""
<div class="page">
  {header('POOL 3: MAGIC BLIND BOX (10%)')}
  <div class="content">
    <h2>1. The Gamified Web3 Incentive Engine</h2>
    <p><strong>Pool 3: The Magic Blind Box Pool (10%)</strong> injects behavioral gamification, algorithmic surprise rewards, and on-chain milestones into the Equora Matrix ecosystem. Exactly 10.00% of all protocol pool funds ($9.00 per Slot 1 board cycle) are routed into <code>EquoraMagicBox.sol</code>.</p>

    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Milestone Rank NFT Activation</h3>
        <p style="font-size:7.2pt;">
          Completing the first cycle of key milestone slots triggers an automated minting event of a Soulbound Rank NFT from <code>EquoraNFT.sol</code>:
        </p>
        <ul style="font-size:7pt; padding-left:14px; color:#475569; margin-top:2px;">
          <li><strong>Slot 3 Completion:</strong> Mints <em>Alpha Pioneer NFT</em></li>
          <li><strong>Slot 6 Completion:</strong> Mints <em>Prime Commander NFT</em></li>
          <li><strong>Slot 9 Completion:</strong> Mints <em>Elite Sovereign NFT</em></li>
          <li><strong>Slot 12 Completion:</strong> Mints <em>Crown Apex Legend NFT</em></li>
        </ul>
      </div>

      <div class="card card-blue">
        <h3 style="color:#0E62E4;">On-Chain Verifiable Entropy</h3>
        <p style="font-size:7.2pt;">
          When an eligible participant opens a Blind Box, the smart contract calculates a pseudo-random seed using block difficulty, timestamp, and participant address:
          <br><br>
          <code style="font-size:6.8pt; color:#059669;">seed = keccak256(abi.encodePacked(blockhash(block.number-1), msg.sender, nonce));</code>
          <br><br>
          Guarantees transparent, tamper-proof prize allocation.
        </p>
      </div>
    </div>

    <h2>2. Blind Box Reward Probability Distribution</h2>
    <table>
      <thead>
        <tr>
          <th>Reward Tier</th>
          <th>Probability</th>
          <th>TROB Multiplier</th>
          <th>Equivalent Dollar Value Range</th>
          <th>Bonus Perks</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Common Mystery</strong></td><td>60.00%</td><td>1.0X Base Entry</td><td>$30.00 – $60.00 USD</td><td>Ecosystem XP Badge</td></tr>
        <tr><td><strong>Rare Inflow Box</strong></td><td>25.00%</td><td>2.5X Base Entry</td><td>$75.00 – $150.00 USD</td><td>Priority Spillover Weight</td></tr>
        <tr><td><strong>Epic Protocol Chest</strong></td><td>12.00%</td><td>5.0X Base Entry</td><td>$150.00 – $300.00 USD</td><td>Leadership Pool Whitelist</td></tr>
        <tr style="background:#FEF3C7;"><td><strong>Legendary Jackpot</strong></td><td>3.00%</td><td><strong>20.0X Base Entry</strong></td><td><strong>$600.00 – $2,500.00 USD</strong></td><td>Direct DAO Governance Seat Candidate</td></tr>
      </tbody>
    </table>

    <h2>3. Quarterly Lottery Draw Mechanics</h2>
    <p>Beyond individual milestone opens, 50% of Pool 3 reserves accumulate toward a <strong>Quarterly Shared Jackpot</strong>. Every matrix participant who cycled at least once during the quarter receives automated lottery tickets proportional to their active slot depth, creating thrilling community events every 90 days.</p>
  </div>
  {footer(11)}
</div>
"""
pages.append(make_page_11())

def make_page_12():
    return f"""
<div class="page">
  {header('POOL 4: LUCKY DROPS (15%)')}
  <div class="content">
    <h2>1. Decentralized Grassroots Participation Engine</h2>
    <p><strong>Pool 4: The Lucky Drops Community Pool (15%)</strong> ensures that active protocol participants, governance voters, and grassroots advocates are consistently rewarded. Receiving exactly 15.00% of all protocol pool deposits ($13.50 per Slot 1 board cycle), this pool powers micro-incentives across the ecosystem.</p>

    <div class="grid-3" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Daily Activity Drops</h3>
        <p style="font-size:7.2pt;">
          Allocates 40% of Pool 4 to users actively interacting with their dashboard, sponsoring new partners, or cycling boards within a 24-hour rolling window.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Governance Micro-Staking</h3>
        <p style="font-size:7.2pt;">
          Allocates 35% of Pool 4 to participants who stake TROB in official Equora governance proposals or vote on Super Representative validators.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Community Bounties</h3>
        <p style="font-size:7.2pt;">
          Allocates 25% of Pool 4 to verified community translators, documentation authors, and regional presentation organizers.
        </p>
      </div>
    </div>

    <h2>2. Anti-Sybil Proof-of-Humanity Rules</h2>
    <p>To prevent malicious actors from deploying bot scripts to drain Lucky Drops, <code>EquoraRewardPool.sol</code> enforces three strict cryptographic filters:</p>
    <ul style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45;">
      <li><strong>Minimum Wallet Creation Date:</strong> Deposit wallets must have been created after <code>MIN_WALLET_CREATION_DATE</code> (1 October 2026 00:00:00 UTC) or have verified contract activity.</li>
      <li><strong>Active Matrix Slot Verification:</strong> Recipients must hold at least 1 active, unlocked slot in <code>EquoraMatrix.sol</code>.</li>
      <li><strong>2 Direct Active Referrals Threshold:</strong> Enforces <code>isQualified = activeDirectReferrals >= 2</code> for high-tier reward tranches.</li>
    </ul>

    <h2>3. Macro Impact on Protocol Velocity</h2>
    <p>By returning 15% of pool volume directly back to active retail participants, the protocol closes the loop on capital retention. Participants who receive lucky drops routinely re-invest them to unlock higher slots, directly fueling the 12-slot escalation engine.</p>
  </div>
  {footer(12)}
</div>
"""
pages.append(make_page_12())

def make_page_13():
    return f"""
<div class="page">
  {header('THE 12 PROGRESSIVE VALUE SLOTS')}
  <div class="content">
    <h2>1. The 12-Slot Economic Escalation Engine</h2>
    <p>The Equora Matrix Protocol features exactly <strong>12 progressive value slots</strong>. Each slot doubles in value from the preceding level, creating an exponential wealth escalation pathway that allows a user starting with just $30 to systematically advance into higher financial brackets.</p>

    <div class="card card-highlight" style="margin: 3px 0;">
      <h3 style="color:#071A4A;">Slot Cost Formula (Precomputed in Constructor)</h3>
      <p style="font-size:7.4pt; margin-top:2px;">
        For any slot <em>i</em> from 1 to 12: <code style="color:#059669; font-weight:700;">slotCost(i) = $30.00 × 2^(i - 1)</code><br>
        Slot 1: $30 • Slot 2: $60 • Slot 3: $120 • Slot 4: $240 • Slot 5: $480 • Slot 6: $960 • Slot 7: $1,920 • Slot 8: $3,840 • Slot 9: $7,680 • Slot 10: $15,360 • Slot 11: $30,720 • Slot 12: $61,440.
      </p>
    </div>

    <h2>2. Tier Categorization Across the 12 Slots</h2>
    <div class="grid-4" style="margin: 4px 0;">
      <div class="card card-blue text-center">
        <span class="badge badge-blue">Slots 1 to 3</span>
        <div style="font-size:10pt; font-weight:900; color:#0E62E4; margin-top:2px;">Foundation</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Costs:</strong> $30, $60, $120<br>
          Frictionless entry for all retail users globally. Unlocks Alpha Rank.
        </p>
      </div>

      <div class="card card-blue text-center">
        <span class="badge badge-emerald">Slots 4 to 6</span>
        <div style="font-size:10pt; font-weight:900; color:#059669; margin-top:2px;">Growth</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Costs:</strong> $240, $480, $960<br>
          Intermediate team builders. Unlocks Prime Rank & 20% Royalty share.
        </p>
      </div>

      <div class="card card-blue text-center">
        <span class="badge badge-amber">Slots 7 to 9</span>
        <div style="font-size:10pt; font-weight:900; color:#D97706; margin-top:2px;">Leadership</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Costs:</strong> $1,920, $3,840, $7,680<br>
          Elite network leaders. Unlocks Elite Rank & 30% Royalty share.
        </p>
      </div>

      <div class="card card-blue text-center">
        <span class="badge badge-purple">Slots 10 to 12</span>
        <div style="font-size:10pt; font-weight:900; color:#7C3AED; margin-top:2px;">Apex Crown</div>
        <p style="font-size:6.8pt; color:#475569; margin-top:2px;">
          <strong>Costs:</strong> $15,360, $30,720, $61,440<br>
          Global protocol institutional whales. Unlocks full 40% Royalty stack.
        </p>
      </div>
    </div>

    <h2>3. Macro Cumulative Capital Metrics</h2>
    <div class="grid-3" style="margin-top: 3px;">
      <div class="card card-dark text-center">
        <div style="font-size:13pt; font-weight:900; color:#38BDF8;">$122,850.00</div>
        <div style="font-size:6.8pt; color:#94A3B8; text-transform:uppercase;">Total to Unlock All 12 Slots</div>
      </div>
      <div class="card card-dark text-center">
        <div style="font-size:13pt; font-weight:900; color:#34D399;">$737,100.00</div>
        <div style="font-size:6.8pt; color:#94A3B8; text-transform:uppercase;">Owner Profit per 1 Full Cycle</div>
      </div>
      <div class="card card-dark text-center">
        <div style="font-size:13pt; font-weight:900; color:#FBBF24;">$1,719,900.00</div>
        <div style="font-size:6.8pt; color:#94A3B8; text-transform:uppercase;">Gross Volume per 1 Full Cycle</div>
      </div>
    </div>
  </div>
  {footer(13)}
</div>
"""
pages.append(make_page_13())

def make_page_14():
    return f"""
<div class="page">
  {header('FINANCIAL MASTER TABLE: ALL 12 SLOTS')}
  <div class="content">
    <h2>1. Institutional Financial Master Table: Per-Cycle Allocation Matrix</h2>
    <p>The following table details the exact mathematical distribution for every single slot across all 12 levels for a single completed 14-node cycle. All amounts are calculated in USD at the fixed smart contract economic peg.</p>

    <table>
      <thead>
        <tr>
          <th>Slot #</th>
          <th>Slot Cost</th>
          <th>Gross Volume (14 Nodes)</th>
          <th>Immediate Upline (P1+P2)</th>
          <th>YOU Cashflow (6 Nodes)</th>
          <th>Protocol Pools (21.43%)</th>
          <th>Downline 1 (P7+P10)</th>
          <th>Downline 2 (P13)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Slot 1</strong></td><td>$30.00</td><td>$420.00</td><td>$60.00</td><td><strong>$180.00</strong></td><td>$90.00</td><td>$60.00</td><td>$30.00</td></tr>
        <tr><td><strong>Slot 2</strong></td><td>$60.00</td><td>$840.00</td><td>$120.00</td><td><strong>$360.00</strong></td><td>$180.00</td><td>$120.00</td><td>$60.00</td></tr>
        <tr><td><strong>Slot 3</strong></td><td>$120.00</td><td>$1,680.00</td><td>$240.00</td><td><strong>$720.00</strong></td><td>$360.00</td><td>$240.00</td><td>$120.00</td></tr>
        <tr><td><strong>Slot 4</strong></td><td>$240.00</td><td>$3,360.00</td><td>$480.00</td><td><strong>$1,440.00</strong></td><td>$720.00</td><td>$480.00</td><td>$240.00</td></tr>
        <tr><td><strong>Slot 5</strong></td><td>$480.00</td><td>$6,720.00</td><td>$960.00</td><td><strong>$2,880.00</strong></td><td>$1,440.00</td><td>$960.00</td><td>$480.00</td></tr>
        <tr><td><strong>Slot 6</strong></td><td>$960.00</td><td>$13,440.00</td><td>$1,920.00</td><td><strong>$5,760.00</strong></td><td>$2,880.00</td><td>$1,920.00</td><td>$960.00</td></tr>
        <tr><td><strong>Slot 7</strong></td><td>$1,920.00</td><td>$26,880.00</td><td>$3,840.00</td><td><strong>$11,520.00</strong></td><td>$5,760.00</td><td>$3,840.00</td><td>$1,920.00</td></tr>
        <tr><td><strong>Slot 8</strong></td><td>$3,840.00</td><td>$53,760.00</td><td>$7,680.00</td><td><strong>$23,040.00</strong></td><td>$11,520.00</td><td>$7,680.00</td><td>$3,840.00</td></tr>
        <tr><td><strong>Slot 9</strong></td><td>$7,680.00</td><td>$107,520.00</td><td>$15,360.00</td><td><strong>$46,080.00</strong></td><td>$23,040.00</td><td>$15,360.00</td><td>$7,680.00</td></tr>
        <tr><td><strong>Slot 10</strong></td><td>$15,360.00</td><td>$215,040.00</td><td>$30,720.00</td><td><strong>$92,160.00</strong></td><td>$46,080.00</td><td>$30,720.00</td><td>$15,360.00</td></tr>
        <tr><td><strong>Slot 11</strong></td><td>$30,720.00</td><td>$430,080.00</td><td>$61,440.00</td><td><strong>$184,320.00</strong></td><td>$92,160.00</td><td>$61,440.00</td><td>$30,720.00</td></tr>
        <tr style="background:#ECFDF5;"><td><strong>Slot 12</strong></td><td>$61,440.00</td><td>$860,160.00</td><td>$122,880.00</td><td><strong>$368,640.00</strong></td><td>$184,320.00</td><td>$122,880.00</td><td>$61,440.00</td></tr>
        <tr style="font-weight:900; background:#071A4A; color:#FFFFFF;">
          <td style="color:#FFF;">TOTALS</td>
          <td style="color:#FFF;">$122,850.00</td>
          <td style="color:#FFF;">$1,719,900.00</td>
          <td style="color:#FFF;">$245,700.00</td>
          <td style="color:#FFF;">$737,100.00</td>
          <td style="color:#FFF;">$368,550.00</td>
          <td style="color:#FFF;">$245,700.00</td>
          <td style="color:#FFF;">$122,850.00</td>
        </tr>
      </tbody>
    </table>

    <h2>2. Key Observations on the Master Table</h2>
    <ul style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45;">
      <li><strong>600% ROI Invariant:</strong> On every single slot from 1 to 12, the board owner receives exactly 6 times the slot activation cost in net profit ($180 on Slot 1, $368,640 on Slot 12).</li>
      <li><strong>Identical Upline & Downline Support:</strong> Immediate Upline receives $245,700 total, while Downline 1 receives an identical $245,700 total in algorithmic spillover injection, ensuring perfect vertical balance.</li>
      <li><strong>Total Protocol Liquidity:</strong> A single full cycle across all 12 slots delivers <strong>$368,550.00 USD</strong> directly into the 4 protocol pools, funding Genesis DAO members and leadership salaries.</li>
    </ul>
  </div>
  {footer(14)}
</div>
"""
pages.append(make_page_14())

def make_page_15():
    return f"""
<div class="page">
  {header('RECYCLE & RE-ENTRY ENGINE')}
  <div class="content">
    <h2>1. The Perpetual Recycling Algorithm</h2>
    <p>A matrix board is designed to be completed, closed, and instantaneously reborn. When the 14th subordinate node (Position #14) is filled on any slot, the smart contract automatically executes <code>_handleRecycle()</code>. This mechanism enables participants to cycle hundreds of times on a slot without ever depositing additional funds.</p>

    <div class="card card-highlight" style="margin: 4px 0;">
      <h3 style="color:#071A4A;">Step-by-Step Anatomy of a Recycle Event</h3>
      <ol style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45; margin-top:2px;">
        <li><strong>Trigger:</strong> Node P14 is filled by an incoming direct partner, downline duplicate, or upline spillover.</li>
        <li><strong>Vault Routing:</strong> The entry fee for Node 14 ($30 on Slot 1) is dispatched to <code>EquoraVault</code> to fund protocol pools.</li>
        <li><strong>State Snapshot:</strong> The smart contract saves all 14 node addresses into <code>cycleSnapshots[user][slot]</code>, preserving complete permanent history.</li>
        <li><strong>Counter Increment:</strong> <code>userSlots[user][slot].currentCycle</code> increments by 1 (e.g. Cycle 1 → Cycle 2).</li>
        <li><strong>Node Clearance:</strong> <code>userSlots[user][slot].filledNodes</code> resets to 0. All 14 visual positions on the board open up.</li>
        <li><strong>Sponsor Re-Entry:</strong> The board owner re-enters under their sponsor's currently active board on that slot.</li>
      </ol>
    </div>

    <h2>2. Follow-the-Sponsor Mechanics</h2>
    <p>Under the <strong>Follow-the-Sponsor</strong> rule, when your direct referrals complete their boards, their recycled avatars re-enter into <em>YOUR</em> current active board, filling the next available left-to-right open position. This creates a perpetual flywheel: active partners continually re-enter under you, filling your P3, P6, P8, P9, P11, and P12 nodes and repeatedly triggering fresh $180 payouts!</p>

    <h2>3. The Mathematics of Repeated Cycling (Slot 1 Case Study)</h2>
    <table>
      <thead>
        <tr>
          <th>Cycles Completed</th>
          <th>Initial Deposit</th>
          <th>Total Gross Volume</th>
          <th>Total Paid to YOU (600%)</th>
          <th>Net Cashflow Profit</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>1 Cycle</strong></td><td>$30.00</td><td>$420.00</td><td>$180.00</td><td><strong>+$150.00</strong></td></tr>
        <tr><td><strong>5 Cycles</strong></td><td>$30.00</td><td>$2,100.00</td><td>$900.00</td><td><strong>+$870.00</strong></td></tr>
        <tr><td><strong>10 Cycles</strong></td><td>$30.00</td><td>$4,200.00</td><td>$1,800.00</td><td><strong>+$1,770.00</strong></td></tr>
        <tr><td><strong>50 Cycles</strong></td><td>$30.00</td><td>$21,000.00</td><td>$9,000.00</td><td><strong>+$8,970.00</strong></td></tr>
        <tr style="background:#ECFDF5;"><td><strong>100 Cycles</strong></td><td>$30.00</td><td>$42,000.00</td><td>$18,000.00</td><td><strong>+$17,970.00</strong></td></tr>
      </tbody>
    </table>
  </div>
  {footer(15)}
</div>
"""
pages.append(make_page_15())

def make_page_16():
    return f"""
<div class="page">
  {header('SPILLOVER & COMPRESSION DYNAMICS')}
  <div class="content">
    <h2>1. The Physics of Decentralized Spillover</h2>
    <p>Spillover is the cryptographic placement of a participant into a matrix board by an upline sponsor or downline team member when their primary positions are already occupied. Equora features <strong>3-Dimensional Multi-Vector Spillover</strong>:</p>

    <div class="grid-3" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">1. Upward Spillover (Top-Down)</h3>
        <p style="font-size:7.2pt;">
          When an active sponsor recruits more than 2 partners, the 3rd, 4th, 5th, etc., spill downward into their team's Tier 2 and Tier 3 nodes, generating unexpected earnings for newest members.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">2. Downward Spillover (Bottom-Up)</h3>
        <p style="font-size:7.2pt;">
          Positions P7, P10, and P13 algorithmically push 100% of their fees ($90 total) directly into the wallets of Downline 1 and Downline 2, actively injecting capital downward.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">3. Cross-Spillover (Parallel)</h3>
        <p style="font-size:7.2pt;">
          When parallel legs under the same sponsor fill at differing speeds, the breadth-first algorithm directs new entrants into the slower leg, equalizing team growth.
        </p>
      </div>
    </div>

    <h2>2. Dynamic Compression: Protecting Active Leaders</h2>
    <p>What happens if a user in your downline upgrades to a higher slot before their immediate sponsor does? The protocol executes <strong>Dynamic Compression (Leapfrog Protection)</strong>:</p>

    <div class="card card-dark" style="padding: 7px 10px; margin: 3px 0;">
      <div style="font-size:8pt; font-weight:800; color:#38BDF8;">ALGORITHMIC UPLINE SEARCH ALGORITHM</div>
      <p style="font-size:7.1pt; color:#E2E8F0; margin-top:2px;">
        If User C activates Slot 4, but User B (their direct sponsor) only holds Slot 3, the smart contract traverses upward up to <code>MAX_UPLINE_DEPTH = 12</code> levels. It locates the first qualified upline who owns Slot 4 (User A) and temporarily places User C into User A's board. Once User B later activates Slot 4, subsequent recycles return User C back under User B.
      </p>
    </div>

    <h2>3. Active vs. Passive Participant Dynamics</h2>
    <table>
      <thead>
        <tr>
          <th>Participant Type</th>
          <th>Primary Revenue Mechanism</th>
          <th>Expected Cycle Velocity</th>
          <th>Key Protocol Safeguard</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Pure Passive User</strong></td><td>Top-down spillover into P3, P6, P8, P9</td><td>Moderate (relies on team flow)</td><td>Downline P7, P10, P13 support</td></tr>
        <tr><td><strong>Active Team Builder</strong></td><td>Direct referrals + follow-the-sponsor recycles</td><td>Rapid (1 to 5 cycles/week)</td><td>600% ROI + Upline $60 dividends</td></tr>
        <tr><td><strong>Global Leader</strong></td><td>Multi-slot compounding + Monthly Royalty Pool</td><td>Continuous (daily multi-slot cycles)</td><td>40% Leadership Royalty stack</td></tr>
      </tbody>
    </table>
  </div>
  {footer(16)}
</div>
"""
pages.append(make_page_16())

def make_page_17():
    return f"""
<div class="page">
  {header('QUALIFICATION & ANTI-SYBIL RULES')}
  <div class="content">
    <h2>1. The Two-Direct-Referral Qualification Standard</h2>
    <p>To ensure long-term protocol vitality and eliminate idle free-riders, Equora enforces an elegant qualification standard in <code>EquoraMatrix.sol</code>: <strong>A user must sponsor at least 2 active direct referrals ($30 deposit each) to unlock downline spillover payouts (P7, P10, P13)</strong>.</p>

    <div class="card card-highlight" style="margin: 4px 0;">
      <h3 style="color:#071A4A;">Smart Contract Qualification Logic</h3>
      <pre><code>// EquoraMatrix.sol: Qualification check
bool isQualified = activeDirectReferrals[matrixOwner] >= 2;

if (!isQualified && (position == 7 || position == 10 || position == 13)) {{
    // Fallback: If board owner is unqualified, payout defaults to Apex Owner
    recipient = matrixOwner;
    emit SpilloverResolved(matrixOwner, recipient, position, true);
}}</code></pre>
    </div>

    <h2>2. The Unqualified Fallback Matrix: Never to Root or Creators</h2>
    <p>In centralized platforms, when a user is unqualified, their missed earnings are quietly pocketed by the company admin wallet. <strong>In Equora, missed payouts NEVER flow to a creator or developer address.</strong></p>

    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Rule 1: Owner Default Fallback</h3>
        <p style="font-size:7.2pt;">
          If the downline member designated for P7, P10, or P13 is unqualified, the payout falls back to the <strong>Board Owner ("YOU")</strong>. This rewards the board owner for driving volume.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Rule 2: Apex Decentralized Leader</h3>
        <p style="font-size:7.2pt;">
          If the board owner themselves has zero downlines, the payout defaults to the <strong>Algorithmic Apex Leader</strong> (the verified Genesis DAO member at root), keeping 100% of wealth within the community.
        </p>
      </div>
    </div>

    <h2>3. Anti-Sybil Proof of Authenticity</h2>
    <p>The contract actively guards against self-referral ring attacks through three cryptographic checks:</p>
    <ul style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45;">
      <li><code>hasDirectReferralDeposited[sponsor][referral]</code> verifies that referral accounts have deposited verified TROB on-chain.</li>
      <li>Self-sponsoring is strictly prohibited (<code>sponsor != msg.sender</code>).</li>
      <li>Circular loops are prevented by permanent directed acyclic graph (DAG) checks in <code>EquoraRegistry.sol</code>.</li>
    </ul>
  </div>
  {footer(17)}
</div>
"""
pages.append(make_page_17())

def make_page_18():
    return f"""
<div class="page">
  {header('ALGORITHMIC APEX LEADERSHIP ENGINE')}
  <div class="content">
    <h2>1. Resolving the "First-Mover Advantage" Dilemma</h2>
    <p>A classic dilemma in decentralized matrix systems is the unfair advantage enjoyed by the very first wallet to deploy or register (Wallet #1), which perpetually absorbs all global spillover. Equora solves this through an unprecedented governance innovation: <strong>The Algorithmic Apex Leadership Engine</strong>.</p>

    <div class="card card-highlight" style="margin: 4px 0;">
      <h3 style="color:#071A4A;">The Genesis DAO Final Member Designation</h3>
      <p style="font-size:7.4pt; margin-top:2px;">
        Instead of vesting the root position of the global matrix in a company founder or developer wallet, <code>EquoraMatrix.sol</code> queries <code>IEquoraDAO.getLastMember()</code> on Day 22:
        <br><br>
        <code style="color:#0E62E4; font-weight:700;">address rootOwner = IEquoraDAO(daoContract).getLastMember();</code>
        <br><br>
        <strong>The 93rd / 100th Genesis Council member who completes the founding window is algorithmically crowned as the Sovereign Root Apex of the Global Matrix!</strong>
      </p>
    </div>

    <h2>2. Economic Rationale & Community Inversion</h2>
    <p>By placing the final Genesis DAO member at the Apex of the global matrix, the protocol achieves complete architectural symmetry:</p>
    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Founder De-Centering</h3>
        <p style="font-size:7.2pt;">
          The creators possess zero special privilege at the top of the tree. The most recent community member who believed in the Genesis DAO is rewarded with root positioning.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Total Alignment of Incentives</h3>
        <p style="font-size:7.2pt;">
          Because the Apex Leader is a Genesis Council seat holder, their root earnings are subject to the 5X earnings cap and redistributive re-topup dynamics.
        </p>
      </div>
    </div>

    <h2>3. The Apex Waterfall Distribution</h2>
    <p>Any system-wide orphan spillover that cannot locate an upline sponsor falls to the Apex Leader, who acts as the global network flywheel, ensuring that not a single unit of currency ever leaves the decentralized user base.</p>
  </div>
  {footer(18)}
</div>
"""
pages.append(make_page_18())

def make_page_19():
    return f"""
<div class="page">
  {header('5-DIGIT CODES & REFERRAL ENGINE')}
  <div class="content">
    <h2>1. The 5-Digit Unique Member Code Architecture</h2>
    <p>Long 34-character blockchain hex addresses (e.g. <code>TTsG9kvzCAku7eWHQUJXyDoVspqSRHbPEo</code>) are notoriously intimidating for mainstream retail adoption. Equora replaces complex addresses with an intuitive <strong>5-Digit Member Code system</strong> (e.g. <code>#10087</code>) generated on-chain by <code>EquoraRegistry.sol</code>.</p>

    <div class="grid-3" style="margin: 4px 0;">
      <div class="card card-blue text-center">
        <div style="font-size:13pt; font-weight:900; color:#0E62E4;">#10001 – #10100</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Genesis DAO Council</div>
        <p style="font-size:6.5pt; color:#64748B;">Permanent Founding Seat Codes</p>
      </div>
      <div class="card card-blue text-center">
        <div style="font-size:13pt; font-weight:900; color:#059669;">#10101 – #99999</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Retail Matrix Members</div>
        <p style="font-size:6.5pt; color:#64748B;">Sequential On-Chain Registrations</p>
      </div>
      <div class="card card-blue text-center">
        <div style="font-size:13pt; font-weight:900; color:#7C3AED;">P2P Binding</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Immutable Sponsor Link</div>
        <p style="font-size:6.5pt; color:#64748B;">Hardcoded on TrobChain Mainnet</p>
      </div>
    </div>

    <h2>2. Sponsor Binding Smart Contract Mechanics</h2>
    <p>When a user registers using a referral link (e.g. <code>https://equorafidao.com/matrix?ref=10087</code>), the contract permanently binds the relationship:</p>
    <pre><code>// EquoraRegistry.sol: Permanent immutable sponsor binding
function registerUser(address sponsor) external nonReentrant {{
    require(users[msg.sender].id == 0, "Registry: user already registered");
    require(users[sponsor].id != 0, "Registry: invalid sponsor");

    userCount++;
    users[msg.sender] = UserInfo({{
        id: userCount,
        memberCode: 10000 + userCount,
        sponsor: sponsor,
        joinedAt: block.timestamp
    }});

    directReferrals[sponsor].push(msg.sender);
    emit UserRegistered(msg.sender, sponsor, userCount, 10000 + userCount);
}}</code></pre>

    <h2>3. Viral Growth Dynamics</h2>
    <p>Because the 5-digit code is simple to share in messaging apps, printed materials, and oral presentations, sharing friction drops to near zero. A sponsor simply tells their friend: <em>"Enter Sponsor Code 10087"</em> to bind their wallet forever.</p>
  </div>
  {footer(19)}
</div>
"""
pages.append(make_page_19())

def make_page_20():
    return f"""
<div class="page">
  {header('THE USER JOURNEY: $30 TO SLOT 12')}
  <div class="content">
    <h2>1. Step-by-Step Retail Onboarding Roadmap</h2>
    <p>Navigating the Equora Matrix is designed to be frictionless for both seasoned Web3 users and blockchain newcomers. Here is the canonical 6-step journey from initial wallet creation to unlocking Slot 12:</p>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Step 1: Wallet Setup & TROB Funding</h3>
      <p style="font-size:7.2pt;">
        Install TrobSafe or TronLink. Acquire exactly <strong>$30.00 USD worth of TROB</strong> (~536 TROB at the fixed peg of $0.056 USD). Ensure a minimal balance of 10–20 TROB for network energy bandwidth.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Step 2: Connect & Register under Sponsor</h3>
      <p style="font-size:7.2pt;">
        Navigate to <code>equorafidao.com/matrix</code>. Connect your wallet. Enter your sponsor's 5-digit member code (or connect via referral URL). Confirm the registration transaction.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Step 3: Instant Activation of Slot 1 ($30)</h3>
      <p style="font-size:7.2pt;">
        Click <strong>Activate Slot 1</strong>. The smart contract consumes 535.71 TROB, creates your personal 14-node board, and places you as Node #0 (Apex).
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Step 4: Achieve Full Qualification (2 Direct Referrals)</h3>
      <p style="font-size:7.2pt;">
        Share your personal 5-digit referral code with 2 friends or partners. Once both activate Slot 1, your status upgrades to <strong>100% Fully Qualified</strong>, unlocking downline spillover inflows.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Step 5: Harvest First $180 Payout & Upgrade to Slot 2</h3>
      <p style="font-size:7.2pt;">
        As your board fills, you receive 6 direct payments of $30 ($180 total). Use $60 from profits to activate <strong>Slot 2</strong>, pocketing $120 net profit while opening the $360 cashflow stream!
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Step 6: Compounding Escalation to Slot 12</h3>
      <p style="font-size:7.2pt;">
        Repeatedly reinvest a portion of board earnings into subsequent slots (Slot 3, Slot 4... up to Slot 12). At Slot 12, each board cycle pays <strong>$368,640.00 USD directly to your wallet</strong>!
      </p>
    </div>
  </div>
  {footer(20)}
</div>
"""
pages.append(make_page_20())

def make_page_21():
    return f"""
<div class="page">
  {header('FINANCIAL SCENARIO MODELING')}
  <div class="content">
    <h2>1. Rigorous Financial Projections Across 4 User Archetypes</h2>
    <p>To demonstrate the dynamic earning potential of the Equora Matrix, we examine four distinct participant profiles across varying cycling frequencies and slot depths.</p>

    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Scenario A: The Passive Participant</h3>
        <p style="font-size:7.2pt;">
          <strong>Profile:</strong> $30 initial deposit, 0 direct referrals. Relies entirely on upline spillover.<br>
          <strong>Cycle Performance:</strong> Completes 2 cycles on Slot 1 over 60 days.<br>
          <strong>Gross Cashflow:</strong> 12 nodes paid ($360.00).<br>
          <strong>Net Profit:</strong> <strong>+$330.00 USD (1,100% Net ROI)</strong> on a $30 entry!
        </p>
      </div>

      <div class="card card-blue">
        <h3 style="color:#059669;">Scenario B: The Grassroots Builder</h3>
        <p style="font-size:7.2pt;">
          <strong>Profile:</strong> Sponsoring 3 friends. Unlocks Slots 1, 2, and 3 ($210 total cost).<br>
          <strong>Cycle Performance:</strong> 5 cycles on Slot 1, 3 cycles on Slot 2, 2 cycles on Slot 3.<br>
          <strong>Gross Cashflow:</strong> $900 (S1) + $1,080 (S2) + $1,440 (S3) = $3,420.<br>
          <strong>Net Profit:</strong> <strong>+$3,210.00 USD</strong> + Alpha NFT!
        </p>
      </div>
    </div>

    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#D97706;">Scenario C: The Professional Team Leader</h3>
        <p style="font-size:7.2pt;">
          <strong>Profile:</strong> Sponsoring 12 direct builders. Unlocks Slots 1 through 6 ($1,890 total cost).<br>
          <strong>Cycle Performance:</strong> 20 cycles on S1–S3, 8 cycles on S4–S6.<br>
          <strong>Gross Cashflow:</strong> $14,400 (S1–S3) + $80,640 (S4–S6) = $95,040.<br>
          <strong>Net Profit:</strong> <strong>+$93,150.00 USD</strong> + Monthly Leadership Royalty ($2,000+/mo)!
        </p>
      </div>

      <div class="card card-dark">
        <h3 style="color:#38BDF8;">Scenario D: The Global Protocol Whale</h3>
        <p style="font-size:7.2pt;">
          <strong>Profile:</strong> Full 12-Slot Crown Leader with international team organization.<br>
          <strong>Cycle Performance:</strong> 50 cycles across S1–S6, 10 cycles across S7–S12.<br>
          <strong>Gross Cashflow:</strong> Over $7,371,000.00 USD!<br>
          <strong>Net Profit:</strong> <strong>+$7,248,150.00 USD</strong> + Max 40% Crown Royalty Stack!
        </p>
      </div>
    </div>

    <h2>2. Key Financial Takeaway</h2>
    <p>Even in the most conservative scenario (Scenario A), zero participants lose capital once their board fills via spillover. For active builders, the revenue velocity scales into six and seven figures completely autonomously.</p>
  </div>
  {footer(21)}
</div>
"""
pages.append(make_page_21())

def make_page_22():
    return f"""
<div class="page">
  {header('EXPONENTIAL GROWTH VECTORS')}
  <div class="content">
    <h2>1. Metcalfe's Law in 14-Node Network Topologies</h2>
    <p>Metcalfe's Law dictates that the financial value of a telecommunications network is proportional to the square of the number of connected users (<em>V ∝ N²</em>). In the Equora Matrix, this principle is supercharged by the <strong>2-Direct Qualification Threshold</strong>.</p>

    <div class="card card-highlight" style="margin: 4px 0;">
      <h3 style="color:#071A4A;">The Viral K-Factor Analysis</h3>
      <p style="font-size:7.4pt; margin-top:2px;">
        Viral growth in consumer applications requires a K-factor > 1.0 (where each user invites more than 1 new user). Because every Equora participant requires <strong>2 active direct referrals</strong> to unlock downline spillover rewards, the baseline system viral coefficient is:
        <br><br>
        <code style="color:#0E62E4; font-weight:800; font-size:8pt;">Baseline Viral Coefficient K = 2.0 (Exponential Viral Growth)</code>
        <br><br>
        At K = 2.0, network membership doubles with each cycle tier: 1 → 2 → 4 → 8 → 16 → 32 → 64 → 128 → 256 → 512 → 1,024!
      </p>
    </div>

    <h2>2. Velocity of Capital: Why Small Boards Outperform Massive Pyramids</h2>
    <table>
      <thead>
        <tr>
          <th>Matrix Structure</th>
          <th>Total Nodes Required</th>
          <th>Cycling Speed</th>
          <th>Capital Velocity</th>
          <th>Vulnerability to Stalling</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Legacy 3×9 Forced Matrix</strong></td><td>29,524 Nodes</td><td>Extremely Slow</td><td>Stagnant</td><td>99.9% Collapse Rate</td></tr>
        <tr><td><strong>Traditional 2×4 Matrix</strong></td><td>30 Nodes</td><td>Slow</td><td>Moderate</td><td>High Gridlock Risk</td></tr>
        <tr style="background:#ECFDF5;"><td><strong>Equora 14-Node Compressed Tree</strong></td><td><strong>14 Nodes</strong></td><td><strong>10× Faster</strong></td><td><strong>Hyper-Velocity</strong></td><td><strong>0% Structural Gridlock</strong></td></tr>
      </tbody>
    </table>

    <h2>3. The Self-Reinforcing Compounding Loop</h2>
    <p>When a board cycles in 24 hours, the user immediately withdraws $180, verifies the real on-chain transaction in their wallet, and demonstrates the proof of earnings to peers. This tangible proof of payout drives the next wave of registrations with zero marketing overhead.</p>
  </div>
  {footer(22)}
</div>
"""
pages.append(make_page_22())

def make_page_23():
    return f"""
<div class="page">
  {header('PITFALLS & EQUORA SOLUTIONS')}
  <div class="content">
    <h2>1. Exhaustive Risk Mitigation: Engineering Solutions to Known Failures</h2>
    <p>Every failure mode that has ever afflicted decentralized network protocols has been analyzed and counter-engineered in the Equora smart contracts.</p>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#B91C1C;">Pitfall 1: Gridlock & Board Stalling</h3>
      <p style="font-size:7.2pt;">
        <em>Problem:</em> Traditional matrices freeze when a passive user sits in a critical branch and stops recruiting.<br>
        <strong style="color:#059669;">Equora Solution:</strong> 14-node compressed depth ensures small board size; Follow-the-Sponsor re-entry continuously injects recycled active leaders beneath slower members, reactivating stalled branches automatically.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#B91C1C;">Pitfall 2: Top-Heavy Wealth Extraction</h3>
      <p style="font-size:7.2pt;">
        <em>Problem:</em> Founders and early pioneers extract 90% of liquidity, leaving newest entrants with nothing.<br>
        <strong style="color:#059669;">Equora Solution:</strong> Nodes P7, P10, and P13 force 100% of their payouts directly into downline wallets. Furthermore, 35% of protocol pools are distributed to all active council members, ensuring broad decentralization.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#B91C1C;">Pitfall 3: Admin Rug-Pulls & Private Key Leaks</h3>
      <p style="font-size:7.2pt;">
        <em>Problem:</em> Centralized creators upgrade contracts, alter fees, or drain contract balances.<br>
        <strong style="color:#059669;">Equora Solution:</strong> Zero escrow architecture holds 0 user funds. <code>renounceOwnership()</code> is executed on Day 22, permanently forfeiting administrative power and making the protocol immutable forever.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#B91C1C;">Pitfall 4: Currency Volatility Shock</h3>
      <p style="font-size:7.2pt;">
        <em>Problem:</em> If native token prices crash or spike, matrix entry fees become unpredictably expensive.<br>
        <strong style="color:#059669;">Equora Solution:</strong> Fixed $30.00 USD economic anchor pegged at $0.056 USD guarantees price stability across market cycles.
      </p>
    </div>
  </div>
  {footer(23)}
</div>
"""
pages.append(make_page_23())

def make_page_24():
    return f"""
<div class="page">
  {header('SMART CONTRACT DEEP-DIVE: CORE')}
  <div class="content">
    <h2>1. EquoraMatrix.sol Technical Architecture</h2>
    <p><code>EquoraMatrix.sol</code> is the core stateful contract orchestrating member registrations, slot purchases, 14-node placement traversal, and instant P2P payout execution. Below is the audited execution trace of the core distribution logic:</p>

    <pre><code>// EquoraMatrix.sol: Core position settlement switch-case
function _distributePayouts(
    address matrixOwner,
    uint8 slot,
    uint256 cycle,
    uint8 position,
    uint256 amount
) internal {{
    address recipient;
    PayoutType pType;

    if (position == 1 || position == 2) {{
        recipient = _getImmediateUpline(matrixOwner);
        pType = PayoutType.UPLINE_1;
    }} else if (position == 3 || position == 6 || position == 8 || 
               position == 9 || position == 11 || position == 12) {{
        recipient = matrixOwner; // 100% direct cashflow to YOU
        pType = PayoutType.OWNER_DIRECT;
    }} else if (position == 4 || position == 5 || position == 14) {{
        _forwardToVault(amount, slot, cycle);
        pType = PayoutType.PROTOCOL_POOL;
        return;
    }} else if (position == 7 || position == 10) {{
        recipient = _getDownline1(matrixOwner);
        pType = PayoutType.SPILLOVER_DOWNLINE1;
    }} else if (position == 13) {{
        recipient = _getDownline2(matrixOwner);
        pType = PayoutType.SPILLOVER_DOWNLINE2;
    }}

    _sendP2P(recipient, amount);
    emit DistributionExecuted(recipient, amount, pType, slot, cycle, position);
}}</code></pre>

    <h2>2. Key Architectural Invariants</h2>
    <ul style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45;">
      <li><strong>Atomic Settlement:</strong> Payout execution and event emission occur in the exact same call stack. If any transfer fails, the entire transaction reverts.</li>
      <li><strong>Zero Internal Balances:</strong> <code>amount</code> is immediately dispatched via <code>safeTransfer</code>; <code>address(this).balance</code> remains 0 at all times.</li>
      <li><strong>Bounded Depth:</strong> Upline lookups are capped at <code>MAX_UPLINE_DEPTH = 12</code>, guaranteeing that gas consumption never exceeds block limits.</li>
    </ul>
  </div>
  {footer(24)}
</div>
"""
pages.append(make_page_24())

def make_page_25():
    return f"""
<div class="page">
  {header('SMART CONTRACT DEEP-DIVE: VAULT')}
  <div class="content">
    <h2>1. EquoraVault.sol & Pool Routing Infrastructure</h2>
    <p><code>EquoraVault.sol</code> serves as the central autonomous router connecting retail matrix deposits into the 4 automated protocol pools. Below is the technical specification of the multi-contract wiring:</p>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Contract Architecture Diagram</h3>
      <pre><code>[ EquoraMatrix.sol ] ──(Nodes P4, P5, P14 = 21.43%)──> [ EquoraVault.sol ]
                                                              │
     ┌──────────────────┬──────────────────┬──────────────────┴──────────────────┐
     ▼                  ▼                  ▼                                     ▼
[ Pool 1: DAO ]    [ Pool 2: Salary ]  [ Pool 3: MagicBox ]                  [ Pool 4: Rewards ]
 (35% Instant P2P)  (40% Monthly)       (10% VRF Mystery)                     (15% Community Drops)</code></pre>
    </div>

    <h2>2. Exact Splitting Mathematics (Zero Rounding Leakage)</h2>
    <p>To ensure 100% cryptographic conservation of capital, the vault router computes allocations using fixed basis points (10,000 = 100%):</p>
    <ul style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45;">
      <li><code>daoAmt = (amount * 3500) / 10000;</code> (35.00%)</li>
      <li><code>salaryAmt = (amount * 4000) / 10000;</code> (40.00%)</li>
      <li><code>magicAmt = (amount * 1000) / 10000;</code> (10.00%)</li>
      <li><code>rewardsAmt = amount - daoAmt - salaryAmt - magicAmt;</code> (15.00% exact remainder)</li>
    </ul>

    <h2>3. Security & Access Control Boundaries</h2>
    <p><code>routePoolDeposit()</code> is strictly restricted to <code>msg.sender == matrixContract</code>. No external user or contract can spoof pool deposits or artificially manipulate pool balances.</p>
  </div>
  {footer(25)}
</div>
"""
pages.append(make_page_25())

def make_page_26():
    return f"""
<div class="page">
  {header('SECURITY, VERIFICATION & AUDIT')}
  <div class="content">
    <h2>1. Enterprise-Grade Security Architecture</h2>
    <p>The Equora Protocol contracts are developed in Solidity 0.8.20 and adhere to the highest industry standards of formal verification, defensive programming, and smart contract security.</p>

    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Reentrancy Protection</h3>
        <p style="font-size:7.2pt;">
          Every external state-changing function inherits OpenZeppelin's <code>ReentrancyGuard</code> and strictly follows the <em>Checks-Effects-Interactions</em> pattern, rendering reentrancy attacks mathematically impossible.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Integer Overflow Protection</h3>
        <p style="font-size:7.2pt;">
          Built-in compiler-level checked arithmetic in Solidity 0.8.20 prevents integer overflow, underflow, and truncation exploits without relying on external libraries.
        </p>
      </div>
    </div>

    <h2>2. Null-Key Immutability Verification</h2>
    <p>To achieve absolute trustlessness, the protocol enforces <strong>Null Key Renouncement</strong>. Upon final wiring, <code>renounceOwnership()</code> is broadcast on-chain:</p>

    <div class="card card-dark" style="padding: 7px 10px; margin: 3px 0;">
      <div style="font-size:8pt; font-weight:800; color:#38BDF8;">CRYPTOGRAPHIC PROOF OF DECENTRALIZATION</div>
      <p style="font-size:7.1pt; color:#E2E8F0; margin-top:2px;">
        <code>owner() == address(0x0000000000000000000000000000000000000000)</code><br>
        Because the owner is the zero address, no private key exists in the universe that can alter contract variables, pause transfers, or mint tokens. The smart contract becomes an immutable autonomous protocol operating in perpetuity.
      </p>
    </div>

    <h2>3. Formal Invariant Verification Suite</h2>
    <ul style="font-size:7.2pt; padding-left:14px; color:#334155; line-height:1.45;">
      <li><strong>Invariant 1:</strong> Total deposit volume equals total payouts plus total vault forwards at all times.</li>
      <li><strong>Invariant 2:</strong> A user's cycle counter never decrements; history is strictly append-only.</li>
      <li><strong>Invariant 3:</strong> Unlocked slots are permanent and never expire.</li>
    </ul>
  </div>
  {footer(26)}
</div>
"""
pages.append(make_page_26())

def make_page_27():
    return f"""
<div class="page">
  {header('TROBCHAIN GAS & INFRASTRUCTURE')}
  <div class="content">
    <h2>1. Why TrobChain? The Scalability Imperative</h2>
    <p>High gas fees on Ethereum ($20–$50 per transaction) render retail $30 matrices completely non-viable. Equora is built natively on <strong>TrobChain Mainnet</strong>, a high-throughput blockchain engineered for micro-transactions, instant settlement, and enterprise-grade decentralized applications.</p>

    <div class="grid-3" style="margin: 4px 0;">
      <div class="card card-blue text-center">
        <div style="font-size:13pt; font-weight:900; color:#0E62E4;">2,000+ TPS</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Network Capacity</div>
        <p style="font-size:6.5pt; color:#64748B;">Zero Network Congestion</p>
      </div>
      <div class="card card-blue text-center">
        <div style="font-size:13pt; font-weight:900; color:#059669;">3.0s Finality</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Block Confirmation</div>
        <p style="font-size:6.5pt; color:#64748B;">Instant Matrix Node Fills</p>
      </div>
      <div class="card card-blue text-center">
        <div style="font-size:13pt; font-weight:900; color:#7C3AED;">$0.001 Fee</div>
        <div style="font-size:6.8pt; font-weight:700; color:#071A4A; text-transform:uppercase;">Average Gas Cost</div>
        <p style="font-size:6.5pt; color:#64748B;">Near-Zero Transaction Overhead</p>
      </div>
    </div>

    <h2>2. Super Representative (SR) Governance Integration</h2>
    <p>The protocol is officially anchored to the Equora Governance Super Representative (SR) on TrobChain: <code>TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY</code>. By staking network bandwidth and energy, the protocol guarantees <strong>Target 5 Free Daily Transactions</strong> for active retail matrix participants!</p>

    <h2>3. Zero-Gas Direct Push Optimization</h2>
    <p>Because payouts are executed as native token transfers within the main transaction call stack, recipient wallets receive their cash with zero gas burned on their end, making the user experience as seamless as modern digital banking.</p>
  </div>
  {footer(27)}
</div>
"""
pages.append(make_page_27())

def make_page_28():
    return f"""
<div class="page">
  {header('FRONTEND DASHBOARD UX & ENGINE')}
  <div class="content">
    <h2>1. Institutional Next.js & Web3 Visualizer Architecture</h2>
    <p>The Equora Matrix frontend is built on Next.js 14, React, TailwindCSS, and Ethers.js/Viem. It communicates directly with TrobChain fullnodes and the Neon Serverless DB indexer to render real-time matrix graphs with zero screen jitter.</p>

    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Radial 14-Node Tree SVG Engine</h3>
        <p style="font-size:7.2pt;">
          The dashboard visualizer dynamically renders the 14-node tree with interactive SVG nodes. Hovering over any node displays the member's 5-digit code, wallet address, fill timestamp, and payout destination.
        </p>
      </div>
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Sub-50ms Indexer Latency</h3>
        <p style="font-size:7.2pt;">
          A dedicated WebSocket listener indices block events, pushing real-time payout alerts to the user interface within 50 milliseconds of on-chain confirmation.
        </p>
      </div>
    </div>

    <h2>2. Mobile-First Responsive Tree Navigation</h2>
    <p>Recognizing that over 80% of global retail participants operate via mobile Web3 browsers (TrobSafe, TronLink Mobile, Bitget Wallet), the tree visualizer features smooth horizontal zoom and vertical stacking, ensuring an impeccable mobile experience.</p>

    <h2>3. Universal Perspective Switcher</h2>
    <p>Users can toggle between their personal 14-node view ("Logic of You") and the team genealogy graph to inspect downline boards, monitor cycle progress, and identify team members who need assistance.</p>
  </div>
  {footer(28)}
</div>
"""
pages.append(make_page_28())

def make_page_29():
    return f"""
<div class="page">
  {header('ECONOMIC COMPARATIVE ANALYSIS')}
  <div class="content">
    <h2>1. Equora Matrix vs. Legacy Network Architectures</h2>
    <p>A rigorous comparative analysis demonstrates the structural advantages of Equora Matrix over historical models such as Forsage x4, xGold, centralized Ponzi schemes, and forced binary matrix programs.</p>

    <table>
      <thead>
        <tr>
          <th>Evaluation Vector</th>
          <th>Forsage x4 / xGold</th>
          <th>Centralized MLM DApps</th>
          <th>Equora $30 Matrix</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Custody Model</strong></td><td>Non-Custodial</td><td>Centralized Contract Vault</td><td><strong>100% Non-Custodial Zero Escrow</strong></td></tr>
        <tr><td><strong>Admin Keys</strong></td><td>Immutable</td><td>Admin Can Halt & Modify</td><td><strong>Null-Keyed (Renounced)</strong></td></tr>
        <tr><td><strong>Ecosystem Pools</strong></td><td>0% (No Pools)</td><td>High Fees (Admin Skim)</td><td><strong>21.43% Across 4 Protocol Pools</strong></td></tr>
        <tr><td><strong>Downline Cash Injection</strong></td><td>Limited to Upline</td><td>None</td><td><strong>P7, P10, P13 Direct Cash Injection</strong></td></tr>
        <tr><td><strong>DAO Council Bridge</strong></td><td>None</td><td>None</td><td><strong>35% Autonomous Push to Genesis DAO</strong></td></tr>
        <tr><td><strong>Network Gas Fees</strong></td><td>High ($5 – $40 on ETH/BSC)</td><td>Variable</td><td><strong><$0.001 on TrobChain (5 Free TX/Day)</strong></td></tr>
        <tr><td><strong>Gamification</strong></td><td>None</td><td>None</td><td><strong>Magic Blind Box VRF & Rank NFTs</strong></td></tr>
        <tr><td><strong>Entry Barrier</strong></td><td>High / Unpredictable</td><td>$100 – $1,000+</td><td><strong>$30.00 USD Frictionless Global Standard</strong></td></tr>
      </tbody>
    </table>

    <h2>2. The Verdict: Generational Technological Superiority</h2>
    <p>Equora preserves the mathematical purity and immutability of early non-custodial smart contracts while adding institutional protocol liquidity, downline cash support, and an authentic DAO governance foundation.</p>
  </div>
  {footer(29)}
</div>
"""
pages.append(make_page_29())

def make_page_30():
    return f"""
<div class="page">
  {header('FAQ: RETAIL PARTICIPANTS')}
  <div class="content">
    <h2>1. Frequently Asked Questions: Grassroots & Retail Members</h2>
    
    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q1: What is the absolute minimum cost to get started?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> Exactly <strong>$30.00 USD worth of TROB</strong> (~536 TROB at the fixed peg of $0.056 USD), plus a few pennies worth of network energy for transaction broadcasting.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q2: Do I need advanced technical skills or blockchain coding experience?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> No. If you can use a digital Web3 wallet (TrobSafe, TronLink) to scan a QR code and click "Confirm", you can participate fully.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q3: How do I receive my earnings? Do I need to request a withdrawal?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> There is <strong>NO withdrawal request button</strong> because the contract never holds your funds. Earnings are pushed directly into your private wallet on-chain the microsecond a node is filled.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q4: What happens if I don't refer anyone immediately?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> You remain an active slot owner permanently. You can still receive top-down spillover from your upline into Positions P3, P6, P8, P9, P11, and P12, earning up to $180 per cycle.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q5: Can the developers change the rules, fees, or shut down the platform?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> No. Contract ownership is permanently renounced (Null Key). The smart contract code is immutable and will run on TrobChain as long as the blockchain exists.
      </p>
    </div>
  </div>
  {footer(30)}
</div>
"""
pages.append(make_page_30())

def make_page_31():
    return f"""
<div class="page">
  {header('FAQ: LEADERS & BUILDERS')}
  <div class="content">
    <h2>1. Frequently Asked Questions: Community Leaders & Global Builders</h2>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q1: How does the Monthly Leadership Royalty Pool pay out?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> <code>EquoraSalaryPool.sol</code> aggregates 40% of all protocol pool funds and executes an automated epoch distribution on the 11th of every month directly to qualified Alpha, Prime, Elite, and Crown leaders.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q2: What happens if a downline team member upgrades to a higher slot before me?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> The dynamic compression algorithm temporarily passes that slot's payment to the next qualified upline who owns that slot. Once you activate that slot, their future recycles return directly to your board.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q3: How many direct referrals do I need to maximize earnings?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> The baseline qualification requires just 2 active direct referrals. However, sponsoring 10 to 20 active builders creates a continuous cascade of follow-the-sponsor recycles, generating hundreds of cycles per month.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q4: Is there any expiration date on unlocked matrix slots?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> No. Once a slot is unlocked, it remains unlocked forever. You never have to re-purchase a slot to keep earning from it.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <h3 style="color:#0E62E4;">Q5: Can I build multiple legs and international teams seamlessly?</h3>
      <p style="font-size:7.2pt;">
        <strong>A:</strong> Yes. Your 5-digit member code works globally across any country, language, or time zone with instant cross-border settlement in TROB.
      </p>
    </div>
  </div>
  {footer(31)}
</div>
"""
pages.append(make_page_31())

def make_page_32():
    return f"""
<div class="page">
  {header('STRATEGIC PROTOCOL ROADMAP')}
  <div class="content">
    <h2>1. Multi-Phase Deployment & Launch Architecture</h2>
    <p>The transition from Genesis DAO governance into the global retail matrix follows a strictly sequenced, on-chain roadmap:</p>

    <div class="card card-blue" style="margin: 3px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="color:#0E62E4;">Phase 1: Genesis DAO Founding Window (Day 1 to 21)</h3>
        <span class="badge badge-blue">Completed / Active</span>
      </div>
      <p style="font-size:7.2pt; margin-top:2px;">
        100 Sovereign Founding Seats at $300 entry each. On-chain capital mobilization, smart contract security audits, Super Representative validator setup, and core protocol wiring.
      </p>
    </div>

    <div class="card card-highlight" style="margin: 3px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="color:#059669;">Phase 2: Global Retail Matrix Launch (Day 22)</h3>
        <span class="badge badge-emerald">Imminent Milestone</span>
      </div>
      <p style="font-size:7.2pt; margin-top:2px;">
        Official activation of <code>EquoraMatrix.sol</code>. Final Genesis DAO seat crowned as Root Apex Leader. Public $30 Slot 1 activation opens worldwide with 5-digit referral codes.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="color:#D97706;">Phase 3: First Monthly Royalty Settlement (Day 52)</h3>
        <span class="badge badge-amber">Epoch Settlement</span>
      </div>
      <p style="font-size:7.2pt; margin-top:2px;">
        Execution of the first 30-day Leadership Royalty epoch payout via <code>EquoraSalaryPool.sol</code>. Milestone Rank NFTs minted for Alpha, Prime, Elite, and Crown leaders.
      </p>
    </div>

    <div class="card card-blue" style="margin: 3px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="color:#7C3AED;">Phase 4: Cross-Chain Expansion & DeFi Integration (Year 1)</h3>
        <span class="badge badge-purple">Global Scale</span>
      </div>
      <p style="font-size:7.2pt; margin-top:2px;">
        Deployment of cross-chain bridging adapters, decentralized swap integrations, and institutional staking liquidity pools.
      </p>
    </div>
  </div>
  {footer(32)}
</div>
"""
pages.append(make_page_32())

def make_page_33():
    return f"""
<div class="page">
  {header('CONCLUSION & SPECIFICATIONS')}
  <div class="content">
    <h2>1. Institutional Summary of Protocol Invariants</h2>
    <p>The Equora Matrix represents the culmination of decentralized network engineering: combining absolute non-custodial safety, mathematical conservation of capital, frictionless retail access, and systemic multi-tiered community rewards.</p>

    <table>
      <thead>
        <tr>
          <th>Specification Metric</th>
          <th>Protocol Value</th>
          <th>On-Chain Verification Method</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Base Slot 1 Entry Cost</strong></td><td>$30.00 USD (535.71 TROB)</td><td><code>EquoraMatrix.BASE_SLOT_COST()</code></td></tr>
        <tr><td><strong>Board Topology</strong></td><td>14 Nodes (2-4-8 Compressed Tree)</td><td><code>EquoraMatrix.TREE_NODES()</code></td></tr>
        <tr><td><strong>Owner Board Cashflow</strong></td><td>600% ($180.00 per cycle)</td><td>Positions P3, P6, P8, P9, P11, P12</td></tr>
        <tr><td><strong>Protocol Pool Inflow</strong></td><td>21.43% ($90.00 per cycle)</td><td>Positions P4, P5, P14 -> EquoraVault</td></tr>
        <tr><td><strong>DAO Treasury Pool Share</strong></td><td>35.00% ($31.50 per cycle)</td><td><code>EquoraVault.DAO_BPS = 3500</code></td></tr>
        <tr><td><strong>Leadership Royalty Share</strong></td><td>40.00% ($36.00 per cycle)</td><td><code>EquoraVault.SALARY_BPS = 4000</code></td></tr>
        <tr><td><strong>Magic Blind Box Share</strong></td><td>10.00% ($9.00 per cycle)</td><td><code>EquoraVault.MAGICBOX_BPS = 1000</code></td></tr>
        <tr><td><strong>Lucky Drops Share</strong></td><td>15.00% ($13.50 per cycle)</td><td><code>EquoraVault.REWARDS_BPS = 1500</code></td></tr>
        <tr><td><strong>Total Slots Available</strong></td><td>12 Progressive Levels</td><td><code>EquoraMatrix.TOTAL_SLOTS = 12</code></td></tr>
        <tr><td><strong>Settlement Mechanism</strong></td><td>100% P2P Autonomous Direct Push</td><td>Immediate Atomic Transfer</td></tr>
        <tr><td><strong>Governance Anchor</strong></td><td>TrobChain Super Representative</td><td><code>TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY</code></td></tr>
        <tr><td><strong>Contract Ownership</strong></td><td>Permanently Renounced (Null Key)</td><td><code>owner() == address(0)</code></td></tr>
      </tbody>
    </table>
  </div>
  {footer(33)}
</div>
"""
pages.append(make_page_33())

def make_page_34():
    return f"""
<div class="page">
  {header('FORMAL RATIFICATION & SIGN-OFF')}
  <div class="content">
    <h2>1. Formal Institutional Governance Sign-Off</h2>
    <p>This master whitepaper and technical specification has been formally ratified by the founding governance committee of Lexvra Infinology and the Equora Protocol Genesis Council.</p>

    <div class="card card-dark" style="padding: 10px 14px; margin: 4px 0;">
      <div style="font-size:9.5pt; font-weight:800; color:#38BDF8; margin-bottom:4px;">PROTOCOL RATIFICATION DECLARATION</div>
      <p style="font-size:7.2pt; color:#E2E8F0; line-height:1.45;">
        "We hereby ratify and confirm that the mathematical models, economic distributions, and smart contract architectures set forth in this document represent the immutable, non-custodial standard of the Equora Matrix Protocol. No human entity possesses the authority to alter, suspend, or compromise these decentralized parameters."
      </p>
    </div>

    <h2>2. Official Verification Resources</h2>
    <div class="grid-2" style="margin: 4px 0;">
      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Official Web & DApp Portal</h3>
        <p style="font-size:7.2pt;">
          <strong>Website:</strong> https://equorafidao.com<br>
          <strong>DApp Dashboard:</strong> https://equorafidao.com/matrix<br>
          <strong>Documentation:</strong> https://equorafidao.com/docs
        </p>
      </div>

      <div class="card card-blue">
        <h3 style="color:#0E62E4;">Smart Contract Repositories</h3>
        <p style="font-size:7.2pt;">
          <strong>GitHub:</strong> github.com/LexvraInfinology/dao<br>
          <strong>Network:</strong> TrobChain Mainnet (Chain ID: 1000)<br>
          <strong>Super Representative:</strong> TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY
        </p>
      </div>
    </div>

    <div style="margin-top: 15mm; border-top: 1px solid #CBD5E1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 7pt; color: #64748B;">
      <div>
        <strong>RATIFIED BY:</strong> LEXVRA SOVEREIGN COUNCIL<br>
        <strong>DATE OF RATIFICATION:</strong> OCTOBER 2026
      </div>
      <div style="text-align: right;">
        <strong>CRYPTOGRAPHIC STATUS:</strong> ON-CHAIN VERIFIED<br>
        <strong>IMMUTABLE CODE:</strong> NULL KEYED
      </div>
    </div>
  </div>
  {footer(34)}
</div>
"""
pages.append(make_page_34())

# Compile full HTML document
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Equora.Fi — Retail Matrix Master Whitepaper ($30 Plan Specification)</title>
<style>
{CSS}
</style>
</head>
<body>
{"".join(pages)}
</body>
</html>
"""

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"✓ Master Whitepaper HTML written at: {HTML_FILE}")

# Launch Headless Chrome to compile PDF
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
browser_bin = chrome_path if os.path.exists(chrome_path) else edge_path

html_uri = "file:///" + HTML_FILE.replace("\\", "/")
cmd = f'"{browser_bin}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="{PDF_FILE_1}" "{html_uri}"'

print("Launching Chromium to render vector-sharp 34-Page A4 PDF...")
ret = subprocess.run(cmd, shell=True)

if ret.returncode == 0:
    print(f"[OK] Master Whitepaper PDF generated at: {PDF_FILE_1}")
    shutil.copyfile(PDF_FILE_1, PDF_FILE_2)
    shutil.copyfile(PDF_FILE_1, PDF_FILE_3)
    shutil.copyfile(PDF_FILE_1, PDF_FILE_ARTIFACT)
    print(f"[OK] Copied to: {PDF_FILE_2}")
    print(f"[OK] Copied to: {PDF_FILE_3}")
    print(f"[OK] Copied to IDE Artifacts: {PDF_FILE_ARTIFACT}")
    print("[SUCCESS] 34-Page Master Whitepaper PDF generated perfectly!")
else:
    print(f"[ERROR] Chromium rendering failed with exit code {ret.returncode}")
    sys.exit(ret.returncode)
