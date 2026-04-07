const { settingsStore } = require('./settings-store.cjs');

function formatMoney(input) {
  if (input === undefined || input === null || input === '') return '$0';
  const numeric = typeof input === 'string' ? Number(String(input).replace(/[^0-9.-]/g, '')) : input;
  if (!Number.isFinite(numeric)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numeric);
}

function safeNumber(input, fallback = 0) {
  return typeof input === 'number' && Number.isFinite(input) ? input : fallback;
}

function formatCompactNumber(input) {
  if (typeof input !== 'number' || !Number.isFinite(input)) return 'Unknown';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(input);
}

function formatWholeNumber(input) {
  if (typeof input !== 'number' || !Number.isFinite(input)) return 'Unknown';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(input);
}

function findCompareStat(compareData, keys) {
  if (!compareData || typeof compareData !== 'object') return undefined;
  for (const key of keys) {
    const entry = compareData[key];
    if (entry && typeof entry === 'object' && 'amount' in entry) {
      return entry.amount;
    }
  }
  return undefined;
}

async function fetchTorn(apiKey) {
  const url = new URL('/user/', 'https://api.torn.com');
  url.searchParams.set('selections', 'basic,bars,profile,battlestats,networth,personalstats');
  url.searchParams.set('key', apiKey);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Torn API request failed: ${response.status}`);
  const data = await response.json();
  if (data && data.error) throw new Error(`Torn API error: ${data.error.error || 'unknown'}`);
  return data;
}

async function fetchTornStats(apiKey, userIdOrName) {
  if (!apiKey) {
    return { spy: {}, graph: {} };
  }
  const base = 'https://www.tornstats.com/api/v2';
  const [spyResponse, graphResponse] = await Promise.all([
    fetch(`${base}/${apiKey}/spy/user/${encodeURIComponent(userIdOrName)}`),
    fetch(`${base}/${apiKey}/battlestats/graph`),
  ]);
  if (!spyResponse.ok) throw new Error(`TornStats spy failed: ${spyResponse.status}`);
  if (!graphResponse.ok) throw new Error(`TornStats graph failed: ${graphResponse.status}`);
  return {
    spy: await spyResponse.json(),
    graph: await graphResponse.json(),
  };
}

function formatRelativeTimestamp(timestamp) {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp <= 0) return 'Unknown';
  const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

function mapPlayer(payload) {
  const rawState = String(payload?.status?.state ?? 'offline').toLowerCase();
  const description = String(payload?.status?.description ?? '').trim();
  const until = typeof payload?.status?.until === 'number' ? payload.status.until : null;

  let kind = 'unknown';
  let level = 'offline';

  if (rawState.includes('okay') || rawState.includes('online')) {
    kind = 'okay';
    level = 'online';
  } else if (rawState.includes('hospital')) {
    kind = 'hospital';
    level = 'warning';
  } else if (rawState.includes('jail')) {
    kind = 'jail';
    level = 'warning';
  } else if (rawState.includes('travel')) {
    kind = 'traveling';
    level = 'warning';
  } else if (rawState.includes('abroad')) {
    kind = 'abroad';
    level = 'warning';
  } else if (rawState.includes('offline')) {
    kind = 'offline';
    level = 'offline';
  }

  const labelMap = {
    okay: 'Okay',
    hospital: 'Hospital',
    jail: 'Jail',
    traveling: 'Traveling',
    abroad: 'Abroad',
    offline: 'Offline',
    unknown: payload?.status?.state ?? 'Unknown',
  };

  return {
    name: payload?.name ?? 'Unknown Player',
    level: safeNumber(payload?.level, 0),
    money: formatMoney(payload?.money ?? payload?.networth?.wallet),
    energy: { current: safeNumber(payload?.energy?.current, 0), max: safeNumber(payload?.energy?.maximum, 150) },
    happiness: { current: safeNumber(payload?.happy?.current, 0), max: safeNumber(payload?.happy?.maximum, 0) },
    nerve: { current: safeNumber(payload?.nerve?.current, 0), max: safeNumber(payload?.nerve?.maximum, 50) },
    life: { current: safeNumber(payload?.life?.current, 0), max: safeNumber(payload?.life?.maximum, 1) },
    status: {
      level,
      kind,
      label: labelMap[kind] || 'Unknown',
      description: description || labelMap[kind] || 'Unknown',
      until,
    },
  };
}

function mapTornStats(spy, graph, tornPayload) {
  const compareData = spy?.compare?.data;
  const spyData = spy?.compare?.spy;
  const attacksData = spy?.compare?.attacks;
  const personalStats = tornPayload?.personalstats || {};
  const hasSpy = Boolean(spyData && spyData.status !== false && typeof spyData === 'object' && !('message' in spyData && Object.keys(spyData).length <= 2));
  const graphEntries = Array.isArray(graph?.data) ? graph.data : [];
  const latestGraph = graphEntries.length ? graphEntries[graphEntries.length - 1] : null;
  const total = spyData?.total ?? tornPayload?.total ?? latestGraph?.total;
  const strength = spyData?.strength ?? tornPayload?.strength ?? latestGraph?.strength;
  const defense = spyData?.defense ?? tornPayload?.defense ?? latestGraph?.defense;
  const speed = spyData?.speed ?? tornPayload?.speed ?? latestGraph?.speed;
  const dexterity = spyData?.dexterity ?? tornPayload?.dexterity ?? latestGraph?.dexterity;
  const netWorth = personalStats?.networth ?? tornPayload?.networth?.total ?? findCompareStat(compareData, ['Networth', 'Net Worth']);
  const fairFight = spyData?.fair_fight_bonus;
  const freshness = spyData?.difference ?? (latestGraph?.timestamp ? formatRelativeTimestamp(latestGraph.timestamp) : (spy?.compare?.status && !hasSpy ? 'Spy Unavailable' : 'Unknown'));
  const statusMessage = spyData?.message ?? (spy?.compare?.status ? 'Compare data available' : 'Unavailable');
  const spySourceMap = {
    'faction-share': 'Faction Share',
    'personal-spy': 'Personal Spy',
    'faction-spy': 'Faction Spy',
  };
  const spySource = spyData?.type ? (spySourceMap[spyData.type] || String(spyData.type)) : (latestGraph?.timestamp ? 'Battle Graph' : 'Unavailable');
  const statDelta = (keys) => {
    if (!compareData || typeof compareData !== 'object') return 0;
    for (const key of keys) {
      const entry = compareData[key];
      if (entry && typeof entry === 'object' && typeof entry.difference === 'number' && Number.isFinite(entry.difference)) {
        return entry.difference;
      }
    }
    return 0;
  };

  return {
    battleStats: total !== undefined ? formatCompactNumber(total) : 'Unknown',
    strength: strength !== undefined ? formatCompactNumber(strength) : 'Unknown',
    defense: defense !== undefined ? formatCompactNumber(defense) : 'Unknown',
    speed: speed !== undefined ? formatCompactNumber(speed) : 'Unknown',
    dexterity: dexterity !== undefined ? formatCompactNumber(dexterity) : 'Unknown',
    netWorth: formatMoney(netWorth),
    statDeltas: `STR ${statDelta(['Strength'])} · DEF ${statDelta(['Defense'])} · DEX ${statDelta(['Dexterity'])} · SPD ${statDelta(['Speed'])}`,
    freshness,
    fairFight: fairFight !== undefined ? `FF ${fairFight}` : 'Unknown',
    spySource,
    attacksWon: formatWholeNumber(personalStats?.attackswon ?? findCompareStat(compareData, ['Attacks Won', 'Attack Wins'])),
    defendsWon: formatWholeNumber(personalStats?.defendswon ?? findCompareStat(compareData, ['Defends Won', 'Defendswin', 'Defends Won.'])),
    xanaxTaken: formatWholeNumber(personalStats?.xantaken ?? findCompareStat(compareData, ['Xanax Taken', 'Xanax taken'])),
    refills: formatWholeNumber(personalStats?.refills ?? findCompareStat(compareData, ['Refills'])),
    statEnhancersUsed: formatWholeNumber(personalStats?.statenhancersused ?? findCompareStat(compareData, ['Stat Enhancers Used'])),
    energyDrinksUsed: formatWholeNumber(personalStats?.energydrinkused ?? findCompareStat(compareData, ['Energy Drinks Used', 'Energy Drinks used'])),
    meritsBought: formatWholeNumber(personalStats?.meritsbought ?? findCompareStat(compareData, ['Merits Bought'])),
    recentAttacks: attacksData?.message || 'No recent attack summary',
    status: statusMessage,
  };
}

async function getUnifiedState(tornApiKey, tornStatsApiKey) {
  const settings = settingsStore.read();
  if (!tornApiKey) {
    return {
      player: {
        name: 'No API Key',
        level: 0,
        money: '$0',
        energy: { current: 0, max: 150 },
        happiness: { current: 0, max: 0 },
        nerve: { current: 0, max: 50 },
        life: { current: 0, max: 1 },
        status: { level: 'offline', kind: 'offline', label: 'Offline', description: 'No API key configured', until: null },
      },
      tornStats: {
        battleStats: 'Unknown',
        strength: 'Unknown',
        defense: 'Unknown',
        speed: 'Unknown',
        dexterity: 'Unknown',
        netWorth: '$0',
        statDeltas: 'STR 0 · DEF 0 · DEX 0 · SPD 0',
        freshness: 'Unknown',
        fairFight: 'Unknown',
        spySource: 'Unavailable',
        attacksWon: 'Unknown',
        defendsWon: 'Unknown',
        xanaxTaken: 'Unknown',
        refills: 'Unknown',
        statEnhancersUsed: 'Unknown',
        energyDrinksUsed: 'Unknown',
        meritsBought: 'Unknown',
        recentAttacks: 'No recent attack summary',
        status: 'Unavailable',
      },
      settings,
      lastUpdated: new Date().toISOString(),
      sourceHealth: { torn: 'warning', tornStats: 'warning' },
    };
  }

  const tornResult = await fetchTorn(tornApiKey).then(
    value => ({ ok: true, value }),
    () => ({ ok: false, value: {} }),
  );
  const player = mapPlayer(tornResult.value);
  const userKey = tornResult.value?.player_id || player.name || 'self';

  const statsResult = await fetchTornStats(tornStatsApiKey, userKey).then(
    value => ({ ok: true, value }),
    () => ({ ok: false, value: { spy: {}, graph: {} } }),
  );

  return {
    player,
    tornStats: mapTornStats(statsResult.value.spy, statsResult.value.graph, tornResult.value),
    settings,
    lastUpdated: new Date().toISOString(),
    sourceHealth: {
      torn: tornResult.ok ? 'ok' : 'error',
      tornStats: tornStatsApiKey ? (statsResult.ok ? 'ok' : 'warning') : 'warning',
    },
  };
}

module.exports = { getUnifiedState };
