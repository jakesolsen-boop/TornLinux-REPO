import React from "react";

type IconProps = { className?: string; title?: string };

export const EnergyIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path fill="currentColor" d="M13.2 2.5c.5 0 .9.4.8.9l-1.3 6.2h5.1c.7 0 1.1.8.7 1.4l-8.9 10.9c-.4.5-1.2.2-1.1-.5l1.3-6.4H5.7c-.7 0-1.1-.8-.7-1.4L12.5 2.9c.2-.2.4-.4.7-.4zm-5.2 10h4.5c.5 0 .9.5.8 1l-.7 3.3 5.1-6.3h-4.5c-.5 0-.9-.5-.8-1l.7-3.1L8 12.5z"/>
  </svg>
);

export const NerveIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path fill="currentColor" d="M9.2 3.5c-2.5 0-4.7 2-4.7 4.7 0 1.2.4 2.2 1 3-.7.8-1.1 1.9-1.1 3.1 0 2.5 2 4.6 4.6 4.6h1.1v1c0 .6.4 1 1 1h1.8c.6 0 1-.4 1-1v-1H15c2.6 0 4.6-2.1 4.6-4.6 0-1.2-.4-2.3-1.1-3.1.6-.8 1-1.8 1-3 0-2.7-2.1-4.7-4.7-4.7-1 0-1.9.3-2.7.8-.8-.5-1.7-.8-2.9-.8zM8.9 6c.6 0 1.1.2 1.5.6.3.3.3.8 0 1.1s-.8.3-1.1 0c-.1-.1-.2-.2-.4-.2-.6 0-1.1.5-1.1 1.1 0 .4-.3.8-.8.8S6.2 9.9 6.2 9.4C6.2 7.9 7.4 6 8.9 6zm6.2 0c1.5 0 2.7 1.2 2.7 2.7 0 .4-.3.8-.8.8s-.8-.3-.8-.8c0-.6-.5-1.1-1.1-1.1-.2 0-.3.1-.4.2-.3.3-.8.3-1.1 0s-.3-.8 0-1.1c.4-.4.9-.6 1.5-.6zM8.4 12c.5 0 .8.3.8.8 0 .7.6 1.3 1.3 1.3.5 0 .8.3.8.8s-.3.8-.8.8c-1.6 0-2.9-1.3-2.9-2.9 0-.5.3-.8.8-.8zm7.2 0c.5 0 .8.3.8.8 0 1.6-1.3 2.9-2.9 2.9-.5 0-.8-.3-.8-.8s.3-.8.8-.8c.7 0 1.3-.6 1.3-1.3 0-.5.3-.8.8-.8z"/>
  </svg>
);

export const LifeIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path fill="currentColor" d="M12 21.4c-.2 0-.4-.1-.6-.2-3.2-2.3-6.3-5.2-8-8C1.4 9.9 3.2 6.5 6.7 6.1c1.7-.2 3.2.5 4.2 1.7 1-1.2 2.5-1.9 4.2-1.7 3.5.4 5.3 3.8 3.3 7.1-1.7 2.8-4.8 5.7-8 8-.1.1-.3.2-.6.2zm-5-13.7c-.1 0-.3 0-.4 0-2.3.3-3.4 2.6-2.1 4.8 1.4 2.3 4 4.9 7.5 7.4 3.5-2.5 6.1-5.1 7.5-7.4 1.3-2.2.2-4.5-2.1-4.8-1.4-.2-2.6.6-3.2 1.8-.1.3-.4.4-.7.4s-.6-.2-.7-.4C9.2 8.4 8.2 7.7 7 7.7z"/>
  </svg>
);


export const LevelIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <path fill="currentColor" d="M12 3.5 18.5 8v8L12 20.5 5.5 16V8L12 3.5Zm0 2.1L7.3 8.4v7.1l4.7 3.4 4.7-3.4V8.4L12 5.6Z"/>
    <path fill="currentColor" d="M9.2 12.5 12 9.8l2.8 2.7v2.1L12 17l-2.8-2.4v-2.1Z"/>
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

export const LayoutIcon = ({ className, title }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : "presentation"} xmlns="http://www.w3.org/2000/svg">
    {title ? <title>{title}</title> : null}
    <rect x="3.5" y="5" width="17" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M11.5 5.9v12.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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
