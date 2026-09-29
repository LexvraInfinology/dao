'use client';

import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Crown, 
  Info,
  GitBranch,
  Eye
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface MatrixNodeData {
  position: number; // 1..14
  memberId: number | null;
  code: number | null;
  address: string | null;
  hasDeposited: boolean; // $30 deposit made
  activeDirectsCount: number; // directs with $30 deposit
  isQualified: boolean;
  payoutType: 'UPLINE' | 'OWNER_DIRECT' | 'PROTOCOL_POOL' | 'SPILLOVER_DL' | 'SPILLOVER_SPLIT';
  payoutLabel: string;
  payoutDescription: string;
  badgeColor: string;
}

export default function MatrixTreeGraph() {
  const wallet = useWallet();

  // Mode: Viewing personal tree vs viewing placement on sponsor's matrix
  const [viewMode, setViewMode] = useState<'personal' | 'sponsor'>('personal');
  const [selectedNode, setSelectedNode] = useState<MatrixNodeData | null>(null);
  const selectedSlot = 1;

  // Simulated / default state reflecting actual rule logic
  // (Direct referrals with $30 deposit each unlock personal tree graph)
  const userAddress: string = wallet?.address ? String(wallet.address) : '0x7A14b98F03dC48742b6a98f121d51c099307A119';
  const userMemberId = 10042;
  const userMemberCode = 10042;
  const userActiveDirects = 2; // 2 directs with $30 each
  const isUserQualified = userActiveDirects >= 2;

  // Sponsor Tree Details
  const sponsorAddress = '0x3E8019b84a92c3005D56A4932F23561a067E6B20';
  const sponsorMemberId = 10001;
  const sponsorMemberCode = 10001;

  // Node definitions matching the 14-position single-leg matrix engine
  const personalNodes: MatrixNodeData[] = [
    // Level 1 (2 nodes)
    {
      position: 1,
      memberId: 10088,
      code: 10088,
      address: '0x8b32...F192',
      hasDeposited: true,
      activeDirectsCount: 2,
      isQualified: true,
      payoutType: 'UPLINE',
      payoutLabel: 'P1 → Upline 1',
      payoutDescription: '100% of $30 routed to Sponsor / Upline 1 (if qualified).',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      position: 2,
      memberId: 10089,
      code: 10089,
      address: '0x9c41...83A1',
      hasDeposited: true,
      activeDirectsCount: 2,
      isQualified: true,
      payoutType: 'UPLINE',
      payoutLabel: 'P2 → Upline 2',
      payoutDescription: '100% of $30 routed to Upline 2 (if qualified).',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    // Level 2 (4 nodes)
    {
      position: 3,
      memberId: 10095,
      code: 10095,
      address: '0x2d18...91B4',
      hasDeposited: true,
      activeDirectsCount: 1,
      isQualified: false,
      payoutType: 'OWNER_DIRECT',
      payoutLabel: 'P3 → Direct to You',
      payoutDescription: '100% ($30 TROB) credited directly to your wallet.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      position: 4,
      memberId: 10102,
      code: 10102,
      address: '0x4f89...72E0',
      hasDeposited: true,
      activeDirectsCount: 0,
      isQualified: false,
      payoutType: 'PROTOCOL_POOL',
      payoutLabel: 'P4 → Protocol Pools',
      payoutDescription: '100% sent to EquoraVault: 35% DAO, 40% Salary, 15% Rewards, 10% Magic Box.',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      position: 5,
      memberId: 10109,
      code: 10109,
      address: '0x5a23...04F8',
      hasDeposited: true,
      activeDirectsCount: 2,
      isQualified: true,
      payoutType: 'PROTOCOL_POOL',
      payoutLabel: 'P5 → Pools + Auto Next Slot',
      payoutDescription: 'Funds protocol pools & auto-activates Slot 2 ($60) top node!',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      position: 6,
      memberId: 10114,
      code: 10114,
      address: '0x6b77...89C2',
      hasDeposited: true,
      activeDirectsCount: 2,
      isQualified: true,
      payoutType: 'OWNER_DIRECT',
      payoutLabel: 'P6 → Direct to You',
      payoutDescription: '100% ($30 TROB) credited directly to your wallet.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    // Level 3 (8 nodes)
    {
      position: 7,
      memberId: 10120,
      code: 10120,
      address: '0x7e11...33A9',
      hasDeposited: true,
      activeDirectsCount: 2,
      isQualified: true,
      payoutType: 'SPILLOVER_DL',
      payoutLabel: 'P7 → Spillover DL1',
      payoutDescription: 'Target Node 1 (DL1). If unqualified, falls back to Node 2 (DL2).',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      position: 8,
      memberId: 10125,
      code: 10125,
      address: '0x1a82...99B0',
      hasDeposited: true,
      activeDirectsCount: 0,
      isQualified: false,
      payoutType: 'OWNER_DIRECT',
      payoutLabel: 'P8 → Direct to You',
      payoutDescription: '100% ($30 TROB) credited directly to your wallet.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      position: 9,
      memberId: 10131,
      code: 10131,
      address: '0x3c99...45D1',
      hasDeposited: true,
      activeDirectsCount: 1,
      isQualified: false,
      payoutType: 'OWNER_DIRECT',
      payoutLabel: 'P9 → Direct to You',
      payoutDescription: '100% ($30 TROB) credited directly to your wallet.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      position: 10,
      memberId: 10138,
      code: 10138,
      address: '0x8f44...12C8',
      hasDeposited: true,
      activeDirectsCount: 2,
      isQualified: true,
      payoutType: 'SPILLOVER_DL',
      payoutLabel: 'P10 → Spillover DL2',
      payoutDescription: 'Targets Node 2 (DL2) with anti-double payout protection (never pays same node twice).',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      position: 11,
      memberId: null,
      code: null,
      address: null,
      hasDeposited: false,
      activeDirectsCount: 0,
      isQualified: false,
      payoutType: 'OWNER_DIRECT',
      payoutLabel: 'P11 → Direct to You',
      payoutDescription: '100% ($30 TROB) credited directly to your wallet when filled.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      position: 12,
      memberId: null,
      code: null,
      address: null,
      hasDeposited: false,
      activeDirectsCount: 0,
      isQualified: false,
      payoutType: 'OWNER_DIRECT',
      payoutLabel: 'P12 → Direct to You',
      payoutDescription: '100% ($30 TROB) credited directly to your wallet when filled.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      position: 13,
      memberId: null,
      code: null,
      address: null,
      hasDeposited: false,
      activeDirectsCount: 0,
      isQualified: false,
      payoutType: 'SPILLOVER_SPLIT',
      payoutLabel: 'P13 → Option B DL Split',
      payoutDescription: 'Scans downline\'s downlines (Nodes 3, 4, 5, 6) & splits equally among qualified nodes.',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      position: 14,
      memberId: null,
      code: null,
      address: null,
      hasDeposited: false,
      activeDirectsCount: 0,
      isQualified: false,
      payoutType: 'PROTOCOL_POOL',
      payoutLabel: 'P14 → Pools & Cycle 2 Reset',
      payoutDescription: 'Funds protocol pools, permanently archives Cycle 1 snapshot & auto-resets to Cycle 2.',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  // When viewing sponsor's tree, show user at Node 1
  const sponsorNodes: MatrixNodeData[] = personalNodes.map((node) => {
    if (node.position === 1) {
      return {
        ...node,
        memberId: userMemberId,
        code: userMemberCode,
        address: userAddress,
        hasDeposited: true,
        activeDirectsCount: userActiveDirects,
        isQualified: isUserQualified,
        payoutLabel: 'YOU (Node 1 / DL1)',
        payoutDescription: 'You made a $30 deposit and were placed here on your sponsor\'s matrix!',
        badgeColor: 'bg-emerald-500 text-white font-bold border-emerald-600',
      };
    }
    return node;
  });

  const currentNodes = viewMode === 'personal' ? personalNodes : sponsorNodes;
  const filledCount = currentNodes.filter((n) => n.hasDeposited).length;

  return (
    <div className="bg-white border border-[#E2ECF9] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-6">
      
      {/* Top Header: Title & View Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#F1F5F9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#155EEF] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-[#071A4A] tracking-tight">
              14-Position Single-Leg Matrix Graph
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#155EEF] border border-[#BFDBFE]/60">
              Slot {selectedSlot} ($30 TROB)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Visual member hierarchy, live ID placements, and automated payout routes.
          </p>
        </div>

        {/* View Switcher: My Personal Tree vs My Placement on Sponsor */}
        <div className="flex items-center p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] self-stretch md:self-auto">
          <button
            onClick={() => setViewMode('personal')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'personal'
                ? 'bg-white text-[#155EEF] shadow-xs border border-[#BFDBFE]'
                : 'text-[#64748B] hover:text-[#071A4A]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>My Personal Tree</span>
          </button>
          <button
            onClick={() => setViewMode('sponsor')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'sponsor'
                ? 'bg-[#155EEF] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#071A4A]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View on Sponsor Matrix</span>
          </button>
        </div>
      </div>

      {/* 2-Direct Referral Qualification Status Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isUserQualified 
          ? 'bg-emerald-50/70 border-emerald-200' 
          : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isUserQualified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isUserQualified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#071A4A] text-sm sm:text-base">
                  {isUserQualified ? 'Personal Tree Graph Active' : 'Tree Graph Pending Qualification'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isUserQualified 
                    ? 'bg-emerald-200/60 text-emerald-800' 
                    : 'bg-amber-200/60 text-amber-800'
                }`}>
                  {userActiveDirects} / 2 Directs Deposited ($30 each)
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-2xl">
                {isUserQualified ? (
                  <>
                    🎉 <strong>Congratulations!</strong> You have directed 2 people who each deposited $30 worth of TROB. Your personal 14-position tree graph is fully active and qualified for downline spillovers (P7, P10, P13)!
                  </>
                ) : (
                  <>
                    When you make a normal $30 deposit, you are placed on your sponsor&apos;s matrix graph. Direct <strong>2 members who each deposit $30 worth of TROB</strong> to activate your own personal tree graph and unlock spillover rewards.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto bg-white/80 p-2.5 rounded-xl border border-[#E2E8F0]">
            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase font-bold">Your Status</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> $30 Deposited
              </div>
            </div>
            <div className="w-px h-7 bg-[#E2E8F0]" />
            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase font-bold">Directs ($30)</div>
              <div className="text-xs font-bold text-[#071A4A] mt-0.5">
                {userActiveDirects} / 2 Complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Explainer Banner */}
      {viewMode === 'sponsor' ? (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5 flex items-center justify-between text-xs text-[#1E40AF]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#155EEF] shrink-0" />
            <span>
              <strong>Showing Sponsor Matrix:</strong> You are placed at <strong>Node 1 (Downline 1)</strong> on Member #{sponsorMemberId}&apos;s matrix after your $30 TROB deposit.
            </span>
          </div>
          <button 
            onClick={() => setViewMode('personal')}
            className="text-xs font-bold text-[#155EEF] underline hover:text-[#071A4A] shrink-0 ml-2"
          >
            Switch to My Tree
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#155EEF]" />
            <span>Showing your personal 14-position matrix tree (Cycle 1)</span>
          </div>
          <span className="font-semibold text-[#071A4A]">
            Filled Positions: <strong className="text-[#155EEF]">{filledCount}</strong> / 14
          </span>
        </div>
      )}

      {/* ─── 14-NODE VISUAL TREE GRAPH ─── */}
      <div className="relative bg-[#FAFCFF] border border-[#E9EFF8] rounded-2xl p-4 sm:p-8 overflow-x-auto min-h-[580px] flex flex-col items-center">
        
        {/* ================= LEVEL 0: ROOT / APEX OWNER ================= */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div 
            onClick={() => setSelectedNode({
              position: 0,
              memberId: viewMode === 'personal' ? userMemberId : sponsorMemberId,
              code: viewMode === 'personal' ? userMemberCode : sponsorMemberCode,
              address: viewMode === 'personal' ? userAddress : sponsorAddress,
              hasDeposited: true,
              activeDirectsCount: 2,
              isQualified: true,
              payoutType: 'OWNER_DIRECT',
              payoutLabel: viewMode === 'personal' ? 'YOU (Apex Matrix Owner)' : `Sponsor (Apex Member #${sponsorMemberId})`,
              payoutDescription: 'Root owner of this 14-position single-leg matrix cycle.',
              badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
            })}
            className={`cursor-pointer group flex flex-col items-center p-3.5 rounded-2xl bg-white border-2 shadow-md transition-all hover:scale-105 ${
              viewMode === 'personal' ? 'border-[#155EEF]' : 'border-amber-400'
            } min-w-[170px] text-center`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Crown className={`w-4 h-4 ${viewMode === 'personal' ? 'text-[#155EEF]' : 'text-amber-500'}`} />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#071A4A]">
                {viewMode === 'personal' ? 'Your Apex Tree' : 'Sponsor Tree'}
              </span>
            </div>
            <div className="text-sm font-black text-[#071A4A]">
              Member #{viewMode === 'personal' ? userMemberId : sponsorMemberId}
            </div>
            <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
              Code: {viewMode === 'personal' ? userMemberCode : sponsorMemberCode}
            </div>
            <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <CheckCircle2 className="w-2.5 h-2.5" /> $30 Slot 1 Active
            </div>
          </div>
        </div>

        {/* ================= LEVEL 1: 2 NODES (P1, P2) ================= */}
        <div className="w-full max-w-lg flex items-center justify-around gap-6 mb-8 relative z-10">
          {[personalNodes[0], personalNodes[1]].map((node) => {
            const isUserHere = viewMode === 'sponsor' && node.position === 1;
            return (
              <div
                key={node.position}
                onClick={() => setSelectedNode(node)}
                className={`cursor-pointer group flex-1 max-w-[200px] flex flex-col items-center p-3 rounded-2xl transition-all hover:scale-105 border ${
                  isUserHere 
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg ring-2 ring-emerald-300'
                    : node.hasDeposited 
                      ? 'bg-white border-[#BFDBFE] shadow-sm hover:border-[#155EEF]' 
                      : 'bg-white/60 border-dashed border-[#CBD5E1] text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isUserHere ? 'bg-emerald-600 text-white' : 'bg-[#EFF6FF] text-[#155EEF]'
                  }`}>
                    Node {node.position}
                  </span>
                  <span className={`text-[10px] font-semibold ${isUserHere ? 'text-emerald-100' : 'text-[#64748B]'}`}>
                    Level 1
                  </span>
                </div>

                <div className={`text-xs font-extrabold ${isUserHere ? 'text-white' : 'text-[#071A4A]'}`}>
                  {node.hasDeposited ? `Member #${isUserHere ? userMemberId : node.memberId}` : 'Empty Slot'}
                </div>

                <div className={`text-[10px] font-mono mt-0.5 ${isUserHere ? 'text-emerald-100' : 'text-[#64748B]'}`}>
                  {node.hasDeposited ? (isUserHere ? `YOU (${userAddress.slice(0, 6)}...)` : node.address) : 'Waiting deposit'}
                </div>

                <div className={`mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  isUserHere 
                    ? 'bg-emerald-600/80 text-white border-emerald-400'
                    : node.badgeColor
                }`}>
                  {isUserHere ? 'YOU ARE HERE ($30)' : node.payoutLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= LEVEL 2: 4 NODES (P3, P4, P5, P6) ================= */}
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 relative z-10">
          {[personalNodes[2], personalNodes[3], personalNodes[4], personalNodes[5]].map((node) => (
            <div
              key={node.position}
              onClick={() => setSelectedNode(node)}
              className={`cursor-pointer group flex flex-col items-center p-2.5 rounded-xl transition-all hover:scale-105 border ${
                node.hasDeposited 
                  ? 'bg-white border-[#E2ECF9] shadow-xs hover:border-[#155EEF]' 
                  : 'bg-white/60 border-dashed border-[#CBD5E1] text-[#94A3B8]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569]">
                  Node {node.position}
                </span>
                <span className="text-[9px] text-[#94A3B8]">L2</span>
              </div>
              <div className="text-xs font-bold text-[#071A4A]">
                {node.hasDeposited ? `ID #${node.memberId}` : 'Waiting...'}
              </div>
              <div className="text-[9px] text-[#64748B] font-mono mt-0.5 truncate max-w-[90px]">
                {node.hasDeposited ? node.address : '$30 Slot 1'}
              </div>
              <div className={`mt-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold border truncate max-w-full ${node.badgeColor}`}>
                {node.payoutLabel}
              </div>
            </div>
          ))}
        </div>

        {/* ================= LEVEL 3: 8 NODES (P7..P14) ================= */}
        <div className="w-full grid grid-cols-4 sm:grid-cols-8 gap-2 relative z-10">
          {[
            personalNodes[6],
            personalNodes[7],
            personalNodes[8],
            personalNodes[9],
            personalNodes[10],
            personalNodes[11],
            personalNodes[12],
            personalNodes[13],
          ].map((node) => (
            <div
              key={node.position}
              onClick={() => setSelectedNode(node)}
              className={`cursor-pointer group flex flex-col items-center p-2 rounded-xl transition-all hover:scale-105 border text-center ${
                node.hasDeposited 
                  ? 'bg-white border-[#E2ECF9] shadow-2xs hover:border-[#155EEF]' 
                  : 'bg-white/50 border-dashed border-[#CBD5E1] text-[#94A3B8]'
              }`}
            >
              <div className="text-[8px] font-bold text-[#64748B]">
                N{node.position}
              </div>
              <div className="text-[10px] font-extrabold text-[#071A4A] truncate max-w-[70px] mt-0.5">
                {node.hasDeposited ? `#${node.memberId}` : 'Open'}
              </div>
              <div className="text-[8px] text-[#94A3B8] font-mono truncate max-w-[60px]">
                {node.hasDeposited ? node.address : '$30'}
              </div>
              <div className={`mt-1 px-1 py-0.2 rounded text-[7px] font-bold border truncate max-w-full ${node.badgeColor}`}>
                {node.position === 7 ? 'P7 DL1' : node.position === 10 ? 'P10 DL2' : node.position === 13 ? 'P13 Split' : node.position === 14 ? 'P14 Reset' : 'Direct'}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ─── NODE DETAILS INSPECTOR MODAL / CARD ─── */}
      {selectedNode && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 animate-fadeIn">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedNode.badgeColor}`}>
                #{selectedNode.position}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#071A4A] text-base">
                    {selectedNode.hasDeposited ? `Member #${selectedNode.memberId}` : `Position #${selectedNode.position} (Empty)`}
                  </span>
                  {selectedNode.hasDeposited && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      $30 TROB Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#64748B] font-mono mt-0.5">
                  {selectedNode.address || 'Waiting for member to join and deposit $30'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-[#64748B] hover:text-[#071A4A] font-bold px-2.5 py-1 rounded-lg bg-white border border-[#CBD5E1]"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
            <div className="bg-white p-3 rounded-xl border border-[#E2E8F0]">
              <div className="text-[10px] text-[#64748B] uppercase font-bold">Payout Destination</div>
              <div className="text-xs font-bold text-[#071A4A] mt-1">{selectedNode.payoutLabel}</div>
              <p className="text-[11px] text-[#64748B] mt-1">{selectedNode.payoutDescription}</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E2E8F0]">
              <div className="text-[10px] text-[#64748B] uppercase font-bold">5-Digit Referral Code</div>
              <div className="text-xs font-mono font-bold text-[#155EEF] mt-1">
                {selectedNode.code ? `equorafi.com/ref/${selectedNode.code}` : 'Unassigned'}
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Used to invite direct referrals for tree qualification.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E2E8F0]">
              <div className="text-[10px] text-[#64748B] uppercase font-bold">Tree Graph Eligibility</div>
              <div className="text-xs font-bold text-[#071A4A] mt-1">
                {selectedNode.hasDeposited 
                  ? `${selectedNode.activeDirectsCount} / 2 Active Directs`
                  : 'Requires $30 deposit first'}
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                {selectedNode.isQualified 
                  ? 'Personal graph active & downline spillover qualified.' 
                  : 'Pending 2 direct referrals with $30 deposit each.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── LEGEND & EXPLANATION OF 14 POSITIONS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]/60">
          <div className="w-3 h-3 rounded-full bg-[#155EEF] shrink-0" />
          <div>
            <div className="font-bold text-[#071A4A]">P1 & P2 (Level 1)</div>
            <div className="text-[10px] text-[#64748B]">Upline 1 & Upline 2 (or Pools)</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
          <div className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-[#071A4A]">P3, P6, P8, P9, P11, P12</div>
            <div className="text-[10px] text-[#64748B]">Direct Owner Income ($30 each)</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/60">
          <div className="w-3 h-3 rounded-full bg-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-[#071A4A]">P7 & P10 (Spillover)</div>
            <div className="text-[10px] text-[#64748B]">Downline 1 & Downline 2</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200/60">
          <div className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
          <div>
            <div className="font-bold text-[#071A4A]">P4, P5 & P14 (Pools)</div>
            <div className="text-[10px] text-[#64748B]">35% DAO, 40% Salary, Retopup</div>
          </div>
        </div>
      </div>

    </div>
  );
}
