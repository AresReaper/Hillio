import { useState, useEffect } from 'react';

export type PerformanceTier = 'high' | 'medium' | 'low';

export interface DeviceCapabilities {
  tier: PerformanceTier;
  reducedMotion: boolean;
  isMobile: boolean;
  canHover: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    tier: 'medium',
    reducedMotion: false,
    isMobile: false,
    canHover: true
  });

  useEffect(() => {
    // 1. Reduced Motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Mobile/Viewport
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;

    // 3. Pointer/Hover Support
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // 4. Hardware details (when available)
    // @ts-ignore
    const deviceMemory = navigator.deviceMemory || 4; // defaults to 4GB if not supported
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    // Determine performance tier
    let tier: PerformanceTier = 'high';

    if (prefersReducedMotion || isMobileViewport || deviceMemory <= 4 || hardwareConcurrency < 4) {
      tier = 'low';
    } else if (deviceMemory < 8 || hardwareConcurrency < 8) {
      tier = 'medium';
    }

    setCapabilities({
      tier,
      reducedMotion: prefersReducedMotion,
      isMobile: isMobileViewport || isCoarsePointer,
      canHover: hasHover
    });
  }, []);

  return capabilities;
}
