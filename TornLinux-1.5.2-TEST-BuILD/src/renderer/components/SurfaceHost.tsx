import React from 'react';
import { ALLOWED_EMBED_HOSTS } from '@shared/webview-policy';

function isAllowedEmbedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (url.protocol === 'https:' || url.protocol === 'http:') && ALLOWED_EMBED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export function SurfaceHost({ title, src }: { title: string; src: string; }) {
  if (!isAllowedEmbedUrl(src)) {
    return (
      <div className="surface-host surface-host--blocked" data-title={title}>
        <div className="surface-blocked">
          <strong>Blocked by policy</strong>
          <span>{src}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-host" data-title={title}>
      <webview className="surface-host__webview" src={src} partition="persist:tornlinux" />
    </div>
  );
}
