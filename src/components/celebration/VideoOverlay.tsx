import { useEffect, useRef } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { VIDEOS } from '../../constants/videos';
import { getCachedVideoUrl, isVideoCached } from '../../hooks/useVideoPreloader';
import type { CelebrationType } from '../../types/game';

interface VideoOverlayProps {
  type: CelebrationType;
}

export function VideoOverlay({ type }: VideoOverlayProps) {
  const hideCelebration = useUIStore((state) => state.hideCelebration);
  const videoVolume = useSettingsStore((state) => state.videoVolume);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const videoConfig = VIDEOS[type];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use cached video URL if available, otherwise use original source
    const localVideoSrc = getCachedVideoUrl(videoConfig.src);
    const isLocalCached = isVideoCached(videoConfig.src);

    // Try to play local video, fallback to placeholder
    video.src = localVideoSrc;

    video.onerror = () => {
      console.warn(`[VideoOverlay] Video failed to load: ${type}`);
      // Close immediately if video fails - don't show white screen
      hideCelebration();
    };

    video.onended = () => {
      hideCelebration();
    };

    // If video is cached (blob URL), it should be ready immediately
    // Video starts muted (required for autoplay), then try to unmute
    video.play()
      .then(() => {
        // Playback started - try to unmute if user has volume enabled
        if (videoVolume > 0) {
          video.volume = videoVolume;
          video.muted = false;
        }
        console.log(`[VideoOverlay] Playing ${type} video (cached: ${isLocalCached})`);
      })
      .catch((err) => {
        console.error('Video playback failed:', err);
        // Auto-close after duration if video fails
        timeoutRef.current = window.setTimeout(hideCelebration, videoConfig.duration);
      });

    // Fallback timeout in case video doesn't trigger onended
    timeoutRef.current = window.setTimeout(hideCelebration, videoConfig.duration + 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [type, hideCelebration, videoVolume, videoConfig]);

  // Allow tap/click to dismiss
  const handleDismiss = () => {
    hideCelebration();
  };

  // Also allow keyboard dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        hideCelebration();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hideCelebration]);

  return (
    <div
      className="video-overlay cursor-pointer"
      onClick={handleDismiss}
    >
      {/* Video in centered box overlay */}
      <div className="video-overlay-box">
        {/* IMPORTANT: muted={true} is required for autoplay without user gesture */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
      </div>
    </div>
  );
}
