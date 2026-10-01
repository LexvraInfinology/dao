import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const fileName = params.name.endsWith('.sol') ? params.name : `${params.name}.sol`;
  const filePath = path.resolve(
    process.cwd(),
    '..',
    '..',
    'packages',
    'hardhat',
    'contracts-flattened',
    fileName
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: `Contract file ${fileName} not found` }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
