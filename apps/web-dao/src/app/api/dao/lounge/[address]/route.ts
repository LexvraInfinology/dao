import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/lounge/${address}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  const bttPriceUsd = 0.0572;
  const earningsCapUsd = 1500;
  const earningsCapBtt = Math.round((earningsCapUsd / bttPriceUsd) * 100) / 100;

  // 2. Direct Serverless Neon Lookup (Vercel native)
  try {
    const { rows } = await queryNeon<any>(
      `SELECT * FROM "DaoMember" WHERE LOWER(address) = LOWER($1) LIMIT 1`,
      [address.trim()]
    );
    if (rows.length > 0) {
      const m = rows[0];
      const pushedBtt = parseFloat(m.pushedAmountBtt || '0');
      const entryBtt = parseFloat(m.entryAmountBtt || '5244.75');
      const capBtt = entryBtt * 5;
      const pushedUsd = Math.round(pushedBtt * bttPriceUsd * 100) / 100;
      const isCapped = pushedBtt >= capBtt;
      let retopupDeadline = m.retopupDeadline ? new Date(m.retopupDeadline).toISOString() : null;
      let retopupTimeRemainingSeconds: number | null = null;
      let isExpired = false;

      // If member has reached 500% cap and retopup deadline is not yet set, start 48h window now!
      if (isCapped && !retopupDeadline) {
        const deadlineDate = new Date(Date.now() + 48 * 3600 * 1000);
        retopupDeadline = deadlineDate.toISOString();
        await queryNeon(
          `UPDATE "DaoMember"
           SET "cappedAt" = NOW(),
               "retopupDeadline" = $1,
               status = 'capped',
               "updatedAt" = NOW()
           WHERE id = $2`,
          [retopupDeadline, m.id]
        );
      }

      if (retopupDeadline) {
        const diffMs = new Date(retopupDeadline).getTime() - Date.now();
        retopupTimeRemainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
        if (retopupTimeRemainingSeconds === 0) {
          isExpired = true;
          if (m.status !== 'vacant') {
            await queryNeon(
              `UPDATE "DaoMember" SET status = 'vacant', "updatedAt" = NOW() WHERE id = $1`,
              [m.id]
            );
          }
        }
      }

      const capProgressPct = capBtt > 0 ? Math.min(100, Math.round((pushedBtt / capBtt) * 100)) : 0;
      const remainingCapBtt = Math.max(0, capBtt - pushedBtt);
      const remainingCapUsd = Math.max(0, earningsCapUsd - pushedUsd);
      const retopupCashbackUsd = parseFloat((300 / (m.position || 1)).toFixed(2));
      const retopupCashbackTrob = Math.round((retopupCashbackUsd / bttPriceUsd) * 100) / 100;
      const currentStatus = isExpired ? 'vacant' : (m.status || (isCapped ? 'capped' : 'active'));

      return NextResponse.json({
        success: true,
        data: {
          isMember: !isExpired,
          address: m.address,
          position: m.position,
          nftTokenId: m.nftTokenId || m.position,
          status: currentStatus,
          claimableDividendsBtt: 0,
          claimableDividendsUsd: 0,
          totalReceivedBtt: pushedBtt,
          totalReceivedUsd: pushedUsd,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          pushedBtt,
          pushedTrob: pushedBtt,
          pushedUsd,
          capProgressPct,
          remainingCapBtt,
          remainingCapTrob: remainingCapBtt,
          remainingCapUsd,
          isCapped,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          retopupCashbackUsd,
          retopupCashbackTrob,
          isExpired,
          bttPriceUsd,
          trobPriceUsd: bttPriceUsd,
          soulboundPass: {
            seatNumber: m.position,
            memberId: `#${String(m.position).padStart(4, '0')}`,
            tier: 'Genesis Council',
            joinedAt: m.joinedAt,
            nftTokenId: m.nftTokenId || m.position,
          },
          incomeChannels: {
            daoSeats: {
              earnedUsd: pushedUsd,
              earnedBtt: pushedBtt,
            },
            matrixSlots: {
              highestSlot: 0,
              earnedUsd: 0,
              earnedBtt: 0,
            },
          },
        },
      });
    }
  } catch (dbErr) {
    console.warn('[lounge route] Neon fallback error:', dbErr);
  }

  const nonMemberLounge = {
    isMember: false,
    address,
    position: undefined,
    nftTokenId: undefined,
    status: 'unclaimed',
    claimableDividendsBtt: 0,
    claimableDividendsUsd: 0,
    totalReceivedBtt: 0,
    totalReceivedUsd: 0,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    earningsCapUsd,
    pushedBtt: 0,
    pushedTrob: 0,
    pushedUsd: 0,
    capProgressPct: 0,
    remainingCapBtt: earningsCapBtt,
    remainingCapTrob: earningsCapBtt,
    remainingCapUsd: earningsCapUsd,
    isCapped: false,
    bttPriceUsd,
    trobPriceUsd: bttPriceUsd,
    soulboundPass: null,
    incomeChannels: {
      daoSeats: { earnedUsd: 0, earnedBtt: 0 },
      matrixSlots: { highestSlot: 0, earnedUsd: 0, earnedBtt: 0 },
    },
  };

  return NextResponse.json({
    success: true,
    data: nonMemberLounge,
  });
}
