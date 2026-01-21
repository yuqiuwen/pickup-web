import { EventType } from '@/lib/constant';

export const EVENT_COLORS: Record<EventType, string> = {
  [EventType.ANNIVERSARY]: '#f43f5e', // rose-500
  [EventType.BIRTHDAY]: '#8b5cf6',    // violet-500
  [EventType.COUNTDOWN]: '#0ea5e9',   // sky-500
};

export const EVENT_BG_COLORS: Record<EventType, string> = {
  [EventType.ANNIVERSARY]: 'bg-rose-500',
  [EventType.BIRTHDAY]: 'bg-violet-500',
  [EventType.COUNTDOWN]: 'bg-sky-500',
};

export const EVENT_LIGHT_BG_COLORS: Record<EventType, string> = {
  [EventType.ANNIVERSARY]: 'bg-rose-50',
  [EventType.BIRTHDAY]: 'bg-violet-50',
  [EventType.COUNTDOWN]: 'bg-sky-50',
};

export function blendColors(colors: string[]): string {
  if (colors.length === 0) return '#e5e7eb';
  if (colors.length === 1) return colors[0];
  
  // 简单的颜色混合算法
  const rgbColors = colors.map(hexToRgb);
  const blended = rgbColors.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b,
    }),
    { r: 0, g: 0, b: 0 }
  );
  
  return rgbToHex({
    r: Math.round(blended.r / colors.length),
    g: Math.round(blended.g / colors.length),
    b: Math.round(blended.b / colors.length),
  });
}

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
    [EventType.ANNIVERSARY]: '#EC4899', // pink-500
    [EventType.BIRTHDAY]: '#F59E0B', // amber-500
    [EventType.COUNTDOWN]: '#3B82F6', // blue-500
  };

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function getHeatmapIntensity(eventCount: number): string {
  if (eventCount === 0) return 'bg-gray-100';
  if (eventCount === 1) return 'bg-green-200';
  if (eventCount === 2) return 'bg-green-300';
  if (eventCount === 3) return 'bg-green-400';
  return 'bg-green-500';
}