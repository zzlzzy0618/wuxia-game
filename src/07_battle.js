/* ============ 战斗引擎（玩家 + 伙伴 vs 敌人） ============ */

const passiveId = () => SECTS[P.sect].passive.id;

function mkCompInstance(id) {
  const c = COMPANIONS[id];
  const M = { atk: [1.15, .95], tank: [.65, 1.85], heal: [.55, 1.05], sup: [.62, 1.05] }[c.role];
  const hpMax = Math.round((40 + P.lv * 17) * M[1]);
  return {
    id, role: c.role, skill: c.skill,
    name: c.name.split(' · ')[1] || c.name,
    hpMax, hp: hpMax,
    atk: Math.round((5 + P.lv * 2.5) * M[0])
  };
}

function startBattle(enemyTpl, opts = {}) {
  const e = JSON.parse(JSON.stringify(enemyTpl));
  e.hp = e.hpMax;
  B = {
    e,
    bossId: opts.bossId || null,
    bountyKey: opts.bountyKey || null,
    tournament: !!opts.tournament,
    noFlee: !!opts.bossId || !!opts.tournament,
    comps: (P.compActive || []).map(mkCompInstance),
    defBuffTurns: 0, atkBuffTurns: 0, cover: false,
    enemyStun: false, dot: null,
    bf: { atk: 0, def: 0, spd: 0, nextCrit: false, dodge: false },
    firstCrit: passiveId() === 'firstcrit',
    busy: false, round: 0
  };
  if (passiveId() === 'opening') {
    if (Math.random() < .5) { B.atkBuffTurns = 3; } else { B.defBuffTurns = 3; }
  }
  $('#battle-log').innerHTML = '';
  $('#en-name').textContent = `${e.name} · ${e.lv}级`;
  $('#en-flavor').textContent = e.flavor || '';
  show('#screen-battle');
  blog(`狭路相逢！<b>${e.name}</b>${B.noFlee ? '挡在你面前，杀气冲天！' : '向你扑来！'}`, 'sys');
  renderBattle();
  renderBattleActions();
}

function renderBattle() {
  const e = B.e;
  $('#en-hp-t').textContent = `${e.name} ${e.hp} / ${e.hpMax}`;
  $('#en-hp-f').style.width = clamp(e.hp / e.hpMax * 100, 0, 100) + '%';
  $('#bt-hp-t').textContent = `气血 ${P.hp} / ${P.hpMax}`;
  $('#bt-mp-t').textContent = `内力 ${P.mp} / ${P.mpMax}`;
  $('#bt-hp-f').style.width = clamp(P.hp / P.hpMax * 100, 0, 100) + '%';
  $('#bt-mp-f').style.width = clamp(P.mp / P.mpMax * 100, 0, 100) + '%';
  const cs = B.comps.map(c => {
    if (c.hp <= 0) return `<span class="comp-chip" style="opacity:.4">${c.name}（退下）</span>`;
    const pct = Math.round(c.hp / c.hpMax * 100);
    const col = pct > 50 ? 'var(--jade)' : pct > 25 ? 'var(--gold-dim)' : 'var(--red)';
    return `<span class="comp-chip"><b>${c.name}</b><span style="color:${col}">${pct}%</span></span>`;
  }).join('');
  $('#bt-comps').innerHTML = cs ? cs : '<span class="muted" style="font-size:13px">孤身赴敌，无同伴随行</span>';
}

function floatDmg(target, text, cls = '') {
  const stage = $('#battle-stage');
  const span = document.createElement('span');
  span.className = 'float-dmg ' + cls;
  span.textContent = text;
  span.style.left = (target === 'enemy' ? 50 + rnd(-30, 30) : 50 + rnd(-20, 20)) + '%';
  span.style.top = (target === 'enemy' ? rnd(20, 60) : rnd(70, 110)) + 'px';
  stage.appendChild(span);
  setTimeout(() => span.remove(), 1000);
}
function shakePanel(sel) {
  const el = $(sel);
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
}

function renderBattleActions() {
  const box = $('#battle-actions');
  const skills = P.skills.filter(k => P.lv >= SKILLS[k].lv);
  const skBtns = skills.map(k => {
    const sk = SKILLS[k];
    const can = P.mp >= sk.mp && !(sk.hpCost && P.hp <= P.hpMax * .15);
    return `<button class="btn ${k === 'basic' ? 'btn-primary' : ''}" data-sk="${k}" ${can ? '' : 'disabled'}>${sk.name}<small>${sk.mp ? `内力 ${sk.mp}` : '无消耗'}${sk.hits > 1 ? ' · ' + sk.hits + '连击' : ''}</small></button>`;
  }).join('');
  const potBtns = Object.entries(P.bag).filter(([id]) => {
    const it = ITEMS[id];
    return it && it.cat === 'pot' && !POTIONS[it.pot].perm && !POTIONS[it.pot].full === false;
  }).map(([id, n]) => {
    const it = ITEMS[id], pot = POTIONS[it.pot];
    const battleUse = !pot.perm;
    return `<button class="btn btn-sm" data-pot="${id}" ${battleUse ? '' : 'disabled'}>${it.name} ×${n}</button>`;
  }).join('');
  const flee = B.noFlee ? '' : `<button class="btn" data-flee="1">逃 走</button>`;
  box.innerHTML = skBtns + potBtns + flee;
  box.querySelectorAll('[data-sk]').forEach(b => b.addEventListener('click', () => playerSkill(b.dataset.sk)));
  box.querySelectorAll('[data-pot]').forEach(b => b.addEventListener('click', () => playerPotion(b.dataset.pot)));
  const f = box.querySelector('[data-flee]');
  if (f) f.addEventListener('click', playerFlee);
}

// —— 玩家伤害计算 ——
function calcPlayerHit(sk) {
  const e = B.e;
  if (!sk.mustHit) {
    const dodge = clamp(4 + (e.spd - P.spd - (B.bf.spd ? P.lv : 0)) * .8, 2, 25);
    if (Math.random() * 100 < dodge) return { miss: true };
  }
  let atk = P.atk;
  if (passiveId() === 'rage' && P.hp < P.hpMax * .3) atk *= 1.25;
  if (B.atkBuffTurns > 0) atk *= 1.3;
  if (B.bf.atk > 0) atk *= 1.25;
  const hits = sk.hits || 1;
  let total = 0, critAny = false;
  for (let i = 0; i < hits; i++) {
    let crit = false;
    if (sk.mustCrit) crit = true;
    else if (B.firstCrit) { crit = true; B.firstCrit = false; }
    else if (B.bf.nextCrit) { crit = true; B.bf.nextCrit = false; }
    else crit = Math.random() * 100 < (P.crt + (sk.critBonus || 0));
    const defv = sk.ignoreDef ? 0 : e.def * .6;
    let d = (atk * sk.mult - defv) * rf(.85, 1.15);
    if (crit) { d *= 1.8; critAny = true; }
    total += Math.max(1, Math.round(d));
  }
  return { dmg: total, crit: critAny };
}

function playerSkill(key) {
  if (!B || B.busy) return;
  const sk = SKILLS[key];
  if (P.mp < sk.mp) return;
  B.busy = true;
  Sfx.ensure();
  P.mp -= sk.mp;
  if (sk.hpCost) {
    const cost = Math.max(1, Math.round(P.hpMax * sk.hpCost));
    P.hp = Math.max(1, P.hp - cost);
    blog(`你强催真气，燃烧自身气血 ${cost} 点！`, 'bad');
  }
  if (sk.heal) {
    const h = Math.round(P.hpMax * sk.heal), m = Math.round(P.mpMax * (sk.healMp || 0));
    P.hp = clamp(P.hp + h, 0, P.hpMax); P.mp = clamp(P.mp + m, 0, P.mpMax);
    Sfx.heal();
    blog(`你运转「${sk.name}」，真气流转周天——气血 +${h}，内力 +${m}！`, 'good');
    floatDmg('player', '+' + h, 'heal');
    renderBattle();
    return setTimeout(companionTurn, 650);
  }
  blog(`你使出「<b>${sk.name}</b>」！`);
  const r = calcPlayerHit(sk);
  if (r.miss) {
    Sfx.miss();
    blog(`${B.e.name}身形一晃，堪堪避过！`, 'bad');
    floatDmg('enemy', '闪避', 'miss');
  } else {
    B.e.hp = Math.max(0, B.e.hp - r.dmg);
    if (r.crit) Sfx.crit(); else Sfx.hit();
    blog(`击中${B.e.name}，造成 <b>${r.dmg}</b> 点伤害${r.crit ? '（会心一击！）' : ''}${sk.hits > 1 ? `（${sk.hits}连击）` : ''}！`, r.crit ? 'good' : '');
    floatDmg('enemy', '-' + r.dmg, r.crit ? 'crit' : '');
    shakePanel('#battle-stage');
    if (sk.lifesteal && r.dmg > 0) {
      const h = Math.round(r.dmg * sk.lifesteal);
      P.hp = clamp(P.hp + h, 0, P.hpMax);
      blog(`真气牵引，你吸取敌人体力，气血 +${h}。`, 'good');
      floatDmg('player', '+' + h, 'heal');
    }
    if (sk.mpDrain && r.dmg > 0) {
      P.mp = clamp(P.mp + sk.mpDrain, 0, P.mpMax);
      blog(`吞纳真气，你的内力 +${sk.mpDrain}。`, 'good');
    }
    if (sk.dot && B.e.hp > 0) {
      B.dot = { dmg: Math.max(2, Math.round(P.atk * sk.dot)), turns: 3 };
      blog(`${B.e.name}中了阴毒，气血将源源流逝！`, 'good');
    }
    if (sk.stun && B.e.hp > 0 && Math.random() < sk.stun) {
      B.enemyStun = true;
      blog(`${B.e.name}被震得气血翻涌，动弹不得！`, 'good');
    }
  }
  if (sk.defBuff) B.defBuffTurns = sk.defBuff;
  if (sk.atkBuff) B.atkBuffTurns = sk.atkBuff;
  renderBattle();
  if (B.e.hp <= 0) return setTimeout(victory, 650);
  setTimeout(companionTurn, 800);
}

function playerPotion(itemId) {
  if (!B || B.busy) return;
  if (!P.bag[itemId]) return;
  B.busy = true;
  const it = ITEMS[itemId], pot = POTIONS[it.pot];
  removeItem(itemId);
  const boost = passiveId() === 'royal' ? 1.3 : 1;
  if (pot.hp) { const h = Math.round(pot.hp * boost); P.hp = clamp(P.hp + h, 0, P.hpMax); }
  if (pot.mp) { const m = Math.round(pot.mp * boost); P.mp = clamp(P.mp + m, 0, P.mpMax); }
  if (pot.pct) { P.hp = clamp(P.hp + Math.round(P.hpMax * pot.pct * boost), 0, P.hpMax); P.mp = clamp(P.mp + Math.round(P.mpMax * pot.pct), 0, P.mpMax); }
  if (pot.full) { P.hp = P.hpMax; P.mp = P.mpMax; }
  if (pot.bbAtk) B.bf.atk = pot.bbAtk;
  if (pot.bbDef) B.bf.def = pot.bbDef;
  if (pot.bbSpd) B.bf.spd = pot.bbSpd;
  if (pot.bbNextCrit) B.bf.nextCrit = true;
  if (pot.bbDodge) B.bf.dodge = true;
  if (pot.bbStun) B.enemyStun = true;
  Sfx.heal();
  blog(`你服下「${it.name}」，气血内力渐复！`, 'good');
  floatDmg('player', '恢复', 'heal');
  renderBattle();
  setTimeout(companionTurn, 650);
}

function playerFlee() {
  if (!B || B.busy) return;
  B.busy = true;
  const chance = clamp(40 + (P.spd - B.e.spd) * 2, 20, 90);
  if (Math.random() * 100 < chance) {
    blog('三十六计，走为上计！你几个起落，摆脱了追击。', 'sys');
    log('你从一场战斗中全身而退。');
    setTimeout(() => { B = null; show('#screen-home'); renderHome(); }, 800);
  } else {
    blog('你转身欲走，却被拦了回来！', 'bad');
    setTimeout(enemyTurn, 600);
  }
}

// —— 伙伴回合 ——
function compAttack(c, tag) {
  const e = B.e;
  let d = (c.atk * rf(.9, 1.1) - e.def * .4) * rf(.85, 1.1);
  d = Math.max(1, Math.round(d));
  e.hp = Math.max(0, e.hp - d);
  blog(`${c.name}使出「${tag}」，造成 <b>${d}</b> 点伤害！`, 'ally');
  floatDmg('enemy', '-' + d, 'ally');
}

function companionTurn() {
  if (!B) return;
  const alive = B.comps.filter(c => c.hp > 0);
  let i = 0;
  const next = () => {
    if (B.e.hp <= 0 || i >= alive.length) {
      renderBattle();
      if (B.e.hp <= 0) return setTimeout(victory, 600);
      return setTimeout(enemyTurn, 650);
    }
    const c = alive[i++];
    compAct(c);
    renderBattle();
    setTimeout(next, 420);
  };
  next();
}

function compAct(c) {
  const e = B.e;
  if (c.role === 'heal') {
    if (P.hp < P.hpMax * .6) {
      const h = Math.round(P.hpMax * .1 + P.lv * 8);
      P.hp = clamp(P.hp + h, 0, P.hpMax);
      blog(`${c.name}施展「${c.skill}」，为你回复气血 +${h}！`, 'ally');
      floatDmg('player', '+' + h, 'heal');
      return;
    }
    if (c.hp < c.hpMax * .4) {
      c.hp = clamp(c.hp + Math.round(c.hpMax * .3), 0, c.hpMax);
      blog(`${c.name}自行调息，回复了气血。`, 'ally');
      return;
    }
    return compAttack(c, c.skill);
  }
  if (c.role === 'tank') {
    if (Math.random() < .3) {
      B.cover = true;
      blog(`${c.name}横身挡在你身前（本回合你受伤 -40%）！`, 'ally');
      return;
    }
    return compAttack(c, c.skill);
  }
  if (c.role === 'sup') {
    const m = 5 + Math.round(P.lv * 1.2);
    P.mp = clamp(P.mp + m, 0, P.mpMax);
    blog(`${c.name}为你掠阵，内力 +${m}。`, 'ally');
    if (Math.random() < .15) {
      B.bf.nextCrit = true;
      blog(`${c.name}高喝一声：「看准了打！」你下一击必定会心！`, 'ally');
    }
    return compAttack(c, c.skill);
  }
  // atk
  if (Math.random() < .18) {
    let d = (c.atk * 1.3 * rf(.9, 1.1) - e.def * .4);
    d = Math.max(1, Math.round(d));
    e.hp = Math.max(0, e.hp - d);
    blog(`${c.name}欺身抢攻，追击造成 <b>${d}</b> 点伤害！`, 'ally');
    floatDmg('enemy', '-' + d, 'ally');
    return;
  }
  compAttack(c, c.skill);
}

// —— 敌人回合 ——
function enemyTurn() {
  if (!B) return;
  const e = B.e;
  // 被动恢复
  const regen = 3 + (passiveId() === 'regen' ? 4 : 0);
  P.mp = clamp(P.mp + regen, 0, P.mpMax);
  if (passiveId() === 'regenhp') P.hp = clamp(P.hp + Math.round(P.hpMax * .03), 0, P.hpMax);
  if (P.regen) P.hp = clamp(P.hp + Math.round(P.hpMax * P.regen / 100), 0, P.hpMax);
  if (B.enemyStun) {
    B.enemyStun = false;
    blog(`${e.name}气息紊乱，这一回合动弹不得！`, 'good');
    return endRound();
  }
  // 选目标
  const aliveComps = B.comps.filter(c => c.hp > 0);
  const targetComp = (aliveComps.length && Math.random() < .3) ? pick(aliveComps) : null;
  // 技能
  let mult = 1, sname = null, ls = 0;
  const usable = e.skills.filter(s => Math.random() < s.chance);
  if (usable.length) { const s = pick(usable); mult = s.mult; sname = s.name; ls = s.lifesteal || 0; }

  if (targetComp) {
    if (Math.random() < .15) {
      blog(`${c2s(targetComp)}身形一闪，避开了${e.name}的攻击！`, 'good');
    } else {
      let d = (e.atk * mult * .75 - P.lv * 1.4) * rf(.85, 1.15);
      d = Math.max(1, Math.round(d));
      targetComp.hp = Math.max(0, targetComp.hp - d);
      if (mult > 1.05) Sfx.crit(); else Sfx.hit();
      blog(`${e.name}${sname ? `使出「<b>${sname}」` : '出手'}击向${c2s(targetComp)}，造成 <b>${d}</b> 点伤害！`, 'bad');
      if (targetComp.hp <= 0) blog(`${c2s(targetComp)}伤重，退出战圈！`, 'bad');
    }
    renderBattle();
    return endRound();
  }

  // 攻击玩家
  let dodge = clamp(4 + (P.spd + (B.bf.spd ? P.lv : 0) - e.spd) * .8, 3, 30);
  if (passiveId() === 'dodge') dodge += 8;
  if (B.bf.dodge || Math.random() * 100 < dodge) {
    B.bf.dodge = false;
    Sfx.miss();
    blog(`你身形飘忽，${e.name}的${sname ? `「${sname}」` : '攻击'}落了空！`, 'good');
    floatDmg('player', '闪避', 'miss');
    return endRound();
  }
  let d = (e.atk * mult - P.def * .6) * rf(.85, 1.15);
  if (passiveId() === 'iron') d *= .9;
  if (B.defBuffTurns > 0) d *= .5;
  if (B.bf.def > 0) d *= .5;
  if (B.cover) d *= .6;
  const crit = Math.random() * 100 < e.crt;
  if (crit) d *= 1.7;
  d = Math.max(1, Math.round(d));
  P.hp = Math.max(0, P.hp - d);
  if (crit) Sfx.crit(); else Sfx.hit();
  const reduce = [];
  if (B.defBuffTurns > 0) reduce.push('护体减伤');
  if (B.bf.def > 0) reduce.push('药力护身');
  if (B.cover) reduce.push('同伴掩护');
  blog(`${e.name}${sname ? `使出「<b>${sname}」` : '出手'}，你受到 <b>${d}</b> 点伤害${crit ? '（重创！）' : ''}${reduce.length ? '（' + reduce.join('·') + '）' : ''}！`, 'bad');
  floatDmg('player', '-' + d, crit ? 'crit' : '');
  shakePanel('#screen-battle');
  if (ls && d > 0) {
    e.hp = clamp(e.hp + Math.round(d * ls), 0, e.hpMax);
    blog(`${e.name}移花接玉，回复了气血！`, 'bad');
  }
  renderBattle();
  if (P.hp <= 0) return setTimeout(defeat, 650);
  endRound();
}
const c2s = c => `<b>${c.name}</b>`;

function endRound() {
  if (!B) return;
  B.cover = false;
  if (B.dot) {
    B.e.hp = Math.max(0, B.e.hp - B.dot.dmg);
    blog(`阴毒发作，${B.e.name}损失 ${B.dot.dmg} 点气血！`, 'good');
    if (--B.dot.turns <= 0) B.dot = null;
  }
  if (B.defBuffTurns > 0) B.defBuffTurns--;
  if (B.atkBuffTurns > 0) B.atkBuffTurns--;
  ['atk', 'def', 'spd'].forEach(k => { if (B.bf[k] > 0) B.bf[k]--; });
  B.round++;
  B.busy = false;
  renderBattle();
  if (B.e.hp <= 0) return setTimeout(victory, 600);
  renderBattleActions();
}

// —— 掉落 ——
function rollDrop() {
  const map = MAPS.find(m => m.id === curMap) || MAPS[0];
  const lv = map.lv;
  const roll = Math.random();
  if (roll < .32) {
    const tier = clamp(Math.ceil(lv / 10), 1, 5);
    const kind = pick(['ore', 'hide', 'herb', 'misc']);
    const cands = [];
    MATS[kind].forEach((n, i) => { if (MAT_TIER[i] === tier) cands.push('mat_' + kind + '_' + i); });
    return pick(cands);
  }
  if (roll < .55) {
    let key;
    if (lv < 10) key = pick(['jinchuang', 'neixi', 'jinchuang']);
    else if (lv < 20) key = pick(['yulu', 'liaoshang', 'ningqi']);
    else if (lv < 30) key = pick(['huichun', 'ningqi', 'guiyuan']);
    else if (lv < 40) key = pick(['xuming', 'dahuan', 'guiyuan']);
    else key = pick(['xuming', 'dahuan', 'jiuzhuan']);
    return 'pot_' + key;
  }
  if (roll < .72) return 'tr_' + rnd(0, TREASURES.length - 1);
  if (roll < .88) {
    const slot = rnd(0, 2);
    if (slot === 0) {
      const tr = WTIER_LV.reduce((acc, need, i) => lv >= need ? i : acc, 0);
      return 'w_' + rnd(0, WTYPES.length - 1) + '_' + tr;
    }
    if (slot === 1) {
      const tr = [1, 10, 20, 28, 36].reduce((acc, need, i) => lv >= need ? i : acc, 0);
      return 'a_' + rnd(0, ATYPES.length - 1) + '_' + tr;
    }
    const tr = [5, 18, 32].reduce((acc, need, i) => lv >= need ? i : acc, 0);
    return 'acc_' + rnd(0, ACC_TYPES.length - 1) + '_' + tr;
  }
  return 'book_univ' + rnd(0, UNIVERSAL_SKILLS.length - 1);
}

// —— 胜利结算 ——
function victory() {
  if (!B) return;
  const e = B.e;
  const ctx = { bossId: B.bossId, bountyKey: B.bountyKey, tournament: B.tournament };
  P.kills++;
  let exp = e.exp, silver = e.silver + rnd(0, Math.round(e.silver * .3));
  let drops = [];
  if (Math.random() < .35) {
    const d = rollDrop();
    addItem(d, 1);
    drops.push(ITEMS[d].name);
  }
  if (passiveId() === 'onkill') {
    const h = Math.round(P.hpMax * .2);
    P.hp = clamp(P.hp + h, 0, P.hpMax);
    blog(`明玉真气运转，击敌回气 +${h}！`, 'good');
  }
  B = null;

  let extra = '';
  let isChapterBoss = false;
  // 头目奖励
  if (ctx.bossId) {
    const boss = BOSSES[ctx.bossId], rw = boss.reward || {};
    flags.bossBeaten[ctx.bossId] = true;
    P.bossKills++;
    const rewards = [];
    if (rw.silver) { P.silver += rw.silver; rewards.push(`银两 ${rw.silver}`); }
    if (rw.item) { addItem(rw.item); rewards.push(`「${ITEMS[rw.item].name}」`); }
    if (rw.skill && !P.skills.includes(rw.skill)) { P.skills.push(rw.skill); rewards.push(`绝学「${SKILLS[rw.skill].name}」`); }
    if (rw.potions) Object.entries(rw.potions).forEach(([k, n]) => { addItem('pot_' + k, n); rewards.push(`${POTIONS[k].name} ×${n}`); });
    if (rw.sp) { addItem('sp_' + rw.sp); rewards.push(`「${SPECIALS[rw.sp].name}」`); }
    if (rewards.length) extra += `<div class="divider"></div><p><b>缴获：</b>${rewards.join('、')}</p>`;
    const chapter = CHAPTERS[flags.ch - 1];
    if (chapter && chapter.boss === ctx.bossId) {
      isChapterBoss = true;
      const doneCh = flags.ch;
      flags.ch = Math.min(11, flags.ch + 1);
      // 剧情伙伴入队
      Object.entries(COMPANIONS).forEach(([id, c]) => {
        if (c.recruit === 'story' + doneCh && !P.comps.includes(id)) {
          P.comps.push(id);
          if (P.compActive.length < 2) P.compActive.push(id);
          extra += `<p style="margin-top:8px"><b style="color:var(--jade)">「${c.name}」加入了你的队伍！</b></p>`;
        }
      });
      if (STORY_AFTER[ctx.bossId]) {
        extra += `<div class="divider"></div><p style="white-space:pre-line">${STORY_AFTER[ctx.bossId]}</p>`;
      }
    }
  }
  // 悬赏结算
  if (ctx.bountyKey) {
    const b = flags.bounty.list.find(x => x.key === ctx.bountyKey);
    if (b && !flags.bounty.done[b.key]) {
      flags.bounty.done[b.key] = true;
      flags.bountyCount++;
      const bs = Math.round(b.silver * (hasPerk('bounty') ? 1.25 : 1));
      P.silver += bs; exp += b.exp;
      extra += `<div class="divider"></div><p><b>悬赏达成！</b>额外获得银两 <b class="gold">${bs}</b>、经验 ${b.exp}。</p>`;
    }
  }
  P.silver += silver;
  Sfx.victory();
  blog(`「${e.name}」倒下了！获得经验 <b>${exp}</b>，银两 <b>${silver}</b>。`, 'good');
  log(`你击败了${ctx.bossId ? '头目' : ''}「${e.name}」，得银两 ${silver}。`, 'good');
  if (drops.length) log(`战利品：${drops.join('、')}。`, 'good');

  show('#screen-home');
  renderStatus();
  save();
  gainExp(exp);
  checkTitles();
  save();

  if (ctx.tournament) {
    const finalWin = TOUR.step >= 3;
    modal('比武 · 胜',
      `<p>第 ${TOUR.step} / 3 场获胜！${finalWin ? '三战三捷，全场哗然！' : '稍作喘息，下一场对手已在台上等候。'}</p>
       <p class="muted">经验 +${exp}，银两 +${silver}。</p>`,
      [{ label: finalWin ? '登台加冕' : '再战', primary: true, fn: () => finalWin ? tourChampion() : tourNext() }]);
    return;
  }
  const ending = isChapterBoss && ctx.bossId === 'dongfangyao';
  if (ending && !flags.ended) {
    flags.ended = true;
    save();
    modal('大结局 · 日出东方',
      `<div class="ending-body">${STORY_AFTER.dongfangyao.replace(/\n/g, '<br>')}</div>`,
      [{ label: '天下第一', primary: true, fn: () => renderHome() }]);
  } else {
    modal(ctx.bossId ? '头目授首' : '战斗胜利',
      `<p>「<b>${e.name}</b>」俯首认输，轰然倒地。</p>
       <p>获得经验 <b>${exp}</b>，银两 <b class="gold">${silver}</b>。</p>
       ${drops.length ? `<p class="muted">拾得：${drops.join('、')}</p>` : ''}${extra}`,
      [{ label: '再闯江湖', primary: true, fn: () => renderHome() }]);
  }
}

function defeat() {
  const wasTour = B && B.tournament;
  B = null;
  Sfx.defeat();
  if (wasTour) {
    TOUR.active = false;
    log('比武大会上憾负一场，止步于此。', 'bad');
    save();
    show('#screen-home');
    modal('憾负台下',
      `<p>你被对手一记巧招撂下台去——虽败犹荣，满堂喝彩。</p>
       <p class="muted">比武大会不受银两损失。来日方长，练好功夫再来！</p>`,
      [{ label: '卷土重来', primary: true, fn: () => renderHome() }]);
    return;
  }
  const lost = Math.round(P.silver * .2);
  P.silver -= lost;
  P.hp = Math.max(1, Math.round(P.hpMax * .3));
  log('你身受重伤，被路过的好心镖师所救……', 'bad');
  save();
  show('#screen-home');
  modal('败走麦城',
    `<p>眼前一黑，你倒在了血泊之中……</p>
     <p>醒来时，你已躺在客栈的床上——是路过的镖师把你救了回来。医馆耗费不菲，扣除银两 <b class="gold">${lost}</b>。</p>
     <p class="muted">胜败乃兵家常事。回客栈歇息，打坐修炼，卷土重来！</p>`,
    [{ label: '重整旗鼓', primary: true, fn: () => { renderHome(); } }]);
}
