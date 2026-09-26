import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// GET /api/trobsafe/apk
//
// Streams or downloads the TrobSafe Android application package (.apk).
// Checks multiple locations for `trobsafe.apk`, or falls back to
// the official download redirect if configured or not present locally.
// ---------------------------------------------------------------------------

export async function GET() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'public', 'downloads', 'trobsafe.apk'),
    path.resolve(process.cwd(), '..', '..', 'dist', 'trobsafe.apk'),
    path.resolve(process.cwd(), 'dist', 'trobsafe.apk'),
    path.resolve(process.cwd(), '..', '..', 'trobsafe.apk'),
  ];

  for (const apkPath of possiblePaths) {
    if (fs.existsSync(apkPath)) {
      const buffer = fs.readFileSync(apkPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="trobsafe.apk"',
          'Content-Length': String(buffer.byteLength),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  // Scan public/downloads for any .apk file as fallback
  const downloadsDir = path.resolve(process.cwd(), 'public', 'downloads');
  if (fs.existsSync(downloadsDir)) {
    const files = fs.readdirSync(downloadsDir);
    const anyApk = files.find((f) => f.toLowerCase().endsWith('.apk'));
    if (anyApk) {
      const fullPath = path.join(downloadsDir, anyApk);
      const buffer = fs.readFileSync(fullPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': `attachment; filename="${anyApk}"`,
          'Content-Length': String(buffer.byteLength),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  // Fallback to external URL if configured in env
  const fallbackUrl = process.env.TROBSAFE_APK_URL || process.env.NEXT_PUBLIC_TROBSAFE_APK_URL;
  if (fallbackUrl) {
    return NextResponse.redirect(fallbackUrl, { status: 302 });
  }

  return NextResponse.json(
    {
      error: 'TrobSafe APK package not found.',
      instruction:
        'Please place trobsafe.apk into apps/web-dao/public/downloads/ or dist/ directory on the server.',
    },
    { status: 404 }
  );
}
