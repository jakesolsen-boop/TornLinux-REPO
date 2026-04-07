import type { LayoutMode } from './types';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface LayoutResult {
  resolvedMode: LayoutMode;
  splitAllowed: boolean;
  tornWidth: number;
  discordWidth: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computeAppLayout(
  viewport: ViewportSize,
  requestedMode: LayoutMode,
  requestedDiscordWidth: number,
): LayoutResult {
  const minTornWidth = 960;
  const minDiscordWidth = 340;
  const maxDiscordWidth = 640;
  const clampedDiscord = clamp(requestedDiscordWidth, minDiscordWidth, maxDiscordWidth);
  const splitAllowed = viewport.width >= minTornWidth + clampedDiscord;
  const resolvedMode: LayoutMode = requestedMode === 'split' && splitAllowed ? 'split' : 'torn';

  if (resolvedMode === 'torn') {
    return { resolvedMode, splitAllowed, tornWidth: viewport.width, discordWidth: 0 };
  }

  const maxAllowedByViewport = Math.max(minDiscordWidth, viewport.width - minTornWidth);
  const discordWidth = clamp(clampedDiscord, minDiscordWidth, Math.min(maxDiscordWidth, maxAllowedByViewport));
  const tornWidth = Math.max(minTornWidth, viewport.width - discordWidth);

  return { resolvedMode, splitAllowed, tornWidth, discordWidth: viewport.width - tornWidth };
}
