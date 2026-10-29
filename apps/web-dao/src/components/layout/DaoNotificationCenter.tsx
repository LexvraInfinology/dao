'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Sparkles,
  Check,
  ChevronRight,
  ShieldCheck,
  Crown,
  Layers,
  ArrowRight,
  Volume2,
  VolumeX,
  X,
  Zap,
  Clock,
  AlertTriangle,
  Network,
  GitBranch,
} from 'lucide-react';
import Link from 'next/link';
import { playNotificationChime, playPriorityAlertChime } from '@/utils/soundEffects';
import { getMatrixReferralUrl, resolveSponsorAddressForSeat } from '@/config/matrixTree';

export interface DaoNotification {
  id: string;
  type: 'matrix_leader_offer' | 'matrix_launch' | 'pool_dividend' | 'queue_update' | 'retopup_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  seatTarget?: number;
}

interface DaoNotificationCenterProps {
  userSeat?: number | null;
  userAddress?: string | null;
  onOpenMatrixModal?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export const DaoNotificationCenter: React.FC<DaoNotificationCenterProps> = ({
  userSeat,
  userAddress,
  onOpenMatrixModal,
  isOpen,
  onToggle,
  onClose,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDropdownOpen = isOpen !== undefined ? isOpen : internalOpen;

  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number; isMobile: boolean }>({
    top: 64,
    right: 12,
    isMobile: true,
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('equora_notification_sound') !== 'false';
  });
  const [notifications, setNotifications] = useState<DaoNotification[]>([]);
  const [hasPlayedInitial, setHasPlayedInitial] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setCoords({ top: 64, right: 12, isMobile: true });
      return;
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: Math.round(rect.bottom + 8),
        right: Math.round(Math.max(12, window.innerWidth - rect.right)),
        isMobile: false,
      });
    }
  };

  useEffect(() => {
    if (!isDropdownOpen) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isDropdownOpen]);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen((v) => !v);
    }
    if (!isDropdownOpen && soundEnabled) {
      playNotificationChime();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };

  const buildMatrixTop7Notification = (seat: number): DaoNotification => {
    if (seat === 1) {
      return {
        id: 'genesis_matrix_seat_1',
        type: 'matrix_leader_offer',
        title: 'Genesis Matrix Allocation: Apex Node (#0001)',
        message: 'As Founding Council Seat #0001, your wallet is designated as the Founding Matrix Root. Activation initializes the binary tree structure for Council Seats #2 and #3.',
        timestamp: 'Priority Allocation',
        read: false,
        priority: true,
        actionUrl: getMatrixReferralUrl(1),
        actionLabel: 'Activate Apex Node (Slot 1)',
        seatTarget: 1,
      };
    }

    const parentSeat = Math.floor(seat / 2);
    const legName = seat % 2 === 0 ? 'Left' : 'Right';
    const tierName = seat <= 3 ? 'Tier 1' : 'Tier 2';

    return {
      id: `genesis_matrix_seat_${seat}`,
      type: 'matrix_leader_offer',
      title: `Genesis Matrix Allocation: ${tierName} (${legName} Node)`,
      message: `Under protocol rules, a sponsor referral is mandatory. Your placement is pre-anchored to Council Seat #${parentSeat} for top-to-bottom binary placement.`,
      timestamp: 'Priority Allocation',
      read: false,
      priority: true,
      actionUrl: getMatrixReferralUrl(seat),
      actionLabel: `Join via Council Sponsor #${parentSeat}`,
      seatTarget: seat,
    };
  };

  // Initialize concise notifications dynamically based on user's seat position
  useEffect(() => {
    const list: DaoNotification[] = [];

    // Add Genesis Matrix Priority Allocation for Top 7 Members if seat is known
    if (userSeat && userSeat >= 1 && userSeat <= 7) {
      list.push(buildMatrixTop7Notification(userSeat));
    }

    // 1. 35% Global Protocol Pool Push (Concise)
    list.push({
      id: 'pool_push_35',
      type: 'pool_dividend',
      title: '35% Protocol Pool Active',
      message: '35% of all downstream Matrix volume routes directly to active member wallets.',
      timestamp: '1h ago',
      read: false,
      actionUrl: '/dao/treasury',
      actionLabel: 'View Treasury',
    });

    // 2. Matrix Launch Countdown alert (Concise)
    list.push({
      id: 'matrix_bridge_status',
      type: 'matrix_launch',
      title: 'Day 22 Retail Matrix',
      message: 'Spillover matrix tree & downline graphs unlock at countdown expiry.',
      timestamp: '2h ago',
      read: true,
      actionUrl: '/dao/matrix-bridge',
      actionLabel: 'Matrix Bridge',
    });

    // 3. Council Queue Update (Concise)
    list.push({
      id: 'queue_update_p2p',
      type: 'queue_update',
      title: 'Genesis Council Active',
      message: '100 Sovereign seats with instant 300/N cashbacks on every claim.',
      timestamp: '3h ago',
      read: true,
      actionUrl: '/dao/seats',
      actionLabel: 'Council Grid',
    });

    setNotifications(list);

    // Dynamic resolution for lounge/seat data & 48h retopup alert
    if (userAddress) {
      fetch(`/api/dao/lounge/${encodeURIComponent(userAddress)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const d = json.data;
            const seatPos = d.position || userSeat;

            // Ensure top 7 matrix allocation notification is injected if position is 1-7
            if (seatPos && seatPos >= 1 && seatPos <= 7) {
              const matrixItem = buildMatrixTop7Notification(seatPos);
              setNotifications((prev) => {
                if (prev.some((n) => n.id === matrixItem.id)) return prev;
                return [matrixItem, ...prev];
              });
            }

            if (d.isCapped || d.retopupDeadline) {
              const seatTarget = seatPos || 1;
              const isExpired = d.isExpired;

              const retopupItem: DaoNotification = {
                id: `retopup_alert_${userAddress}`,
                type: 'retopup_alert',
                title: isExpired
                  ? `Seat #${seatTarget} Vacated (Expired)`
                  : `5X Cap Reached — 48h Re-topup (Seat #${seatTarget})`,
                message: isExpired
                  ? `48-hour re-topup deadline expired. Seat open for queue reallocation.`
                  : `5X Cap reached ($1,500 USD). Re-topup $300 to reset cap and keep daily dividends.`,
                timestamp: isExpired ? 'Expired' : 'URGENT (48h)',
                read: false,
                priority: !isExpired,
                actionLabel: isExpired ? undefined : `Re-topup Seat #${seatTarget} ($300)`,
                seatTarget: seatTarget,
              };

              setNotifications((prev) => {
                const filtered = prev.filter((n) => n.id !== retopupItem.id);
                return [retopupItem, ...filtered];
              });

              if (!isExpired && soundEnabled) {
                playPriorityAlertChime();
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [userSeat, userAddress, soundEnabled]);

  // Outside click & escape listener
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        handleClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Handle play sound on new high-priority offer (Disabled while matrix root opportunity is hidden)
  /*
  useEffect(() => {
    if (!hasPlayedInitial && userSeat && userSeat >= 1 && userSeat <= 10 && soundEnabled) {
      const timer = setTimeout(() => {
        playPriorityAlertChime();
        setHasPlayedInitial(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userSeat, soundEnabled, hasPlayedInitial]);
  */

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (soundEnabled) playNotificationChime();
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('equora_notification_sound', String(next));
    }
    if (next) {
      playNotificationChime();
    }
  };

  // Listen for global custom event: 'dao:new-notification'
  useEffect(() => {
    const handleExternalNotification = (e: Event) => {
      const customEvent = e as CustomEvent<DaoNotification>;
      if (!customEvent.detail) return;
      const newNotif = customEvent.detail;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
      if (soundEnabled) {
        if (newNotif.priority) {
          playPriorityAlertChime();
        } else {
          playNotificationChime();
        }
      }
    };

    window.addEventListener('dao:new-notification', handleExternalNotification);
    return () => {
      window.removeEventListener('dao:new-notification', handleExternalNotification);
    };
  }, [soundEnabled]);

  // Periodic background check for protocol updates with audio alert
  useEffect(() => {
    const pollProtocolUpdates = async () => {
      try {
        const res = await fetch('/api/dao/stats');
        if (res.ok) {
          const data = await res.json();
          if (data && data.claimedCount && data.claimedCount > 2) {
            const updateId = `claim_update_${data.claimedCount}`;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === updateId)) return prev;
              const updateItem: DaoNotification = {
                id: updateId,
                type: 'queue_update',
                title: `New Genesis Council Claim! (${data.claimedCount}/100)`,
                message: `Seat #${data.claimedCount} was claimed on TrobChain. Instant 300/N cashbacks dispatched.`,
                timestamp: 'Just now',
                read: false,
                actionUrl: '/dao/seats',
                actionLabel: 'View Seats Grid',
              };
              if (soundEnabled) playNotificationChime();
              return [updateItem, ...prev];
            });
          }
        }
      } catch {
        /* graceful network silent catch */
      }
    };

    const interval = setInterval(pollProtocolUpdates, 30000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handlePassRootOffer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
              message: `You chose to pass this opportunity. Priority now transfers to Seat #${(userSeat || 1) + 1}.`,
              actionLabel: undefined,
            }
          : n
      )
    );
    if (soundEnabled) playNotificationChime();
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button — visible on all screen sizes */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-[#60739A] hover:text-[#071A4A] flex items-center justify-center transition-all shadow-xs cursor-pointer ${
          isDropdownOpen
            ? 'bg-blue-50 border-[#0E62E4] text-[#0E62E4]'
            : 'bg-[#F8FAFC] border-[#E2ECF9] hover:bg-slate-100'
        }`}
        aria-label="Open notifications"
        aria-expanded={isDropdownOpen}
      >
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#17334F]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#EF4444] text-white text-[9.5px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu — Portaled to document.body to avoid header backdrop-filter clipping & left-side offset */}
      {mounted && isDropdownOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Full-screen backdrop covering the entire viewport */}
          <div
            className="fixed inset-0 z-[9990] bg-black/30 md:bg-transparent backdrop-blur-[1px] md:backdrop-blur-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close notifications"
          />

          <div
            ref={containerRef}
            style={!coords.isMobile ? { top: coords.top, right: coords.right } : undefined}
            className={
              coords.isMobile
                ? "fixed z-[9995] top-16 left-3 right-3 max-w-[360px] mx-auto bg-white rounded-2xl border border-[#E2ECF9] shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-3 animate-fadeIn font-sans"
                : "fixed z-[9995] w-[350px] bg-white rounded-2xl border border-[#E2ECF9] shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-3 animate-fadeIn font-sans"
            }
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E7EEF8]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#14304A]">Notifications</h3>
                  <p className="text-[10px] text-[#4F6D87]">
                    {unreadCount > 0 ? `${unreadCount} new updates` : 'All caught up'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Sound toggle */}
                <button
                  onClick={toggleSound}
                  title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
                  className="p-1 rounded-md text-[#64748B] hover:text-[#0E62E4] hover:bg-slate-100 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Mark all as read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-semibold text-[#0E62E4] hover:underline px-1.5 py-0.5"
                  >
                    Mark read
                  </button>
                )}

                {/* Visible Close Button */}
                <button
                  onClick={handleClose}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-0.5"
                  title="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification items — compact list */}
            <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all text-xs ${
                    item.type === 'matrix_leader_offer'
                      ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border-blue-300 shadow-xs'
                      : item.priority
                      ? 'bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-300 shadow-xs'
                      : item.read
                      ? 'bg-[#F8FAFC] border-[#E8EFF8]'
                      : 'bg-[#EFF6FF]/70 border-[#0E62E4]/25 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Icon */}
                    <div
                      className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                        item.type === 'matrix_leader_offer'
                          ? 'bg-[#071A4A] text-white shadow-xs'
                          : item.type === 'retopup_alert'
                          ? 'bg-amber-600 text-white animate-pulse'
                          : item.priority
                          ? 'bg-amber-500 text-white'
                          : item.type === 'pool_dividend'
                          ? 'bg-emerald-500 text-white'
                          : item.type === 'matrix_launch'
                          ? 'bg-[#0E62E4] text-white'
                          : 'bg-indigo-500 text-white'
                      }`}
                    >
                      {item.type === 'matrix_leader_offer' ? (
                        <GitBranch className="w-3.5 h-3.5 text-[#93C5FD]" />
                      ) : item.type === 'retopup_alert' ? (
                        <Zap className="w-3 h-3 fill-white" />
                      ) : item.priority ? (
                        <Crown className="w-3 h-3" />
                      ) : item.type === 'pool_dividend' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : item.type === 'matrix_launch' ? (
                        <Layers className="w-3 h-3" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`font-bold text-[11px] truncate ${
                            item.type === 'matrix_leader_offer'
                              ? 'text-[#071A4A]'
                              : item.priority || item.type === 'retopup_alert'
                              ? 'text-amber-900'
                              : 'text-[#14304A]'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[9px] text-[#64748B] shrink-0 font-medium">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-[#4F6D87] leading-relaxed mb-1.5">
                        {item.message}
                      </p>

                      {/* Action buttons */}
                      {item.type === 'retopup_alert' && item.actionLabel ? (
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              handleClose();
                              window.dispatchEvent(
                                new CustomEvent('dao:open-retopup', {
                                  detail: { seatPosition: item.seatTarget || userSeat },
                                })
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10.5px] font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <Zap className="w-3 h-3 fill-white" />
                            <span>{item.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <Link
                            href="/dao/lounge"
                            onClick={handleClose}
                            className="text-[10.5px] font-semibold text-amber-800 hover:underline px-1"
                          >
                            Lounge
                          </Link>
                        </div>
                      ) : item.actionUrl ? (
                        item.actionUrl.startsWith('http') ? (
                          <a
                            href={item.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleClose}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#071A4A] hover:bg-[#155EEF] text-white text-[10.5px] font-bold shadow-xs transition-colors mt-0.5 cursor-pointer"
                          >
                            <span>{item.actionLabel || 'Proceed to Matrix'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            href={item.actionUrl}
                            onClick={handleClose}
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#0E62E4] hover:underline"
                          >
                            <span>{item.actionLabel || 'View details'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-2.5 pt-2 border-t border-[#E7EEF8] flex items-center justify-between text-[10px] text-[#64748B] px-1">
              <Link
                href="/dao/settings?tab=notifications"
                onClick={handleClose}
                className="text-[#0E62E4] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Notification Settings</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </Link>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
