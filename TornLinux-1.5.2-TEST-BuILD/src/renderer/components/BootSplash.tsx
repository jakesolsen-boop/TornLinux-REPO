import React from 'react';
import logoSrc from '../assets/brand/tornlinux_logo_circle.png';

export function BootSplash({ version }: { version: string }) {
  return (
    <div className="tls-splashRoot" aria-label="TornLinux splash screen">
      <div className="tls-splashBackdrop" />
      <div className="tls-splashGrid" />
      <div className="tls-splashGlow tls-splashGlow--left" />
      <div className="tls-splashGlow tls-splashGlow--right" />

      <div className="tls-splashCore">
        <div className="tls-splashSeal">
          <div className="tls-splashSeal__halo" />
          <img className="tls-splashSeal__img" src={logoSrc} alt="" width={164} height={164} />
        </div>

        <div className="tls-splashText">
          <div className="tls-splashEyebrow">Initializing command center</div>
          <h1 className="tls-splashTitle">TornLinux</h1>
          <p className="tls-splashSubtitle">Purpose-built game appliance booting into the Torn surface.</p>
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
