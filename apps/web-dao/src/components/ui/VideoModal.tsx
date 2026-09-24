'use client';

import React, { useEffect, useRef } from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  videoSrc?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  title = 'A Clearer Look at EQUORA Network',
  videoSrc = '/assets/equora_overview.mp4',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      // Auto-play when opened
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.25)] z-10 animate-scaleUp">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-brand-light text-brand">
              <Play className="w-5 h-5 fill-current" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-sora text-navy">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentic Video Player */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-inter">
          <span>PEOPLE • PROJECTS • POSSIBILITIES</span>
          <span className="text-brand font-semibold">EQUORA_Fi Official Protocol Briefing</span>
        </div>
      </div>
    </div>
  );
};
