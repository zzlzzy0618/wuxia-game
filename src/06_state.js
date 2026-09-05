/* ============ 状态 · 存档 · 属性 · 称号 ============ */

let P = null;          // 玩家
let flags = null;      // 全局旗标
let B = null;          // 战斗
let curMap = 'niujiacun';
let selectedSect = null;
const SAVE_KEY = 'jianghulu_save_v2';

let SKILLS = null;     // 装配后的武学表（init 时生成）
let ITEMS = null;      // 装配后的物品表

const expNeed = lv => Math.round(26 * Math.pow(lv, 1.5));

// —— 称号（成就系统，佩戴获得加成）——
const TITLES = {
  newbie:   { name: '初出茅庐', fx: {},                      how: '踏入江湖，便有姓名。' },
  lv10:     { name: '崭露头角', fx: { hp: 30 },              how: '等级达到 10' },
  lv20:     { name: '小有名气', fx: { atk: 5, def: 3 },      how: '等级达到 20' },
  lv30:     { name: '名动一方', fx: { atk: 10, def: 6 },     how: '等级达到 30' },
  lv40:     { name: '威震江湖', fx: { atk: 15, def: 10, hp: 150 }, how: '等级达到 40' },
  lv50:     { name: '绝顶高手', fx: { atk: 25, def: 15, hp: 300, crt: 5 }, how: '等级达到 50' },
  kill100:  { name: '百人斩',   fx: { crt: 3 },              how: '累计击败 100 名敌人' },
  kill500:  { name: '千军辟易', fx: { atk: 12 },             how: '累计击败 500 名敌人' },
  boss10:   { name: '剿匪先锋', fx: { def: 8 },              how: '击败 10 名头目' },
  bossAll:  { name: '魔教克星', fx: { atk: 20, hp: 200 },    how: '主线十章全部通关' },
  forge5:   { name: '锻造学徒', fx: { def: 4 },              how: '锻造成功 5 次' },
  forge10:  { name: '神兵在手', fx: { atk: 8 },              how: '锻造成功 10 次' },
  tour1:    { name: '比武魁首', fx: { crt: 5 },              how: '比武大会夺冠 1 次' },
  tour3:    { name: '武林盟主', fx: { atk: 15, spd: 3 },     how: '比武大会夺冠 3 次' },
  bounty20: { name: '赏金猎人', fx: { spd: 4 },              how: '完成 20 张悬赏' },
  rich:     { name: '富甲一方', fx: { hp: 100, mp: 50 },     how: '身怀 50000 两白银' }
};

function curTitleFx() {
  return (P && P.title && TITLES[P.title]) ? TITLES[P.title].fx : {};
}

// —— 装备强化 ——
function forgeStar(id) { return (P && P.forge && P.forge[id]) || 0; }
// 每星 +8%，至少 +1（保证低阶装备强化亦有感）
function forgeAdd(base, id) {
  const s = forgeStar(id);
  return s ? Math.max(1, Math.round(base * s * .08)) : 0;
}

// —— 武学装备槽 ——
// 套路两门（主/副，提供主动招式），内功、轻功各一门（以被动招式增益为主）
function equippedSkillIds() {
  return [P.rtSkill, P.rtSkill2, P.inSkill, P.agSkill].filter(id => id && SKILLS[id]);
}
function moveUnlocked(m) { return P.lv >= m.unlock; }

const SLOT_KEYS = { rt: ['rtSkill', 'rtSkill2'], in: ['inSkill'], ag: ['agSkill'] };
const SLOT_LABEL = { rtSkill: '主套路', rtSkill2: '副套路', inSkill: '内功', agSkill: '轻功' };

// 武学当前战力评估：套路取已解锁的最强主动招，内功/轻功按招式参悟进度折算
// （如此，早年武学五式大成之前，不会被刚入门的高阶新武学轻易顶替）
function skillPower(id) {
  const sk = SKILLS[id];
  if (!sk) return 0;
  if (sk.cat === 'rt') {
    let best = 0;
    sk.moves.forEach(m => {
      if (m.t === 'act' && m.mult > 0 && moveUnlocked(m)) best = Math.max(best, m.mult * (m.hits || 1));
    });
    return best || sk.mult * .8;
  }
  const un = sk.moves.filter(moveUnlocked).length;
  return Math.round(sk.mult * (.35 + .65 * un / 5) * 100) / 100;
}

// 自动运功：空槽直接装，否则替换同系较弱的一门；返回装入的槽位名（未装返回 null）
function autoEquip(id) {
  const sk = SKILLS[id];
  if (!sk || id === 'basic') return null;
  if ([P.rtSkill, P.rtSkill2, P.inSkill, P.agSkill].includes(id)) return null;
  if (sk.cat === 'rt') {
    if (!P.rtSkill) { P.rtSkill = id; return '主套路'; }
    if (!P.rtSkill2) { P.rtSkill2 = id; return '副套路'; }
    const weak = skillPower(P.rtSkill) <= skillPower(P.rtSkill2) ? 'rtSkill' : 'rtSkill2';
    if (skillPower(P[weak]) < skillPower(id)) { P[weak] = id; return SLOT_LABEL[weak]; }
  } else if (sk.cat === 'in') {
    if (!P.inSkill) { P.inSkill = id; return '内功'; }
    if (skillPower(P.inSkill) < skillPower(id)) { P.inSkill = id; return '内功'; }
  } else {
    if (!P.agSkill) { P.agSkill = id; return '轻功'; }
    if (skillPower(P.agSkill) < skillPower(id)) { P.agSkill = id; return '轻功'; }
  }
  return null;
}
// 习得武学并尝试自动运功
function grantSkill(id) {
  if (!P.skills.includes(id)) P.skills.push(id);
  return autoEquip(id);
}
// 手动运功（武学界面）：直接装入对应系槽位，套路双槽时顶掉较弱一门
function forceEquip(id) {
  const sk = SKILLS[id];
  if (!sk || id === 'basic') return null;
  if (sk.cat === 'rt') {
    if (!P.rtSkill) { P.rtSkill = id; return '主套路'; }
    if (!P.rtSkill2) { P.rtSkill2 = id; return '副套路'; }
    const weak = skillPower(P.rtSkill) <= skillPower(P.rtSkill2) ? 'rtSkill' : 'rtSkill2';
    P[weak] = id; return SLOT_LABEL[weak];
  }
  const key = sk.cat === 'in' ? 'inSkill' : 'agSkill';
  P[key] = id; return SLOT_LABEL[key];
}
// 升级后重估运功：招式随等级解锁，早年武学可能反超高阶新学；返回变动说明
function reevaluateSlots() {
  const changed = [];
  P.skills.forEach(id => {
    const slot = autoEquip(id);
    if (slot) changed.push(`真气流转，你重新运功——「<b>${SKILLS[id].name}</b>」荣升${slot}之位！`);
  });
  return changed;
}

// —— 属性计算 ——
function recompute() {
  const s = SECTS[P.sect], g = P.lv - 1, tf = curTitleFx(), b = P.bonus;
  let hp = s.base.hp + s.grow.hp * g + (b.hp || 0) + (tf.hp || 0);
  let mp = s.base.mp + s.grow.mp * g + (b.mp || 0) + (tf.mp || 0);
  let atk = s.base.atk + s.grow.atk * g + (b.atk || 0) + (tf.atk || 0);
  let def = s.base.def + s.grow.def * g + (b.def || 0) + (tf.def || 0);
  let spd = s.base.spd + s.grow.spd * g + (b.spd || 0) + (tf.spd || 0);
  let crt = s.base.crt + s.grow.crt * g + (b.crt || 0) + (tf.crt || 0);
  let atkp = 0, regen = 0, mpregen = 0, dmgred = 0, hppct = 0, dodge = 0, ls = 0, firstCrit = false;

  // 装备中的武学：已参悟的被动招式生效
  equippedSkillIds().forEach(id => {
    SKILLS[id].moves.forEach(m => {
      if (m.t !== 'pas' || !moveUnlocked(m) || !m.fx) return;
      const f = m.fx;
      if (f.atk) atk += f.atk;
      if (f.crt) crt += f.crt;
      if (f.def) def += f.def;
      if (f.spd) spd += f.spd;
      if (f.hp) hp += f.hp;
      if (f.mp) mp += f.mp;
      if (f.atkp) atkp += f.atkp;
      if (f.ls) ls += f.ls;
      if (f.regen) regen += f.regen;
      if (f.mpregen) mpregen += f.mpregen;
      if (f.dmgred) dmgred += f.dmgred;
      if (f.hppct) hppct += f.hppct;
      if (f.dodge) dodge += f.dodge;
      if (f.firstCrit) firstCrit = true;
    });
  });

  const w = P.weapon && ITEMS[P.weapon];
  if (w) atk += w.atk + forgeAdd(w.atk, w.id);
  const a = P.armor && ITEMS[P.armor];
  if (a) def += a.def + forgeAdd(a.def, a.id);
  const ac = P.acc && ITEMS[P.acc];
  if (ac) {
    const v = ac.fxv + forgeAdd(ac.fxv, ac.id);
    switch (ac.fx) {
      case 'hp': hp += v * 3; break;
      case 'mp': mp += v * 2; break;
      case 'atk': atk += v; break;
      case 'def': def += v; break;
      case 'crt': crt += v; break;
      case 'spd': spd += v; break;
      case 'regen': regen += v; break;
      case 'atkp': atkp += v; break;
      case 'atkspd': atk += v; spd += v; break;
      case 'spdcrt': spd += v; crt += v; break;
      case 'defspd': def += v; spd += v; break;
      case 'hpmp': hp += v * 2; mp += v; break;
    }
  }
  if (hppct) hp *= 1 + hppct / 100;
  if (s.passive.id === 'royal') hp = Math.round(hp * 1.1);  // 大理：气血上限+10%
  if (atkp) atk = Math.round(atk * (1 + atkp / 100));

  P.hpMax = Math.round(hp); P.mpMax = Math.round(mp);
  P.atk = Math.round(atk); P.def = Math.round(def);
  P.spd = Math.round(spd); P.crt = Math.round(crt);
  P.regen = Math.round(Math.min(regen, 12) * 10) / 10;
  P.mpregen = Math.round(mpregen);
  P.dmgred = Math.round(Math.min(dmgred, 35) * 10) / 10;
  P.dodgeBonus = Math.round(Math.min(dodge, 20) * 10) / 10;
  P.ls = Math.round(Math.min(ls, 35) * 10) / 10;
  P.firstCrit = firstCrit;
  P.hp = clamp(P.hp, 0, P.hpMax);
  P.mp = clamp(P.mp, 0, P.mpMax);
}

// —— 存档 ——
function save() {
  if (!P) return;
  flags.loc = curMap;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 2, p: P, flags })); } catch (e) {}
}
function loadSave() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (d && d.v === 2 && d.p && d.flags) return d;
  } catch (e) {}
  return null;
}

// —— 行囊工具 ——
function addItem(id, n = 1) { P.bag[id] = (P.bag[id] || 0) + n; }
function removeItem(id, n = 1) {
  if (!P.bag[id]) return false;
  P.bag[id] -= n;
  if (P.bag[id] <= 0) delete P.bag[id];
  return true;
}
function countMat(tier) {
  let n = 0;
  Object.entries(P.bag).forEach(([id, c]) => {
    const it = ITEMS[id];
    if (it && it.cat === 'mat' && it.mtier === tier) n += c;
  });
  return n;
}
function consumeMat(tier, n) {
  for (const [id, c] of Object.entries(P.bag)) {
    const it = ITEMS[id];
    if (n <= 0) break;
    if (it && it.cat === 'mat' && it.mtier === tier) {
      const take = Math.min(c, n);
      removeItem(id, take);
      n -= take;
    }
  }
  return n <= 0;
}

// —— 伙伴加成判断 ——
function hasComp(id) { return P && P.comps.includes(id); }
function hasPerk(perk) {
  return P && P.compActive.some(id => COMPANIONS[id] && COMPANIONS[id].perk === perk);
}

// —— 称号检查（在各关键节点调用）——
// 加成强度评分：更强的称号才会自动佩戴，避免静默降级
function titleScore(id) {
  const fx = (TITLES[id] && TITLES[id].fx) || {};
  return (fx.atk || 0) + (fx.def || 0) + (fx.spd || 0) + (fx.crt || 0) + (fx.hp || 0) * .04 + (fx.mp || 0) * .1;
}
function checkTitles() {
  if (!P) return;
  const conds = {
    lv10: P.lv >= 10, lv20: P.lv >= 20, lv30: P.lv >= 30, lv40: P.lv >= 40, lv50: P.lv >= 50,
    kill100: P.kills >= 100, kill500: P.kills >= 500,
    boss10: P.bossKills >= 10, bossAll: flags.ch >= 11,
    forge5: P.forgeSucc >= 5, forge10: P.forgeSucc >= 10,
    tour1: P.tourWins >= 1, tour3: P.tourWins >= 3,
    bounty20: flags.bountyCount >= 20,
    rich: P.silver >= 50000
  };
  const gained = [];
  Object.entries(conds).forEach(([id, ok]) => {
    if (ok && !P.titles.includes(id)) { P.titles.push(id); gained.push(id); }
  });
  if (gained.length) {
    gained.forEach(id => {
      const t = TITLES[id];
      const fxTxt = Object.entries(t.fx).map(([k, v]) =>
        ({ hp: '气血', mp: '内力', atk: '攻击', def: '防御', spd: '身法', crt: '暴击%' }[k] || k) + '+' + v).join('，');
      const auto = titleScore(id) > titleScore(P.title);
      if (auto) P.title = id;
      modal('称号 · ' + t.name,
        `<p>江湖中人送你一个名号——<b style="color:var(--red)">${t.name}</b>。</p>
         <p class="muted">${t.how}。佩戴称号：${fxTxt || '无加成'}。</p>
         <p class="muted">${auto ? '加成更胜从前，已自动佩戴。' : '当前仍佩戴「' + TITLES[P.title].name + '」，可在「称号」中更换。'}</p>`,
        [{ label: '不负此名', primary: true }]);
    });
    recompute();
    save();
  }
}
