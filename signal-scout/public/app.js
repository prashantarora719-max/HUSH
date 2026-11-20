const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

const state = { accounts: [], mode: 'demo', categories: {}, filter: 'all', query: '', selected: null, bulk: false };

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    ...opts,
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.id) throw new Error(data.error || 'Request failed');
  return data;
}

let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

const topSignal = (a) => {
  const sigs = a.brief?.signals || [];
  const risk = sigs.filter((s) => s.category === 'risk').sort((x, y) => y.strength - x.strength)[0];
  if (risk && risk.strength >= 2) return risk;
  return [...sigs].sort((x, y) => y.strength - x.strength || String(y.date).localeCompare(String(x.date)))[0];
};
const hasRisk = (a) => (a.brief?.signals || []).some((s) => s.category === 'risk' && s.strength >= 2);
const catLabel = (k) => state.categories[k]?.label || k;
const replace = (acc) => { state.accounts = state.accounts.map((a) => (a.id === acc.id ? acc : a)); };

function visible() {
  const q = state.query.toLowerCase();
  return state.accounts
    .filter((a) => !q || a.name.toLowerCase().includes(q) || (a.website || '').toLowerCase().includes(q))
    .filter((a) => state.filter === 'all' || (a.brief?.signals || []).some((s) => s.category === state.filter))
    .sort((a, b) => (b.scoring?.score ?? -1) - (a.scoring?.score ?? -1) || a.name.localeCompare(b.name));
}

function renderStats() {
  const researched = state.accounts.filter((a) => a.brief);
  const hot = researched.filter((a) => a.scoring.tier === 'hot').length;
  const seats = researched.filter((a) => !hasRisk(a)).reduce((n, a) => n + a.whitespace.suggestedHigh, 0);
  const risk = researched.filter(hasRisk).length;
  $('stats').innerHTML = [
    [state.accounts.length, 'Accounts in book'],
    [hot, 'Hot accounts (score 65+)'],
    [seats, 'Potential add-on seats'],
    [risk, 'Accounts with risk flags'],
  ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
}

function renderChips() {
  const keys = ['all', ...Object.keys(state.categories)];
  $('chips').innerHTML = keys
    .map((k) => `<button class="chip" data-k="${k}" aria-pressed="${state.filter === k}">${k === 'all' ? 'All signals' : esc(catLabel(k))}</button>`)
    .join('');
}

function renderRows() {
  const list = visible();
  $('empty').hidden = list.length > 0;
  $('rows').innerHTML = list.map((a) => {
    const s = a.scoring;
    const sig = topSignal(a);
    const scoreCell = a.researching ? '<span class="spinner"></span>'
      : s ? `<span class="score ${s.tier}">${s.score}</span>` : '<span class="score none">–</span>';
    const signalCell = a.researching ? '<span class="sub">Researching the web… this takes a minute or two</span>'
      : a.error ? `<span class="tag risk">Failed</span><span class="sub">${esc(a.error)}</span>`
      : sig ? `<span class="tag ${sig.category === 'risk' ? 'risk' : ''}">${esc(catLabel(sig.category))}</span>${esc(sig.title)}`
      : a.brief ? '<span class="sub">No notable signals found</span>'
      : '<span class="sub">Not researched yet</span>';
    const w = a.whitespace;
    const addOn = !w ? '–' : hasRisk(a) ? '<span class="sub">Hold</span>' : w.suggestedHigh ? `${w.suggestedLow === w.suggestedHigh ? '' : w.suggestedLow + '–'}${w.suggestedHigh}` : '0';
    return `<tr data-id="${a.id}" tabindex="0">
      <td class="num">${scoreCell}</td>
      <td class="acct"><b>${esc(a.name)}</b><small>${esc(a.website || '')}</small></td>
      <td class="top-signal">${signalCell}</td>
      <td class="num">${w ? w.openSeatRoles : '–'}</td>
      <td class="num">${a.seats ?? '–'}</td>
      <td class="num">${addOn}</td>
      <td class="num">${state.mode === 'live' && !a.researching ? `<button class="btn small" data-research="${a.id}">${a.brief ? 'Refresh' : 'Research'}</button>` : ''}</td>
    </tr>`;
  }).join('');
}

function renderDrawer() {
  const a = state.accounts.find((x) => x.id === state.selected);
  const open = Boolean(a);
  $('drawer').classList.toggle('open', open);
  $('drawer').setAttribute('aria-hidden', String(!open));
  $('scrim').hidden = !open;
  if (!a) return;
  const b = a.brief;
  const s = a.scoring;
  const w = a.whitespace;
  const risk = hasRisk(a);
  let html = `<div class="d-head">
      <div><h2>${esc(a.name)}</h2><span class="sub">${esc(a.website || '')}</span></div>
      <button class="btn small" data-close aria-label="Close">Close</button>
    </div>
    <div class="d-actions">
      ${s ? `<span class="score ${s.tier}">${s.score}</span>` : ''}
      ${a.sample ? '<span class="tag sample">Sample data</span>' : ''}
      ${state.mode === 'live' ? `<button class="btn small" data-research="${a.id}" ${a.researching ? 'disabled' : ''}>${a.researching ? 'Researching…' : b ? 'Refresh research' : 'Research now'}</button>` : ''}
      <button class="btn small danger" data-delete="${a.id}">Remove</button>
    </div>`;
  if (a.error) html += `<div class="callout error">${esc(a.error)}</div>`;
  if (a.researching) html += '<div class="callout info"><span class="spinner"></span>Reading the careers page, newsroom and recent news. This usually takes one to three minutes.</div>';

  if (!b) {
    html += `<div class="callout info">${state.mode === 'live' ? 'This account has not been researched yet.' : 'Live research is off, so this account cannot be researched yet. Add an API key on the server to switch it on.'}</div>`;
    $('drawerBody').innerHTML = html;
    return;
  }

  if (risk) html += '<div class="callout risk"><b>Risk flag.</b> Recent signals suggest an add-on pitch may be badly timed. Lead with adoption and value.</div>';
  html += `<p class="section" style="margin-top:14px">${esc(b.company_summary)}</p>`;

  html += `<div class="section"><h3>Seat whitespace</h3><div class="ws">
      <div><input type="number" min="0" inputmode="numeric" value="${a.seats ?? ''}" data-seats="${a.id}" aria-label="Current seats"><span>Current seats (edit)</span></div>
      <div><b>${w.openSeatRoles}</b><span>Open seat-eligible roles</span></div>
      <div><b>${risk ? 'Hold' : w.suggestedHigh ? (w.suggestedLow === w.suggestedHigh ? w.suggestedHigh : `${w.suggestedLow}–${w.suggestedHigh}`) : '0'}</b><span>Suggested add-on${w.growthPct && !risk ? ` · up to +${w.growthPct}%` : ''}</span></div>
    </div>
    <p class="sub" style="margin-top:8px">Based on open roles that prospect or manage accounts. Acquired or subsidiary teams are not counted: size those in discovery.</p></div>`;

  html += `<div class="section"><h3>Why this score</h3><div class="bars">${s.breakdown.map((r) => {
    const neg = r.max < 0;
    const pct = Math.round((Math.abs(r.points) / Math.abs(r.max)) * 100);
    return `<div class="bar ${neg ? 'neg' : ''}"><span>${esc(r.label)}</span><div class="track"><div class="fill" style="width:${pct}%"></div></div><span class="pts">${r.points} / ${r.max}</span></div>`;
  }).join('')}</div></div>`;

  const sigs = [...b.signals].sort((x, y) => y.strength - x.strength);
  html += `<div class="section"><h3>Signals (${sigs.length})</h3>${sigs.length ? sigs.map((sg) => {
    const url = safeUrl(sg.source_url);
    return `<div class="signal">
      <div class="meta"><span class="tag ${sg.category === 'risk' ? 'risk' : ''}">${esc(catLabel(sg.category))}</span>
        <span class="dots" title="Strength ${sg.strength} of 3">${'●'.repeat(sg.strength)}${'○'.repeat(3 - sg.strength)}</span>
        ${sg.date ? `<span>${esc(sg.date)}</span>` : ''}
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(sg.source_name || 'Source')} ↗</a>` : `<span>${esc(sg.source_name || 'No source link')}</span>`}
      </div>
      <b>${esc(sg.title)}</b><span>${esc(sg.detail)}</span>
      ${sg.navigator_angle ? `<div class="angle">${esc(sg.navigator_angle)}</div>` : ''}
    </div>`;
  }).join('') : '<p class="sub">No notable signals found.</p>'}</div>`;

  if (b.open_gtm_roles.length) {
    html += `<div class="section"><h3>Open GTM roles (${b.open_gtm_roles.length}${b.gtm_roles_total_estimate > b.open_gtm_roles.length ? ` of about ${b.gtm_roles_total_estimate}` : ''})</h3><ul class="roles">${b.open_gtm_roles.map((r) => {
      const url = safeUrl(r.url);
      const title = url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>` : esc(r.title);
      return `<li><span>${title}${r.needs_seat ? '' : ' <span class="sub">(support role)</span>'}</span><span class="sub">${esc([r.team, r.location].filter(Boolean).join(' · '))}</span></li>`;
    }).join('')}</ul></div>`;
  }

  if (b.talk_track.length) {
    html += `<div class="section"><div class="row-between"><h3>Talk track</h3><button class="btn small" data-copy="track">Copy</button></div><ul class="track-list">${b.talk_track.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  }
  if (b.email.body) {
    html += `<div class="section"><div class="row-between"><h3>Email draft</h3><button class="btn small" data-copy="email">Copy</button></div><div class="email"><span class="subject">Subject: ${esc(b.email.subject)}</span>${esc(b.email.body)}</div></div>`;
  }
  html += `<div class="section sub">Confidence: ${esc(b.confidence)}${b.caveats ? ` · ${esc(b.caveats)}` : ''}${a.researchedAt ? ` · Researched ${new Date(a.researchedAt).toLocaleDateString()}` : ''}<br>Verify signals at the source before using them with a customer.</div>`;
  $('drawerBody').innerHTML = html;
}

function render() {
  $('mode').textContent = state.mode === 'live' ? 'Live research on' : 'Demo mode';
  $('mode').className = 'mode ' + state.mode;
  $('banner').hidden = state.mode === 'live';
  $('banner').textContent = 'Demo mode: accounts marked "sample" are fictional. Live web research switches on once an API key is set on the server.';
  const pending = state.accounts.filter((a) => !a.brief && !a.researching).length;
  $('researchAll').hidden = state.mode !== 'live' || pending === 0 || state.bulk;
  $('researchAll').textContent = `Research ${pending} new`;
  renderStats(); renderChips(); renderRows(); renderDrawer();
}

async function research(id) {
  const acc = state.accounts.find((a) => a.id === id);
  if (!acc || acc.researching) return;
  acc.researching = true; acc.error = null;
  render();
  try {
    replace(await api(`/accounts/${id}/research`, { method: 'POST' }));
  } catch (e) {
    acc.researching = false; acc.error = e.message;
  }
  render();
}

async function researchAll() {
  state.bulk = true;
  const queue = state.accounts.filter((a) => !a.brief && !a.researching).map((a) => a.id);
  const worker = async () => { while (queue.length) await research(queue.shift()); };
  await Promise.all([worker(), worker()]); // two at a time keeps within rate limits
  state.bulk = false;
  render();
  toast('Research finished');
}

function parseLines(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, website = '', seats = ''] = l.split(/[,\t]/).map((p) => p.trim());
    return { name, website, seats };
  });
}

// Events
$('rows').addEventListener('click', (e) => {
  const r = e.target.closest('[data-research]');
  if (r) return research(r.dataset.research);
  const tr = e.target.closest('tr[data-id]');
  if (tr) { state.selected = tr.dataset.id; renderDrawer(); $('drawerBody').focus(); }
});
$('rows').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('tr[data-id]')) { state.selected = e.target.dataset.id; renderDrawer(); $('drawerBody').focus(); }
});
$('chips').addEventListener('click', (e) => {
  const c = e.target.closest('.chip');
  if (c) { state.filter = c.dataset.k; renderChips(); renderRows(); }
});
$('search').addEventListener('input', (e) => { state.query = e.target.value; renderRows(); });
const closeDrawer = () => { state.selected = null; renderDrawer(); };
$('scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.selected && !$('addDialog').open) closeDrawer(); });

$('drawerBody').addEventListener('click', async (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  const a = state.accounts.find((x) => x.id === state.selected);
  if (t.dataset.close !== undefined) return closeDrawer();
  if (t.dataset.research) return research(t.dataset.research);
  if (t.dataset.delete) {
    if (!confirm(`Remove ${a.name} from the book? Its research will be deleted for the whole team.`)) return;
    await api(`/accounts/${a.id}`, { method: 'DELETE' });
    state.accounts = state.accounts.filter((x) => x.id !== a.id);
    state.selected = null;
    render();
    return toast('Account removed');
  }
  if (t.dataset.copy) {
    const text = t.dataset.copy === 'email' ? `Subject: ${a.brief.email.subject}\n\n${a.brief.email.body}` : a.brief.talk_track.map((x) => `• ${x}`).join('\n');
    try { await navigator.clipboard.writeText(text); toast('Copied'); } catch { toast('Copy failed: select the text manually'); }
  }
});
$('drawerBody').addEventListener('change', async (e) => {
  const id = e.target.dataset.seats;
  if (!id) return;
  try { replace(await api(`/accounts/${id}`, { method: 'PATCH', body: { seats: e.target.value } })); render(); toast('Seats updated'); }
  catch (err) { toast(err.message); }
});

$('researchAll').addEventListener('click', researchAll);
$('openAdd').addEventListener('click', () => { $('addError').hidden = true; $('addDialog').showModal(); $('addText').focus(); });
$('cancelAdd').addEventListener('click', () => $('addDialog').close());
$('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const items = parseLines($('addText').value);
  const err = $('addError');
  if (!items.length) { err.textContent = 'Enter at least one company name.'; err.hidden = false; return; }
  try {
    const out = await api('/accounts', { method: 'POST', body: { accounts: items } });
    // Keep in-progress flags for accounts being researched in this tab.
    const busy = new Set(state.accounts.filter((a) => a.researching).map((a) => a.id));
    state.accounts = out.accounts.map((a) => (busy.has(a.id) ? { ...a, researching: true } : a));
    $('addText').value = '';
    $('addDialog').close();
    render();
    toast(`${out.added} added${out.skipped ? `, ${out.skipped} skipped (duplicate or blank)` : ''}`);
  } catch (e2) { err.textContent = e2.message; err.hidden = false; }
});

(async function init() {
  try {
    const [status, accounts] = await Promise.all([api('/status'), api('/accounts')]);
    Object.assign(state, { mode: status.mode, categories: status.categories, accounts });
    render();
  } catch {
    $('banner').hidden = false;
    $('banner').textContent = 'Could not reach the server. Check that it is running and reload.';
  }
})();
