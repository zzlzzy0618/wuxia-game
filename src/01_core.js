'use strict';
/* ============ 江湖录 v2 · 核心工具 & 音效 ============ */
const $ = s => document.querySelector(s);
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const rf = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
const pick = arr => arr[rnd(0, arr.length - 1)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtPct = v => Math.round(v * 100) + '%';

const Sfx = {
  ctx: null, muted: false,
  ensure() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } },
  tone(f, dur, type = 'square', vol = .12, delay = 0, slide = 0) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t0); o.stop(t0 + dur + .05);
  },
  click() { this.tone(660, .05, 'triangle', .08); },
  hit() { this.tone(150, .1, 'square', .16, 0, -60); this.tone(90, .16, 'sawtooth', .1, .02, -40); },
  crit() { this.tone(220, .12, 'square', .2, 0, -120); this.tone(880, .08, 'triangle', .14, .04); },
  miss() { this.tone(500, .12, 'sine', .07, 0, -300); },
  heal() { this.tone(523, .12, 'sine', .1); this.tone(659, .14, 'sine', .1, .08); this.tone(784, .18, 'sine', .1, .16); },
  levelup() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .16, 'triangle', .12, i * .09)); },
  victory() { [392, 523, 659, 784].forEach((f, i) => this.tone(f, .2, 'triangle', .13, i * .11)); },
  defeat() { [330, 262, 196, 147].forEach((f, i) => this.tone(f, .28, 'sine', .13, i * .16)); },
  coin() { this.tone(988, .07, 'square', .08); this.tone(1319, .1, 'square', .08, .06); },
  forge() { this.tone(180, .1, 'sawtooth', .18); this.tone(1200, .06, 'square', .1, .1); this.tone(180, .12, 'sawtooth', .16, .18); },
  fail() { this.tone(200, .2, 'sine', .12, 0, -80); }
};
