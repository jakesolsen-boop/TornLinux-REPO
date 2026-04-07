import React from 'react';
import type { TornStatsSummary } from '@shared/types';

type Props = {
  open: boolean;
  data: TornStatsSummary;
  onClose: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="tso-section">
      <header className="tso-section__header">{title}</header>
      <div className="tso-section__grid">{children}</div>
    </section>
  );
}

function StatCard({ label, value, subtext, accent }: { label: string; value: string; subtext: string; accent?: string }) {
  return (
    <div className={`tso-widget${accent ? ` tso-widget--${accent}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{subtext}</small>
    </div>
  );
}

export function TornStatsOverlay({ open, data, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="tso-backdrop" onClick={onClose} role="presentation">
      <aside className="tso-panel" onClick={(event) => event.stopPropagation()} aria-label="TornStats overlay">
        <header className="tso-panel__header">
          <div>
            <strong>TornStats</strong>
            <span>At-a-glance player intelligence</span>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>

        <div className="tso-stack">
          <Section title="At A Glance">
            <StatCard label="Battle Stats" value={data.battleStats} subtext="Total spy estimate" accent="combat" />
            <StatCard label="Net Worth" value={data.netWorth} subtext="Economic profile" accent="wealth" />
            <StatCard label="Fair Fight" value={data.fairFight} subtext="Combat efficiency context" />
            <StatCard label="Freshness" value={data.freshness} subtext="Spy availability" accent={data.freshness === 'Spy Unavailable' ? 'danger' : undefined} />
          </Section>

          <Section title="Combat Profile">
            <StatCard label="Strength" value={data.strength} subtext="Raw offense branch" />
            <StatCard label="Defense" value={data.defense} subtext="Damage resistance branch" />
            <StatCard label="Speed" value={data.speed} subtext="Initiative branch" />
            <StatCard label="Dexterity" value={data.dexterity} subtext="Evasion branch" />
            <StatCard label="Spy Source" value={data.spySource} subtext="Source reliability" />
            <StatCard label="Stat Deltas" value={data.statDeltas} subtext="Compare deltas" />
          </Section>

          <Section title="Fight Activity">
            <StatCard label="Attacks Won" value={data.attacksWon} subtext="PvP activity signal" />
            <StatCard label="Defends Won" value={data.defendsWon} subtext="Defensive performance" />
            <StatCard label="Recent Attacks" value={data.recentAttacks} subtext="Latest available summary" />
            <StatCard label="Status" value={data.status} subtext="Transport/status message" />
          </Section>

          <Section title="Resource Build">
            <StatCard label="Xanax Taken" value={data.xanaxTaken} subtext="Core growth resource" />
            <StatCard label="Refills" value={data.refills} subtext="Energy investment" />
            <StatCard label="Stat Enhancers" value={data.statEnhancersUsed} subtext="Consumable progression" />
            <StatCard label="Energy Drinks" value={data.energyDrinksUsed} subtext="Supplementary resource use" />
            <StatCard label="Merits Bought" value={data.meritsBought} subtext="Account development" />
          </Section>
        </div>
      </aside>
    </div>
  );
}
