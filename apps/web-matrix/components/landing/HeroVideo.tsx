"use client";

import React, { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
  className?: string;
}

export const HeroVideo = React.memo(function HeroVideo({ className = "" }: HeroVideoProps) {
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<"A" | "B">("A");
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;
    if (!videoA || !videoB) return;

    videoA.defaultMuted = true;
    videoA.muted = true;
    videoB.defaultMuted = true;
    videoB.muted = true;

    // Initialize playback on primary video
    const startInitialPlay = () => {
      videoA.play().catch(() => {
        const handleInteraction = () => {
          videoA.play().catch(() => {});
          window.removeEventListener("click", handleInteraction);
          window.removeEventListener("touchstart", handleInteraction);
        };
        window.addEventListener("click", handleInteraction, { once: true });
        window.addEventListener("touchstart", handleInteraction, { once: true });
      });
    };

    if (videoA.readyState >= 2) {
      startInitialPlay();
    } else {
      videoA.addEventListener("canplay", startInitialPlay, { once: true });
    }

    // Microsecond-accurate animation frame loop to crossfade before EOF black flash
    let animationFrameId: number;
    let currentActive: "A" | "B" = "A";

    const checkLoopTransition = () => {
      const activeEl = currentActive === "A" ? videoA : videoB;
      const nextEl = currentActive === "A" ? videoB : videoA;

      if (
        activeEl.duration &&
        !isTransitioningRef.current &&
        activeEl.currentTime >= activeEl.duration - 0.28
      ) {
        isTransitioningRef.current = true;
        const nextId = currentActive === "A" ? "B" : "A";

        // Pre-seek next video to start and trigger playback
        nextEl.currentTime = 0;
        nextEl
          .play()
          .then(() => {
            currentActive = nextId;
            setActiveVideo(nextId);

            // Once crossfade has transitioned, reset the previous video
            setTimeout(() => {
              activeEl.pause();
              activeEl.currentTime = 0;
              isTransitioningRef.current = false;
            }, 300);
          })
          .catch(() => {
            isTransitioningRef.current = false;
          });
      }

      animationFrameId = requestAnimationFrame(checkLoopTransition);
    };

    animationFrameId = requestAnimationFrame(checkLoopTransition);

    return () => {
      cancelAnimationFrame(animationFrameId);
      videoA.removeEventListener("canplay", startInitialPlay);
    };
  }, []);

  return (
    <div className={`relative w-full flex items-center justify-center select-none ${className}`}>
      {/* Ambient Lighting Glow */}
      <div className="absolute -inset-4 sm:-inset-8 rounded-full bg-gradient-to-tr from-blue-400/25 via-sky-300/20 to-amber-200/20 blur-3xl pointer-events-none" />

      {/* Transparent Borderless Video Display - Wide & Immersive (No Corners / No Border Frame) */}
      <div className="relative w-full max-w-full sm:max-w-[460px] md:max-w-[510px] lg:max-w-[570px] xl:max-w-[620px] aspect-[4/5] flex items-center justify-center overflow-hidden">
        {/* Primary Video Element (Track A) */}
        <video
          ref={videoRefA}
          src="/hero_section.mp4"
          poster="/hero-character-cropped.png"
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          className={`absolute inset-0 w-full h-full object-cover object-top pointer-events-none drop-shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-opacity duration-300 ease-in-out ${
            activeVideo === "A" ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />

        {/* Secondary Video Element (Track B - Pre-buffers & seamless crossfade) */}
        <video
          ref={videoRefB}
          src="/hero_section.mp4"
          poster="/hero-character-cropped.png"
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          className={`absolute inset-0 w-full h-full object-cover object-top pointer-events-none drop-shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-opacity duration-300 ease-in-out ${
            activeVideo === "B" ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        />

        {/* Seamless Soft Fade at the very bottom into the mountain landscape */}
        <div className="absolute inset-x-0 bottom-0 h-10 sm:h-16 bg-gradient-to-t from-[#f1f5f9]/80 via-[#f1f5f9]/25 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
});
