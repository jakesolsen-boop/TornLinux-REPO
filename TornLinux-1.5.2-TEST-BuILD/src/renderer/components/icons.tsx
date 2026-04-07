import React from "react";

type IconProps = { className?: string; title?: string };

export const EnergyIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M13.4 3.5L8.1 12h4.2l-1.1 8.5l5.7-9h-4.3l.8-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

export const HappinessIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <circle cx="12" cy="12" r="7.4" stroke="currentColor" strokeWidth="1.7"/>
    <circle cx="9.4" cy="10.2" r="1" fill="currentColor"/>
    <circle cx="14.6" cy="10.2" r="1" fill="currentColor"/>
    <path d="M8.6 14.1C9.5 15.3 10.7 16 12 16c1.3 0 2.5-.7 3.4-1.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
);

export const NerveIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M7.4 11.8a3.9 3.9 0 1 1 5.2 3.7v2.1h1.7v1.6h1.6v1.6h1.8v-2l1.8-1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9.8" cy="10.2" r="1.2" fill="currentColor" />
    <path d="M16.8 8.6l2.8 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M18.2 7.2l2.1 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const LifeIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M12 20.3c-3.2-2.2-5.9-4.7-7.4-7.1c-1.9-3-.4-6.6 2.9-7c1.8-.2 3.5.7 4.5 2.1c1-1.4 2.7-2.3 4.5-2.1c3.3.4 4.8 4 2.9 7c-1.5 2.4-4.2 4.9-7.4 7.1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    <path d="M9 12h2l1-2.2l1.1 4.2l1-2h1.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LevelIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path fill="currentColor" d="M12 3.5 18.5 8v8L12 20.5 5.5 16V8L12 3.5Zm0 2.1L7.3 8.4v7.1l4.7 3.4 4.7-3.4V8.4L12 5.6Z"/>
    <path fill="currentColor" d="M9.2 12.5 12 9.8l2.8 2.7v2.1L12 17l-2.8-2.4v-2.1Z"/>
  </svg>
);

export const BankIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M4 9.2L12 4.8L20 9.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.4 10.6H18.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M7.3 10.6V17.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M12 10.6V17.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M16.7 10.6V17.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M4.8 19.2H19.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const TornStatsIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M5 18.5V11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 18.5V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M19 18.5V4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M3.5 19.5H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const SettingsIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6a3.8 3.8 0 0 0 0-7.6Z" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M19.2 12a7.7 7.7 0 0 0-.08-1.08l1.78-1.39l-1.7-2.95l-2.16.73a7.9 7.9 0 0 0-1.86-1.08l-.38-2.23h-3.4l-.38 2.23a7.9 7.9 0 0 0-1.86 1.08L4.8 6.58L3.1 9.53l1.78 1.39A7.7 7.7 0 0 0 4.8 12c0 .37.03.73.08 1.08L3.1 14.47l1.7 2.95l2.16-.73c.57.45 1.2.81 1.86 1.08l.38 2.23h3.4l.38-2.23c.66-.27 1.29-.63 1.86-1.08l2.16.73l1.7-2.95l-1.78-1.39c.05-.35.08-.71.08-1.08Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
);

export const StatusOnlineIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9.2 12.4l1.8 1.8l3.8-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const StatusHospitalIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <rect x="5" y="5" width="14" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8.2v7.6M8.2 12h7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const StatusJailIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <rect x="4.5" y="4.5" width="15" height="15" rx="2.2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9 7v10M12 7v10M15 7v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const StatusTravelIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M3.5 12.5h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M14.2 7.5l6.3 5l-6.3 4.7l1.1-3.2h-4.2l-2.2 3.1H6.7l1.1-3.1H3.5v-3h4.3L6.7 8h2.2l2.2 3.1h4.2z" fill="currentColor"/>
  </svg>
);

export const StatusOfflineIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const PlayerIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <circle cx="12" cy="8.2" r="3.2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M5.5 18.2c1.5-2.8 3.7-4.2 6.5-4.2s5 1.4 6.5 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export const NetworkStatusIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <circle cx="10" cy="14.2" r="1.4" fill="currentColor"/>
    <path d="M6.9 11.6C8.7 9.9 11.3 9.9 13.1 11.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M4.7 9.2C7.7 6.5 12.3 6.5 15.3 9.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M2.6 6.7C6.8 3.1 13.2 3.1 17.4 6.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

export const TimeTctIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 64 20" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path d="M2.5 4.5H19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M11 4.5V15.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M31 6.5C29.9 5.2 28.2 4.5 26.2 4.5C22.4 4.5 19.5 6.8 19.5 10C19.5 13.2 22.4 15.5 26.2 15.5C28.2 15.5 29.9 14.8 31 13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M34.5 4.5H51.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M43 4.5V15.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M55.5 3.5V16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
    <path d="M59.5 3.5V16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
  </svg>
);
