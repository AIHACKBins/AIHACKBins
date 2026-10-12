/* AIHACKBins app.js — redesigned UI */
'use strict';

// ── Utilities ────────────────────────────────────────────────
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url, label) =>
  `<a class="external" target="_blank" rel="noopener noreferrer" href="${esc(url)}">${esc(label)} ↗</a>`;

// ── OWASP LLM 2025 ───────────────────────────────────────────
const OWASP = {
  LLM01:{name:'Prompt Injection',url:'https://genai.owasp.org/llmrisk/llm01-prompt-injection/'},
  LLM02:{name:'Sensitive Info Disclosure',url:'https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/'},
  LLM03:{name:'Supply Chain',url:'https://genai.owasp.org/llmrisk/llm032025-supply-chain/'},
  LLM04:{name:'Data & Model Poisoning',url:'https://genai.owasp.org/llmrisk/llm042025-data-and-model-poisoning/'},
  LLM05:{name:'Improper Output Handling',url:'https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/'},
  LLM06:{name:'Excessive Agency',url:'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/'},
  LLM07:{name:'System Prompt Leakage',url:'https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/'},
  LLM08:{name:'Vector & Embedding Weaknesses',url:'https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/'},
  LLM09:{name:'Misinformation',url:'https://genai.owasp.org/llmrisk/llm092025-misinformation/'},
  LLM10:{name:'Unbounded Consumption',url:'https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/'},
};

// ── State ────────────────────────────────────────────────────
let records = [], changes = [], chains = [];
let filter = {q:'', atlas:'All', owasp:'All', severity:'All', status:'All'};
let recentIds = [];
try { recentIds = JSON.parse(localStorage.getItem('ahb-recent') || '[]'); } catch {}

// ── Theme ────────────────────────────────────────────────────
let theme = '';
try { theme = localStorage.getItem('ahb-theme') || ''; } catch {}
if (!theme) theme = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
function setTheme(v) {
  document.documentElement.dataset.theme = v;
  $$('#theme-btn, #theme-btn-top').forEach(b => b.textContent = v === 'dark' ? '☀' : '☾');
  try { localStorage.setItem('ahb-theme', v); } catch {}
}
setTheme(theme);
$$('#theme-btn, #theme-btn-top').forEach(b =>
  b.onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

// ── Sidebar collapse ─────────────────────────────────────────
try {
  if (localStorage.getItem('ahb-sidebar') === '1') document.body.classList.add('sidebar-collapsed');
} catch {}
$('#sidebar-toggle').onclick = () => {
  document.body.classList.toggle('sidebar-collapsed');
  try { localStorage.setItem('ahb-sidebar', document.body.classList.contains('sidebar-collapsed') ? '1' : ''); } catch {}
};
// Mobile
$('#topbar-menu').onclick = () => {
  const s = $('#sidebar'), o = $('#sidebar-overlay');
  s.classList.toggle('open');
  o.classList.toggle('visible');
  $('#topbar-menu').setAttribute('aria-expanded', s.classList.contains('open'));
};
$('#sidebar-overlay').onclick = () => {
  $('#sidebar').classList.remove('open');
  $('#sidebar-overlay').classList.remove('visible');
  $('#topbar-menu').setAttribute('aria-expanded', 'false');
};

// ── Pill helpers ─────────────────────────────────────────────
function severityPill(s) {
  if (!s) return '';
  const cls = {Critical:'pill-critical', High:'pill-high', Medium:'pill-medium', Low:'pill-low'}[s] || '';
  return `<span class="pill ${cls}">${esc(s)}</span>`;
}
function statusPill(s) {
  if (!s) return '';
  const cls = {
    Active:'pill-active',
    'Partially-patched':'pill-partial',
    Historic:'pill-historic',
    'Model-dependent':'pill-modeldep',
    Unverified:'pill-unverified',
  }[s] || 'pill-unverified';
  return `<span class="pill ${cls}">${esc(s)}</span>`;
}
function atlasPill(id) {
  if (!id) return '';
  return `<a class="pill pill-atlas" href="https://atlas.mitre.org/techniques/${encodeURIComponent(id)}/" target="_blank" rel="noopener">${esc(id)} ↗</a>`;
}
function owaspPill(id) {
  if (!id || !OWASP[id]) return '';
  return `<a class="pill pill-owasp" href="${esc(OWASP[id].url)}" target="_blank" rel="noopener">${esc(id)}</a>`;
}
function cvePill(cve) {
  if (!cve) return '';
  return `<a class="pill pill-cve" href="https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve)}" target="_blank" rel="noopener">${esc(cve)}</a>`;
}

// ── Recent tracking ──────────────────────────────────────────
function trackRecent(id) {
  recentIds = [id, ...recentIds.filter(x => x !== id)].slice(0, 5);
  try { localStorage.setItem('ahb-recent', JSON.stringify(recentIds)); } catch {}
  renderSidebarRecent();
}
function renderSidebarRecent() {
  const el = $('#sidebar-recent');
  if (!el || !recentIds.length) return;
  el.innerHTML = `<div class="sidebar-recent-title">Recently viewed</div>` +
    recentIds.map(id => {
      const r = records.find(x => x.id === id);
      return r ? `<a class="sidebar-recent-link" href="#/technique/${esc(id)}" title="${esc(r.title)}">${esc(id)} · ${esc(r.title)}</a>` : '';
    }).join('');
}

// ── Active nav ───────────────────────────────────────────────
function setActiveNav(route) {
  $$('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route || (route === 'technique' && el.dataset.route === 'home'));
  });
}

// ── Crumbs ───────────────────────────────────────────────────
function setCrumbs(html) {
  const el = $('#topbar-crumbs');
  if (el) el.innerHTML = html;
}

// ── Code block helper ────────────────────────────────────────
function codeBlock(text, id, label) {
  return `<div class="code-wrap">
    <div class="code-header">
      <span>${esc(label)}</span>
      <button class="copy-btn" data-copy="${esc(id)}">Copy</button>
    </div>
    <pre><code id="${esc(id)}">${esc(text)}</code></pre>
  </div>`;
}
function mountCopyBtns(root = document) {
  root.querySelectorAll('[data-copy]').forEach(btn => {
    btn.onclick = async () => {
      const el = document.getElementById(btn.dataset.copy);
      if (!el) return;
      try {
        await navigator.clipboard.writeText(el.textContent);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1800);
      } catch {
        const sel = window.getSelection(), r = document.createRange();
        r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r);
        btn.textContent = 'Select to copy';
      }
    };
  });
}

// ── Home / Catalogue ─────────────────────────────────────────
function renderHome() {
  setActiveNav('home');
  setCrumbs('<span>Catalogue</span>');
  const atlasIds = [...new Set(records.map(r => r.atlas_id).filter(Boolean))];
  const activeCount = records.filter(r => r.status === 'Active').length;
  const labCount = records.filter(r => r.lab).length;

  $('#main').innerHTML = `
    <div class="catalogue-header">
      <h1 class="catalogue-title">AI attack <em>technique</em> reference</h1>
      <p class="catalogue-lead">GTFOBins for LLMs — specific payloads, reproducible steps, MITRE ATLAS and OWASP LLM 2025 mappings. Security through openness.</p>
      <div class="kerckhoff-note">
        <span class="kerckhoff-icon">🔓</span>
        <div><strong>Kerckhoff's principle:</strong> every technique here works even when defenders know about it. Publishing techniques is a feature — it lets you test your own systems before attackers do.</div>
      </div>
      <div class="stats-strip">
        <div class="stat-chip"><span class="stat-chip-num accent">${records.length}</span><span class="stat-chip-label">Techniques</span></div>
        <div class="stat-chip"><span class="stat-chip-num danger">${activeCount}</span><span class="stat-chip-label">Active status</span></div>
        <div class="stat-chip"><span class="stat-chip-num">${atlasIds.length}</span><span class="stat-chip-label">ATLAS techniques</span></div>
        <div class="stat-chip"><span class="stat-chip-num accent">${labCount}</span><span class="stat-chip-label">Lab scenarios</span></div>
      </div>
    </div>

    <div class="filter-bar">
      <input class="filter-input" type="search" id="search" placeholder="Search ID, title, CVE, researcher, target…" aria-label="Search techniques" autocomplete="off">
      <select class="filter-select" id="atlas-filter" aria-label="Filter ATLAS">
        <option value="All">All ATLAS</option>
        <option value="None">Not mapped</option>
        ${atlasIds.map(x => `<option>${esc(x)}</option>`).join('')}
      </select>
      <select class="filter-select" id="owasp-filter" aria-label="Filter OWASP">
        <option value="All">All OWASP</option>
        ${Object.entries(OWASP).map(([k,v]) => `<option value="${k}">${k} · ${esc(v.name)}</option>`).join('')}
      </select>
      <select class="filter-select" id="severity-filter" aria-label="Filter severity">
        <option value="All">All severities</option>
        ${['Critical','High','Medium','Low','Not assessed'].map(x => `<option>${esc(x)}</option>`).join('')}
      </select>
      <select class="filter-select" id="status-filter" aria-label="Filter status">
        <option value="All">All statuses</option>
        ${['Active','Partially-patched','Model-dependent','Historic','Unverified'].map(x => `<option>${esc(x)}</option>`).join('')}
      </select>
      <span class="filter-count" id="found"></span>
    </div>

    <div class="owasp-row">
      ${Object.entries(OWASP).map(([k]) => `<button class="owasp-chip" data-owasp="${k}">${k}</button>`).join('')}
      <button class="owasp-chip" data-owasp="All">Clear</button>
    </div>

    <div class="technique-list" id="list"></div>
    <p class="empty-state" id="empty" hidden>No matching techniques. Try clearing filters or press <kbd>/</kbd> to search.</p>
  `;

  $('#search').oninput = e => { filter.q = e.target.value; renderList(); };
  $('#atlas-filter').onchange = e => { filter.atlas = e.target.value; renderList(); };
  $('#owasp-filter').onchange = e => { filter.owasp = e.target.value; renderList(); };
  $('#severity-filter').onchange = e => { filter.severity = e.target.value; renderList(); };
  $('#status-filter').onchange = e => { filter.status = e.target.value; renderList(); };
  $$('[data-owasp]').forEach(btn => btn.onclick = () => {
    filter.owasp = btn.dataset.owasp;
    $('#owasp-filter').value = btn.dataset.owasp;
    $$('[data-owasp]').forEach(b => b.classList.toggle('active', b.dataset.owasp === filter.owasp && filter.owasp !== 'All'));
    renderList();
  });
  renderList();
}

function renderList() {
  const list = records.filter(r =>
    (filter.atlas === 'All' || (filter.atlas === 'None' ? !r.atlas_id : r.atlas_id === filter.atlas)) &&
    (filter.owasp === 'All' || r.owasp_ids.includes(filter.owasp)) &&
    (filter.severity === 'All' || (filter.severity === 'Not assessed' ? !r.severity : r.severity === filter.severity)) &&
    (filter.status === 'All' || r.status === filter.status) &&
    [r.id, r.title, r.target, r.researcher, r.cve, r.category, r.atlas_id, r.mechanism].join(' ')
      .toLowerCase().includes(filter.q.toLowerCase())
  );
  const el = $('#list'), empty = $('#empty'), found = $('#found');
  if (!el) return;
  if (found) found.textContent = `${list.length} / ${records.length} techniques`;
  if (!list.length) { el.innerHTML = ''; if (empty) empty.hidden = false; return; }
  if (empty) empty.hidden = true;
  el.innerHTML = list.map(r => {
    const catShort = (r.category || '').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
    return `<a class="technique-row${r.lab ? ' has-lab' : ''}" href="#/technique/${esc(r.id)}">
      <div class="tr-id">
        <span class="tr-id-text">${esc(r.id)}</span>
        <span class="tr-id-cat">${esc(catShort)}</span>
      </div>
      <div class="tr-body">
        <div class="tr-title">${esc(r.title)}</div>
        <div class="tr-mechanism">${esc(r.mechanism || r.observed || '')}</div>
        <div class="tr-pills">
          ${statusPill(r.status)}
          ${severityPill(r.severity)}
          ${r.atlas_id ? `<span class="pill pill-atlas">${esc(r.atlas_id)}</span>` : ''}
          ${(r.owasp_ids || []).slice(0,3).map(k => `<span class="pill pill-owasp">${esc(k)}</span>`).join('')}
          ${r.cve ? cvePill(r.cve) : ''}
        </div>
      </div>
      <div class="tr-actions">
        <span class="tr-target">${esc(r.target)}</span>
        ${r.lab ? '<span class="tr-lab-badge">▶ Lab</span>' : ''}
      </div>
    </a>`;
  }).join('');
}

// ── Detail page ───────────────────────────────────────────────
function detail(id, variantIdx = 0, activeTab = 'reference') {
  const r = records.find(x => x.id === id);
  if (!r) { location.hash = '#/'; return; }
  trackRecent(id);
  setActiveNav('technique');
  setCrumbs(`<a href="#/">Catalogue</a><span class="topbar-crumb-sep">/</span><span>${esc(r.id)}</span>`);

  const v = r.variants?.[variantIdx] || r;
  const tabs = [
    {id:'reference', label:'Reference'},
    {id:'lab', label:'Lab', hidden: !r.lab},
    {id:'intel', label:'Intel'},
  ];

  $('#main').innerHTML = `
    <div class="detail-wrap">
      <div class="detail-hero">
        <div class="detail-eyebrow">
          <span class="pill pill-atlas">${esc(r.atlas_id || 'ATLAS not mapped')}</span>
          ${(r.owasp_ids || []).map(k => `<span class="pill pill-owasp">${esc(k)}</span>`).join('')}
        </div>
        <h1 class="detail-title">${esc(r.title)}</h1>
        <p style="color:var(--muted);font-size:15px;max-width:720px;margin:0 0 14px">${esc(r.mechanism || r.observed || '')}</p>
        <div class="detail-actions">
          ${statusPill(r.status || 'Unverified')}
          ${severityPill(r.severity)}
          ${r.cve ? cvePill(r.cve) : ''}
          ${r.lab ? `<a class="btn-primary" href="#/lab/${esc(r.id)}">▶ Open in Lab</a>` : ''}
          <button class="btn-secondary" id="copy-link-btn">⎋ Copy link</button>
        </div>
      </div>

      <div class="detail-tabs" role="tablist">
        ${tabs.filter(t => !t.hidden).map(t =>
          `<button class="detail-tab${t.id === activeTab ? ' active' : ''}" role="tab" data-tab="${t.id}">${t.label}</button>`
        ).join('')}
      </div>

      <!-- Reference tab -->
      <div class="detail-panel${activeTab === 'reference' ? ' active' : ''}" id="tab-reference">
        <div class="detail-columns">
          <article>
            ${r.variants?.length > 1 ? `
              <div class="panel">
                <h2>Variants</h2>
                <div class="variant-tabs" role="group">
                  ${r.variants.map((v2, i) => `<button class="variant-tab${i === variantIdx ? ' active' : ''}" data-variant="${i}">${esc(v2.name)}</button>`).join('')}
                </div>
              </div>
            ` : ''}
            <div class="panel">
              <h2>1 · Copy the payload</h2>
              <p>${esc(v.placement || r.placement || '')}</p>
              ${codeBlock(v.payload || r.payload || '', 'payload', 'Test payload — copy into your authorised target')}
              <div class="note-block">${esc(r.payload_note || '')}</div>
              <div class="note-block warn" style="margin-top:8px"><strong>Provenance:</strong> ${esc(r.payload_origin || v.provenance || '')}</div>
            </div>
            <div class="panel">
              <h2>2 · Apply the test</h2>
              <p>${esc(r.test_scope || '')}</p>
              <ol class="checklist">
                ${(v.steps || r.test_steps || []).map(s => `<li>${esc(s)}</li>`).join('')}
              </ol>
            </div>
            <div class="panel">
              <h2>3 · Expected evidence</h2>
              <p>${esc(v.expected || r.expected_test || '')}</p>
              <div class="note-block">Capture request, response, model version and timestamp. Compare with a clean control that omits the payload.</div>
            </div>
          </article>
          <aside>
            <div class="aside-sticky">
              <div class="aside-panel">
                <h3>MITRE ATLAS</h3>
                ${r.atlas_id ? `
                  <p><strong>${esc(r.atlas_id)}</strong> · ${esc(r.atlas_name || '')}</p>
                  <p style="margin-top:8px">${link(`https://atlas.mitre.org/techniques/${encodeURIComponent(r.atlas_id)}/`, 'Open in ATLAS')}</p>
                  <p style="margin-top:6px;font-size:12px">${esc(r.atlas_reason || '')}</p>
                ` : '<p>No ATLAS technique assigned.</p>'}
              </div>
              <div class="aside-panel">
                <h3>OWASP LLM 2025</h3>
                <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">
                  ${(r.owasp_ids || []).map(k => owaspPill(k)).join('')}
                </div>
                ${(r.owasp_ids || []).map(k => OWASP[k] ? `<p>${link(OWASP[k].url, k + ': ' + OWASP[k].name)}</p>` : '').join('')}
              </div>
              <div class="aside-panel">
                <h3>Quick facts</h3>
                <p><strong>Target:</strong> ${esc(r.target)}</p>
                <p><strong>Surface:</strong> ${esc(r.attack_surface || '')}</p>
                <p><strong>Status:</strong> ${esc(r.status || 'Unverified')}</p>
                <p><strong>Verified:</strong> ${esc(r.last_verified || 'Not yet')}</p>
                ${r.cve ? `<p><strong>CVE:</strong> ${link('https://nvd.nist.gov/vuln/detail/' + encodeURIComponent(r.cve), r.cve)}</p>` : ''}
              </div>
              <div class="aside-panel">
                <h3>Contribute</h3>
                <p>${link('https://github.com/AIHACKBins/AIHACKBins/issues/new', 'Suggest a correction')}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <!-- Lab tab (inline) -->
      <div class="detail-panel${activeTab === 'lab' ? ' active' : ''}" id="tab-lab">
        ${r.lab ? `<div id="inline-lab-host"></div>` : '<p class="empty-state">No lab scenario for this technique.</p>'}
      </div>

      <!-- Intel tab -->
      <div class="detail-panel${activeTab === 'intel' ? ' active' : ''}" id="tab-intel">
        <div class="detail-columns">
          <article>
            <div class="panel">
              <h2>Original research</h2>
              <p><strong>Researcher:</strong> ${esc(r.researcher)}</p>
              <p><strong>Context:</strong> ${esc(r.research_context || r.target)}</p>
              <p style="margin-top:10px">${esc(r.observed || '')}</p>
              <p style="margin-top:10px">${link(r.source_url, 'Read original disclosure')}</p>
              ${(r.related_research || []).map(x => `<p>${link(x.url, x.label)}</p>`).join('')}
            </div>
            <div class="panel">
              <h2>Defence</h2>
              <p>${esc(r.defense || '')}</p>
            </div>
            <div class="panel" style="border-left:3px solid var(--atlas)">
              <h2>Defender notes</h2>
              <p>${esc(r.blue_team || 'No specific detection guidance supplied.')}</p>
            </div>
            <div class="panel">
              <h2>Model compatibility</h2>
              ${r.model_tested?.length ? `
                <div style="overflow-x:auto">
                  <table class="model-table">
                    <thead><tr><th>Model</th><th>Version</th><th>Result</th></tr></thead>
                    <tbody>${r.model_tested.map(t => `<tr><td>${esc(t.model)}</td><td>${esc(t.version)}</td><td>${esc(t.result)}</td></tr>`).join('')}</tbody>
                  </table>
                </div>
              ` : '<p>Not independently verified against a specific model version.</p>'}
              <p style="font-family:var(--mono);font-size:11px;margin-top:8px;color:var(--dim)">Last verified: ${esc(r.last_verified || 'Not verified')}</p>
            </div>
            <div class="panel">
              <h2>Related techniques</h2>
              <div class="related-grid">
                ${(r.related_ids || []).map(rid => {
                  const t = records.find(q => q.id === rid);
                  return t ? `<a class="related-pill" href="#/technique/${esc(rid)}">${esc(rid)} · ${esc(t.title)}</a>` : '';
                }).join('') || '<p>No linked techniques yet.</p>'}
              </div>
            </div>
          </article>
          <aside>
            <div class="aside-sticky">
              <div class="aside-panel">
                <h3>Validation</h3>
                <p>${esc(r.evidence_level || '')}</p>
                <p style="margin-top:6px">${esc(r.reproduction_status || '')}</p>
              </div>
              <div class="aside-panel">
                <h3>Entry type</h3>
                <p>${esc(r.entry_kind || r.type || '')}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `;

  // Tabs
  $$('.detail-tab').forEach(btn => btn.onclick = () => {
    $$('.detail-tab').forEach(b => b.classList.remove('active'));
    $$('.detail-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    if (btn.dataset.tab === 'lab' && r.lab && $('#inline-lab-host')) {
      window.AIHACKBinsLab?.renderInline(r, $('#inline-lab-host'));
    }
  });

  // Variant tabs
  $$('[data-variant]').forEach(btn => btn.onclick = () => detail(id, Number(btn.dataset.variant), 'reference'));

  // Copy link
  $('#copy-link-btn')?.addEventListener('click', async () => {
    const url = location.href.split('#')[0] + '#/technique/' + encodeURIComponent(id);
    try { await navigator.clipboard.writeText(url); $('#copy-link-btn').textContent = 'Copied!'; setTimeout(() => $('#copy-link-btn').textContent = '⎋ Copy link', 1800); }
    catch { $('#copy-link-btn').textContent = 'Copy failed'; }
  });

  // If lab tab was opened directly
  if (activeTab === 'lab' && r.lab && $('#inline-lab-host')) {
    window.AIHACKBinsLab?.renderInline(r, $('#inline-lab-host'));
  }

  mountCopyBtns();
}

// ── Chains ────────────────────────────────────────────────────
function renderChains() {
  setActiveNav('chains');
  setCrumbs(`<a href="#/">Catalogue</a><span class="topbar-crumb-sep">/</span><span>Attack chains</span>`);
  $('#main').innerHTML = `
    <div class="chains-header">
      <h1>Attack chains</h1>
      <p>Curated multi-step sequences combining techniques. Each step links to a technique entry. These are not verified end-to-end exploits.</p>
    </div>
    ${chains.map(ch => `
      <div class="chain-card">
        <h2>${esc(ch.title)}</h2>
        <p>${esc(ch.description)}</p>
        <div class="chain-steps">
          ${ch.steps.map((sid, i) => {
            const t = records.find(x => x.id === sid);
            return `<div class="chain-node">
              ${i ? '<span class="chain-arr">→</span>' : ''}
              <a class="chain-link" href="#/technique/${esc(sid)}">
                <small>${esc(sid)}</small>
                <strong>${esc(t?.title || 'Unknown technique')}</strong>
              </a>
            </div>`;
          }).join('')}
        </div>
      </div>
    `).join('') || '<p class="empty-state">No chains defined yet.</p>'}
  `;
}

// ── API page ──────────────────────────────────────────────────
function renderApi() {
  setActiveNav('api');
  setCrumbs(`<a href="#/">Catalogue</a><span class="topbar-crumb-sep">/</span><span>API</span>`);
  $('#main').innerHTML = `
    <div class="api-header">
      <h1>Static JSON API</h1>
      <p>No authentication, no backend. Data updates with every deployment. MIT licensed.</p>
    </div>
    <div class="panel">
      <h2>Endpoints</h2>
      <p><a class="external" href="data/cases.json">data/cases.json</a> — technique records (${records.length} entries)</p>
      <p><a class="external" href="data/changelog.json">data/changelog.json</a> — recent updates</p>
      <p><a class="external" href="data/chains.json">data/chains.json</a> — attack chains</p>
      <p><a class="external" href="feed.xml">feed.xml</a> — Atom updates feed</p>
    </div>
    <div class="panel">
      <h2>CLI examples</h2>
      ${codeBlock('curl -fsSL https://aihackbins.org/data/cases.json | jq \'.[] | {id,title,owasp_ids,atlas_id}\'', 'api1', 'List all technique IDs with mappings')}
      ${codeBlock('curl -fsSL https://aihackbins.org/data/cases.json | jq -r \'.[] | select(.atlas_id == "AML.T0051.001") | .title\'', 'api2', 'Filter by ATLAS technique')}
      ${codeBlock('curl -fsSL https://aihackbins.org/data/cases.json | jq \'.[] | select(.status == "Active") | {id,title,cve}\'', 'api3', 'Active status techniques only')}
      ${codeBlock('curl -fsSL https://aihackbins.org/data/cases.json | jq \'.[] | select(.lab != null) | .id\'', 'api4', 'Techniques with lab scenarios')}
    </div>
    ${mountCopyBtns.toString().includes('return') ? '' : ''}
  `;
  mountCopyBtns();
}

// ── Lab page (list view) ──────────────────────────────────────
function renderLabList() {
  setActiveNav('lab');
  setCrumbs(`<a href="#/">Catalogue</a><span class="topbar-crumb-sep">/</span><span>Lab</span>`);
  window.AIHACKBinsLab?.render(null);
}

// ── Router ────────────────────────────────────────────────────
function route() {
  const path = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (path.startsWith('technique/')) detail(path.slice(10));
  else if (path.startsWith('lab/')) window.AIHACKBinsLab?.render(path.slice(4));
  else if (path === 'lab') renderLabList();
  else if (path === 'chains') renderChains();
  else if (path === 'api') renderApi();
  else renderHome();
  window.scrollTo(0, 0);
}

// ── Keyboard shortcut ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    const s = $('#search') || $('#sidebar-search');
    if (s) { s.focus(); s.select(); }
  }
});

// ── Sidebar search routes to catalogue ───────────────────────
$('#sidebar-search')?.addEventListener('input', e => {
  const val = e.target.value;
  const path = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (!path.startsWith('technique/') && path !== 'chains' && path !== 'api' && !path.startsWith('lab')) {
    if ($('#search')) { $('#search').value = val; filter.q = val; renderList(); }
    else { location.hash = '#/'; setTimeout(() => { const s = $('#search'); if (s) { s.value = val; filter.q = val; renderList(); } }, 50); }
  }
});

// ── Bootstrap ─────────────────────────────────────────────────
addEventListener('hashchange', route);

Promise.all([
  'data/cases.json',
  'data/changelog.json',
  'data/chains.json',
].map(url => fetch(url, {cache:'no-cache'}).then(r => { if (!r.ok) throw Error('HTTP ' + r.status); return r.json(); })))
.then(([data, log, paths]) => {
  if (!Array.isArray(data) || !data.length) throw Error('Catalogue invalid');
  records = data;
  changes = log.sort((a, b) => b.date.localeCompare(a.date));
  chains = paths;

  // Init lab
  window.AIHACKBinsLab?.init(data);

  // Sidebar stats
  const statsEl = $('#sidebar-stats');
  if (statsEl) statsEl.innerHTML =
    `${records.length} techniques<br>${records.filter(r => r.lab).length} lab scenarios<br>${records.filter(r => r.status === 'Active').length} active`;

  // Lab nav badge
  const labBadge = $('#lab-count');
  if (labBadge) labBadge.textContent = records.filter(r => r.lab).length;

  renderSidebarRecent();
  route();
})
.catch(e => {
  $('#main').innerHTML = `<div class="panel"><h2>Failed to load catalogue</h2><p>Check that data/cases.json is deployed correctly.</p><pre>${esc(String(e))}</pre></div>`;
  console.error(e);
});
