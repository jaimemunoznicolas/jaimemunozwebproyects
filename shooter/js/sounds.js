let ctx = null;

export function initAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
}

function playTone(type, freq, dur, vol, ramp) {
  try {
    initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;
    osc.type = type;
    if (typeof freq === 'function') {
      freq(osc, t);
    } else {
      osc.frequency.setValueAtTime(freq, t);
      if (ramp) osc.frequency.exponentialRampToValueAtTime(ramp, t + dur);
    }
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
  } catch (e) { /* ignore */ }
}

function noise(dur, vol) {
  try {
    initAudio();
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch (e) { /* ignore */ }
}

export function playSound(type) {
  switch (type) {
    case 'rifle':
      playTone('sawtooth', 800, 0.06, 0.10, 200);
      noise(0.06, 0.08);
      break;
    case 'shotgun':
      noise(0.15, 0.20);
      playTone('sawtooth', 150, 0.15, 0.12, 50);
      break;
    case 'smg':
      playTone('sawtooth', 900, 0.04, 0.06, 300);
      noise(0.04, 0.05);
      break;
    case 'sniper':
      playTone('sawtooth', 600, 0.2, 0.18, 80);
      noise(0.1, 0.15);
      break;
    case 'pistol':
      playTone('square', 500, 0.08, 0.10, 150);
      noise(0.05, 0.06);
      break;
    case 'hit':
      playTone('square', 400, 0.05, 0.07, 100);
      break;
    case 'kill':
      playTone('sine', 600, 0.12, 0.10, 1200);
      playTone('sine', 900, 0.08, 0.08, 1400);
      break;
    case 'hurt':
      playTone('sawtooth', 200, 0.15, 0.12, 50);
      break;
    case 'pickup':
      playTone('sine', 500, 0.08, 0.06, 1000);
      playTone('sine', 800, 0.06, 0.05, 1200);
      break;
    case 'wall':
      playTone('square', 100, 0.03, 0.03, 50);
      break;
    case 'reload':
      playTone('sine', 300, 0.1, 0.04, 500);
      setTimeout(() => playTone('sine', 500, 0.08, 0.04, 700), 200);
      break;
    case 'headshot':
      playTone('sine', 1000, 0.1, 0.12, 1500);
      playTone('square', 600, 0.08, 0.08, 800);
      break;
    case 'victory':
      playTone('sine', 523, 0.2, 0.1, 600);
      setTimeout(() => playTone('sine', 659, 0.2, 0.1, 750), 200);
      setTimeout(() => playTone('sine', 784, 0.3, 0.1, 900), 400);
      break;
  }
}
