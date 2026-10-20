import os
import sys

# Script to regenerate scripts/build_concise_matrix_whitepaper.py with full theoretical rigor and exact business logic

TARGET_FILE = r"c:\Users\Dell\Documents\codes\equorafi\scripts\build_concise_matrix_whitepaper.py"

content = '''"""
Equora Matrix Master Whitepaper - Concise 10-Page High-Impact Edition V6.2
Theoretical & Mathematical Specification: Single $30 Lifetime Entry, P4+P5 Auto-Unlock Engine,
6-Node Direct Board Cashflow, Meritocratic 2-Referral Routing, and Zero-Leakage Protocol Pools.
"""
import os
import sys
import base64
import shutil
import subprocess

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = r"c:\\Users\\Dell\\Documents\\codes\\equorafi"
DOCS_DIR = os.path.join(ROOT_DIR, "docs")
EQUORA_DOCS_DIR = os.path.join(ROOT_DIR, "equorafidocs", "docs")
A4_DIR = os.path.join(EQUORA_DOCS_DIR, "01_A4_Portrait_Whitepapers")
ARTIFACTS_DIR = r"C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\de42cc02-dc83-412e-8004-6154a8c7e998"
CURRENT_ARTIFACTS_DIR = r"C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\fd46de35-6797-4f9e-82be-20cfb220e80e"

for d in [DOCS_DIR, EQUORA_DOCS_DIR, A4_DIR, ARTIFACTS_DIR, CURRENT_ARTIFACTS_DIR]:
    os.makedirs(d, exist_ok=True)

HTML_FILE = os.path.join(DOCS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.html")
PDF_FILE_1 = os.path.join(DOCS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
PDF_FILE_2 = os.path.join(EQUORA_DOCS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
PDF_FILE_3 = os.path.join(A4_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
PDF_FILE_ARTIFACT = os.path.join(ARTIFACTS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
PDF_FILE_CURRENT_ARTIFACT = os.path.join(CURRENT_ARTIFACTS_DIR, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")

def to_base64(path):
    if not os.path.exists(path):
        return ""
    mime = "image/png" if path.endswith(".png") else "image/jpeg"
    if path.endswith(".svg"):
        mime = "image/svg+xml"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode("utf-8")

logo_b64 = to_base64(os.path.join(ROOT_DIR, "equorafidocs", "presentation_assets", "brand_lockup_transparent.png"))
cube_b64 = to_base64(os.path.join(ROOT_DIR, "apps", "web-dao", "public", "landing", "trobchain-cube.png"))

print("Loaded high-resolution branding assets.")

CSS = """
  @page {
    size: 210mm 297mm;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    background: #cbd5e1;
    font-size: 8.2pt;
    line-height: 1.36;
  }
  .page {
    width: 210mm;
    height: 297mm;
    page-break-after: always;
    break-after: page;
    position: relative;
    overflow: hidden;
    padding: 11mm 13mm 11mm 13mm;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 0 auto 10px auto;
  }
  @media print {
    body { background: transparent; }
    .page { margin: 0; box-shadow: none; }
  }

  /* HEADER & FOOTER */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.2px solid #e2e8f0;
    padding-bottom: 4px;
    margin-bottom: 6px;
    height: 30px;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-brand img {
    height: 22px;
    object-fit: contain;
  }
  .header-brand-title {
    font-size: 8.5pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 0.5px;
  }
  .header-meta {
    font-size: 7.2pt;
    font-weight: 700;
    color: #0284c7;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
    margin-top: 5px;
    height: 20px;
    font-size: 6.8pt;
    color: #64748b;
    font-weight: 600;
  }

  /* HEADINGS */
  .section-title {
    font-size: 12.5pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 2px 0;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 15px;
    background: #1d4ed8;
    border-radius: 2px;
  }
  .section-subtitle {
    font-size: 7.8pt;
    color: #64748b;
    margin: 0 0 6px 0;
    font-weight: 500;
  }

  /* CONTENT BLOCKS */
  .content-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 6px;
  }
  p {
    margin: 0 0 4px 0;
    color: #334155;
    text-align: justify;
    line-height: 1.34;
  }
  .card-grid {
    display: grid;
    gap: 6px;
  }
  .grid-2 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

  .info-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 8px;
  }
  .info-card.highlight {
    background: #eff6ff;
    border-color: #bfdbfe;
  }
  .info-card.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }
  .info-card.warning {
    background: #fffbeb;
    border-color: #fde68a;
  }
  .info-card.purple {
    background: #faf5ff;
    border-color: #e9d5ff;
  }
  .info-card-title {
    font-size: 7.6pt;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .info-card-desc {
    font-size: 6.8pt;
    color: #475569;
    line-height: 1.32;
  }

  /* INSTITUTIONAL TABLES */
  .institutional-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 6.9pt;
    margin: 2px 0;
  }
  .institutional-table th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    padding: 4px 6px;
    text-align: left;
    border: 1px solid #1e293b;
    text-transform: uppercase;
    font-size: 6.4pt;
    letter-spacing: 0.4px;
  }
  .institutional-table td {
    padding: 3.5px 6px;
    border: 1px solid #e2e8f0;
    color: #334155;
  }
  .institutional-table tr:nth-child(even) {
    background: #f8fafc;
  }
  .institutional-table tr.total-row {
    background: #0f172a !important;
    color: #ffffff !important;
    font-weight: 800;
  }
  .institutional-table tr.total-row td {
    color: #ffffff !important;
    border-color: #1e293b;
  }

  /* COVER STYLING */
  .cover {
    background: radial-gradient(circle at 50% 25%, #0f172a 0%, #020617 100%);
    color: #ffffff;
    padding: 18mm 18mm 14mm 18mm;
    justify-content: space-between;
  }
  .cover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 12px;
  }
  .cover-badge {
    background: rgba(2, 132, 199, 0.2);
    border: 1px solid #38bdf8;
    color: #38bdf8;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 7.2pt;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .cover-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: auto 0;
  }
  .cover-cube {
    height: 105px;
    margin-bottom: 12px;
    filter: drop-shadow(0 0 35px rgba(56, 189, 248, 0.45));
  }
  .cover-h1 {
    font-size: 27pt;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.5px;
    line-height: 1.1;
    margin-bottom: 4px;
    background: linear-gradient(135deg, #ffffff 0%, #bae6fd 60%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .cover-h2 {
    font-size: 8.8pt;
    color: #94a3b8;
    max-width: 530px;
    line-height: 1.45;
    margin: 8px auto 14px auto;
  }
  .cover-features-strip {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .cover-feature-pill {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(56, 189, 248, 0.35);
    padding: 3.5px 9px;
    border-radius: 14px;
    font-size: 7.2pt;
    color: #e0f2fe;
    font-weight: 600;
  }
  .cover-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    width: 100%;
    max-width: 550px;
  }
  .cover-stat-box {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: 8px;
    padding: 10px 6px;
    text-align: center;
  }
  .cover-stat-val {
    font-size: 13.5pt;
    font-weight: 900;
    color: #38bdf8;
    line-height: 1.1;
  }
  .cover-stat-lbl {
    font-size: 6.2pt;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 3px;
  }
  .cover-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 10px;
    font-size: 7.2pt;
    color: #64748b;
  }
"""

def make_header(title, section_code, page_num):
    return f"""
    <div class="page-header">
      <div class="header-brand">
        <img src="{logo_b64}" alt="Equora.fi Logo" />
        <span class="header-brand-title">EQUORA.FI</span>
      </div>
      <div class="header-meta">{section_code} | DEFI ON TROBCHAIN</div>
    </div>
    """

def make_footer(page_num):
    return f"""
    <div class="page-footer">
      <div>EQUORA MATRIX PROTOCOL &bull; MASTER SPECIFICATION V6.2</div>
      <div>PEGGED AT $0.056 / TROB &bull; VERIFIED ON SCAN.TROBCHAIN.COM</div>
      <div>PAGE {page_num} OF 10</div>
    </div>
    """

pages_html = []

# ==============================================================================
# PAGE 1: COVER
# ==============================================================================
page_1 = f"""
<div class="page cover">
  <div class="cover-header">
    <img src="{logo_b64}" style="height: 36px; object-fit: contain;" alt="Equora Logo" />
    <div class="cover-badge">MAINNET MASTER SPECIFICATION V6.2</div>
  </div>

  <div class="cover-hero">
    <img src="{cube_b64}" class="cover-cube" alt="TrobChain Cube" />
    <div class="cover-h1">EQUORA MATRIX PROTOCOL</div>
    <div style="font-size: 13pt; font-weight: 800; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase;">
      Architectural &amp; Mathematical Whitepaper
    </div>
    <div class="cover-h2">
      The Autonomous 14-Node Recursive Matrix Engine: Single $30 Lifetime Entry, Automatic P4+P5 Tier Unlocks,
      600% Direct Board Cashflow (6 Nodes), Meritocratic 2-Referral Routing, and Zero-Leakage Protocol Pools Pegged at 0.056 USD/TROB.
    </div>

    <div class="cover-features-strip">
      <div class="cover-feature-pill">&#10003; $30 One-Time Lifetime Entry</div>
      <div class="cover-feature-pill">&#10003; $0 Upgrades (P4+P5 Auto-Unlock)</div>
      <div class="cover-feature-pill">&#10003; 600% Board Owner Cashflow (6 Nodes)</div>
      <div class="cover-feature-pill">&#10003; Meritocratic 2-Referral Gate</div>
      <div class="cover-feature-pill">&#10003; Zero-Leakage Protocol Pools</div>
    </div>

    <div class="cover-grid">
      <div class="cover-stat-box">
        <div class="cover-stat-val">$30.00</div>
        <div class="cover-stat-lbl">ONE-TIME LIFETIME ENTRY</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">600%</div>
        <div class="cover-stat-lbl">DIRECT BOARD CASHFLOW</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">P4 + P5</div>
        <div class="cover-stat-lbl">AUTO-UNLOCKS NEXT TIER</div>
      </div>
      <div class="cover-stat-box">
        <div class="cover-stat-val">$0.056</div>
        <div class="cover-stat-lbl">IMMUTABLE CONTRACT PEG</div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div>OFFICIAL GOVERNANCE SPECIFICATION &bull; RATIFIED BY EQUORA DAO</div>
    <div>SMART CONTRACT VERIFIED ON SCAN.TROBCHAIN.COM</div>
    <div>OCTOBER 2026 EDITION</div>
  </div>
</div>
"""
pages_html.append(page_1)

# ==============================================================================
# PAGE 2: EXECUTIVE PROTOCOL SUMMARY & THEORETICAL ARCHITECTURE
# ==============================================================================
page_2 = f"""
<div class="page">
  {make_header("Executive Protocol Summary", "SYSTEM ARCHITECTURE", 2)}
  <div class="content-body">
    <div>
      <div class="section-title">1. Executive Protocol Summary &amp; Theoretical Architecture</div>
      <div class="section-subtitle">Single-Capital Deposit Invariant, Closed-Cycle Solvency &amp; Zero-Leakage Conservation</div>
    </div>

    <p>
      The <strong>Equora Matrix Protocol</strong> solves the fundamental capital attrition problem inherent in legacy matrix architectures. Operating directly on <strong>TrobChain Mainnet</strong>, Equora enforces a mathematically sound <strong>Single-Capital Deposit Model</strong>: participants activate their journey with a single out-of-pocket payment of <strong>$30.00 USD (in TROB)</strong> on Slot 1. Higher tiers (Slots 2 through 12) require <strong>$0.00 out-of-pocket capital</strong>, as they are autonomously unlocked through the cryptographic arrival of nodes <strong>P4 and P5</strong> in the preceding tier, while their deposited liquidity streams directly to fuel the 4 Automated Protocol Pools.
    </p>

    <!-- HIGH LEVEL SVG FLOW DIAGRAM -->
    <div style="background: #f8fafc; border: 1.2px solid #cbd5e1; border-radius: 8px; padding: 8px; text-align: center;">
      <div style="font-size: 7.8pt; font-weight: 800; color: #0f172a; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
        High-Level Protocol Capital Routing &amp; Auto-Progression Architecture
      </div>
      <svg width="100%" height="165" viewBox="0 0 680 165" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit;">
        <defs>
          <linearGradient id="gradRouter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1d4ed8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>

        <!-- ENTRY BOX -->
        <rect x="15" y="58" width="125" height="52" rx="6" fill="#0f172a" />
        <text x="77" y="78" fill="#ffffff" font-size="8.5" font-weight="bold" text-anchor="middle">USER ACTIVATION</text>
        <text x="77" y="92" fill="#38bdf8" font-size="8" font-weight="bold" text-anchor="middle">$30 ONE-TIME ENTRY</text>
        <text x="77" y="103" fill="#94a3b8" font-size="6.8" text-anchor="middle">$0 Out-of-Pocket Upgrades</text>

        <!-- ARROW TO ROUTER -->
        <line x1="140" y1="84" x2="175" y2="84" stroke="#0284c7" stroke-width="2.5" />

        <!-- ROUTER -->
        <rect x="175" y="48" width="145" height="72" rx="8" fill="url(#gradRouter)" />
        <text x="247" y="74" fill="#ffffff" font-size="9.5" font-weight="bold" text-anchor="middle">EQUORA ROUTER</text>
        <text x="247" y="89" fill="#e0f2fe" font-size="7.5" text-anchor="middle">100% Non-Custodial EVM</text>
        <text x="247" y="101" fill="#bae6fd" font-size="7.5" font-weight="bold" text-anchor="middle">2-Referral Gate Verifier</text>
        <text x="247" y="112" fill="#e0f2fe" font-size="6.5" text-anchor="middle">Zero-Leakage Invariant</text>

        <!-- SPLIT PATHS -->
        <path d="M 320 62 L 365 24" stroke="#059669" stroke-width="2" fill="none" />
        <path d="M 320 74 L 365 62" stroke="#ea580c" stroke-width="2" fill="none" />
        <path d="M 320 94 L 365 106" stroke="#0284c7" stroke-width="2" fill="none" />
        <path d="M 320 106 L 365 144" stroke="#7c3aed" stroke-width="2" fill="none" />

        <!-- BRANCH 1: YOU DIRECT CASHFLOW -->
        <rect x="365" y="8" width="305" height="32" rx="5" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
        <text x="375" y="21" fill="#065f46" font-size="7.8" font-weight="bold">42.86% &bull; DIRECT BOARD OWNER CASHFLOW (6 NODES: P3, P6, P8, P9, P11, P12)</text>
        <text x="375" y="32" fill="#047857" font-size="7">Instant $180 Cashflow per cycle (600% ROI). Requires 2 Direct Referrals to qualify.</text>

        <!-- BRANCH 2: SPONSOR BONUS -->
        <rect x="365" y="46" width="305" height="32" rx="5" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.2" />
        <text x="375" y="59" fill="#9a3412" font-size="7.8" font-weight="bold">14.28% &bull; IMMEDIATE UPLINE SPONSOR (2 NODES: P1, P2)</text>
        <text x="375" y="70" fill="#c2410c" font-size="7">Direct 200% commission ($60 on Slot 1) paid instantly to the direct inviter/sponsor.</text>

        <!-- BRANCH 3: AUTOMATED POOLS & PROGRESSION -->
        <rect x="365" y="84" width="305" height="42" rx="5" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="1.2" />
        <text x="375" y="97" fill="#0369a1" font-size="7.8" font-weight="bold">21.43% &bull; AUTOMATED POOLS &amp; AUTO-PROGRESSION (P4, P5, P14)</text>
        <text x="375" y="109" fill="#0284c7" font-size="7">P4 + P5 deposits ($60) fund 4 Pools &amp; AUTO-UNLOCK Slot 2 at $0 cost!</text>
        <text x="375" y="119" fill="#0284c7" font-size="7">P14 deposit ($30) funds 4 Pools &amp; triggers INFINITE TREE AUTO-RECYCLE!</text>

        <!-- BRANCH 4: DOWNLINE MERITOCRATIC EVALUATION -->
        <rect x="365" y="130" width="305" height="32" rx="5" fill="#faf5ff" stroke="#d8b4fe" stroke-width="1.2" />
        <text x="375" y="143" fill="#581c87" font-size="7.8" font-weight="bold">21.43% &bull; MERITOCRATIC DOWNLINE ALLOCATION (P7, P10, P13)</text>
        <text x="375" y="154" fill="#6b21a8" font-size="7">P7/P10 check P1/P2; P13 checks P3-P6. Unqualified funds fail-safe to 4 Pools Vault!</text>
      </svg>
    </div>

    <!-- CORE VALUE PILLARS & THEORETICAL THEOREMS -->
    <div class="card-grid grid-4">
      <div class="info-card highlight">
        <div class="info-card-title">&#9654; Single $30 Deposit</div>
        <div class="info-card-desc">
          Strictly bounded at $30 out-of-pocket for life. Slots 2 through 12 require zero external capital, automatically funded through P4 and P5 matrix completions.
        </div>
      </div>
      <div class="info-card success">
        <div class="info-card-title">&#9654; 600% Direct ROI</div>
        <div class="info-card-desc">
          Exactly 6 nodes (P3, P6, P8, P9, P11, P12) flow directly to the qualified Board Owner's wallet, delivering an invariable 6x net cashflow ($180 on Slot 1).
        </div>
      </div>
      <div class="info-card warning">
        <div class="info-card-title">&#9654; 2-Referral Gate</div>
        <div class="info-card-desc">
          Downline allocations and matrix yields require having referred &ge; 2 active members. Eliminates passive parasitic extraction and enforces active network health.
        </div>
      </div>
      <div class="info-card purple">
        <div class="info-card-title">&#9654; Zero-Leakage Vault</div>
        <div class="info-card-desc">
          If any evaluated downline (P1, P2 or P3-P6) is unqualified, 100% of the funds route into the 4 Automated Protocol Pools Vault. No money is ever stranded or lost.
        </div>
      </div>
    </div>

    <!-- INSTITUTIONAL ARCHITECTURAL TENETS -->
    <div class="card-grid grid-2">
      <div class="info-card">
        <div class="info-card-title">Mathematical Solvency Invariant: &sum; V(P_i) = 14 &times; V_slot</div>
        <div class="info-card-desc">
          Unlike fractional-reserve platforms that promise artificial yields, Equora operates on closed-cycle zero-debt conservation. Every dollar injected across the 14 nodes is completely and atomically accounted for within the exact transaction block.
        </div>
      </div>
      <div class="info-card success">
        <div class="info-card-title">Continuous Liquidity Streaming Pegged at 0.056 USD / TROB</div>
        <div class="info-card-desc">
          All smart contract arithmetic is denominated at an invariant peg of $0.056 USD per TROB coin, protecting users from secondary price shocks while delivering immutable, non-custodial decentralized execution across global borders.
        </div>
      </div>
    </div>
  </div>
  {make_footer(2)}
</div>
"""
pages_html.append(page_2)

# ==============================================================================
# PAGE 3: 14-NODE MATRIX BLUEPRINT & SETTLEMENT ENGINE
# ==============================================================================
page_3 = f"""
<div class="page">
  {make_header("Matrix Architecture Blueprint", "14-NODE ENGINE", 3)}
  <div class="content-body">
    <div>
      <div class="section-title">2. The 14-Node Matrix Topology &amp; Settlement Blueprint</div>
      <div class="section-subtitle">P4-P5 Tier Escalation, 2-Referral Qualification Logic &amp; 6-Node Cashflow Architecture</div>
    </div>

    <p>
      The Equora board is structured as a <strong>15-position binary-trinary recursive tree</strong>: 1 Apex Seat (YOU, the Board Owner) surrounded by 14 operational node positions distributed across 3 geometric tiers (2 nodes on Tier 1, 4 nodes on Tier 2, and 8 nodes on Tier 3).
    </p>

    <!-- FULL SVG 14-NODE MATRIX BOARD WITH ACCURATE NODE LOGIC -->
    <div style="background: #ffffff; border: 1.2px solid #cbd5e1; border-radius: 8px; padding: 8px; text-align: center;">
      <div style="font-size: 7.8pt; font-weight: 800; color: #0f172a; margin-bottom: 5px; text-transform: uppercase;">
        Exact 14-Node Settlement Routing &amp; Multi-Tier Execution Diagram
      </div>
      <svg width="100%" height="240" viewBox="0 0 680 240" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit;">
        <!-- YOU NODE -->
        <circle cx="340" cy="24" r="17" fill="#1d4ed8" stroke="#0284c7" stroke-width="2.5" />
        <text x="340" y="28.5" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">YOU</text>

        <!-- TIER 1 CONNECTOR LINES -->
        <line x1="340" y1="41" x2="210" y2="76" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="340" y1="41" x2="470" y2="76" stroke="#94a3b8" stroke-width="1.5" />

        <!-- TIER 1 BADGE PILL -->
        <rect x="235" y="46" width="210" height="18" rx="9" fill="#fff7ed" stroke="#fdba74" stroke-width="1.2" />
        <text x="340" y="58.5" fill="#c2410c" font-size="7.2" font-weight="bold" text-anchor="middle">TIER 1 &bull; 100% to Upline Sponsor (P1 + P2 = $60)</text>

        <!-- TIER 1: P1, P2 (ORANGE - UPLINE) -->
        <circle cx="210" cy="80" r="14" fill="#ea580c" />
        <text x="210" y="84" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">P1</text>
        <circle cx="470" cy="80" r="14" fill="#ea580c" />
        <text x="470" y="84" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">P2</text>

        <!-- TIER 2 CONNECTOR LINES -->
        <line x1="210" y1="94" x2="140" y2="135" stroke="#94a3b8" stroke-width="1.2" />
        <line x1="210" y1="94" x2="280" y2="135" stroke="#94a3b8" stroke-width="1.2" />
        <line x1="470" y1="94" x2="400" y2="135" stroke="#94a3b8" stroke-width="1.2" />
        <line x1="470" y1="94" x2="540" y2="135" stroke="#94a3b8" stroke-width="1.2" />

        <!-- TIER 2 BADGE PILL -->
        <rect x="185" y="104" width="310" height="18" rx="9" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
        <text x="340" y="116.5" fill="#15803d" font-size="7.2" font-weight="bold" text-anchor="middle">TIER 2 &bull; P3, P6 to YOU ($60) | P4, P5 to Pools ($60) &amp; UNLOCKS SLOT 2</text>

        <!-- TIER 2: P3 (YOU), P4 (POOLS/UNLOCK), P5 (POOLS/UNLOCK), P6 (YOU) -->
        <circle cx="140" cy="142" r="14" fill="#059669" />
        <text x="140" y="146" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">P3</text>
        <circle cx="280" cy="142" r="14" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
        <text x="280" y="146" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">P4</text>
        <circle cx="400" cy="142" r="14" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
        <text x="400" y="146" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">P5</text>
        <circle cx="540" cy="142" r="14" fill="#059669" />
        <text x="540" y="146" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">P6</text>

        <!-- TIER 3 CONNECTOR LINES -->
        <line x1="140" y1="156" x2="60" y2="195" stroke="#cbd5e1" stroke-width="1" />
        <line x1="140" y1="156" x2="130" y2="195" stroke="#cbd5e1" stroke-width="1" />
        <line x1="280" y1="156" x2="200" y2="195" stroke="#cbd5e1" stroke-width="1" />
        <line x1="280" y1="156" x2="270" y2="195" stroke="#cbd5e1" stroke-width="1" />
        <line x1="400" y1="156" x2="410" y2="195" stroke="#cbd5e1" stroke-width="1" />
        <line x1="400" y1="156" x2="480" y2="195" stroke="#cbd5e1" stroke-width="1" />
        <line x1="540" y1="156" x2="550" y2="195" stroke="#cbd5e1" stroke-width="1" />
        <line x1="540" y1="156" x2="620" y2="195" stroke="#cbd5e1" stroke-width="1" />

        <!-- TIER 3 NODES: P7 to P14 -->
        <!-- P7: PURPLE (CHECKS P1/P2) -->
        <circle cx="60" cy="202" r="13" fill="#7c3aed" />
        <text x="60" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P7</text>
        <!-- P8: GREEN (YOU) -->
        <circle cx="130" cy="202" r="13" fill="#059669" />
        <text x="130" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P8</text>
        <!-- P9: GREEN (YOU) -->
        <circle cx="200" cy="202" r="13" fill="#059669" />
        <text x="200" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P9</text>
        <!-- P10: PURPLE (CHECKS P1/P2) -->
        <circle cx="270" cy="202" r="13" fill="#7c3aed" />
        <text x="270" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P10</text>
        <!-- P11: GREEN (YOU) -->
        <circle cx="410" cy="202" r="13" fill="#059669" />
        <text x="410" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P11</text>
        <!-- P12: GREEN (YOU) -->
        <circle cx="480" cy="202" r="13" fill="#059669" />
        <text x="480" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P12</text>
        <!-- P13: MAGENTA (CHECKS P3-P6 WATERFALL) -->
        <circle cx="550" cy="202" r="13" fill="#db2777" />
        <text x="550" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P13</text>
        <!-- P14: RUBY (POOLS + RECYCLE) -->
        <circle cx="620" cy="202" r="13" fill="#dc2626" />
        <text x="620" y="206" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">P14</text>

        <!-- TIER 3 SUBTEXT -->
        <text x="95" y="228" fill="#581c87" font-size="6.8" font-weight="bold" text-anchor="middle">P7: Check P1/P2 | P8: YOU</text>
        <text x="235" y="228" fill="#065f46" font-size="6.8" font-weight="bold" text-anchor="middle">P9: YOU | P10: Check P1/P2</text>
        <text x="445" y="228" fill="#065f46" font-size="6.8" font-weight="bold" text-anchor="middle">P11: YOU | P12: YOU</text>
        <text x="585" y="228" fill="#991b1b" font-size="6.8" font-weight="bold" text-anchor="middle">P13: Waterfall P3-P6 | P14: Recycle</text>
      </svg>
    </div>

    <!-- 14-NODE MASTER CASHFLOW SUMMARY TABLE -->
    <table class="institutional-table">
      <thead>
        <tr>
          <th>Beneficiary Designation</th>
          <th>Node Identifiers</th>
          <th>Allocation Rules &amp; Operational Triggers</th>
          <th>Slot 1 Value</th>
          <th>% Volume</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f0fdf4;">
          <td><strong style="color:#059669;">YOU (Board Owner Cashflow)</strong></td>
          <td>P3, P6, P8, P9, P11, P12</td>
          <td>100% Direct to YOU. Requires &ge; 2 direct referrals to claim.</td>
          <td><strong>$180.00 USD</strong></td>
          <td><strong>42.86% (600% ROI)</strong></td>
        </tr>
        <tr>
          <td>Immediate Upline Sponsor</td>
          <td>P1, P2</td>
          <td>100% Direct to immediate inviter/sponsor (200% commission).</td>
          <td>$60.00 USD</td>
          <td>14.28% (200%)</td>
        </tr>
        <tr style="background: #eff6ff;">
          <td><strong style="color:#0284c7;">Auto-Unlock Next Slot (4 Pools)</strong></td>
          <td>P4, P5</td>
          <td>100% to 4 Protocol Pools + <strong>AUTONOMOUSLY UNLOCKS NEXT SLOT</strong>.</td>
          <td>$60.00 USD</td>
          <td>14.28% (Unlocks Tier)</td>
        </tr>
        <tr style="background: #faf5ff;">
          <td><strong style="color:#7c3aed;">Downline 1 Meritocratic Check</strong></td>
          <td>P7, P10</td>
          <td>Checks P1 (2 refs? pay) else P2; splits 50/50 if both; else <strong>routes to 4 Pools</strong>.</td>
          <td>$60.00 USD</td>
          <td>14.28% (or 4 Pools)</td>
        </tr>
        <tr style="background: #fdf2f8;">
          <td><strong style="color:#db2777;">Downline 2 Depth Waterfall</strong></td>
          <td>P13</td>
          <td>Waterfall checks P3 &rarr; P4 &rarr; P5 &rarr; P6 (&ge;2 refs); else <strong>routes to 4 Pools</strong>.</td>
          <td>$30.00 USD</td>
          <td>7.14% (or 4 Pools)</td>
        </tr>
        <tr style="background: #fef2f2;">
          <td><strong style="color:#b91c1c;">Perpetual Board Re-entry (Recycle)</strong></td>
          <td>P14</td>
          <td>100% to 4 Protocol Pools + <strong>CLEARS BOARD &amp; RE-ENTERS UNDER SPONSOR</strong>.</td>
          <td>$30.00 USD</td>
          <td>7.14% (Perpetual Re-entry)</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL FULL BOARD CYCLE</td>
          <td>All 14 Node Positions</td>
          <td>Deterministic Closed-Loop Conservation: Zero Stuck Funds</td>
          <td>$420.00 USD</td>
          <td>100.00% BALANCED</td>
        </tr>
      </tbody>
    </table>

    <!-- 2 THEORETICAL MECHANICS CARDS -->
    <div class="card-grid grid-2">
      <div class="info-card highlight">
        <div class="info-card-title">P7 &amp; P10 Meritocratic Routing Algorithm</div>
        <div class="info-card-desc">
          When P7 or P10 settles, the contract executes: <code>if (P1.refs &ge; 2 &amp;&amp; P2.refs &ge; 2) split(50/50); else if (P1.refs &ge; 2) pay(P1); else if (P2.refs &ge; 2) pay(P2); else routeToPoolsVault();</code> Zero leakage: inactive downlines forfeit funds to protocol pools!
        </div>
      </div>
      <div class="info-card success">
        <div class="info-card-title">P13 Waterfall &amp; P14 Infinite Auto-Recycle</div>
        <div class="info-card-desc">
          P13 cascades through downline depth (P3 &rarr; P4 &rarr; P5 &rarr; P6), paying the first eligible node or spilling over to pools. P14 deposits $30 into the pools and atomically resets the board, triggering perpetual re-entry where platform spillover auto-places under you forever!
        </div>
      </div>
    </div>
  </div>
  {make_footer(3)}
</div>
"""
pages_html.append(page_3)

# ==============================================================================
# PAGE 4: THE 4 AUTOMATED PROTOCOL POOLS
# ==============================================================================
page_4 = f"""
<div class="page">
  {make_header("Protocol Pools Architecture", "4-POOL ENGINE", 4)}
  <div class="content-body">
    <div>
      <div class="section-title">3. The 4 Automated Protocol Pools: Master Liquidity Engine</div>
      <div class="section-subtitle">Guaranteed P4, P5, P14 Funding &amp; Dynamic Unqualified Leakage Capture</div>
    </div>

    <p>
      The <strong>Equora Protocol Liquidity Engine</strong> is continuously funded by two distinct on-chain streams: (1) Guaranteed Base Allocations from nodes <strong>P4, P5</strong> ($60) and <strong>P14</strong> ($30) equaling <strong>$90.00 per Slot 1 cycle (21.43%)</strong>, and (2) Dynamic Leakage Capture, which automatically sweeps any unearned downline allocations from P7, P10, and P13 whenever downlines fail the 2-referral qualification check. This pool capital is divided with zero human intervention:
    </p>

    <!-- 4-POOLS SVG FLOW CHART -->
    <div style="background: #f8fafc; border: 1.2px solid #cbd5e1; border-radius: 8px; padding: 8px; text-align: center;">
      <div style="font-size: 7.8pt; font-weight: 800; color: #0f172a; margin-bottom: 5px; text-transform: uppercase;">
        Autonomous Protocol Pool Capital Allocation Breakdown
      </div>
      <svg width="100%" height="160" viewBox="0 0 680 160" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit;">
        <!-- SOURCE NODE -->
        <rect x="10" y="52" width="135" height="56" rx="6" fill="#0f172a" />
        <text x="77" y="73" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">PROTOCOL POOLS</text>
        <text x="77" y="85" fill="#38bdf8" font-size="7.5" font-weight="bold" text-anchor="middle">P4 + P5 + P14 DEPOSITS</text>
        <text x="77" y="97" fill="#94a3b8" font-size="6.8" text-anchor="middle">+ Unqualified Leakage</text>

        <!-- SPLIT PATHS -->
        <path d="M 145 62 L 195 26" stroke="#0284c7" stroke-width="2" fill="none" />
        <path d="M 145 72 L 195 64" stroke="#1d4ed8" stroke-width="2" fill="none" />
        <path d="M 145 87 L 195 101" stroke="#d97706" stroke-width="2" fill="none" />
        <path d="M 145 97 L 195 138" stroke="#059669" stroke-width="2" fill="none" />

        <!-- POOL 1 -->
        <rect x="195" y="10" width="475" height="33" rx="5" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="1.2" />
        <text x="205" y="24" fill="#0369a1" font-size="8" font-weight="bold">POOL 1: 35% DAO INSTANT PUSH &bull; Real-Time Streaming</text>
        <text x="205" y="36" fill="#0284c7" font-size="7.2">Distributed instantaneously upon collection directly to all verified active DAO members.</text>

        <!-- POOL 2 -->
        <rect x="195" y="48" width="475" height="33" rx="5" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
        <text x="205" y="62" fill="#1e40af" font-size="8" font-weight="bold">POOL 2: 40% LEADERSHIP ROYALTY &bull; Monthly Settlement (11th)</text>
        <text x="205" y="74" fill="#1d4ed8" font-size="7.2">Distributed 11th of every month across ranks in depth: Alpha 10% | Prime 15% | Elite 25% | Crown 50%.</text>

        <!-- POOL 3 -->
        <rect x="195" y="86" width="475" height="33" rx="5" fill="#fffbeb" stroke="#fcd34d" stroke-width="1.2" />
        <text x="205" y="100" fill="#92400e" font-size="8" font-weight="bold">POOL 3: 10% MAGIC BLIND BOX &bull; 3-Month Timer Gamification</text>
        <text x="205" y="112" fill="#b45309" font-size="7.2">Claimable after 3-month countdown: 85% get $0.50 | 10% get $0.80 | 3% get $1.20 | 2% get $5.00 Jackpot.</text>

        <!-- POOL 4 -->
        <rect x="195" y="124" width="475" height="33" rx="5" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
        <text x="205" y="138" fill="#166534" font-size="8" font-weight="bold">POOL 4: 15% ONE-TIME RANK REWARDS &bull; Milestone Bounties</text>
        <text x="205" y="150" fill="#15803d" font-size="7.2">One-time bounties upon milestone activation: Level 3 (10%) | Level 6 (15%) | Level 9 (25%) | Level 12 (50%).</text>
      </svg>
    </div>

    <!-- 4 POOLS DETAIL GRID -->
    <div class="card-grid grid-2">
      <div class="info-card highlight">
        <div class="info-card-title">
          <span style="color:#0284c7;">1.</span> 35% DAO Instant Push
        </div>
        <div class="info-card-desc">
          <strong>Immediate Liquidity Injection:</strong> Streamed in real-time block execution. Every active registered member in the Equora ecosystem receives programmatic micro-distributions proportional to their participation weight.
        </div>
      </div>

      <div class="info-card purple">
        <div class="info-card-title">
          <span style="color:#1d4ed8;">2.</span> 40% Leadership Royalty
        </div>
        <div class="info-card-desc">
          <strong>Institutional Monthly Equity:</strong> Settled on the <strong>11th of every month</strong>. Eliminates centralized management discretion by splitting 40% of all pool turnover across Alpha (10%), Prime (15%), Elite (25%), and Crown (50%) leaders.
        </div>
      </div>

      <div class="info-card warning">
        <div class="info-card-title">
          <span style="color:#d97706;">3.</span> 10% Magic Blind Box
        </div>
        <div class="info-card-desc">
          <strong>Verifiable Algorithmic Lottery:</strong> Governed by a 3-month countdown lockup. Delivers non-custodial randomized rewards: Tier 1 ($0.50), Tier 2 ($0.80), Tier 3 ($1.20), and Tier 4 Grand Jackpot ($5.00).
        </div>
      </div>

      <div class="info-card success">
        <div class="info-card-title">
          <span style="color:#059669;">4.</span> 15% Rank Milestones
        </div>
        <div class="info-card-desc">
          <strong>Progression Acceleration Bounties:</strong> Disbursed immediately upon reaching key milestones: Level 3 Alpha (10%), Level 6 Prime (15%), Level 9 Elite (25%), and Level 12 Crown (50%), incentivizing team escalation.
        </div>
      </div>
    </div>

    <table class="institutional-table">
      <thead>
        <tr>
          <th>Pool Designation</th>
          <th>Share (%)</th>
          <th>Slot 1 Volume</th>
          <th>Slot 6 (Prime)</th>
          <th>Slot 12 (Crown)</th>
          <th>Disbursement Method</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. DAO Instant Push</strong></td>
          <td>35.00%</td>
          <td>$31.50</td>
          <td>$1,008.00</td>
          <td>$64,512.00</td>
          <td>Instant Real-Time Block Stream</td>
        </tr>
        <tr>
          <td><strong>2. Leadership Royalty</strong></td>
          <td>40.00%</td>
          <td>$36.00</td>
          <td>$1,152.00</td>
          <td>$73,728.00</td>
          <td>11th Monthly Automated Snapshot</td>
        </tr>
        <tr>
          <td><strong>3. Magic Blind Box</strong></td>
          <td>10.00%</td>
          <td>$9.00</td>
          <td>$288.00</td>
          <td>$18,432.00</td>
          <td>3-Month Countdown Claim</td>
        </tr>
        <tr>
          <td><strong>4. Rank Milestones</strong></td>
          <td>15.00%</td>
          <td>$13.50</td>
          <td>$432.00</td>
          <td>$27,648.00</td>
          <td>Instant Milestone Unlock Bounty</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL POOL POOL</td>
          <td>100.00%</td>
          <td>$90.00</td>
          <td>$2,880.00</td>
          <td>$184,320.00</td>
          <td>100% Autonomously Executed</td>
        </tr>
      </tbody>
    </table>
  </div>
  {make_footer(4)}
</div>
"""
pages_html.append(page_4)

# ==============================================================================
# PAGE 5: FINANCIAL MASTER TABLE - ALL 12 SLOTS
# ==============================================================================
page_5 = f"""
<div class="page">
  {make_header("Financial Master Table", "ALL 12 SLOTS", 5)}
  <div class="content-body">
    <div>
      <div class="section-title">4. Institutional Financial Master Table: All 12 Slot Levels</div>
      <div class="section-subtitle">Single $30 Out-of-Pocket Entry, P4+P5 Auto-Unlocked Tiers &amp; Exact Cashflows</div>
    </div>

    <p>
      The following institutional ledger details the deterministic capital distribution across all 12 progressive slot tiers. <strong>Notice the fundamental economic breakthrough:</strong> A participant's lifetime out-of-pocket capital is strictly <strong>$30.00 USD on Slot 1</strong>. Slots 2 through 12 require <strong>$0.00 out-of-pocket</strong>, as each slot is automatically unlocked by the arrival of nodes <strong>P4 and P5</strong> in the preceding tier, while both deposits stream directly into the 4 Automated Protocol Pools:
    </p>

    <table class="institutional-table">
      <thead>
        <tr>
          <th>Slot Tier</th>
          <th>Tier Value</th>
          <th>Out-of-Pocket Cost</th>
          <th>Gross Volume (14 Nodes)</th>
          <th>YOU Cashflow (6 Nodes)</th>
          <th>Sponsor Bonus (P1+P2)</th>
          <th>Guaranteed Pools (P4,P5,P14)</th>
          <th>Downline Check (P7,P10,P13)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Slot 1</strong></td>
          <td>$30.00</td>
          <td><strong style="color:#0284c7;">$30.00 (One-Time)</strong></td>
          <td>$420.00</td>
          <td><strong style="color:#059669;">$180.00</strong></td>
          <td>$60.00</td>
          <td>$90.00</td>
          <td>$90.00</td>
        </tr>
        <tr>
          <td><strong>Slot 2</strong></td>
          <td>$60.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$840.00</td>
          <td><strong style="color:#059669;">$360.00</strong></td>
          <td>$120.00</td>
          <td>$180.00</td>
          <td>$180.00</td>
        </tr>
        <tr style="background:#eff6ff;">
          <td><strong>Slot 3 (Alpha)</strong></td>
          <td>$120.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$1,680.00</td>
          <td><strong style="color:#059669;">$720.00</strong></td>
          <td>$240.00</td>
          <td>$360.00</td>
          <td>$360.00</td>
        </tr>
        <tr>
          <td><strong>Slot 4</strong></td>
          <td>$240.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$3,360.00</td>
          <td><strong style="color:#059669;">$1,440.00</strong></td>
          <td>$480.00</td>
          <td>$720.00</td>
          <td>$720.00</td>
        </tr>
        <tr>
          <td><strong>Slot 5</strong></td>
          <td>$480.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$6,720.00</td>
          <td><strong style="color:#059669;">$2,880.00</strong></td>
          <td>$960.00</td>
          <td>$1,440.00</td>
          <td>$1,440.00</td>
        </tr>
        <tr style="background:#f0fdf4;">
          <td><strong>Slot 6 (Prime)</strong></td>
          <td>$960.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$13,440.00</td>
          <td><strong style="color:#059669;">$5,760.00</strong></td>
          <td>$1,920.00</td>
          <td>$2,880.00</td>
          <td>$2,880.00</td>
        </tr>
        <tr>
          <td><strong>Slot 7</strong></td>
          <td>$1,920.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$26,880.00</td>
          <td><strong style="color:#059669;">$11,520.00</strong></td>
          <td>$3,840.00</td>
          <td>$5,760.00</td>
          <td>$5,760.00</td>
        </tr>
        <tr>
          <td><strong>Slot 8</strong></td>
          <td>$3,840.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$53,760.00</td>
          <td><strong style="color:#059669;">$23,040.00</strong></td>
          <td>$7,680.00</td>
          <td>$11,520.00</td>
          <td>$11,520.00</td>
        </tr>
        <tr style="background:#fffbeb;">
          <td><strong>Slot 9 (Elite)</strong></td>
          <td>$7,680.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$107,520.00</td>
          <td><strong style="color:#059669;">$46,080.00</strong></td>
          <td>$15,360.00</td>
          <td>$23,040.00</td>
          <td>$23,040.00</td>
        </tr>
        <tr>
          <td><strong>Slot 10</strong></td>
          <td>$15,360.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$215,040.00</td>
          <td><strong style="color:#059669;">$92,160.00</strong></td>
          <td>$30,720.00</td>
          <td>$46,080.00</td>
          <td>$46,080.00</td>
        </tr>
        <tr>
          <td><strong>Slot 11</strong></td>
          <td>$30,720.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$430,080.00</td>
          <td><strong style="color:#059669;">$184,320.00</strong></td>
          <td>$61,440.00</td>
          <td>$92,160.00</td>
          <td>$92,160.00</td>
        </tr>
        <tr style="background:#faf5ff;">
          <td><strong>Slot 12 (Crown)</strong></td>
          <td>$61,440.00</td>
          <td><strong style="color:#10b981;">$0.00 (Auto-Unlocked)</strong></td>
          <td>$860,160.00</td>
          <td><strong style="color:#059669;">$368,640.00</strong></td>
          <td>$122,880.00</td>
          <td>$184,320.00</td>
          <td>$184,320.00</td>
        </tr>
        <tr class="total-row">
          <td>CUMULATIVE TOTALS</td>
          <td>$122,850.00</td>
          <td><strong style="color:#38bdf8;">$30.00 ONLY!</strong></td>
          <td>$1,719,900.00</td>
          <td><strong style="color:#86efac;">$737,100.00</strong></td>
          <td>$245,700.00</td>
          <td>$368,550.00</td>
          <td>$368,550.00</td>
        </tr>
      </tbody>
    </table>

    <div class="card-grid grid-3">
      <div class="info-card highlight">
        <div class="info-card-title">$737,100 Net Direct Return</div>
        <div class="info-card-desc">
          From an initial <strong>single deposit of just $30.00</strong>, a participant collects <strong>$737,100.00 USD</strong> in net cashflow across all 12 slots—an unmatched <strong>24,570x return</strong> on initial capital.
        </div>
      </div>

      <div class="info-card success">
        <div class="info-card-title">P4 + P5 Auto-Progression Engine</div>
        <div class="info-card-desc">
          Because nodes P4 and P5 automatically unlock the next higher tier in every slot, members experience zero friction or upgrade reluctance, permanently eliminating user capital exhaustion.
        </div>
      </div>

      <div class="info-card warning">
        <div class="info-card-title">$368,550 Guaranteed Pool Fuel</div>
        <div class="info-card-desc">
          Across a single sweep of all 12 slots, P4, P5, and P14 inject <strong>$368,550.00 USD</strong> directly into the 4 protocol pools, with additional funds added whenever unqualified downline nodes leak.
        </div>
      </div>
    </div>
  </div>
  {make_footer(5)}
</div>
"""
pages_html.append(page_5)

# ==============================================================================
# PAGE 6: LEADERSHIP ROYALTY ENGINE (40% POOL)
# ==============================================================================
page_6 = f"""
<div class="page">
  {make_header("Leadership Royalty Engine", "40% ROYALTY POOL", 6)}
  <div class="content-body">
    <div>
      <div class="section-title">5. Leadership Royalty Engine (40% Pool &bull; Monthly on the 11th)</div>
      <div class="section-subtitle">Decentralized Monthly Depth Royalty Replacing Centralized Corporate Salaries</div>
    </div>

    <p>
      In place of legacy centralized "salaries" that depend on corporate discretionary payrolls, Equora introduces the <strong>Leadership Royalty Engine</strong>. Fueled by a massive <strong>40% allocation</strong> of all protocol pool collections, the Royalty Engine dispatches automated recurring monthly rewards directly into qualified leader wallets on the <strong>11th of every month</strong>.
    </p>

    <!-- ROYALTY DISTRIBUTION DIAGRAM -->
    <div style="background: #ffffff; border: 1.2px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center;">
      <div style="font-size: 7.8pt; font-weight: 800; color: #0f172a; margin-bottom: 6px; text-transform: uppercase;">
        Monthly Leadership Royalty Depth Distribution Hierarchy (11th of Every Month)
      </div>
      <svg width="100%" height="150" viewBox="0 0 680 150" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit;">
        <rect x="20" y="16" width="640" height="26" rx="5" fill="#0f172a" />
        <text x="340" y="33" fill="#ffffff" font-size="8.5" font-weight="bold" text-anchor="middle">TOTAL MONTHLY ROYALTY POOL (100% = 40% OF PROTOCOL TURNOVER)</text>

        <!-- ALPHA: 10% -->
        <rect x="20" y="52" width="100" height="42" rx="4" fill="#0284c7" />
        <text x="70" y="70" fill="#ffffff" font-size="8.5" font-weight="bold" text-anchor="middle">ALPHA</text>
        <text x="70" y="84" fill="#e0f2fe" font-size="7.5" font-weight="bold" text-anchor="middle">10% SHARE</text>

        <!-- PRIME: 15% -->
        <rect x="130" y="52" width="120" height="42" rx="4" fill="#059669" />
        <text x="190" y="70" fill="#ffffff" font-size="8.5" font-weight="bold" text-anchor="middle">PRIME</text>
        <text x="190" y="84" fill="#d1fae5" font-size="7.5" font-weight="bold" text-anchor="middle">15% SHARE</text>

        <!-- ELITE: 25% -->
        <rect x="260" y="52" width="150" height="42" rx="4" fill="#d97706" />
        <text x="335" y="70" fill="#ffffff" font-size="8.5" font-weight="bold" text-anchor="middle">ELITE</text>
        <text x="335" y="84" fill="#fef3c7" font-size="7.5" font-weight="bold" text-anchor="middle">25% SHARE</text>

        <!-- CROWN: 50% -->
        <rect x="420" y="52" width="240" height="42" rx="4" fill="#7c3aed" />
        <text x="540" y="70" fill="#ffffff" font-size="8.5" font-weight="bold" text-anchor="middle">CROWN ACHIEVER (APEX)</text>
        <text x="540" y="84" fill="#ede9fe" font-size="7.5" font-weight="bold" text-anchor="middle">50% DOMINANT SHARE</text>

        <text x="70" y="112" fill="#0369a1" font-size="7" font-weight="bold" text-anchor="middle">Slot 3 Unlocked</text>
        <text x="190" y="112" fill="#047857" font-size="7" font-weight="bold" text-anchor="middle">Slot 6 Unlocked</text>
        <text x="335" y="112" fill="#b45309" font-size="7" font-weight="bold" text-anchor="middle">Slot 9 Unlocked</text>
        <text x="540" y="112" fill="#6d28d9" font-size="7" font-weight="bold" text-anchor="middle">Slot 12 Unlocked (Apex Master)</text>

        <rect x="20" y="122" width="640" height="18" rx="3" fill="#f1f5f9" />
        <text x="340" y="134" fill="#475569" font-size="7" font-weight="bold" text-anchor="middle">
          AUTOMATIC ON-CHAIN SNAPSHOT &amp; SETTLEMENT CADENCE: 11TH OF EVERY CALENDAR MONTH (00:00 UTC)
        </text>
      </svg>
    </div>

    <!-- 4 ROYALTY TIERS TABLE -->
    <table class="institutional-table">
      <thead>
        <tr>
          <th>Royalty Leadership Rank</th>
          <th>Pool Share</th>
          <th>Slot Qualification</th>
          <th>Monthly Distribution Rule</th>
          <th>Depth Benefit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Alpha Leader</strong></td>
          <td>10.00%</td>
          <td>Slot 3 (Auto-Unlocked by Slot 2 P4+P5)</td>
          <td>Even split across all active Slot 3 holders</td>
          <td>Entry-level monthly dividend stream</td>
        </tr>
        <tr>
          <td><strong>2. Prime Commander</strong></td>
          <td>15.00%</td>
          <td>Slot 6 (Auto-Unlocked by Slot 5 P4+P5)</td>
          <td>Even split across all active Slot 6 holders</td>
          <td>Mid-tier regional leadership equity</td>
        </tr>
        <tr>
          <td><strong>3. Elite Pioneer</strong></td>
          <td>25.00%</td>
          <td>Slot 9 (Auto-Unlocked by Slot 8 P4+P5)</td>
          <td>Even split across all active Slot 9 holders</td>
          <td>Substantial executive community revenue</td>
        </tr>
        <tr style="background: #faf5ff;">
          <td><strong style="color: #7c3aed;">4. Crown Achiever (Apex)</strong></td>
          <td>50.00%</td>
          <td>Slot 12 (Auto-Unlocked by Slot 11 P4+P5)</td>
          <td>Even split across all active Slot 12 masters</td>
          <td>Dominant protocol-wide lifetime wealth</td>
        </tr>
      </tbody>
    </table>

    <div class="card-grid grid-3">
      <div class="info-card highlight">
        <div class="info-card-title">11th Monthly Payout Cycle</div>
        <div class="info-card-desc">
          Every calendar month on the 11th at 00:00 UTC, the smart contract executes an immutable balance snapshot and streams rewards non-custodially to verified leaders.
        </div>
      </div>
      <div class="info-card success">
        <div class="info-card-title">Zero Upkeep Fees</div>
        <div class="info-card-desc">
          Unlike legacy platforms requiring perpetual monthly subscription payments, rank qualification is permanent once unlocked via the P4 and P5 auto-progression engine.
        </div>
      </div>
      <div class="info-card purple">
        <div class="info-card-title">Cumulative Royalty Stacking</div>
        <div class="info-card-desc">
          A Crown Achiever (Slot 12) collects from ALL 4 royalty pools simultaneously (10% + 15% + 25% + 50%), capturing maximum liquidity across the entire protocol volume.
        </div>
      </div>
    </div>
  </div>
  {make_footer(6)}
</div>
"""
pages_html.append(page_6)

# ==============================================================================
# PAGE 7: MAGIC BLIND BOX GAMIFICATION (10% POOL)
# ==============================================================================
page_7 = f"""
<div class="page">
  {make_header("Magic Blind Box Gamification", "10% GAMIFIED POOL", 7)}
  <div class="content-body">
    <div>
      <div class="section-title">6. Magic Blind Box Engine (10% Pool &bull; 3-Month Countdown)</div>
      <div class="section-subtitle">Provably Fair Gamified Reward Mechanism Powered by On-Chain Pseudo-Randomness</div>
    </div>

    <p>
      The <strong>Magic Blind Box Engine</strong> allocates <strong>10% of total protocol pool turnover</strong> into an automated reward reserve. Designed to stimulate viral user onboarding and maintain perpetual community engagement, every registered wallet receives a cryptographic Blind Box anchored to a <strong>3-month vesting countdown timer</strong>.
    </p>

    <!-- BLIND BOX TIERS DIAGRAM -->
    <div style="background: #ffffff; border: 1.2px solid #cbd5e1; border-radius: 8px; padding: 10px; text-align: center;">
      <div style="font-size: 7.8pt; font-weight: 800; color: #0f172a; margin-bottom: 6px; text-transform: uppercase;">
        Magic Blind Box Reward Tiers &amp; Provably Fair Distribution Probabilities
      </div>
      <svg width="100%" height="150" viewBox="0 0 680 150" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit;">
        <!-- TIER 1 -->
        <rect x="25" y="18" width="135" height="114" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
        <rect x="35" y="28" width="115" height="24" rx="4" fill="#64748b" />
        <text x="92" y="44" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">TIER 1 (COMMON)</text>
        <text x="92" y="74" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">$0.50 USD</text>
        <text x="92" y="90" fill="#64748b" font-size="7" text-anchor="middle">TROB Equivalent</text>
        <rect x="45" y="102" width="95" height="18" rx="9" fill="#e2e8f0" />
        <text x="92" y="114" fill="#334155" font-size="7.5" font-weight="bold" text-anchor="middle">85% CHANCE</text>

        <!-- TIER 2 -->
        <rect x="185" y="18" width="135" height="114" rx="6" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="1.2" />
        <rect x="195" y="28" width="115" height="24" rx="4" fill="#0284c7" />
        <text x="252" y="44" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">TIER 2 (RARE)</text>
        <text x="252" y="74" fill="#0369a1" font-size="14" font-weight="bold" text-anchor="middle">$0.80 USD</text>
        <text x="252" y="90" fill="#0284c7" font-size="7" text-anchor="middle">TROB Equivalent</text>
        <rect x="205" y="102" width="95" height="18" rx="9" fill="#bae6fd" />
        <text x="252" y="114" fill="#0369a1" font-size="7.5" font-weight="bold" text-anchor="middle">10% CHANCE</text>

        <!-- TIER 3 -->
        <rect x="345" y="18" width="135" height="114" rx="6" fill="#fffbeb" stroke="#fcd34d" stroke-width="1.2" />
        <rect x="355" y="28" width="115" height="24" rx="4" fill="#d97706" />
        <text x="412" y="44" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">TIER 3 (EPIC)</text>
        <text x="412" y="74" fill="#b45309" font-size="14" font-weight="bold" text-anchor="middle">$1.20 USD</text>
        <text x="412" y="90" fill="#d97706" font-size="7" text-anchor="middle">TROB Equivalent</text>
        <rect x="365" y="102" width="95" height="18" rx="9" fill="#fde68a" />
        <text x="412" y="114" fill="#92400e" font-size="7.5" font-weight="bold" text-anchor="middle">3% CHANCE</text>

        <!-- TIER 4 -->
        <rect x="505" y="18" width="150" height="114" rx="6" fill="#faf5ff" stroke="#d8b4fe" stroke-width="1.2" />
        <rect x="515" y="28" width="130" height="24" rx="4" fill="#7c3aed" />
        <text x="580" y="44" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle">TIER 4 (JACKPOT)</text>
        <text x="580" y="74" fill="#6d28d9" font-size="14" font-weight="bold" text-anchor="middle">$5.00 USD</text>
        <text x="580" y="90" fill="#7c3aed" font-size="7" text-anchor="middle">TROB Grand Bounty</text>
        <rect x="525" y="102" width="110" height="18" rx="9" fill="#e9d5ff" />
        <text x="580" y="114" fill="#581c87" font-size="7.5" font-weight="bold" text-anchor="middle">2% JACKPOT</text>
      </svg>
    </div>

    <!-- 3 MECHANISM EXPLANATION CARDS -->
    <div class="card-grid grid-3">
      <div class="info-card highlight">
        <div class="info-card-title">1. The 3-Month Vesting Lock</div>
        <div class="info-card-desc">
          Upon registration, a 90-day countdown timer begins on-chain. When the timer reaches 0, the participant can invoke the <code>claimBlindBox()</code> method to reveal and withdraw their reward immediately.
        </div>
      </div>
      <div class="info-card success">
        <div class="info-card-title">2. Mathematical Solvency</div>
        <div class="info-card-desc">
          Weighted average reward: <em>(0.85 &times; $0.50) + (0.10 &times; $0.80) + (0.03 &times; $1.20) + (0.02 &times; $5.00) = $0.641 USD</em>. 100% covered by the 10% pool reserve without risk of deficit.
        </div>
      </div>
      <div class="info-card purple">
        <div class="info-card-title">3. Viral Social Mechanics</div>
        <div class="info-card-desc">
          The Blind Box acts as an onboarding hook for retail communities, offering an immediate tangible asset that vests transparently on TrobChain, sparking widespread word-of-mouth growth.
        </div>
      </div>
    </div>

    <div class="info-card warning">
      <div class="info-card-title">Verifiable On-Chain Randomness Verification</div>
      <div class="info-card-desc">
        Blind box distribution outcomes are determined using cryptographic entropy derived from block hashes, block timestamps, and user addresses, ensuring that rewards cannot be predicted, manipulated, or front-run by miners or protocol developers.
      </div>
    </div>
  </div>
  {make_footer(7)}
</div>
"""
pages_html.append(page_7)

# ==============================================================================
# PAGE 8: ONE-TIME RANK MILESTONE REWARDS (15% POOL)
# ==============================================================================
page_8 = f"""
<div class="page">
  {make_header("Rank Milestone Rewards", "15% MILESTONE POOL", 8)}
  <div class="content-body">
    <div>
      <div class="section-title">7. One-Time Rank Milestone Rewards (15% Pool Reserve)</div>
      <div class="section-subtitle">Instant Milestone Bounties Rewarding Matrix Depth &amp; Leadership Advancement</div>
    </div>

    <p>
      The <strong>Rank Milestone Reward Engine</strong> allocates <strong>15% of total protocol pool turnover</strong> into an exclusive progression vault. As leaders ascend through the matrix tiers—unlocked automatically by the P4 and P5 progression engine—they unlock substantial one-time bounties paid directly in TROB:
    </p>

    <!-- 4 RANK CARDS -->
    <div class="card-grid grid-4">
      <div class="info-card highlight">
        <div style="background: #0284c7; color: #ffffff; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 7.5pt; text-align: center; margin-bottom: 5px;">
          ALPHA &bull; LEVEL 3
        </div>
        <div style="font-size: 13pt; font-weight: 900; color: #0284c7; text-align: center; margin: 4px 0;">
          10% POOL
        </div>
        <div class="info-card-desc">
          <strong>Auto-Unlocked:</strong> Slot 3 ($120).<br>
          <strong>Prerequisite:</strong> P4+P5 on Slot 2.<br>
          <strong>Disbursement:</strong> Instant milestone bounty transferred to wallet.
        </div>
      </div>

      <div class="info-card success">
        <div style="background: #059669; color: #ffffff; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 7.5pt; text-align: center; margin-bottom: 5px;">
          PRIME &bull; LEVEL 6
        </div>
        <div style="font-size: 13pt; font-weight: 900; color: #059669; text-align: center; margin: 4px 0;">
          15% POOL
        </div>
        <div class="info-card-desc">
          <strong>Auto-Unlocked:</strong> Slot 6 ($960).<br>
          <strong>Prerequisite:</strong> P4+P5 on Slot 5.<br>
          <strong>Disbursement:</strong> Substantial regional bounty for team leadership.
        </div>
      </div>

      <div class="info-card warning">
        <div style="background: #d97706; color: #ffffff; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 7.5pt; text-align: center; margin-bottom: 5px;">
          ELITE &bull; LEVEL 9
        </div>
        <div style="font-size: 13pt; font-weight: 900; color: #d97706; text-align: center; margin: 4px 0;">
          25% POOL
        </div>
        <div class="info-card-desc">
          <strong>Auto-Unlocked:</strong> Slot 9 ($7,680).<br>
          <strong>Prerequisite:</strong> P4+P5 on Slot 8.<br>
          <strong>Disbursement:</strong> Executive progression reward celebrating major volume.
        </div>
      </div>

      <div class="info-card purple">
        <div style="background: #7c3aed; color: #ffffff; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 7.5pt; text-align: center; margin-bottom: 5px;">
          CROWN &bull; LEVEL 12
        </div>
        <div style="font-size: 13pt; font-weight: 900; color: #7c3aed; text-align: center; margin: 4px 0;">
          50% POOL
        </div>
        <div class="info-card-desc">
          <strong>Auto-Unlocked:</strong> Slot 12 ($61,440).<br>
          <strong>Prerequisite:</strong> P4+P5 on Slot 11.<br>
          <strong>Disbursement:</strong> Apex master bounty capturing 50% of the entire rank vault!
        </div>
      </div>
    </div>

    <!-- 2 STRATEGIC INSIGHT CARDS -->
    <div class="card-grid grid-2">
      <div class="info-card">
        <div class="info-card-title">DAO Governance Multiplier Integration</div>
        <div class="info-card-desc">
          Reaching these milestone levels permanently registers the user's wallet address in the smart contract's immutable leader registry, unlocking verified governance voting multipliers in the Equora DAO.
        </div>
      </div>
      <div class="info-card success">
        <div class="info-card-title">Accelerated Capital Velocity</div>
        <div class="info-card-desc">
          Because milestone rewards are disbursed instantaneously upon slot upgrade, ambitious leaders immediately recoup significant activation capital, creating massive momentum to reinvest and activate higher tiers.
        </div>
      </div>
    </div>

    <!-- LIFETIME SUMMARY CARD -->
    <div class="info-card purple">
      <div class="info-card-title">Apex Crown Progression Synthesis</div>
      <div class="info-card-desc">
        A leader who progresses through all 12 slots collects all 4 milestone bounties cumulatively (10% + 15% + 25% + 50% = 100% eligibility), on top of their 600% direct board cashflows and their monthly leadership Royalty equity!
      </div>
    </div>
  </div>
  {make_footer(8)}
</div>
"""
pages_html.append(page_8)

# ==============================================================================
# PAGE 9: PERPETUAL RECYCLE ENGINE & SPILLOVER DYNAMICS
# ==============================================================================
page_9 = f"""
<div class="page">
  {make_header("Recycle & Spillover Mechanics", "RECURSIVE ENGINE", 9)}
  <div class="content-body">
    <div>
      <div class="section-title">8. Perpetual Recycle Engine &amp; Algorithmic Spillover Dynamics</div>
      <div class="section-subtitle">Node 14 Automated Reset, Downline Capital Injections &amp; Infinite Recycling</div>
    </div>

    <p>
      Equora eliminates board stagnation through its <strong>Autonomous Node 14 Recycle Engine</strong> and <strong>Algorithmic Spillover Protocol</strong>. The protocol operates in perpetuity without requiring members to manually fund re-entries out-of-pocket:
    </p>

    <!-- RECYCLE & SPILLOVER SVG DIAGRAM -->
    <div style="background: #ffffff; border: 1.2px solid #cbd5e1; border-radius: 8px; padding: 8px; text-align: center;">
      <div style="font-size: 7.8pt; font-weight: 800; color: #0f172a; margin-bottom: 5px; text-transform: uppercase;">
        Perpetual Board Recycling &amp; Spillover Auto-Placement Architecture
      </div>
      <svg width="100%" height="155" viewBox="0 0 680 155" xmlns="http://www.w3.org/2000/svg" style="font-family: inherit;">
        <!-- RECYCLE LOOP (LEFT) -->
        <rect x="25" y="18" width="280" height="118" rx="6" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.2" />
        <text x="165" y="38" fill="#991b1b" font-size="8.5" font-weight="bold" text-anchor="middle">NODE 14 RECYCLE ENGINE</text>
        <path d="M 65 78 A 32 32 0 1 1 125 106" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="4,3" />
        <text x="95" y="83" fill="#dc2626" font-size="12" font-weight="bold" text-anchor="middle">&#8635;</text>
        <text x="210" y="65" fill="#7f1d1d" font-size="7.5" font-weight="bold">1. 14th Node Fills</text>
        <text x="210" y="80" fill="#991b1b" font-size="7.2">Funds deposit directly to 4 Pools</text>
        <text x="210" y="95" fill="#7f1d1d" font-size="7.5" font-weight="bold">2. Board Auto-Resets</text>
        <text x="210" y="110" fill="#991b1b" font-size="7.2">Fresh 600% ROI loop begins under sponsor</text>

        <!-- SPILLOVER ENGINE (RIGHT) -->
        <rect x="345" y="18" width="310" height="118" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
        <text x="500" y="38" fill="#065f46" font-size="8.5" font-weight="bold" text-anchor="middle">PLATFORM SPILLOVER AUTO-PLACEMENT</text>
        <circle cx="390" cy="72" r="14" fill="#1d4ed8" />
        <text x="390" y="76" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">YOU</text>
        <line x1="405" y1="72" x2="445" y2="72" stroke="#10b981" stroke-width="2.5" />
        <circle cx="465" cy="72" r="14" fill="#10b981" />
        <text x="465" y="76" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">SPILL</text>
        <line x1="480" y1="72" x2="520" y2="72" stroke="#8b5cf6" stroke-width="2.5" />
        <circle cx="540" cy="72" r="14" fill="#8b5cf6" />
        <text x="540" y="76" fill="#ffffff" font-size="7.5" font-weight="bold" text-anchor="middle">TREE</text>
        <text x="500" y="106" fill="#047857" font-size="7.2" text-anchor="middle">
          Qualified members with 2 referrals auto-capture incoming platform registrations!
        </text>
      </svg>
    </div>

    <!-- 3 DETAILED CARDS -->
    <div class="card-grid grid-3">
      <div class="info-card">
        <div class="info-card-title">1. Infinite Board Recycling</div>
        <div class="info-card-desc">
          When Node 14 fills, its deposit funds the 4 protocol pools and resets all 14 node positions on your board. You re-enter under your original sponsor, perpetually collecting the 6-node direct cashflow without spending a single dollar out-of-pocket.
        </div>
      </div>

      <div class="info-card highlight">
        <div class="info-card-title">2. Meritocratic 2-Referral Gate</div>
        <div class="info-card-desc">
          Because you have completed 2 direct referrals and unlocked Slot 2 (via P4+P5), your position is permanently qualified. Whenever any new user registers on the platform, smart contract spillover auto-places them into your open tree!
        </div>
      </div>

      <div class="info-card warning">
        <div class="info-card-title">3. Dynamic Compression &amp; Solvency</div>
        <div class="info-card-desc">
          If an immediate upline fails to unlock higher slots, commissions compress upward to the nearest qualified leader. Unqualified downline funds from P7, P10, and P13 seamlessly route into the 4 Protocol Pools Vault.
        </div>
      </div>
    </div>

    <div class="info-card success">
      <div class="info-card-title">The Zero-Stagnation Perpetual Motion Machine</div>
      <div class="info-card-desc">
        Because re-entry is programmatically executed on Node 14 without manual intervention, a participant can never "forget" to re-topup. The system functions as an autonomous wealth flywheel: every cycle completed fuels the sponsor, downlines, protocol pools, and board owner simultaneously.
      </div>
    </div>
  </div>
  {make_footer(9)}
</div>
"""
pages_html.append(page_9)

# ==============================================================================
# PAGE 10: INFRASTRUCTURE, SECURITY & RATIFICATION
# ==============================================================================
page_10 = f"""
<div class="page">
  {make_header("Infrastructure & Ratification", "VERIFIED SPECIFICATION", 10)}
  <div class="content-body">
    <div>
      <div class="section-title">9. TrobChain On-Chain Infrastructure, Security &amp; Ratification</div>
      <div class="section-subtitle">Sub-Second Finality, Non-Custodial Architecture &amp; Formal Protocol Certification</div>
    </div>

    <p>
      The Equora Matrix Protocol is engineered exclusively for deployment on the <strong>TrobChain Mainnet</strong>, an institutional-grade Layer-1 blockchain delivering Ethereum-virtual-machine compatibility with sub-second finality and near-zero transaction fees:
    </p>

    <!-- TECHNICAL SPECS GRID -->
    <div class="card-grid grid-4">
      <div class="info-card">
        <div class="info-card-title">Network</div>
        <div class="info-card-desc"><strong>TrobChain Mainnet</strong> (EVM Layer 1)</div>
      </div>
      <div class="info-card highlight">
        <div class="info-card-title">Block Time</div>
        <div class="info-card-desc"><strong>Sub-Second</strong> (~1.2s Finality)</div>
      </div>
      <div class="info-card success">
        <div class="info-card-title">Average Gas</div>
        <div class="info-card-desc"><strong>&lt; $0.0001 USD</strong> per transaction</div>
      </div>
      <div class="info-card warning">
        <div class="info-card-title">Contract Peg</div>
        <div class="info-card-desc"><strong>$0.056 USD</strong> / 1 TROB Coin</div>
      </div>
    </div>

    <!-- SECURITY ARCHITECTURE -->
    <div class="info-card">
      <div class="info-card-title" style="color: #0f172a;">
        Smart Contract Security Architecture &amp; Invariants
      </div>
      <div class="info-card-desc">
        <ul style="margin: 2px 0 2px 14px; padding: 0;">
          <li><strong>Single Capital Deposit Invariant:</strong> Contract strictly guarantees that participants deposit only once ($30 in Slot 1). All 11 higher slots are unlocked via on-chain contract events triggered by nodes P4 and P5.</li>
          <li><strong>Zero Custody Invariant:</strong> The Equora smart contract maintains zero internal liquidity holding balances. 100% of incoming funds are dispersed atomically within the exact same EVM transaction block.</li>
          <li><strong>2-Referral Gate Verification:</strong> Meritocratic anti-Sybil checks verify direct referral counts before disbursing matrix and downline distributions, routing all unearned leakage to the 4 Protocol Pools Vault.</li>
          <li><strong>Re-Entrancy Protection:</strong> Hardened with OpenZeppelin-standard re-entrancy locks on all external execution endpoints, preventing recursive drain vulnerabilities.</li>
          <li><strong>Immutable Referral Registry:</strong> Referral links, parent-child tree linkages, and 5-digit cryptographic codes are permanently anchored to the blockchain state and cannot be modified by administrators.</li>
        </ul>
      </div>
    </div>

    <!-- RATIFICATION BADGE & SEAL -->
    <div style="background: #0f172a; color: #ffffff; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 9.5pt; font-weight: 800; color: #38bdf8; margin-bottom: 2px;">
          FORMAL RATIFICATION &amp; GOVERNANCE SEAL
        </div>
        <div style="font-size: 7pt; color: #cbd5e1; max-width: 440px; line-height: 1.35;">
          This document certifies the mathematical, architectural, and financial specifications of the Equora Matrix Protocol Version 6.2 as fully ratified by the Genesis DAO Council.
        </div>
      </div>
      <div style="text-align: right; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 14px;">
        <div style="font-size: 7.5pt; font-weight: 800; color: #ffffff;">STATUS: MAINNET ACTIVE</div>
        <div style="font-size: 6.8pt; color: #38bdf8;">OCTOBER 2026 EDITION</div>
        <div style="font-size: 6.5pt; color: #94a3b8;">EQUORA FOUNDATION</div>
      </div>
    </div>

    <!-- OFFICIAL REFERENCES TABLE -->
    <table class="institutional-table">
      <thead>
        <tr>
          <th>Protocol Resource</th>
          <th>Official Location / URI</th>
          <th>Operational Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Equora DAO Web dApp</strong></td>
          <td><code>https://equorafi.com</code> &bull; <code>https://equorafidao.com</code></td>
          <td>Active Mainnet Deployment</td>
        </tr>
        <tr>
          <td><strong>TrobChain Block Explorer</strong></td>
          <td><code>https://scan.trobchain.com</code></td>
          <td>Live EVM Verification</td>
        </tr>
        <tr>
          <td><strong>Smart Contract Core</strong></td>
          <td>EquoraMatrixEngine &bull; EVM Solidity 0.8.20+</td>
          <td>100% Non-Custodial &bull; Verified</td>
        </tr>
      </tbody>
    </table>
  </div>
  {make_footer(10)}
</div>
"""
pages_html.append(page_10)

# ==============================================================================
# COMBINE FULL HTML
# ==============================================================================
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Equora Matrix Master Specification V6.2</title>
  <style>
{CSS}
  </style>
</head>
<body>
{"".join(pages_html)}
</body>
</html>
"""

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"[OK] Master Whitepaper HTML written at: {HTML_FILE}")

# ==============================================================================
# COMPILE PDF VIA HEADLESS CHROME
# ==============================================================================
browser_candidates = [
    r"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    r"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    r"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    r"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
]
browser_bin = None
for candidate in browser_candidates:
    if os.path.exists(candidate):
        browser_bin = candidate
        break

if not browser_bin:
    print("[ERROR] Neither Chrome nor Edge executable was found.")
    sys.exit(1)

html_uri = "file:///" + HTML_FILE.replace("\\\\", "/")
cmd = f'"{browser_bin}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="{PDF_FILE_1}" "{html_uri}"'

print("Launching Chromium to render vector-sharp 10-Page A4 PDF...")
ret = subprocess.run(cmd, shell=True)

if ret.returncode == 0:
    print(f"[OK] Master Whitepaper PDF generated at: {PDF_FILE_1}")
    shutil.copyfile(PDF_FILE_1, PDF_FILE_2)
    shutil.copyfile(PDF_FILE_1, PDF_FILE_3)
    shutil.copyfile(PDF_FILE_1, PDF_FILE_ARTIFACT)
    shutil.copyfile(PDF_FILE_1, PDF_FILE_CURRENT_ARTIFACT)
    print(f"[OK] Copied to: {PDF_FILE_2}")
    print(f"[OK] Copied to: {PDF_FILE_3}")
    print(f"[OK] Copied to IDE Artifacts: {PDF_FILE_ARTIFACT}")
    print(f"[OK] Copied to Current Artifacts: {PDF_FILE_CURRENT_ARTIFACT}")
    print("[SUCCESS] Concise 10-Page Master Whitepaper PDF generated perfectly!")
else:
    print(f"[ERROR] Chromium rendering failed with exit code {ret.returncode}")
    sys.exit(ret.returncode)
'''

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("[OK] Updated scripts/build_concise_matrix_whitepaper.py successfully.")
