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

// —— 属性计算 ——
function recompute() {
  const s = SECTS[P.sect], g = P.lv - 1, tf = curTitleFx(), b = P.bonus;
  let hp = s.base.hp + s.grow.hp * g + (b.hp || 0) + (tf.hp || 0);
  let mp = s.base.mp + s.grow.mp * g + (b.mp || 0) + (tf.mp || 0);
  let atk = s.base.atk + s.grow.atk * g + (b.atk || 0) + (tf.atk || 0);
  let def = s.base.def + s.grow.def * g + (b.def || 0) + (tf.def || 0);
  let spd = s.base.spd + s.grow.spd * g + (b.spd || 0) + (tf.spd || 0);
  let crt = s.base.crt + s.grow.crt * g + (b.crt || 0) + (tf.crt || 0);
  let atkp = 0, regen = 0;

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
      case 'regen': regen = v; break;
      case 'atkp': atkp = v; break;
      case 'atkspd': atk += v; spd += v; break;
      case 'spdcrt': spd += v; crt += v; break;
      case 'defspd': def += v; spd += v; break;
      case 'hpmp': hp += v * 2; mp += v; break;
    }
  }
  if (s.passive.id === 'royal') hp = Math.round(hp * 1.1);  // 大理：气血上限+10%
  if (atkp) atk = Math.round(atk * (1 + atkp / 100));

  P.hpMax = Math.round(hp); P.mpMax = Math.round(mp);
  P.atk = Math.round(atk); P.def = Math.round(def);
  P.spd = Math.round(spd); P.crt = Math.round(crt);
  P.regen = regen;
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
