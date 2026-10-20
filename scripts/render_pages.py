import os
import subprocess
import pypdf

# Check if pdf2image or fitz (PyMuPDF) is available
try:
    import fitz # PyMuPDF
    doc = fitz.open("docs/Equora_Matrix_Master_Whitepaper_30_USD_Plan.pdf")
    print(f"PyMuPDF found. Total pages: {len(doc)}")
    for i in range(min(5, len(doc))):
        page = doc[i]
        pix = page.get_pixmap(dpi=150)
        out_name = f"docs/page_{i+1}_preview.png"
        pix.save(out_name)
        print(f"Rendered {out_name}: {os.path.getsize(out_name)} bytes")
except Exception as e:
    print(f"PyMuPDF not available or error: {e}")
