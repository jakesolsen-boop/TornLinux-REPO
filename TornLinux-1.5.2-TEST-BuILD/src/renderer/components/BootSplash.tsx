import React from 'react';

export function BootSplash({ version }: { version: string }) {
  return (
    <div className="tls-splashRoot" aria-label="TornLinux splash screen">
      <div className="tls-splashBackdrop" />
      <div className="tls-splashGrid" />
      <div className="tls-splashGlow tls-splashGlow--left" />
      <div className="tls-splashGlow tls-splashGlow--right" />

      <div className="tls-splashCore">
        <div className="tls-splashSeal">
          <div className="tls-splashSeal__ring" />
          <div className="tls-splashSeal__ring tls-splashSeal__ring--inner" />
          <div className="tls-splashSeal__mark">TL</div>
        </div>

        <div className="tls-splashText">
          <div className="tls-splashEyebrow">Boot sequence engaged</div>
          <h1 className="tls-splashTitle">TornLinux</h1>
          <p className="tls-splashSubtitle">Initializing game appliance surface and secure web shell.</p>
        </div>

        <div className="tls-splashPulse">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="tls-splashStamp">{version}</div>
    </div>
  );
}
