(function () {
  'use strict';

  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const modeBadge = document.getElementById('modeBadge');
  const historyList = document.getElementById('historyList');
  const historyPanel = document.getElementById('historyPanel');
  const toast = document.getElementById('toast');

  let currentInput = '';
  let fullExpression = '';
  let history = [];
  let degMode = true;
  let historyOpen = false;
  let justEvaluated = false;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function updateDisplay() {
    expressionEl.textContent = fullExpression;
    const display = currentInput || '0';
    resultEl.textContent = display;
    resultEl.classList.toggle('small', display.length > 12);
  }

  function appendToInput(val) {
    if (justEvaluated) {
      if (/\d|\./.test(val)) {
        currentInput = '';
        fullExpression = '';
      }
      justEvaluated = false;
    }
    if (val === '.' && currentInput.includes('.')) return;
    if (val === '.' && currentInput === '') currentInput = '0';
    currentInput += val;
    fullExpression += val;
    updateDisplay();
  }

  function appendOperator(op) {
    if (justEvaluated) {
      fullExpression = currentInput;
      justEvaluated = false;
    }
    const last = fullExpression.slice(-1);
    if (/[+\-×÷^]/.test(last)) {
      fullExpression = fullExpression.slice(0, -1);
    }
    currentInput = '';
    fullExpression += op;
    updateDisplay();
  }

  function clearAll() {
    currentInput = '';
    fullExpression = '';
    resultEl.classList.remove('error');
    updateDisplay();
  }

  function backspace() {
    if (justEvaluated) { clearAll(); return; }
    if (currentInput.length > 0) {
      currentInput = currentInput.slice(0, -1);
      fullExpression = fullExpression.slice(0, -1);
    } else {
      fullExpression = fullExpression.slice(0, -1);
    }
    resultEl.classList.remove('error');
    updateDisplay();
  }

  function toggleSign() {
    if (justEvaluated) {
      currentInput = String(-parseFloat(currentInput));
      fullExpression = currentInput;
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
      fullExpression = fullExpression.replace(/^\-/, '');
    } else {
      currentInput = '-' + currentInput;
      fullExpression = '-' + fullExpression;
    }
    updateDisplay();
  }

  function parseExpr(expr) {
    let p = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, `(${Math.PI})`)
      .replace(/\be\b/g, `(${Math.E})`);
    try {
      return Function('"use strict"; return (' + p + ')')();
    } catch {
      return NaN;
    }
  }

  function applyUnary(fn, name) {
    let val = parseFloat(currentInput);
    if (isNaN(val) && currentInput === '') val = 0;
    let result;
    const rad = degMode ? Math.PI / 180 : 1;
    switch (fn) {
      case 'sin': result = Math.sin(val * rad); break;
      case 'cos': result = Math.cos(val * rad); break;
      case 'tan':
        result = Math.tan(val * rad);
        if (Math.abs(result) > 1e15) { showToast('tan indefinida'); return; }
        break;
      case 'ln': result = val <= 0 ? NaN : Math.log(val); break;
      case 'log': result = val <= 0 ? NaN : Math.log10(val); break;
      case 'sqrt': result = val < 0 ? NaN : Math.sqrt(val); break;
      case 'cbrt': result = Math.cbrt(val); break;
      case 'square': result = val * val; break;
      case 'cube': result = val * val * val; break;
      case 'factorial':
        if (val < 0 || !Number.isInteger(val) || val > 170) { showToast('n! requiere entero ≥ 0 y ≤ 170'); return; }
        result = factorial(val);
        break;
      case 'inv': result = val === 0 ? NaN : 1 / val; break;
      case 'abs': result = Math.abs(val); break;
      case 'floor': result = Math.floor(val); break;
      case 'ceil': result = Math.ceil(val); break;
      case 'round': result = Math.round(val); break;
      default: return;
    }
    if (!isFinite(result) || isNaN(result)) {
      showToast('Error matemático');
      return;
    }
    addHistory(`${name}(${val})`, result);
    currentInput = String(result);
    fullExpression = currentInput;
    justEvaluated = true;
    resultEl.classList.remove('error');
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
      if (!isFinite(result) || isNaN(result)) {
        resultEl.textContent = 'Error';
        resultEl.classList.add('error');
        return;
      }
      const resStr = formatResult(result);
      addHistory(fullExpression, resStr);
      currentInput = String(result);
      fullExpression = currentInput;
      justEvaluated = true;
      resultEl.classList.remove('error');
      updateDisplay();
    } catch {
      resultEl.textContent = 'Error';
      resultEl.classList.add('error');
    }
  }

  function formatResult(n) {
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
    const s = n.toPrecision(12);
    return String(parseFloat(s));
  }

  function addHistory(expr, res) {
    history.unshift({ expr, res });
    if (history.length > 50) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach((h, i) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<span class="h-expr">${h.expr}</span> <span class="h-res">= ${h.res}</span>`;
      div.addEventListener('click', () => {
        currentInput = String(h.res);
        fullExpression = currentInput;
        justEvaluated = true;
        updateDisplay();
        historyPanel.classList.remove('open');
        historyOpen = false;
      });
      historyList.appendChild(div);
    });
  }

  function toggleHistory() {
    historyOpen = !historyOpen;
    historyPanel.classList.toggle('open', historyOpen);
  }

  function toggleDegRad() {
    degMode = !degMode;
    modeBadge.textContent = degMode ? 'DEG' : 'RAD';
    showToast(degMode ? 'Modo Grados' : 'Modo Radianes');
  }

  function getCurrentNumber() {
    return parseFloat(currentInput) || 0;
  }

  document.querySelector('.button-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (value !== undefined) {
      appendToInput(value);
      return;
    }

    switch (action) {
      case 'clear': clearAll(); break;
      case 'backspace': backspace(); break;
      case 'toggleSign': toggleSign(); break;
      case 'add': appendOperator('+'); break;
      case 'subtract': appendOperator('−'); break;
      case 'multiply': appendOperator('×'); break;
      case 'divide': appendOperator('÷'); break;
      case 'power': appendOperator('^'); break;
      case 'percent':
        if (currentInput) {
          const v = parseFloat(currentInput) / 100;
          addHistory(`${currentInput}%`, v);
          currentInput = String(v);
          fullExpression = currentInput;
          justEvaluated = true;
          updateDisplay();
        }
        break;
      case 'lparen':
        if (justEvaluated) { clearAll(); }
        currentInput = '';
        fullExpression += '(';
        updateDisplay();
        break;
      case 'rparen':
        fullExpression += ')';
        updateDisplay();
        break;
      case 'pi':
        if (justEvaluated) { clearAll(); }
        currentInput = String(Math.PI);
        fullExpression += Math.PI;
        justEvaluated = true;
        updateDisplay();
        break;
      case 'e':
        if (justEvaluated) { clearAll(); }
        currentInput = String(Math.E);
        fullExpression += Math.E;
        justEvaluated = true;
        updateDisplay();
        break;
      case 'rand': {
        const r = Math.random();
        currentInput = String(r);
        fullExpression = currentInput;
        justEvaluated = true;
        addHistory('rand()', r);
        updateDisplay();
        break;
      }
      case 'sin': applyUnary('sin', 'sin'); break;
      case 'cos': applyUnary('cos', 'cos'); break;
      case 'tan': applyUnary('tan', 'tan'); break;
      case 'ln': applyUnary('ln', 'ln'); break;
      case 'log': applyUnary('log', 'log'); break;
      case 'sqrt': applyUnary('sqrt', '√'); break;
      case 'cbrt': applyUnary('cbrt', '∛'); break;
      case 'square': applyUnary('square', 'sq'); break;
      case 'cube': applyUnary('cube', 'cube'); break;
      case 'factorial': applyUnary('factorial', 'n!'); break;
      case 'inv': applyUnary('inv', '1/'); break;
      case 'abs': applyUnary('abs', '|x|'); break;
      case 'floor': applyUnary('floor', 'floor'); break;
      case 'ceil': applyUnary('ceil', 'ceil'); break;
      case 'round': applyUnary('round', 'round'); break;
      case 'equals': evaluate(); break;
      case 'history': toggleHistory(); break;
      case 'degRad': toggleDegRad(); break;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') { appendToInput(e.key); return; }
    if (e.key === '.') { appendToInput('.'); return; }
    if (e.key === '+') { appendOperator('+'); return; }
    if (e.key === '-') { appendOperator('−'); return; }
    if (e.key === '*') { appendOperator('×'); return; }
    if (e.key === '/') { appendOperator('÷'); return; }
    if (e.key === '^') { appendOperator('^'); return; }
    if (e.key === 'Enter' || e.key === '=') { evaluate(); return; }
    if (e.key === 'Backspace') { backspace(); return; }
    if (e.key === 'Escape') { clearAll(); return; }
    if (e.key === '(') {
      if (justEvaluated) clearAll();
      currentInput = '';
      fullExpression += '(';
      updateDisplay();
      return;
    }
    if (e.key === ')') {
      fullExpression += ')';
      updateDisplay();
      return;
    }
    if (e.key === 'p') {
      if (justEvaluated) clearAll();
      currentInput = String(Math.PI);
      fullExpression += Math.PI;
      justEvaluated = true;
      updateDisplay();
      return;
    }
  });

  updateDisplay();
})();
