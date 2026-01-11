import { useEffect, useRef } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { VIDEOS, PLACEHOLDER_VIDEOS } from '../../constants/videos';
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
  const placeholderVideos = PLACEHOLDER_VIDEOS[type];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Try to play local video, fallback to placeholder
    video.src = videoConfig.src;

    video.onerror = () => {
      // Fallback to placeholder video
      if (placeholderVideos && placeholderVideos.length > 0) {
        const randomIndex = Math.floor(Math.random() * placeholderVideos.length);
        video.src = placeholderVideos[randomIndex];
        video.play().catch(console.error);
      } else {
        // No video available, just close after duration
        timeoutRef.current = window.setTimeout(hideCelebration, videoConfig.duration);
      }
    };

    video.onended = () => {
      hideCelebration();
    };

    // Video starts muted (required for autoplay), then try to unmute
    video.play()
      .then(() => {
        // Playback started - try to unmute if user has volume enabled
        if (videoVolume > 0) {
          video.volume = videoVolume;
          video.muted = false;
        }
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
  }, [type, hideCelebration, videoVolume, videoConfig, placeholderVideos]);

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
      {/* Video - fullscreen, no overlay text */}
      {/* IMPORTANT: muted={true} is required for autoplay without user gesture */}
      {/* Browser policy blocks autoplay with sound unless user has clicked */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
    </div>
  );
}
