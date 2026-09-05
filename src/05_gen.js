/* ============ 生成器：武学 / 物品 / 敌人 装配 ============ */

const GEN = {};

// —— 武学装配 ——
// SKILLS: id -> {id, name, lv, mp, mult, hits, critBonus, mustHit, mustCrit, ignoreDef, stun, lifesteal, mpDrain, heal, healMp, defBuff, atkBuff, hpCost, dot, kind, desc}
GEN.buildSkills = function () {
  const S = {
    basic: { id: 'basic', name: '普通攻击', mp: 0, mult: 1.0, lv: 1, kind: 'basic', desc: '拳脚兵刃招呼，不耗内力。' }
  };
  const fxDesc = sk => {
    const parts = [];
    if (sk.hits > 1) parts.push(sk.hits + '连击');
    if (sk.critBonus) parts.push('暴击+' + sk.critBonus + '%');
    if (sk.mustHit) parts.push('必中');
    if (sk.mustCrit) parts.push('必暴击');
    if (sk.ignoreDef) parts.push('无视防御');
    if (sk.stun) parts.push('震慑几率' + Math.round(sk.stun * 100) + '%');
    if (sk.lifesteal) parts.push('吸取' + Math.round(sk.lifesteal * 100) + '%伤害为气血');
    if (sk.mpDrain) parts.push('吸取内力' + sk.mpDrain);
    if (sk.heal) parts.push('回复' + Math.round(sk.heal * 100) + '%气血');
    if (sk.healMp) parts.push('回复' + Math.round(sk.healMp * 100) + '%内力');
    if (sk.defBuff) parts.push('护体' + sk.defBuff + '回合');
    if (sk.atkBuff) parts.push('增攻' + sk.atkBuff + '回合');
    if (sk.hpCost) parts.push('自损' + Math.round(sk.hpCost * 100) + '%气血');
    if (sk.dot) parts.push('施毒(每回合' + Math.round(sk.dot * 100) + '%攻击)');
    return parts.join('，');
  };
  // 门派武学
  Object.entries(SECTS).forEach(([sectId, sect]) => {
    sect.skills.forEach((def, i) => {
      const [name, fx] = def;
      const t = SKILL_TIERS[i];
      const id = sectId + '_s' + i;
      S[id] = Object.assign({ id, name, lv: t.lv, mp: t.mp, mult: t.mult, kind: 'sect', sect: sectId }, fx || {});
      S[id].desc = fxDesc(S[id]) || (S[id].heal ? '疗伤武学。' : '攻伐武学。');
    });
  });
  // 通用武学（秘籍）
  UNIVERSAL_SKILLS.forEach((def, i) => {
    const [name, fx] = def;
    const t = SKILL_TIERS[Math.min(i * 2, 14)];
    const id = 'univ' + i;
    S[id] = Object.assign({ id, name, lv: t.lv, mp: t.mp, mult: t.mult, kind: 'univ' }, fx);
    if (fx.mult) S[id].mult = t.mult * fx.mult;
    S[id].desc = fxDesc(S[id]) || '江湖常见武学。';
  });
  // 隐世武学
  Object.entries(HIDDEN_SKILLS).forEach(([id, def]) => {
    const [name, fx] = def;
    const t = SKILL_TIERS[13];
    S[id] = Object.assign({ id, name, lv: fx.lv || t.lv, mp: t.mp, mult: t.mult, kind: 'hidden' }, fx);
    if (fx.mult) S[id].mult = t.mult * fx.mult;
    S[id].desc = '隐世绝学：' + fxDesc(S[id]);
  });
  return S;
};

// —— 物品装配 ——
// ITEMS: id -> {id, name, cat, slot, lv, price, sell, atk/def/..., desc}
GEN.buildItems = function () {
  const I = {};
  const add = (id, o) => { I[id] = Object.assign({ id }, o); };
  // 武器 12×6=72
  WTYPES.forEach(([type, coef], ti) => {
    for (let tr = 0; tr < 5; tr++) {
      const atk = Math.round(WTIER_ATK[tr] * coef);
      const name = (tr === 0 ? '铁' + type : WTIER_PREFIX[tr] + type);
      add('w_' + ti + '_' + tr, {
        name, cat: 'equip', slot: 'weapon', tier: tr + 1, lv: WTIER_LV[tr],
        atk, price: Math.round((60 + tr * 260) * coef * (1 + tr * .1)),
        desc: `${name}——攻击 +${atk}。`
      });
    }
    add('w_' + ti + '_5', {
      name: WDIVINE[type], cat: 'equip', slot: 'weapon', tier: 6, lv: 40,
      atk: Math.round(75 * coef), price: 26000, divine: true,
      desc: `神兵「${WDIVINE[type]}」——攻击 +${Math.round(75 * coef)}。需以剑魂于铸剑山庄锻造而得。`
    });
  });
  // 防具 8×5=40
  ATYPES.forEach((shape, si) => {
    for (let tr = 0; tr < 3; tr++) {
      const def = Math.round(ATYPE_DEF[si] * ATIER_DEF[tr] * 1.2);
      add('a_' + si + '_' + tr, {
        name: ATIER_PREFIX[tr] + shape, cat: 'equip', slot: 'armor', tier: tr + 1, lv: ATIER_LV[tr],
        def, price: 50 + tr * 240,
        desc: `${ATIER_PREFIX[tr] || ''}${shape}——防御 +${def}。`
      });
    }
    for (let hi = 0; hi < 2; hi++) {
      const h = ATIER_HIGH[hi];
      const def = Math.round(ATYPE_DEF[si] * (4.6 + hi * 1.6) * 1.2);
      const name = (A_METAL.includes(shape) ? h.p : h.m) + shape;
      add('a_' + si + '_' + (3 + hi), {
        name, cat: 'equip', slot: 'armor', tier: 4 + hi, lv: h.lv,
        def, price: 1800 + hi * 2400,
        desc: `${name}——防御 +${def}。`
      });
    }
  });
  // 饰品 12×3=36
  ACC_TYPES.forEach(([, names, fx, vals], ti) => {
    const FXDESC = {
      hp: v => `气血上限 +${v * 3}`, atk: v => `攻击 +${v}`, crt: v => `暴击 +${v}%`,
      mp: v => `内力上限 +${v * 2}`, spd: v => `身法 +${v}`, regen: v => `每回合回复 ${v}% 气血`,
      atkp: v => `攻击 +${v}%`, def: v => `防御 +${v}`, atkspd: v => `攻击 +${v}、身法 +${v}`,
      spdcrt: v => `身法 +${v}、暴击 +${v}%`, defspd: v => `防御 +${v}、身法 +${v}`, hpmp: v => `气血 +${v * 2}、内力 +${v}`
    };
    names.forEach((name, tr) => {
      add('acc_' + ti + '_' + tr, {
        name, cat: 'equip', slot: 'acc', tier: tr + 1, lv: [5, 18, 32][tr],
        price: [220, 900, 3200][tr], fx, fxv: vals[tr],
        desc: `${name}——${FXDESC[fx](vals[tr])}。`
      });
    });
  });
  // 特殊装备（头目掉落）
  add('w_tiejian', { name: '精钢长剑', cat: 'equip', slot: 'weapon', tier: 2, lv: 4, atk: 10, price: 200, desc: '周霸的佩剑——攻击 +10。' });
  add('w_poJunjian', { name: '破军剑', cat: 'equip', slot: 'weapon', tier: 4, lv: 14, atk: 26, price: 1200, desc: '剑痴遗物，杀气凛然——攻击 +26。' });
  add('a_ruanweijia', { name: '软猬甲', cat: 'equip', slot: 'armor', tier: 4, lv: 28, def: 26, price: 3000, desc: '千枚倒钩，刀枪难入——防御 +26。' });
  add('acc_yuxiao', { name: '碧玉箫', cat: 'equip', slot: 'acc', tier: 2, lv: 11, fx: 'spdcrt', fxv: 2, price: 1500, desc: '桃花岛主随身玉箫，箫声起处落英缤纷——身法 +2、暴击 +2%。' });
  // 丹药 24
  Object.entries(POTIONS).forEach(([id, p]) => {
    add('pot_' + id, { name: p.name, cat: 'pot', price: p.price, pot: id, desc: p.desc });
  });
  // 材料 40
  Object.entries(MATS).forEach(([kind, list]) => {
    list.forEach((name, i) => {
      const tier = MAT_TIER[i];
      add('mat_' + kind + '_' + i, {
        name, cat: 'mat', mtier: tier, price: 20 * tier * tier,
        desc: `锻造材料（${tier}阶）——${name}。`
      });
    });
  });
  // 珍宝 50
  TREASURES.forEach((name, i) => {
    const v = [120, 260, 550, 1200, 2600][i % 5];
    add('tr_' + i, { name, cat: 'trs', sell: v, price: v, desc: `珍玩——可售 ${v} 两银子。` });
  });
  // 秘籍 20（与通用武学一一对应，研读习得）
  UNIVERSAL_SKILLS.forEach((def, i) => {
    const skillName = def[0];
    add('book_univ' + i, {
      name: '秘籍 · ' + BOOK_NAMES[skillName], cat: 'book', bookSkill: 'univ' + i,
      price: 800 + i * 150, desc: `研读可习得「${skillName}」。`
    });
  });
  // 奇物 18
  Object.entries(SPECIALS).forEach(([id, sp]) => {
    add('sp_' + id, { name: sp.name, cat: 'sp', sell: 1500, price: 1500, desc: sp.desc });
  });
  return I;
};

// —— 敌人生成 ——
GEN.mkEnemy = function (name, lv, o = {}) {
  return Object.assign({
    name, lv,
    hpMax: Math.round((38 + lv * 22) * (o.hpMul || 1)),
    atk: Math.round((7 + lv * 3.4) * (o.atkMul || 1)),
    def: Math.round((2 + lv * 1.7) * (o.defMul || 1)),
    spd: Math.round((4 + lv * 1.15) * (o.spdMul || 1)),
    crt: o.crt || 4,
    exp: Math.round((16 + lv * 10) * (o.expMul || 1)),
    silver: Math.round((9 + lv * 8) * (o.silMul || 1)),
    skills: o.skills || [],
    flavor: o.flavor || '',
    elite: !!o.elite
  }, o.extra || {});
};
// 按地图生成 4 只怪
GEN.mapEnemies = function (map) {
  const pool = ENEMY_POOLS[map.region];
  const names = shuffle(pool).slice(0, 4);
  return names.map(n => GEN.mkEnemy(n, map.lv + rnd(-1, 1), {
    flavor: pick(['来者何人！', '识相的留下买路财！', '又是一个不知死活的！', '纳命来！', '哼，多管闲事的家伙。'])
  }));
};
