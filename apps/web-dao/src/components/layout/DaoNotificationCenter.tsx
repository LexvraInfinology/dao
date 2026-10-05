'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { playNotificationChime, playPriorityAlertChime } from '@/utils/soundEffects';

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
}

export const DaoNotificationCenter: React.FC<DaoNotificationCenterProps> = ({
  userSeat,
  userAddress,
  onOpenMatrixModal,
}) => {
  const [open, setOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('equora_notification_sound') !== 'false';
  });
  const [notifications, setNotifications] = useState<DaoNotification[]>([]);
  const [hasPlayedInitial, setHasPlayedInitial] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize notifications dynamically based on user's seat position
  useEffect(() => {
    const list: DaoNotification[] = [];

    // 1. Root Matrix Leader waterfall priority for Seats 1–10 (Temporarily hidden as per user request)
    /*
    if (userSeat && userSeat >= 1 && userSeat <= 10) {
      list.push({
        id: `root_leader_offer_${userSeat}`,
        type: 'matrix_leader_offer',
        title: `Apex Matrix Root Opportunity (Seat #${userSeat})`,
        message: `As Council Seat #${userSeat}, you have priority right to claim the Apex Matrix Root Leader (Slot 1, $30 USD in TROB) before it passes to Seat #${userSeat + 1}.`,
        timestamp: 'Just now',
        read: false,
        priority: true,
        actionLabel: 'Claim Root Spot ($30)',
        seatTarget: userSeat,
      });
    } else if (userSeat && userSeat > 10) {
      // For subsequent / last members: opportunity display
      list.push({
        id: 'matrix_subsequent_member',
        type: 'matrix_launch',
        title: 'Matrix Opportunity Ready',
        message: 'Your personal downline spillover tree graph unlocks on Day 22. Prepare your $30 TROB allocation.',
        timestamp: '15m ago',
        read: false,
        actionUrl: '/dao/matrix-bridge',
        actionLabel: 'Inspect Matrix Tree',
      });
    }
    */

    // 2. 35% Global Protocol Pool Push
    list.push({
      id: 'pool_push_35',
      type: 'pool_dividend',
      title: '35% Protocol Value Pool Active',
      message: 'From the 4 automated protocol pools, 35% of all downstream Matrix volume routes directly to active DAO member wallets.',
      timestamp: '1h ago',
      read: false,
      actionUrl: '/dao/treasury',
      actionLabel: 'View Treasury',
    });

    // 3. Matrix Launch Countdown alert (Temporarily hidden as per user request)
    /*
    list.push({
      id: 'matrix_bridge_status',
      type: 'matrix_launch',
      title: 'Day 22 Retail Matrix Ready',
      message: 'Retail Matrix registration and spillover tree graphs go live at countdown expiry.',
      timestamp: '2h ago',
      read: true,
      actionUrl: '/dao/matrix-bridge',
      actionLabel: 'Countdown Status',
    });
    */

    // 4. Council Queue Update
    list.push({
      id: 'queue_update_p2p',
      type: 'queue_update',
      title: 'Genesis Council Queue Active',
      message: '2 / 100 Seats claimed on TrobChain. Instant 300/N cashbacks and downstream dividends active.',
      timestamp: '3h ago',
      read: true,
      actionUrl: '/dao/seats',
      actionLabel: 'View Council Grid',
    });

    setNotifications(list);

    // 0. Check for 48h Retopup & 5X Cap ($1,500 USD) Alert for active wallet
    if (userAddress) {
      fetch(`/api/dao/lounge/${encodeURIComponent(userAddress)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const d = json.data;
            if (d.isCapped || d.retopupDeadline) {
              const seatPos = d.position || userSeat || 1;
              const cashback = d.retopupCashbackUsd ?? (300 / seatPos).toFixed(2);
              const isExpired = d.isExpired;

              const retopupItem: DaoNotification = {
                id: `retopup_alert_${userAddress}`,
                type: 'retopup_alert',
                title: isExpired
                  ? `Seat #${seatPos} Vacated (48h Expired)`
                  : `5X Cap ($1,500 USD) Reached — 48h Retopup Active (Seat #${seatPos})`,
                message: isExpired
                  ? `The 48-hour re-topup deadline has expired without payment. Seat #${seatPos} is now vacant and open for others to claim.`
                  : `You've reached the 5X Cap ($1,500 USD). Re-topup $300 USD within 48 hours to secure your seat, reset your cap to zero, and receive your instant blockchain cashback loop (+${cashback} USD).`,
                timestamp: isExpired ? 'Expired' : 'URGENT (48h)',
                read: false,
                priority: !isExpired,
                actionLabel: isExpired ? undefined : `Re-topup Seat #${seatPos} ($300)`,
                seatTarget: seatPos,
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
    if (!open) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

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
      // Do not display matrix opportunity notifications as per user request
      if (
        newNotif.type === 'matrix_leader_offer' ||
        newNotif.type === 'matrix_launch' ||
        newNotif.title?.toLowerCase().includes('matrix opportunity')
      ) {
        return;
      }
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
        onClick={() => {
          setOpen((v) => !v);
          if (!open && soundEnabled) {
            playNotificationChime();
          }
        }}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F8FAFC] border border-[#E2ECF9] text-[#60739A] hover:text-[#071A4A] hover:bg-slate-100 flex items-center justify-center transition-all shadow-xs"
        aria-label="Open notifications"
      >
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#17334F]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#EF4444] text-white text-[9.5px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/25 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none cursor-pointer"
            onClick={() => setOpen(false)}
          />

          <div
            ref={containerRef}
            className="fixed sm:absolute left-2.5 right-2.5 sm:left-auto sm:right-0 top-14 sm:top-[calc(100%+8px)] z-50 w-auto sm:w-[390px] max-w-[calc(100vw-20px)] bg-white rounded-2xl border border-[#E2ECF9] shadow-[0_20px_50px_rgba(15,23,42,0.18)] p-3 animate-fadeIn font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E7EEF8]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#0E62E4] flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#14304A]">Notifications & Alerts</h3>
                  <p className="text-[10px] text-[#4F6D87]">
                    {unreadCount > 0 ? `${unreadCount} new updates` : 'All updates up to date'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
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

                <button
                  onClick={() => setOpen(false)}
                  className="sm:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification items */}
            <div className="mt-2.5 space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    item.priority
                      ? 'bg-gradient-to-br from-amber-50/80 to-amber-100/40 border-amber-300/80 shadow-xs'
                      : item.read
                      ? 'bg-[#F8FAFC] border-[#E8EFF8]'
                      : 'bg-[#EFF6FF]/70 border-[#0E62E4]/25 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                        item.type === 'retopup_alert'
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white animate-pulse'
                          : item.priority
                          ? 'bg-amber-500 text-white'
                          : item.type === 'pool_dividend'
                          ? 'bg-emerald-500 text-white'
                          : item.type === 'matrix_launch'
                          ? 'bg-[#0E62E4] text-white'
                          : 'bg-indigo-500 text-white'
                      }`}
                    >
                      {item.type === 'retopup_alert' ? (
                        <Zap className="w-4 h-4 fill-white" />
                      ) : item.priority ? (
                        <Crown className="w-4 h-4" />
                      ) : item.type === 'pool_dividend' ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : item.type === 'matrix_launch' ? (
                        <Layers className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`font-bold text-[11px] truncate ${
                            item.priority || item.type === 'retopup_alert' ? 'text-amber-900' : 'text-[#14304A]'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[9.5px] text-[#64748B] shrink-0 font-medium">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#4F6D87] leading-relaxed mb-2">
                        {item.message}
                      </p>

                      {/* Action buttons */}
                      {item.type === 'retopup_alert' && item.actionLabel ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              window.dispatchEvent(
                                new CustomEvent('dao:open-retopup', {
                                  detail: { seatPosition: item.seatTarget || userSeat },
                                })
                              );
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>{item.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <Link
                            href="/dao/lounge"
                            onClick={() => setOpen(false)}
                            className="text-[11px] font-semibold text-amber-800 hover:underline px-1.5"
                          >
                            View Lounge
                          </Link>
                        </div>
                      ) : item.type === 'matrix_leader_offer' && item.actionLabel ? (
                        <div className="flex items-center gap-2 pt-1">
                          <Link
                            href="/dao/matrix-bridge"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                          >
                            <span>{item.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                          <button
                            onClick={(e) => handlePassRootOffer(item.id, e)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold transition-colors"
                          >
                            Pass Offer
                          </button>
                        </div>
                      ) : item.actionUrl ? (
                        <Link
                          href={item.actionUrl}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E62E4] hover:underline"
                        >
                          <span>{item.actionLabel || 'View details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-2.5 pt-2 border-t border-[#E7EEF8] flex items-center justify-between text-[10px] text-[#64748B] px-1">
              <span>Real-time TrobChain Event Listener</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
