import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { researchCompany, liveAvailable } from './research.js';
import { scoreBrief, whitespace, CATEGORIES } from './scoring.js';
import { DEMO_ACCOUNTS } from './demo.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(DIR, 'public');
const DATA_FILE = path.join(DIR, 'data', 'accounts.json');
const PORT = Number(process.env.PORT) || 3000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

let accounts = [];
const inFlight = new Set();

const newAccount = ({ name, website, seats }) => ({
  id: crypto.randomUUID(),
  name: String(name || '').trim().slice(0, 120),
  website: String(website || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').slice(0, 120),
  seats: seats === '' || seats == null || Number.isNaN(Number(seats)) ? null : Math.max(0, Math.round(Number(seats))),
  brief: null, researchedAt: null, error: null, sample: false,
});

async function load() {
  try {
    accounts = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  } catch {
    accounts = DEMO_ACCOUNTS.map((d) => ({
      ...newAccount(d), brief: d.brief, sample: true,
      researchedAt: d.brief ? new Date().toISOString() : null,
    }));
    await save();
  }
}
async function save() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(accounts, null, 2));
  await fs.rename(tmp, DATA_FILE);
}

const view = (a) => ({
  ...a,
  researching: inFlight.has(a.id),
  scoring: a.brief ? scoreBrief(a.brief) : null,
  whitespace: a.brief ? whitespace(a.brief, a.seats) : null,
});

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};
async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 200_000) throw new Error('Request too large');
  }
  return raw ? JSON.parse(raw) : {};
}

async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', ...]
  const [, resource, id, action] = parts;

  if (resource === 'status' && req.method === 'GET') {
    return send(res, 200, { mode: liveAvailable() ? 'live' : 'demo', categories: CATEGORIES });
  }
  if (resource !== 'accounts') return send(res, 404, { error: 'Not found' });

  if (!id) {
    if (req.method === 'GET') return send(res, 200, accounts.map(view));
    if (req.method === 'POST') {
      const body = await readBody(req);
      const incoming = (Array.isArray(body.accounts) ? body.accounts : [body]).slice(0, 200);
      const added = [];
      for (const item of incoming) {
        const acc = newAccount(item);
        if (!acc.name) continue;
        if (accounts.some((a) => a.name.toLowerCase() === acc.name.toLowerCase())) continue;
        accounts.push(acc);
        added.push(acc);
      }
      await save();
      return send(res, 201, { added: added.length, skipped: incoming.length - added.length, accounts: accounts.map(view) });
    }
    return send(res, 405, { error: 'Method not allowed' });
  }

  const acc = accounts.find((a) => a.id === id);
  if (!acc) return send(res, 404, { error: 'Account not found' });

  if (!action && req.method === 'PATCH') {
    const body = await readBody(req);
    if ('seats' in body) acc.seats = newAccount({ name: 'x', seats: body.seats }).seats;
    await save();
    return send(res, 200, view(acc));
  }
  if (!action && req.method === 'DELETE') {
    accounts = accounts.filter((a) => a.id !== id);
    await save();
    return send(res, 200, { ok: true });
  }
  if (action === 'research' && req.method === 'POST') {
    if (!liveAvailable()) return send(res, 409, { error: 'Live research needs an API key. See the README to switch it on.' });
    if (inFlight.has(id)) return send(res, 409, { error: 'Research is already running for this account.' });
    inFlight.add(id);
    try {
      acc.brief = await researchCompany(acc);
      acc.researchedAt = new Date().toISOString();
      acc.error = null;
      acc.sample = false;
    } catch (err) {
      console.error(`Research failed for ${acc.name}:`, err);
      acc.error = err?.status === 429 ? 'Rate limited. Wait a minute and try again.'
        : err?.status === 401 ? 'The API key was rejected. Check ANTHROPIC_API_KEY.'
        : err?.status ? `Research service error (${err.status}). Try again.`
        : err?.message || 'Research failed.';
    } finally {
      inFlight.delete(id);
    }
    if (accounts.includes(acc)) await save();
    return send(res, acc.error ? 502 : 200, view(acc));
  }
  return send(res, 404, { error: 'Not found' });
}

async function serveStatic(res, url) {
  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, { error: 'Forbidden' });
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch {
    send(res, 404, { error: 'Not found' });
  }
}

await load();
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await serveStatic(res, url);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) send(res, err instanceof SyntaxError ? 400 : 500, { error: 'Something went wrong.' });
  }
}).listen(PORT, () => console.log(`Signal Scout running at http://localhost:${PORT} (${liveAvailable() ? 'live research' : 'demo mode'})`));
