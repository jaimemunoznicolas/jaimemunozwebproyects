(function () {
  'use strict';

  // ---- DOM refs ----
  const modeTabs = document.querySelectorAll('.mode-tab');
  const panels = {
    calc: document.getElementById('panelCalc'),
    graphing: document.getElementById('panelGraphing'),
    matrix: document.getElementById('panelMatrix'),
    stats: document.getElementById('panelStats'),
    converter: document.getElementById('panelConverter'),
    programmer: document.getElementById('panelProgrammer'),
  };
  const modeBadge = document.getElementById('modeBadge');
  const toast = document.getElementById('toast');

  // ---- Calc state ----
  let currentInput = '';
  let fullExpression = '';
  let history = [];
  let degMode = true;
  let historyOpen = false;
  let justEvaluated = false;
  let currentMode = 'basic';

  // ---- Toast ----
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ====================== MODE SWITCHING ======================
  const BASIC_BUTTONS = [
    'clear','back','percent','divide',
    'sin','cos','tan','multiply',
    'ln','log','sqrt','subtract',
    'square','cube','power','add',
    'factorial','inv','abs','toggleSign',
    '7','8','9','cbrt',
    '4','5','6','pi',
    '1','2','3','e',
    '0','dot','lparen','rparen',
    'rand','floor','ceil','round',
    'history','degRad','equals','equals',
  ];

  const SCIENTIFIC_BUTTONS = [
    'clear','back','percent','divide','log2',
    'sin','cos','tan','multiply','log10',
    'asin','acos','atan','subtract','ln',
    'sinh','cosh','tanh','add','sqrt',
    'square','cube','power','cbrt','nroot',
    'factorial','inv','abs','toggleSign','exp',
    '7','8','9','pi','e',
    '4','5','6','lparen','rparen',
    '1','2','3','rand','mod',
    '0','dot','history','degRad','equals',
  ];

  const buttonConfig = {
    basic:  { cols: 4, buttons: BASIC_BUTTONS },
    scientific: { cols: 5, buttons: SCIENTIFIC_BUTTONS },
  };

  const btnLabels = {
    clear:'AC', back:'⌫', percent:'%', divide:'÷', multiply:'×', subtract:'−', add:'+',
    equals:'=', toggleSign:'±', dot:'.', lparen:'(', rparen:')',
    sin:'sin', cos:'cos', tan:'tan', ln:'ln', log:'log', sqrt:'√', square:'x²', cube:'x³', power:'xⁿ',
    factorial:'n!', inv:'1/x', abs:'|x|', cbrt:'∛', pi:'π', e:'e', rand:'rand',
    floor:'floor', ceil:'ceil', round:'round', history:'📜', degRad:'DEG',
    asin:'asin', acos:'acos', atan:'atan', sinh:'sinh', cosh:'cosh', tanh:'tanh',
    log2:'log₂', log10:'log₁₀', nroot:'ʸ√x', exp:'eˣ', mod:'mod',
  };

  const btnClasses = {
    equals:'equals', history:'fn-wide', degRad:'fn-wide',
  };

  function buildButtonGrid(mode) {
    const grid = document.getElementById('buttonGrid');
    const cfg = buttonConfig[mode];
    if (!cfg) return;
    grid.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
    grid.innerHTML = '';
    cfg.buttons.forEach((key) => {
      const label = btnLabels[key] || key;
      let cls = 'btn ';
      if (/^[0-9]$/.test(key)) cls += 'num';
      else if (key === 'equals') cls += 'equals';
      else if (['add','subtract','multiply','divide','power'].includes(key)) cls += 'op';
      else if (['history','degRad'].includes(key)) cls += 'fn-wide';
      else cls += 'func';
      if (btnClasses[key]) cls += ' ' + btnClasses[key];
      const btn = document.createElement('button');
      btn.className = cls;
      btn.dataset.action = key;
      btn.textContent = label;
      if (key === '0') btn.classList.add('zero');
      grid.appendChild(btn);
    });
  }

  function switchMode(mode) {
    currentMode = mode;
    modeBadge.textContent = {basic:'Básica',scientific:'Científica',graphing:'Gráficas',matrix:'Matrices',stats:'Estadística',converter:'Conversor',programmer:'Programador'}[mode] || mode;
    modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    Object.values(panels).forEach(p => p.classList.remove('active'));
    const panelMap = { basic:'calc', scientific:'calc', graphing:'graphing', matrix:'matrix', stats:'stats', converter:'converter', programmer:'programmer' };
    const panel = panels[panelMap[mode]];
    if (panel) panel.classList.add('active');
    if (mode === 'basic' || mode === 'scientific') {
      buildButtonGrid(mode);
      initCalcListeners();
    }
    if (mode === 'graphing') initGraphing();
    if (mode === 'matrix') initMatrix();
    if (mode === 'stats') initStats();
    if (mode === 'converter') initConverter();
    if (mode === 'programmer') initProgrammer();
  }

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });

  // ====================== CALCULATOR ENGINE ======================
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const historyList = document.getElementById('historyList');
  const historyPanel = document.getElementById('historyPanel');

  function updateDisplay() {
    expressionEl.textContent = fullExpression;
    resultEl.textContent = currentInput || '0';
    resultEl.classList.toggle('small', (currentInput || '0').length > 12);
  }

  function appendToInput(val) {
    if (justEvaluated) {
      if (/\d|\./.test(val)) { currentInput = ''; fullExpression = ''; }
      justEvaluated = false;
    }
    if (val === '.' && currentInput.includes('.')) return;
    if (val === '.' && currentInput === '') currentInput = '0';
    currentInput += val;
    fullExpression += val;
    updateDisplay();
  }

  function appendOperator(op) {
    if (justEvaluated) { fullExpression = currentInput; justEvaluated = false; }
    const last = fullExpression.slice(-1);
    if (/[+\-×÷^/%]/.test(last)) fullExpression = fullExpression.slice(0, -1);
    currentInput = '';
    fullExpression += op;
    updateDisplay();
  }

  function clearAll() {
    currentInput = ''; fullExpression = '';
    resultEl.classList.remove('error');
    updateDisplay();
  }

  function backspace() {
    if (justEvaluated) { clearAll(); return; }
    if (currentInput.length > 0) { currentInput = currentInput.slice(0, -1); fullExpression = fullExpression.slice(0, -1); }
    else { fullExpression = fullExpression.slice(0, -1); }
    resultEl.classList.remove('error');
    updateDisplay();
  }

  function toggleSign() {
    if (justEvaluated) { currentInput = String(-parseFloat(currentInput)); fullExpression = currentInput; justEvaluated = false; updateDisplay(); return; }
    if (currentInput.startsWith('-')) { currentInput = currentInput.slice(1); fullExpression = fullExpression.replace(/^\-/,''); }
    else { currentInput = '-' + currentInput; fullExpression = '-' + fullExpression; }
    updateDisplay();
  }

  function parseExpr(expr) {
    let p = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,`(${Math.PI})`).replace(/\be\b/g,`(${Math.E})`).replace(/%/g,'/100');
    try { return Function('"use strict"; return (' + p + ')')(); } catch { return NaN; }
  }

  function formatResult(n) {
    if (!isFinite(n) || isNaN(n)) return 'Error';
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
    return String(parseFloat(n.toPrecision(12)));
  }

  function addHistory(expr, res) {
    history.unshift({ expr, res: formatResult(res) });
    if (history.length > 50) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(h => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<span class="h-expr">${h.expr}</span> <span class="h-res">= ${h.res}</span>`;
      div.addEventListener('click', () => {
        currentInput = h.res; fullExpression = currentInput; justEvaluated = true;
        updateDisplay(); historyPanel.classList.remove('open'); historyOpen = false;
      });
      historyList.appendChild(div);
    });
  }

  function applyUnary(fn, name) {
    let val = parseFloat(currentInput);
    if (isNaN(val)) val = 0;
    let result;
    const rad = degMode ? Math.PI / 180 : 1;
    switch (fn) {
      case 'sin': result = Math.sin(val * rad); break;
      case 'cos': result = Math.cos(val * rad); break;
      case 'tan': result = Math.tan(val * rad); if (Math.abs(result) > 1e15) { showToast('tan indefinida'); return; } break;
      case 'asin': result = val < -1 || val > 1 ? NaN : Math.asin(val) / rad; break;
      case 'acos': result = val < -1 || val > 1 ? NaN : Math.acos(val) / rad; break;
      case 'atan': result = Math.atan(val) / rad; break;
      case 'sinh': result = Math.sinh(val); break;
      case 'cosh': result = Math.cosh(val); break;
      case 'tanh': result = Math.tanh(val); break;
      case 'ln': result = val <= 0 ? NaN : Math.log(val); break;
      case 'log': case 'log10': result = val <= 0 ? NaN : Math.log10(val); break;
      case 'log2': result = val <= 0 ? NaN : Math.log2(val); break;
      case 'sqrt': result = val < 0 ? NaN : Math.sqrt(val); break;
      case 'cbrt': result = Math.cbrt(val); break;
      case 'square': result = val * val; break;
      case 'cube': result = val * val * val; break;
      case 'exp': result = Math.exp(val); break;
      case 'factorial':
        if (val < 0 || !Number.isInteger(val) || val > 170) { showToast('n! necesita entero ≥0 ≤170'); return; }
        result = factorial(val); break;
      case 'inv': result = val === 0 ? NaN : 1 / val; break;
      case 'abs': result = Math.abs(val); break;
      case 'floor': result = Math.floor(val); break;
      case 'ceil': result = Math.ceil(val); break;
      case 'round': result = Math.round(val); break;
      default: return;
    }
    if (!isFinite(result) || isNaN(result)) { showToast('Error matemático'); return; }
    addHistory(`${name}(${val})`, result);
    currentInput = String(result); fullExpression = currentInput;
    justEvaluated = true; resultEl.classList.remove('error');
    updateDisplay();
  }

  function factorial(n) {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function evaluate() {
    if (!fullExpression) return;
    try {
      let expr = fullExpression;
      const last = expr.slice(-1);
      if (/[+\-×÷^(]/.test(last)) expr = expr.slice(0, -1);
      const result = parseExpr(expr);
      if (!isFinite(result) || isNaN(result)) { resultEl.textContent = 'Error'; resultEl.classList.add('error'); return; }
      const resStr = formatResult(result);
      addHistory(fullExpression, resStr);
      currentInput = String(result); fullExpression = currentInput;
      justEvaluated = true; resultEl.classList.remove('error');
      updateDisplay();
    } catch { resultEl.textContent = 'Error'; resultEl.classList.add('error'); }
  }

  // ---- Calculator event listeners ----
  let calcListenersAttached = false;
  function initCalcListeners() {
    const grid = document.getElementById('buttonGrid');
    if (calcListenersAttached) return;
    calcListenersAttached = true;

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === undefined) return;

      if (/^[0-9]$/.test(action)) { appendToInput(action); return; }
      if (action === 'dot') { appendToInput('.'); return; }

      switch (action) {
        case 'clear': clearAll(); break;
        case 'back': backspace(); break;
        case 'toggleSign': toggleSign(); break;
        case 'add': appendOperator('+'); break;
        case 'subtract': appendOperator('−'); break;
        case 'multiply': appendOperator('×'); break;
        case 'divide': appendOperator('÷'); break;
        case 'power': appendOperator('^'); break;
        case 'mod': appendOperator('%'); break;
        case 'percent': {
          if (currentInput) { const v = parseFloat(currentInput) / 100; addHistory(`${currentInput}%`, v); currentInput = String(v); fullExpression = currentInput; justEvaluated = true; updateDisplay(); }
          break;
        }
        case 'lparen':
          if (justEvaluated) { clearAll(); }
          currentInput = ''; fullExpression += '('; updateDisplay(); break;
        case 'rparen': fullExpression += ')'; updateDisplay(); break;
        case 'pi':
          if (justEvaluated) { clearAll(); }
          currentInput = String(Math.PI); fullExpression += String(Math.PI); justEvaluated = true; updateDisplay(); break;
        case 'e':
          if (justEvaluated) { clearAll(); }
          currentInput = String(Math.E); fullExpression += String(Math.E); justEvaluated = true; updateDisplay(); break;
        case 'rand': { const r = Math.random(); currentInput = String(r); fullExpression = currentInput; justEvaluated = true; addHistory('rand()', r); updateDisplay(); break; }
        case 'sin': applyUnary('sin','sin'); break;
        case 'cos': applyUnary('cos','cos'); break;
        case 'tan': applyUnary('tan','tan'); break;
        case 'asin': applyUnary('asin','asin'); break;
        case 'acos': applyUnary('acos','acos'); break;
        case 'atan': applyUnary('atan','atan'); break;
        case 'sinh': applyUnary('sinh','sinh'); break;
        case 'cosh': applyUnary('cosh','cosh'); break;
        case 'tanh': applyUnary('tanh','tanh'); break;
        case 'ln': applyUnary('ln','ln'); break;
        case 'log': case 'log10': applyUnary('log','log'); break;
        case 'log2': applyUnary('log2','log₂'); break;
        case 'sqrt': applyUnary('sqrt','√'); break;
        case 'cbrt': applyUnary('cbrt','∛'); break;
        case 'square': applyUnary('square','sq'); break;
        case 'cube': applyUnary('cube','cube'); break;
        case 'exp': applyUnary('exp','eˣ'); break;
        case 'factorial': applyUnary('factorial','n!'); break;
        case 'inv': applyUnary('inv','1/'); break;
        case 'abs': applyUnary('abs','|x|'); break;
        case 'floor': applyUnary('floor','floor'); break;
        case 'ceil': applyUnary('ceil','ceil'); break;
        case 'round': applyUnary('round','round'); break;
        case 'nroot': {
          const val = parseFloat(currentInput);
          if (isNaN(val)) { showToast('Introduce un número'); return; }
          if (val <= 0) { showToast('El índice debe ser >0'); return; }
          const idx = prompt('Índice de la raíz (y en ʸ√x):', '2');
          if (idx === null) return;
          const n = parseFloat(idx);
          if (isNaN(n) || n <= 0) { showToast('Índice inválido'); return; }
          const r = Math.pow(val, 1 / n);
          addHistory(`(${n})√${val}`, r);
          currentInput = String(r); fullExpression = currentInput; justEvaluated = true; updateDisplay();
          break;
        }
        case 'equals': evaluate(); break;
        case 'history':
          historyOpen = !historyOpen;
          historyPanel.classList.toggle('open', historyOpen);
          break;
        case 'degRad':
          degMode = !degMode;
          document.querySelectorAll('[data-action="degRad"]').forEach(el => el.textContent = degMode ? 'DEG' : 'RAD');
          showToast(degMode ? 'Modo Grados' : 'Modo Radianes');
          break;
      }
    });
  }

  // ---- Keyboard ----
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('panelCalc').classList.contains('active')) return;
    if (e.key >= '0' && e.key <= '9') { appendToInput(e.key); return; }
    if (e.key === '.') { appendToInput('.'); return; }
    if (e.key === '+') { appendOperator('+'); return; }
    if (e.key === '-') { appendOperator('−'); return; }
    if (e.key === '*') { appendOperator('×'); return; }
    if (e.key === '/') { appendOperator('÷'); return; }
    if (e.key === '^') { appendOperator('^'); return; }
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); evaluate(); return; }
    if (e.key === 'Backspace') { backspace(); return; }
    if (e.key === 'Escape') { clearAll(); return; }
    if (e.key === '(') { if (justEvaluated) clearAll(); currentInput=''; fullExpression+='('; updateDisplay(); return; }
    if (e.key === ')') { fullExpression+=')'; updateDisplay(); return; }
  });

  // ====================== GRAPHING ======================
  let graphCanvas, graphCtx, graphAnim;
  let graphingInited = false;

  function initGraphing() {
    if (graphingInited) return;
    graphingInited = true;
    graphCanvas = document.getElementById('graphCanvas');
    graphCtx = graphCanvas.getContext('2d');
    resizeGraphCanvas();
    window.addEventListener('resize', resizeGraphCanvas);

    document.getElementById('btnPlot').addEventListener('click', plotGraph);
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('graphFunc').value = btn.dataset.fn;
        plotGraph();
      });
    });
    document.getElementById('graphFunc').addEventListener('keydown', (e) => { if (e.key === 'Enter') plotGraph(); });
    plotGraph();
  }

  function resizeGraphCanvas() {
    if (!graphCanvas) return;
    const rect = graphCanvas.getBoundingClientRect();
    graphCanvas.width = rect.width * 2;
    graphCanvas.height = rect.height * 2;
    graphCtx.scale(2, 2);
    plotGraph();
  }

  function parseFunction(fnStr) {
    const fn = fnStr
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/asin/g, 'Math.asin')
      .replace(/acos/g, 'Math.acos')
      .replace(/atan/g, 'Math.atan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log10/g, 'Math.log10')
      .replace(/log/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/pow/g, 'Math.pow')
      .replace(/pi/gi, `(${Math.PI})`)
      .replace(/e\b(?!\w)/g, `(${Math.E})`)
      .replace(/\^/g, '**');
    try {
      const f = new Function('x', '"use strict"; return (' + fn + ')');
      return f;
    } catch { return null; }
  }

  function plotGraph() {
    if (!graphCtx) return;
    const canvas = graphCanvas;
    const W = canvas.width / 2;
    const H = canvas.height / 2;
    const xmin = parseFloat(document.getElementById('graphXmin').value) || -10;
    const xmax = parseFloat(document.getElementById('graphXmax').value) || 10;
    const ymin = parseFloat(document.getElementById('graphYmin').value) || -10;
    const ymax = parseFloat(document.getElementById('graphYmax').value) || 10;

    const fnStr = document.getElementById('graphFunc').value.trim();
    const f = parseFunction(fnStr);
    if (!f) { showToast('Función inválida'); return; }

    graphCtx.clearRect(0, 0, W, H);

    // Grid
    graphCtx.strokeStyle = 'rgba(255,255,255,0.06)';
    graphCtx.lineWidth = 0.5;
    for (let x = Math.ceil(xmin); x <= xmax; x++) {
      const px = (x - xmin) / (xmax - xmin) * W;
      graphCtx.beginPath(); graphCtx.moveTo(px, 0); graphCtx.lineTo(px, H); graphCtx.stroke();
    }
    for (let y = Math.ceil(ymin); y <= ymax; y++) {
      const py = H - (y - ymin) / (ymax - ymin) * H;
      graphCtx.beginPath(); graphCtx.moveTo(0, py); graphCtx.lineTo(W, py); graphCtx.stroke();
    }

    // Axes
    graphCtx.strokeStyle = 'rgba(102,126,234,0.5)';
    graphCtx.lineWidth = 1.5;
    if (xmin <= 0 && xmax >= 0) {
      const px = (0 - xmin) / (xmax - xmin) * W;
      graphCtx.beginPath(); graphCtx.moveTo(px, 0); graphCtx.lineTo(px, H); graphCtx.stroke();
    }
    if (ymin <= 0 && ymax >= 0) {
      const py = H - (0 - ymin) / (ymax - ymin) * H;
      graphCtx.beginPath(); graphCtx.moveTo(0, py); graphCtx.lineTo(W, py); graphCtx.stroke();
    }

    // Plot function
    graphCtx.strokeStyle = '#43e97b';
    graphCtx.lineWidth = 2.5;
    graphCtx.shadowColor = 'rgba(67,233,123,0.3)';
    graphCtx.shadowBlur = 6;
    graphCtx.beginPath();
    let started = false;
    const steps = W * 2;
    for (let i = 0; i <= steps; i++) {
      const x = xmin + (i / steps) * (xmax - xmin);
      try {
        const y = f(x);
        if (!isFinite(y)) { started = false; continue; }
        const px = (x - xmin) / (xmax - xmin) * W;
        const py = H - (y - ymin) / (ymax - ymin) * H;
        if (py < -500 || py > H + 500) { started = false; continue; }
        if (!started) { graphCtx.moveTo(px, py); started = true; }
        else graphCtx.lineTo(px, py);
      } catch { started = false; }
    }
    graphCtx.stroke();
    graphCtx.shadowBlur = 0;

    // Labels
    graphCtx.fillStyle = 'rgba(255,255,255,0.3)';
    graphCtx.font = '11px monospace';
    graphCtx.fillText(`f(x) = ${fnStr}`, 10, 20);
  }

  // ====================== MATRIX ======================
  let matrixInited = false;
  function initMatrix() {
    if (matrixInited) return;
    matrixInited = true;
    buildMatrixInputs(2);
    document.getElementById('matrixSize').addEventListener('change', (e) => buildMatrixInputs(parseInt(e.target.value)));
    document.getElementById('btnMatrixCalc').addEventListener('click', calcMatrix);
  }

  function buildMatrixInputs(size) {
    ['matrixA','matrixB'].forEach(id => {
      const cont = document.getElementById(id);
      cont.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      cont.innerHTML = '';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const inp = document.createElement('input');
          inp.type = 'number';
          inp.value = r === c ? '1' : '0';
          inp.step = 'any';
          inp.dataset.row = r; inp.dataset.col = c;
          cont.appendChild(inp);
        }
      }
    });
  }

  function readMatrix(id) {
    const inputs = document.querySelectorAll(`#${id} input`);
    const size = Math.sqrt(inputs.length);
    const m = [];
    for (let r = 0; r < size; r++) {
      m[r] = [];
      for (let c = 0; c < size; c++) {
        m[r][c] = parseFloat(inputs[r * size + c].value) || 0;
      }
    }
    return m;
  }

  function matrixToString(m) {
    return m.map(row => row.map(v => v.toFixed(2)).join('  ')).join('\n');
  }

  function matAdd(a, b) {
    return a.map((row, r) => row.map((v, c) => v + b[r][c]));
  }
  function matSub(a, b) {
    return a.map((row, r) => row.map((v, c) => v - b[r][c]));
  }
  function matMul(a, b) {
    const n = a.length;
    const r = Array.from({length: n}, () => Array(n).fill(0));
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++)
          r[i][j] += a[i][k] * b[k][j];
    return r;
  }
  function matDet(m) {
    const n = m.length;
    if (n === 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];
    if (n === 3) {
      return m[0][0]*(m[1][1]*m[2][2] - m[1][2]*m[2][1])
           - m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0])
           + m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]);
    }
    return NaN;
  }
  function matTranspose(m) {
    return m[0].map((_, c) => m.map(row => row[c]));
  }
  function matInverse(m) {
    const n = m.length;
    const det = matDet(m);
    if (Math.abs(det) < 1e-12) return null;
    if (n === 2) {
      return [[m[1][1]/det, -m[0][1]/det], [-m[1][0]/det, m[0][0]/det]];
    }
    if (n === 3) {
      const [a,b,c,d,e,f,g,h,i] = m.flat();
      const inv = [
        [(e*i - f*h)/det, (c*h - b*i)/det, (b*f - c*e)/det],
        [(f*g - d*i)/det, (a*i - c*g)/det, (c*d - a*f)/det],
        [(d*h - e*g)/det, (b*g - a*h)/det, (a*e - b*d)/det],
      ];
      return inv;
    }
    return null;
  }

  function calcMatrix() {
    const op = document.getElementById('matrixOp').value;
    const A = readMatrix('matrixA');
    const B = readMatrix('matrixB');
    let result;
    switch (op) {
      case 'add': result = matAdd(A, B); break;
      case 'sub': result = matSub(A, B); break;
      case 'mul': result = matMul(A, B); break;
      case 'detA': result = `det(A) = ${matDet(A)}`; break;
      case 'detB': result = `det(B) = ${matDet(B)}`; break;
      case 'invA': result = matInverse(A); if (!result) result = 'No invertible'; break;
      case 'invB': result = matInverse(B); if (!result) result = 'No invertible'; break;
      case 'transA': result = matTranspose(A); break;
      case 'transB': result = matTranspose(B); break;
    }
    document.getElementById('matrixResult').textContent = typeof result === 'string' ? result : matrixToString(result);
  }

  // ====================== STATISTICS ======================
  let statsInited = false;
  function initStats() {
    if (statsInited) return;
    statsInited = true;
    document.getElementById('btnStatsCalc').addEventListener('click', calcStats);
  }

  function calcStats() {
    const raw = document.getElementById('statsData').value;
    const nums = raw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (nums.length === 0) { showToast('Introduce datos válidos'); return; }
    const sorted = [...nums].sort((a,b) => a-b);
    const n = nums.length;
    const sum = nums.reduce((a,b) => a+b, 0);
    const mean = sum / n;
    const median = n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
    const freq = {};
    nums.forEach(v => freq[v] = (freq[v]||0)+1);
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
    const variance = nums.reduce((s, v) => s + (v - mean)**2, 0) / n;
    const std = Math.sqrt(variance);
    const min = sorted[0];
    const max = sorted[n-1];
    const range = max - min;
    const q1 = quartile(sorted, 0.25);
    const q3 = quartile(sorted, 0.75);

    document.getElementById('statN').textContent = n;
    document.getElementById('statSum').textContent = sum.toFixed(4);
    document.getElementById('statMean').textContent = mean.toFixed(4);
    document.getElementById('statMedian').textContent = median.toFixed(4);
    document.getElementById('statMode').textContent = modes.join(', ');
    document.getElementById('statVar').textContent = variance.toFixed(4);
    document.getElementById('statStd').textContent = std.toFixed(4);
    document.getElementById('statMin').textContent = min.toFixed(4);
    document.getElementById('statMax').textContent = max.toFixed(4);
    document.getElementById('statRange').textContent = range.toFixed(4);
    document.getElementById('statQ1').textContent = q1.toFixed(4);
    document.getElementById('statQ3').textContent = q3.toFixed(4);
  }

  function quartile(sorted, q) {
    const pos = q * (sorted.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  // ====================== CONVERTER ======================
  let converterInited = false;
  const convUnits = {
    length: { m:1, km:0.001, mi:0.000621371, ft:3.28084, in:39.3701, cm:100, mm:1000, yd:1.09361 },
    mass: { kg:1, g:1000, mg:1e6, lb:2.20462, oz:35.274, t:0.001 },
    temp: { C:'celsius', F:'fahrenheit', K:'kelvin' },
    speed: { 'm/s':1, 'km/h':3.6, 'mph':2.23694, 'kn':1.94384, 'ft/s':3.28084 },
    area: { 'm²':1, 'km²':0.000001, 'ha':0.0001, acre:0.000247105, 'ft²':10.7639, 'in²':1550 },
    volume: { L:1, mL:1000, 'm³':0.001, gal:0.264172, qt:1.05669, cup:4.22675, floz:33.814 },
    time: { s:1, min:0.0166667, h:0.000277778, d:0.000011574, wk:0.000001653, mo:0.000000380, yr:0.0000000317 },
    data: { B:1, KB:0.001, MB:0.000001, GB:1e-9, TB:1e-12, b:8, Kb:0.008, Mb:0.000008, Gb:8e-9 },
    currency: { USD:1, EUR:0.92 },
  };

  const convLabels = {
    length: ['m','km','mi','ft','in','cm','mm','yd'],
    mass: ['kg','g','mg','lb','oz','t'],
    temp: ['°C','°F','K'],
    speed: ['m/s','km/h','mph','kn','ft/s'],
    area: ['m²','km²','ha','acre','ft²','in²'],
    volume: ['L','mL','m³','gal','qt','cup','floz'],
    time: ['s','min','h','d','wk','mo','yr'],
    data: ['B','KB','MB','GB','TB','b','Kb','Mb','Gb'],
    currency: ['USD','EUR'],
  };

  function getConvKey(cat, label) {
    const map = {
      '°C':'C','°F':'F','K':'K',
      'm²':'m²','km²':'km²','ft²':'ft²','in²':'in²','ha':'ha',
    };
    return map[label] || label;
  }

  function initConverter() {
    if (converterInited) return;
    converterInited = true;
    const cat = document.getElementById('convCategory');
    const from = document.getElementById('convFrom');
    const to = document.getElementById('convTo');
    const val = document.getElementById('convValue');
    const res = document.getElementById('convResult');

    function populateUnits() {
      const c = cat.value;
      const labels = convLabels[c];
      from.innerHTML = ''; to.innerHTML = '';
      labels.forEach(l => {
        from.innerHTML += `<option value="${getConvKey(c, l)}">${l}</option>`;
        to.innerHTML += `<option value="${getConvKey(c, l)}">${l}</option>`;
      });
      to.value = labels.length > 1 ? labels[1] : labels[0];
      doConvert();
    }

    function doConvert() {
      const c = cat.value;
      const f = from.value;
      const t = to.value;
      const v = parseFloat(val.value) || 0;

      if (c === 'temp') {
        const tempConv = {
          'C_to_C': v, 'C_to_F': v * 9/5 + 32, 'C_to_K': v + 273.15,
          'F_to_C': (v - 32) * 5/9, 'F_to_F': v, 'F_to_K': (v - 32) * 5/9 + 273.15,
          'K_to_C': v - 273.15, 'K_to_F': (v - 273.15) * 9/5 + 32, 'K_to_K': v,
        };
        res.value = (tempConv[`${f}_to_${t}`] ?? v).toFixed(4);
        return;
      }

      const units = convUnits[c];
      if (!units) return;
      const inBase = v / units[f];
      res.value = (inBase * units[t]).toFixed(6);
    }

    cat.addEventListener('change', populateUnits);
    from.addEventListener('change', doConvert);
    to.addEventListener('change', doConvert);
    val.addEventListener('input', doConvert);
    populateUnits();
  }

  // ====================== PROGRAMMER ======================
  let programmerInited = false;
  function initProgrammer() {
    if (programmerInited) return;
    programmerInited = true;

    const baseSelect = document.getElementById('progBase');
    const input = document.getElementById('progInput');
    const binEl = document.getElementById('progBin');
    const octEl = document.getElementById('progOct');
    const decEl = document.getElementById('progDec');
    const hexEl = document.getElementById('progHex');

    function updateConversions() {
      const base = parseInt(baseSelect.value);
      const raw = input.value.trim();
      let dec;
      try {
        const cleaned = raw.replace(/\s/g, '');
        if (base === 16 && cleaned.startsWith('0x')) dec = parseInt(cleaned, 16);
        else dec = parseInt(cleaned, base);
      } catch { dec = NaN; }
      if (!isFinite(dec)) { binEl.textContent='—'; octEl.textContent='—'; decEl.textContent='—'; hexEl.textContent='—'; return; }
      binEl.textContent = dec.toString(2);
      octEl.textContent = dec.toString(8);
      decEl.textContent = dec.toString(10);
      hexEl.textContent = '0x' + dec.toString(16).toUpperCase();
    }

    baseSelect.addEventListener('change', updateConversions);
    input.addEventListener('input', updateConversions);

    // Bitwise
    document.querySelectorAll('.btn-bit').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = parseInt(document.getElementById('progBitA').value) || 0;
        const b = parseInt(document.getElementById('progBitB').value) || 0;
        const op = btn.dataset.op;
        let result;
        switch (op) {
          case 'AND': result = a & b; break;
          case 'OR': result = a | b; break;
          case 'XOR': result = a ^ b; break;
          case 'NOT': result = ~a; break;
          case 'LSH': result = a << b; break;
          case 'RSH': result = a >> b; break;
        }
        document.getElementById('progBitResult').textContent = `${op}: ${result} (0x${(result >>> 0).toString(16).toUpperCase()}, ${(result >>> 0).toString(2)})`;
      });
    });

    updateConversions();
  }

  // ====================== INIT ======================
  switchMode('basic');
})();
