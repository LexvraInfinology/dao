import { NextRequest, NextResponse } from 'next/server';
import { fetchFromBackend } from '../../../_lib/proxy';
import { queryNeon } from '../../../_lib/neonDb';
import { toTronHex } from '../../../_lib/eligibility';
import { FULLNODE_RPC_URL, ACTIVE_DAO_CONTRACT_HEX } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  if (!address) {
    return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 });
  }

  const backendRes = await fetchFromBackend<{ success: boolean; data: any }>(
    `/api/dao/member/${address}`
  );
  if (backendRes && backendRes.success) {
    return NextResponse.json(backendRes);
  }

  const bttPriceUsd = 0.0572;
  const entryAmountUsd = 300;
  const earningsCapUsd = 1500;
  const entryAmountBtt = Math.round((entryAmountUsd / bttPriceUsd) * 100) / 100;
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
      const isCapped = capBtt > 0 && pushedBtt >= capBtt;

      let retopupDeadline = m.retopupDeadline;
      let retopupTimeRemainingSeconds: number | null = null;
      let isExpired = false;

      if (isCapped && !retopupDeadline) {
        // Start 48-hour retopup window on cap hit
        retopupDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        await queryNeon(
          `UPDATE "DaoMember"
           SET "retopupDeadline" = $1, "cappedAt" = NOW(), status = 'capped', "updatedAt" = NOW()
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

      const isMember = !isExpired && m.status !== 'vacant' && m.status !== 'defaulted';

      return NextResponse.json({
        success: true,
        data: {
          isMember,
          position: isMember ? m.position : null,
          nftTokenId: m.nftTokenId,
          status: isExpired ? 'vacant' : (m.status || (isCapped ? 'capped' : 'ACTIVE')),
          joinedAt: m.joinedAt,
          pushedAmountBtt: pushedBtt,
          pushedAmountTrob: pushedBtt,
          pushedAmountUsdEstimate: Math.round(pushedBtt * bttPriceUsd * 100) / 100,
          earningsCapBtt: capBtt,
          earningsCapTrob: capBtt,
          earningsCapUsd,
          capProgressPct: capBtt > 0 ? Math.min(100, Math.round((pushedBtt / capBtt) * 100)) : 0,
          isCapped,
          retopupDeadline,
          retopupTimeRemainingSeconds,
          entryAmountBtt: entryBtt,
          entryAmountTrob: entryBtt,
          entryAmountUsdEstimate: entryAmountUsd,
          directReferralsCount: 0,
          isQualified: isMember,
          userId: m.id,
        },
      });
    }
  } catch (dbErr) {
    console.warn('[member route] Neon lookup error:', dbErr);
  }

  // 3. On-Chain Direct Verification Fallback (EquoraDAO.sol)
  try {
    const hexContract = ACTIVE_DAO_CONTRACT_HEX
      .replace(/^0x/, '41')
      .toLowerCase();
    const userHex = toTronHex(address);
    if (userHex && userHex.length === 42) {
      const param = '000000000000000000000000' + userHex.slice(2);
      const onChainRes = await fetch(`${FULLNODE_RPC_URL}/wallet/triggersmartcontract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_address: hexContract,
          function_selector: 'isDaoMember(address)',
          parameter: param,
          owner_address: hexContract,
        }),
        cache: 'no-store',
      });
      if (onChainRes.ok) {
        const onChainJson = await onChainRes.json();
        const hexVal = onChainJson?.constant_result?.[0];
        const isMemberOnChain = hexVal && hexVal.endsWith('1');
        if (isMemberOnChain) {
          let pos = 1;
          try {
            const posRes = await fetch(`${FULLNODE_RPC_URL}/wallet/triggersmartcontract`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contract_address: hexContract,
                function_selector: 'memberPosition(address)',
                parameter: param,
                owner_address: hexContract,
              }),
              cache: 'no-store',
            });
            if (posRes.ok) {
              const posJson = await posRes.json();
              const posHex = posJson?.constant_result?.[0];
              if (posHex) pos = parseInt(posHex, 16) || 1;
            }
          } catch {}

          // Auto-sync into Neon database
          try {
            await queryNeon(
              `INSERT INTO "DaoMember" (address, position, status, "pushedAmountBtt", "entryAmountBtt", "joinedAt", "updatedAt")
               VALUES ($1, $2, 'active', 0, 5254.40, NOW(), NOW())
               ON CONFLICT (address) DO UPDATE SET position = $2, status = 'active'`,
              [address.trim(), pos]
            );
          } catch {}

          return NextResponse.json({
            success: true,
            data: {
              isMember: true,
              position: pos,
              nftTokenId: null,
              status: 'active',
              joinedAt: new Date().toISOString(),
              pushedAmountBtt: 0,
              pushedAmountTrob: 0,
              pushedAmountUsdEstimate: 0,
              earningsCapBtt: 26272,
              earningsCapTrob: 26272,
              earningsCapUsd: 1500,
              capProgressPct: 0,
              isCapped: false,
              retopupDeadline: null,
              retopupTimeRemainingSeconds: null,
              entryAmountBtt: 5254.40,
              entryAmountTrob: 5254.40,
              entryAmountUsdEstimate: 300,
              directReferralsCount: 0,
              isQualified: true,
              userId: null,
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn('[member route] On-chain check note:', err);
  }

  // Non-member response
  const nonMember = {
    isMember: false,
    position: null,
    nftTokenId: null,
    status: 'unclaimed',
    joinedAt: undefined,
    pushedAmountBtt: 0,
    pushedAmountTrob: 0,
    pushedAmountUsdEstimate: 0,
    earningsCapBtt,
    earningsCapTrob: earningsCapBtt,
    earningsCapUsd,
    capProgressPct: 0,
    isCapped: false,
    entryAmountBtt,
    entryAmountTrob: entryAmountBtt,
    entryAmountUsdEstimate: entryAmountUsd,
    directReferralsCount: 0,
    isQualified: false,
    userId: null,
  };

  return NextResponse.json({
    success: true,
    data: nonMember,
  });
}
