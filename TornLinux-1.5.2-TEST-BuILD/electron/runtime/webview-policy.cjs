const ALLOWED_EMBED_HOSTS = new Set([
  'www.torn.com',
  'discord.com',
  'canary.discord.com',
  'ptb.discord.com',
]);

const ALLOWED_EXTERNAL_HOSTS = new Set([
  'www.torn.com',
  'api.torn.com',
  'discord.com',
  'canary.discord.com',
  'ptb.discord.com',
  'www.tornstats.com',
  'tornstats.com',
]);

function isAllowedEmbedUrl(raw) {
  try {
    const url = new URL(raw);
    return (url.protocol === 'https:' || url.protocol === 'http:') && ALLOWED_EMBED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function isAllowedExternalUrl(raw) {
  try {
    const url = new URL(raw);
    return (url.protocol === 'https:' || url.protocol === 'http:') && ALLOWED_EXTERNAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

module.exports = { ALLOWED_EMBED_HOSTS, ALLOWED_EXTERNAL_HOSTS, isAllowedEmbedUrl, isAllowedExternalUrl };
