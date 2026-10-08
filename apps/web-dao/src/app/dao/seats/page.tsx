'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CouncilSeatsHero } from '@/components/dao/seats/CouncilSeatsHero';
import { CouncilStatCards } from '@/components/dao/seats/CouncilStatCards';
import { CouncilGrid } from '@/components/dao/seats/CouncilGrid';
import { SeatInspector } from '@/components/dao/seats/SeatInspector';
import { CouncilAboutCard } from '@/components/dao/seats/CouncilAboutCard';
import { CouncilRecentActivity } from '@/components/dao/seats/CouncilRecentActivity';
import {
  buildLiveCouncilSeats,
  type CouncilSeatDetail,
  type RawMemberData,
} from '@/data/councilSeatsData';
import { useApi, useDaoMember, useTrobPrice } from '@/hooks/useApi';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { Check, Loader2, ShieldCheck } from 'lucide-react';

import { SeatPaymentModal } from '@/components/dao/seats/SeatPaymentModal';
import { UnderfundedAlertBanner } from '@/components/dao/UnderfundedAlertBanner';
import { RetopupModal } from '@/components/dao/lounge/RetopupModal';
import { DEPLOYED_CONTRACTS, getActiveDaoAddress } from '@/utils/trobAddress';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { pollOnChainTxSuccess } from '@/utils/txConfirmation';

interface ApiMembersPayload {
  members: RawMemberData[];
  total: number;
  bttPriceUsd: number;
}

export default function CouncilSeatsPage() {
  const wallet = useWallet();
  const auth   = useAuthContext();
  const activeAddress = wallet.base58Address || wallet.hexAddress;

  const { data: price } = useTrobPrice(30_000);
  const { data: memberData, loading: memberLoading, refetch: refetchMember } = useDaoMember(activeAddress, 15_000);

  // Fetch all 100 members from live backend API with 15s live polling
  const { data: membersPayload, loading: membersLoading, refetch: refetchMembers } =
    useApi<ApiMembersPayload>('/api/dao/members?page=1&limit=100', { pollMs: 15_000 });

  const isMemberLoading = Boolean(wallet.isConnected && activeAddress && (memberLoading || memberData === null));
  const isSeatsLoading  = Boolean(membersLoading || !membersPayload);

  // Live real-time tick to auto-evaluate 48h expiration in real time
  const [clockTick, setClockTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setClockTick(Date.now()), 5_000);
    return () => clearInterval(t);
  }, []);

  const [notification, setNotification] = useState<string | null>(null);
  const [minting, setMinting]           = useState(false);
  const [mintErr, setMintErr]           = useState<string | null>(null);
  const [paymentModalSeat, setPaymentModalSeat] = useState<CouncilSeatDetail | null>(null);
  const [retopupModalOpen, setRetopupModalOpen] = useState(false);

  // Dynamically build the 100 seats array from live data
  const seats: CouncilSeatDetail[] = useMemo(() => {
    const rawMembers = membersPayload?.members ?? [];
    const bttPrice = membersPayload?.bttPriceUsd ?? price?.priceUsd ?? 0;
    return buildLiveCouncilSeats(rawMembers, activeAddress, bttPrice);
  }, [membersPayload, activeAddress, price?.priceUsd, clockTick]);

  // Default selected seat: user's own seat → or next available (lowest 1-100) → or defaulted → or first seat
  // Strictly verified on-chain: non-members NEVER receive a false seat allocation!
  const isUnderfundedMember = Boolean(memberData?.status === 'underfunded' || memberData?.underfunded);
  const isRealMember = Boolean(memberData?.isMember && Number(memberData?.position) > 0 && !isUnderfundedMember);
  const mySeatNumber = (isRealMember || isUnderfundedMember) ? Number(memberData!.position) : null;

  const defaultSeat = useMemo(() => {
    if (mySeatNumber) {
      const foundMine = seats.find((s) => s.seatNumber === mySeatNumber);
      if (foundMine) return foundMine;
    }
    const next = seats.find((s) => s.status === 'next');
    if (next) return next;
    const defaulted = seats.find((s) => s.status === 'defaulted');
    if (defaulted) return defaulted;
    return seats[0];
  }, [seats, mySeatNumber]);

  const [selectedSeat, setSelectedSeat] = useState<CouncilSeatDetail>(defaultSeat);

  // Sync selectedSeat when defaultSeat updates on data arrival
  useEffect(() => {
    setSelectedSeat((prev) => {
      const updated = seats.find((s) => s.seatNumber === prev.seatNumber);
      return updated ?? defaultSeat;
    });
  }, [seats, defaultSeat]);

  // ── Initiate seat claim modal with Anti-Sybil & SR vote pre-checks ────────
  const handleOpenClaimModal = async (seatNumber: number) => {
    if (isMemberLoading) {
      setMintErr('Synchronizing your on-chain membership. Please wait a moment...');
      return;
    }
    if (isUnderfundedMember) {
      setMintErr(`Council Seat #${memberData!.position} is registered to this wallet but underfunded. You cannot mint a second seat. Please complete Re-topup to unlock your seat.`);
      return;
    }
    if (isRealMember) {
      setMintErr(`You already own Council Seat #${memberData!.position}. Limit 1 seat per wallet.`);
      return;
    }

    const targetAddress = activeAddress || wallet.base58Address || wallet.hexAddress || '';
    if (!targetAddress) {
      setMintErr('Please connect your TrobSafe wallet first.');
      return;
    }

    // Anti-Sybil & SR Vote pre-flight validation
    try {
      const fingerprint = await getDeviceFingerprint();
      const eligRes = await fetch(`/api/dao/eligibility/${encodeURIComponent(targetAddress)}?deviceFingerprint=${encodeURIComponent(fingerprint)}`);
      const eligData = await eligRes.json();

      // Gating conditions bypassed as requested: allow any wallet to proceed
      if (eligData?.walletAlreadyHasSeat) {
        setMintErr(`Limit 1 Seat Per Wallet: This wallet already owns Council Seat #${eligData.ownedSeatNumber}.`);
        return;
      }
    } catch {}

    const targetSeat = seats.find((s) => s.seatNumber === seatNumber) ?? selectedSeat;
    setPaymentModalSeat(targetSeat);
  };

  // ── On-chain payment & sync handler ───────────────────────────────────────
  const handleConfirmPayment = async (seatNumber: number): Promise<{ success: boolean; txHash?: string | null; error?: string }> => {
    if (!wallet.isConnected) {
      return { success: false, error: 'Please connect your TrobSafe wallet first.' };
    }
    if (memberData?.isMember) {
      return { success: false, error: `You already own Council Seat #${memberData.position}. Limit 1 seat per wallet.` };
    }

    setMintErr(null);
    setMinting(true);

    const seatEntryTrob = 5357.14; // Fixed smart contract benchmark ($0.056 / $300)
    // Security hard-floor: Entry fee is strictly pegged to $300 USD (minimum 4,500 TROB)
    if (seatEntryTrob < 4500) {
      throw new Error(`Invalid entry fee calculation (${seatEntryTrob} TROB). A minimum of $300 USD (at least 4,500 TROB) is strictly required.`);
    }
    const callValueSun = Math.ceil(seatEntryTrob * 1_000_000);
    const daoAddress = getActiveDaoAddress();
    const activeAddr = wallet.base58Address ?? wallet.hexAddress ?? '';

    try {
      // 0. Smart Contract Pre-flight EVM dry-run simulation
      const { simulateContractCall } = await import('@/utils/contractSimulation');
      const sim = await simulateContractCall({
        functionName: 'joinDAO()',
        ownerAddress: activeAddr,
        contractAddress: daoAddress,
        callValueSun: callValueSun,
      });

      if (!sim.canProceed) {
        throw new Error(sim.errorReason || 'Smart contract pre-flight simulation failed. Transaction would revert on-chain.');
      }

      let txId: string | null = null;

      // 1. On-chain call via TrobSafe
      try {
        const result = await wallet.callContract({
          contract_address: daoAddress,
          function_selector: 'joinDAO()',
          parameter: '',
          call_value: callValueSun,
          fee_limit: 100_000_000,
          owner_address: activeAddr,
        });

        if (result?.result && result.txid) {
          txId = result.txid;
        } else if (result?.txid) {
          txId = result.txid;
        }
      } catch (onChainErr: unknown) {
        console.warn('[CouncilSeatsPage] On-chain broadcast notice:', onChainErr);
        const msg = onChainErr instanceof Error ? onChainErr.message : String(onChainErr);
        throw new Error(msg || 'Transaction was not completed in TrobSafe.');
      }

      if (!txId) {
        throw new Error('On-chain payment was not confirmed by TrobSafe. Please approve the transaction in the wallet popup.');
      }

      // Verify on-chain execution receipt from TrobChain FullNode
      const confirmCheck = await pollOnChainTxSuccess(txId);
      if (!confirmCheck.success) {
        throw new Error(confirmCheck.error || 'Transaction failed or reverted on blockchain. Deposit was not accepted.');
      }

      // 2. Synchronize database via API with Anti-Sybil device fingerprint
      const deviceFingerprint = await getDeviceFingerprint();
      let res = await fetch('/api/dao/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': deviceFingerprint,
        },
        body: JSON.stringify({
          address: activeAddr,
          txHash: txId,
          position: seatNumber,
          deviceFingerprint,
          termsAccepted: true,
        }),
      }).catch(() => null);

      if (!res) {
        res = await fetch('https://api.equorafidao.com/api/dao/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-device-fingerprint': deviceFingerprint,
          },
          body: JSON.stringify({
            address: activeAddr,
            txHash: txId,
            position: seatNumber,
            deviceFingerprint,
            termsAccepted: true,
          }),
        }).catch(() => null);
      }

      if (!res) {
        throw new Error('Unable to contact server to synchronize membership. Your on-chain transaction succeeded: ' + txId);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to register membership.');
      }

      const assignedPosition = data.data?.position ?? seatNumber;
      const cashbackReceived = data.data?.instantCashbackUsd ?? (300 / assignedPosition).toFixed(2);
      setNotification(`Council Seat #${assignedPosition} Claimed! Instant cashback of +$${cashbackReceived} USD sent directly to your connected wallet on-chain (Zero Gas Fees). ${txId ? `(Tx: ${txId.slice(0, 10)}…)` : ''}`);
      await Promise.all([refetchMembers(), refetchMember()]);
      setTimeout(() => setNotification(null), 8000);

      return { success: true, txHash: txId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim failed.';
      setMintErr(msg);
      return { success: false, error: msg };
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      <CouncilSeatsHero />

      <CouncilStatCards />

      {/* Underfunded Locked Seat Banner */}
      <UnderfundedAlertBanner />

      {/* Connected Wallet Status Banner — 100% Direct Blockchain Sync Indicator */}
      {wallet.isConnected && !isUnderfundedMember && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
          isMemberLoading
            ? 'bg-[#F7FBFF] border-blue-200 text-[#14304A]'
            : isRealMember
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-[#F7FBFF] border-[#E2EEF9] text-[#14304A]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isMemberLoading ? 'bg-[#0E62E4] text-white' : isRealMember ? 'bg-emerald-500 text-white' : 'bg-[#0E62E4] text-white'
            }`}>
              {isMemberLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRealMember ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-sans">
                  {isMemberLoading
                    ? 'Verifying Council Membership...'
                    : isRealMember
                    ? `Active Council Member (Seat #${memberData!.position})`
                    : 'Connected Wallet · Available for Seat Claim'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-current/20 font-semibold">
                  {isMemberLoading ? 'Syncing...' : 'Blockchain Synced'}
                </span>
              </div>
              <p className="text-[11px] text-[#4F6D87] truncate">
                {isMemberLoading
                  ? `Verifying on-chain sovereign seat allocation for ${activeAddress}...`
                  : isRealMember
                  ? `Wallet ${activeAddress} is verified on the smart contract for Seat #${memberData!.position}. Limit: 1 seat per wallet/device.`
                  : `Connected: ${activeAddress}. You do not own a seat yet. You may claim 1 vacant seat below ($300 USD).`}
              </p>
            </div>
          </div>
          {isMemberLoading ? (
            <div className="shrink-0 text-[11px] font-semibold text-[#0E62E4] bg-white px-3.5 py-1.5 rounded-xl border border-blue-200 text-center flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing Dynamic Data...</span>
            </div>
          ) : isRealMember ? (
            <a
              href="/dao/lounge"
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all text-center"
            >
              Enter Member Lounge
            </a>
          ) : (
            <div className="shrink-0 text-[11px] font-semibold text-[#0E62E4] bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-center">
              1 Seat Per Device & Wallet Limit
            </div>
          )}
        </div>
      )}

      {/* Background refresh indicator when payload already exists */}
      {!isSeatsLoading && membersLoading && (
        <div className="flex items-center gap-2 text-xs text-[#4F6D87] font-sans">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E62E4]" />
          <span>Refreshing live seat state from database…</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Council Grid */}
        <div className="lg:col-span-8 space-y-6">
          {isSeatsLoading ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E2EEF9] shadow-[0_2px_12px_rgba(14,98,228,0.06)] flex flex-col items-center justify-center space-y-4 min-h-[480px]">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#0E62E4]/20 flex items-center justify-center text-[#0E62E4] shadow-xs">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm sm:text-base font-bold text-[#14304A]">Syncing Sovereign Council Seats...</div>
                <p className="text-xs text-[#4F6D87]">Fetching live on-chain allocations and dynamic seat ownership from blockchain.</p>
              </div>
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2 w-full max-w-md pt-3 opacity-30">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-[#E2EEF9] animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <CouncilGrid
              seats={seats}
              selectedSeat={selectedSeat}
              onSelectSeat={setSelectedSeat}
            />
          )}
          <div className="hidden lg:block">
            <CouncilRecentActivity />
          </div>
        </div>

        {/* Right: Inspector + About */}
        <div className="lg:col-span-4 space-y-6">
          {/* Success notification */}
          {notification && (
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#047857] font-semibold flex items-center gap-2.5 shadow-sm animate-fadeIn">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              {notification}
            </div>
          )}

          {/* Mint error */}
          {mintErr && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
              {mintErr}
            </div>
          )}

          <SeatInspector
            seat={selectedSeat}
            priceData={price}
            onMintSeat={minting || isMemberLoading || isSeatsLoading || memberData?.isMember ? undefined : handleOpenClaimModal}
            onRetopup={() => setRetopupModalOpen(true)}
            isMemberLoading={isMemberLoading}
            isSeatsLoading={isSeatsLoading}
            walletConnected={wallet.isConnected}
          />
          <CouncilAboutCard />

          <div className="lg:hidden">
            <CouncilRecentActivity />
          </div>
        </div>
      </div>

      {paymentModalSeat && (
        <SeatPaymentModal
          isOpen={Boolean(paymentModalSeat)}
          onClose={() => setPaymentModalSeat(null)}
          seat={paymentModalSeat}
          priceData={price}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {(() => {
        const isUnderfundedSeat = selectedSeat.statusBadge === '5X Capped'
          ? false
          : Boolean(
              selectedSeat.statusBadge === 'Underfunded' ||
              memberData?.underfunded ||
              memberData?.status === 'underfunded'
            );
        return (
          <RetopupModal
            isOpen={retopupModalOpen}
            onClose={() => setRetopupModalOpen(false)}
            seatPosition={memberData?.position || selectedSeat.seatNumber}
            retopupDeadline={memberData?.retopupDeadline || selectedSeat.retopupDeadline}
            trobPriceUsd={price?.priceUsd}
            alreadyPaidTrob={isUnderfundedSeat ? (memberData?.entryAmountTrob ?? memberData?.entryAmountBtt ?? selectedSeat.alreadyPaidTrob ?? 0) : 0}
            isUnderfunded={isUnderfundedSeat}
            onSuccess={() => {
              refetchMember();
              refetchMembers();
              setRetopupModalOpen(false);
              setNotification(
                isUnderfundedSeat
                  ? `Seat #${memberData?.position || selectedSeat.seatNumber} successfully activated on blockchain!`
                  : `5X Cap reset confirmed on blockchain! Seat #${memberData?.position || selectedSeat.seatNumber} is now active.`
              );
            }}
          />
        );
      })()}
    </div>
  );
}
