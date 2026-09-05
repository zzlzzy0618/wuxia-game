/* ============ 数据：十大门派 & 武学体系（套路 / 内功 / 轻功 三系） ============ */

// 武学阶级模板：15 阶，决定等级 / 基础威力 / 基础耗蓝
// 每门武学含五式招法：一式入门、二式进阶、三式精要、四式奥义、五式大成绝招
// （招式威力 = 阶级威力 × 招式系数，见 05_gen.js）
const SKILL_TIERS = [
  { lv: 1,  mult: 1.15, mp: 5 },  { lv: 3,  mult: 1.30, mp: 8 },
  { lv: 5,  mult: 1.45, mp: 12 }, { lv: 7,  mult: 1.60, mp: 16 },
  { lv: 9,  mult: 1.75, mp: 20 }, { lv: 11, mult: 1.95, mp: 25 },
  { lv: 13, mult: 2.15, mp: 30 }, { lv: 15, mult: 2.35, mp: 35 },
  { lv: 17, mult: 2.55, mp: 40 }, { lv: 19, mult: 2.80, mp: 45 },
  { lv: 21, mult: 3.05, mp: 51 }, { lv: 23, mult: 3.30, mp: 57 },
  { lv: 25, mult: 3.55, mp: 63 }, { lv: 27, mult: 3.85, mp: 70 },
  { lv: 29, mult: 4.20, mp: 78 }
];

// 门派 15 门武学的槽位分类序列：8 套路(rt) + 4 内功(in) + 3 轻功(ag)
// 交错排布，保证早中晚期皆有新武学可学
const SECT_SKILL_CATS = ['rt', 'rt', 'in', 'rt', 'ag', 'rt', 'rt', 'in', 'rt', 'ag', 'rt', 'in', 'rt', 'in', 'ag'];

const SECTS = {
  shaolin: {
    name: '少林派', tag: '外功 · 刚猛', passive: { id: 'iron', text: '金刚不坏 · 受到的伤害 -10%' },
    desc: '天下武功出少林。铜皮铁骨，拳掌开碑，气血防御冠绝江湖。',
    base: { hp: 135, mp: 50, atk: 14, def: 9, spd: 6, crt: 5 },
    grow: { hp: 24, mp: 8, atk: 3.5, def: 2.6, spd: .8, crt: .8 },
    skills: [
      /* s0 rt */ ['少林长拳'],
      /* s1 rt */ ['罗汉拳', { critBonus: 4 }],
      /* s2 in */ ['坐禅心法'],
      /* s3 rt */ ['韦陀掌', { stun: .12 }],
      /* s4 ag */ ['轻身术'],
      /* s5 rt */ ['拈花指', { stun: .18 }],
      /* s6 rt */ ['伏虎拳', { hits: 2 }],
      /* s7 in */ ['袈裟伏魔功'],
      /* s8 rt */ ['大力金刚掌', { stun: .22 }],
      /* s9 ag */ ['飞絮身法'],
      /* s10 rt */ ['千手如来掌', { hits: 3 }],
      /* s11 in */ ['金刚不坏体'],
      /* s12 rt */ ['如来神掌', { mustCrit: 1 }],
      /* s13 in */ ['易筋经'],
      /* s14 ag */ ['一苇渡江']
    ]
  },
  wudang: {
    name: '武当派', tag: '内功 · 绵长', passive: { id: 'regen', text: '道家真气 · 每回合额外恢复内力' },
    desc: '以柔克刚，以慢打快。真气悠长，守中带攻，越战越强。',
    base: { hp: 124, mp: 72, atk: 13, def: 7, spd: 8, crt: 6 },
    grow: { hp: 20, mp: 15, atk: 3.1, def: 2.15, spd: 1.0, crt: 1.0 },
    skills: [
      /* s0 rt */ ['武当长拳'],
      /* s1 rt */ ['绵掌'],
      /* s2 in */ ['纯阳功'],
      /* s3 rt */ ['武当剑法', { critBonus: 3 }],
      /* s4 ag */ ['蹑云踪'],
      /* s5 rt */ ['神门十三剑', { hits: 2 }],
      /* s6 rt */ ['绕指柔剑', { critBonus: 6 }],
      /* s7 in */ ['无极玄功'],
      /* s8 rt */ ['太极剑', { defBuff: 2 }],
      /* s9 ag */ ['神行无踪'],
      /* s10 rt */ ['玄虚刀法', { dot: .1 }],
      /* s11 in */ ['倚天屠龙功'],
      /* s12 rt */ ['真武剑诀', { ignoreDef: 1 }],
      /* s13 in */ ['纯阳无极功'],
      /* s14 ag */ ['梯云纵']
    ]
  },
  gumu: {
    name: '古墓派', tag: '身法 · 轻灵', passive: { id: 'dodge', text: '灵动身法 · 闪避几率 +8%' },
    desc: '幽居寒潭，不染尘埃。剑法轻灵如燕，闪避暴击双绝。',
    base: { hp: 108, mp: 60, atk: 15, def: 5, spd: 12, crt: 10 },
    grow: { hp: 18, mp: 12, atk: 3.8, def: 1.7, spd: 1.8, crt: 1.6 },
    skills: [
      /* s0 rt */ ['美女拳法', { critBonus: 6 }],
      /* s1 rt */ ['天罗地网势', { hits: 2 }],
      /* s2 in */ ['寒玉心法'],
      /* s3 rt */ ['玉女剑法', { critBonus: 4 }],
      /* s4 ag */ ['捕雀功'],
      /* s5 rt */ ['银索金铃', { hits: 2 }],
      /* s6 rt */ ['玉蜂针', { dot: .12 }],
      /* s7 in */ ['玉女心经'],
      /* s8 rt */ ['冰魄银针', { dot: .18 }],
      /* s9 ag */ ['灵狐身法'],
      /* s10 rt */ ['玉女素心剑', { hits: 2, critBonus: 6 }],
      /* s11 in */ ['玄阴真气'],
      /* s12 rt */ ['黯然销魂掌', { critBonus: 12 }],
      /* s13 in */ ['太阴归元功'],
      /* s14 ag */ ['凌虚踏风']
    ]
  },
  feidao: {
    name: '飞刀门', tag: '暗器 · 致命', passive: { id: 'crit', text: '例无虚发 · 暴击几率 +10%' },
    desc: '小李飞刀，例无虚发。不求守御，但求一击毙命，天下无双。',
    base: { hp: 95, mp: 55, atk: 19, def: 4, spd: 10, crt: 13 },
    grow: { hp: 15, mp: 10, atk: 4.6, def: 1.3, spd: 1.2, crt: 2.2 },
    skills: [
      /* s0 rt */ ['飞蝗石'],
      /* s1 rt */ ['袖箭', { critBonus: 3 }],
      /* s2 in */ ['吐纳静心诀'],
      /* s3 rt */ ['飞刀术', { critBonus: 6 }],
      /* s4 ag */ ['疾风身法'],
      /* s5 rt */ ['追魂夺命剑', { hits: 2 }],
      /* s6 rt */ ['流云飞袖', { hits: 2 }],
      /* s7 in */ ['凝神诀'],
      /* s8 rt */ ['漫天花雨', { hits: 3 }],
      /* s9 ag */ ['追星逐月'],
      /* s10 rt */ ['流星赶月', { hits: 2, critBonus: 8 }],
      /* s11 in */ ['听风辨器'],
      /* s12 rt */ ['小李飞刀', { mustHit: 1, mustCrit: 1 }],
      /* s13 in */ ['剑心通明'],
      /* s14 ag */ ['燕子三抄水', { mustHit: 1 }]
    ]
  },
  yihua: {
    name: '移花宫', tag: '奇功 · 诡谲', passive: { id: 'onkill', text: '明玉真气 · 击杀敌人回复两成气血' },
    desc: '移花接玉，夺人功力。出手看似轻描淡写，实则杀机四伏。',
    base: { hp: 110, mp: 66, atk: 15, def: 6, spd: 9, crt: 8 },
    grow: { hp: 17, mp: 13, atk: 3.6, def: 1.7, spd: 1.3, crt: 1.3 },
    skills: [
      /* s0 rt */ ['移花诀'],
      /* s1 rt */ ['落花掌'],
      /* s2 in */ ['移花心法'],
      /* s3 rt */ ['飞花摘叶', { hits: 2 }],
      /* s4 ag */ ['落英身法'],
      /* s5 rt */ ['碎玉掌', { critBonus: 5 }],
      /* s6 rt */ ['玉碎昆冈', { hpCost: .06 }],
      /* s7 in */ ['明玉诀', { drain: 1 }],
      /* s8 rt */ ['焚玉掌', { dot: .12, hpCost: .08 }],
      /* s9 ag */ ['惊鸿照影'],
      /* s10 rt */ ['移花接玉', { lifesteal: .3 }],
      /* s11 in */ ['嫁衣神功'],
      /* s12 rt */ ['明玉掌', { lifesteal: .4 }],
      /* s13 in */ ['明玉功', { drain: 1 }],
      /* s14 ag */ ['踏雪无痕']
    ]
  },
  gaibang: {
    name: '丐帮', tag: '掌法 · 豪勇', passive: { id: 'rage', text: '醉侠血性 · 气血低于三成时攻击 +25%' },
    desc: '天下第一大帮，帮众遍九州。降龙掌刚猛无俦，打狗棒变化精奇。',
    base: { hp: 125, mp: 58, atk: 16, def: 7, spd: 7, crt: 7 },
    grow: { hp: 21, mp: 10, atk: 3.9, def: 2.1, spd: 1.0, crt: 1.1 },
    skills: [
      /* s0 rt */ ['太祖长拳'],
      /* s1 rt */ ['莲花掌'],
      /* s2 in */ ['丐帮心法'],
      /* s3 rt */ ['疯魔杖法', { stun: .12 }],
      /* s4 ag */ ['铁帚腿法'],
      /* s5 rt */ ['逍遥游', { critBonus: 5 }],
      /* s6 rt */ ['蟠龙棍法', { hits: 2 }],
      /* s7 in */ ['醉侠心法'],
      /* s8 rt */ ['龙战于野', { hits: 2 }],
      /* s9 ag */ ['醉仙步'],
      /* s10 rt */ ['潜龙勿用', { stun: .25 }],
      /* s11 in */ ['混元一气功'],
      /* s12 rt */ ['打狗棒法', { hits: 2, stun: .18 }],
      /* s13 in */ ['潜龙诀'],
      /* s14 ag */ ['狂风扫叶腿']
    ]
  },
  taohua: {
    name: '桃花岛', tag: '奇门 · 五行', passive: { id: 'opening', text: '奇门遁甲 · 战斗开始随机获得增益三回合' },
    desc: '东海桃花岛，五行奇门，音律算学无所不通，武功更是清奇瑰丽。',
    base: { hp: 100, mp: 64, atk: 14, def: 6, spd: 11, crt: 9 },
    grow: { hp: 16, mp: 13, atk: 3.4, def: 1.6, spd: 1.6, crt: 1.4 },
    skills: [
      /* s0 rt */ ['碧波掌法'],
      /* s1 rt */ ['玉箫剑法', { critBonus: 4 }],
      /* s2 in */ ['桃源内息'],
      /* s3 rt */ ['落英神剑掌', { hits: 2 }],
      /* s4 ag */ ['落花身法'],
      /* s5 rt */ ['兰花拂穴手', { stun: .18 }],
      /* s6 rt */ ['落英剑法', { hits: 3 }],
      /* s7 in */ ['五行轮转'],
      /* s8 rt */ ['弹指神通', { critBonus: 10 }],
      /* s9 ag */ ['云步仙踪'],
      /* s10 rt */ ['碧海生潮', { hits: 2, dot: .1 }],
      /* s11 in */ ['奇门心法'],
      /* s12 rt */ ['弹指惊天', { mustHit: 1 }],
      /* s13 in */ ['碧海潮生曲'],
      /* s14 ag */ ['踏罡步斗']
    ]
  },
  lingjiu: {
    name: '灵鹫宫', tag: '天山 · 冰雪', passive: { id: 'regenhp', text: '天池真气 · 每回合回复 3% 气血' },
    desc: '缥缈峰灵鹫宫，天山折梅手包罗万招，生死符一出，群雄束手。',
    base: { hp: 110, mp: 70, atk: 15, def: 6, spd: 9, crt: 8 },
    grow: { hp: 18, mp: 14, atk: 3.5, def: 1.7, spd: 1.2, crt: 1.2 },
    skills: [
      /* s0 rt */ ['灵鹫掌法'],
      /* s1 rt */ ['雪影掌', { critBonus: 4 }],
      /* s2 in */ ['天池真气'],
      /* s3 rt */ ['折梅手'],
      /* s4 ag */ ['雪地飞鸿'],
      /* s5 rt */ ['天山六阳掌', { critBonus: 6 }],
      /* s6 rt */ ['寒冰绵掌', { dot: .12 }],
      /* s7 in */ ['六阳融雪'],
      /* s8 rt */ ['白虹掌力', { critBonus: 8 }],
      /* s9 ag */ ['缥缈身法'],
      /* s10 rt */ ['天山折梅手', { hits: 2 }],
      /* s11 in */ ['小无相功'],
      /* s12 rt */ ['生死符', { dot: .22, mustHit: 1 }],
      /* s13 in */ ['八荒六合唯我独尊功'],
      /* s14 ag */ ['月影穿云']
    ]
  },
  duan: {
    name: '大理段氏', tag: '剑气 · 皇族', passive: { id: 'royal', text: '皇族血脉 · 气血上限 +10%，丹药效果 +30%' },
    desc: '天南皇族，家传一阳指与六脉神剑，以指力化剑气，冠绝当世。',
    base: { hp: 120, mp: 62, atk: 15, def: 7, spd: 8, crt: 7 },
    grow: { hp: 20, mp: 12, atk: 3.4, def: 2.2, spd: 1.0, crt: 1.0 },
    skills: [
      /* s0 rt */ ['段家剑法'],
      /* s1 rt */ ['天南掌法'],
      /* s2 in */ ['段氏罡气'],
      /* s3 rt */ ['一阳指', { critBonus: 6 }],
      /* s4 ag */ ['天南步法'],
      /* s5 rt */ ['六脉神剑 · 少商剑', { critBonus: 8 }],
      /* s6 rt */ ['六脉神剑 · 中冲剑', { hits: 2 }],
      /* s7 in */ ['一阳玄功'],
      /* s8 rt */ ['剑气纵横', { hits: 2 }],
      /* s9 ag */ ['飞凤回翔'],
      /* s10 rt */ ['六脉神剑 · 少泽剑', { stun: .2 }],
      /* s11 in */ ['枯荣禅功'],
      /* s12 rt */ ['六剑齐发', { hits: 3 }],
      /* s13 in */ ['六脉心诀'],
      /* s14 ag */ ['凌空虚度']
    ]
  },
  baiyun: {
    name: '白云城', tag: '剑客 · 孤高', passive: { id: 'firstcrit', text: '紫禁之巅 · 每场战斗首次出手必暴击' },
    desc: '白云城主叶氏，世居海外仙城。月圆之夜，紫禁之巅，一剑西来，天外飞仙。',
    base: { hp: 95, mp: 58, atk: 17, def: 5, spd: 11, crt: 11 },
    grow: { hp: 15, mp: 11, atk: 4.2, def: 1.4, spd: 1.5, crt: 1.8 },
    skills: [
      /* s0 rt */ ['白云剑法'],
      /* s1 rt */ ['浮云剑式', { critBonus: 4 }],
      /* s2 in */ ['明月真气'],
      /* s3 rt */ ['拂柳剑法', { critBonus: 6 }],
      /* s4 ag */ ['流云身法'],
      /* s5 rt */ ['停云剑式', { critBonus: 8 }],
      /* s6 rt */ ['追星赶月', { hits: 2 }],
      /* s7 in */ ['御剑玄功'],
      /* s8 rt */ ['青冥剑气', { critBonus: 10 }],
      /* s9 ag */ ['踏月留香'],
      /* s10 rt */ ['断云式', { critBonus: 12 }],
      /* s11 in */ ['天外流云诀'],
      /* s12 rt */ ['一剑西来', { mustHit: 1 }],
      /* s13 in */ ['剑皇心诀'],
      /* s14 ag */ ['天际流光']
    ]
  }
};

// 通用武学（秘籍习得，20 种：12 套路 + 5 内功 + 3 轻功）
const UNIVERSAL_SKILLS = [
  ['基础剑法', { cat: 'rt', mult: .9 }], ['基础刀法', { cat: 'rt', mult: .9 }], ['基础掌法', { cat: 'rt', mult: .9 }],
  ['混元功', { cat: 'in' }], ['吐纳术', { cat: 'in' }], ['铁砂掌', { cat: 'rt', stun: .12 }],
  ['大伏虎拳', { cat: 'rt', mult: 1.1 }], ['金钟罩', { cat: 'in' }], ['铁布衫', { cat: 'in' }],
  ['八段锦', { cat: 'in' }], ['太祖棍法', { cat: 'rt', mult: 1.15 }],
  ['燕青拳', { cat: 'rt', hits: 2 }], ['八极拳', { cat: 'rt', stun: .18 }], ['形意拳', { cat: 'rt', critBonus: 8 }],
  ['八卦掌', { cat: 'rt', hits: 2 }], ['劈挂掌', { cat: 'rt', mult: 1.2 }],
  ['佛山无影脚', { cat: 'rt', hits: 3 }],
  ['壁虎游墙', { cat: 'ag' }], ['草上飞', { cat: 'ag' }], ['踏浪行', { cat: 'ag' }]
];

// 隐世武学（奇遇/头目习得，32 种：19 套路 + 11 内功 + 2 轻功）
const HIDDEN_SKILLS = {
  jiuyang:      ['九阳神功', { cat: 'in' }],
  jiuyin:       ['九阴真经', { cat: 'in' }],
  dugu:         ['独孤九剑', { cat: 'rt', ignoreDef: 1, mustCrit: 1 }],
  beiming:      ['北冥神功', { cat: 'in', drain: 1, mult: 1.2 }],
  qiankun:      ['乾坤大挪移', { cat: 'in' }],
  taixuan:      ['太玄经', { cat: 'in' }],
  shenzhao:     ['神照经', { cat: 'in' }],
  longxiang:    ['龙象般若功', { cat: 'in', mult: 1.4 }],
  xuantiejian:  ['玄铁剑法', { cat: 'rt', hpCost: .08, mult: 1.3 }],
  huoyandao:    ['火焰刀', { cat: 'rt', dot: .25 }],
  hamagong:     ['蛤蟆功', { cat: 'rt', stun: .3, mult: 1.15 }],
  kongming:     ['空明拳', { cat: 'rt', hits: 2, mustHit: 1 }],
  zuoyouhubo:   ['左右互搏', { cat: 'rt', hits: 2, mult: 1.1 }],
  xiantian:     ['先天功', { cat: 'in' }],
  tiancan:      ['天蚕神功', { cat: 'in' }],
  xuedaodao:    ['血刀刀法', { cat: 'rt', lifesteal: .4, mult: 1.15 }],
  fanliangyi:   ['反两仪刀法', { cat: 'rt', hits: 2, critBonus: 6 }],
  jinshejian:   ['金蛇剑法', { cat: 'rt', critBonus: 15 }],
  bixiejianfa:  ['辟邪剑法', { cat: 'rt', mustCrit: 1, mult: 1.15 }],
  taijiquan:    ['太极拳', { cat: 'rt', defBuff: 2 }],
  huagong:      ['化功大法', { cat: 'in', drain: 1 }],
  xixing:       ['吸星大法', { cat: 'in', drain: 1 }],
  xuanming:     ['玄冥神掌', { cat: 'rt', dot: .28, stun: .15 }],
  qishang:      ['七伤拳', { cat: 'rt', hpCost: .1, mult: 1.35 }],
  duoming15:    ['夺命十五剑', { cat: 'rt', mustCrit: 1, ignoreDef: 1 }],
  lingxiyz:     ['灵犀一指', { cat: 'rt', critBonus: 20, stun: .18 }],
  damoji:       ['达摩剑法', { cat: 'rt', hits: 2, mustHit: 1 }],
  weituogun:    ['韦陀棍法', { cat: 'rt', stun: .22, mult: 1.1 }],
  poyun:        ['破云掌', { cat: 'rt', hits: 2, mult: 1.2 }],
  wanjianjue:   ['万剑诀', { cat: 'rt', hits: 3, critBonus: 8 }],
  lingbo:       ['凌波微步', { cat: 'ag', mustHit: 1 }],
  shenxingbai:  ['神行百变', { cat: 'ag' }]
};
