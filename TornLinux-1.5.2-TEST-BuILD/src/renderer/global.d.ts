import type { TornLinuxBridge } from '@shared/types';

declare global {
  interface Window {
    tornlinux?: TornLinuxBridge;
  }
}

export {};
