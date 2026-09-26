import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// GET /api/trobsafe/apk
//
// Serves the TrobSafe Android APK (84MB+) via high-performance static streaming
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const localApk = path.resolve(process.cwd(), 'public', 'downloads', 'trobsafe.apk');
  
  if (fs.existsSync(localApk)) {
    return NextResponse.redirect(new URL('/downloads/trobsafe.apk', req.url));
  }

  const fallbackUrl = process.env.TROBSAFE_APK_URL || process.env.NEXT_PUBLIC_TROBSAFE_APK_URL;
  if (fallbackUrl) {
    return NextResponse.redirect(fallbackUrl, { status: 302 });
  }

  return NextResponse.json(
    {
      error: 'TrobSafe APK package not found.',
      instruction: 'Please place trobsafe.apk into apps/web-dao/public/downloads/.',
    },
    { status: 404 }
  );
}

