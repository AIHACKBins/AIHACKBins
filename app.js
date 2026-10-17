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
  let fTrack  = '';
  let fCapability = '';
  let statusSort = null; // null = catalogue order; 'asc' / 'desc' = Status

  // ── Clipboard helper (with textarea fallback for HTTP) ───────────────
  function copyText(text, btn) {
    const succeed = () => {
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
    };
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); succeed(); } catch(e) {}
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(succeed).catch(fallback);
    } else { fallback(); }
  }

  // Local-only exports: nothing is uploaded or stored by AIHACKBins.
  function downloadLocal(filename, content, mime='text/plain;charset=utf-8') {
    const blob=new Blob([content],{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  // ── Scroll buttons ───────────────────────────────────────────────────
  function initScrollButtons() {
    const wrap = document.getElementById('scroll-btns');
    const up   = document.getElementById('scroll-up');
    const dn   = document.getElementById('scroll-dn');
    if (!wrap || !up || !dn) return;
    const update = () => {
      const scrolled = window.scrollY > 240;
      wrap.classList.toggle('visible', scrolled);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    up.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    dn.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  }

  // ── Boot ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollButtons();
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

    // ── Keyboard shortcuts (/  = focus search, r = random technique) ─
    document.addEventListener('keydown', e => {
      const tag = (document.activeElement || {}).tagName || '';
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (document.activeElement || {}).isContentEditable;
      if (e.key === '/' && !inInput) {
        e.preventDefault();
        const s = document.getElementById('payload-search') || document.getElementById('search-input');
        if (s) { s.focus(); s.select(); } else { location.hash = '#/payloads'; }
      }
      if (e.key === 'r' && !inInput) {
        const r = allRecords[Math.floor(Math.random() * allRecords.length)];
        if (r) location.hash = '#/technique/' + encodeURIComponent(r.id);
      }
    });
  });

  // ── Router ───────────────────────────────────────────────────────────
  function route() {
    window.scrollTo(0, 0);
    const raw   = location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/');
    const view  = parts[0] || '';
    const sub   = parts[1] ? decodeURIComponent(parts[1]) : null;

    document.querySelectorAll('[data-route]').forEach(a => {
      a.classList.toggle('active',
        a.dataset.route === 'home'     ? view === ''         :
        a.dataset.route === 'lab'      ? view === 'lab'      :
        a.dataset.route === 'chains'   ? view === 'chains'   :
        a.dataset.route === 'api'      ? view === 'api'      :
        a.dataset.route === 'submit'   ? view === 'submit'   :
        a.dataset.route === 'about'    ? view === 'about'    :
        a.dataset.route === 'glossary' ? view === 'glossary' :
        a.dataset.route === 'baseline' ? view === 'baseline' :
        a.dataset.route === 'atlas'    ? view === 'atlas'    :
        a.dataset.route === 'payloads' ? view === 'payloads' : false
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
    else if (view === 'baseline')      renderBaseline();
    else if (view === 'atlas')         renderAtlasExplorer();
    else if (view === 'payloads')      renderPayloadBrowser(sub);
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
    if (ham)     ham.addEventListener('click', () => menu.hidden ? open() : close());
    if (overlay) overlay.addEventListener('click', close);
    if (menu)    menu.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { close(); ham.focus(); } });
  }

  // ── Home ─────────────────────────────────────────────────────────────
  function renderHome() {
    const coverage = allRecords.filter(r => (r.aitg_ids||[]).length).length;
    const atlasN = allRecords.filter(r => r.atlas_id).length;
    const atlasUnique = new Set(allRecords.map(r=>r.atlas_id).filter(Boolean)).size;
    const aitgUnique = new Set(allRecords.flatMap(r=>r.aitg_ids||[])).size;

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
          '<div class="hero-intro">' +
            '<p><strong>AIHACKBins</strong> is an open-source, community-driven knowledge base of practical techniques for attacking AI systems and using AI in authorised security testing.</p>' +
            '<p>The project collects reusable payloads, assessment procedures and scenarios covering LLMs, autonomous agents, MCP integrations, RAG, machine-learning models and AI infrastructure. Entries provide testing conditions and evidence guidance, with applicable <a href="#/atlas">MITRE ATLAS</a>, <a href="#/baseline">OWASP LLM Top 10 (2025) and AI Testing Guide</a> mappings.</p>' +
            '<p>Inspired by <a href="https://gtfobins.github.io/" target="_blank" rel="noopener noreferrer">GTFOBins ↗</a> and <a href="#/about">Kerckhoffs’s principle</a>, AIHACKBins welcomes <a href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener noreferrer">community contributions ↗</a> that improve open, reproducible security knowledge.</p>' +
          '</div>' +
          '<p class="hero-disclaimer"><strong>Not a list of guaranteed exploits.</strong> Outcomes depend on the target model and configuration; research citations and simulated labs do not prove that a given system is vulnerable.</p>' +
          '<p class="hero-creator">Created by <a href="https://www.linkedin.com/in/asifminhasnl/" target="_blank" rel="noopener noreferrer">Asif Nawaz Minhas <span aria-hidden="true">↗</span></a><span class="hero-creator-divider" aria-hidden="true">·</span><a href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener noreferrer">Contribute on GitHub <span aria-hidden="true">↗</span></a></p>' +
          '<form class="hero-quick-search" id="hero-quick-search" role="search"><label for="hero-query">Find a practical payload</label><div class="hero-search-row"><input type="search" id="hero-query" placeholder="Search RC ID, agent, MCP, RAG, image…" aria-label="Find a payload"><button type="submit">Search payloads →</button></div></form>' +
          '<div class="hero-targets" aria-label="Browse by target type"><span>Testing target</span><button type="button" data-target="chatbot">Chatbots</button><button type="button" data-target="application">AI Applications</button><button type="button" data-target="agent">AI Agents / MCP</button><a href="#/payloads">All AI/ML techniques →</a></div>' +
          '<div class="hero-stats">' +
            '<div class="stat-chip"><span class="stat-chip-n">' + allRecords.length + '</span> techniques</div>' +
                        '<div class="stat-chip"><span class="stat-chip-n">' + labCount + '</span> illustrated labs</div>' +
                                    '<a class="stat-chip" href="#/baseline" title="Browse AITG objectives in the testing baseline">32 baseline objectives</a>' +
            '<button class="stat-chip stat-chip-random" id="random-btn" title="Jump to a random technique">⚄ random</button>' +
          '</div>' +
        '</div>' +
        '<div class="hero-right">' +
          '<div class="hero-community-actions" aria-label="GitHub community actions">' +
            '<a href="https://github.com/AIHACKBins/AIHACKBins/fork" target="_blank" rel="noopener noreferrer" aria-label="Fork AIHACKBins on GitHub">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="3" r="2"/><path d="M6 5v12"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="6" r="2"/><path d="M18 8a6 6 0 0 1-6 6H6"/></svg> Fork</a>' +
            '<a href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener noreferrer" aria-label="Star AIHACKBins on GitHub">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z"/></svg> Star</a>' +
            '<a href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener noreferrer" aria-label="View AIHACKBins on GitHub">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.11.77-.24.77-.54v-2.08c-3.12.68-3.78-1.32-3.78-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.49-.28-5.11-1.24-5.11-5.54 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.08 1.14a10.75 10.75 0 0 1 5.6 0c2.14-1.44 3.08-1.14 3.08-1.14.61 1.53.23 2.67.11 2.95.71.78 1.15 1.77 1.15 2.99 0 4.31-2.62 5.25-5.12 5.53.4.35.76 1.02.76 2.07v3.08c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z"/></svg> GitHub ↗</a>' +
          '</div>' +
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
          '<select class="filter-select" id="f-track"><option value="">Both tracks</option><option value="Hacking AI systems">Hacking AI systems</option><option value="Hacking with AI">Hacking with AI</option></select>' +
          '<select class="filter-select" id="f-atlas"><option value="">All ATLAS mappings</option>' + atlasOptions() + '</select>' +
          '<select class="filter-select" id="f-owasp"><option value="">All OWASP risks</option>' + owaspOptions() + '</select>' +
          '<select class="filter-select" id="f-evid"><option value="">All evidence types</option>' +
            '<option value="Published disclosure">Published disclosure</option>' +
            '<option value="Research referenced">Research referenced</option>' +
            '<option value="Assessment workflow">Assessment workflow</option>' +
            '<option value="Assessment candidate">Assessment candidate</option>' +
          '</select>' +
          '<select class="filter-select" id="f-sev"><option value="">All severities</option>' +
            '<option value="Critical">Critical</option><option value="High">High</option>' +
            '<option value="Medium">Medium</option><option value="Low">Low</option>' +
          '</select>' +
        '</div>' +
        '<div class="capability-filter" aria-label="Capability filters"><span>Capabilities</span>' +
          ['All','Prompt injection','Agent / MCP','RAG / data','Model security','Supply chain','Resource abuse','AI-assisted testing'].map((label,i)=>'<button type="button" class="capability-chip" data-cap="'+(i===0?'':label)+'">'+label+'</button>').join('') + '</div>' +
        '<p class="catalogue-evidence-note">Select any technique to see its payload and test conditions. <a href="#/payloads">Browse payloads directly →</a> · Status describes source provenance, not independent reproduction. <a href="#/about">Verification policy ↗</a></p>' +
        '<div id="table-host"></div>' +
      '</section>';

    bindFilters();
    renderTable();
    const homeSearch=document.getElementById('hero-quick-search');if(homeSearch)homeSearch.addEventListener('submit',e=>{e.preventDefault();const q=homeSearch.querySelector('#hero-query').value.trim();try{sessionStorage.setItem('aihackbins-payload-query',q);}catch(_){window.__payloadSearchFromHome=q;}location.hash='#/payloads';});
    document.querySelectorAll('.hero-targets [data-target]').forEach(b=>b.addEventListener('click',()=>{try{sessionStorage.setItem('aihackbins-payload-target',b.dataset.target);}catch(_){window.__payloadTargetFromHome=b.dataset.target;}location.hash='#/payloads';}));
    const randBtn = document.getElementById('random-btn');
    if (randBtn) randBtn.addEventListener('click', () => {
      const r = allRecords[Math.floor(Math.random() * allRecords.length)];
      if (r) location.hash = '#/technique/' + encodeURIComponent(r.id);
    });
  }


  // ── GTFOBins-inspired payload browser: visible real inputs, no execution ──
  function renderPayloadBrowser(initialId) {
    const main = document.getElementById('main');
    const sorted = allRecords.slice().sort((a,b) => (a.title||'').localeCompare(b.title||''));
    let selectedId = sorted.some(r => r.id===initialId) ? initialId : (sorted[0]||{}).id;
    let query = '', track = '', capability = '', targetType = '', variantIndex = 0;
    try{query=sessionStorage.getItem('aihackbins-payload-query')||'';sessionStorage.removeItem('aihackbins-payload-query');}catch(_){query=window.__payloadSearchFromHome||'';window.__payloadSearchFromHome='';}
    try{targetType=sessionStorage.getItem('aihackbins-payload-target')||'';sessionStorage.removeItem('aihackbins-payload-target');}catch(_){targetType=window.__payloadTargetFromHome||'';window.__payloadTargetFromHome='';}
    const capabilities = ['Prompt injection','Tool abuse','Data leakage','RAG / retrieval','Model security','Supply chain','Resource abuse','AI-assisted testing'];
    const capRules = {
      'Prompt injection': /prompt.injection|jailbreak|instruction.override|roleplay|unicode|obfuscat|encoding|context.eviction|many.shot|split.instruction/i,
      'Tool abuse': /agent|mcp|tool|plugin|function.call|config|webhook/i,
      'Data leakage': /leak|disclos|exfil|privacy|membership|inversion|sensitive.data|tenant/i,
      'RAG / retrieval': /rag|retriev|embedding|vector|document.poison/i,
      'Model security': /model|evasion|inference|adversarial|training|fine.tun/i,
      'Supply chain': /supply.chain|model.card|artifact|registry|skill|dependency|repository/i,
      'Resource abuse': /resource|exhaust|cost|amplif|token|denial.of.service/i,
      'AI-assisted testing': /hacking with ai|ai.assisted|source.to.sink|endpoint.inventory/i
    };
    function classify(r){
      const v=[r.title,r.category,r.summary,r.mechanism,r.target,r.track,...(r.tags||[])].filter(Boolean).join(' ');
      return capabilities.filter(c=>capRules[c].test(v));
    }
    const variantsFor=r=>[
      {name:'Main input',payload:r.payload||r.payload_example||'',placement:r.placement,expected:r.finding_criteria||r.expected_test},
      ...(r.variants||[]).filter(v=>v.payload && v.payload!==(r.payload||r.payload_example))
    ];
    const safeArtifact=r=>r.artifact_path && /^fixtures\/[a-zA-Z0-9._/-]+$/.test(r.artifact_path) ? r.artifact_path : '';
    main.innerHTML='<section class="payload-browser">'+
      '<div class="inner-head"><a class="about-back" href="#/">← Technique catalogue</a><h1>Payloads</h1><p>Search a technique, select it, and copy its actual assessment input. No login, installation or simulated lab required.</p></div>'+
      '<div class="payload-browser-filter"><input id="payload-search" type="search" autocomplete="off" placeholder="Search technique, RC ID, category, target or capability…" aria-label="Search payloads"><select id="payload-track" aria-label="Filter project track"><option value="">Both project tracks</option><option value="Hacking AI systems">Hacking AI systems</option><option value="Hacking with AI">Hacking with AI</option></select></div>'+
      '<fieldset class="payload-capabilities"><legend>Testing target</legend><div id="payload-target-buttons" class="payload-capability-buttons"><button type="button" data-target="">All targets</button><button type="button" data-target="chatbot">Chatbots</button><button type="button" data-target="application">AI Applications</button><button type="button" data-target="agent">AI Agents / MCP</button></div></fieldset>'+
      '<fieldset class="payload-capabilities"><legend>Functions</legend><div id="payload-capability-buttons" class="payload-capability-buttons"></div></fieldset>'+
      '<div class="payload-browser-layout"><aside class="payload-browser-list" aria-label="Technique results"><div class="payload-list-count" id="payload-count" role="status" aria-live="polite"></div><div id="payload-items"></div></aside><div class="payload-browser-preview" id="payload-preview" aria-live="polite"></div></div>'+
      '</section>';
    const input=main.querySelector('#payload-search'), trackSel=main.querySelector('#payload-track');
    input.value=query;
    const list=main.querySelector('#payload-items'), count=main.querySelector('#payload-count'), preview=main.querySelector('#payload-preview');
    const targetBox=main.querySelector('#payload-target-buttons');
    function syncTargetButtons(){targetBox.querySelectorAll('[data-target]').forEach(b=>{const on=b.dataset.target===targetType;b.classList.toggle('is-selected',on);b.setAttribute('aria-pressed',String(on));});}
    targetBox.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>{targetType=b.dataset.target;syncTargetButtons();redraw();}));syncTargetButtons();
    const capBox=main.querySelector('#payload-capability-buttons');
    capBox.innerHTML='<button type="button" data-cap="" aria-pressed="true" class="payload-capability is-selected">All functions</button>'+capabilities.map(c=>'<button type="button" class="payload-capability" data-cap="'+esc(c)+'" aria-pressed="false">'+esc(c)+'</button>').join('');
    function syncHash(id){
      const desired='#/payloads/'+encodeURIComponent(id);
      if(location.hash!==desired) history.replaceState(null,'',desired);
    }
    function matchesTarget(r){
      if(!targetType)return true;
      const v=[r.title,r.category,r.summary,r.target,r.mechanism,r.applies_to,...(r.tags||[])].filter(Boolean).join(' ').toLowerCase();
      if(targetType==='chatbot')return /chatbot|chat assistant|conversational|llm|prompt|jailbreak|roleplay|system instruction|translation|many.shot/.test(v);
      if(targetType==='agent')return /agent|mcp|plugin|tool|workflow|function.call|autonomous|skill|webhook/.test(v);
      if(targetType==='application')return /applicat|api|rag|retriev|document|upload|email|web|json|model|database|integration|endpoint/.test(v);
      return true;
    }
    function matching(){
      const q=query.toLowerCase();
      return sorted.filter(r=>(!track||(r.track||'Hacking AI systems')===track)&&matchesTarget(r)&&(!capability||classify(r).includes(capability))&&
        (!q||[r.id,r.title,r.category,r.target,r.summary,r.atlas_id,...(r.tags||[])].filter(Boolean).join(' ').toLowerCase().includes(q)));
    }
    function renderList(){
      const found=matching();
      if(!found.some(r=>r.id===selectedId)) {selectedId=(found[0]||{}).id||null;variantIndex=0;}
      if(selectedId) syncHash(selectedId); else if(location.hash!=='#/payloads') history.replaceState(null,'','#/payloads');
      count.textContent=found.length+' of '+sorted.length+' techniques';
      list.innerHTML=found.length?found.map(r=>'<button class="payload-result'+(r.id===selectedId?' is-selected':'')+'" type="button" data-rc="'+esc(r.id)+'" aria-current="'+(r.id===selectedId?'true':'false')+'"><span class="payload-result-id">'+esc(r.id)+'</span><span class="payload-result-title">'+esc(r.title)+'</span><span aria-hidden="true" class="payload-result-chevron">›</span></button>').join(''):'<p class="payload-no-results">No techniques match. Try a broader term or clear the filters.</p>';
      list.querySelectorAll('[data-rc]').forEach(btn=>btn.addEventListener('click',()=>selectRecord(btn.dataset.rc,true)));
      return found;
    }
    function selectRecord(id,focus){
      selectedId=id;variantIndex=0;syncHash(id);renderList();renderPreview();
      if(focus){const b=[...list.querySelectorAll('[data-rc]')].find(x=>x.dataset.rc===id);if(b)b.focus();}
    }
    function renderPreview(){
      const r=allRecords.find(z=>z.id===selectedId);
      if(!r){preview.innerHTML='<div class="payload-empty" role="status"><h2>No matching payload</h2><p>Adjust the search or capability filters to view an input.</p></div>';return;}
      const vs=variantsFor(r),v=vs[Math.min(variantIndex,vs.length-1)],artifact=safeArtifact(r);
      const isFile=r.input_type==='file'&&!!artifact,payload=v.payload||'';
      const inputKind=isFile?'Downloadable file':r.input_type==='generator'?'Generator / local script':r.input_type==='dataset'?'Dataset / procedure':r.input_type==='url'?'URL / endpoint':r.input_type==='audio'?'Audio transcript / media':r.input_type==='json'?'JSON payload':(r.input_type==='workflow'||r.entry_kind==='workflow'||r.track==='Hacking with AI')?'Assessment workflow':'Direct text payload';
      const copyLabel=r.input_type==='generator'?'Copy generator command':r.input_type==='file'&&artifact?'Copy supporting text':inputKind==='Assessment workflow'?'Copy procedure':r.input_type==='json'?'Copy JSON':r.input_type==='dataset'?'Copy dataset example':'Copy payload';
      preview.innerHTML='<div class="payload-preview-top"><span class="payload-preview-id">'+esc(r.id)+'</span><span class="payload-preview-provenance">'+esc(r.evidence_status||'Assessment candidate')+'</span></div>'+
        '<h2>'+esc(r.title)+'</h2><p class="payload-preview-desc">'+esc(r.summary||r.description||'')+'</p>'+
        '<div class="payload-preview-tags"><span>'+esc(inputKind)+'</span>'+(r.atlas_id?'<a href="https://atlas.mitre.org/techniques/'+encodeURIComponent(r.atlas_id)+'" target="_blank" rel="noopener noreferrer">'+esc(r.atlas_id)+' ↗</a>':'')+(r.owasp_ids||[]).map(id=>'<span>'+esc(id)+'</span>').join('')+'</div>'+
        (vs.length>1?'<label class="payload-variant-label" for="payload-variant">Payload context</label><select id="payload-variant">'+vs.map((x,i)=>'<option value="'+i+'"'+(i===variantIndex?' selected':'')+'>'+esc(x.name||'Variant '+(i+1))+'</option>').join('')+'</select>':'')+
        '<div class="payload-code-head"><strong>'+esc(inputKind)+'</strong><button class="payload-action" id="payload-copy" type="button">'+esc(copyLabel)+'</button></div>'+
        '<pre class="payload-visible-code"><code id="payload-visible-text">'+esc(payload)+'</code></pre>'+
        (r.input_type==='file'&&!artifact?'<p class="payload-file-note">This technique requires a file, but no downloadable fixture is bundled. The supporting text is not itself a file upload.</p>':'')+
        (artifact?'<p class="payload-file-note">Supply the downloaded file to a compatible, authorised target. A filename or textual representation is not a substitute for the file.</p><a class="payload-download" download href="'+esc(artifact)+'">↓ Download test file</a>':'')+
        (r.input_type==='generator'?'<p class="payload-file-note">Execute this generator locally only where authorised. AIHACKBins does not execute it.</p>':'')+
        '<div class="payload-context"><h3>Where to use it</h3><p>'+esc(v.placement||r.placement||r.applies_to||r.target||'')+'</p><h3>What establishes a finding</h3><p>'+esc(v.expected_test||v.expected||r.finding_criteria||r.expected_test||'')+'</p></div>'+
        '<div class="payload-browser-links"><a href="#/technique/'+encodeURIComponent(r.id)+'">Full technique details →</a>'+(r.lab?'<a href="#/lab/'+encodeURIComponent(r.id)+'">Optional simulated lab →</a>':'')+'</div>'+
        '<p class="payload-browser-disclaimer">Research cited here supports the general mechanism unless the source explicitly documents this exact scenario. No adapted payload is independently reproduced merely by being listed.</p>';
      preview.querySelector('#payload-copy').addEventListener('click',e=>copyText(payload,e.currentTarget));
      const select=preview.querySelector('#payload-variant');if(select)select.addEventListener('change',()=>{variantIndex=Number(select.value)||0;renderPreview();});
    }
    function redraw(){renderList();renderPreview();}
    input.addEventListener('input',()=>{query=input.value.trim();redraw();});
    trackSel.addEventListener('change',()=>{track=trackSel.value;redraw();});
    capBox.querySelectorAll('[data-cap]').forEach(btn=>btn.addEventListener('click',()=>{
      capability=btn.dataset.cap;
      capBox.querySelectorAll('[data-cap]').forEach(b=>{const on=b.dataset.cap===capability;b.classList.toggle('is-selected',on);b.setAttribute('aria-pressed',String(on));});
      redraw();
    }));
    list.addEventListener('keydown',e=>{
      const buttons=[...list.querySelectorAll('[data-rc]')];const idx=buttons.indexOf(document.activeElement);
      if(idx<0)return;
      let next=idx;
      if(e.key==='ArrowDown')next=Math.min(buttons.length-1,idx+1);
      else if(e.key==='ArrowUp')next=Math.max(0,idx-1);
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=buttons.length-1;
      else return;
      e.preventDefault();buttons[next].focus();
    });
    redraw();
  }

  // ── Dedicated About page ──────────────────────────────────────────
  function renderAbout() {
    document.getElementById('main').innerHTML =
      '<div class="inner-head"><a class="about-back" href="#/">← Technique catalogue</a><h1>About AIHACKBins</h1></div>' +
      '<section class="about-section">' +
        '<div class="about-inner">' +
          '<div class="about-what">' +
            '<p class="about-body"><strong>AIHACKBins</strong> is an open, <a class="about-link" href="https://gtfobins.github.io/" target="_blank" rel="noopener">GTFOBins</a>-inspired reference for hacking AI systems and using AI in authorised security testing. Find a technique, copy the input, test the boundary and capture real evidence. Simulated labs are optional and do not run a model.</p>' +
            '<p class="about-body">Use it for authorised red-teaming, boundary testing, and building detection rules. Not a vulnerability database — a field reference.</p>' +
            '<p class="about-body"><strong>Project creator:</strong> Asif Nawaz Minhas · <a class="about-link" href="https://www.linkedin.com/in/asifminhasnl/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>. AIHACKBins welcomes community contributions through <a class="about-link" href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener noreferrer">GitHub ↗</a>.</p>' +
          '</div>' +
          '<div class="about-what"><h2>Kerckhoffs’s principle — openness over obscurity</h2>' +
            '<p class="about-body">Auguste Kerckhoffs argued that a security system should remain secure even when its design is known; its safety must not depend on hiding how it works. AIHACKBins follows that spirit by openly documenting techniques, prerequisites, safe test inputs, original research and the evidence needed to assess real security boundaries.</p>' +
            '<p class="about-body"><strong>Open knowledge. Practical techniques. Verifiable evidence.</strong> We distinguish published disclosures, research demonstrations and unverified assessment candidates. A MITRE ATLAS, OWASP LLM or OWASP AI Testing Guide mapping is classification, not independent validation. Not every technique applies to every AI architecture.</p>' +
            '<p class="about-body"><strong>Two tracks:</strong> Hacking AI systems (LLMs, agents, RAG, models, data and infrastructure) and Hacking with AI (AI-assisted authorised security assessment). Research proposals should never be mistaken for demonstrated exploit success.</p></div>' +
          '<div class="about-what" id="responsible-use"><h2>Responsible use and disclaimer</h2>' +
            '<p class="about-body">AIHACKBins is provided for education, defensive research and <strong>lawful, expressly authorised security assessments</strong>. Obtain written permission, respect assessment scope, privacy, data protection rules and applicable law. Never use these techniques against systems or data without authorisation.</p>' +
            '<p class="about-body">The maintainers and contributors do not authorise, encourage or endorse illegal or harmful use, and are not responsible for actions undertaken independently by users, to the extent permitted by applicable law. Information, test inputs and simulations are supplied <strong>as-is</strong>, without warranties of accuracy, suitability or success. Nothing here constitutes legal advice or guarantees exclusion of liability.</p>' +
            '<p class="about-body">Full policy: <a class="about-link" href="RESPONSIBLE_USE.md" target="_blank" rel="noopener">Responsible Use and Disclaimer ↗</a>.</p></div>' +
          '<div class="about-what"><h2>Related research directories</h2>' +
            '<p class="about-body"><a class="about-link" href="https://lolol.farm/" target="_blank" rel="noopener noreferrer">lolol.farm ↗</a> indexes Living-off-the-Land security research projects. It is a useful example of cross-project discovery, not an AIHACKBins payload source or endorsement. Its listings include <a class="about-link" href="https://lolskills.io/" target="_blank" rel="noopener noreferrer">LOLSkills ↗</a>, a separate project focused on reviewing AI-agent skill bundles.</p></div>' +
          '<div class="about-grid">' +
            '<div class="about-block">' +
              '<h2>Contribute</h2>' +
              '<p>Fork the repo, add an entry to <code>cases.json</code>, and open a pull request. Every entry needs a literal payload, an observable result, and a published reference.</p>' +
              '<a class="about-pill" href="https://github.com/AIHACKBins/AIHACKBins" target="_blank" rel="noopener">GitHub ↗</a>' +
              '<a class="about-pill" href="#/submit">Submission guide</a>' +
            '</div>' +
            '<div class="about-block">' +
              '<h2>Data</h2>' +
              '<p>Everything is static JSON. <code>data/cases.json</code> is the single source of truth. No login, no rate limits, no tracking.</p>' +
              '<a class="about-pill" href="#/api">API docs</a>' +
              '<a class="about-pill" href="#/glossary">Glossary</a>' +
            '</div>' +
            '<div class="about-block">' +
              '<h2>Lab</h2>' +
              '<p>Every technique with a <code>lab</code> block has an in-browser simulation. No model is contacted; all example outcomes are authored illustrations, not findings.</p>' +
              '<a class="about-pill" href="#/lab">Open lab →</a>' +
            '</div>' +
            '<div class="about-block">' +
              '<h2>Responsible use</h2>' +
              '<p>Test only systems you own or are authorised to assess. Publishing techniques openly is how AI security improves — the same reasoning as GTFOBins and LOLBAS.</p>' +
              '<a class="about-pill" href="https://github.com/AIHACKBins/AIHACKBins/blob/main/LICENSE" target="_blank" rel="noopener">License ↗</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }


  function evidenceShort(status){return ({'Published disclosure':'Published','Research referenced':'Research','Assessment candidate':'Candidate','Assessment workflow':'Workflow'})[status]||'Candidate';}
  function evidenceClass(status){
    return ({'Published disclosure':'s-active','Research referenced':'s-modeldep','Assessment candidate':'s-unverif','Assessment workflow':'s-partial'})[status]||'s-unverif';
  }
  function capabilityMatch(r,cap) {
    const s = [r.title,r.category,r.target,r.mechanism,...(r.tags||[])].join(' ').toLowerCase();
    if(cap==='AI-assisted testing') return r.track==='Hacking with AI';
    if(cap==='Prompt injection') return /prompt injection|instruction override|jailbreak|obfuscation|unicode|encoded|roleplay|many.shot|injection/.test(s);
    if(cap==='Agent / MCP') return /agent|mcp|tool|plugin|webhook|skill|chat embed|memory|function/.test(s);
    if(cap==='RAG / data') return /rag|retriev|embedding|dataset|tenant|data |document|corpus|cache|exfil|leak|training/.test(s);
    if(cap==='Model security') return /model|inference|adversarial|membership|inversion|backdoor|extraction|rlhf|fine.tun/.test(s);
    if(cap==='Supply chain') return /supply.chain|model card|artifact|registry|package|dependency/.test(s);
    if(cap==='Resource abuse') return /cost|token|resource|denial|flood|recursive|amplification|exhaust/.test(s);
    return true;
  }

  // ATLAS Explorer displays only IDs actually present in the catalogue. It does
  // not infer official tactics or assert coverage of the entire ATLAS matrix.
  function renderAtlasExplorer(){
    const main=document.getElementById('main');
    const groups=[...new Set(allRecords.map(r=>r.atlas_id).filter(Boolean))].sort();
    const unlinked=allRecords.filter(r=>!r.atlas_id);
    main.innerHTML='<section class="atlas-explorer"><nav class="d-breadcrumb"><a href="#/">Catalogue</a><span> / </span><span>ATLAS Explorer</span></nav>'+
      '<p class="section-eyebrow">Coverage explorer</p><h1 class="section-title">AIHACKBins × MITRE ATLAS</h1>'+
      '<p class="section-sub">Browse official ATLAS IDs referenced by AIHACKBins. Select a cell to see matching practical entries; mapping does not establish exploitation or independent verification. This is a catalogue coverage view, not the complete official tactic matrix.</p>'+
      '<div class="atlas-explorer-tools"><input id="atlas-search" type="search" placeholder="Filter by ATLAS ID, title, RC or keyword..." aria-label="Filter ATLAS-mapped techniques"><a class="atlas-official" href="https://atlas.mitre.org/matrices/ATLAS-matrix" target="_blank" rel="noopener">Official ATLAS matrix ↗</a></div>'+
      '<div class="atlas-explorer-summary">'+groups.length+' distinct ATLAS IDs · '+allRecords.filter(r=>r.atlas_id).length+' mapped records · '+unlinked.length+' records without an ATLAS mapping</div>'+
      '<div id="atlas-cells" class="atlas-cells"></div><div id="atlas-results" class="atlas-results" aria-live="polite"></div>'+
      '<p class="atlas-footnote">Official tactic assignments and completeness are maintained by MITRE. Entries without a justified ATLAS relationship remain unmapped rather than receiving an invented identifier.</p></section>';
    const search=main.querySelector('#atlas-search'),cells=main.querySelector('#atlas-cells'),results=main.querySelector('#atlas-results');
    let selected=null;
    function draw(){
      const q=search.value.trim().toLowerCase();
      const relevant=groups.filter(id=>{
        const rows=allRecords.filter(r=>r.atlas_id===id);
        return !q||id.toLowerCase().includes(q)||rows.some(r=>(r.id+' '+r.title+' '+r.atlas_name).toLowerCase().includes(q));
      });
      cells.innerHTML=relevant.map(id=>{const rows=allRecords.filter(r=>r.atlas_id===id);return '<button class="atlas-cell'+(selected===id?' chosen':'')+'" data-atlas="'+esc(id)+'"><span class="atlas-cell-id">'+esc(id)+'</span><span class="atlas-cell-name">'+esc(rows.find(r=>r.atlas_name)?.atlas_name||'ATLAS technique')+'</span><span class="atlas-cell-count">'+rows.length+' RC '+(rows.length===1?'entry':'entries')+'</span></button>';}).join('')||'<p>No mapped techniques match your search.</p>';
      cells.querySelectorAll('.atlas-cell').forEach(btn=>btn.addEventListener('click',()=>{selected=selected===btn.dataset.atlas?null:btn.dataset.atlas;draw();}));
      if(!selected){results.innerHTML='<p>Select an ATLAS cell to open its corresponding AIHACKBins techniques.</p>';return;}
      const rows=allRecords.filter(r=>r.atlas_id===selected);
      results.innerHTML='<div class="atlas-result-head"><h2>'+esc(selected)+' · '+rows.length+' mapped entries</h2><a target="_blank" rel="noopener" href="https://atlas.mitre.org/techniques/'+encodeURIComponent(selected)+'/">View official ATLAS technique ↗</a></div>'+rows.map(r=>'<a class="atlas-result-row" href="#/technique/'+encodeURIComponent(r.id)+'"><span>'+esc(r.id)+'</span><strong>'+esc(r.title)+'</strong><small>'+esc(r.evidence_status)+'</small><span aria-hidden="true">↗</span></a>').join('');
    }
    search.addEventListener('input',draw);draw();
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

  function saveFilterState() {
    try { sessionStorage.setItem('aihb-filters', JSON.stringify({fSearch,fAtlas,fOwasp,fEvid,fSev,fTrack,fCapability})); } catch(e) {}
  }
  function restoreFilterState() {
    try {
      const s = sessionStorage.getItem('aihb-filters');
      if (!s) return;
      const f = JSON.parse(s);
      fSearch = f.fSearch || ''; fAtlas = f.fAtlas || '';
      fOwasp  = f.fOwasp  || ''; fEvid  = f.fEvid  || ''; fSev = f.fSev || ''; fTrack = f.fTrack || ''; fCapability = f.fCapability || '';
    } catch(e) {}
  }
  function bindFilters() {
    restoreFilterState();
    const si = document.getElementById('search-input');
    const fa = document.getElementById('f-atlas');
    const fo = document.getElementById('f-owasp');
    const fe = document.getElementById('f-evid');
    const fs = document.getElementById('f-sev');
    const ft = document.getElementById('f-track');
    if (si) { si.value = fSearch; si.addEventListener('input', () => { fSearch = si.value.trim().toLowerCase(); saveFilterState(); renderTable(); }); }
    if (fa) { fa.value = fAtlas;  fa.addEventListener('change', () => { fAtlas = fa.value; saveFilterState(); renderTable(); }); }
    if (fo) { fo.value = fOwasp;  fo.addEventListener('change', () => { fOwasp = fo.value; saveFilterState(); renderTable(); }); }
    if (fe) { fe.value = fEvid;   fe.addEventListener('change', () => { fEvid = fe.value; saveFilterState(); renderTable(); }); }
    if (fs) { fs.value = fSev;    fs.addEventListener('change', () => { fSev = fs.value; saveFilterState(); renderTable(); }); }
    if (ft) { ft.value = fTrack; ft.addEventListener('change', () => { fTrack = ft.value; saveFilterState(); renderTable(); }); }
    document.querySelectorAll('.capability-chip').forEach(btn=>btn.addEventListener('click',()=>{fCapability=btn.dataset.cap;saveFilterState();renderTable();}));
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
      if (fTrack && r.track !== fTrack) return false;
      if (fAtlas && r.atlas_id !== fAtlas) return false;
      if (fOwasp && !(r.owasp_ids||[]).includes(fOwasp)) return false;
      if (fEvid  && r.evidence_status !== fEvid) return false;
      if (fCapability && !capabilityMatch(r,fCapability)) return false;
      if (fSev   && r.severity !== fSev) return false;
      return true;
    });
  }

  function renderTable() {
    const host = document.getElementById('table-host');
    if (!host) return;
    const rows = filtered();
    document.querySelectorAll('.capability-chip').forEach(b=>{const selected=b.dataset.cap===fCapability;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
    if (statusSort) {
      const factor = statusSort === 'asc' ? 1 : -1;
      rows.sort((a, b) => factor * ((a.evidence_status || '').localeCompare(b.evidence_status || '') || a.id.localeCompare(b.id)));
    }
    if (!rows.length) { host.innerHTML = '<p class="empty-state">No techniques match the current filters.</p>'; return; }

    host.innerHTML =
      '<table class="tech-table">' +
        '<thead><tr>' +
          '<th class="th-id">ID</th>' +
          '<th class="th-title">Technique</th>' +
          '<th class="th-target">Target</th>' +
          '<th class="th-atlas">ATLAS</th>' +
          '<th class="th-owasp">OWASP</th>' +
          '<th class="th-status" aria-sort="' + (statusSort === 'asc' ? 'ascending' : statusSort === 'desc' ? 'descending' : 'none') + '"><button class="status-sort-btn" type="button" aria-label="Sort by research provenance" title="Sort by status (click to reverse)">Status <span class="sort-arrow" aria-hidden="true">' + (statusSort === 'asc' ? '↑' : statusSort === 'desc' ? '↓' : '↕') + '</span></button></th>' +
          '<th class="th-lab">Lab</th>' +
          '<th class="th-copy"></th>' +
        '</tr></thead>' +
        '<tbody>' + rows.map(techRow).join('') + '</tbody>' +
      '</table>';

    const sortButton = host.querySelector('.status-sort-btn');
    if (sortButton) sortButton.addEventListener('click', () => {
      statusSort = statusSort === 'asc' ? 'desc' : 'asc';
      renderTable();
    });
    host.querySelectorAll('.tech-row').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('.row-copy-btn')) return; // handled separately
        location.hash = '#/technique/' + encodeURIComponent(row.dataset.id);
      });
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.hash = '#/technique/' + encodeURIComponent(row.dataset.id); } });
    });
    host.querySelectorAll('.row-copy-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        copyText(btn.dataset.payload || '', btn);
      });
    });
  }

  function techRow(r) {
    const sc = evidenceClass(r.evidence_status);
    const pl = r.payload || r.payload_example || '';
    const payloadPreview = pl.slice(0, 120).replace(/\s+/g,' ').trim();
    return '<tr class="tech-row" data-id="' + esc(r.id) + '" tabindex="0" title="' + esc(r.title||'') + '">' +
      '<td class="td-id">'     + esc(r.id) + '</td>' +
      '<td class="td-title">'  + esc(r.title||'') + '</td>' +
      '<td class="td-target">' + esc(r.target||'') + '</td>' +
      '<td class="td-atlas">'  + esc(r.atlas_id||'') + '</td>' +
      '<td class="td-owasp">'  + (r.owasp_ids||[]).slice(0,2).map(o => '<span class="pill pill-owasp">' + esc(o) + '</span>').join(' ') + '</td>' +
      '<td class="td-status ' + sc + '" title="'+esc(r.evidence_status||'Assessment candidate')+'; independently reproduced: no">' + esc(evidenceShort(r.evidence_status)) + '</td>' +
      '<td class="td-lab">' + (r.lab ? '<a class="lab-dot" href="#/lab/' + encodeURIComponent(r.id) + '" title="Open lab" onclick="event.stopPropagation()">⬡</a>' : '') + '</td>' +
      '<td class="td-copy">' + (pl ? '<button class="row-copy-btn" data-payload="' + esc(pl) + '" title="' + esc(payloadPreview) + '…">⎘</button>' : '') + '</td>' +
    '</tr>';
  }

  const aitgTestingGuidance = {"AITG-APP-01":{"id":"AITG-APP-01","name":"Prompt Injection","access":"Black-box / grey-box","execute":"Submit a clean legitimate task, then introduce the conflicting instruction in the intended direct or lower-trust channel.","interpret":"Observe a higher-priority instruction conflict; text echoed from a document alone is not proof of bypass.","remediate":"Examine prompt boundaries, data provenance, and application-side enforcement.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-01_Testing_for_Prompt_Injection.md"},"AITG-APP-02":{"id":"AITG-APP-02","name":"Indirect Prompt Injection","access":"Black-box / grey-box","execute":"Submit a clean legitimate task, then introduce the conflicting instruction in the intended direct or lower-trust channel.","interpret":"Observe a higher-priority instruction conflict; text echoed from a document alone is not proof of bypass.","remediate":"Examine prompt boundaries, data provenance, and application-side enforcement.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-02_Testing_for_Indirect_Prompt_Injection.md"},"AITG-APP-03":{"id":"AITG-APP-03","name":"Sensitive Data Leak","access":"Black-box / grey-box","execute":"Seed a known, non-sensitive canary accessible only in one security context; test isolation with a second context.","interpret":"Treat only the exact controlled canary or verified protected data crossing the boundary as disclosure.","remediate":"Apply access checks, tenant isolation, redaction and retention controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-03_Testing_for_Sensitive_Data_Leak.md"},"AITG-APP-04":{"id":"AITG-APP-04","name":"Input Leakage","access":"Black-box / grey-box","execute":"Seed a known, non-sensitive canary accessible only in one security context; test isolation with a second context.","interpret":"Treat only the exact controlled canary or verified protected data crossing the boundary as disclosure.","remediate":"Apply access checks, tenant isolation, redaction and retention controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-04_Testing_for_Input_Leakage.md"},"AITG-APP-05":{"id":"AITG-APP-05","name":"Unsafe Outputs","access":"Black-box / grey-box","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-05_Testing_for_Unsafe_Outputs.md"},"AITG-APP-06":{"id":"AITG-APP-06","name":"Agentic Behavior Limits","access":"Grey-box recommended","execute":"Use two synthetic accounts or narrowly scoped test tools; compare authorised and unauthorised invocation paths.","interpret":"Record actual tool invocation and policy decision, not just the model stating it has taken action.","remediate":"Enforce scope, approval and least privilege in the tool/API layer.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-06_Testing_for_Agentic_Behavior_Limits.md"},"AITG-APP-07":{"id":"AITG-APP-07","name":"Prompt Disclosure","access":"Black-box / grey-box","execute":"Seed a known, non-sensitive canary accessible only in one security context; test isolation with a second context.","interpret":"Treat only the exact controlled canary or verified protected data crossing the boundary as disclosure.","remediate":"Apply access checks, tenant isolation, redaction and retention controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-07_Testing_for_Prompt_Disclosure.md"},"AITG-APP-08":{"id":"AITG-APP-08","name":"Embedding Manipulation","access":"Grey-box recommended","execute":"Prepare matched clean and poisoned artefacts in a disposable test environment; verify the altered input was ingested.","interpret":"Demonstrate the difference on held-out tasks and verify the affected ingestion or provenance boundary.","remediate":"Validate artefact provenance, integrity and access controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-08_Testing_for_Embedding_Manipulation.md"},"AITG-APP-09":{"id":"AITG-APP-09","name":"Model Extraction","access":"Grey-box recommended","execute":"Use a scoped inference query allowance or synthetic model artefact and validate permissions in a controlled environment.","interpret":"Measure surrogate agreement against a held-out set or demonstrate unauthorised artefact access.","remediate":"Constrain API usage; enforce storage/API authorisation and audit.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-09_Testing_for_Model_Extraction.md"},"AITG-APP-10":{"id":"AITG-APP-10","name":"Content Bias","access":"Black-box / grey-box","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-10_Testing_for_Content_Bias.md"},"AITG-APP-11":{"id":"AITG-APP-11","name":"Hallucinations","access":"Black-box / grey-box","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-11_Testing_for_Hallucinations.md"},"AITG-APP-12":{"id":"AITG-APP-12","name":"Toxic Output","access":"Black-box / grey-box","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-12_Testing_for_Toxic_Output.md"},"AITG-APP-13":{"id":"AITG-APP-13","name":"Over-Reliance on AI","access":"Black-box / grey-box","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-13_Testing_for_Over-Reliance_on_AI.md"},"AITG-APP-14":{"id":"AITG-APP-14","name":"Explainability and Interpretability","access":"Black-box / grey-box","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-14_Testing_for_Explainability_and_Interpretability.md"},"AITG-DAT-01":{"id":"AITG-DAT-01","name":"Training Data Exposure","access":"Black-box / grey-box","execute":"Seed a known, non-sensitive canary accessible only in one security context; test isolation with a second context.","interpret":"Treat only the exact controlled canary or verified protected data crossing the boundary as disclosure.","remediate":"Apply access checks, tenant isolation, redaction and retention controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-01_Testing_for_Training_Data_Exposure.md"},"AITG-DAT-02":{"id":"AITG-DAT-02","name":"Runtime Exfiltration","access":"Grey-box recommended","execute":"Seed a known, non-sensitive canary accessible only in one security context; test isolation with a second context.","interpret":"Treat only the exact controlled canary or verified protected data crossing the boundary as disclosure.","remediate":"Apply access checks, tenant isolation, redaction and retention controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-02_Testing_for_Runtime_Exfiltration.md"},"AITG-DAT-03":{"id":"AITG-DAT-03","name":"Dataset Diversity and Coverage","access":"White-box / research","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-03_Testing_for_Dataset_Diversity_and_Coverage.md"},"AITG-DAT-04":{"id":"AITG-DAT-04","name":"Harmful Content in Data","access":"White-box / research","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-04_Testing_for_Harmful_Content_in_Data.md"},"AITG-DAT-05":{"id":"AITG-DAT-05","name":"Data Minimization and Consent","access":"White-box / research","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-05_Testing_for_Data_Minimization_and_Consent.md"},"AITG-INF-01":{"id":"AITG-INF-01","name":"Supply Chain Tampering","access":"Grey-box recommended","execute":"Prepare matched clean and poisoned artefacts in a disposable test environment; verify the altered input was ingested.","interpret":"Demonstrate the difference on held-out tasks and verify the affected ingestion or provenance boundary.","remediate":"Validate artefact provenance, integrity and access controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-01_Testing_for_Supply_Chain_Tampering.md"},"AITG-INF-02":{"id":"AITG-INF-02","name":"Resource Exhaustion","access":"Grey-box recommended","execute":"Agree capped request, token, time and cost budgets before the test; observe resource usage with monitoring enabled.","interpret":"Measure consumed resources and whether quotas, throttling, or circuit breakers activated.","remediate":"Limit budgets, parallel requests and autonomous tool loops.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-02_Testing_for_Resource_Exhaustion.md"},"AITG-INF-03":{"id":"AITG-INF-03","name":"Plugin Boundary Violations","access":"Grey-box recommended","execute":"Use two synthetic accounts or narrowly scoped test tools; compare authorised and unauthorised invocation paths.","interpret":"Record actual tool invocation and policy decision, not just the model stating it has taken action.","remediate":"Enforce scope, approval and least privilege in the tool/API layer.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-03_Testing_for_Plugin_Boundary_Violations.md"},"AITG-INF-04":{"id":"AITG-INF-04","name":"Capability Misuse","access":"Grey-box recommended","execute":"Use two synthetic accounts or narrowly scoped test tools; compare authorised and unauthorised invocation paths.","interpret":"Record actual tool invocation and policy decision, not just the model stating it has taken action.","remediate":"Enforce scope, approval and least privilege in the tool/API layer.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-04_Testing_for_Capability_Misuse.md"},"AITG-INF-05":{"id":"AITG-INF-05","name":"Fine-tuning Poisoning","access":"White-box / research","execute":"Prepare matched clean and poisoned artefacts in a disposable test environment; verify the altered input was ingested.","interpret":"Demonstrate the difference on held-out tasks and verify the affected ingestion or provenance boundary.","remediate":"Validate artefact provenance, integrity and access controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-05_Testing_for_Fine-tuning_Poisoning.md"},"AITG-INF-06":{"id":"AITG-INF-06","name":"Dev-Time Model Theft","access":"Grey-box recommended","execute":"Use a scoped inference query allowance or synthetic model artefact and validate permissions in a controlled environment.","interpret":"Measure surrogate agreement against a held-out set or demonstrate unauthorised artefact access.","remediate":"Constrain API usage; enforce storage/API authorisation and audit.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-06_Testing_for_Dev-Time_Model_Theft.md"},"AITG-MOD-01":{"id":"AITG-MOD-01","name":"Evasion Attacks","access":"White-box / research","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-01_Testing_for_Evasion_Attacks.md"},"AITG-MOD-02":{"id":"AITG-MOD-02","name":"Runtime Model Poisoning","access":"White-box / research","execute":"Prepare matched clean and poisoned artefacts in a disposable test environment; verify the altered input was ingested.","interpret":"Demonstrate the difference on held-out tasks and verify the affected ingestion or provenance boundary.","remediate":"Validate artefact provenance, integrity and access controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-02_Testing_for_Runtime_Model_Poisoning.md"},"AITG-MOD-03":{"id":"AITG-MOD-03","name":"Poisoned Training Sets","access":"White-box / research","execute":"Prepare matched clean and poisoned artefacts in a disposable test environment; verify the altered input was ingested.","interpret":"Demonstrate the difference on held-out tasks and verify the affected ingestion or provenance boundary.","remediate":"Validate artefact provenance, integrity and access controls.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-03_Testing_for_Poisoned_Training_Sets.md"},"AITG-MOD-04":{"id":"AITG-MOD-04","name":"Membership Inference","access":"White-box / research","execute":"Use consenting, known member and non-member synthetic samples and pre-agreed measurement criteria.","interpret":"Report statistical metrics and uncertainty rather than treating a single confident prediction as proof.","remediate":"Review privacy controls, output minimisation and training protections.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-04_Testing_for_Membership_Inference.md"},"AITG-MOD-05":{"id":"AITG-MOD-05","name":"Inversion Attacks","access":"White-box / research","execute":"Use consenting, known member and non-member synthetic samples and pre-agreed measurement criteria.","interpret":"Report statistical metrics and uncertainty rather than treating a single confident prediction as proof.","remediate":"Review privacy controls, output minimisation and training protections.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-05_Testing_for_Inversion_Attacks.md"},"AITG-MOD-06":{"id":"AITG-MOD-06","name":"Robustness to New Data","access":"White-box / research","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-06_Testing_for_Robustness_to_New_Data.md"},"AITG-MOD-07":{"id":"AITG-MOD-07","name":"Goal Alignment","access":"White-box / research","execute":"Define a clean benchmark or labelled control dataset, change one condition, and compare outcomes with matched settings.","interpret":"Use measurable evidence and describe scope, variability and alternative explanations.","remediate":"Apply independent verification, logging, constrained permissions and repeatable regression tests.","source":"OWASP AI Testing Guide v1.0 (November 2025); summarised editorially.","url":"https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-07_Testing_for_Goal_Alignment.md"}};

  // ── Detail ───────────────────────────────────────────────────────────
  function renderDetail(id) {
    const r = allRecords.find(x => x.id === id);
    const main = document.getElementById('main');
    if (!r) {
      const suggestion = allRecords[Math.floor(Math.random() * allRecords.length)];
      main.innerHTML =
        '<div class="not-found-wrap">' +
          '<div class="not-found-code">404</div>' +
          '<h1 class="not-found-title">Technique not found</h1>' +
          '<p class="not-found-sub"><code>' + esc(id) + '</code> is not in the catalogue.</p>' +
          '<div class="not-found-actions">' +
            '<a class="nf-btn" href="#/">← Browse all techniques</a>' +
            (suggestion ? '<a class="nf-btn nf-btn-ghost" href="#/technique/' + encodeURIComponent(suggestion.id) + '">Try ' + esc(suggestion.id) + ' →</a>' : '') +
          '</div>' +
        '</div>';
      return;
    }

    const sc = evidenceClass(r.evidence_status);
    const hasPoc  = r.poc_steps && r.poc_steps.length;
    const hasDef  = r.defences  && r.defences.length;
    const hasRef  = r.references && r.references.length;
    const hasLab  = !!r.lab;
    const inputKind = r.input_type || 'text';
    const usableVariants = [{name:'Main input',payload:r.payload,placement:r.placement,expected:r.expected_test},...(r.variants||[]).filter(v => v.payload && v.payload !== r.payload)];
    const artifact = r.artifact_path && /^fixtures\/[a-zA-Z0-9._/-]+$/.test(r.artifact_path) ? r.artifact_path : '';


    main.innerHTML =
      '<div class="detail-wrap">' +
        '<nav class="d-breadcrumb" aria-label="breadcrumb"><a href="#/">Catalogue</a><span aria-hidden="true"> / </span><span>' + esc(r.id) + '</span></nav>' +
        '<div class="detail-head">' +
          '<div class="detail-head-top">' +
            '<span class="d-id">' + esc(r.id) + '</span>' +
            '<button class="id-copy-btn" data-id="' + esc(r.id) + '" title="Copy ID">⎘</button>' +
            (r.evidence_status ? '<span class="d-status ' + sc + '">' + esc(r.evidence_status||'Assessment candidate') + '</span>' : '') +
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
              ((r.payload || r.payload_example)
                ? '<div class="d-section payload-hero">' +
                    '<div class="payload-hero-head">' +
                      '<span class="payload-hero-lbl">Payload</span>' +
                      '<button class="payload-copy-btn" data-payload="' + esc(r.payload || r.payload_example) + '">'+esc(r.primary_action==='Download test file'?'Copy supporting text':(r.primary_action||'Copy input'))+'</button>' +
                    '</div>' +
                    '<pre class="payload-hero-pre"><code>' + esc(r.payload || r.payload_example) + '</code></pre>' +
                    (r.placement ? '<p class="payload-placement">' + esc(r.placement) + '</p>' : '') +
                  '</div>'
                : '') +
              '<div class="d-section practical-applicability"><h2>Applies to</h2><p>' + esc(r.applies_to||r.target||'') + '</p>' +
              '<h2>What constitutes a finding?</h2><p>' + esc(r.finding_criteria||r.expected_test||'') + '</p>' +
              '<p class="practical-small">A changed answer is evidence of instruction influence, not automatically data theft or a privileged action. Verify the actual security boundary.</p></div>' +
              (usableVariants.length>1 ? '<div class="d-section"><h2>Payload contexts</h2><label for="detail-variant">Select a supported input variant</label><select id="detail-variant">' + usableVariants.map((v,i)=>'<option value="'+i+'">'+esc(v.name||'Variant '+(i+1))+'</option>').join('') + '</select><p class="practical-small">Selecting a variant updates the payload, placement and evidence notes above.</p></div>' : '') +
              ((artifact || inputKind==='generator') ? '<div class="d-section"><h2>Input format: '+esc(inputKind==='file'?'Downloadable file':'Local generator')+'</h2>' +
                  (artifact ? '<a class="btn-ghost" download href="'+esc(artifact)+'">Download test file ↘</a>' : '') +
                  (inputKind==='generator' ? '<p>Run the provided command on your own authorised workstation. The website does not execute shell commands.</p>' : '<p>Upload the downloaded file to a compatible authorised application. Copying its filename is not the assessment input.</p>') + '</div>' : '') +
              '<div class="d-section assessment-context"><h2>Assessment context</h2>' +
              '<p><strong>Suitable targets:</strong> '+esc((r.assessment_targets||[]).join(' · '))+'</p>' +
              '<p><strong>Required access:</strong> '+esc(r.testing_access||'Architecture-specific')+'</p>' +
              '<p><strong>Input placement:</strong> '+esc(r.input_placement||r.placement||'')+'</p>' +
              '<p><strong>Primary action:</strong> '+esc(r.primary_action||'Copy input')+'</p>' +
              '<p><strong>Evidence type:</strong> '+esc(r.evidence_type||'Target-specific evidence')+'</p>' +
              '<p><strong>Record for the finding:</strong> '+esc(r.evidence_capture||'')+'</p>' +
              '<p class="practical-small">Research reference, a successful simulation and an observed target-side security failure are different levels of evidence.</p></div>' +
              '<div class="d-section"><h2>Record an assessment</h2><p>Export a local Markdown evidence-note template for this technique. Fill it with your own authorised observations. The export contains no asserted exploit success and uploads nothing.</p><button class="baseline-export" type="button" id="tech-evidence-export">↓ Export evidence note (.md)</button></div>' +
              '<div class="d-section assessment-procedure"><h2>Assessment procedure</h2><ol class="d-list">'+(r.test_steps||[]).map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol></div>' +
              '<div class="d-section aitg-methodology"><h2>Practical testing method <small>(OWASP AITG-informed)</small></h2>' +
              '<p><strong>Testing access:</strong> ' + esc(r.testing_access||'Architecture-specific') + '</p>' +
              '<p><strong>Objective:</strong> ' + esc(r.aitg_objective||'') + '</p>' +
              '<p><strong>Execute:</strong> ' + esc(r.aitg_execution||'') + '</p>' +
              '<p><strong>Interpret response:</strong> ' + esc(r.aitg_interpretation||'') + '</p>' +
              '<p><strong>Recommended defence:</strong> ' + esc(r.aitg_remediation||'') + '</p>' +
              '<p class="practical-small">Methodology adapted from the OWASP AI Testing Guide v1.0 (November 2025). Guidance is editorial and context-dependent. Results from the simulated lab never constitute evidence of a live finding. Record actual baseline, model version, repeatability and application/tool logs where available.</p></div>' +
              '<div class="d-section"><h2>Research and verification</h2><p>AIHACKBins reproduction: <strong>' + esc(r.reproduction_status||'Not independently reproduced') + '</strong></p>' +
              '<p>Source provenance: ' + esc(r.evidence_level||'Review linked research; no independent validation implied') + '</p>' +
              (r.source_url ? '<p><a href="' + esc(r.source_url) + '" target="_blank" rel="noopener">Primary source / research context ↗</a></p>' : '<p>No direct original research source recorded; treat as an assessment candidate.</p>') +
              (r.aitg_ids && r.aitg_ids.length ? '<h3>OWASP AI Testing Guide coverage</h3><p>' + r.aitg_ids.map(id=>'<a class="aitg-inline" href="' + aitgUrl(id) + '" target="_blank" rel="noopener">' + esc(id) + ' ↗</a>').join(' · ') + '</p>' : '') +
              '<p class="practical-small">Mappings identify related test objectives. They are not OWASP endorsements, proof of exploitation or independent verification.</p></div>' +
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
                r.references.map(ref => {
                  // refs can be a string URL, a string title, or {title, url}
                  if (typeof ref === 'string') {
                    const isUrl = /^https?:\/\//.test(ref);
                    return '<li>' + (isUrl
                      ? '<a href="' + esc(ref) + '" target="_blank" rel="noopener">' + esc(ref) + ' ↗</a>'
                      : esc(ref)) + '</li>';
                  }
                  return '<li>' + (ref.url
                    ? '<a href="' + esc(ref.url) + '" target="_blank" rel="noopener">' + esc(ref.title||ref.url) + ' ↗</a>'
                    : esc(ref.title||'')) + '</li>';
                }).join('') +
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
              (r.evidence_status ? '<div class="d-aside-row"><span class="d-aside-lbl">Research provenance</span><span class="d-aside-val ' + sc + '">' + esc(r.evidence_status) + '</span></div>' : '') +
              (r.affected_models && r.affected_models.length ? '<div class="d-aside-row"><span class="d-aside-lbl">Models</span><span class="d-aside-val">' + r.affected_models.map(esc).join(', ') + '</span></div>' : '') +
            '</div>' +
            '<div class="d-aside-section">' +
              '<a class="btn-ghost" href="#/">← Back to catalogue</a>' +
              (hasLab ? '<a class="btn-ghost" href="#/lab/' + encodeURIComponent(r.id) + '">Open in Lab →</a>' : '') +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</div>';

    // Context-specific payload switching stays client-side; no payload is executed.
    const variantSelect = main.querySelector('#detail-variant');
    if (variantSelect) variantSelect.addEventListener('change', () => {
      const v=usableVariants[Number(variantSelect.value)];
      const code=main.querySelector('.payload-hero-pre code');
      const copyButton=main.querySelector('.payload-copy-btn');
      const placement=main.querySelector('.payload-placement');
      if(code) code.textContent=v.payload||'';
      if(copyButton) copyButton.dataset.payload=v.payload||'';
      if(placement) placement.textContent=v.placement||'';
      const pass=main.querySelector('.dpanel[data-panel="overview"] .practical-applicability');
      if(pass) {let p=pass.querySelectorAll('p');if(p.length>1)p[1].textContent=v.expected_test||v.expected||r.finding_criteria||r.expected_test||'';}
    });
    // Payload copy button (uses shared copyText with fallback)
    main.querySelectorAll('.payload-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => copyText(btn.dataset.payload || '', btn));
    });

    const noteBtn=main.querySelector('#tech-evidence-export');
    if (noteBtn) noteBtn.addEventListener('click',()=>{
      const md=['# AIHACKBins assessment evidence — '+r.id+' '+(r.title||''),'',
      '> Local template only. No exploit or assessment result has been verified by AIHACKBins.','',
      '- Scope / authorisation: [enter]','- Target environment: [enter]','- Date: [YYYY-MM-DD]',
      '- Testing access: '+(r.testing_access||'Architecture-specific'),
      '- Input placement: '+(r.input_placement||r.placement||''),
      '- Input format: '+(r.input_type||'text'),
      '- Objective: '+(r.aitg_objective||r.summary||''),
      '- Test procedure:',...(r.test_steps||[]).map((step,i)=>'  '+(i+1)+'. '+step),
      '- Clean/control response: [not recorded]','- Test response and relevant logs: [not recorded]',
      '- Boundary crossed / result: [not evaluated]',
      '- Repeatability, limitations and false-positive analysis: [not evaluated]',
      '- Secure evidence reference: [not recorded]',
      '- OWASP AITG: '+(r.aitg_ids||[]).join(', '),
      '- OWASP LLM Top 10: '+(r.owasp_ids||[]).join(', '),
      '- MITRE ATLAS: '+(r.atlas_id||'Not mapped'),
      '- Research source: '+(r.source_url||'Not recorded'),
      '- AIHACKBins reproduction: '+(r.reproduction_status||'Not independently reproduced'),
      '- Remediation / retest: [not evaluated]',''];
      downloadLocal('AIHACKBins-'+r.id+'-evidence-note.md',md.join('\n'));
    });

    // ID copy button
    const idCopyBtn = main.querySelector('.id-copy-btn');
    if (idCopyBtn) idCopyBtn.addEventListener('click', () => copyText(idCopyBtn.dataset.id || '', idCopyBtn));

    // Related techniques — find techniques that share a chain with this one
    fetch('data/chains.json').then(res => res.json()).then(chains => {
      const relatedIds = new Set();
      chains.forEach(c => {
        if ((c.steps||[]).includes(r.id)) {
          c.steps.forEach(sid => { if (sid !== r.id) relatedIds.add(sid); });
        }
      });
      const related = [...relatedIds].map(sid => allRecords.find(x => x.id === sid)).filter(Boolean).slice(0, 6);
      if (!related.length) return;
      const detailWrap = main.querySelector('.detail-wrap');
      if (!detailWrap) return;
      const relDiv = document.createElement('div');
      relDiv.className = 'related-section';
      relDiv.innerHTML =
        '<h2 class="related-title">Related techniques</h2>' +
        '<p class="related-sub">Techniques that appear alongside ' + esc(r.id) + ' in attack chains.</p>' +
        '<div class="related-grid">' +
          related.map(s =>
            '<a class="related-card" href="#/technique/' + encodeURIComponent(s.id) + '">' +
              '<span class="related-card-id">' + esc(s.id) + '</span>' +
              '<span class="related-card-title">' + esc(s.title||'') + '</span>' +
              (s.owasp_ids && s.owasp_ids.length ? '<span class="related-card-tag">' + esc(s.owasp_ids[0]) + '</span>' : '') +
            '</a>'
          ).join('') +
        '</div>';
      detailWrap.appendChild(relDiv);
    }).catch(() => {});

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
    const main = document.getElementById('main');
    main.innerHTML = '<div class="inner-head"><h1>Attack chains</h1><p>Illustrative assessment groupings, not verified end-to-end exploits. Each step links to a technique with its own evidence base.</p></div><div id="chains-host"><p class="loading-line">Loading chains<span class="blink">_</span></p></div>';
    fetch('data/chains.json')
      .then(r => r.json())
      .then(chains => {
        const host = document.getElementById('chains-host');
        if (!host) return;
        host.innerHTML = '<div class="chains-wrap">' +
          chains.map(c => {
            const steps = (c.steps||[]).map(sid => allRecords.find(r => r.id === sid)).filter(Boolean);
            return '<div class="chain-card">' +
              '<div class="chain-card-head"><span class="chain-id">' + esc(c.id) + '</span></div>' +
              '<h2 class="chain-title">' + esc(c.title) + '</h2>' +
              '<p class="chain-desc">' + esc(c.desc) + '</p>' +
              (c.attacker_goal ? '<div class="chain-goal"><span class="chain-goal-lbl">⚠ Attacker goal</span><p>' + esc(c.attacker_goal) + '</p></div>' : '') +
              (c.defender_action ? '<div class="chain-defend"><span class="chain-goal-lbl">🛡 Defender action</span><p>' + esc(c.defender_action) + '</p></div>' : '') +
              '<div class="chain-steps">' +
                steps.map((s,i) =>
                  '<a class="chain-lnk" href="#/technique/' + encodeURIComponent(s.id) + '">' +
                    '<span class="chain-lnk-n">' + (i+1) + '</span>' +
                    '<span class="chain-lnk-body">' +
                      '<span class="chain-lnk-id">' + esc(s.id) + '</span>' +
                      '<span class="chain-lnk-title">' + esc(s.title||'') + '</span>' +
                      ((s.owasp_ids||[]).length ? '<span class="chain-lnk-owasp">' + (s.owasp_ids||[]).map(o => '<em class="chain-owasp-pill">' + esc(o) + '</em>').join('') + '</span>' : '') +
                    '</span>' +
                  '</a>' + (i < steps.length-1 ? '<span class="chain-arrow">→</span>' : '')
                ).join('') +
              '</div></div>';
          }).join('') +
        '</div>';
      })
      .catch(() => {
        const host = document.getElementById('chains-host');
        if (host) host.innerHTML = '<p style="padding:20px 0;color:var(--muted)">Could not load chains data.</p>';
      });
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
    "id":              "RC-201",           // required
    "title":           "string",           // required
    "category":        "string",           // required
    "target":          "string",
    "status":          "Unverified (historical compatibility field)",
    "evidence_status": "Published disclosure | Research referenced | Assessment candidate | Assessment workflow",
    "independent_verification": "Not independently reproduced unless evidence is provided",
    "severity":        "Critical | High | Medium | Low",
    "summary":         "string",
    "description":     "string",
    "atlas_id":        "AML.TXXXX.XXX",   // MITRE ATLAS (optional)
    "atlas_name":      "string",
    "owasp_ids":       ["LLM01", ...],    // OWASP LLM Top 10 2025
    "tags":            ["string"],
    "affected_models": ["string"],
    "poc_steps":       ["string"],
    "payload":         "string",          // the literal payload
    "payload_example": "string",          // short display version (optional)
    "defences":        ["string"],
    "references":      [{"title":"string","url":"string"}],
    "real_world_cases":["string"],
    // Active entries only:
    "model_tested":    ["GPT-4o", "..."], // models tested against
    "verified_date":   "YYYY-MM",         // month of testing
    // Optional lab scenario:
    "lab": {
      "terminal_title":    "string",
      "clean_prompt":      "string",
      "inject_note":       "string",
      "vuln_responses":    [{"delay":500,"text":"string"}],
      "safe_response":     "string",
      "expected_evidence": "string"       // canary string in vuln_responses
    }
  }
]`) + '</code></pre></div>' +
        '<div class="d-section"><h2>Examples</h2><pre><code>' + esc(
`// Legacy Active is NOT evidence of independent reproduction
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
  "status":          "Unverified (legacy)",
  "evidence_status": "Assessment candidate",
  "independent_verification": "Not independently reproduced",
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
          '<h2>See an example</h2>' +
          '<p class="submit-note">Browse a merged contribution to see the expected format and quality bar in context:</p>' +
          '<a class="submit-cta submit-cta-ghost" href="https://github.com/AIHACKBins/AIHACKBins/pulls?q=is%3Apr+is%3Amerged+label%3Anew-technique" target="_blank" rel="noopener">Browse merged technique PRs ↗</a>' +
        '</div>' +
        '<div class="d-section">' +
          '<a class="submit-cta" href="https://github.com/AIHACKBins/AIHACKBins/issues/new?title=%5BNew+technique%5D+RC-XXX+%E2%80%94+&labels=new-technique&template=technique_submission.md" target="_blank" rel="noopener">Open a GitHub issue to discuss first ↗</a>' +
          '<a class="submit-cta submit-cta-ghost" href="https://github.com/AIHACKBins/AIHACKBins/fork" target="_blank" rel="noopener">Fork the repo and start a PR ↗</a>' +
        '</div>' +

      '</div>';

    const copyBtn = document.getElementById('schema-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => { copyText(schema, copyBtn); });
    }
  }


  // Alphabetised, filterable reference glossary. No network access required.
  const glossaryTerms = [{"term": "AIHACKBins", "category": "Project", "definition": "An open, GTFOBins-inspired reference of AI security assessment techniques, prompts, and guided labs.", "technique": null}, {"term": "RC", "category": "Identifiers", "definition": "Research Case: the AIHACKBins identifier prefix (for example RC-221). An ID is not a confirmed vulnerability.", "technique": null}, {"term": "LLM", "category": "AI basics", "definition": "Large Language Model: a model trained to generate and work with text and related content.", "technique": null}, {"term": "Prompt", "category": "AI basics", "definition": "Instructions and context supplied to an AI model.", "technique": null}, {"term": "System prompt", "category": "AI basics", "definition": "High-priority instructions defined by the application or model operator.", "technique": null}, {"term": "Prompt injection", "category": "Attacks", "definition": "An attempt to redirect a model using attacker-controlled instructions.", "technique": "RC-203"}, {"term": "Indirect prompt injection", "category": "Attacks", "definition": "Instructions embedded in lower-trust content such as emails, documents, web pages, or tool results.", "technique": "RC-208"}, {"term": "Invisible Prompt Injection", "category": "Attacks", "definition": "Prompt injection hidden in characters or encodings that may not be obvious in rendered text.", "technique": "RC-221"}, {"term": "Unicode Tag characters", "category": "Encoding", "definition": "Unicode characters in U+E0000–U+E007F that can carry encoded text while remaining visually hidden in many interfaces.", "technique": "RC-221"}, {"term": "ASCII smuggling", "category": "Encoding", "definition": "Encoding visible ASCII instructions into Unicode characters that may bypass a superficial text review.", "technique": "RC-221"}, {"term": "Severity manipulation", "category": "Attacks", "definition": "Attempting to bias an AI-generated security severity recommendation instead of evaluating actual technical impact.", "technique": "RC-221"}, {"term": "Canary", "category": "Testing", "definition": "A harmless, distinctive string used to identify whether unexpected instructions were followed.", "technique": null}, {"term": "Control input", "category": "Testing", "definition": "An otherwise identical baseline without the attack payload, used to compare results.", "technique": null}, {"term": "Verification status", "category": "Evidence", "definition": "An indication of whether testing has actually been performed, not whether an attack technique exists.", "technique": null}, {"term": "Research Case vs vulnerability", "category": "Evidence", "definition": "A documented technique or research case does not establish that a named current product is vulnerable.", "technique": null}, {"term": "Proof of Concept (PoC)", "category": "Evidence", "definition": "A demonstration with enough detail and evidence to reproduce a reported behaviour.", "technique": null}, {"term": "False positive", "category": "Evidence", "definition": "An apparent issue that is not substantiated by the technical evidence.", "technique": null}, {"term": "Scripted simulation", "category": "Evidence", "definition": "A predetermined demonstration output. It does not execute a live attack or test a model.", "technique": null}, {"term": "AITG (OWASP AI Testing Guide)", "category": "Frameworks", "definition": "AITG means OWASP AI Testing Guide: a structured set of security testing objectives for AI applications, models, infrastructure and data. The AITG-APP, AITG-MOD, AITG-INF and AITG-DAT IDs classify recommended tests; a mapping does not mean a vulnerability has been verified.", "technique": null}, {"term": "OWASP LLM Top 10 2025", "category": "Frameworks", "definition": "A risk taxonomy for LLM applications; classification is not proof of exploitability.", "technique": null}, {"term": "LLM01", "category": "Frameworks", "definition": "Prompt Injection, the first OWASP Top 10 for LLM Applications 2025 category.", "technique": "RC-221"}, {"term": "LLM02", "category": "Frameworks", "definition": "Sensitive Information Disclosure in LLM applications.", "technique": "RC-210"}, {"term": "LLM03", "category": "Frameworks", "definition": "Supply Chain vulnerabilities affecting LLM applications.", "technique": "RC-216"}, {"term": "LLM04", "category": "Frameworks", "definition": "Data and Model Poisoning — corrupting training data, fine-tune datasets, or reward models to influence model behaviour.", "technique": "RC-251"}, {"term": "LLM05", "category": "Frameworks", "definition": "Improper Output Handling.", "technique": null}, {"term": "LLM06", "category": "Frameworks", "definition": "Excessive Agency, when AI systems have excessive or insufficiently constrained abilities.", "technique": "RC-214"}, {"term": "LLM07", "category": "Frameworks", "definition": "System Prompt Leakage.", "technique": null}, {"term": "LLM08", "category": "Frameworks", "definition": "Vector and Embedding Weaknesses.", "technique": null}, {"term": "LLM09", "category": "Frameworks", "definition": "Misinformation — outputs that are false, misleading, or fabricated, including hallucinated citations and sycophantic confirmation of false premises.", "technique": "RC-255"}, {"term": "LLM10", "category": "Frameworks", "definition": "Unbounded Consumption — attacks that cause excessive resource usage, token flooding, or cost amplification.", "technique": "RC-256"}, {"term": "MITRE ATLAS", "category": "Frameworks", "definition": "An AI-focused knowledge base of adversary tactics and techniques.", "technique": null}, {"term": "AML.T0051.001", "category": "Frameworks", "definition": "MITRE ATLAS technique for Indirect Prompt Injection — injecting instructions via content retrieved from external sources.", "technique": "RC-208"}, {"term": "MITRE ATT&CK", "category": "Frameworks", "definition": "A separate knowledge base of adversary behaviour; it is not interchangeable with MITRE ATLAS.", "technique": null}, {"term": "RAG", "category": "AI architecture", "definition": "Retrieval Augmented Generation: a model generates answers using retrieved external material.", "technique": null}, {"term": "Vector database", "category": "AI architecture", "definition": "A datastore for numerical embeddings used in similarity search and retrieval.", "technique": null}, {"term": "Embedding", "category": "AI architecture", "definition": "A numerical representation of text or other content, used for retrieval or machine learning.", "technique": null}, {"term": "MCP", "category": "AI architecture", "definition": "Model Context Protocol: an open standard that connects AI clients (Claude Desktop, Cursor, etc.) to tools, data sources, and resources via a JSON-RPC server.", "technique": null}, {"term": "MCP tool poisoning", "category": "Attacks", "definition": "An attack where a malicious MCP server embeds instructions in tool names or descriptions that cause the AI model to take unintended actions when it reads the tool manifest.", "technique": "RC-258"}, {"term": "MCP server impersonation", "category": "Attacks", "definition": "An attacker registers a server that masquerades as a legitimate MCP integration (e.g. via typosquatting) to intercept tool calls and steal credentials.", "technique": "RC-259"}, {"term": "Tool call", "category": "AI architecture", "definition": "A structured request by an AI application to execute a defined tool or function.", "technique": null}, {"term": "Agent", "category": "AI architecture", "definition": "An application that uses a model to select and execute steps or invoke tools.", "technique": null}, {"term": "Autonomous agent", "category": "AI architecture", "definition": "An AI system that operates with minimal human oversight, planning and executing multi-step tasks. Broader tool access and reduced interruptions expand the attack surface significantly.", "technique": "RC-247"}, {"term": "Agentic workflow", "category": "AI architecture", "definition": "A sequence of model-driven steps where each step's output may trigger further tool calls, sub-agents, or automated decisions — creating a compound attack surface at each step.", "technique": "RC-257"}, {"term": "Context window stuffing", "category": "Attacks", "definition": "Filling a model's context window with attacker-controlled text to crowd out legitimate instructions, distort model attention, or exhaust the token budget available for a task.", "technique": "RC-256"}, {"term": "Jailbreak", "category": "Attacks", "definition": "A prompt intended to bypass model behavioural safeguards.", "technique": "RC-201"}, {"term": "Many-shot jailbreak", "category": "Attacks", "definition": "A jailbreak that uses many examples to encourage a model to imitate an undesired response pattern.", "technique": "RC-201"}, {"term": "GCG", "category": "Attacks", "definition": "Greedy Coordinate Gradient: an optimisation method for generating adversarial suffixes.", "technique": "RC-220"}, {"term": "Model card", "category": "AI supply chain", "definition": "Documentation describing a model, its intended usage, limitations and metadata.", "technique": "RC-216"}, {"term": "Payload", "category": "Testing", "definition": "The exact text, file content or request supplied for an assessment.", "technique": null}, {"term": "Attack chain", "category": "Testing", "definition": "A collection or sequence of techniques; a diagram alone is not proof of an end-to-end exploit.", "technique": null}, {"term": "Hacking with AI", "category": "Project", "definition": "Using AI to support authorised security research, reconnaissance or test planning.", "technique": null}, {"term": "Hacking AI", "category": "Project", "definition": "Assessing the security boundaries and behaviours of AI-enabled systems.", "technique": null}];
  glossaryTerms.push(
    {term:'Black-box testing',category:'Testing',definition:'Assessment through exposed interfaces without application source, hidden prompts, agent traces or internal configuration access.',technique:null},
    {term:'Grey-box testing',category:'Testing',definition:'Assessment with limited internal visibility, such as prompt assembly traces, tool invocation logs or read-only configuration access.',technique:null},
    {term:'White-box testing',category:'Testing',definition:'Assessment with authorised implementation, training, model, data or configuration access; needed for some model-level experiments.',technique:null},
    {term:'SecAI',category:'OWASP AI Testing Guide',definition:'Security AI: the security testing domain of OWASP AITG, focused on adversarial attacks and AI-stack controls.',technique:null},
    {term:'PrivacyAI',category:'OWASP AI Testing Guide',definition:'Privacy AI: the OWASP AITG domain addressing confidentiality, data inference and appropriate use of personal data.',technique:null},
    {term:'RespAI',category:'OWASP AI Testing Guide',definition:'Responsible AI: the OWASP AITG domain addressing fairness, safety, transparency and human oversight.',technique:null},
    {term:'AITG test method',category:'OWASP AI Testing Guide',definition:'For each objective, define scope, execute a controlled test, interpret actual results, and recommend mitigations. A methodology reference is not independent payload verification.',technique:null}
  );
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

  // ── AI Testing Baseline (OWASP AITG references; 32 test objectives) ──
  function renderBaseline() {
    const checks = [{"group": "Application", "title": "Direct prompt injection", "id": "AITG-APP-01", "tech": "RC-203", "desc": "Compare identical tasks with and without attacker instructions; do not mistake a marker echo for privilege escalation."}, {"group": "Application", "title": "Indirect instructions in documents", "id": "AITG-APP-02", "tech": "RC-234", "desc": "Test retrieved documents or emails; verify the untrusted text reaches the model and overrides the legitimate user task."}, {"group": "Application", "title": "Sensitive data disclosure", "id": "AITG-APP-03", "tech": "RC-210", "desc": "Use controlled synthetic protected data and independently separated access contexts."}, {"group": "Application", "title": "Input and context leakage", "id": "AITG-APP-04", "tech": "RC-227", "desc": "Check model-visible internal context and origin of any disclosed marker; do not use real secrets."}, {"group": "Application", "title": "Unsafe downstream output", "id": "AITG-APP-05", "tech": "RC-238", "desc": "Check whether output is safely encoded or validated before rendering or use by a downstream component."}, {"group": "Agents and MCP", "title": "Agent authorisation and business rules", "id": "AITG-APP-06", "tech": "RC-247", "desc": "Check whether tools enforce authorisation outside the LLM and require confirmation before destructive actions."}, {"group": "Application", "title": "System prompt disclosure", "id": "AITG-APP-07", "tech": "RC-241", "desc": "Plant a distinctive non-sensitive system-only canary and distinguish disclosure from invented text."}, {"group": "RAG and data", "title": "Embedding manipulation", "id": "AITG-APP-08", "tech": null, "desc": "Assess actual vector/embedding integrity and retrieval ranking changes; RAG document poisoning alone does not demonstrate embedding manipulation."}, {"group": "Model", "title": "Model extraction assessment", "id": "AITG-APP-09", "tech": "RC-260", "desc": "Use a capped, authorised query budget and held-out surrogate agreement measurements."}, {"group": "Model", "title": "Content bias and output consistency", "id": "AITG-APP-10", "tech": "RC-254", "desc": "Use matched controlled prompts to measure systematic differences and distinguish reliability from access-control impact."}, {"group": "Application", "title": "Hallucinations and fabricated citations", "id": "AITG-APP-11", "tech": "RC-255", "desc": "Verify claimed sources and fabricated references against a trusted source of truth."}, {"group": "Application", "title": "Toxic output and policy boundaries", "id": "AITG-APP-12", "tech": "RC-201", "desc": "Use approved harmless test cases and compare tested policy boundaries; avoid confusing tone with impact."}, {"group": "Application", "title": "Over-reliance on model decisions", "id": "AITG-APP-13", "tech": "RC-254", "desc": "Check whether critical decisions require independent verification or human review."}, {"group": "Model", "title": "Explainability and traceability", "id": "AITG-APP-14", "tech": null, "desc": "Verify available decision logs, documentation and reproducible reasons for regulated or high-impact outputs."}, {"group": "RAG and data", "title": "Training data exposure", "id": "AITG-DAT-01", "tech": null, "desc": "Verify verbatim disclosure of seeded training-only canaries; membership inference is a different statistical privacy test."}, {"group": "RAG and data", "title": "Runtime cache and output exposure", "id": "AITG-DAT-02", "tech": "RC-262", "desc": "Check tenant boundaries, cache keys and authorised log access with seeded synthetic values."}, {"group": "RAG and data", "title": "Dataset diversity and coverage", "id": "AITG-DAT-03", "tech": null, "desc": "Review dataset coverage with owner-provided evaluation sets; this is often assurance testing rather than exploitation."}, {"group": "RAG and data", "title": "Harmful or unauthorised training data", "id": "AITG-DAT-04", "tech": "RC-251", "desc": "Assess controlled data ingestion provenance and test-only poisoning paths."}, {"group": "RAG and data", "title": "Data minimisation and consent", "id": "AITG-DAT-05", "tech": null, "desc": "Check inputs, telemetry and retention controls against scoped data-handling requirements."}, {"group": "Infrastructure", "title": "Model supply-chain tampering", "id": "AITG-INF-01", "tech": "RC-216", "desc": "Inspect model cards and artefact provenance; distinguish displayed text from executed or trusted instructions."}, {"group": "Infrastructure", "title": "Token and tool resource exhaustion", "id": "AITG-INF-02", "tech": "RC-256", "desc": "Measure bounded token usage, tool recursion, costs and per-user limits with agreed budgets."}, {"group": "Agents and MCP", "title": "Plugin and MCP boundaries", "id": "AITG-INF-03", "tech": "RC-258", "desc": "Test distinct tool permissions and capture actual downstream calls rather than claims in generated text."}, {"group": "Agents and MCP", "title": "Agent capability misuse", "id": "AITG-INF-04", "tech": "RC-226", "desc": "Confirm enforcement of capability restrictions outside the model."}, {"group": "Model", "title": "Fine-tuning dataset poisoning", "id": "AITG-INF-05", "tech": "RC-245", "desc": "Use controlled offline training sets and matched unpoisoned evaluation baselines."}, {"group": "Infrastructure", "title": "Development model artefact access", "id": "AITG-INF-06", "tech": "RC-263", "desc": "Verify registry and object-storage authorisation on synthetic model artefacts."}, {"group": "Model", "title": "Adversarial model evasion", "id": "AITG-MOD-01", "tech": null, "desc": "Assess model-specific classifier or detection evasion with controlled adversarial examples; a GCG jailbreak suffix alone is not equivalent."}, {"group": "Model", "title": "Runtime model poisoning", "id": "AITG-MOD-02", "tech": null, "desc": "Test compromised mutable runtime state or online model update paths; offline reward-model training is a separate mechanism."}, {"group": "Model", "title": "Poisoned training sets", "id": "AITG-MOD-03", "tech": "RC-251", "desc": "Show reproducible influence of controlled poisoned data on model behaviour."}, {"group": "Model", "title": "Membership inference", "id": "AITG-MOD-04", "tech": "RC-261", "desc": "Evaluate known member/non-member predictions with held-out metrics and false-positive analysis."}, {"group": "Model", "title": "Model inversion", "id": "AITG-MOD-05", "tech": null, "desc": "Specialist study requiring model access and consent; no copy-paste payload is claimed."}, {"group": "Model", "title": "Robustness to new data", "id": "AITG-MOD-06", "tech": null, "desc": "Compare safe evaluation-set performance under controlled distribution shifts."}, {"group": "Model", "title": "Goal alignment under constraints", "id": "AITG-MOD-07", "tech": "RC-201", "desc": "Define a measurable safe objective and distinguish prompt influence from security compromise."}];
    const main=document.getElementById('main');
    main.innerHTML='<div class="baseline-page"><div class="inner-head"><nav class="d-breadcrumb" aria-label="breadcrumb"><a href="#/">Catalogue</a><span aria-hidden="true"> / </span><span>Baseline</span></nav><h1>AI security testing baseline</h1><p>32 OWASP AI Testing Guide v1.0 objectives across applications, agents, RAG/data, models and infrastructure. Review each objective method and access requirements. Checklist selections are not verified findings.</p></div>' +
      '<div class="baseline-toolbar"><label for="baseline-target">Assessment target</label><select id="baseline-target"><option value="All">All targets</option><option value="Chatbot">Chatbot</option><option value="Application">AI application / RAG</option><option value="Agent">AI agent / MCP</option><option value="Model">AI model / data / infrastructure</option></select><label for="baseline-area">Testing area</label><select id="baseline-area"><option value="All">All areas</option>' + [...new Set(checks.map(c=>c.group))].map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join('') + '</select><span id="baseline-counter" role="status"></span><button id="baseline-export" type="button" class="baseline-export">↓ Export CSV</button><button id="baseline-md-export" type="button" class="baseline-export">↓ Export assessment notes (.md)</button></div>' +
      '<div class="baseline-wrap" id="baseline-checks"></div></div>';
    const sel=main.querySelector('#baseline-area'),host=main.querySelector('#baseline-checks'),count=main.querySelector('#baseline-counter');
    const targetSel=main.querySelector('#baseline-target');
    const drawn=new Map();
    // Editorial assessment shortlist. Not an assertion that all target types have full coverage.
    const targetScope={
      Chatbot:['AITG-APP-01','AITG-APP-03','AITG-APP-04','AITG-APP-05','AITG-APP-07','AITG-APP-10','AITG-APP-11','AITG-APP-12','AITG-APP-13','AITG-INF-02'],
      Application:['AITG-APP-01','AITG-APP-02','AITG-APP-03','AITG-APP-04','AITG-APP-05','AITG-APP-08','AITG-APP-11','AITG-DAT-02','AITG-INF-01','AITG-INF-02','AITG-INF-03'],
      Agent:['AITG-APP-02','AITG-APP-03','AITG-APP-06','AITG-APP-07','AITG-INF-02','AITG-INF-03','AITG-INF-04','AITG-DAT-02'],
      Model:checks.filter(c=>['Model','Infrastructure','RAG and data'].includes(c.group)).map(c=>c.id)
    };
    function draw(){const filtered=checks.filter(c=>(sel.value==='All'||sel.value===c.group)&&(targetSel.value==='All'||(targetScope[targetSel.value]||[]).includes(c.id)));count.textContent=filtered.length+' of '+checks.length+' objectives';
      host.innerHTML=filtered.map((c,i)=>{
        const testUrl=aitgUrl(c.id);
        return '<article class="baseline-check"><div class="baseline-check-head"><span class="baseline-n">'+String(i+1).padStart(2,'0')+'</span><h2 class="baseline-title">'+esc(c.title)+'</h2><span class="baseline-area-tag">'+esc(c.group)+'</span></div><p class="baseline-desc">'+esc(c.desc)+'</p>' + (aitgTestingGuidance[c.id]?'<details class="baseline-method"><summary>How to test · '+esc(aitgTestingGuidance[c.id].access)+'</summary><p><strong>Execute:</strong> '+esc(aitgTestingGuidance[c.id].execute)+'</p><p><strong>Interpret:</strong> '+esc(aitgTestingGuidance[c.id].interpret)+'</p><p><strong>Defence:</strong> '+esc(aitgTestingGuidance[c.id].remediate)+'</p></details>':'')+'<div class="baseline-links"><a class="baseline-tech" target="_blank" rel="noopener" href="'+testUrl+'">'+esc(c.id)+' ↗</a>'+(c.tech?'<a class="baseline-tech" href="#/technique/'+encodeURIComponent(c.tech)+'">View '+esc(c.tech)+' →</a>':'<span class="baseline-unmapped">No direct technique yet</span>')+'</div><label class="baseline-review-label">Assessment state <select class="baseline-review" data-check="'+c.id+'"><option value="not-reviewed">Not reviewed</option><option value="tested">Tested · outcome not recorded</option><option value="passed">Passed · evidence required</option><option value="failed">Failed · evidence required</option><option value="not-applicable">Not applicable</option></select></label></article>';
      }).join('')+'<div class="baseline-footer"><p>This checklist helps plan scoped assessments. States are manually selected and do not prove test results. Passed/Failed require independently recorded evidence. For real findings retain target configuration, baseline, request/response and actual tool logs.</p><a class="submit-cta submit-cta-ghost" href="#/">Browse techniques ↗</a></div>';
      host.querySelectorAll('.baseline-review').forEach(node=>{node.value=drawn.get(node.dataset.check)||'not-reviewed';node.addEventListener('change',()=>drawn.set(node.dataset.check,node.value));});
    }
    main.querySelector('#baseline-export').addEventListener('click',()=>{
      const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
      const content=['AITG ID,Area,Objective,Assessment state,Related technique',...checks.map(c=>[c.id,c.group,c.title,drawn.get(c.id)||'not-reviewed',c.tech||''].map(quote).join(','))].join('\r\n');
      const blob=new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8'});
      const href=URL.createObjectURL(blob);const link=document.createElement('a');
      link.href=href;link.download='AIHACKBins-AITG-baseline.csv';document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(href),1000);
    });
    main.querySelector('#baseline-md-export').addEventListener('click',()=>{
      const relevant=checks.filter(c=>targetSel.value==='All'||(targetScope[targetSel.value]||[]).includes(c.id));
      const md=['# AIHACKBins assessment checklist','',
        '> Locally generated template. No testing has been performed by this website.',
        '> Enter only information that you are authorised to record. Keep client findings in an approved secure repository.','',
        'Assessment target: '+targetSel.value,'System / environment: [enter approved identifier]','Assessment date: [YYYY-MM-DD]','Scope / authorisation reference: [enter]',''];
      for(const c of relevant){
        md.push('## '+c.id+' — '+c.title,'',
          '- Assessment state: '+(drawn.get(c.id)||'not-reviewed'),
          '- Related technique: '+(c.tech||'No directly linked technique'),
          '- Test objective: '+c.desc,
          '- Preconditions / permitted access: [enter]',
          '- Input and clean control: [enter]',
          '- Observed response / tool logs: [not recorded]',
          '- Reproduction and uncertainty: [enter]',
          '- Evidence location: [enter authorised reference]',
          '- Finding / remediation: [not evaluated]','');
      }
      downloadLocal('AIHACKBins-assessment-notes.md',md.join('\n'));
    });
    targetSel.addEventListener('change',draw);
    sel.addEventListener('change',draw);draw();
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  const aitgUrls = {"AITG-APP-01": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-01_Testing_for_Prompt_Injection.md", "AITG-APP-02": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-02_Testing_for_Indirect_Prompt_Injection.md", "AITG-APP-03": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-03_Testing_for_Sensitive_Data_Leak.md", "AITG-APP-04": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-04_Testing_for_Input_Leakage.md", "AITG-APP-05": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-05_Testing_for_Unsafe_Outputs.md", "AITG-APP-06": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-06_Testing_for_Agentic_Behavior_Limits.md", "AITG-APP-07": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-07_Testing_for_Prompt_Disclosure.md", "AITG-APP-08": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-08_Testing_for_Embedding_Manipulation.md", "AITG-APP-09": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-09_Testing_for_Model_Extraction.md", "AITG-APP-10": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-10_Testing_for_Content_Bias.md", "AITG-APP-11": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-11_Testing_for_Hallucinations.md", "AITG-APP-12": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-12_Testing_for_Toxic_Output.md", "AITG-APP-13": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-13_Testing_for_Over-Reliance_on_AI.md", "AITG-APP-14": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-APP-14_Testing_for_Explainability_and_Interpretability.md", "AITG-DAT-01": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-01_Testing_for_Training_Data_Exposure.md", "AITG-DAT-02": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-02_Testing_for_Runtime_Exfiltration.md", "AITG-DAT-03": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-03_Testing_for_Dataset_Diversity_and_Coverage.md", "AITG-DAT-04": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-04_Testing_for_Harmful_Content_in_Data.md", "AITG-DAT-05": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-DAT-05_Testing_for_Data_Minimization_and_Consent.md", "AITG-INF-01": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-01_Testing_for_Supply_Chain_Tampering.md", "AITG-INF-02": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-02_Testing_for_Resource_Exhaustion.md", "AITG-INF-03": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-03_Testing_for_Plugin_Boundary_Violations.md", "AITG-INF-04": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-04_Testing_for_Capability_Misuse.md", "AITG-INF-05": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-05_Testing_for_Fine-tuning_Poisoning.md", "AITG-INF-06": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-INF-06_Testing_for_Dev-Time_Model_Theft.md", "AITG-MOD-01": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-01_Testing_for_Evasion_Attacks.md", "AITG-MOD-02": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-02_Testing_for_Runtime_Model_Poisoning.md", "AITG-MOD-03": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-03_Testing_for_Poisoned_Training_Sets.md", "AITG-MOD-04": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-04_Testing_for_Membership_Inference.md", "AITG-MOD-05": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-05_Testing_for_Inversion_Attacks.md", "AITG-MOD-06": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-06_Testing_for_Robustness_to_New_Data.md", "AITG-MOD-07": "https://github.com/OWASP/www-project-ai-testing-guide/blob/main/Document/content/tests/AITG-MOD-07_Testing_for_Goal_Alignment.md"};
  function aitgUrl(id) { return aitgUrls[id] || "https://github.com/OWASP/www-project-ai-testing-guide/tree/main/Document/content/tests"; }
  function esc(s) {
    return String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

})();
