import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body as { address?: string };

    if (!address || typeof address !== "string") {
      return NextResponse.json({ success: false, error: "Wallet address is required." }, { status: 400 });
    }

    const host = req.headers.get("host") || "localhost:3001";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const res = await fetch(`${proto}://${host}/api/eligibility/${encodeURIComponent(address)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }

    return NextResponse.json({
      success: true,
      message: "Resource stake query executed.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Stake resources query failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
