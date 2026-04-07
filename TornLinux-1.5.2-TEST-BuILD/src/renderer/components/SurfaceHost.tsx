import React, { useEffect, useRef } from 'react';
import { ALLOWED_EMBED_HOSTS } from '@shared/webview-policy';

function isAllowedEmbedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (url.protocol === 'https:' || url.protocol === 'http:') && ALLOWED_EMBED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

function isTornUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.hostname === 'www.torn.com';
  } catch {
    return false;
  }
}

type TornMainContentMode = {
  hiddenSelectors?: string[];
  fullWidthSelectors?: string[];
  pagePadding?: string;
  extraCss?: string;
};

const DEFAULT_TORN_MAIN_CONTENT_MODE: TornMainContentMode = {
  hiddenSelectors: [
    '#header-root',
    '#sidebarroot',
    '.content-title',
    '.footer',
    '#react-profile-mini-root',
    '#go-to-top-btn-root',
    '.tutorial-cont',
    '.links-top-wrap',
    '.page-head-delimiter',
    '.wai',
    '.content > .container > script',
    '.content > .container > link',
  ],
  fullWidthSelectors: [
    '.content',
    '.content.responsive-sidebar-container.logged-in',
    '#mainContainer',
    '.content-wrapper.spring',
    '.content-wrapper[role="main"]',
  ],
  pagePadding: '16px',
};

const PAGE_OVERRIDES: Record<string, TornMainContentMode> = {
  '/bigalgunshop.php': {
    fullWidthSelectors: [
      '.owner-cont.big-al',
      '.buy-items-wrap',
      '.sell-items-wrap',
      '.sell-items-complete',
      '.delimiter-999',
    ],
  },
};

function buildTornMainContentScript(rawUrl: string) {
  const url = new URL(rawUrl);
  const override = PAGE_OVERRIDES[url.pathname] || {};
  const hiddenSelectors = [...(DEFAULT_TORN_MAIN_CONTENT_MODE.hiddenSelectors || []), ...(override.hiddenSelectors || [])];
  const fullWidthSelectors = [...(DEFAULT_TORN_MAIN_CONTENT_MODE.fullWidthSelectors || []), ...(override.fullWidthSelectors || [])];
  const pagePadding = override.pagePadding || DEFAULT_TORN_MAIN_CONTENT_MODE.pagePadding || '16px';
  const extraCss = override.extraCss || '';

  return `
(() => {
  const styleId = 'tornlinux-main-content-mode';
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = \`
    html, body {
      background: #191919 !important;
      overflow: auto !important;
    }

    ${hiddenSelectors.join(',\n    ')} {
      display: none !important;
    }

    ${fullWidthSelectors.join(',\n    ')} {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: none !important;
      min-height: 100vh !important;
    }

    .content {
      background: transparent !important;
    }

    #mainContainer {
      display: block !important;
    }

    .content-wrapper[role="main"] {
      box-sizing: border-box !important;
      padding: ${pagePadding} !important;
      visibility: visible !important;
    }

    ${extraCss}
  \`;
  document.head.appendChild(style);
})();
`;
}

export function SurfaceHost({ title, src }: { title: string; src: string; }) {
  const webviewRef = useRef<any>(null);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview || !isTornUrl(src)) return;
    const script = buildTornMainContentScript(src);

    const injectMainContentMode = () => {
      void webview.executeJavaScript(script).catch(() => undefined);
    };

    webview.addEventListener('dom-ready', injectMainContentMode);
    webview.addEventListener('did-navigate', injectMainContentMode);
    webview.addEventListener('did-navigate-in-page', injectMainContentMode);

    return () => {
      webview.removeEventListener('dom-ready', injectMainContentMode);
      webview.removeEventListener('did-navigate', injectMainContentMode);
      webview.removeEventListener('did-navigate-in-page', injectMainContentMode);
    };
  }, [src]);

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
      <webview ref={webviewRef} className="surface-host__webview" src={src} partition="persist:tornlinux" />
    </div>
  );
}
