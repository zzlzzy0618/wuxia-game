// 平衡性调参脚本：运行时调整护甲/敌人/Boss 数值，模拟胜率
// 用法: node test/tune.js [armorScale] [eAtkScale] [bossHpScale] [bossAtkScale]
const fs = require('fs');
const path = require('path');

function el() {
  return {
    style: {}, dataset: {}, value: '', textContent: '', innerHTML: '', title: '', disabled: false,
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener() {}, appendChild() {}, remove() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    scrollTop: 0, scrollHeight: 0, offsetWidth: 0
  };
}
const elements = {};
global.document = {
  querySelector(s) { if (!elements[s]) elements[s] = el(); return elements[s]; },
  querySelectorAll() { return []; },
  createElement() { return el(); },
  addEventListener() {},
  body: el()
};
global.window = { scrollTo: () => {}, AudioContext: null, webkitAudioContext: null };
global.scrollTo = () => {};
const store = {};
global.localStorage = {
  getItem: k => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: k => { delete store[k]; }
};
global.setTimeout = (fn) => { fn(); return 0; };

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const gameJs = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const args = process.argv.slice(2).map(Number);
const K = {
  armor: args[0] || 1,    // 护甲防御缩放（1=当前值）
  eAtk: args[1] || 1,     // 普通敌人攻击缩放
  bHp: args[2] || 1,      // Boss 血量缩放
  bAtk: args[3] || 1,     // Boss 攻击缩放
  hpBase: args[4] !== undefined ? args[4] : null,   // Boss hpMul 公式: hpBase + lv*hpSlope
  hpSlope: args[5] !== undefined ? args[5] : null,
  atkBase: args[6] !== undefined ? args[6] : null,  // Boss atkMul 公式
  atkSlope: args[7] !== undefined ? args[7] : null
};

const tests = `
;(function(){
  const K = ${JSON.stringify(K)};
  // —— 运行时补丁 ——
  Object.values(ITEMS).forEach(it => { if (it.slot === 'armor') it.def = Math.round(it.def * K.armor); });
  if (K.hpBase !== null) {
    Object.values(BOSSES).forEach(b => {
      b.hpMul = K.hpBase + b.lv * K.hpSlope;
      b.atkMul = K.atkBase + b.lv * K.atkSlope;
    });
  }
  const _mk = GEN.mkEnemy;
  GEN.mkEnemy = function (name, lv, o = {}) {
    const e = _mk(name, lv, o);
    const boss = !!(o.hpMul && o.hpMul > 2);
    e.atk = Math.round(e.atk * (boss ? K.bAtk : K.eAtk));
    if (boss) e.hpMax = Math.round(e.hpMax * K.bHp);
    e.hp = e.hpMax;
    return e;
  };

  function setup(lv, sect, wTier, aTier) {
    selectedSect = sect; newGame();
    P.lv = lv;
    SECTS[sect].skills.forEach((def, i) => {
      const id = sect + '_s' + i;
      if (P.lv >= SKILLS[id].lv && !P.skills.includes(id)) P.skills.push(id);
    });
    P.weapon = 'w_0_' + wTier; P.armor = 'a_4_' + aTier;
    // 符合等级财力的丹药配置
    P.bag = lv < 10 ? { pot_jinchuang: 4, pot_neixi: 2 }
      : lv < 20 ? { pot_yulu: 4, pot_neixi: 2 }
      : lv < 30 ? { pot_liaoshang: 4, pot_neixi: 3, pot_xiaohuan: 1 }
      : lv < 40 ? { pot_huichun: 4, pot_neixi: 3, pot_dahuan: 1 }
      : { pot_xuming: 4, pot_neixi: 3, pot_dahuan: 2 };
    recompute(); P.hp = P.hpMax; P.mp = P.mpMax;
  }
  // 结果追踪：defeat() 会重置气血并置空 B，不能以 P.hp>0 && !B 判胜
  let outcome = null;
  const _victory = victory, _defeat = defeat;
  victory = function () { outcome = 'win'; return _victory(); };
  defeat = function () { outcome = 'lose'; return _defeat(); };
  function usePot(id) { if (P.bag[id]) { playerPotion(id); return true; } return false; }
  function autoFight(enemyTpl, opts) {
    outcome = null;
    startBattle(enemyTpl, opts || {});
    const healPot = P.lv < 10 ? 'pot_jinchuang' : P.lv < 20 ? 'pot_yulu' : P.lv < 30 ? 'pot_liaoshang' : P.lv < 40 ? 'pot_huichun' : 'pot_xuming';
    const dahuan = P.bag['pot_dahuan'] ? 'pot_dahuan' : (P.bag['pot_xiaohuan'] ? 'pot_xiaohuan' : healPot);
    let g = 0;
    while (B && P.hp > 0 && g++ < 500) {
      if (P.hp < P.hpMax * .35 && (usePot(dahuan) || usePot(healPot))) continue;
      if (P.mp < 20 && (usePot('pot_neixi') || usePot(dahuan))) continue;
      const u = P.skills.filter(k => SKILLS[k].lv <= P.lv && SKILLS[k].mp <= P.mp && !(SKILLS[k].hpCost && P.hp <= P.hpMax * .15));
      u.sort((a, b) => (SKILLS[b].mult * (SKILLS[b].hits || 1)) - (SKILLS[a].mult * (SKILLS[a].hits || 1)));
      playerSkill(u[0] || 'basic');
    }
    if (!outcome) outcome = P.hp > 0 && !B ? 'win' : 'lose';
    return outcome === 'win';
  }
  const bossEnemy = id => {
    const b = BOSSES[id];
    return GEN.mkEnemy(b.name, b.lv, { hpMul: b.hpMul, atkMul: b.atkMul, expMul: b.expMul, silMul: b.silMul, skills: b.skills, flavor: b.flavor });
  };
  const plan = [
    ['zhouba', 4, 'shaolin', 0, 0], ['zhouba', 4, 'feidao', 0, 0],
    ['dugucan', 14, 'wudang', 1, 1], ['dugucan', 14, 'gumu', 1, 1],
    ['jinlunseng', 24, 'shaolin', 2, 2], ['shalifei', 28, 'gaibang', 3, 2],
    ['guimian', 31, 'taohua', 3, 3], ['duanyanping', 35, 'duan', 3, 3],
    ['chenguiseng', 39, 'lingjiu', 4, 3], ['dinglaoguai', 43, 'baiyun', 4, 4],
    ['yuehuagongzhu', 47, 'yihua', 4, 4], ['dongfangyao', 49, 'feidao', 4, 4]
  ];
  const out = [];
  plan.forEach(([bid, lv, sect, wt, at]) => {
    let w = 0, N = 60;
    for (let i = 0; i < N; i++) { setup(lv, sect, wt, at); if (autoFight(bossEnemy(bid), { bossId: bid })) w++; }
    out.push(BOSSES[bid].name + ' L' + lv + ' ' + SECTS[sect].name + ': ' + Math.round(w / N * 100) + '%');
  });
  // 新手怪
  selectedSect = 'wudang'; newGame();
  const nMaps = MAPS.find(m => m.id === 'niujiacun');
  let wins = 0;
  for (let i = 0; i < 30; i++) {
    P.hp = P.hpMax; P.mp = P.mpMax; P.bag = { pot_jinchuang: 3, pot_neixi: 2 };
    if (autoFight(pick(GEN.mapEnemies(nMaps)))) wins++;
  }
  out.push('新手怪 wudang L1: ' + Math.round(wins / 30 * 100) + '%');
  console.log(out.join('\\n'));
})();
`;
eval(gameJs + tests);
