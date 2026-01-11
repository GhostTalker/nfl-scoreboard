import { useEffect, useState } from 'react';
import { VIDEOS, PLACEHOLDER_VIDEOS, type CelebrationVideoType } from '../constants/videos';

// Global cache for preloaded video blob URLs
const videoCache: Map<string, string> = new Map();
let preloadStarted = false;
let preloadComplete = false;

// Preload a single video and return a blob URL
async function preloadVideo(src: string): Promise<string | null> {
  // Check if already cached
  if (videoCache.has(src)) {
    return videoCache.get(src)!;
  }

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    videoCache.set(src, blobUrl);
    console.log(`[VideoPreloader] Preloaded: ${src}`);
    return blobUrl;
  } catch (error) {
    console.warn(`[VideoPreloader] Failed to preload ${src}:`, error);
    return null;
  }
}

// Preload all videos
async function preloadAllVideos(onProgress?: (loaded: number, total: number) => void) {
  if (preloadStarted) return;
  preloadStarted = true;

  const videoTypes = Object.keys(VIDEOS) as CelebrationVideoType[];
  const allSources: string[] = [];

  // Collect all video sources (local + placeholders)
  for (const type of videoTypes) {
    // Local video
    allSources.push(VIDEOS[type].src);
    // Placeholder videos
    const placeholders = PLACEHOLDER_VIDEOS[type];
    if (placeholders) {
      allSources.push(...placeholders);
    }
  }

  // Remove duplicates
  const uniqueSources = [...new Set(allSources)];
  let loaded = 0;

  console.log(`[VideoPreloader] Starting preload of ${uniqueSources.length} videos...`);

  // Preload in parallel with concurrency limit
  const concurrency = 3;
  for (let i = 0; i < uniqueSources.length; i += concurrency) {
    const batch = uniqueSources.slice(i, i + concurrency);
    await Promise.all(batch.map(src => preloadVideo(src)));
    loaded += batch.length;
    onProgress?.(loaded, uniqueSources.length);
  }

  preloadComplete = true;
  console.log(`[VideoPreloader] Preload complete! ${videoCache.size} videos cached.`);
}

// Get cached blob URL for a video source
export function getCachedVideoUrl(src: string): string {
  return videoCache.get(src) || src;
}

// Check if a video is cached
export function isVideoCached(src: string): boolean {
  return videoCache.has(src);
}

// Hook to trigger preloading and track progress
export function useVideoPreloader() {
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(preloadComplete);

  useEffect(() => {
    if (preloadComplete) {
      setIsComplete(true);
      return;
    }

    preloadAllVideos((loaded, total) => {
      setProgress({ loaded, total });
    }).then(() => {
      setIsComplete(true);
    });
  }, []);

  return {
    isPreloading: !isComplete && progress.total > 0,
    isComplete,
    progress: progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0,
    loaded: progress.loaded,
    total: progress.total,
  };
}
