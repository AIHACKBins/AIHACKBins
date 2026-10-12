/* AIHACKBins lab.js — Option 1 "Exploit paper"
 * GTFOBins philosophy: each scenario is specific, reproducible, has a
 * verifiable canary string as pass/fail evidence. Kerckhoff-compliant.
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
    const r = labRecords[currentIdx];
    host.innerHTML =
      '<div class="cat-head">' +
        '<h1 class="cat-title">Interactive Lab</h1>' +
        '<p class="cat-lead">Simulated scenarios — no real model or network is contacted. Each scenario uses a canary string as objective pass/fail evidence, following Kerckhoff\'s principle.</p>' +
        '<p class="lab-disclaimer"><strong>Simulation only.</strong> Scripted demonstrations of published techniques. Only test systems you own or have authorisation to assess.</p>' +
      '</div>' +
      '<div class="scenario-list">' +
        labRecords.map((lr, i) =>
          '<a class="scenario-item' + (i === currentIdx ? ' active' : '') + '" href="#/lab/' + esc(lr.id) + '" data-idx="' + i + '">' +
            '<span class="s-id">' + esc(lr.id) + '</span>' +
            '<span class="s-title">' + esc(lr.title) + '</span>' +
            '<span class="s-target">' + esc(lr.target) + '</span>' +
            '<span class="s-pills">' +
              (lr.atlas_id ? '<span class="pill pill-atlas">' + esc(lr.atlas_id) + '</span>' : '') +
              (lr.owasp_ids || []).slice(0, 1).map(k => '<span class="pill pill-owasp">' + esc(k) + '</span>').join('') +
            '</span>' +
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
        '<div class="lab-term">' +
          '<div class="lab-term-bar">' +
            '<span class="lab-term-title">' + esc(lab.terminal_title || r.id + ' · simulation') + '</span>' +
            '<div class="lab-mode-row">' +
              '<button class="lab-modebn' + (mode === 'single' ? ' active' : '') + '" data-mode="single">Terminal</button>' +
              '<button class="lab-modebn' + (mode === 'compare' ? ' active' : '') + '" data-mode="compare">Compare</button>' +
            '</div>' +
          '</div>' +
          (mode === 'single'
            ? '<div class="lab-body" id="lab-body" role="log" aria-live="polite"></div>' +
              '<div class="lab-input-row">' +
                '<span class="lab-prompt-sym">$</span>' +
                '<input id="lab-input" type="text" placeholder="Type a message or click Run Injection…" autocomplete="off" spellcheck="false">' +
                '<button class="lab-run" id="lab-run">Run Injection</button>' +
              '</div>'
            : buildCompareHTML(r, lab)
          ) +
        '</div>' +
        '<div class="lab-side">' + buildSideHTML(r, lab) + '</div>' +
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
        '<mark class="cmp-canary">' + esc(canary) + '</mark>');
    }
    const vulnText = (lab.vuln_responses || []).map(v => v.text).join('\n\n');
    return '<div class="cmp-wrap">' +
      '<div class="cmp-pane vuln">' +
        '<div class="cmp-head">⚠ Vulnerable response</div>' +
        '<div class="cmp-body">' + hilite(vulnText) + '</div>' +
      '</div>' +
      '<div class="cmp-pane safe">' +
        '<div class="cmp-head">✓ Secure / patched response</div>' +
        '<div class="cmp-body">' + esc(lab.safe_response || 'No safe response defined.') + '</div>' +
      '</div>' +
    '</div>';
  }

  function buildSideHTML(r, lab) {
    const stepLabels = [
      'Inject payload into target',
      'Submit clean prompt',
      'Observe response for canary',
      'Record findings',
    ];
    return (
      '<div class="lab-side-section">' +
        '<div class="lab-side-head">Steps</div>' +
        '<div class="lab-side-body">' +
          stepLabels.map((s, i) =>
            '<div class="lab-step-item" id="lab-step-' + i + '">' +
              '<div class="lab-step-n">' + (i + 1) + '</div>' +
              '<span>' + esc(s) + '</span>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>' +
      '<div class="lab-side-section">' +
        '<div class="lab-side-head">Payload context</div>' +
        '<div class="lab-side-body">' +
          '<pre class="lab-payload-mono">' + esc(lab.inject_note || 'See technique entry for details') + '</pre>' +
        '</div>' +
      '</div>' +
      '<div class="lab-side-section">' +
        '<div class="lab-side-head">Mappings</div>' +
        '<div class="lab-side-body">' +
          (r.atlas_id
            ? '<a class="pill pill-atlas" href="https://atlas.mitre.org/techniques/' + encodeURIComponent(r.atlas_id) + '/" target="_blank" rel="noopener">' + esc(r.atlas_id) + ' ↗</a>'
            : '') +
          (r.owasp_ids || []).map(k => '<span class="pill pill-owasp">' + esc(k) + '</span>').join('') +
          (r.atlas_name ? '<p class="lab-atlas-name">' + esc(r.atlas_name) + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<div class="lab-side-section">' +
        '<div class="lab-side-head">Expected evidence (canary)</div>' +
        '<div class="lab-side-body">' +
          '<div class="lab-evidence-box">' + esc(lab.expected_evidence || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="lab-side-section">' +
        '<div class="lab-side-head">Your observations</div>' +
        '<div class="lab-side-body">' +
          '<textarea class="lab-notes-area" id="lab-note-input" placeholder="Record what you observed in your real test…"></textarea>' +
          '<button class="lab-save" id="lab-save-note">Save note</button>' +
          '<ul class="lab-notes-log" id="lab-notes-list"></ul>' +
        '</div>' +
      '</div>'
    );
  }

  // ── Bind events ────────────────────────────────────────────
  function bindEvents(r, lab, host) {
    host.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => { mode = btn.dataset.mode; renderWorkspace(host); });
    });

    const runBtn  = host.querySelector('#lab-run');
    const inputEl = host.querySelector('#lab-input');
    if (runBtn)  runBtn.addEventListener('click', () => runInjection(r, lab, host));
    if (inputEl) inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !running) {
        const val = inputEl.value.trim();
        if (val) { appendLine(host, 'tl-prompt', '> ' + val); inputEl.value = ''; }
        if (step === 0) runInjection(r, lab, host);
      }
    });

    const saveBtn = host.querySelector('#lab-save-note');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const ta  = host.querySelector('#lab-note-input');
      const val = ta && ta.value.trim();
      if (!val) return;
      notes.push(val); ta.value = '';
      const ul = host.querySelector('#lab-notes-list');
      if (ul) ul.innerHTML = notes.map(n => '<li>' + esc(n) + '</li>').join('');
    });
  }

  // ── Terminal init ──────────────────────────────────────────
  function initTerminal(lab, host) {
    const body = host.querySelector('#lab-body');
    if (!body) return;
    [
      ['tl-sys', 'AIHACKBins Lab — simulation mode'],
      ['tl-sys', 'No real model, shell or network contacted.'],
      ['tl-sys', '────────────────────────────────────────'],
      ['tl-text', 'Scenario: ' + (lab.terminal_title || 'unnamed')],
      ['tl-text', 'Clean prompt: "' + (lab.clean_prompt || '') + '"'],
      ['tl-sys', '────────────────────────────────────────'],
      ['tl-sys', 'Click [Run Injection] to simulate the vulnerable response.'],
      ['tl-sys', 'Switch to [Compare] to see both outcomes side by side.'],
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
    const runBtn = host.querySelector('#lab-run');
    if (runBtn) { runBtn.disabled = true; runBtn.textContent = 'Running…'; }
    setStep(host, 0);

    appendLine(host, 'tl-sys', '');
    appendLine(host, 'tl-sys', '> ' + (lab.clean_prompt || 'Sending prompt…'));
    await delay(600);
    appendLine(host, 'tl-sys', '[Injection: ' + (lab.inject_note || 'payload embedded') + ']');
    await delay(800);
    setStep(host, 1);
    appendLine(host, 'tl-sys', '── Vulnerable model response ────────────────────────');

    const body = host.querySelector('#lab-body');
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
      appendLine(host, 'tl-warn',  '⚠  Injection followed — marker present in response');
    }

    await delay(700);
    appendLine(host, 'tl-sys', '── Secure / patched response ───────────────────────');
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
    const body = host.querySelector('#lab-body');
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
