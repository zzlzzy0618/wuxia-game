/* ============ 数据：十大门派 & 武学体系 ============ */

// 武学阶级模板：15 阶，决定等级/威力/耗蓝
const SKILL_TIERS = [
  { lv: 1,  mult: 1.30, mp: 5 },  { lv: 3,  mult: 1.50, mp: 9 },
  { lv: 5,  mult: 1.75, mp: 14 }, { lv: 7,  mult: 2.00, mp: 19 },
  { lv: 9,  mult: 2.25, mp: 24 }, { lv: 11, mult: 2.55, mp: 30 },
  { lv: 13, mult: 2.85, mp: 36 }, { lv: 15, mult: 3.15, mp: 42 },
  { lv: 17, mult: 3.50, mp: 49 }, { lv: 19, mult: 3.85, mp: 56 },
  { lv: 21, mult: 4.20, mp: 63 }, { lv: 23, mult: 4.60, mp: 70 },
  { lv: 25, mult: 5.00, mp: 78 }, { lv: 27, mult: 5.50, mp: 86 },
  { lv: 29, mult: 6.20, mp: 95 }
];

const SECTS = {
  shaolin: {
    name: '少林派', tag: '外功 · 刚猛', passive: { id: 'iron', text: '金刚不坏 · 受到的伤害 -10%' },
    desc: '天下武功出少林。铜皮铁骨，拳掌开碑，气血防御冠绝江湖。',
    base: { hp: 135, mp: 50, atk: 14, def: 9, spd: 6, crt: 5 },
    grow: { hp: 24, mp: 8, atk: 3.5, def: 2.6, spd: .8, crt: .8 },
    skills: [
      ['少林长拳'], ['罗汉拳'], ['韦陀掌'], ['拈花指', { stun: .18 }],
      ['伏虎拳'], ['大力金刚掌', { stun: .22 }], ['龙爪手'], ['如影随形腿'],
      ['袈裟伏魔功'], ['易筋经', { heal: .25, healMp: .15, atkBuff: 2 }], ['洗髓经', { heal: .40, healMp: .2 }],
      ['金刚不坏体', { defBuff: 3 }], ['千手如来掌', { hits: 3 }], ['如来千叶手', { hits: 2, stun: .2 }],
      ['如来神掌', { mustCrit: true }]
    ]
  },
  wudang: {
    name: '武当派', tag: '内功 · 绵长', passive: { id: 'regen', text: '道家真气 · 每回合额外恢复内力' },
    desc: '以柔克刚，以慢打快。真气悠长，守中带攻，越战越强。',
    base: { hp: 115, mp: 72, atk: 13, def: 7, spd: 8, crt: 6 },
    grow: { hp: 18, mp: 15, atk: 3.1, def: 2.0, spd: 1.0, crt: 1.0 },
    skills: [
      ['武当长拳'], ['绵掌'], ['武当剑法'], ['神门十三剑'],
      ['绕指柔剑'], ['梯云纵', { defBuff: 2 }], ['太极剑', { defBuff: 2 }], ['八卦游龙掌'],
      ['玄虚刀法'], ['真武七截阵', { hits: 2 }], ['无极玄功拳'], ['纯阳无极功', { mpDrain: 30 }],
      ['倚天屠龙功', { hits: 2 }], ['太极神功', { heal: .35, healMp: .3 }], ['真武剑诀', { ignoreDef: true }]
    ]
  },
  gumu: {
    name: '古墓派', tag: '身法 · 轻灵', passive: { id: 'dodge', text: '灵动身法 · 闪避几率 +8%' },
    desc: '幽居寒潭，不染尘埃。剑法轻灵如燕，闪避暴击双绝。',
    base: { hp: 108, mp: 60, atk: 15, def: 5, spd: 12, crt: 10 },
    grow: { hp: 18, mp: 12, atk: 3.8, def: 1.7, spd: 1.8, crt: 1.6 },
    skills: [
      ['美女拳法', { critBonus: 6 }], ['天罗地网势'], ['玉女剑法'], ['银索金铃', { hits: 2 }],
      ['捕雀功', { critBonus: 8 }], ['玉蜂针', { dot: .12 }], ['冰魄银针', { dot: .18 }], ['寒玉床心法', { heal: .3 }],
      ['拂尘功'], ['玉女心经', { atkBuff: 2 }], ['玉女素心剑', { hits: 2, critBonus: 6 }], ['空谷幽兰', { critBonus: 10, stun: .15 }],
      ['林朝英剑法'], ['黯然销魂掌', { critBonus: 12 }], ['太阴归元剑', { mustCrit: true }]
    ]
  },
  feidao: {
    name: '飞刀门', tag: '暗器 · 致命', passive: { id: 'crit', text: '例无虚发 · 暴击几率 +10%' },
    desc: '小李飞刀，例无虚发。不求守御，但求一击毙命，天下无双。',
    base: { hp: 95, mp: 55, atk: 19, def: 4, spd: 10, crt: 13 },
    grow: { hp: 15, mp: 10, atk: 4.6, def: 1.3, spd: 1.2, crt: 2.2 },
    skills: [
      ['飞蝗石'], ['袖箭'], ['飞刀术'], ['追魂夺命剑'],
      ['燕子三抄水', { critBonus: 8 }], ['流云飞袖'], ['银针渡穴', { stun: .2 }], ['漫天花雨', { hits: 3 }],
      ['流星赶月', { hits: 2 }], ['无影快剑', { critBonus: 12 }], ['例不虚发', { mustHit: true, critBonus: 10 }],
      ['夺命飞刀', { mustCrit: true }], ['一剑封喉', { hits: 2, mustHit: true }], ['剑心通明', { critBonus: 15, ignoreDef: true }],
      ['小李飞刀', { mustHit: true, mustCrit: true, ignoreDef: true }]
    ]
  },
  yihua: {
    name: '移花宫', tag: '奇功 · 诡谲', passive: { id: 'onkill', text: '明玉真气 · 击杀敌人回复两成气血' },
    desc: '移花接玉，夺人功力。出手看似轻描淡写，实则杀机四伏。',
    base: { hp: 110, mp: 66, atk: 15, def: 6, spd: 9, crt: 8 },
    grow: { hp: 17, mp: 13, atk: 3.6, def: 1.7, spd: 1.3, crt: 1.3 },
    skills: [
      ['移花诀'], ['落花掌'], ['移形换位'], ['飞花摘叶', { hits: 2 }],
      ['碎玉掌'], ['踏雪无痕', { critBonus: 8 }], ['玉碎昆冈', { hpCost: .08 }], ['移花接玉', { lifesteal: .35 }],
      ['镜花水月', { dot: .15 }], ['明玉诀', { mpDrain: 28 }], ['焚玉掌', { hpCost: .1 }], ['借花献佛', { lifesteal: .45 }],
      ['明玉九转', { heal: .3, lifesteal: .3 }], ['明玉功', { lifesteal: .5 }], ['嫁衣神功', { hpCost: .12, mustCrit: true }]
    ]
  },
  gaibang: {
    name: '丐帮', tag: '掌法 · 豪勇', passive: { id: 'rage', text: '醉侠血性 · 气血低于三成时攻击 +25%' },
    desc: '天下第一大帮，帮众遍九州。降龙掌刚猛无俦，打狗棒变化精奇。',
    base: { hp: 125, mp: 58, atk: 16, def: 7, spd: 7, crt: 7 },
    grow: { hp: 21, mp: 10, atk: 3.9, def: 2.1, spd: 1.0, crt: 1.1 },
    skills: [
      ['太祖长拳'], ['太祖棒法'], ['疯魔杖法'], ['逍遥游'],
      ['铁帚腿法'], ['莲花掌'], ['蟠龙棍法'], ['亢龙有悔'],
      ['飞龙在天'], ['龙战于野', { hits: 2 }], ['潜龙勿用', { stun: .25 }], ['密云不雨', { defBuff: 2 }],
      ['或跃在渊', { hits: 2 }], ['打狗棒法', { hits: 2, stun: .2 }], ['降龙十八掌', { mustCrit: true }]
    ]
  },
  taohua: {
    name: '桃花岛', tag: '奇门 · 五行', passive: { id: 'opening', text: '奇门遁甲 · 战斗开始随机获得增益三回合' },
    desc: '东海桃花岛，五行奇门，音律算学无所不通，武功更是清奇瑰丽。',
    base: { hp: 100, mp: 64, atk: 14, def: 6, spd: 11, crt: 9 },
    grow: { hp: 16, mp: 13, atk: 3.4, def: 1.6, spd: 1.6, crt: 1.4 },
    skills: [
      ['碧波掌法'], ['扫叶腿'], ['落英神剑掌', { hits: 2 }], ['兰花拂穴手', { stun: .2 }],
      ['玉箫剑法'], ['碧海潮生曲', { dot: .14 }], ['弹指神通', { critBonus: 10 }], ['落英剑法', { hits: 3 }],
      ['奇门五转', { atkBuff: 2 }], ['五行轮转', { defBuff: 2 }], ['踏罡步斗', { critBonus: 8, stun: .12 }], ['碧海生潮', { hits: 2, dot: .12 }],
      ['弹指惊天', { mustHit: true, critBonus: 8 }], ['玉箫剑气', { ignoreDef: true }], ['落英神剑', { mustCrit: true, hits: 2 }]
    ]
  },
  lingjiu: {
    name: '灵鹫宫', tag: '天山 · 冰雪', passive: { id: 'regenhp', text: '天池真气 · 每回合回复 3% 气血' },
    desc: '缥缈峰灵鹫宫，天山折梅手包罗万招，生死符一出，群雄束手。',
    base: { hp: 110, mp: 70, atk: 15, def: 6, spd: 9, crt: 8 },
    grow: { hp: 18, mp: 14, atk: 3.5, def: 1.7, spd: 1.2, crt: 1.2 },
    skills: [
      ['灵鹫掌法'], ['雪影掌'], ['折梅手'], ['天山六阳掌'],
      ['寒冰绵掌', { dot: .12 }], ['白虹掌力', { critBonus: 8 }], ['传音搜魂', { stun: .2 }], ['小无相功', { mpDrain: 25 }],
      ['天山折梅手', { hits: 2 }], ['冰魄寒光', { hits: 2, dot: .1 }], ['六阳融雪', { heal: .35 }], ['生死符', { dot: .22, mustHit: true }],
      ['冰封千里', { stun: .3 }], ['八荒六合', { atkBuff: 2, lifesteal: .3 }], ['九天摘星手', { mustCrit: true }]
    ]
  },
  duan: {
    name: '大理段氏', tag: '剑气 · 皇族', passive: { id: 'royal', text: '皇族血脉 · 气血上限 +10%，丹药效果 +30%' },
    desc: '天南皇族，家传一阳指与六脉神剑，以指力化剑气，冠绝当世。',
    base: { hp: 120, mp: 62, atk: 15, def: 7, spd: 8, crt: 7 },
    grow: { hp: 20, mp: 12, atk: 3.4, def: 2.2, spd: 1.0, crt: 1.0 },
    skills: [
      ['段家剑法'], ['天南掌法'], ['一阳指 · 三品'], ['一阳指 · 二品', { critBonus: 6 }],
      ['枯荣禅功', { heal: .3 }], ['六脉神剑 · 少商剑'], ['六脉神剑 · 商阳剑'], ['六脉神剑 · 中冲剑', { hits: 2 }],
      ['六脉神剑 · 关冲剑', { critBonus: 8 }], ['六脉神剑 · 少冲剑', { hits: 2 }], ['六脉神剑 · 少泽剑', { stun: .2 }],
      ['六剑齐发', { hits: 3 }], ['剑气长虹', { ignoreDef: true }], ['剑气纵横', { hits: 2, mustHit: true }],
      ['万剑归宗', { mustCrit: true }]
    ]
  },
  baiyun: {
    name: '白云城', tag: '剑客 · 孤高', passive: { id: 'firstcrit', text: '紫禁之巅 · 每场战斗首次出手必暴击' },
    desc: '白云城主叶氏，世居海外仙城。月圆之夜，紫禁之巅，一剑西来，天外飞仙。',
    base: { hp: 95, mp: 58, atk: 17, def: 5, spd: 11, crt: 11 },
    grow: { hp: 15, mp: 11, atk: 4.2, def: 1.4, spd: 1.5, crt: 1.8 },
    skills: [
      ['白云剑法'], ['流云剑法'], ['浮云剑式'], ['拂柳剑法'],
      ['停云剑式', { critBonus: 8 }], ['望月式'], ['追星赶月', { hits: 2 }], ['云卷云舒', { dot: .13 }],
      ['青冥剑气'], ['断云式', { critBonus: 12 }], ['孤城落日', { atkBuff: 2 }], ['清风拂柳', { stun: .22 }],
      ['一剑西来', { mustHit: true }], ['剑破长空', { hits: 2 }], ['天外飞仙', { mustHit: true, mustCrit: true, ignoreDef: true }]
    ]
  }
};

// 通用武学（秘籍习得，20 种）
const UNIVERSAL_SKILLS = [
  ['基础剑法', { mult: .9 }], ['基础刀法', { mult: .9 }], ['基础掌法', { mult: .9 }],
  ['混元功', { mpDrain: 15 }], ['吐纳术', { heal: .2 }], ['铁砂掌', { stun: .12 }],
  ['大伏虎拳', { mult: 1.1 }], ['金钟罩', { defBuff: 2 }], ['铁布衫', { defBuff: 3 }],
  ['八段锦', { heal: .25, healMp: .15 }], ['五禽戏', { heal: .3 }], ['太祖棍法', { mult: 1.15 }],
  ['燕青拳', { hits: 2 }], ['八极拳', { stun: .18 }], ['形意拳', { critBonus: 8 }],
  ['八卦掌', { hits: 2 }], ['通背拳', { critBonus: 6 }], ['劈挂掌', { mult: 1.2 }],
  ['佛山无影脚', { hits: 3 }], ['醉拳', { atkBuff: 2, critBonus: 10 }]
];

// 隐世武学（奇遇/头目习得，30 种）
const HIDDEN_SKILLS = {
  jiuyang:      ['九阳神功', { heal: .45, healMp: .35, atkBuff: 2 }],
  jiuyin:       ['九阴真经', { hits: 2, critBonus: 10 }],
  dugu:         ['独孤九剑', { ignoreDef: true, mustCrit: true }],
  beiming:      ['北冥神功', { mpDrain: 45, mult: 1.2 }],
  qiankun:      ['乾坤大挪移', { lifesteal: .5 }],
  taixuan:      ['太玄经', { hits: 3 }],
  shenzhao:     ['神照经', { heal: .6, healMp: .5 }],
  longxiang:    ['龙象般若功', { mult: 1.4, stun: .2 }],
  xuantiejian:  ['玄铁剑法', { hpCost: .08, mult: 1.3 }],
  huoyandao:    ['火焰刀', { dot: .25 }],
  hamagong:     ['蛤蟆功', { stun: .3, mult: 1.15 }],
  kongming:     ['空明拳', { hits: 2, mustHit: true }],
  zuoyouhubo:   ['左右互搏', { hits: 2, mult: 1.1 }],
  xiantian:     ['先天功', { atkBuff: 3, defBuff: 2 }],
  tiancan:      ['天蚕神功', { heal: .5, defBuff: 2 }],
  xuedaodao:    ['血刀刀法', { lifesteal: .4, mult: 1.15 }],
  fanliangyi:   ['反两仪刀法', { hits: 2, critBonus: 6 }],
  jinshejian:   ['金蛇剑法', { critBonus: 15 }],
  bixiejianfa:  ['辟邪剑法', { mustCrit: true, mult: 1.15 }],
  taijiquan:    ['太极拳', { defBuff: 2, heal: .25 }],
  huagong:      ['化功大法', { mpDrain: 40 }],
  xixing:       ['吸星大法', { lifesteal: .35, mpDrain: 25 }],
  xuanming:     ['玄冥神掌', { dot: .28, stun: .15 }],
  qishang:      ['七伤拳', { hpCost: .1, mult: 1.35 }],
  duoming15:    ['夺命十五剑', { mustCrit: true, ignoreDef: true }],
  lingxiyz:     ['灵犀一指', { critBonus: 20, stun: .18 }],
  damoji:       ['达摩剑法', { hits: 2, mustHit: true }],
  weituogun:    ['韦陀棍法', { stun: .22, mult: 1.1 }],
  poyun:        ['破云掌', { hits: 2, mult: 1.2 }],
  wanjianjue:   ['万剑诀', { hits: 3, critBonus: 8 }]
};
