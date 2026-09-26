import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// GET /api/trobsafe/download
//
// Streams the pre-packaged TrobSafe browser extension build as a ZIP file.
// ---------------------------------------------------------------------------

export async function GET() {
  const possiblePaths = [
    path.resolve(process.cwd(), '..', '..', 'dist', 'trobsafe-wallet.zip'),
    path.resolve(process.cwd(), 'public', 'trobsafe', 'trobsafe-wallet.zip'),
    path.resolve(process.cwd(), 'dist', 'trobsafe-wallet.zip'),
  ];

  for (const zipPath of possiblePaths) {
    if (fs.existsSync(zipPath)) {
      const buffer = fs.readFileSync(zipPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="trobsafe-wallet.zip"',
          'Content-Length': String(buffer.byteLength),
        },
      });
    }
  }

  return NextResponse.json(
    { error: 'TrobSafe extension package not found on this server.' },
    { status: 404 }
  );
}

