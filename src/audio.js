export function createAudio() {
  let ctx = null;
  let master = null;
  let drone = null;
  let started = false;
  let threatGain = null;
  let heartT = 0;
  let bellT = 18;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(ctx.destination);
  }

  function tone(freq, dur, type, gain, at = 0) {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + at + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
    o.connect(g);
    g.connect(master);
    o.start(ctx.currentTime + at);
    o.stop(ctx.currentTime + at + dur + 0.02);
  }

  function noiseBuf(len = 2) {
    const n = ctx.sampleRate * len;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function startAmbience() {
    if (!ctx || drone) return;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const o3 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.type = 'sine';
    o2.type = 'triangle';
    o3.type = 'sine';
    o1.frequency.value = 36.7;
    o2.frequency.value = 55.1;
    o3.frequency.value = 73.4;
    g.gain.value = 0.09;
    o1.connect(g);
    o2.connect(g);
    o3.connect(g);
    g.connect(master);

    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(3);
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 280;
    bp.Q.value = 0.7;
    const wind = ctx.createGain();
    wind.gain.value = 0.035;
    src.connect(bp);
    bp.connect(wind);
    wind.connect(master);
    src.start();

    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoG.gain.value = 0.025;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    lfo.start();

    threatGain = ctx.createGain();
    threatGain.gain.value = 0.0001;
    const h1 = ctx.createOscillator();
    h1.type = 'sine';
    h1.frequency.value = 48;
    h1.connect(threatGain);
    threatGain.connect(master);
    h1.start();

    o1.start();
    o2.start();
    o3.start();
    drone = { o1, o2, o3, g, src, wind, lfo };
  }

  return {
    resume() {
      ensure();
      ctx?.resume();
      if (!started) {
        started = true;
        startAmbience();
      }
    },
    tick(dt, threat) {
      if (!ctx || !threatGain) return;
      const want = 0.0001 + threat * 0.07;
      const now = ctx.currentTime;
      threatGain.gain.setTargetAtTime(want, now, 0.12);
      if (drone?.wind) {
        drone.wind.gain.setTargetAtTime(0.028 + threat * 0.03, now, 0.2);
      }
      if (threat > 0.45) {
        heartT -= dt;
        if (heartT <= 0) {
          heartT = 0.72 - threat * 0.18;
          tone(62, 0.09, 'sine', 0.045);
          tone(48, 0.12, 'triangle', 0.03, 0.08);
        }
      }
      bellT -= dt;
      if (bellT <= 0) {
        bellT = 16 + Math.random() * 18;
        tone(196, 1.4, 'sine', 0.028);
        tone(147, 1.8, 'triangle', 0.018, 0.12);
      }
    },
    step() {
      if (!ctx) return;
      tone(78 + Math.random() * 16, 0.08, 'square', 0.022);
    },
    cast() {
      tone(392, 0.2, 'sawtooth', 0.05);
      tone(588, 0.26, 'sine', 0.04, 0.03);
    },
    pickup() {
      tone(523, 0.15, 'sine', 0.06);
      tone(784, 0.22, 'sine', 0.04, 0.08);
    },
    hurt() {
      tone(92, 0.28, 'square', 0.07);
    },
    ritual() {
      tone(196, 0.45, 'sine', 0.055);
      tone(294, 0.55, 'triangle', 0.04, 0.1);
      tone(392, 0.8, 'sine', 0.035, 0.2);
    },
    talk() {
      tone(160 + Math.random() * 36, 0.08, 'triangle', 0.035);
    },
    win() {
      tone(392, 0.3, 'sine', 0.055);
      tone(523, 0.4, 'sine', 0.045, 0.15);
      tone(659, 0.7, 'sine', 0.04, 0.3);
    },
  };
}
