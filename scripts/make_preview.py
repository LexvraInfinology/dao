import subprocess
import os

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
html = "file:///" + os.path.abspath("docs/Equora_Matrix_Master_Whitepaper_30_USD_Plan.html").replace("\\", "/")
out_png = os.path.abspath("docs/preview_cover.png")
cmd = f'"{chrome}" --headless=new --screenshot="{out_png}" --window-size=1240,1754 "{html}"'
subprocess.run(cmd, shell=True)
print("Preview Cover created:", os.path.exists(out_png), "size:", os.path.getsize(out_png) if os.path.exists(out_png) else 0)
