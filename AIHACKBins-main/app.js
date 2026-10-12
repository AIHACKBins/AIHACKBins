/* AIHACKBins app.js — Option 1 "Exploit paper"
 * Static SPA. No build step. Hash router. data/cases.json drives everything.
 */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let allRecords = [];
  let filteredRecords = [];
  let searchQuery = '';
  let labCount = 0;

  // ── Boot ───────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    fetch('data/cases.json')
      .then(r => r.json())
      .then(data => {
        allRecords = data;
        filteredRecords = data;
        labCount = data.filter(r => r.lab).length;
        const labCountEl = document.getElementById('lab-count');
        if (labCountEl) labCountEl.textContent = labCount;
        if (window.AIHACKBinsLab) window.AIHACKBinsLab.init(data);
        renderStats();
        renderRecent();
        route();
      })
      .catch(err => {
        document.getElementById('main').innerHTML =
          '<p style="color:var(--red);padding:32px">Failed to load cases.json: ' + esc(String(err)) + '</p>';
      });

    window.addEventListener('hashchange', route);

    const searchEl = document.getElementById('sidebar-search');
    if (searchEl) {
      searchEl.addEventListener('input', () => {
        searchQuery = searchEl.value.trim().toLowerCase();
        filteredRecords = searchQuery
          ? allRecords.filter(r =>
              r.id.toLowerCase().includes(searchQuery) ||
              (r.title || '').toLowerCase().includes(searchQuery) ||
              (r.target || '').toLowerCase().includes(searchQuery) ||
              (r.tags || []).some(t => t.toLowerCase().includes(searchQuery)) ||
              (r.atlas_id || '').toLowerCase().includes(searchQuery) ||
              (r.owasp_ids || []).some(o => o.toLowerCase().includes(searchQuery))
            )
          : allRecords;
        const h = location.hash.replace('#/', '') || '';
        if (!h || h === '/') renderCatalogue();
      });
    }
  });

  // ── Router ─────────────────────────────────────────────────────────────────
  function route() {
    const raw = location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/');
    const view = parts[0] || '';
    const sub  = parts[1] ? decodeURIComponent(parts[1]) : null;

    document.querySelectorAll('.nav-link').forEach(a => {
      const r = a.dataset.route || '';
      a.classList.toggle('active',
        r === 'home'   ? view === '' :
        r === 'lab'    ? view === 'lab' :
        r === 'chains' ? view === 'chains' :
        r === 'api'    ? view === 'api' : false
      );
    });

    if (view === '') {
      setBreadcrumb([{label:'Catalogue'}]);
      renderCatalogue();
    } else if (view === 'technique' && sub) {
      setBreadcrumb([{label:'Catalogue', href:'#/'}, {label: sub}]);
      renderDetail(sub);
    } else if (view === 'lab') {
      setBreadcrumb(sub
        ? [{label:'Catalogue', href:'#/'}, {label:'Lab', href:'#/lab'}, {label: sub}]
        : [{label:'Catalogue', href:'#/'}, {label:'Lab'}]
      );
      if (window.AIHACKBinsLab) window.AIHACKBinsLab.render(sub || null);
    } else if (view === 'chains') {
      setBreadcrumb([{label:'Catalogue', href:'#/'}, {label:'Attack chains'}]);
      renderChains();
    } else if (view === 'api') {
      setBreadcrumb([{label:'Catalogue', href:'#/'}, {label:'API / data'}]);
      renderApi();
    } else {
      setBreadcrumb([{label:'404'}]);
      document.getElementById('main').innerHTML = '<p style="padding:32px">Not found.</p>';
    }
  }

  // ── Theme ──────────────────────────────────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('aihb-theme') || 'light';
    document.documentElement.dataset.theme = saved;
    updateThemeBtns(saved);

    ['theme-btn', 'theme-btn-top'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('aihb-theme', next);
        updateThemeBtns(next);
      });
    });
  }

  function updateThemeBtns(theme) {
    ['theme-btn', 'theme-btn-top'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.textContent = theme === 'dark' ? 'light' : 'dark';
    });
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  function initSidebar() {
    const menuBtn   = document.getElementById('menu-btn');
    const closeBtn  = document.getElementById('sidebar-close');
    const overlay   = document.getElementById('overlay');
    const sidebar   = document.getElementById('sidebar');

    function open()  { sidebar.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow='hidden'; }
    function close() { sidebar.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow=''; }

    if (menuBtn)  menuBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay)  overlay.addEventListener('click', close);
  }

  // ── Sidebar stats / recent ─────────────────────────────────────────────────
  function renderStats() {
    const el = document.getElementById('sidebar-stats');
    if (!el) return;
    const active = allRecords.filter(r => r.status === 'Active').length;
    el.innerHTML =
      '<div class="sidebar-stats-inner">' +
        '<span>' + allRecords.length + ' techniques</span>' +
        '<span>' + active + ' active</span>' +
        '<span>' + labCount + ' labs</span>' +
      '</div>';
  }

  function renderRecent() {
    const el = document.getElementById('sidebar-recent');
    if (!el) return;
    const recent = allRecords.slice(0, 5);
    el.innerHTML =
      '<div class="sidebar-recent-head">Recent</div>' +
      recent.map(r =>
        '<a class="sidebar-recent-link" href="#/technique/' + encodeURIComponent(r.id) + '">' +
          '<span class="srlink-id">' + esc(r.id) + '</span> ' +
          '<span class="srlink-title">' + esc(r.title || '') + '</span>' +
        '</a>'
      ).join('');
  }

  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  function setBreadcrumb(crumbs) {
    const el = document.getElementById('breadcrumb');
    if (!el) return;
    el.innerHTML = crumbs.map((c, i) =>
      i < crumbs.length - 1 && c.href
        ? '<a href="' + c.href + '">' + esc(c.label) + '</a><span class="bc-sep">/</span>'
        : '<span>' + esc(c.label) + '</span>'
    ).join('');
  }

  // ── Catalogue ──────────────────────────────────────────────────────────────
  function renderCatalogue() {
    const main = document.getElementById('main');
    const records = filteredRecords;

    const cats = {};
    records.forEach(r => {
      const cat = r.category || 'Uncategorised';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(r);
    });

    let html =
      '<div class="cat-head">' +
        '<h1 class="cat-title">AIHACKBins</h1>' +
        '<p class="cat-lead">GTFOBins for AI/LLM attack techniques. Practical payloads mapped to MITRE ATLAS and OWASP LLM Top 10 2025.</p>' +
        '<p class="kerck-note">Each technique follows Kerckhoff\'s principle: the technique works even when the target knows about it. Use against systems you own or have authorisation to test.</p>' +
      '</div>';

    if (searchQuery && records.length === 0) {
      html += '<p class="empty-state">No techniques match "' + esc(searchQuery) + '".</p>';
    }

    Object.entries(cats).forEach(([cat, rows]) => {
      html +=
        '<div class="cat-section">' +
          '<div class="cat-section-head">' + esc(cat) + '</div>' +
          '<table class="tech-table">' +
            '<thead><tr>' +
              '<th class="th-id">ID</th>' +
              '<th class="th-title">Technique</th>' +
              '<th class="th-target">Target</th>' +
              '<th class="th-atlas">ATLAS</th>' +
              '<th class="th-owasp">OWASP</th>' +
              '<th class="th-status">Status</th>' +
              '<th class="th-lab">Lab</th>' +
            '</tr></thead>' +
            '<tbody>' +
              rows.map(r => techRow(r)).join('') +
            '</tbody>' +
          '</table>' +
        '</div>';
    });

    main.innerHTML = html;

    main.querySelectorAll('.tech-row').forEach(row => {
      row.addEventListener('click', () => {
        location.hash = '#/technique/' + encodeURIComponent(row.dataset.id);
      });
    });
  }

  function techRow(r) {
    const statusClass = {
      'Active':'s-active', 'Partial':'s-partial', 'Historic':'s-historic',
      'Model-dependent':'s-modeldep', 'Unverified':'s-unverif'
    }[r.status] || 's-unverif';

    return '<tr class="tech-row" data-id="' + esc(r.id) + '" tabindex="0">' +
      '<td class="td-id">' + esc(r.id) + '</td>' +
      '<td class="td-title">' + esc(r.title || '') + '</td>' +
      '<td class="td-target">' + esc(r.target || '') + '</td>' +
      '<td class="td-atlas">' + esc(r.atlas_id || '') + '</td>' +
      '<td class="td-owasp">' +
        (r.owasp_ids || []).slice(0, 2).map(o => '<span class="pill pill-owasp">' + esc(o) + '</span>').join(' ') +
      '</td>' +
      '<td class="td-status ' + statusClass + '">' + esc(r.status || '') + '</td>' +
      '<td class="td-lab">' + (r.lab ? '<span class="lab-dot" title="Lab available">●</span>' : '') + '</td>' +
    '</tr>';
  }

  // ── Detail ─────────────────────────────────────────────────────────────────
  function renderDetail(id) {
    const r = allRecords.find(rec => rec.id === id);
    const main = document.getElementById('main');
    if (!r) {
      main.innerHTML = '<p style="padding:32px">Technique not found: ' + esc(id) + '</p>';
      return;
    }

    const statusClass = {
      'Active':'s-active', 'Partial':'s-partial', 'Historic':'s-historic',
      'Model-dependent':'s-modeldep', 'Unverified':'s-unverif'
    }[r.status] || 's-unverif';

    const hasPoc = r.poc_steps && r.poc_steps.length;
    const hasDefence = r.defences && r.defences.length;
    const hasReferences = r.references && r.references.length;
    const hasLab = !!r.lab;

    main.innerHTML =
      '<div class="detail">' +
        '<div class="detail-head">' +
          '<div class="detail-head-top">' +
            '<span class="d-id">' + esc(r.id) + '</span>' +
            (r.status ? '<span class="d-status ' + statusClass + '">' + esc(r.status) + '</span>' : '') +
          '</div>' +
          '<h1 class="d-title">' + esc(r.title || '') + '</h1>' +
          '<div class="d-meta">' +
            (r.target ? '<span class="d-target">' + esc(r.target) + '</span>' : '') +
            (r.category ? '<span class="d-cat">' + esc(r.category) + '</span>' : '') +
          '</div>' +
          '<div class="d-pills">' +
            (r.atlas_id
              ? '<a class="pill pill-atlas" href="https://atlas.mitre.org/techniques/' + encodeURIComponent(r.atlas_id) + '/" target="_blank" rel="noopener">' +
                  esc(r.atlas_id) + (r.atlas_name ? ' — ' + esc(r.atlas_name) : '') + ' ↗' +
                '</a>'
              : '') +
            (r.owasp_ids || []).map(o =>
              '<span class="pill pill-owasp">' + esc(o) + '</span>'
            ).join('') +
            (r.tags || []).map(t =>
              '<span class="pill pill-tag">' + esc(t) + '</span>'
            ).join('') +
          '</div>' +
        '</div>' +

        '<div class="dtab-bar" role="tablist">' +
          '<button class="dtab active" data-tab="overview" role="tab">Overview</button>' +
          (hasPoc ? '<button class="dtab" data-tab="poc" role="tab">Proof of Concept</button>' : '') +
          (hasDefence ? '<button class="dtab" data-tab="defence" role="tab">Defence</button>' : '') +
          (hasReferences ? '<button class="dtab" data-tab="references" role="tab">References</button>' : '') +
          (hasLab ? '<button class="dtab" data-tab="lab" role="tab">Lab</button>' : '') +
        '</div>' +

        '<div class="d-cols">' +
          '<div class="d-main">' +

            '<div class="dpanel active" data-panel="overview">' +
              '<div class="d-section">' +
                '<h2>Summary</h2>' +
                '<p>' + esc(r.summary || '') + '</p>' +
              '</div>' +
              (r.description
                ? '<div class="d-section"><h2>Description</h2><p>' + esc(r.description) + '</p></div>'
                : '') +
              (r.real_world_cases && r.real_world_cases.length
                ? '<div class="d-section"><h2>Real-world cases</h2><ul class="d-list">' +
                    r.real_world_cases.map(c => '<li>' + esc(c) + '</li>').join('') +
                  '</ul></div>'
                : '') +
            '</div>' +

            (hasPoc
              ? '<div class="dpanel" data-panel="poc">' +
                  '<div class="d-section">' +
                    '<h2>Steps</h2>' +
                    '<ol class="d-list">' +
                      r.poc_steps.map(s => '<li>' + esc(s) + '</li>').join('') +
                    '</ol>' +
                  '</div>' +
                  (r.payload_example
                    ? '<div class="d-section"><h2>Payload example</h2>' +
                        '<pre><code>' + esc(r.payload_example) + '</code></pre>' +
                      '</div>'
                    : '') +
                '</div>'
              : '') +

            (hasDefence
              ? '<div class="dpanel" data-panel="defence">' +
                  '<div class="d-section">' +
                    '<h2>Mitigations</h2>' +
                    '<ul class="d-list">' +
                      r.defences.map(d => '<li>' + esc(d) + '</li>').join('') +
                    '</ul>' +
                  '</div>' +
                '</div>'
              : '') +

            (hasReferences
              ? '<div class="dpanel" data-panel="references">' +
                  '<div class="d-section">' +
                    '<h2>References</h2>' +
                    '<ul class="d-list">' +
                      r.references.map(ref =>
                        '<li>' + (ref.url
                          ? '<a href="' + esc(ref.url) + '" target="_blank" rel="noopener">' + esc(ref.title || ref.url) + ' ↗</a>'
                          : esc(ref.title || ref)) + '</li>'
                      ).join('') +
                    '</ul>' +
                  '</div>' +
                '</div>'
              : '') +

            (hasLab
              ? '<div class="dpanel" data-panel="lab"><div id="lab-inline-host"></div></div>'
              : '') +

          '</div>' +
          '<aside class="d-aside">' +
            '<div class="d-aside-section">' +
              '<h3>Mappings</h3>' +
              (r.atlas_id
                ? '<div class="d-aside-row">' +
                    '<span class="d-aside-lbl">ATLAS</span>' +
                    '<a href="https://atlas.mitre.org/techniques/' + encodeURIComponent(r.atlas_id) + '/" target="_blank" rel="noopener" class="d-aside-val">' + esc(r.atlas_id) + ' ↗</a>' +
                  '</div>'
                : '') +
              (r.owasp_ids && r.owasp_ids.length
                ? '<div class="d-aside-row">' +
                    '<span class="d-aside-lbl">OWASP</span>' +
                    '<span class="d-aside-val">' + r.owasp_ids.map(o => esc(o)).join(', ') + '</span>' +
                  '</div>'
                : '') +
            '</div>' +
            '<div class="d-aside-section">' +
              '<h3>Details</h3>' +
              (r.severity
                ? '<div class="d-aside-row"><span class="d-aside-lbl">Severity</span><span class="d-aside-val sev-' + esc((r.severity||'').toLowerCase()) + '">' + esc(r.severity) + '</span></div>'
                : '') +
              (r.target
                ? '<div class="d-aside-row"><span class="d-aside-lbl">Target</span><span class="d-aside-val">' + esc(r.target) + '</span></div>'
                : '') +
              (r.status
                ? '<div class="d-aside-row"><span class="d-aside-lbl">Status</span><span class="d-aside-val ' + statusClass + '">' + esc(r.status) + '</span></div>'
                : '') +
              (r.affected_models && r.affected_models.length
                ? '<div class="d-aside-row"><span class="d-aside-lbl">Models</span><span class="d-aside-val">' + r.affected_models.join(', ') + '</span></div>'
                : '') +
            '</div>' +
            '<div class="d-aside-section">' +
              '<a class="btn-ghost" href="#/">← Back to catalogue</a>' +
              (hasLab ? '<a class="btn-ghost" href="#/lab/' + encodeURIComponent(r.id) + '">Open in Lab →</a>' : '') +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</div>';

    // Tab switching
    const tabs = main.querySelectorAll('.dtab');
    const panels = main.querySelectorAll('.dpanel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        const target = main.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        if (target) {
          target.classList.add('active');
          // Mount lab inline when Lab tab is clicked
          if (tab.dataset.tab === 'lab' && window.AIHACKBinsLab) {
            const host = document.getElementById('lab-inline-host');
            if (host && !host.dataset.mounted) {
              window.AIHACKBinsLab.renderInline(r, host);
              host.dataset.mounted = '1';
            }
          }
        }
      });
    });

    // Keyboard nav on table rows
    main.querySelectorAll('.tech-row').forEach(row => {
      row.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          location.hash = '#/technique/' + encodeURIComponent(row.dataset.id);
        }
      });
    });
  }

  // ── Chains ─────────────────────────────────────────────────────────────────
  function renderChains() {
    const main = document.getElementById('main');

    const chains = [
      {
        id: 'CHAIN-001',
        title: 'Reconnaissance to Exfiltration',
        description: 'A complete attack chain: probe the model\'s system prompt, inject a persistent instruction, then trigger data exfiltration via prompt injection in retrieved documents.',
        steps: ['RC-001','RC-004','RC-008','RC-012'],
        severity: 'Critical',
      },
      {
        id: 'CHAIN-002',
        title: 'Supply Chain Poisoning via RAG',
        description: 'Poison a retrieval corpus with indirect prompt injection payloads that survive into production, then trigger them via normal user queries.',
        steps: ['SC-001','SC-007','RC-103'],
        severity: 'High',
      },
      {
        id: 'CHAIN-003',
        title: 'Model Inversion to Membership Inference',
        description: 'Extract training data artefacts, then use membership inference to confirm presence of sensitive records in the training set.',
        steps: ['RC-005','RC-111','RC-114'],
        severity: 'High',
      },
    ];

    main.innerHTML =
      '<div class="cat-head">' +
        '<h1 class="cat-title">Attack chains</h1>' +
        '<p class="cat-lead">Multi-step attack sequences that combine individual techniques into end-to-end exploitation paths.</p>' +
      '</div>' +
      chains.map(chain => {
        const steps = chain.steps.map(sid => allRecords.find(r => r.id === sid)).filter(Boolean);
        return '<div class="chain-card">' +
          '<div class="chain-card-head">' +
            '<span class="chain-id">' + esc(chain.id) + '</span>' +
            '<span class="chain-sev sev-' + esc(chain.severity.toLowerCase()) + '">' + esc(chain.severity) + '</span>' +
          '</div>' +
          '<h2 class="chain-title">' + esc(chain.title) + '</h2>' +
          '<p class="chain-desc">' + esc(chain.description) + '</p>' +
          '<div class="chain-steps">' +
            steps.map((s, i) =>
              '<a class="chain-lnk" href="#/technique/' + encodeURIComponent(s.id) + '">' +
                '<span class="chain-lnk-n">' + (i + 1) + '</span>' +
                '<span class="chain-lnk-id">' + esc(s.id) + '</span>' +
                '<span class="chain-lnk-title">' + esc(s.title || '') + '</span>' +
              '</a>'
            ).join('<span class="chain-arrow">→</span>') +
          '</div>' +
        '</div>';
      }).join('');
  }

  // ── API / data ─────────────────────────────────────────────────────────────
  function renderApi() {
    const main = document.getElementById('main');
    const base = location.origin + location.pathname.replace(/[^/]*$/, '');

    main.innerHTML =
      '<div class="cat-head">' +
        '<h1 class="cat-title">API / data</h1>' +
        '<p class="cat-lead">All data is a static JSON file. No authentication. No rate limit. Use it freely.</p>' +
      '</div>' +
      '<div class="api-section">' +
        '<div class="d-section">' +
          '<h2>Endpoint</h2>' +
          '<pre><code>GET ' + esc(base) + 'data/cases.json</code></pre>' +
        '</div>' +
        '<div class="d-section">' +
          '<h2>Schema</h2>' +
          '<pre><code>' + esc(`[
  {
    "id":           "RC-001",           // Technique identifier
    "title":        "string",
    "category":     "string",
    "target":       "string",           // System / component targeted
    "status":       "Active | Partial | Historic | Model-dependent | Unverified",
    "severity":     "Critical | High | Medium | Low",
    "summary":      "string",
    "description":  "string",
    "atlas_id":     "AML.TXXXX.XXX",   // MITRE ATLAS (optional)
    "atlas_name":   "string",
    "owasp_ids":    ["LLM01", ...],    // OWASP LLM Top 10 2025
    "tags":         ["string"],
    "affected_models": ["string"],
    "poc_steps":    ["string"],
    "payload_example": "string",
    "defences":     ["string"],
    "references":   [{"title":"string","url":"string"}],
    "real_world_cases": ["string"],
    "lab": {                            // Present when lab scenario exists
      "terminal_title": "string",
      "clean_prompt":   "string",
      "inject_note":    "string",
      "vuln_responses": [{"delay": 500, "text": "string"}],
      "safe_response":  "string",
      "expected_evidence": "string"
    }
  }
]`) + '</code></pre>' +
        '</div>' +
        '<div class="d-section">' +
          '<h2>Filter examples</h2>' +
          '<pre><code>' + esc(
`// Active techniques only
const active = data.filter(r => r.status === 'Active');

// By OWASP category
const llm01 = data.filter(r => (r.owasp_ids||[]).includes('LLM01'));

// By ATLAS technique
const byAtlas = id => data.filter(r => r.atlas_id === id);

// Lab scenarios only
const labs = data.filter(r => r.lab);`) + '</code></pre>' +
        '</div>' +
      '</div>';
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g,
      c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

})();
