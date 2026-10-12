/* ─────────────────────────────────────────────────────────────
   AIHACKBins / lab.js
   In-browser scenario lab — no real model, no network calls.
   All scenario data is pulled from the cases.json `lab` field.
   ───────────────────────────────────────────────────────────── */

(function (global) {
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ── state ── */
  let records = [];
  let labRecords = [];
  let currentIdx = 0;
  let completedSteps = new Set();
  let notes = [];
  let typing = false;
  let currentMode = 'single';

  /* ── public init called by app.js once records are loaded ── */
  function init(allRecords) {
    records = allRecords;
    labRecords = allRecords.filter(r => r.lab);
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER — called by app.js route handler for #/lab and
     #/lab/<id>
  ═══════════════════════════════════════════════════════════ */
  function render(targetId) {
    if (!labRecords.length) {
      document.querySelector('#main').innerHTML =
        '<section class="panel"><h1>No lab scenarios available</h1>' +
        '<p>Add a <code>lab</code> field to entries in data/cases.json.</p></section>';
      return;
    }

    /* find starting index */
    if (targetId) {
      const idx = labRecords.findIndex(r => r.id === targetId);
      if (idx >= 0) currentIdx = idx;
    }

    completedSteps = new Set();
    notes = [];
    typing = false;
    currentMode = 'single';

    document.querySelector('#main').innerHTML = buildShell();
    bindEvents();
    renderSidebar();
    initTerminal();
  }

  /* ── shell HTML ── */
  function buildShell() {
    return `
<a class="crumb" href="#/">← All techniques</a>
<div class="lab-wrap">
  <div class="lab-topbar">
    <div class="lab-logo">AIHACK<em>Bins</em> / <em>LAB</em></div>
    <div class="lab-tabs" id="labTabs"></div>
    <div class="lab-sandbox-badge">⬡ SANDBOX — NO REAL MODEL</div>
  </div>

  <div class="lab-workspace">

    <!-- LEFT SIDEBAR -->
    <div class="lab-sidebar">
      <div class="lab-sidebar-inner">
        <div class="lab-scenario-header">
          <span class="lab-scenario-id" id="labScenId"></span>
          <div class="lab-scenario-title" id="labScenTitle"></div>
        </div>
        <div class="lab-mech" id="labScenMech"></div>

        <div class="lab-mapping-row" id="labMapping"></div>

        <div class="lab-progress-track"><div class="lab-progress-fill" id="labProgress" style="width:0%"></div></div>
        <div style="height:10px"></div>

        <div class="lab-section-label">Test procedure</div>
        <div class="lab-step-list" id="labStepList"></div>

        <div class="lab-section-label" style="display:flex;gap:8px;align-items:center">
          Attack payload
          <span class="lab-inject-badge">INJECT</span>
        </div>
        <div class="lab-payload-box" id="labPayloadBox"></div>
        <div class="lab-inject-note" id="labInjectNote"></div>
        <div class="lab-btn-row">
          <button class="lab-btn lab-btn-inject" id="labBtnInject">▶ Run Payload</button>
          <button class="lab-btn lab-btn-copy" id="labBtnCopy">Copy</button>
          <button class="lab-btn lab-btn-reset" id="labBtnReset">↺ Reset</button>
        </div>

        <div class="lab-notes-area" id="labNotesArea" style="display:none">
          <div class="lab-section-label">Recorded observations</div>
          <ol class="lab-notes-list" id="labNotesList"></ol>
        </div>
      </div>
    </div>

    <!-- TERMINAL PANE -->
    <div class="lab-terminal-pane" id="labTermPane">
      <div class="lab-term-header">
        <div class="lab-term-dots">
          <div class="lab-dot lab-dot-r"></div>
          <div class="lab-dot lab-dot-y"></div>
          <div class="lab-dot lab-dot-g"></div>
        </div>
        <div class="lab-term-title" id="labTermTitle"></div>
        <div class="lab-mode-toggle">
          <button class="lab-mode-btn lab-mode-active" id="labModeSingle" data-mode="single">Single</button>
          <button class="lab-mode-btn" id="labModeCompare" data-mode="compare">Compare</button>
        </div>
      </div>

      <!-- single view -->
      <div id="labSingleView" style="display:flex;flex-direction:column;flex:1;overflow:hidden;min-height:0">
        <div class="lab-term-body" id="labTermBody"></div>
        <div class="lab-evidence-row">
          <span class="lab-evidence-label">Record</span>
          <input class="lab-evidence-input" id="labEvidenceInput"
            placeholder="Note your observation — e.g. 'model echoed injected marker'">
          <button class="lab-btn lab-btn-record" id="labBtnRecord">+ Note</button>
        </div>
        <div class="lab-input-row">
          <span class="lab-term-prompt">you ›</span>
          <input class="lab-term-input" id="labTermInput"
            placeholder="Type a message to the AI, or click Run Payload →"
            autocomplete="off" spellcheck="false">
          <button class="lab-btn lab-btn-enter" id="labBtnEnter">↵ Send</button>
        </div>
      </div>

      <!-- compare view -->
      <div id="labCompareView" hidden style="display:none;flex:1;overflow:hidden;min-height:0">
        <div class="lab-compare-wrap">
          <div class="lab-compare-col">
            <div class="lab-compare-head lab-compare-vuln">⚠ VULNERABLE RESPONSE</div>
            <div class="lab-compare-body" id="labCmpVuln"></div>
          </div>
          <div class="lab-compare-col">
            <div class="lab-compare-head lab-compare-safe">✓ SECURE RESPONSE</div>
            <div class="lab-compare-body" id="labCmpSafe"></div>
          </div>
        </div>
      </div>
    </div>

  </div><!-- /.lab-workspace -->
</div><!-- /.lab-wrap -->`;
  }

  /* ── bind once ── */
  function bindEvents() {
    document.getElementById('labBtnInject').onclick = () => runPayload();
    document.getElementById('labBtnReset').onclick = reset;
    document.getElementById('labBtnEnter').onclick = sendInput;
    document.getElementById('labBtnRecord').onclick = recordNote;
    document.getElementById('labBtnCopy').onclick = copyPayload;
    document.getElementById('labTermInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); sendInput(); }
    });
    document.getElementById('labEvidenceInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); recordNote(); }
    });
    document.querySelectorAll('.lab-mode-btn').forEach(btn =>
      btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  }

  /* ── tabs ── */
  function buildTabs() {
    const tabs = document.getElementById('labTabs');
    if (!tabs) return;
    tabs.innerHTML = labRecords.map((r, i) =>
      `<button class="lab-stab${i === currentIdx ? ' lab-stab-active' : ''}" data-lab-idx="${i}">${esc(r.id)}</button>`
    ).join('');
    tabs.querySelectorAll('.lab-stab').forEach(btn =>
      btn.addEventListener('click', () => switchScenario(Number(btn.dataset.labIdx))));
  }

  function switchScenario(idx) {
    currentIdx = idx;
    completedSteps = new Set();
    notes = [];
    typing = false;
    currentMode = 'single';
    buildTabs();
    renderSidebar();
    initTerminal();
    /* reset compare */
    const sv = document.getElementById('labSingleView');
    const cv = document.getElementById('labCompareView');
    if (sv) sv.style.display = 'flex';
    if (cv) { cv.style.display = 'none'; cv.hidden = true; }
    document.querySelectorAll('.lab-mode-btn').forEach(b => {
      b.classList.toggle('lab-mode-active', b.dataset.mode === 'single');
    });
  }

  /* ── sidebar ── */
  function renderSidebar() {
    buildTabs();
    const r = labRecords[currentIdx];
    const lab = r.lab;

    document.getElementById('labScenId').textContent = r.id;
    document.getElementById('labScenTitle').textContent = r.title;
    document.getElementById('labScenMech').textContent = r.mechanism || '';
    document.getElementById('labTermTitle').textContent = lab.terminal_title;
    document.getElementById('labPayloadBox').textContent = r.payload || '';
    document.getElementById('labInjectNote').textContent = lab.inject_note || '';

    /* ATLAS + OWASP pills */
    const mapEl = document.getElementById('labMapping');
    const pills = [];
    if (r.atlas_id) pills.push(`<a class="pill a" href="https://atlas.mitre.org/techniques/${encodeURIComponent(r.atlas_id)}/" target="_blank" rel="noopener">${esc(r.atlas_id)} ↗</a>`);
    (r.owasp_ids || []).forEach(id => pills.push(`<span class="pill">${esc(id)}</span>`));
    mapEl.innerHTML = pills.join('');

    /* steps */
    const steps = (r.variants?.[0]?.steps || r.test_steps || []);
    const stepEl = document.getElementById('labStepList');
    stepEl.innerHTML = steps.map((s, i) => {
      const done = completedSteps.has(i);
      const active = !done && i === nextStep();
      return `<div class="lab-step${done ? ' lab-step-done' : active ? ' lab-step-active' : ''}" data-step="${i}">
        <span class="lab-step-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="lab-step-check">${done ? '✓' : ''}</div>
        <span class="lab-step-text">${esc(s)}</span>
      </div>`;
    }).join('');
    stepEl.querySelectorAll('.lab-step').forEach(el =>
      el.addEventListener('click', () => toggleStep(Number(el.dataset.step))));

    /* progress */
    const pct = steps.length ? (completedSteps.size / steps.length) * 100 : 0;
    document.getElementById('labProgress').style.width = pct + '%';

    /* notes */
    const na = document.getElementById('labNotesArea');
    const nl = document.getElementById('labNotesList');
    if (notes.length) {
      na.style.display = '';
      nl.innerHTML = notes.map(n => `<li>${esc(n)}</li>`).join('');
    } else {
      na.style.display = 'none';
    }
  }

  function nextStep() {
    const steps = labRecords[currentIdx]?.test_steps || [];
    for (let i = 0; i < steps.length; i++) { if (!completedSteps.has(i)) return i; }
    return steps.length;
  }

  function toggleStep(i) {
    if (completedSteps.has(i)) completedSteps.delete(i); else completedSteps.add(i);
    renderSidebar();
  }

  /* ── terminal ── */
  function initTerminal() {
    const r = labRecords[currentIdx];
    const body = document.getElementById('labTermBody');
    if (!body) return;
    body.innerHTML = '';
    addSysLine(`${r.lab.terminal_title}\nNo real model is running. Type a message or click "Run Payload".`);
    addSysLine(`OWASP: ${(r.owasp_ids || []).join(', ')} · ATLAS: ${r.atlas_id || 'not mapped'}`);
  }

  function addSysLine(msg) {
    const body = document.getElementById('labTermBody');
    if (!body) return;
    const el = document.createElement('div');
    el.className = 'lab-tline-system';
    el.innerHTML = `<span class="lab-tpfx">⬡</span><span class="lab-tmsg">${esc(msg)}</span>`;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function addUserLine(msg) {
    const body = document.getElementById('labTermBody');
    if (!body) return;
    const el = document.createElement('div');
    el.className = 'lab-tline lab-tline-user';
    el.innerHTML = `<span class="lab-tpfx">you ›</span><span class="lab-tmsg">${esc(msg)}</span>`;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function addInjectLine(msg) {
    const body = document.getElementById('labTermBody');
    if (!body) return;
    const el = document.createElement('div');
    el.className = 'lab-inject-line';
    el.textContent = msg;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  async function addResponseBlock(blocks, isVuln) {
    const body = document.getElementById('labTermBody');
    if (!body) return;
    const container = document.createElement('div');
    container.className = `lab-response-block ${isVuln ? 'lab-response-vuln' : 'lab-response-safe'}`;
    const tag = isVuln
      ? `<div class="lab-response-tag lab-tag-vuln"><div class="lab-dot-tag"></div>VULNERABLE — INJECTION FOLLOWED</div>`
      : `<div class="lab-response-tag lab-tag-safe"><div class="lab-dot-tag"></div>SECURE — INJECTION REJECTED</div>`;
    container.innerHTML = tag + '<div class="lab-response-text" id="labTypeTarget"></div>';
    body.appendChild(container);
    body.scrollTop = body.scrollHeight;

    const target = container.querySelector('#labTypeTarget');
    let full = '';
    for (const block of blocks) {
      await sleep(block.delay);
      for (let i = 0; i < block.text.length; i++) {
        full += block.text[i];
        target.textContent = full;
        body.scrollTop = body.scrollHeight;
        if (i < block.text.length - 1) await sleep(8);
      }
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ── run payload ── */
  async function runPayload() {
    if (typing) return;
    typing = true;
    const r = labRecords[currentIdx];
    const lab = r.lab;
    addUserLine(lab.clean_prompt);
    await sleep(300);
    addInjectLine('↳ ' + (lab.inject_note || 'payload injected…'));
    completedSteps.add(0);
    completedSteps.add(1);
    renderSidebar();
    await sleep(500);
    await addResponseBlock(lab.vuln_responses, true);
    completedSteps.add(2);
    renderSidebar();
    typing = false;
  }

  /* ── user typed input ── */
  async function sendInput() {
    const input = document.getElementById('labTermInput');
    const val = (input?.value || '').trim();
    if (!val || typing) return;
    input.value = '';
    addUserLine(val);
    const lower = val.toLowerCase();
    const lab = labRecords[currentIdx].lab;
    if (lower.includes('safe') || lower.includes('secure') || lower.includes('clean')) {
      await addResponseBlock([{ delay: 0, text: lab.safe_response }], false);
    } else if (lower.includes('payload') || lower.includes('inject') || lower.includes('attack') || lower.includes('run')) {
      await runPayload();
    } else {
      await sleep(400);
      await addResponseBlock([{ delay: 0, text: `Ready to test "${labRecords[currentIdx].title}".\n\nType "run payload" to simulate the attack, or "safe" to see what a secure response looks like. Switch to Compare mode to see both at once.` }], false);
    }
  }

  /* ── record note ── */
  function recordNote() {
    const input = document.getElementById('labEvidenceInput');
    const val = (input?.value || '').trim();
    if (!val) return;
    notes.push(val);
    input.value = '';
    addSysLine(`Recorded [${notes.length}]: ${val}`);
    completedSteps.add(3);
    renderSidebar();
  }

  /* ── copy payload ── */
  function copyPayload() {
    const r = labRecords[currentIdx];
    const btn = document.getElementById('labBtnCopy');
    navigator.clipboard.writeText(r.payload || '').then(() => {
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    }).catch(() => {
      const box = document.getElementById('labPayloadBox');
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(box);
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }

  /* ── reset ── */
  function reset() {
    completedSteps = new Set();
    notes = [];
    initTerminal();
    renderSidebar();
  }

  /* ── compare mode ── */
  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.lab-mode-btn').forEach(b =>
      b.classList.toggle('lab-mode-active', b.dataset.mode === mode));
    const sv = document.getElementById('labSingleView');
    const cv = document.getElementById('labCompareView');
    if (mode === 'single') {
      sv.style.display = 'flex'; cv.style.display = 'none'; cv.hidden = true;
    } else {
      sv.style.display = 'none'; cv.style.display = 'flex'; cv.hidden = false;
      renderCompare();
    }
  }

  function renderCompare() {
    const r = labRecords[currentIdx];
    const lab = r.lab;
    const vEl = document.getElementById('labCmpVuln');
    const sEl = document.getElementById('labCmpSafe');
    if (!vEl || !sEl) return;

    vEl.innerHTML = `
      <div class="lab-cmp-user">User: ${esc(lab.clean_prompt)}</div>
      <div class="lab-cmp-inject">↓ ${esc(lab.inject_note)}</div>
      <div class="lab-cmp-block lab-cmp-block-vuln">${lab.vuln_responses.map(v => esc(v.text)).join('')}</div>
      <div class="lab-cmp-label lab-cmp-label-vuln">▲ INJECTION FOLLOWED — POLICY VIOLATED</div>
      <div class="lab-cmp-evidence">Expected evidence: ${esc(lab.expected_evidence)}</div>`;

    sEl.innerHTML = `
      <div class="lab-cmp-user">User: ${esc(lab.clean_prompt)}</div>
      <div class="lab-cmp-inject" style="color:var(--accent)">↓ Injection detected and rejected</div>
      <div class="lab-cmp-block lab-cmp-block-safe">${esc(lab.safe_response)}</div>
      <div class="lab-cmp-label lab-cmp-label-safe">▲ INJECTION REJECTED — SECURE BEHAVIOUR</div>
      <div class="lab-cmp-evidence">The model identified untrusted content and did not follow embedded instructions.</div>`;
  }

  /* ── expose ── */
  global.AIHACKBinsLab = { init, render, labRecords: () => labRecords };

})(window);
