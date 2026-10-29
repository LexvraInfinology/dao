import os
import base64

def to_b64(path):
    mime = 'image/png' if path.endswith('.png') else 'image/svg+xml'
    with open(path, 'rb') as f:
        return f'data:{mime};base64,' + base64.b64encode(f.read()).decode('utf-8')

p_eq = r'equorafidocs/docs/assets/equorafilogo-removebg-preview.png'
p_trob = r'apps/web-dao/public/trobium.svg'
p_sym = r'apps/web-dao/public/equora-symbol.svg'
p_brand = r'equorafidocs/presentation_assets/brand_lockup_transparent.png'

eq_b64 = to_b64(p_eq)
trob_b64 = to_b64(p_trob)
sym_b64 = to_b64(p_sym)
brand_b64 = to_b64(p_brand)

html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Logo Test</title>
</head>
<body style="background:#0b1329; color:white; font-family:sans-serif; padding:40px; text-align:center;">
  <h2>Option 1: Equora Logo (transparent PNG)</h2>
  <img src="{eq_b64}" style="height:80px; filter:drop-shadow(0 0 15px rgba(56,189,248,0.5));" />
  
  <hr style="border-color:#1e293b; margin:30px 0;" />
  
  <h2>Option 2: Equora Symbol SVG + Trobium SVG</h2>
  <div style="display:flex; justify-content:center; align-items:center; gap:16px;">
    <img src="{sym_b64}" style="height:65px; filter:drop-shadow(0 0 12px rgba(56,189,248,0.6));" />
    <span style="font-size:24px; color:#38bdf8; font-weight:bold;">&times;</span>
    <img src="{trob_b64}" style="height:65px; filter:drop-shadow(0 0 12px rgba(37,99,235,0.6));" />
  </div>
  
  <hr style="border-color:#1e293b; margin:30px 0;" />
  
  <h2>Option 3: Brand Lockup with clean height</h2>
  <img src="{brand_b64}" style="height:55px; filter:drop-shadow(0 0 12px rgba(56,189,248,0.4));" />
</body>
</html>"""

with open('docs/test_logos.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Saved docs/test_logos.html")
