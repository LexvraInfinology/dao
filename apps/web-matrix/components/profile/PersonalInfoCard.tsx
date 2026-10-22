"use client";

import React, { useState } from "react";
import { MatrixUserProfile } from "@/lib/api";
import { useUserStore } from "@/lib/stores";
import { toast } from "@/lib/toast";

export interface PersonalInfoCardProps {
  profile?: MatrixUserProfile | null;
  onSaveProfile?: (data: { username?: string; bio?: string; telegram?: string; twitter?: string }) => Promise<void>;
}

export function PersonalInfoCard({ profile: propProfile, onSaveProfile: propOnSave }: PersonalInfoCardProps) {
  const storeProfile = useUserStore((s) => s.profile);
  const storeUpdateProfile = useUserStore((s) => s.updateProfile);

  const profile = propProfile !== undefined ? propProfile : storeProfile;
  const onSaveProfile = propOnSave || (async (data: { username?: string; bio?: string; telegram?: string; twitter?: string }) => {
    await storeUpdateProfile(data);
  });
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [telegram, setTelegram] = useState(profile?.telegram || "");
  const [twitter, setTwitter] = useState(profile?.twitter || "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setTelegram(profile.telegram || "");
      setTwitter(profile.twitter || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!onSaveProfile) return;
    setSaving(true);
    try {
      await onSaveProfile({ username, bio, telegram, twitter });
      toast.success("Profile Updated", "Your operative details have been saved.");
      setIsEditing(false);
    } catch (e) {
      toast.error("Profile Update Failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="personal-info-card" className="bg-white rounded-[22px] border border-[#e8ecf1] p-4 sm:p-5 lg:p-6 shadow-xs w-full min-w-0 scroll-mt-20">
      <div className="min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f1f5f9]">
          <h2 className="text-[15.5px] font-bold text-[#0f172a]">Personal Information</h2>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1 rounded-lg bg-[#eff6ff] text-[12px] font-semibold text-[#2563eb] hover:bg-[#dbeafe] transition-colors cursor-pointer flex-shrink-0"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-[#64748b] uppercase">Handle / Nickname</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-[#e2e8f0] text-[13px] text-[#0f172a] focus:ring-2 focus:ring-[#2563eb]/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#64748b] uppercase">Telegram</label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-[#e2e8f0] text-[13px] text-[#0f172a] focus:ring-2 focus:ring-[#2563eb]/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#64748b] uppercase">Twitter / X</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@username"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-[#e2e8f0] text-[13px] text-[#0f172a] focus:ring-2 focus:ring-[#2563eb]/20 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#2563eb] text-white text-[13px] font-bold hover:bg-[#1d4ed8] transition-colors"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Nickname */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 text-[#64748b] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="text-[12.5px] sm:text-[13px] font-medium">Operative Name</span>
              </div>
              <span className="text-[13px] sm:text-[13.5px] font-bold text-[#0f172a] text-right truncate">
                {profile?.username || "Operative"}
              </span>
            </div>

            {/* Telegram */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 text-[#64748b] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span className="text-[12.5px] sm:text-[13px] font-medium">Telegram</span>
              </div>
              <span className="text-[12px] sm:text-[13.5px] font-bold text-[#0f172a] text-right truncate">
                {profile?.telegram || "@equora_operative"}
              </span>
            </div>

            {/* Twitter */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 text-[#64748b] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
                <span className="text-[12.5px] sm:text-[13px] font-medium">Twitter / X</span>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#0f172a] text-right truncate">
                {profile?.twitter || "@equora_matrix"}
              </span>
            </div>

            {/* Sponsor ID */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 text-[#64748b] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="text-[12.5px] sm:text-[13px] font-medium">Sponsor ID</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[13px] sm:text-[13.5px] font-bold text-[#2563eb]">
                  {profile?.sponsorUserId ? `#${profile.sponsorUserId}` : "Genesis (Root)"}
                </span>
              </div>
            </div>

            {/* Date Joined */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 text-[#64748b] flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span className="text-[12.5px] sm:text-[13px] font-medium">Date Joined</span>
              </div>
              <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#0f172a] text-right truncate">
                {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : "Active"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
