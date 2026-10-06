export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface DeviceInfo {
  type: DeviceType;
  hasTouch: boolean;
  isCoarsePointer: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      hasTouch: false,
      isCoarsePointer: false,
      isPortrait: false,
      screenWidth: 1280,
      screenHeight: 800,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isPortrait = height > width;

  // Check touch capabilities
  const hasTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error msMaxTouchPoints legacy
    navigator.msMaxTouchPoints > 0;

  // Use modern CSS media queries for coarse pointer (typical of touchscreens without mouse)
  const isCoarsePointer =
    window.matchMedia?.('(pointer: coarse)').matches ?? false;

  const userAgent = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTabletUA = /iPad|Tablet|(Android(?!.*Mobile))/i.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS

  let type: DeviceType = 'desktop';

  if (isMobileUA || (isCoarsePointer && width < 768)) {
    type = 'mobile';
  } else if (isTabletUA || (isCoarsePointer && width >= 768 && width <= 1024)) {
    type = 'tablet';
  } else if (width < 640 && hasTouch) {
    type = 'mobile';
  } else if (width < 1024 && hasTouch && isCoarsePointer) {
    type = 'tablet';
  } else {
    type = 'desktop';
  }

  return {
    type,
    hasTouch,
    isCoarsePointer,
    isPortrait,
    screenWidth: width,
    screenHeight: height,
  };
}
