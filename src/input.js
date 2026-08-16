import { FEEL } from './config.js';
import { deadzone } from './math.js';

export function createInput(canvas) {
  const keys = Object.create(null);
  const look = { dx: 0, dy: 0 };
  const touch = { x: 0, y: 0 };
  const pad = { x: 0, y: 0 };
  const state = {
    jump: false,
    jumpDown: false,
    cast: false,
    castDown: false,
    interact: false,
    interactDown: false,
    ritual: false,
    map: false,
    journal: false,
    sprint: false,
    pause: false,
    locked: false,
    touch: false,
  };

  const mouse = { left: false };
  const pads = { jump: false, cast: false, interact: false, ritual: false };

  function onKey(e, on) {
    if (e.repeat && on) return;
    keys[e.code] = on;
    if (on) {
      if (e.code === 'KeyE' || e.code === 'KeyF') state.interactDown = true;
      if (e.code === 'Space') state.jumpDown = true;
      if (e.code === 'KeyR') state.ritual = true;
      if (e.code === 'KeyM') state.map = true;
      if (e.code === 'KeyJ' || e.code === 'Tab') {
        state.journal = true;
        e.preventDefault();
      }
      if (e.code === 'Escape') state.pause = true;
    }
    if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();
  }

  addEventListener('keydown', (e) => onKey(e, true));
  addEventListener('keyup', (e) => onKey(e, false));

  function tryLock() {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
  }

  canvas.addEventListener('click', tryLock);
  document.addEventListener('pointerlockchange', () => {
    state.locked = document.pointerLockElement === canvas;
  });
  addEventListener('mousemove', (e) => {
    if (!state.locked) return;
    look.dx += e.movementX;
    look.dy += e.movementY;
  });
  addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      state.castDown = true;
      mouse.left = true;
    }
  });
  addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.left = false;
  });

  function readPad() {
    pad.x = 0;
    pad.y = 0;
    const gp = navigator.getGamepads?.()[0];
    if (!gp) return;
    pad.x = deadzone(gp.axes[0] || 0, FEEL.padDead);
    pad.y = deadzone(gp.axes[1] || 0, FEEL.padDead);
    const lx = deadzone(gp.axes[2] || 0, FEEL.padDead);
    const ly = deadzone(gp.axes[3] || 0, FEEL.padDead);
    look.dx += lx * FEEL.padLook;
    look.dy += ly * FEEL.padLook;
    if (gp.buttons[0]?.pressed && !pads.jump) state.jumpDown = true;
    if (gp.buttons[2]?.pressed && !pads.cast) state.castDown = true;
    if (gp.buttons[1]?.pressed && !pads.interact) state.interactDown = true;
    if (gp.buttons[3]?.pressed && !pads.ritual) state.ritual = true;
    pads.jump = !!gp.buttons[0]?.pressed;
    pads.cast = !!gp.buttons[2]?.pressed;
    pads.interact = !!gp.buttons[1]?.pressed;
    pads.ritual = !!gp.buttons[3]?.pressed;
    if (gp.buttons[6]?.pressed || gp.buttons[7]?.pressed || gp.buttons[10]?.pressed) {
      state.sprint = true;
    }
    if (Math.hypot(pad.x, pad.y) > 0.08 || Math.hypot(lx, ly) > 0.08) tryLock();
  }

  function bindTouch() {
    const zone = document.getElementById('stick');
    const knob = document.getElementById('knob');
    if (!zone || !knob) return;
    let sid = null;
    const start = (e) => {
      const t = e.changedTouches[0];
      sid = t.identifier;
      move(t);
      e.preventDefault();
    };
    const move = (t) => {
      const r = zone.getBoundingClientRect();
      let x = (t.clientX - (r.left + r.width / 2)) / (r.width * 0.42);
      let y = (t.clientY - (r.top + r.height / 2)) / (r.height * 0.42);
      const m = Math.hypot(x, y);
      if (m > 1) {
        x /= m;
        y /= m;
      }
      touch.x = x;
      touch.y = y;
      knob.style.transform = `translate(${x * 28}px, ${y * 28}px)`;
    };
    const end = () => {
      sid = null;
      touch.x = 0;
      touch.y = 0;
      knob.style.transform = '';
    };
    zone.addEventListener('touchstart', start, { passive: false });
    addEventListener(
      'touchmove',
      (e) => {
        for (const t of e.changedTouches) if (t.identifier === sid) move(t);
      },
      { passive: false }
    );
    addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) if (t.identifier === sid) end();
    });
    document.getElementById('btnJump')?.addEventListener('touchstart', (e) => {
      state.jumpDown = true;
      e.preventDefault();
    });
    document.getElementById('btnCast')?.addEventListener('touchstart', (e) => {
      state.castDown = true;
      e.preventDefault();
    });
    document.getElementById('btnUse')?.addEventListener('touchstart', (e) => {
      state.interactDown = true;
      e.preventDefault();
    });
  }

  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
  if (coarse) {
    state.touch = true;
    document.body.classList.add('touch');
    bindTouch();
  }

  function wish() {
    let x = pad.x + touch.x;
    let y = pad.y + touch.y;
    if (keys.KeyA || keys.ArrowLeft) x -= 1;
    if (keys.KeyD || keys.ArrowRight) x += 1;
    if (keys.KeyW || keys.ArrowUp) y -= 1;
    if (keys.KeyS || keys.ArrowDown) y += 1;
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    } else if (m < 0.06) {
      x = 0;
      y = 0;
    }
    return { x, y };
  }

  function consumeLook() {
    const o = { x: look.dx, y: look.dy };
    look.dx = 0;
    look.dy = 0;
    return o;
  }

  function beginFrame() {
    state.sprint = !!(keys.ShiftLeft || keys.ShiftRight);
    readPad();
    state.jump = !!(keys.Space || pads.jump);
    state.cast = !!(mouse.left || keys.KeyQ || pads.cast);
    state.interact = !!(keys.KeyE || keys.KeyF || pads.interact);
  }

  function endFrame() {
    state.jumpDown = false;
    state.castDown = false;
    state.interactDown = false;
    state.ritual = false;
    state.map = false;
    state.journal = false;
    state.pause = false;
  }

  function unlock() {
    document.exitPointerLock?.();
  }

  return { keys, state, wish, consumeLook, beginFrame, endFrame, unlock, tryLock };
}
