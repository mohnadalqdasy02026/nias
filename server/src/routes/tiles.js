import { Router } from 'express';

/**
 * Same-origin map-tile proxy: /tiles/:z/:x/:y
 *
 * The admin branch map picker loads tiles through this route so the map
 * keeps working even when the visitor's network, DNS filter, antivirus or
 * browser extension blocks external tile hosts (verified blocked on some
 * networks). The server fetches from the providers in order and caches
 * successful tiles in memory for 24h.
 */
export const tilesRouter = Router();

// Providers tried in order until one returns a real image. Coordinates are
// validated as plain integers before any URL is built (no SSRF surface:
// the templates are fixed and only {z}/{x}/{y}/{s} are substituted).
//
// All three providers are free and keyless (CARTO's raster tiles now serve
// an "API KEY REQUIRED" watermark image instead of a map, so it was removed):
//  1. Wikimedia OSM — Arabic labels, descriptive UA sent above (their policy).
//  2. Esri World Street Map — NOTE: its URL order is {z}/{y}/{x}, not {z}/{x}/{y}.
//  3. OpenTopoMap — strict rate limits, kept as last resort only.
const SOURCES = [
  {
    tpl: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
    subs: [''],
  },
  {
    tpl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    subs: [''],
  },
  {
    tpl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subs: ['a', 'b', 'c'],
  },
];

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 600;
const cache = new Map(); // "z/x/y" -> { type, body, exp }
const FETCH_TIMEOUT_MS = 6000;

async function fetchTile(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'NIAS-Academy-Map/1.0 (https://nias-academy.onrender.com)' },
    });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return null;
    const body = Buffer.from(await res.arrayBuffer());
    if (!body.length) return null;
    return { type, body };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

tilesRouter.get('/:z/:x/:y', async (req, res) => {
  const z = Number(req.params.z);
  const x = Number(req.params.x);
  const y = Number(req.params.y);
  if (!Number.isInteger(z) || z < 0 || z > 19) {
    return res.status(400).type('text/plain').send('bad tile coordinates');
  }
  const limit = 2 ** z;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= limit || y >= limit) {
    return res.status(400).type('text/plain').send('bad tile coordinates');
  }

  const key = `${z}/${x}/${y}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) {
    res.setHeader('Content-Type', hit.type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.end(hit.body);
  }

  let tile = null;
  for (const source of SOURCES) {
    for (const sub of source.subs) {
      const url = source.tpl
        .replace('{z}', String(z))
        .replace('{x}', String(x))
        .replace('{y}', String(y))
        .replace('{s}', sub);
      // eslint-disable-next-line no-await-in-loop
      tile = await fetchTile(url);
      if (tile) break;
    }
    if (tile) break;
  }

  if (!tile) {
    return res.status(502).type('text/plain').send('tile unavailable');
  }

  if (cache.size >= CACHE_MAX_ENTRIES) cache.clear();
  cache.set(key, { ...tile, exp: Date.now() + CACHE_TTL_MS });

  res.setHeader('Content-Type', tile.type);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(tile.body);
});
