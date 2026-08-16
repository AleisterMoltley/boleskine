export function createAudio() {
  let ctx = null;
  let master = null;
  let drone = null;
  let started = false;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
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

  function startDrone() {
    if (!ctx || drone) return;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.type = 'sine';
    o2.type = 'triangle';
    o1.frequency.value = 55;
    o2.frequency.value = 82.5;
    g.gain.value = 0.11;
    o1.connect(g);
    o2.connect(g);
    g.connect(master);
    o1.start();
    o2.start();
    drone = { o1, o2, g };
  }

  return {
    resume() {
      ensure();
      ctx?.resume();
      if (!started) {
        started = true;
        startDrone();
      }
    },
    step() {
      if (!ctx) return;
      tone(90 + Math.random() * 20, 0.07, 'square', 0.03);
    },
    cast() {
      tone(440, 0.18, 'sawtooth', 0.06);
      tone(660, 0.22, 'sine', 0.05, 0.02);
    },
    pickup() {
      tone(523, 0.15, 'sine', 0.07);
      tone(784, 0.22, 'sine', 0.05, 0.08);
    },
    hurt() {
      tone(110, 0.25, 'square', 0.07);
    },
    ritual() {
      tone(220, 0.4, 'sine', 0.06);
      tone(330, 0.5, 'triangle', 0.05, 0.1);
      tone(440, 0.7, 'sine', 0.04, 0.2);
    },
    talk() {
      tone(180 + Math.random() * 40, 0.08, 'triangle', 0.04);
    },
    win() {
      tone(392, 0.3, 'sine', 0.06);
      tone(523, 0.4, 'sine', 0.05, 0.15);
      tone(659, 0.7, 'sine', 0.05, 0.3);
    },
  };
}
