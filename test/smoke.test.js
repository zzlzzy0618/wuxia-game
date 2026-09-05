// 江湖录 v2 冒烟/平衡性测试（Node 环境，模拟 DOM）
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

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const gameJs = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const tests = `
;(function runTests(){
  let errs = [];
  const assert = (cond, msg) => { if (!cond) errs.push(msg); };

  // ---- [1] 数据完整性 ----
  assert(Object.keys(SECTS).length === 10, '门派数不是10: ' + Object.keys(SECTS).length);
  Object.values(SECTS).forEach(s => {
    assert(s.skills.length === 15, s.name + ' 门派武学不是15个');
    assert(s.passive && s.passive.id && s.passive.text, s.name + ' 缺少被动');
  });
  const skillCount = Object.keys(SKILLS).length;
  assert(skillCount >= 200, '武学不足200: ' + skillCount);
  const itemCount = Object.keys(ITEMS).length;
  assert(itemCount >= 300, '物品不足300: ' + itemCount);
  assert(MAPS.length >= 50, '地图不足50: ' + MAPS.length);
  const mapIds = new Set(MAPS.map(m => m.id));
  assert(mapIds.size === MAPS.length, '地图 id 重复');
  MAPS.forEach(m => {
    assert(REGIONS[m.region], m.name + ' 地域无效: ' + m.region);
    (m.events || []).forEach(ev => {
      if (ev.skill) assert(SKILLS[ev.skill], m.name + ' 事件武学缺失: ' + ev.skill);
      if (ev.comp) assert(COMPANIONS[ev.comp], m.name + ' 事件伙伴缺失: ' + ev.comp);
    });
    if (m.bossSide) assert(BOSSES[m.bossSide], m.name + ' 支线头目缺失: ' + m.bossSide);
  });
  assert(Object.keys(COMPANIONS).length === 16, '伙伴不是16名');
  Object.entries(COMPANIONS).forEach(([id, c]) => {
    if (c.map) assert(mapIds.has(c.map), id + ' 伙伴地图无效: ' + c.map);
    if (c.recruit === 'hire') assert(typeof c.cost === 'number', id + ' 雇请伙伴缺费用');
  });
  CHAPTERS.forEach(ch => {
    if (ch.boss) {
      assert(BOSSES[ch.boss], '第' + ch.ch + '章头目缺失: ' + ch.boss);
      if (ch.map) assert(mapIds.has(ch.map), '第' + ch.ch + '章地图无效: ' + ch.map);
    }
  });
  Object.entries(BOSSES).forEach(([id, b]) => {
    const rw = b.reward || {};
    if (rw.item) assert(ITEMS[rw.item], id + ' 奖励物品缺失: ' + rw.item);
    if (rw.skill) assert(SKILLS[rw.skill], id + ' 奖励武学缺失: ' + rw.skill);
    if (rw.sp) assert(SPECIALS[rw.sp], id + ' 奖励奇物缺失: ' + rw.sp);
    if (rw.potions) Object.keys(rw.potions).forEach(k => assert(POTIONS[k], id + ' 奖励丹药缺失: ' + k));
  });
  // 防具/武器档位单调递增
  for (let si = 0; si < ATYPES.length; si++) {
    for (let tr = 1; tr < 5; tr++) {
      assert(ITEMS['a_' + si + '_' + tr].def > ITEMS['a_' + si + '_' + (tr - 1)].def,
        ATYPES[si] + ' 防御档位不递增 at tier ' + tr);
    }
  }
  for (let ti = 0; ti < WTYPES.length; ti++) {
    for (let tr = 1; tr < 6; tr++) {
      assert(ITEMS['w_' + ti + '_' + tr].atk > ITEMS['w_' + ti + '_' + (tr - 1)].atk,
        WTYPES[ti][0] + ' 武器攻击档位不递增 at tier ' + tr);
    }
  }
  // 秘籍 ↔ 武学对应
  UNIVERSAL_SKILLS.forEach((d, i) => {
    assert(ITEMS['book_univ' + i] && ITEMS['book_univ' + i].bookSkill === 'univ' + i, 'book_univ' + i + ' 秘籍不对应');
    assert(SKILLS['univ' + i].name === d[0], 'univ' + i + ' 名称不对应');
  });
  // 通用/隐世武学倍率修正生效（mult 应为 tier 倍率而非原始小系数）
  assert(SKILLS.univ0.mult > .8, '基础剑法 mult 异常: ' + SKILLS.univ0.mult);
  assert(SKILLS.dugu.mult > 3, '独孤九剑 mult 异常: ' + SKILLS.dugu.mult);
  // 武学三系 × 五式招法
  const catCount = { rt: 0, in: 0, ag: 0 };
  Object.values(SKILLS).forEach(sk => {
    if (sk.id === 'basic') return;
    assert(['rt', 'in', 'ag'].includes(sk.cat), sk.name + ' 缺少三系分类');
    catCount[sk.cat]++;
    assert(sk.moves && sk.moves.length === 5, sk.name + ' 招式不足五式');
    const acts = sk.moves.filter(m => m.t === 'act').length;
    if (sk.cat === 'rt') assert(acts === 4, sk.name + ' 套路应4主动1被动: ' + acts);
    if (sk.cat === 'in') assert(acts === 1, sk.name + ' 内功应1主动4被动: ' + acts);
    if (sk.cat === 'ag') assert(acts === 1, sk.name + ' 轻功应1主动4被动: ' + acts);
    sk.moves.forEach((m, i) => {
      assert(m.name && m.mv === i + 1, sk.name + ' 招式序号异常');
      assert(m.unlock === sk.lv + MV_UNLOCK[i], sk.name + ' 招式解锁等级异常');
    });
    if (sk.cat === 'rt') {
      const [m1, m2, , m4, m5] = sk.moves;
      assert(m5.mult > m4.mult && m4.mult > m2.mult && m2.mult > m1.mult, sk.name + ' 招式威力不递增');
    }
    if (sk.cat === 'in' || sk.cat === 'ag') assert(sk.moves[4].t === 'pas', sk.name + ' 五式应为最强被动');
  });
  assert(SECT_SKILL_CATS.filter(c => c === 'rt').length === 8, '门派套路数不是8');
  assert(SECT_SKILL_CATS.filter(c => c === 'in').length === 4, '门派内功数不是4');
  assert(SECT_SKILL_CATS.filter(c => c === 'ag').length === 3, '门派轻功数不是3');
  assert(catCount.rt + catCount.in + catCount.ag === skillCount - 1, '三系武学计数不齐');
  if (errs.length) { console.error('[1] 数据错误:', errs); process.exit(1); }
  console.log('[1] 数据完整性 OK —— ' + Object.keys(SECTS).length + '门派 / ' + skillCount + '武学（' + catCount.rt + '套路 + ' + catCount.in + '内功 + ' + catCount.ag + '轻功，' + (skillCount - 1) * 5 + '式招法）/ ' + itemCount + '物品 / ' + MAPS.length + '地图 / ' + Object.keys(BOSSES).length + '头目 / ' + Object.keys(COMPANIONS).length + '伙伴');

  // ---- 同步化定时器 ----
  global.setTimeout = (fn) => { fn(); return 0; };

  // ---- [2] 建号 / 升级 / 存档 ----
  Object.keys(SECTS).forEach(st => {
    selectedSect = st; newGame();
    assert(P.lv === 1 && P.hp === P.hpMax && P.hp > 0, st + ' 初始状态异常');
    assert(P.skills.includes(st + '_s0'), st + ' 未习得入门武学');
  });
  selectedSect = 'shaolin'; newGame();
  const before = P.lv;
  gainExp(200000); // 升满50级约需18万经验
  assert(P.lv > before, '升级失败');
  assert(P.lv === 50, '经验溢出未封顶50级: ' + P.lv);
  assert(P.skills.length >= 16, '50级门派武学未学全: ' + P.skills.length);
  assert(P.rtSkill && P.rtSkill2 && P.inSkill && P.agSkill, '50级四运功槽未满');
  assert(equippedSkillIds().length === 4, '运功槽数量异常');
  const saved = loadSave();
  assert(saved && saved.p && saved.p.lv === 50, '存档读取失败');
  console.log('[2] 建号/升级/存档 OK —— 少林直升50级，攻' + P.atk + ' 防' + P.def + ' 血' + P.hpMax + '，已学' + P.skills.length + '门武学，运功：' + equippedSkillIds().map(id => SKILLS[id].name).join('/'));

  // ---- [3] 系统功能 ----
  ensureBounty();
  assert(flags.bounty.list.length === 4, '悬赏生成数量错误');
  const b0 = flags.bounty.list[0];
  assert(b0.silver > 0 && b0.exp > 0 && b0.lv > 0, '悬赏奖励错误');
  genBounties();
  assert(flags.bounty.list.length === 4, '悬赏刷新错误');
  ensureShop();
  assert(flags.shop.stock.length === 11, '商店到货数量错误: ' + flags.shop.stock.length);
  flags.shop.stock.forEach(id => assert(ITEMS[id], '商店物品缺失: ' + id));
  // 锻造
  P.weapon = 'w_0_0'; P.forge = {}; recompute();
  P.bag = {}; addItem('mat_ore_0', 30); P.silver = 100000;
  const atkBefore = P.atk;
  let forged = false;
  for (let i = 0; i < 60 && !forged; i++) { doForge('weapon'); forged = forgeStar('w_0_0') >= 1; }
  assert(forged, '锻造60次未成功一次（概率异常）');
  assert(P.atk > atkBefore, '锻造后攻击未提升');
  assert(P.forgeSucc >= 1, '锻造成功计数错误');
  // 伙伴
  P.comps = ['suxinger', 'shenguhong']; P.compActive = ['suxinger'];
  assert(hasPerk('bounty') === false, '未上阵百晓生不应有悬赏加成');
  P.compActive = ['suxinger', 'baixiaosheng'];
  assert(hasPerk('bounty') === true, '上阵百晓生应有悬赏加成');
  const ci = mkCompInstance('suxinger');
  assert(ci.hp > 0 && ci.atk > 0 && ci.hpMax >= ci.hp, '伙伴实例属性异常');
  // 称号
  P.kills = 100; P.bossKills = 10; checkTitles();
  assert(P.titles.includes('kill100') && P.titles.includes('boss10'), '称号未触发');
  if (errs.length) { console.error('[3] 系统错误:', errs); process.exit(1); }
  console.log('[3] 悬赏/商店/锻造/伙伴/称号 OK');

  // ---- [3.5] 新装备槽 / 武学出身体系 ----
  EXTRA_EQUIP.forEach(eq => {
    assert(EQUIP_SLOTS.includes(eq.key), eq.label + ' 未纳入装备槽');
    eq.shapes.forEach((shape, si) => {
      for (let tr = 0; tr < 5; tr++) {
        const id = eq.abbr + '_' + si + '_' + tr;
        assert(ITEMS[id], '新装备缺失: ' + id);
        assert(ITEMS[id][eq.main] > 0, id + ' 主属性异常');
        if (eq.sub) assert(ITEMS[id][eq.sub] > 0, id + ' 副属性异常');
        if (tr > 0) assert(ITEMS[id][eq.main] >= ITEMS[eq.abbr + '_' + si + '_' + (tr - 1)][eq.main], eq.label + ' 档位不递增 at tier ' + tr);
      }
    });
  });
  // 新装备属性计入人物
  selectedSect = 'shaolin'; newGame();
  const _def0 = P.def, _hp0 = P.hpMax, _atk0 = P.atk;
  P.head = 'hd_0_2'; P.wrist = 'wr_1_2'; recompute();
  assert(P.def > _def0 && P.hpMax > _hp0 && P.atk > _atk0, '头饰/护腕属性未计入 recompute');
  P.head = null; P.wrist = null; recompute();
  // 武学出身：门派嫡传 > 江湖流传；绝世神功冠绝隐世
  const originTags = Object.values(SKILL_ORIGIN).map(o => o.tag);
  Object.values(SKILLS).forEach(sk => {
    if (sk.id === 'basic') return;
    assert(originTags.some(t => sk.desc.startsWith(t)), sk.name + ' 缺少出身标记');
  });
  assert(SKILLS.univ0.mult < SKILLS.shaolin_s0.mult, '门派嫡传应强于同阶江湖武学');
  const SUPREME = ['jiuyang', 'jiuyin', 'dugu', 'beiming', 'qiankun', 'taixuan', 'shenzhao', 'longxiang'];
  SUPREME.forEach(id => {
    assert(SKILLS[id].supreme === true, id + ' 应为绝世神功');
    assert(SKILLS[id].desc.startsWith('绝世神功'), id + ' 出身标记错误');
  });
  const supMax = Math.max(...SUPREME.map(id => SKILLS[id].mult));
  const hidMax = Math.max(...Object.keys(HIDDEN_SKILLS).filter(id => !SUPREME.includes(id)).map(id => SKILLS[id].mult));
  assert(supMax > hidMax, '绝世神功应冠绝寻常隐世武学');
  if (errs.length) { console.error('[3.5] 装备/出身错误:', errs); process.exit(1); }
  console.log('[3.5] 五类新装备（' + EXTRA_EQUIP.reduce((a, e) => a + e.shapes.length * 5, 0) + '件）· 武学出身（门派>江湖 · 绝世神功冠绝）OK');

  // ---- [4] 新手战斗（lv1 vs 牛家村怪 ×30）----
  function setup(lv, sect, wTier, aTier) {
    selectedSect = sect; newGame();
    P.lv = lv;
    // 按等级解锁门派武学并自动运功（模拟正常升级的玩家）
    SECTS[sect].skills.forEach((def, i) => {
      const id = sect + '_s' + i;
      if (P.lv >= SKILLS[id].lv) grantSkill(id);
    });
    reevaluateSlots();
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
  // 招式选择：内功疗伤招 + 已解锁最强攻击招
  function pickHealMove() {
    let best = null;
    if (P.inSkill) SKILLS[P.inSkill].moves.forEach((m, i) => {
      if (m.t === 'act' && m.heal && moveUnlocked(m) && P.mp >= m.mp) best = [P.inSkill, i];
    });
    return best;
  }
  function pickBestMove() {
    let best = null, bp = 1.0;
    [P.rtSkill, P.rtSkill2, P.inSkill, P.agSkill].forEach(id => {
      if (!id) return;
      SKILLS[id].moves.forEach((m, i) => {
        if (m.t !== 'act' || m.heal || !moveUnlocked(m)) return;
        if (m.mp > P.mp) return;
        if (m.hpCost && P.hp <= P.hpMax * .15) return;
        const p = m.mult * (m.hits || 1);
        if (p > bp) { bp = p; best = [id, i]; }
      });
    });
    return best;
  }
  function autoFight(enemyTpl, opts) {
    outcome = null;
    startBattle(enemyTpl, opts || {});
    const healPot = P.lv < 10 ? 'pot_jinchuang' : P.lv < 20 ? 'pot_yulu' : P.lv < 30 ? 'pot_liaoshang' : P.lv < 40 ? 'pot_huichun' : 'pot_xuming';
    const dahuan = P.bag['pot_dahuan'] ? 'pot_dahuan' : (P.bag['pot_xiaohuan'] ? 'pot_xiaohuan' : healPot);
    let g = 0;
    while (B && P.hp > 0 && g++ < 500) {
      if (P.hp < P.hpMax * .35 && (usePot(dahuan) || usePot(healPot))) continue;
      if (P.mp < 20 && (usePot('pot_neixi') || usePot(dahuan))) continue;
      const hm = pickHealMove();
      if (hm && P.hp < P.hpMax * .55) { playerMove(hm[0], hm[1]); continue; }
      const mv = pickBestMove();
      if (mv) playerMove(mv[0], mv[1]); else playerMove('basic', 0);
    }
    if (!outcome) outcome = P.hp > 0 && !B ? 'win' : 'lose';
    return outcome === 'win';
  }
  const bossEnemy = id => {
    const b = BOSSES[id];
    return GEN.mkEnemy(b.name, b.lv, { hpMul: b.hpMul, atkMul: b.atkMul, expMul: b.expMul, silMul: b.silMul, skills: b.skills, flavor: b.flavor });
  };

  selectedSect = 'wudang'; newGame();
  const nMaps = MAPS.find(m => m.id === 'niujiacun');
  let wins = 0;
  for (let i = 0; i < 30; i++) {
    P.hp = P.hpMax; P.mp = P.mpMax;
    if (autoFight(pick(GEN.mapEnemies(nMaps)))) wins++;
  }
  console.log('[4] 一级武当 vs 牛家村恶徒 30 场胜率: ' + Math.round(wins / 30 * 100) + '%');
  assert(wins >= 22, '新手战斗胜率过低: ' + wins + '/30');

  // ---- [4.5] 战斗技能三页签（套路/内功/轻功，被动不入选择）----
  setup(45, 'shaolin', 3, 3);
  startBattle(GEN.mkEnemy('试炼木人', 40, {}), {});
  const actHtml = document.querySelector('#battle-actions').innerHTML;
  assert(actHtml.includes('sk-tabs'), '战斗技能界面缺少页签');
  ['套路', '内功', '轻功'].forEach(n => assert(actHtml.includes('>' + n + '</button>'), '战斗页签缺少「' + n + '」'));
  assert(actHtml.includes('普通攻击'), '套路页签缺少普通攻击');
  [P.rtSkill, P.rtSkill2, P.inSkill, P.agSkill].forEach(id => {
    if (!id) return;
    SKILLS[id].moves.forEach(m => {
      if (m.t === 'pas' && moveUnlocked(m)) assert(!actHtml.includes('>' + m.name + '<'), '被动招式「' + m.name + '」不应出现在选择中');
    });
  });
  B = null;
  if (errs.length) { console.error('[4.5] 页签错误:', errs); process.exit(1); }
  console.log('[4.5] 战斗三页签（套路/内功/轻功，被动招式不入选择）OK');

  // ---- [4.6] 自动探索（遇敌自战 · 伤重自歇 · 可停）----
  let tickFn = null, tickCleared = false;
  const _si = global.setInterval, _ci = global.clearInterval;
  global.setInterval = fn => { tickFn = fn; return 9; };
  global.clearInterval = () => { tickCleared = true; };
  toggleAuto();
  assert(AUTO.on === true, '自动探索未能开启');
  assert(typeof tickFn === 'function', '自动循环未启动');
  for (let i = 0; i < 40 && AUTO.on; i++) tickFn();
  assert(AUTO.fights >= 1, '自动历练未经历战斗: ' + AUTO.fights);
  assert(P.hp > 0, '自动历练中重伤');
  assert(B === null, '自动战斗未自行收场');
  stopAuto();
  assert(AUTO.on === false && tickCleared, '自动探索未能停止');
  global.setInterval = _si; global.clearInterval = _ci;
  if (errs.length) { console.error('[4.6] 自动探索错误:', errs); process.exit(1); }
  console.log('[4.6] 自动探索 OK —— 连续自动历练 ' + AUTO.fights + ' 战，气血 ' + P.hp + '/' + P.hpMax);

  // ---- [5] Boss 平衡模拟（按建议等级与对应档位装备，无伙伴）----
  const plan = [
    ['zhouba', 4, 'shaolin', 0, 0], ['zhouba', 4, 'feidao', 0, 0],
    ['dugucan', 14, 'wudang', 1, 1], ['dugucan', 14, 'gumu', 1, 1],
    ['jinlunseng', 24, 'shaolin', 2, 2], ['shalifei', 28, 'gaibang', 3, 2],
    ['guimian', 31, 'taohua', 3, 3], ['duanyanping', 35, 'duan', 3, 3],
    ['chenguiseng', 39, 'lingjiu', 4, 3], ['dinglaoguai', 43, 'baiyun', 4, 4],
    ['yuehuagongzhu', 47, 'yihua', 4, 4], ['dongfangyao', 49, 'feidao', 4, 4]
  ];
  console.log('[5] Boss 胜率模拟（60场/组，无伙伴，带同档装备丹药）:');
  const rates = [];
  plan.forEach(([bid, lv, sect, wt, at]) => {
    let w = 0, N = 60;
    for (let i = 0; i < N; i++) { setup(lv, sect, wt, at); if (autoFight(bossEnemy(bid), { bossId: bid })) w++; }
    const r = Math.round(w / N * 100);
    rates.push(r);
    console.log('    ' + BOSSES[bid].name + '(Lv' + BOSSES[bid].lv + ') vs ' + SECTS[sect].name + 'Lv' + lv + ' → ' + r + '%');
    if (r < 55) errs.push(BOSSES[bid].name + ' vs ' + sect + ' Lv' + lv + ' 胜率过低: ' + r + '%');
    if (r > 99) errs.push(BOSSES[bid].name + ' vs ' + sect + ' Lv' + lv + ' 胜率100%，缺乏挑战');
  });

  // ---- [6] 伙伴战斗增援效果 ----
  let soloW = 0, compW = 0;
  for (let i = 0; i < 40; i++) {
    setup(24, 'shaolin', 2, 2);
    if (autoFight(bossEnemy('jinlunseng'), { bossId: 'jinlunseng' })) soloW++;
  }
  for (let i = 0; i < 40; i++) {
    setup(24, 'shaolin', 2, 2);
    P.compActive = ['suxinger', 'shenguhong'];
    if (autoFight(bossEnemy('jinlunseng'), { bossId: 'jinlunseng' })) compW++;
  }
  console.log('[6] 金轮僧 Lv24少林：无伙伴胜率 ' + Math.round(soloW / 40 * 100) + '%，双伙伴 ' + Math.round(compW / 40 * 100) + '%');
  assert(compW >= soloW, '伙伴未带来胜率提升');

  if (errs.length) { console.error('测试失败:', errs); process.exit(1); }
  console.log('=== 全部测试通过 ===');
  process.exit(0);
})();
`;
eval(gameJs + tests);
