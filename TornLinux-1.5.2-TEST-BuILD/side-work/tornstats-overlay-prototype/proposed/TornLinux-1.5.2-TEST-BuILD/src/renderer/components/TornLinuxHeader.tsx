import React, { useEffect, useMemo, useState } from "react";
import "../styles/torn-header.tokens.css";
import "../styles/torn-header.css";
import {
  EnergyIcon,
  HappinessIcon,
  NerveIcon,
  LifeIcon,
  TornStatsIcon,
  NetworkStatusIcon,
  SettingsIcon,
  LevelIcon,
  BankIcon,
  PlayerIcon,
  StatusOnlineIcon,
  StatusHospitalIcon,
  StatusJailIcon,
  StatusTravelIcon,
  StatusOfflineIcon,
  TimeTctIcon
} from "./icons";
import type { PlayerSnapshot, TornStatsSummary } from "@shared/types";
import logoSrc from "../../../assets/master/block-logo-corrected.svg";

type Props = {
  player: PlayerSnapshot;
  tornStats: TornStatsSummary;
  networkOnline: boolean;
  onToggleTornStats: () => void;
  onOpenNetworkSettings: () => void;
  onOpenSettings: () => void;
};

const formatMoney = (value: string) => value;

function formatStatusCountdown(until: number | null) {
  if (!until) return null;
  const remainingMs = until * 1000 - Date.now();
  if (remainingMs <= 0) return null;
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getStatusIcon(kind: PlayerSnapshot["status"]["kind"]) {
  switch (kind) {
    case "hospital":
      return StatusHospitalIcon;
    case "jail":
      return StatusJailIcon;
    case "traveling":
    case "abroad":
      return StatusTravelIcon;
    case "okay":
      return StatusOnlineIcon;
    default:
      return StatusOfflineIcon;
  }
}

function getStatusTone(status: PlayerSnapshot["status"]) {
  if (status.kind === "hospital" || status.kind === "jail") return "danger";
  if (status.kind === "traveling" || status.kind === "abroad") return "warning";
  if (status.level === "online") return "online";
  return "offline";
}

function useTctClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return useMemo(() => new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now), [now]);
}

function getCombatBadgeDetail(tornStats: TornStatsSummary) {
  if (tornStats.fairFight !== "Unknown") return tornStats.fairFight;
  if (tornStats.freshness !== "Unknown") return tornStats.freshness;
  return "Snapshot";
}

export function TornLinuxHeader({
  player,
  tornStats,
  networkOnline,
  onToggleTornStats,
  onOpenNetworkSettings,
  onOpenSettings,
}: Props) {
  const StatusIcon = getStatusIcon(player.status.kind);
  const countdown = formatStatusCountdown(player.status.until);
  const statusText = countdown ? `${player.status.label} · ${countdown}` : player.status.description || player.status.label;
  const statusTone = getStatusTone(player.status);
  const tct = useTctClock();
  const combatDetail = getCombatBadgeDetail(tornStats);
  const showCombatBadge = tornStats.battleStats !== "Unknown" || combatDetail !== "Snapshot";

  return (
    <header className="tlHeader" role="banner">
      <div className="tlLeft">
        <div className="tlBrandMark" aria-label="TornLinux brand">
          <img className="tlBrandMarkImg" src={logoSrc} alt="" width={88} height={88} />
        </div>

        <div className="tlBrandText">
          <div className="tlBrandTitle">Torn<em>Linux</em></div>
          <div className="tlBrandMeta">Command Center</div>
        </div>
      </div>

      <div className="tlCenter">
        <div className="tlCenterPlate" aria-label="Player and status">
          <div className="tlChipRow">
            <div className="tlChip" aria-label="Player name">
              <PlayerIcon className="tlChipSvgIcon" />
              <span className="tlChipText">{player.name}</span>
            </div>

            <div className="tlChip" aria-label="Level">
              <LevelIcon className="tlChipSvgIcon" />
              <span className="tlChipText">Level {player.level}</span>
            </div>

            <div className="tlChip" aria-label="Money">
              <BankIcon className="tlChipSvgIcon tlChipSvgIcon--money" />
              <span className="tlChipText">{formatMoney(player.money)}</span>
            </div>

            {showCombatBadge ? (
              <div className="tlChip tlChip--combat" aria-label="Combat snapshot">
                <TornStatsIcon className="tlChipSvgIcon tlChipSvgIcon--combat" />
                <span className="tlChipText">Combat {tornStats.battleStats}</span>
                <span className="tlChipMeta">{combatDetail}</span>
              </div>
            ) : null}

            <div className={`tlChip tlChip--status tlChip--status-${statusTone}`} aria-label={`Status ${player.status.label}`}>
              <StatusIcon className="tlChipSvgIcon tlChipSvgIcon--status" />
              <span className="tlChipText">{statusText}</span>
            </div>
          </div>

          <div className="tlStatsRow" aria-label="Player values">
            <div className="tlStat tlStat--energy" aria-label="Energy">
              <EnergyIcon className="tlStatIcon" />
              <span className="tlStatLabel">Energy</span>
              <span className="tlStatValue">{player.energy.current} / {player.energy.max}</span>
            </div>

            <div className="tlStat tlStat--happiness" aria-label="Happiness">
              <HappinessIcon className="tlStatIcon" />
              <span className="tlStatLabel">Happy</span>
              <span className="tlStatValue">{player.happiness.current} / {player.happiness.max}</span>
            </div>

            <div className="tlStat tlStat--nerve" aria-label="Nerve">
              <NerveIcon className="tlStatIcon" />
              <span className="tlStatLabel">Nerve</span>
              <span className="tlStatValue">{player.nerve.current} / {player.nerve.max}</span>
            </div>

            <div className="tlStat tlStat--life" aria-label="Life">
              <LifeIcon className="tlStatIcon" />
              <span className="tlStatLabel">Life</span>
              <span className="tlStatValue">{player.life.current} / {player.life.max}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tlRight">
        <div className="tlTctReadout" aria-label="Torn City Time">
          <TimeTctIcon className="tlTctReadoutIcon" />
          <span className="tlTctReadoutValue">{tct}</span>
        </div>

        <div className="tlActionRow">
          <button className="tlAction tlAction--tornstats" onClick={onToggleTornStats} type="button" aria-label="Open TornStats">
            <TornStatsIcon className="tlActionIconSvg" />
            <span className="tlActionLabel">TornStats</span>
          </button>
          <button
            className={`tlAction tlAction--network ${networkOnline ? "isOnline" : "isOffline"}`}
            onClick={onOpenNetworkSettings}
            type="button"
            aria-label={networkOnline ? "Network status online" : "Network status offline"}
          >
            <NetworkStatusIcon className="tlActionIconSvg" />
            <span className="tlActionLabel">{networkOnline ? "Online" : "Offline"}</span>
          </button>

          <button className="tlAction tlAction--settings" onClick={onOpenSettings} type="button" aria-label="Open settings">
            <SettingsIcon className="tlActionIconSvg" />
            <span className="tlActionLabel">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
