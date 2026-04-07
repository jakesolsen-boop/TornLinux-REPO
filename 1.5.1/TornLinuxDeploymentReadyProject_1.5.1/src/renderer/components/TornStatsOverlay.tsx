import React from 'react';

export function TornStatsOverlay({ open, data, onClose }: any) {
  if (!open) return null;

  const widget = (title: string, value: string, subtext: string) => (
    <div className="tso-widget">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{subtext}</small>
    </div>
  );

  return (
    <div className="tso-backdrop" onClick={onClose} role="presentation">
      <aside className="tso-panel" onClick={(event) => event.stopPropagation()} aria-label="TornStats overlay">
        <header className="tso-panel__header">
          <div><strong>TornStats</strong><span>Overlay utility layer</span></div>
          <button type="button" onClick={onClose}>Close</button>
        </header>
        <div className="tso-grid">
          {widget('Battle Stats', data.battleStats, 'Mapped TornStats value')}
          {widget('Net Worth', data.netWorth, 'Mapped TornStats value')}
          {widget('Stat Deltas', data.cooldowns, 'Mapped TornStats record deltas')}
          {widget('Freshness', data.freshness, 'Spy freshness or record age')}
          {widget('Fair Fight', data.fairFight, 'Mapped TornStats value')}
          {widget('Status', data.status, 'Transport status')}
        </div>
      </aside>
    </div>
  );
}
