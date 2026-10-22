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
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Ambient Lighting Glow */}
      <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr from-blue-400/20 via-sky-300/20 to-amber-200/20 blur-2xl pointer-events-none" />

      {/* Clean Framed Video Card with Seamless Dual-Buffer Stack */}
      <div className="relative rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md p-1.5 sm:p-2 border border-white/90 shadow-[0_20px_45px_rgba(15,23,42,0.10),0_4px_16px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:scale-[1.01]">
        {/* Inner viewport container maintaining exact 9:16 aspect ratio */}
        <div className="relative aspect-[9/16] h-[350px] sm:h-[390px] md:h-[400px] lg:h-[450px] xl:h-[480px] max-h-[68vh] rounded-[20px] sm:rounded-[22px] overflow-hidden bg-slate-100">
          {/* Primary Video Element (Track A) */}
          <video
            ref={videoRefA}
            src="/hero_section.mp4"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ease-in-out ${
              activeVideo === "A" ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />

          {/* Secondary Video Element (Track B - Pre-buffers & seamless crossfade) */}
          <video
            ref={videoRefB}
            src="/hero_section.mp4"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ease-in-out ${
              activeVideo === "B" ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
});
