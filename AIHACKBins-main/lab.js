/* AIHACKBins lab.js — interactive scenario terminal
 * GTFOBins philosophy: each scenario is specific, reproducible, has a
 * verifiable canary string as pass/fail evidence. Kerckhoff-compliant:
 * the technique works even when the target knows about it.
 * No real model is contacted. Simulation only.
 */
(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────
  let labRecords = [];
  let currentIdx = 0;
  let mode = 'single'; // 'single' | 'compare'
  let running = false;
  let step = 0;
  let notes = [];

  // ── Public API ────────────────────────────────────────────
  window.AIHACKBinsLab = { init, render, renderInline };

  function init(records) {
    labRecords = records.filter(r => r.lab);
  }

  // Full-page lab: called by router for #/lab and #/lab/<id>
  function render(targetId) {
    const mainEl = document.getElementById('main');
    if (!mainEl) return;
    if (!labRecords.length) {
      mainEl.innerHTML = '<p class="empty-state">No lab scenarios available.</p>';
      return;
    }
    if (targetId) {
      const idx = labRecords.findIndex(r => r.id === targetId);
      currentIdx = idx >= 0 ? idx : 0;
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === 'lab');
    });
    const crumbs = document.getElementById('topbar-crumbs');
    if (crumbs) crumbs.innerHTML = '<a href="#/">Catalogue</a><span class="topbar-crumb-sep">/</span><span>Lab</span>';

    const r = labRecords[currentIdx];
    mainEl.innerHTML = '<div id="lab-full-host"></div>';
    renderLabPage(mainEl.querySelector('#lab-full-host'));
  }

  // Inline lab: renders into a host element inside detail page tab
  function renderInline(record, hostEl) {
    if (!hostEl) return;
    const idx = labRecords.findIndex(r => r.id === record.id);
    if (idx < 0) {
      hostEl.innerHTML = '<p class="empty-state">No lab scenario for this technique.</p>';
      return;
    }
    currentIdx = idx;
    renderWorkspace(hostEl);
  }

  // ── Full page ──────────────────────────────────────────────
  function renderLabPage(host) {
    host.innerHTML =
      '<div class="lab-header">' +
        '<h1>Interactive Lab</h1>' +
        '<p>Simulated scenarios — no real model or network is contacted. Each scenario uses a canary string as objective pass/fail evidence, following Kerckhoff\'s principle.</p>' +
      '</div>' +
      '<div class="lab-disclaimer">' +
        '<span>⚠</span>' +
        '<div><strong>Simulation only.</strong> Scripted demonstrations of published techniques. Only test systems you own or have authorisation to assess. The canary string is the only objective evidence of injection.</div>' +
      '</div>' +
      '<div class="lab-scenario-grid">' +
        labRecords.map((lr, i) =>
          '<a class="lab-scenario-card' + (i === currentIdx ? ' active' : '') + '" href="#/lab/' + esc(lr.id) + '" data-idx="' + i + '">' +
            '<div class="lsc-id">' + esc(lr.id) + '</div>' +
            '<div class="lsc-title">' + esc(lr.title) + '</div>' +
            '<div class="lsc-target">' + esc(lr.target) + '</div>' +
            '<div class="lsc-pills">' +
              (lr.atlas_id ? '<span class="pill pill-atlas" style="font-size:9px">' + esc(lr.atlas_id) + '</span>' : '') +
              (lr.owasp_ids || []).slice(0,2).map(k => '<span class="pill pill-owasp" style="font-size:9px">' + esc(k) + '</span>').join('') +
            '</div>' +
          '</a>'
        ).join('') +
      '</div>' +
      '<div id="lab-ws-host"></div>';

    host.querySelectorAll('[data-idx]').forEach(card => {
      card.addEventListener('click', e => {
        e.preventDefault();
        currentIdx = Number(card.dataset.idx);
        location.hash = '#/lab/' + encodeURIComponent(labRecords[currentIdx].id);
      });
    });

    renderWorkspace(host.querySelector('#lab-ws-host'));
  }

  // ── Workspace ──────────────────────────────────────────────
  function renderWorkspace(host) {
    if (!host) return;
    step = 0; notes = []; running = false;
    const r = labRecords[currentIdx];
    const lab = r.lab;

    host.innerHTML =
      '<div class="lab-workspace">' +
        '<div class="lab-terminal-card">' +
          '<div class="lab-term-chrome">' +
            '<div class="term-dots"><div class="term-dot"></div><div class="term-dot"></div><div class="term-dot"></div></div>' +
            '<div class="term-title-text">' + esc(lab.terminal_title || r.id + ' · simulation') + '</div>' +
            '<div class="lab-mode-toggle">' +
              '<button class="lab-mode-btn' + (mode === 'single' ? ' active' : '') + '" data-mode="single">Terminal</button>' +
              '<button class="lab-mode-btn' + (mode === 'compare' ? ' active' : '') + '" data-mode="compare">Compare</button>' +
            '</div>' +
          '</div>' +
          '<div id="lab-body-wrap">' +
            (mode === 'single'
              ? '<div class="lab-term-body" id="lab-term-body" role="log" aria-live="polite"></div>'
              : buildCompareHTML(r, lab)
            ) +
          '</div>' +
          (mode === 'single'
            ? '<div class="lab-input-bar">' +
                '<label for="lab-input">$</label>' +
                '<input id="lab-input" type="text" placeholder="Type a message or click Run Injection…" autocomplete="off" spellcheck="false">' +
                '<button class="lab-run-btn" id="lab-run-btn">Run Injection</button>' +
              '</div>'
            : ''
          ) +
        '</div>' +
        '<div class="lab-sidebar">' + buildSidebarHTML(r, lab) + '</div>' +
      '</div>';

    bindEvents(r, lab, host);
    if (mode === 'single') initTerminal(lab, host);
  }

  function buildCompareHTML(r, lab) {
    const canary = extractCanary(lab);
    function hilite(text) {
      if (!canary) return esc(text);
      const safe = canary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return esc(text).replace(new RegExp(safe, 'g'),
        '<mark class="compare-canary">' + esc(canary) + '</mark>');
    }
    const vulnText = (lab.vuln_responses || []).map(v => v.text).join('\n\n');
    return '<div class="lab-compare">' +
      '<div class="compare-pane vuln">' +
        '<div class="compare-pane-header">⚠ Vulnerable response</div>' +
        '<div class="compare-pane-body">' + hilite(vulnText) + '</div>' +
      '</div>' +
      '<div class="compare-pane safe">' +
        '<div class="compare-pane-header">✓ Secure / patched response</div>' +
        '<div class="compare-pane-body">' + esc(lab.safe_response || 'No safe response defined.') + '</div>' +
      '</div>' +
    '</div>';
  }

  function buildSidebarHTML(r, lab) {
    const stepLabels = [
      'Inject payload into target',
      'Submit clean prompt',
      'Observe response for canary',
      'Record findings',
    ];
    return (
      '<div class="lab-card">' +
        '<h3>Steps</h3>' +
        '<div class="lab-steps">' +
          stepLabels.map((s, i) =>
            '<div class="lab-step" id="lab-step-' + i + '">' +
              '<div class="lab-step-num">' + (i + 1) + '</div>' +
              '<span>' + esc(s) + '</span>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>' +
      '<div class="lab-card">' +
        '<h3>Payload context</h3>' +
        '<pre class="lab-payload-pre">' + esc(lab.inject_note || 'See technique entry for details') + '</pre>' +
      '</div>' +
      '<div class="lab-card">' +
        '<h3>Mappings</h3>' +
        '<div class="lab-map-row">' +
          (r.atlas_id ? '<a class="pill pill-atlas" href="https://atlas.mitre.org/techniques/' + encodeURIComponent(r.atlas_id) + '/" target="_blank" rel="noopener">' + esc(r.atlas_id) + ' ↗</a>' : '') +
          (r.owasp_ids || []).map(k => '<span class="pill pill-owasp">' + esc(k) + '</span>').join('') +
        '</div>' +
        (r.atlas_name ? '<p style="font-size:12px;color:var(--muted);margin-top:8px">' + esc(r.atlas_name) + '</p>' : '') +
      '</div>' +
      '<div class="lab-card">' +
        '<h3>Expected evidence (canary)</h3>' +
        '<div class="lab-evidence">' + esc(lab.expected_evidence || '') + '</div>' +
      '</div>' +
      '<div class="lab-card">' +
        '<h3>Your observations</h3>' +
        '<div class="lab-notes">' +
          '<textarea id="lab-note-input" placeholder="Record what you observed in your real test…"></textarea>' +
          '<button class="lab-save-btn" id="lab-save-note">Save note</button>' +
          '<ul class="lab-notes-list" id="lab-notes-list"></ul>' +
        '</div>' +
      '</div>'
    );
  }

  // ── Bind events ────────────────────────────────────────────
  function bindEvents(r, lab, host) {
    host.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => { mode = btn.dataset.mode; renderWorkspace(host); });
    });

    const runBtn = host.querySelector('#lab-run-btn');
    const inputEl = host.querySelector('#lab-input');
    if (runBtn) runBtn.addEventListener('click', () => runInjection(r, lab, host));
    if (inputEl) inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !running) {
        const val = inputEl.value.trim();
        if (val) { appendLine(host, 'tl-prompt', '> ' + val); inputEl.value = ''; }
        if (step === 0) runInjection(r, lab, host);
      }
    });

    const saveBtn = host.querySelector('#lab-save-note');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const ta = host.querySelector('#lab-note-input');
      const val = ta && ta.value.trim();
      if (!val) return;
      notes.push(val); ta.value = '';
      const ul = host.querySelector('#lab-notes-list');
      if (ul) ul.innerHTML = notes.map(n => '<li>' + esc(n) + '</li>').join('');
    });
  }

  // ── Terminal init ──────────────────────────────────────────
  function initTerminal(lab, host) {
    const body = host.querySelector('#lab-term-body');
    if (!body) return;
    [
      ['tl-sys', 'AIHACKBins Lab — simulation mode'],
      ['tl-sys', 'No real model, shell or network contacted.'],
      ['tl-sys', '────────────────────────────────────'],
      ['tl-text', 'Scenario: ' + (lab.terminal_title || 'unnamed')],
      ['tl-text', 'Clean prompt: "' + (lab.clean_prompt || '') + '"'],
      ['tl-sys', '────────────────────────────────────'],
      ['tl-sys', 'Click [Run Injection] to simulate the vulnerable response.'],
      ['tl-sys', 'Switch to Compare mode to see both outcomes side by side.'],
    ].forEach(([cls, text]) => {
      const el = document.createElement('div');
      el.className = cls; el.textContent = text;
      body.appendChild(el);
    });
  }

  // ── Run injection ──────────────────────────────────────────
  async function runInjection(r, lab, host) {
    if (running) return;
    running = true;
    const runBtn = host.querySelector('#lab-run-btn');
    if (runBtn) { runBtn.disabled = true; runBtn.textContent = 'Running…'; }
    setStep(host, 0);

    appendLine(host, 'tl-sys', '');
    appendLine(host, 'tl-sys', '> ' + (lab.clean_prompt || 'Sending prompt…'));
    await delay(600);
    appendLine(host, 'tl-sys', '[Injection: ' + (lab.inject_note || 'payload embedded') + ']');
    await delay(800);
    setStep(host, 1);
    appendLine(host, 'tl-sys', '── Vulnerable model response ─────────────────────');

    const body = host.querySelector('#lab-term-body');
    const vulnBlock = document.createElement('div');
    vulnBlock.className = 'tl-vuln'; body.appendChild(vulnBlock);

    for (const resp of (lab.vuln_responses || [])) {
      await delay(resp.delay || 500);
      await typeText(vulnBlock, resp.text || '');
      body.scrollTop = body.scrollHeight;
    }

    await delay(400);
    setStep(host, 2);

    const canary = extractCanary(lab);
    if (canary && vulnBlock.textContent.includes(canary)) {
      appendLine(host, 'tl-canary', '🚩 CANARY DETECTED: ' + canary);
      appendLine(host, 'tl-warn',  '⚠ Injection followed — marker present in response');
    }

    await delay(700);
    appendLine(host, 'tl-sys', '── Secure / patched response ──────────────────────');
    const safeBlock = document.createElement('div');
    safeBlock.className = 'tl-safe'; body.appendChild(safeBlock);
    await typeText(safeBlock, lab.safe_response || '[No safe response defined]');
    appendLine(host, 'tl-pass', '✓ No canary in safe response');

    body.scrollTop = body.scrollHeight;
    setStep(host, 3);

    running = false;
    if (runBtn) { runBtn.disabled = false; runBtn.textContent = 'Run again'; }
  }

  // ── Helpers ────────────────────────────────────────────────
  function extractCanary(lab) {
    const text = (lab.vuln_responses || []).map(v => v.text).join(' ');
    const m = text.match(/([A-Z][A-Z0-9_]{4,}(?:_[A-Z0-9]+)+)/);
    return m ? m[1] : null;
  }

  function appendLine(host, cls, text) {
    const body = host.querySelector('#lab-term-body');
    if (!body) return;
    const el = document.createElement('div');
    el.className = cls; el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  async function typeText(el, text, ms = 7) {
    let out = '';
    for (const ch of text) {
      out += ch; el.textContent = out;
      if (ch !== ' ' && Math.random() > 0.6) await delay(ms);
    }
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function setStep(host, n) {
    step = n;
    for (let i = 0; i < 4; i++) {
      const el = host.querySelector('#lab-step-' + i);
      if (!el) continue;
      el.classList.toggle('done', i < n);
      el.classList.toggle('current', i === n);
    }
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g,
      c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

})();
