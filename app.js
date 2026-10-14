/* AIHACKBins app.js — horizontal-topbar layout, Option B "Concrete"
 * Static SPA. No build step. Hash router. data/cases.json drives everything.
 */
(function () {
  'use strict';

  let allRecords = [];
  let labCount = 0;

  // Filter state
  let fSearch = '';
  let fAtlas  = '';
  let fOwasp  = '';
  let fEvid   = '';
  let fSev    = '';

  // ── Boot ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    fetch('data/cases.json')
      .then(r => r.json())
      .then(data => {
        allRecords = data;
        labCount   = data.filter(r => r.lab).length;
        if (window.AIHACKBinsLab) window.AIHACKBinsLab.init(data);
        route();
      })
      .catch(err => {
        document.getElementById('main').innerHTML =
          '<p style="padding:40px 28px;color:var(--cobalt)">Failed to load cases.json: ' + esc(String(err)) + '</p>';
      });
    window.addEventListener('hashchange', route);
  });

  // ── Router ───────────────────────────────────────────────────────────
  function route() {
    window.scrollTo(0, 0);
    const raw   = location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/');
    const view  = parts[0] || '';
    const sub   = parts[1] ? decodeURIComponent(parts[1]) : null;

    document.querySelectorAll('.tnav-link[data-route]').forEach(a => {
      a.classList.toggle('active',
        a.dataset.route === 'lab'    ? view === 'lab'    :
        a.dataset.route === 'chains' ? view === 'chains' :
        a.dataset.route === 'api'    ? view === 'api'    :
        a.dataset.route === 'submit' ? view === 'submit' :
        a.dataset.route === 'about'  ? view === 'about'  :
        a.dataset.route === 'glossary' ? view === 'glossary' : false
      );
    });

    if      (view === '')              renderHome();
    else if (view === 'technique' && sub) renderDetail(sub);
    else if (view === 'lab')           { if (window.AIHACKBinsLab) window.AIHACKBinsLab.render(sub); }
    else if (view === 'chains')        renderChains();
    else if (view === 'api')           renderApi();
    else if (view === 'submit')        renderSubmit();
    else if (view === 'about')         renderAbout();
    else if (view === 'glossary')      renderGlossary();
    else document.getElementById('main').innerHTML = '<p style="padding:40px 28px">Not found.</p>';
  }

  // ── Theme ────────────────────────────────────────────────────────────
  function initTheme() {
    const stored = localStorage.getItem('aihb-theme');
    const sys    = window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    const saved  = stored || sys;
    document.documentElement.dataset.theme = saved;
    updateThemeBtn(saved);
    document.getElementById('theme-btn').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('aihb-theme', next);
      updateThemeBtn(next);
    });
  }
  function updateThemeBtn(t) {
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = t === 'dark' ? '☀ light' : '☾ dark';
  }

  // ── Mobile menu ──────────────────────────────────────────────────────
  function initMobileMenu() {
    const ham     = document.getElementById('hamburger');
    const menu    = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');
    function open()  { menu.hidden = false; overlay.classList.add('open'); ham.setAttribute('aria-expanded','true'); }
    function close() { menu.hidden = true;  overlay.classList.remove('open'); ham.setAttribute('aria-expanded','false'); }
    if (ham)     ham.addEventListener('click', open);
    if (overlay) overlay.addEventListener('click', close);
    if (menu)    menu.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', close));
  }

  // ── Home ─────────────────────────────────────────────────────────────
  function renderHome() {
    const active = allRecords.filter(r => r.status === 'Active').length;
    const atlasN = allRecords.filter(r => r.atlas_id).length;

    document.getElementById('main').innerHTML =
      // Hero
      '<section class="hero">' +
        '<div class="hero-left">' +
          '<p class="hero-eyebrow">AI &amp; LLM Attack Technique Reference</p>' +
          '<h1 class="hero-title">' +
            'Find a technique.<br>' +
            '<span class="accent">Copy the payload.</span><br>' +
            'Test the boundary.' +
          '</h1>' +
          '<p class="hero-sub">Reusable attack technique references informed by published research, mapped to MITRE ATLAS and OWASP LLM Top 10 2025. Security through obscurity is not security — open publication is how AI gets safer.</p>' +
          '<div class="hero-stats">' +
            '<div class="stat-chip"><span class="stat-chip-n">' + allRecords.length + '</span> techniques</div>' +
            '<div class="stat-chip"><span class="stat-chip-n">' + atlasN + '</span> ATLAS-mapped</div>' +
            '<div class="stat-chip"><span class="stat-chip-n">' + labCount + '</span> lab scenarios</div>' +
            '<div class="stat-chip"><span class="stat-chip-n">' + active + '</span> active findings</div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-right">' +
          '<div class="field-card">' +
            '<div class="field-card-head">AIHACKBins / Field mode</div>' +
            '<div class="field-card-body">' +
              '<div class="field-steps">' +
                '<div class="field-step"><span class="field-step-n">01</span> Select technique</div>' +
                '<div class="field-step"><span class="field-step-n">02</span> Copy input</div>' +
                '<div class="field-step"><span class="field-step-n">03</span> Apply with authorisation</div>' +
                '<div class="field-step"><span class="field-step-n">04</span> Capture observed result</div>' +
              '</div>' +
              '<p class="field-card-note"><strong>Evidence over claims.</strong>History is not current vulnerability status. Verify on your own system.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      // Technique index
      '<section class="index-section">' +
        '<p class="section-eyebrow">Technique index</p>' +
        '<h2 class="section-title">Explore the techniques</h2>' +
        '<p class="section-sub">Generic test inputs, real prerequisites, and original research links. Techniques mapped to applicable MITRE ATLAS and OWASP LLM 2025 categories.</p>' +
        '<div class="filter-row">' +
          '<input type="search" id="search-input" placeholder="Search technique, target, CVE, keyword…" autocomplete="off">' +
          '<select class="filter-select" id="f-atlas"><option value="">All ATLAS mappings</option>' + atlasOptions() + '</select>' +
          '<select class="filter-select" id="f-owasp"><option value="">All OWASP risks</option>' + owaspOptions() + '</select>' +
          '<select class="filter-select" id="f-evid"><option value="">All evidence types</option>' + evidOptions() + '</select>' +
          '<select class="filter-select" id="f-sev"><option value="">All severities</option>' +
            '<option value="Critical">Critical</option><option value="High">High</option>' +
            '<option value="Medium">Medium</option><option value="Low">Low</option>' +
          '</select>' +
        '</div>' +
        '<div id="table-host"></div>' +
      '</section>';

    bindFilters();
    renderTable();
  }


  // ── Dedicated About page ──────────────────────────────────────────
  function renderAbout() {
    document.getElementById('main').innerHTML =
      '<div class="inner-head"><a class="about-back" href="#/">← Technique catalogue</a><h1>About AIHACKBins</h1><p>An open, practical AI security reference for authorised assessment and red teaming.</p></div>' +
      '<section class="about-section">' +
        '<div class="about-inner">' +
          '<h2 class="about-title">Purpose and principles</h2>' +
          '<p class="about-body">AIHACKBins is an open reference of AI and LLM attack techniques — the thing GTFOBins is for Unix binaries, but for the AI attack surface. Each entry documents a testable security hypothesis, a copyable assessment input, and applicable MITRE ATLAS and OWASP LLM Top 10 2025 mappings. Scripts demonstrate the workflow but do not prove a vulnerability.</p>' +
          '<p class="about-body">The project collects legitimate inputs and prompt patterns that can be used to test boundary enforcement in AI systems — probing context isolation, tool authorisation, output filtering, and model behaviour under adversarial conditions.</p>' +
          '<p class="about-body about-principle"><strong>Kerckhoffs’s principle applied to AI:</strong> robust defences should remain effective even when their design and potential attack techniques are known. Publishing reproducible security research helps defenders assess real risks, improve controls and verify mitigations. Such information may also be misused, which is why AIHACKBins emphasises authorised testing and responsible disclosure.</p>' +
          '<p class="about-body">AIHACKBins is not a list of vulnerabilities. The models and systems listed are not vulnerable per se — this is a field reference for authorised testing and red-teaming, with the same spirit as <a class="about-link" href="https://gtfobins.github.io/" target="_blank" rel="noopener">GTFOBins</a> and <a class="about-link" href="https://lolbas-project.github.io/" target="_blank" rel="noopener">LOLBAS</a>.</p>' +
          '<div class="about-links">' +
            '<a class="about-pill" href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener">GitHub ↗</a>' +
            '<a class="about-pill" href="#/glossary">Glossary</a><a class="about-pill" href="#/api">JSON API</a>' +
            '<a class="about-pill" href="#/lab">Interactive Lab</a>' +
            '<a class="about-pill" href="#/chains">Attack Chains</a>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function atlasOptions() {
    const ids = [...new Set(allRecords.map(r => r.atlas_id).filter(Boolean))].sort();
    return ids.map(id => '<option value="' + esc(id) + '">' + esc(id) + '</option>').join('');
  }
  function owaspOptions() {
    const ids = [...new Set(allRecords.flatMap(r => r.owasp_ids || []))].sort();
    return ids.map(id => '<option value="' + esc(id) + '">' + esc(id) + '</option>').join('');
  }
  function evidOptions() {
    const vals = [...new Set(allRecords.map(r => r.status).filter(Boolean))].sort();
    return vals.map(v => '<option value="' + esc(v) + '">' + esc(v) + '</option>').join('');
  }

  function bindFilters() {
    const si = document.getElementById('search-input');
    const fa = document.getElementById('f-atlas');
    const fo = document.getElementById('f-owasp');
    const fe = document.getElementById('f-evid');
    const fs = document.getElementById('f-sev');
    if (si) { si.value = fSearch; si.addEventListener('input', () => { fSearch = si.value.trim().toLowerCase(); renderTable(); }); }
    if (fa) { fa.value = fAtlas;  fa.addEventListener('change', () => { fAtlas = fa.value; renderTable(); }); }
    if (fo) { fo.value = fOwasp;  fo.addEventListener('change', () => { fOwasp = fo.value; renderTable(); }); }
    if (fe) { fe.value = fEvid;   fe.addEventListener('change', () => { fEvid = fe.value; renderTable(); }); }
    if (fs) { fs.value = fSev;    fs.addEventListener('change', () => { fSev = fs.value; renderTable(); }); }
  }

  function filtered() {
    return allRecords.filter(r => {
      if (fSearch && !(
        r.id.toLowerCase().includes(fSearch) ||
        (r.title||'').toLowerCase().includes(fSearch) ||
        (r.target||'').toLowerCase().includes(fSearch) ||
        (r.tags||[]).some(t => t.toLowerCase().includes(fSearch)) ||
        (r.atlas_id||'').toLowerCase().includes(fSearch) ||
        (r.owasp_ids||[]).some(o => o.toLowerCase().includes(fSearch))
      )) return false;
      if (fAtlas && r.atlas_id !== fAtlas) return false;
      if (fOwasp && !(r.owasp_ids||[]).includes(fOwasp)) return false;
      if (fEvid  && r.status !== fEvid) return false;
      if (fSev   && r.severity !== fSev) return false;
      return true;
    });
  }

  function renderTable() {
    const host = document.getElementById('table-host');
    if (!host) return;
    const rows = filtered();
    if (!rows.length) { host.innerHTML = '<p class="empty-state">No techniques match the current filters.</p>'; return; }

    host.innerHTML =
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
        '<tbody>' + rows.map(techRow).join('') + '</tbody>' +
      '</table>';

    host.querySelectorAll('.tech-row').forEach(row => {
      row.addEventListener('click', () => { location.hash = '#/technique/' + encodeURIComponent(row.dataset.id); });
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.hash = '#/technique/' + encodeURIComponent(row.dataset.id); } });
    });
  }

  function techRow(r) {
    const sc = {'Active':'s-active','Partial':'s-partial','Historic':'s-historic','Model-dependent':'s-modeldep','Unverified':'s-unverif'}[r.status]||'s-unverif';
    return '<tr class="tech-row" data-id="' + esc(r.id) + '" tabindex="0">' +
      '<td class="td-id">'     + esc(r.id) + '</td>' +
      '<td class="td-title">'  + esc(r.title||'') + '</td>' +
      '<td class="td-target">' + esc(r.target||'') + '</td>' +
      '<td class="td-atlas">'  + esc(r.atlas_id||'') + '</td>' +
      '<td class="td-owasp">'  + (r.owasp_ids||[]).slice(0,2).map(o => '<span class="pill pill-owasp">' + esc(o) + '</span>').join(' ') + '</td>' +
      '<td class="td-status ' + sc + '">' + esc(r.status||'') + '</td>' +
      '<td class="td-lab">' + (r.lab ? '<span class="lab-dot" title="Lab available">●</span>' : '') + '</td>' +
    '</tr>';
  }

  // ── Detail ───────────────────────────────────────────────────────────
  function renderDetail(id) {
    const r = allRecords.find(x => x.id === id);
    const main = document.getElementById('main');
    if (!r) { main.innerHTML = '<p style="padding:40px 28px">Technique not found: ' + esc(id) + '</p>'; return; }

    const sc = {'Active':'s-active','Partial':'s-partial','Historic':'s-historic','Model-dependent':'s-modeldep','Unverified':'s-unverif'}[r.status]||'s-unverif';
    const hasPoc  = r.poc_steps && r.poc_steps.length;
    const hasDef  = r.defences  && r.defences.length;
    const hasRef  = r.references && r.references.length;
    const hasLab  = !!r.lab;

    main.innerHTML =
      '<div class="detail-wrap">' +
        '<div class="detail-head">' +
          '<div class="detail-head-top">' +
            '<span class="d-id">' + esc(r.id) + '</span>' +
            (r.status ? '<span class="d-status ' + sc + '">' + esc(r.status) + '</span>' : '') +
          '</div>' +
          '<h1 class="d-title">' + esc(r.title||'') + '</h1>' +
          '<div class="d-meta">' +
            (r.target ? '<span>' + esc(r.target) + '</span>' : '') +
            (r.category ? '<span>' + esc(r.category) + '</span>' : '') +
            (r.severity ? '<span class="sev-' + esc((r.severity||'').toLowerCase()) + '">' + esc(r.severity) + '</span>' : '') +
          '</div>' +
          '<div class="d-pills">' +
            (r.atlas_id ? '<a class="pill pill-atlas" href="https://atlas.mitre.org/techniques/' + encodeURIComponent(r.atlas_id) + '/" target="_blank" rel="noopener">' + esc(r.atlas_id) + (r.atlas_name ? ' — ' + esc(r.atlas_name) : '') + ' ↗</a>' : '') +
            (r.owasp_ids||[]).map(o => '<span class="pill pill-owasp">' + esc(o) + '</span>').join('') +
            (r.tags||[]).map(t => '<span class="pill pill-tag">' + esc(t) + '</span>').join('') +
          '</div>' +
        '</div>' +

        '<div class="dtab-bar" role="tablist">' +
          '<button class="dtab active" data-tab="overview" role="tab" aria-selected="true">Overview</button>' +
          (hasPoc ? '<button class="dtab" data-tab="poc" role="tab">Proof of Concept</button>' : '') +
          (hasDef ? '<button class="dtab" data-tab="defence" role="tab">Defence</button>' : '') +
          (hasRef ? '<button class="dtab" data-tab="references" role="tab">References</button>' : '') +
          (hasLab ? '<a class="dtab dtab-link" href="#/lab/' + encodeURIComponent(r.id) + '">Open lab ↗</a>' : '') +
        '</div>' +

        '<div class="d-cols">' +
          '<div class="d-main">' +

            '<div class="dpanel active" data-panel="overview">' +
              (r.payload
                ? '<div class="d-section payload-hero">' +
                    '<div class="payload-hero-head">' +
                      '<span class="payload-hero-lbl">Payload</span>' +
                      '<button class="payload-copy-btn" data-payload="' + esc(r.payload) + '">Copy</button>' +
                    '</div>' +
                    '<pre class="payload-hero-pre"><code>' + esc(r.payload) + '</code></pre>' +
                    (r.placement ? '<p class="payload-placement">' + esc(r.placement) + '</p>' : '') +
                  '</div>'
                : '') +
              (r.summary ? '<div class="d-section"><h2>Summary</h2><p>' + esc(r.summary) + '</p></div>' : '') +
              (r.description ? '<div class="d-section"><h2>Description</h2><p>' + esc(r.description) + '</p></div>' : '') +
              (r.observed ? '<div class="d-section"><h2>Observed behaviour</h2><p>' + esc(r.observed) + '</p></div>' : '') +
              (r.expected_test ? '<div class="d-section"><h2>Pass / fail criterion</h2><p>' + esc(r.expected_test) + '</p></div>' : '') +
              (r.real_world_cases && r.real_world_cases.length
                ? '<div class="d-section"><h2>Real-world cases</h2><ul class="d-list">' + r.real_world_cases.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul></div>'
                : '') +
            '</div>' +

            (hasPoc ? '<div class="dpanel" data-panel="poc">' +
              '<div class="d-section"><h2>Steps</h2><ol class="d-list">' + r.poc_steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol></div>' +
              (r.payload_example ? '<div class="d-section"><h2>Payload example</h2><pre><code>' + esc(r.payload_example) + '</code></pre></div>' : '') +
            '</div>' : '') +

            (hasDef ? '<div class="dpanel" data-panel="defence">' +
              '<div class="d-section"><h2>Mitigations</h2><ul class="d-list">' + r.defences.map(d => '<li>' + esc(d) + '</li>').join('') + '</ul></div>' +
            '</div>' : '') +

            (hasRef ? '<div class="dpanel" data-panel="references">' +
              '<div class="d-section"><h2>References</h2><ul class="d-list">' +
                r.references.map(ref =>
                  '<li>' + (ref.url
                    ? '<a href="' + esc(ref.url) + '" target="_blank" rel="noopener">' + esc(ref.title||ref.url) + ' ↗</a>'
                    : esc(ref.title||ref)) + '</li>'
                ).join('') +
              '</ul></div>' +
            '</div>' : '') +

            

          '</div>' +
          '<aside class="d-aside">' +
            '<div class="d-aside-section"><h3>Mappings</h3>' +
              (r.atlas_id ? '<div class="d-aside-row"><span class="d-aside-lbl">ATLAS</span><a href="https://atlas.mitre.org/techniques/' + encodeURIComponent(r.atlas_id) + '/" target="_blank" rel="noopener" class="d-aside-val">' + esc(r.atlas_id) + ' ↗</a></div>' : '') +
              (r.owasp_ids && r.owasp_ids.length ? '<div class="d-aside-row"><span class="d-aside-lbl">OWASP</span><span class="d-aside-val">' + r.owasp_ids.map(esc).join(', ') + '</span></div>' : '') +
            '</div>' +
            '<div class="d-aside-section"><h3>Details</h3>' +
              (r.severity ? '<div class="d-aside-row"><span class="d-aside-lbl">Severity</span><span class="d-aside-val sev-' + esc((r.severity||'').toLowerCase()) + '">' + esc(r.severity) + '</span></div>' : '') +
              (r.target ? '<div class="d-aside-row"><span class="d-aside-lbl">Target</span><span class="d-aside-val">' + esc(r.target) + '</span></div>' : '') +
              (r.status ? '<div class="d-aside-row"><span class="d-aside-lbl">Status</span><span class="d-aside-val ' + sc + '">' + esc(r.status) + '</span></div>' : '') +
              (r.affected_models && r.affected_models.length ? '<div class="d-aside-row"><span class="d-aside-lbl">Models</span><span class="d-aside-val">' + r.affected_models.map(esc).join(', ') + '</span></div>' : '') +
            '</div>' +
            '<div class="d-aside-section">' +
              '<a class="btn-ghost" href="#/">← Back to catalogue</a>' +
              (hasLab ? '<a class="btn-ghost" href="#/lab/' + encodeURIComponent(r.id) + '">Open in Lab →</a>' : '') +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</div>';

    // Payload copy button
    main.querySelectorAll('.payload-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.payload || '').then(() => {
          const orig = btn.textContent; btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        }).catch(() => {});
      });
    });

    // Tab switching
    const tabs   = main.querySelectorAll('.dtab');
    const panels = main.querySelectorAll('.dpanel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active'); tab.setAttribute('aria-selected','true');
        const target = main.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        if (target) {
          target.classList.add('active');
        }
      });
    });
  }

  // ── Chains ───────────────────────────────────────────────────────────
  function renderChains() {
    const chains = [
      {id:'chain-001',title:'Structured data to agent decisions',severity:'',desc:'Illustrative contexts, not a demonstrated end-to-end exploit.',steps:['RC-207','RC-214','RC-215']},
      {id:'chain-002',title:'External content injection paths',severity:'',desc:'Independent alternative attacker-controlled sources.',steps:['RC-219','RC-218','RC-208']},
      {id:'chain-003',title:'Multimodal and model metadata inputs',severity:'',desc:'Separate input boundary tests.',steps:['RC-213','RC-216']}
    ];
    document.getElementById('main').innerHTML =
      '<div class="inner-head"><h1>Attack chains</h1><p>Illustrative assessment relationships, not verified exploit chains. Each step links to a technique.</p></div>' +
      '<div class="chains-wrap">' +
        chains.map(c => {
          const steps = c.steps.map(sid => allRecords.find(r => r.id === sid)).filter(Boolean);
          return '<div class="chain-card">' +
            '<div class="chain-card-head"><span class="chain-id">' + esc(c.id) + '</span><span class="chain-sev sev-' + c.severity.toLowerCase() + '">' + esc(c.severity) + '</span></div>' +
            '<h2 class="chain-title">' + esc(c.title) + '</h2>' +
            '<p class="chain-desc">' + esc(c.desc) + '</p>' +
            '<div class="chain-steps">' +
              steps.map((s,i) =>
                '<a class="chain-lnk" href="#/technique/' + encodeURIComponent(s.id) + '">' +
                  '<span class="chain-lnk-n">' + (i+1) + '</span>' +
                  '<span class="chain-lnk-id">' + esc(s.id) + '</span>' +
                  '<span class="chain-lnk-title">' + esc(s.title||'') + '</span>' +
                '</a>' + (i < steps.length-1 ? '<span class="chain-arrow">→</span>' : '')
              ).join('') +
            '</div></div>';
        }).join('') +
      '</div>';
  }

  // ── API ──────────────────────────────────────────────────────────────
  function renderApi() {
    const base = location.origin + location.pathname.replace(/[^/]*$/,'');
    document.getElementById('main').innerHTML =
      '<div class="inner-head"><h1>API / data</h1><p>Public static JSON datasets. No authentication is needed. Access may still be subject to Cloudflare rate limits.</p></div>' +
      '<div class="api-wrap">' +
        '<div class="d-section"><h2>Endpoint</h2><pre><code>GET ' + esc(base) + 'data/cases.json</code></pre></div>' +
        '<div class="d-section"><h2>Schema</h2><pre><code>' + esc(`[
  {
    "id":              "RC-201",
    "title":           "string",
    "category":        "string",
    "target":          "string",
    "status":          "Unverified | Active | Partially-patched | Model-dependent | Historic",
    "severity":        "Critical | High | Medium | Low",
    "summary":         "string",
    "description":     "string",
    "atlas_id":        "AML.TXXXX.XXX",   // MITRE ATLAS (optional)
    "atlas_name":      "string",
    "owasp_ids":       ["LLM01", ...],    // OWASP LLM Top 10 2025
    "tags":            ["string"],
    "affected_models": ["string"],
    "poc_steps":       ["string"],
    "payload_example": "string",
    "defences":        ["string"],
    "references":      [{"title":"string","url":"string"}],
    "real_world_cases":["string"],
    "lab": {
      "terminal_title":    "string",
      "clean_prompt":      "string",
      "inject_note":       "string",
      "vuln_responses":    [{"delay":500,"text":"string"}],
      "safe_response":     "string",
      "expected_evidence": "string"
    }
  }
]`) + '</code></pre></div>' +
        '<div class="d-section"><h2>Examples</h2><pre><code>' + esc(
`// Independently verified techniques (currently none)
data.filter(r => r.model_tested && r.model_tested.length)

// By OWASP category
data.filter(r => (r.owasp_ids||[]).includes('LLM01'))

// By ATLAS technique
data.filter(r => r.atlas_id === 'AML.T0051.001')

// Lab scenarios only
data.filter(r => r.lab)`) + '</code></pre></div>' +
      '</div>';
  }

  // ── Submit ───────────────────────────────────────────────────────────
  function renderSubmit() {
    const schema = `{
  "id":              "RC-XXX",            // required — next available ID
  "title":           "Short technique name",
  "category":        "Prompt Injection | Jailbreak | Extraction | ...",
  "target":          "System prompt | Tool calls | Training data | ...",
  "status":          "Unverified | Active | Partially-patched | Model-dependent | Historic",
  "severity":        "Critical | High | Medium | Low",
  "atlas_id":        "AML.T0051.001",     // MITRE ATLAS ID — omit if none
  "atlas_name":      "Indirect Prompt Injection",
  "owasp_ids":       ["LLM01"],           // OWASP LLM Top 10 2025
  "tags":            ["keyword"],
  "summary":         "One-sentence description of what the technique does.",
  "payload":         "The literal string to submit to the model.",
  "placement":       "Where to place the payload — e.g. user turn, system context, RAG doc.",
  "expected_test":   "PASS if response includes X. FAIL if model refuses or outputs Y.",
  "observed":        "What a vulnerable model does when the payload is submitted.",
  "defense":         "Primary mitigation.",
  "blue_team":       "Detection / monitoring note.",
  "poc_steps":       ["Step 1", "Step 2", "Step 3"],
  "defences":        ["Mitigation A", "Mitigation B"],
  "references":      [{"title": "Paper title", "url": "https://..."}],
  "affected_models": ["GPT-4o", "Claude 3", "..."],
  "real_world_cases":["CVE or incident reference"],

  // Optional — include if you have a reproducible lab scenario
  "lab": {
    "terminal_title":    "Short label for the terminal header",
    "clean_prompt":      "The benign prompt the model would see without injection.",
    "inject_note":       "One-line description of how the payload is embedded.",
    "vuln_responses": [
      {"delay": 700, "text": "Vulnerable model output — must include a CANARY_STRING_HERE."}
    ],
    "safe_response":     "What a patched or well-configured model should say instead.",
    "expected_evidence": "The canary string that proves injection succeeded."
  }
}`;

    const checklist = [
      'Payload is a literal string — copy-pasteable, not pseudocode',
      'expected_test has a clear PASS / FAIL criterion with observable evidence',
      'A canary string (SCREAMING_SNAKE_CASE) is present in vuln_responses if a lab block is included',
      'ATLAS and OWASP mappings are filled where applicable',
      'You have tested the payload against at least one real model on a system you own or are authorised to assess',
      'References point to published research, CVEs, or public incident reports — not anonymous claims',
    ];

    document.getElementById('main').innerHTML =
      '<div class="inner-head">' +
        '<h1>Submit a technique</h1>' +
        '<p>AIHACKBins grows through community contributions. Every entry must meet the GTFOBins quality bar: real payload, real target, observable pass/fail evidence, and published research or a reproducible test to back it up.</p>' +
      '</div>' +
      '<div class="api-wrap">' +

        '<div class="d-section">' +
          '<h2>How to contribute</h2>' +
          '<ol class="submit-steps">' +
            '<li><strong>Fork</strong> the repository on GitHub: <a class="about-link" href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener">github.com/AIHACKBins/AIHACKBins ↗</a></li>' +
            '<li><strong>Add your entry</strong> to <code>data/cases.json</code> — one object appended to the array, following the schema below.</li>' +
            '<li><strong>Check the quality bar</strong> using the checklist below.</li>' +
            '<li><strong>Open a pull request</strong> with the title: <code>[New technique] RC-XXX — Your technique title</code></li>' +
          '</ol>' +
        '</div>' +

        '<div class="d-section">' +
          '<h2>Quality checklist</h2>' +
          '<ul class="submit-checklist">' +
            checklist.map(item => '<li>' + esc(item) + '</li>').join('') +
          '</ul>' +
        '</div>' +

        '<div class="d-section">' +
          '<h2>Entry schema</h2>' +
          '<p class="submit-note">Copy this template, fill in every required field, and delete comments before adding to cases.json. The <code>lab</code> block is optional but strongly encouraged — it is what makes an entry interactive.</p>' +
          '<div class="submit-schema-wrap">' +
            '<button class="payload-copy-btn" id="schema-copy-btn">Copy schema</button>' +
            '<pre class="submit-schema-pre"><code id="schema-code">' + esc(schema) + '</code></pre>' +
          '</div>' +
        '</div>' +

        '<div class="d-section">' +
          '<h2>Naming conventions</h2>' +
          '<table class="submit-table">' +
            '<thead><tr><th>Prefix</th><th>Category</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>RC-</td><td>Runtime / inference-time techniques (prompt injection, jailbreak, extraction)</td></tr>' +
              '<tr><td>SC-</td><td>Supply chain and training-time attacks (data poisoning, model theft)</td></tr>' +
              '<tr><td>INF-</td><td>Infrastructure-level attacks (model serving, API abuse)</td></tr>' +
            '</tbody>' +
          '</table>' +
          '<p class="submit-note">Use the next available number in the sequence. Check the current highest ID in <code>cases.json</code> before opening your PR.</p>' +
        '</div>' +

        '<div class="d-section">' +
          '<h2>What we do not accept</h2>' +
          '<ul class="submit-checklist submit-reject">' +
            '<li>Techniques without a concrete, literal payload — "ask the model to ignore its instructions" is not an entry</li>' +
            '<li>Entries with no PASS / FAIL criterion — the expected output must be observable and specific</li>' +
            '<li>Claims without a reference — at minimum, cite a public paper, CVE, or published incident</li>' +
            '<li>Techniques that require the reviewer to break any law or access systems they do not own</li>' +
          '</ul>' +
        '</div>' +

        '<div class="d-section">' +
          '<a class="submit-cta" href="https://github.com/AIHACKBins/AIHACKBins/issues/new?title=%5BNew+technique%5D+RC-XXX+%E2%80%94+&labels=new-technique&template=technique_submission.md" target="_blank" rel="noopener">Open a GitHub issue to discuss first ↗</a>' +
          '<a class="submit-cta submit-cta-ghost" href="https://github.com/AIHACKBins/AIHACKBins/fork" target="_blank" rel="noopener">Fork the repo and start a PR ↗</a>' +
        '</div>' +

      '</div>';

    const copyBtn = document.getElementById('schema-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(schema).then(() => {
          const orig = copyBtn.textContent; copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = orig; }, 1500);
        }).catch(() => {});
      });
    }
  }


  // Alphabetised, filterable reference glossary. No network access required.
  const glossaryTerms = [{"term": "AIHACKBins", "category": "Project", "definition": "An open, GTFOBins-inspired reference of AI security assessment techniques, prompts, and guided labs.", "technique": null}, {"term": "RC", "category": "Identifiers", "definition": "Research Case: the AIHACKBins identifier prefix (for example RC-221). An ID is not a confirmed vulnerability.", "technique": null}, {"term": "LLM", "category": "AI basics", "definition": "Large Language Model: a model trained to generate and work with text and related content.", "technique": null}, {"term": "Prompt", "category": "AI basics", "definition": "Instructions and context supplied to an AI model.", "technique": null}, {"term": "System prompt", "category": "AI basics", "definition": "High-priority instructions defined by the application or model operator.", "technique": null}, {"term": "Prompt injection", "category": "Attacks", "definition": "An attempt to redirect a model using attacker-controlled instructions.", "technique": "RC-203"}, {"term": "Indirect prompt injection", "category": "Attacks", "definition": "Instructions embedded in lower-trust content such as emails, documents, web pages, or tool results.", "technique": "RC-208"}, {"term": "Invisible Prompt Injection", "category": "Attacks", "definition": "Prompt injection hidden in characters or encodings that may not be obvious in rendered text.", "technique": "RC-221"}, {"term": "Unicode Tag characters", "category": "Encoding", "definition": "Unicode characters in U+E0000–U+E007F that can carry encoded text while remaining visually hidden in many interfaces.", "technique": "RC-221"}, {"term": "ASCII smuggling", "category": "Encoding", "definition": "Encoding visible ASCII instructions into Unicode characters that may bypass a superficial text review.", "technique": "RC-221"}, {"term": "Severity manipulation", "category": "Attacks", "definition": "Attempting to bias an AI-generated security severity recommendation instead of evaluating actual technical impact.", "technique": "RC-221"}, {"term": "Canary", "category": "Testing", "definition": "A harmless, distinctive string used to identify whether unexpected instructions were followed.", "technique": null}, {"term": "Control input", "category": "Testing", "definition": "An otherwise identical baseline without the attack payload, used to compare results.", "technique": null}, {"term": "Verification status", "category": "Evidence", "definition": "An indication of whether testing has actually been performed, not whether an attack technique exists.", "technique": null}, {"term": "Research Case vs vulnerability", "category": "Evidence", "definition": "A documented technique or research case does not establish that a named current product is vulnerable.", "technique": null}, {"term": "Proof of Concept (PoC)", "category": "Evidence", "definition": "A demonstration with enough detail and evidence to reproduce a reported behaviour.", "technique": null}, {"term": "False positive", "category": "Evidence", "definition": "An apparent issue that is not substantiated by the technical evidence.", "technique": null}, {"term": "Scripted simulation", "category": "Evidence", "definition": "A predetermined demonstration output. It does not execute a live attack or test a model.", "technique": null}, {"term": "OWASP LLM Top 10 2025", "category": "Frameworks", "definition": "A risk taxonomy for LLM applications; classification is not proof of exploitability.", "technique": null}, {"term": "LLM01", "category": "Frameworks", "definition": "Prompt Injection, the first OWASP Top 10 for LLM Applications 2025 category.", "technique": "RC-221"}, {"term": "LLM02", "category": "Frameworks", "definition": "Sensitive Information Disclosure in LLM applications.", "technique": "RC-210"}, {"term": "LLM03", "category": "Frameworks", "definition": "Supply Chain vulnerabilities affecting LLM applications.", "technique": "RC-216"}, {"term": "LLM04", "category": "Frameworks", "definition": "Data and Model Poisoning.", "technique": null}, {"term": "LLM05", "category": "Frameworks", "definition": "Improper Output Handling.", "technique": null}, {"term": "LLM06", "category": "Frameworks", "definition": "Excessive Agency, when AI systems have excessive or insufficiently constrained abilities.", "technique": "RC-214"}, {"term": "LLM07", "category": "Frameworks", "definition": "System Prompt Leakage.", "technique": null}, {"term": "LLM08", "category": "Frameworks", "definition": "Vector and Embedding Weaknesses.", "technique": null}, {"term": "LLM09", "category": "Frameworks", "definition": "Misinformation.", "technique": null}, {"term": "LLM10", "category": "Frameworks", "definition": "Unbounded Consumption.", "technique": null}, {"term": "MITRE ATLAS", "category": "Frameworks", "definition": "An AI-focused knowledge base of adversary tactics and techniques.", "technique": null}, {"term": "AML.T0051.001", "category": "Frameworks", "definition": "An ATLAS technique identifier commonly associated with indirect prompt injection.", "technique": "RC-221"}, {"term": "MITRE ATT&CK", "category": "Frameworks", "definition": "A separate knowledge base of adversary behaviour; it is not interchangeable with MITRE ATLAS.", "technique": null}, {"term": "RAG", "category": "AI architecture", "definition": "Retrieval Augmented Generation: a model generates answers using retrieved external material.", "technique": null}, {"term": "Vector database", "category": "AI architecture", "definition": "A datastore for numerical embeddings used in similarity search and retrieval.", "technique": null}, {"term": "Embedding", "category": "AI architecture", "definition": "A numerical representation of text or other content, used for retrieval or machine learning.", "technique": null}, {"term": "MCP", "category": "AI architecture", "definition": "Model Context Protocol, which connects AI clients to tools and resources.", "technique": null}, {"term": "Tool call", "category": "AI architecture", "definition": "A structured request by an AI application to execute a defined tool or function.", "technique": null}, {"term": "Agent", "category": "AI architecture", "definition": "An application that uses a model to select and execute steps or invoke tools.", "technique": null}, {"term": "Jailbreak", "category": "Attacks", "definition": "A prompt intended to bypass model behavioural safeguards.", "technique": "RC-201"}, {"term": "Many-shot jailbreak", "category": "Attacks", "definition": "A jailbreak that uses many examples to encourage a model to imitate an undesired response pattern.", "technique": "RC-201"}, {"term": "GCG", "category": "Attacks", "definition": "Greedy Coordinate Gradient: an optimisation method for generating adversarial suffixes.", "technique": "RC-220"}, {"term": "Model card", "category": "AI supply chain", "definition": "Documentation describing a model, its intended usage, limitations and metadata.", "technique": "RC-216"}, {"term": "Payload", "category": "Testing", "definition": "The exact text, file content or request supplied for an assessment.", "technique": null}, {"term": "Attack chain", "category": "Testing", "definition": "A collection or sequence of techniques; a diagram alone is not proof of an end-to-end exploit.", "technique": null}, {"term": "Hacking with AI", "category": "Project", "definition": "Using AI to support authorised security research, reconnaissance or test planning.", "technique": null}, {"term": "Hacking AI", "category": "Project", "definition": "Assessing the security boundaries and behaviours of AI-enabled systems.", "technique": null}];
  function renderGlossary() {
    const main = document.getElementById('main');
    main.innerHTML = '<div class="inner-head"><a class="about-back" href="#/">← Technique catalogue</a><h1>Glossary</h1><p>Terms and classifications used throughout AIHACKBins. Technique links open the relevant reference.</p></div>' +
      '<section class="glossary-wrap"><label class="glossary-label" for="glossary-search">Search glossary</label><input id="glossary-search" class="glossary-search" type="search" placeholder="Search RC, Unicode, RAG, MCP, OWASP…" autocomplete="off" aria-controls="glossary-results"><p class="glossary-count" id="glossary-count"></p><div id="glossary-results"></div></section>';
    const input = document.getElementById('glossary-search');
    const host = document.getElementById('glossary-results');
    const count = document.getElementById('glossary-count');
    function update() {
      const query = input.value.trim().toLowerCase();
      const rows = glossaryTerms.filter(t => (t.term + ' ' + t.category + ' ' + t.definition).toLowerCase().includes(query)).sort((a,b) => a.term.localeCompare(b.term));
      count.textContent = rows.length + ' terms';
      host.innerHTML = rows.length ? rows.map(t => '<article class="glossary-entry"><div class="glossary-term-row"><h2>'+esc(t.term)+'</h2><span class="glossary-category">'+esc(t.category)+'</span></div><p>'+esc(t.definition)+'</p>'+(t.technique && allRecords.some(r=>r.id===t.technique) ? '<a class="glossary-related" href="#/technique/'+encodeURIComponent(t.technique)+'">View '+esc(t.technique)+' →</a>' : '')+'</article>').join('') : '<p class="empty-state">No terms match that search.</p>';
    }
    input.addEventListener('input',update);
    update();
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function esc(s) {
    return String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

})();
