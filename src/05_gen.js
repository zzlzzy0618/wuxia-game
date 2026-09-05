/* ============ 生成器：武学（含五式招法）/ 物品 / 敌人 装配 ============ */

const GEN = {};

// ---------- 武学招法体系 ----------
// 每门武学含五式：一式入门(1.00) / 二式进阶(1.15) / 三式精要(1.30) / 四式奥义(1.45) / 五式大成(1.65)
// 一式即旧版整门武学之力，五式大成为其 1.65 倍，需再修 10 级方可参悟
const MV_MULT = [1.0, 1.15, 1.3, 1.45, 1.65];
const MV_MP = [.65, .8, 1, 1.25, 1.55];
const MV_UNLOCK = [0, 2, 4, 7, 10];   // 招式相对武学等级的解锁偏移
const MV_NAME = ['一式', '二式', '三式', '四式', '五式'];

const CAT_NAME = { rt: '套路', in: '内功', ag: '轻功' };

// 套路招式名池（按兵器类型）
const MOVE_POOLS = {
  剑: ['拨剑式', '回锋撩剑', '流云剑走', '剑气纵横', '万剑归一'],
  刀: ['力劈华山', '回风斩', '连环狂刀', '刀芒断岳', '一刀断魂'],
  拳: ['黑虎掏心', '崩拳连发', '双风贯耳', '拳出如雷', '石破天惊'],
  掌: ['劈空掌', '震山掌', '双掌合璧', '掌影漫天', '开碑裂石'],
  指: ['弹指点穴', '指走偏锋', '金指点脉', '指风如锥', '一指破空'],
  腿: ['扫堂腿', '连环鸳鸯腿', '旋风连环腿', '无影腿影', '腿荡千军'],
  棍: ['横扫千军', '拨草寻蛇', '当头棒喝', '棍影如山', '棍荡八荒'],
  杖: ['横扫千军', '拨草寻蛇', '当头棒喝', '杖影如山', '杖荡八荒'],
  针: ['弹指飞针', '漫天针雨', '飞星逐月', '透骨钉魂', '万针穿心'],
  石: ['弹指飞石', '连珠石雨', '流星赶月', '破空石锥', '石破天惊'],
  箭: ['袖箭激射', '连珠快箭', '破空一箭', '追魂夺命', '箭雨蔽日'],
  袖: ['流云拂袖', '飞袖穿云', '长袖善舞', '袖里乾坤', '拂袖断岳'],
  手: ['探囊取物', '擒拿锁扣', '锁筋错骨', '缠丝擒拿', '空手入白刃'],
  铃: ['银索缠腕', '金铃振响', '索影连环', '飞铃夺魄', '索锁乾坤'],
  诀: ['起手式', '连环进招', '真气贯注', '排山倒海', '神威盖世'],
  通用: ['起手式', '连环进招', '真气贯注', '排山倒海', '神威盖世']
};

// 标志性武学的专属招法（取自原著）
const SIGNATURE_MOVES = {
  shaolin_s12: ['佛光初现', '佛动山河', '佛问迦蓝', '万佛朝宗', '如来神掌'],
  shaolin_s14: ['踏浪而行', '芦苇借力', '轻功水上飘', '一苇渡江', '达摩渡江'],
  wudang_s12: ['剑分阴阳', '真武荡魔', '龟蛇相缠', '七星斩罡', '真武归一'],
  wudang_s14: ['提纵轻灵', '踏云而上', '云梯纵跃', '紫霄飞升', '梯云纵'],
  gumu_s12: ['心惊胆落', '杞人忧天', '无中生有', '拖泥带水', '黯然销魂'],
  gumu_s14: ['踏虚而行', '凌空微步', '御风飞行', '凌虚踏空', '凌虚蹈虚'],
  feidao_s12: ['凝神静气', '袖里乾坤', '飞刀离手', '例不虚发', '一剑封喉'],
  feidao_s14: ['一抄而起', '二度纵身', '三抄掠空', '燕子回翔', '燕子三抄水'],
  yihua_s12: ['玉掌生辉', '明玉映月', '移花接木', '玉宇澄清', '明玉照大千'],
  yihua_s14: ['踏雪寻梅', '雪地无痕', '凌波踏雪', '雪泥鸿爪', '踏雪无痕'],
  gaibang_s12: ['绊', '劈', '缠', '戳', '天下无狗'],
  gaibang_s14: ['旋风起', '落叶纷飞', '狂风怒卷', '扫叶千军', '狂风扫叶'],
  taohua_s12: ['弹指惊雷', '指点江山', '弹指流光', '神通初显', '弹指惊天'],
  taohua_s14: ['步罡踏斗', '五行易位', '奇门遁走', '罡步九宫', '踏罡步斗'],
  lingjiu_s12: ['符出无形', '寒符入体', '生死相缠', '阴阳倒转', '生死符'],
  lingjiu_s14: ['月下穿影', '云间纵跃', '踏月而行', '月华流转', '月影穿云'],
  duan_s12: ['少商剑出', '商阳剑鸣', '中冲剑气', '关冲剑浪', '六剑齐发'],
  duan_s14: ['凌空蹈虚', '气御飞身', '虚步凌云', '御剑而行', '凌空虚度'],
  baiyun_s12: ['剑势如虹', '一剑破空', '流云飞袖', '一剑西来', '天外飞仙'],
  baiyun_s14: ['流光一闪', '天光云影', '流光掠影', '光华万丈', '天际流光'],
  // 隐世绝学
  dugu: ['总诀式', '破剑式', '破刀式', '破气式', '无招胜有招'],
  jiuyin: ['摧坚神爪', '白蟒鞭法', '大伏魔拳', '移魂大法', '九阴归一'],
  jiuyang: ['氤氲紫气', '九阳护体', '纯阳无极', '金刚不坏', '九阳大成'],
  taijiquan: ['揽雀尾', '单鞭', '白鹤亮翅', '云手', '太极归元'],
  wanjianjue: ['剑意凝形', '万剑齐鸣', '剑气如虹', '剑网天罗', '万剑归宗'],
  bixiejianfa: ['辟邪十三剑', '飞燕穿柳', '流星飞堕', '扫荡群魔', '辟邪无双'],
  duoming15: ['一剑封喉', '两剑夺魄', '三剑断魂', '十四剑影', '夺命十五剑'],
  lingbo: ['凌波微步', '微步生尘', '踏罡步斗', '神行百变', '凌波仙踪'],
  beiming: ['北冥吐纳', '鲸吞百川', '真气倒流', '吸功纳气', '北冥大成']
};

// 被动招式名池
const PAS_POOLS = {
  rt: ['招式娴熟', '劲力贯通', '收发自如', '势大力沉', '心随意动', '熟能生巧'],
  in: ['凝气培元', '真气护体', '气走经脉', '生生不息', '丹田气海', '血气调和', '内息绵长', '固本培元'],
  ag: ['轻身提纵', '身法灵动', '步法精妙', '来去如风', '足下生云', '影随身动', '疾如流星', '飘忽无踪']
};

// 被动数值公式（随武学等级成长）
const PAS_VAL = {
  atk: lv => Math.round(1 + lv * .25),
  crt: lv => Math.round((.8 + lv * .3) * 10) / 10,
  atkp: lv => Math.round((2 + lv * .18) * 10) / 10,
  ls: lv => Math.round((3 + lv * .15) * 10) / 10,
  hp: lv => Math.round(3 + lv * .8),
  mp: lv => Math.round(3 + lv * 1.1),
  def: lv => Math.round(1 + lv * .28),
  regen: lv => Math.round((.5 + lv * .06) * 10) / 10,
  mpregen: lv => Math.round(1 + lv * .18),
  dmgred: lv => Math.round((1.2 + lv * .09) * 10) / 10,
  hppct: lv => Math.round((1 + lv * .12) * 10) / 10,
  spd: lv => Math.round(1 + lv * .22),
  dodge: lv => Math.round((.6 + lv * .14) * 10) / 10
};

// 确定性伪随机（以武学 id 为种子）
function seedHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function pickBy(list, seed) { return list[seed % list.length]; }
function pickN(list, seed, n) {
  const out = [];
  let i = 0;
  while (out.length < n && i < 40) { const v = list[(seed + i * 7) % list.length]; if (!out.includes(v)) out.push(v); i++; }
  return out;
}

function r1(x) { return Math.round(x * 10) / 10; }

// 探测武学兵器类型（决定套路招式名池）
function skillTypeOf(name) {
  const keys = ['剑', '刀', '拳', '掌', '指', '腿', '棍', '杖', '针', '石', '箭', '袖', '手', '铃'];
  for (const k of keys) if (name.includes(k)) return k;
  return '通用';
}

// 生成被动招式
function mkPas(cat, seed, lv, boost = 1) {
  let key;
  if (cat === 'rt') {
    key = pickBy(['atk', 'crt', 'atkp', 'ls'], seed);
  } else if (cat === 'in') {
    key = pickBy(['hp', 'mp', 'def', 'regen', 'mpregen'], seed);
  } else {
    key = pickBy(['spd', 'dodge', 'crt'], seed);
  }
  let v = PAS_VAL[key](lv);
  if (boost !== 1) v = key === 'firstCrit' ? v : Math.round(v * boost * 10) / 10;
  return { t: 'pas', fx: { [key]: v } };
}

// 生成五式招法
// rt: 一二四五式为主动（绝招带终结特性），三式为被动
// in: 二式为主动（运功疗伤 / 吞纳真气），其余四式为被动（五式最强）
// ag: 三式为主动（凌空迅击），其余四式为被动（五式最强）
function genMoves(sk) {
  const fx = sk.fx || {}, lv = sk.lv, h = seedHash(sk.id);
  const moves = [];

  if (sk.cat === 'rt') {
    const names = SIGNATURE_MOVES[sk.id] || MOVE_POOLS[skillTypeOf(sk.name)] || MOVE_POOLS.通用;
    // 特性分配：攻击 hint 按序分给 二式 / 四式 / 五式
    const hints = [];
    ['hits', 'critBonus', 'dot', 'lifesteal', 'mpDrain', 'defBuff', 'atkBuff', 'hpCost', 'stun', 'ignoreDef', 'mustHit', 'mustCrit']
      .forEach(k => { if (fx[k]) hints.push([k, fx[k]]); });
    const take = slots => {
      const o = {};
      slots.forEach(idx => { if (hints[idx]) o[hints[idx][0]] = hints[idx][1]; });
      return o;
    };
    moves.push(Object.assign({ name: names[0], t: 'act', mult: r1(sk.mult * MV_MULT[0]), mp: Math.round(sk.mp * MV_MP[0]) }));
    moves.push(Object.assign({ name: names[1], t: 'act', mult: r1(sk.mult * MV_MULT[1]), mp: Math.round(sk.mp * MV_MP[1]) }, take([0])));
    moves.push(Object.assign({ name: names[2], t: 'pas' }, mkPas('rt', h + 3, lv)));
    moves.push(Object.assign({ name: names[3], t: 'act', mult: r1(sk.mult * MV_MULT[3]), mp: Math.round(sk.mp * MV_MP[3]) }, take([1])));
    const fin = Object.assign({ name: names[4], t: 'act', mult: r1(sk.mult * MV_MULT[4]), mp: Math.round(sk.mp * MV_MP[4]) }, take([2, 3]));
    if (!fin.mustCrit && !fin.ignoreDef && !fin.mustHit && !fin.stun) fin.critBonus = 8;
    moves.push(fin);
  } else if (sk.cat === 'in') {
    const sig = SIGNATURE_MOVES[sk.id];
    const pn = i => sig ? sig[i] : PAS_POOLS.in[(h + i * 11) % PAS_POOLS.in.length];
    moves.push(Object.assign({ name: pn(0) }, mkPas('in', h, lv)));
    if (fx.drain) {
      moves.push({ name: sig ? sig[1] : '吞纳真气', t: 'act', mult: r1(sk.mult * .75), mpDrain: Math.round(12 + lv * 1.2), mp: Math.round(sk.mp * .8) });
    } else {
      moves.push({ name: '运功疗伤', t: 'act', mult: 0, heal: Math.round((.14 + lv * .005) * 1000) / 1000, healMp: Math.round((.08 + lv * .003) * 1000) / 1000, mp: Math.round(sk.mp * .9) });
    }
    moves.push(Object.assign({ name: pn(2) }, mkPas('in', h + 11, lv)));
    moves.push(Object.assign({ name: pn(3) }, mkPas('in', h + 29, lv)));
    // 五式 · 神功大成：最强被动（伤害减免 / 气血上限百分比 / 回气），×1.3
    const strongKey = pickBy(['dmgred', 'hppct', 'regen', 'hp'], h + 7);
    const strong = { t: 'pas', fx: {} };
    strong.fx[strongKey] = Math.round(PAS_VAL[strongKey](lv) * 1.3 * 10) / 10;
    moves.push(Object.assign({ name: sig ? sig[4] : '神功大成' }, strong));
  } else {
    const sig = SIGNATURE_MOVES[sk.id];
    const pn = i => sig ? sig[i] : PAS_POOLS.ag[(h + i * 11) % PAS_POOLS.ag.length];
    moves.push(Object.assign({ name: pn(0) }, mkPas('ag', h, lv)));
    moves.push(Object.assign({ name: pn(1) }, mkPas('ag', h + 11, lv)));
    const swift = { name: sig ? sig[2] : '凌空一击', t: 'act', mult: r1(sk.mult * .9), hits: 2, mp: Math.round(sk.mp * .7) };
    if (fx.mustHit) swift.mustHit = 1;
    moves.push(swift);
    moves.push(Object.assign({ name: pn(3) }, mkPas('ag', h + 29, lv)));
    // 五式 · 绝顶轻功：高阶（23级+）附带「首击必暴」，否则大幅身法/闪避
    const fin = { name: sig ? sig[4] : '轻功大成', t: 'pas', fx: {} };
    if (lv >= 23 && (h % 2 === 0)) fin.fx.firstCrit = 1;
    else {
      const k = pickBy(['spd', 'dodge'], h + 7);
      fin.fx[k] = Math.round(PAS_VAL[k](lv) * 1.4 * 10) / 10;
    }
    moves.push(fin);
  }
  moves.forEach((m, i) => { m.mv = i + 1; m.unlock = sk.lv + MV_UNLOCK[i]; });
  return moves;
}

function moveFxDesc(m) {
  if (m.t === 'pas') {
    const D = {
      atk: v => `攻击 +${v}`, crt: v => `暴击 +${v}%`, atkp: v => `攻击 +${v}%`, ls: v => `攻击吸血 ${v}%`,
      hp: v => `气血上限 +${v}`, mp: v => `内力上限 +${v}`, def: v => `防御 +${v}`,
      regen: v => `每回合回复 ${v}% 气血`, mpregen: v => `每回合回复内力 +${v}`,
      dmgred: v => `受到伤害 -${v}%`, hppct: v => `气血上限 +${v}%`,
      spd: v => `身法 +${v}`, dodge: v => `闪避 +${v}%`, firstCrit: () => '每战首次出手必定会心'
    };
    return Object.entries(m.fx).map(([k, v]) => D[k] ? D[k](v) : k).join('，');
  }
  const parts = [];
  if (m.heal) parts.push(`回复${Math.round(m.heal * 100)}%气血${m.healMp ? `、${Math.round(m.healMp * 100)}%内力` : ''}`);
  if (m.hits > 1) parts.push(m.hits + '连击');
  if (m.critBonus) parts.push('暴击+' + m.critBonus + '%');
  if (m.mustHit) parts.push('必中');
  if (m.mustCrit) parts.push('必暴击');
  if (m.ignoreDef) parts.push('无视防御');
  if (m.stun) parts.push('震慑几率' + Math.round(m.stun * 100) + '%');
  if (m.lifesteal) parts.push('吸取' + Math.round(m.lifesteal * 100) + '%伤害为气血');
  if (m.mpDrain) parts.push('吸取内力' + m.mpDrain);
  if (m.defBuff) parts.push('护体' + m.defBuff + '回合');
  if (m.atkBuff) parts.push('增攻' + m.atkBuff + '回合');
  if (m.hpCost) parts.push('自损' + Math.round(m.hpCost * 100) + '%气血');
  if (m.dot) parts.push('施毒(每回合' + Math.round(m.dot * 100) + '%攻击)');
  return parts.join('，') || '寻常招式';
}

// —— 武学装配 ——
// SKILLS: id -> {id, name, cat, lv, mp, mult, kind, supreme, sect, moves[5], desc}
// 出身体系：门派嫡传根基纯正，胜过江湖杂学；隐世绝学可遇不可求，
// 其中八部「绝世神功」冠绝江湖，为全游戏最强武学
const SKILL_ORIGIN = {
  sect:    { mult: 1,   pas: 1.15, tag: '门派嫡传' },
  univ:    { mult: .82, pas: .92,  tag: '江湖流传' },
  hidden:  { mult: 1,   pas: 1.08, tag: '隐世所藏' },
  supreme: { mult: 1.1, pas: 1.28, tag: '绝世神功' }
};
GEN.buildSkills = function () {
  const S = {
    basic: { id: 'basic', name: '普通攻击', cat: 'rt', mp: 0, mult: 1.0, lv: 1, kind: 'basic', moves: null, desc: '拳脚兵刃招呼，不耗内力。' }
  };
  const build = (id, name, cat, t, fx, kind, sect, supreme) => {
    const org = SKILL_ORIGIN[supreme ? 'supreme' : kind] || SKILL_ORIGIN.sect;
    const sk = {
      id, name, cat, kind, supreme: !!supreme, sect: sect || null,
      lv: t.lv, mp: t.mp,
      mult: Math.round(t.mult * ((fx && fx.mult) || 1) * org.mult * 100) / 100,
      fx: fx || {}
    };
    sk.moves = genMoves(sk);
    // 被动招式数值随出身增减（firstCrit 例外）
    sk.moves.forEach(m => {
      if (m.t !== 'pas' || !m.fx) return;
      Object.keys(m.fx).forEach(k => {
        if (k === 'firstCrit') return;
        m.fx[k] = Math.round(m.fx[k] * org.pas * 10) / 10;
      });
    });
    const bestAct = sk.moves.filter(m => m.t === 'act' && m.mult > 0).reduce((a, b) => (b.mult * (b.hits || 1)) > (a.mult * (a.hits || 1)) ? b : a, { mult: 0, hits: 1 });
    const body = cat === 'in'
      ? `内功心法，五式招法蕴养生克敌之妙。`
      : cat === 'ag'
        ? `轻功身法，身轻如燕，来去如风。`
        : `套路武学，绝招「${bestAct.name}」威力 ${Math.round(bestAct.mult * (bestAct.hits || 1) * 100) / 100} 倍。`;
    sk.desc = `${org.tag} · ${body}`;
    return sk;
  };
  // 门派武学（按槽位序列分类）
  Object.entries(SECTS).forEach(([sectId, sect]) => {
    sect.skills.forEach((def, i) => {
      const [name, fx] = def;
      const id = sectId + '_s' + i;
      S[id] = build(id, name, SECT_SKILL_CATS[i], SKILL_TIERS[i], fx || {}, 'sect', sectId);
    });
  });
  // 通用武学（秘籍习得）：江湖杂学，阶级封顶、威力打折，逊于门派嫡传
  UNIVERSAL_SKILLS.forEach((def, i) => {
    const [name, fx] = def;
    const t = SKILL_TIERS[Math.min(i * 2, 10)];
    S['univ' + i] = build('univ' + i, name, fx.cat, t, fx, 'univ');
  });
  // 隐世武学：24 部寻常隐学（仍逊于本门至高武学）+ 8 部绝世神功（全游戏最强）
  const SUPREME_HIDDEN = ['jiuyang', 'jiuyin', 'dugu', 'beiming', 'qiankun', 'taixuan', 'shenzhao', 'longxiang'];
  Object.entries(HIDDEN_SKILLS).forEach(([id, def]) => {
    const [name, fx] = def;
    const sup = SUPREME_HIDDEN.includes(id);
    const t = sup ? { lv: 29, mult: SKILL_TIERS[14].mult, mp: 82 } : { lv: 25, mult: SKILL_TIERS[10].mult, mp: 52 };
    S[id] = build(id, name, fx.cat, { lv: fx.lv || t.lv, mult: t.mult, mp: t.mp }, fx, 'hidden', null, sup);
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
        name: (ATIER_PREFIX[tr] || '') + shape, cat: 'equip', slot: 'armor', tier: tr + 1, lv: ATIER_LV[tr],
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
  // 头饰/护腕/鞋子/戒指/腰带 5×3×5=75（独立装备槽）
  const ECN = { atk: '攻击', def: '防御', spd: '身法', crt: '暴击', hp: '气血上限', mp: '内力上限' };
  EXTRA_EQUIP.forEach(eq => {
    eq.shapes.forEach((shape, si) => {
      for (let tr = 0; tr < 5; tr++) {
        const o = {
          name: (eq.pre[tr] || '') + shape, cat: 'equip', slot: eq.key, tier: tr + 1, lv: ETIER_LV[tr],
          price: ETIER_PRICE[tr]
        };
        o[eq.main] = eq.mv[tr];
        let d = `${ECN[eq.main]} +${eq.mv[tr]}`;
        if (eq.sv) { o[eq.sub] = eq.sv[tr]; d += `，${ECN[eq.sub]} +${eq.sv[tr]}`; }
        o.desc = `${o.name}——${d}。`;
        add(eq.abbr + '_' + si + '_' + tr, o);
      }
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
      price: 800 + i * 150, desc: `研读可习得「${skillName}」（江湖${CAT_NAME[def[1].cat]}武学）。`
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
