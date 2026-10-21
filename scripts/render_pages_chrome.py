import os
import sys
import shutil
import subprocess

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from build_concise_matrix_whitepaper import pages_html, CSS

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
artifacts_dir = r"C:\Users\Dell\.gemini\antigravity-ide\brain\de42cc02-dc83-412e-8004-6154a8c7e998"
current_conv_artifacts = r"C:\Users\Dell\.gemini\antigravity-ide\brain\f2e1f674-435c-4838-a4e4-f2700a14f06b"
os.makedirs(current_conv_artifacts, exist_ok=True)

pdf_file = os.path.abspath("docs/Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
if os.path.exists(pdf_file):
    shutil.copyfile(pdf_file, os.path.join(current_conv_artifacts, "Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf"))
    print("[OK] PDF copied to current conversation artifact directory.")

pages_to_render = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

for p_num in pages_to_render:
    idx = p_num - 1
    page_content = pages_html[idx]
    single_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    {CSS}
    body {{ background: transparent; padding: 0; margin: 0; }}
    .page {{ margin: 0; }}
  </style>
</head>
<body>
  {page_content}
</body>
</html>
"""
    tmp_html = os.path.abspath(f"docs/temp_page_{p_num}.html")
    with open(tmp_html, "w", encoding="utf-8") as f:
        f.write(single_html)

    out_png = os.path.abspath(f"docs/page_{p_num}_preview.png")
    out_artifact = os.path.join(artifacts_dir, f"page_{p_num}_preview.png")
    out_curr = os.path.join(current_conv_artifacts, f"page_{p_num}_preview.png")
    
    cmd = f'"{chrome}" --headless=new --screenshot="{out_png}" --window-size=1240,1754 "file:///{tmp_html.replace(chr(92), "/")}"'
    subprocess.run(cmd, shell=True)
    
    if os.path.exists(out_png):
        with open(out_png, "rb") as sf:
            data = sf.read()
        try:
            with open(out_artifact, "wb") as df:
                df.write(data)
        except Exception:
            pass
        with open(out_curr, "wb") as cf:
            cf.write(data)
        print(f"[OK] Rendered Page {p_num} preview -> {out_png} ({os.path.getsize(out_png)} bytes)")

print("[SUCCESS] All key page previews rendered!")
