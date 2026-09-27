'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Landmark,
  Award,
  ExternalLink,
  BarChart2,
  ShieldCheck,
  Megaphone,
  ArrowLeftRight,
  Crown,
  Check,
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { useUserSettings, saveUserSettings, UserSettingsData } from '@/hooks/useApi';

type NotifKey =
  | 'notifDaoActivity'
  | 'notifGovernance'
  | 'notifCouncilSeat'
  | 'notifMatrixBridge'
  | 'notifProtocolUpdates'
  | 'notifSecurityAlerts'
  | 'notifMarketingEvents';

const DEFAULT_NOTIFS: Record<NotifKey, boolean> = {
  notifDaoActivity:     true,
  notifGovernance:      true,
  notifCouncilSeat:     true,
  notifMatrixBridge:    true,
  notifProtocolUpdates: true,
  notifSecurityAlerts:  true,
  notifMarketingEvents: true,
};

export default function NotificationSettingsCard() {
  const auth = useAuthContext();
  const { data: settings, loading } = useUserSettings(auth.token);

  // Local state — initialised from backend data
  const [toggles, setToggles] = useState<Record<NotifKey, boolean>>(DEFAULT_NOTIFS);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate local state from loaded settings
  useEffect(() => {
    if (!settings) return;
    setToggles({
      notifDaoActivity:     settings.notifDaoActivity,
      notifGovernance:      settings.notifGovernance,
      notifCouncilSeat:     settings.notifCouncilSeat,
      notifMatrixBridge:    settings.notifMatrixBridge,
      notifProtocolUpdates: settings.notifProtocolUpdates,
      notifSecurityAlerts:  settings.notifSecurityAlerts,
      notifMarketingEvents: settings.notifMarketingEvents,
    });
  }, [settings]);

  // Persist a single toggle change after a short debounce
  const handleToggle = (key: NotifKey) => {
    const newValue = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: newValue }));

    if (!auth.token) return;

    // Debounce: cancel previous save timer, fire new one after 600ms
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveUserSettings({ [key]: newValue }, auth.token!);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        // Silently revert on error
        setToggles((prev) => ({ ...prev, [key]: !newValue }));
      }
    }, 600);
  };

  const desktopItems: { key: NotifKey; icon: React.ReactNode; title: string; subtitle: string }[] = [
    {
      key: 'notifDaoActivity',
      icon: <Mail className="w-5 h-5 text-[#155EEF]" />,
      title: 'DAO Activity',
      subtitle: 'Seat distributions, treasury updates and important DAO activity',
    },
    {
      key: 'notifGovernance',
      icon: <Landmark className="w-5 h-5 text-[#155EEF]" />,
      title: 'Governance',
      subtitle: 'New proposals, voting updates and governance decisions.',
    },
    {
      key: 'notifCouncilSeat',
      icon: <Award className="w-5 h-5 text-[#155EEF]" />,
      title: 'Council Seat',
      subtitle: 'Updates related to your council seat and seat activity.',
    },
    {
      key: 'notifMatrixBridge',
      icon: <ExternalLink className="w-5 h-5 text-[#155EEF]" />,
      title: 'Matrix Bridge',
      subtitle: "Updates about the DAO's connection with the retail ecosystem",
    },
    {
      key: 'notifProtocolUpdates',
      icon: <BarChart2 className="w-5 h-5 text-[#155EEF]" />,
      title: 'Protocol Updates',
      subtitle: 'New features, platform announcements and improvements.',
    },
    {
      key: 'notifSecurityAlerts',
      icon: <ShieldCheck className="w-5 h-5 text-[#155EEF]" />,
      title: 'Security Alerts',
      subtitle: 'Login attempts, wallet changes and security notifications.',
    },
    {
      key: 'notifMarketingEvents',
      icon: <Megaphone className="w-5 h-5 text-[#155EEF]" />,
      title: 'Marketing & Events',
      subtitle: 'Product updates, events and community announcements.',
    },
  ];

  const mobileItems: { key: NotifKey; icon: React.ReactNode; title: string; subtitle: string }[] = [
    {
      key: 'notifGovernance',
      icon: <Landmark className="w-4 h-4 text-[#155EEF]" />,
      title: 'Governance',
      subtitle: 'New proposals, voting updates & quorum alerts.',
    },
    {
      key: 'notifMatrixBridge',
      icon: <ArrowLeftRight className="w-4 h-4 text-[#155EEF]" />,
      title: 'Matrix Bridge',
      subtitle: 'Updates on matrix progress & cross-ecosystem routing.',
    },
    {
      key: 'notifProtocolUpdates',
      icon: <BarChart2 className="w-4 h-4 text-[#155EEF]" />,
      title: 'Protocol Updates',
      subtitle: 'New features, platform announcements & releases.',
    },
    {
      key: 'notifSecurityAlerts',
      icon: <ShieldCheck className="w-4 h-4 text-[#155EEF]" />,
      title: 'Security Alerts',
      subtitle: 'Login attempts, contract approvals & security alerts.',
    },
    {
      key: 'notifDaoActivity',
      icon: <Mail className="w-4 h-4 text-[#155EEF]" />,
      title: 'DAO Activity',
      subtitle: 'Seat distributions, treasury updates & activity.',
    },
    {
      key: 'notifCouncilSeat',
      icon: <Crown className="w-4 h-4 text-[#155EEF]" />,
      title: 'Council Seat',
      subtitle: 'Updates related to your council seat and status.',
    },
    {
      key: 'notifMarketingEvents',
      icon: <Megaphone className="w-4 h-4 text-[#155EEF]" />,
      title: 'Marketing & Events',
      subtitle: 'Community AMAs, global summits & live events.',
    },
  ];

  const Toggle = ({
    keyName,
    checked,
    onToggle,
    label,
  }: {
    keyName: string;
    checked: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 cursor-pointer disabled:opacity-60 ${
        checked ? 'bg-[#155EEF]' : 'bg-[#CBD5E1]'
      }`}
      aria-label={`Toggle ${label}`}
    >
      <span
        className={`block w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <>
      {/* ================= DESKTOP NOTIFICATION SETTINGS (lg:block) ================= */}
      <div className="hidden lg:block rounded-3xl bg-white border border-[#E2ECF9] p-7 shadow-[0_4px_25px_rgba(21,94,239,0.03)] font-jakarta space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#071A4A]">
              Notification Settings
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Choose what updates you want to receive.
              {!auth.token && (
                <span className="ml-1 text-amber-600 font-medium">(Sign in to persist settings)</span>
              )}
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0]/60 px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        {/* 7 Toggle Rows */}
        <div className="space-y-3 pt-1">
          {desktopItems.map((item) => (
            <div
              key={item.key}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-5 py-4 flex items-center justify-between transition-colors hover:border-[#E2ECF9]"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#071A4A]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Switch */}
              <Toggle
                keyName={item.key}
                checked={toggles[item.key]}
                onToggle={() => handleToggle(item.key)}
                label={item.title}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= MOBILE NOTIFICATION SETTINGS (lg:hidden) ================= */}
      <div className="lg:hidden rounded-2xl bg-white border border-[#E2ECF9] p-5 shadow-xs font-jakarta space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#071A4A]">
              Notification Settings
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Choose what updates you want to receive.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669]">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        {/* 7 Toggle Rows */}
        <div className="space-y-2.5 pt-1">
          {mobileItems.map((item) => (
            <div
              key={item.key}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-3 flex items-center justify-between"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#071A4A]">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Switch */}
              <Toggle
                keyName={item.key}
                checked={toggles[item.key]}
                onToggle={() => handleToggle(item.key)}
                label={item.title}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
