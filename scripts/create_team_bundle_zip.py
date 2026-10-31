import os
import zipfile
import sys

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def create_bundle():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    output_zip = os.path.join(root_dir, "equorafi-team-bundle.zip")
    
    # Remove existing zip if present
    if os.path.exists(output_zip):
        try:
            os.remove(output_zip)
        except Exception as e:
            print(f"Warning: could not remove existing zip: {e}")

    # Folders to exclude (caches, heavy designer assets, compiler artifacts)
    EXCLUDE_DIRS = {
        "node_modules",
        ".next",
        ".turbo",
        ".git",
        "dist",
        "cache",
        "artifacts",
        "coverage",
        ".vscode",
        ".idea",
        "scratch",
        "figma_reference",
        "equorafidocs",
        ".tempmediaStorage",
        "build-info",
    }

    # Extensions / files to exclude (heavy videos, duplicate APK binaries, zip archives)
    EXCLUDE_EXTENSIONS = {
        ".zip",
        ".tar.gz",
        ".7z",
        ".apk",
        ".mp4",
        ".mov",
        ".webm",
    }

    env_files_found = []
    total_files = 0
    total_bytes = 0

    print(f"📦 Starting lightweight packaging from: {root_dir}")
    print(f"🎯 Output zip file: {output_zip}\n")

    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, dirs, files in os.walk(root_dir):
            # Modify dirs in-place to prevent os.walk from recursing into excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".next")]

            for file in files:
                if any(file.lower().endswith(ext) for ext in EXCLUDE_EXTENSIONS):
                    continue
                if "query_engine" in file:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)

                # Track .env files
                if ".env" in file:
                    env_files_found.append(rel_path)

                try:
                    file_size = os.path.getsize(full_path)
                    total_bytes += file_size
                    total_files += 1
                    zf.write(full_path, rel_path)
                except Exception as e:
                    print(f"⚠️ Skipping {rel_path}: {e}")

    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    total_mb = total_bytes / (1024 * 1024)

    print("============================================================")
    print("✅ BUNDLE CREATED SUCCESSFULLY!")
    print(f"📁 Destination: {output_zip}")
    print(f"📊 Total Files Included: {total_files}")
    print(f"💾 Uncompressed Size: {total_mb:.2f} MB")
    print(f"🗜️ Compressed Zip Size: {zip_size_mb:.2f} MB")
    print("============================================================\n")

    print("🔐 Verified Environment Files Packaged:")
    for env_file in env_files_found:
        print(f"  ✓ {env_file}")

    print("\n📋 Ready to share with your friend directly!")

if __name__ == "__main__":
    create_bundle()
