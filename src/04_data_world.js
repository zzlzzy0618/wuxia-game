/* ============ 数据：世界（地域/地图/主线/头目/伙伴/敌人词库） ============ */

const REGIONS = {
  jiangnan: { name: '江南水乡', band: [1, 10] },
  zhongyuan: { name: '中原大地', band: [8, 30] },
  saibei: { name: '塞北大漠', band: [16, 28] },
  xiyu: { name: '西域边陲', band: [30, 42] },
  chuanshu: { name: '巴蜀之地', band: [10, 18] },
  diannan: { name: '彩云之南', band: [24, 34] },
  haiwai: { name: '东海海外', band: [38, 46] },
  moyu: { name: '魔域绝地', band: [44, 49] }
};

// 地图：id, 名称, 地域, 等级, 章节 ch（主线地图），boss，事件 events
const MAPS = [
  // —— 江南水乡 ——
  { id: 'niujiacun', name: '牛家村', region: 'jiangnan', lv: 2, ch: 1 },
  { id: 'qiantang', name: '钱塘江畔', region: 'jiangnan', lv: 2 },
  { id: 'hanshansi', name: '寒山寺外', region: 'jiangnan', lv: 4 },
  { id: 'jiaxing', name: '嘉兴城', region: 'jiangnan', lv: 5 },
  { id: 'jinling', name: '金陵城', region: 'jiangnan', lv: 6 },
  { id: 'linan', name: '临安城', region: 'jiangnan', lv: 8, events: [{ id: 'ev_bixie', lvReq: 9, skill: 'bixiejianfa', title: '镖局灭门案', text: '你在临安城郊发现一座焚毁的镖局。断壁残垣间，一柄油布包裹的小剑微微发光——林家辟邪剑谱，竟藏于剑柄夹层！你连夜参悟，学会了「辟邪剑法」（欲练此功……你摸了摸自己，算了，只学招式不练内功心法）。' }] },
  { id: 'yanzhulou', name: '烟雨楼', region: 'jiangnan', lv: 7 },
  { id: 'yanziwu', name: '太湖燕子坞', region: 'jiangnan', lv: 8, events: [{ id: 'ev_duoming', lvReq: 10, skill: 'duoming15', title: '翠云峰·绿水湖', text: '烟波浩渺处，一位白衣剑客立于船头，正是隐世不出的三少爷。他与你把酒论剑三日，临别时抚剑长叹："天下最快的剑，不是我的剑。"他将「夺命十五剑」剑谱赠你为念。' }] },
  { id: 'taohuadao', name: '桃花岛', region: 'jiangnan', lv: 9, bossSide: 'taohuaDaozhu', events: [{ id: 'ev_aheng', lvReq: 10, comp: 'aheng', title: '桃花影落', text: '落英缤纷处，一名青衣少女正在花阵中练习步法。她自称阿蘅，是岛主的婢女，早已向往岛外天地。见你武功不俗、目光清正，她盈盈一拜："公子若不嫌弃，阿蘅愿随行江湖，为君分忧。"' }] },
  { id: 'yandang', name: '雁荡山', region: 'jiangnan', lv: 10 },
  // —— 中原大地 ——
  { id: 'huashan', name: '西岳华山', region: 'zhongyuan', lv: 12, ch: 2, events: [
    { id: 'ev_jiuyang', lvReq: 14, skill: 'jiuyang', title: '华山秘洞', text: '你在朝阳峰后寻得一处隐蔽山洞，石壁上密密麻麻刻着一部内功心法，落款"斗酒僧"。你在洞中参悟三日，只觉丹田真气鼓荡，如江河奔涌——你学会了绝世内功「九阳神功」！' },
    { id: 'ev_fanliangyi', lvReq: 20, skill: 'fanliangyi', title: '思过崖剑冢', text: '思过崖石壁上剑痕纵横，或正或反，暗合两仪。你盘坐七日，终于悟出正反相生之理——学会了「反两仪刀法」！' }
  ] },
  { id: 'huanghekou', name: '黄河渡口', region: 'zhongyuan', lv: 13 },
  { id: 'emei_road', name: '剑门关', region: 'chuanshu', lv: 16, events: [{ id: 'ev_wanjian', lvReq: 17, skill: 'wanjianjue', title: '剑门古栈道', text: '古栈道旁的崖壁上插满了锈剑，是历代剑客埋剑之处。你抚剑长吟，忽然万剑齐鸣——剑冢之灵认可了你，一部「万剑诀」自行流入你的识海！' }] },
  { id: 'fenglingdu', name: '风陵渡口', region: 'zhongyuan', lv: 14 },
  { id: 'wudang', name: '武当山', region: 'zhongyuan', lv: 19, events: [{ id: 'ev_taijiquan', lvReq: 21, skill: 'taijiquan', title: '紫霄宫问道', text: '紫霄宫中，一位白发老道正在打拳。拳势如行云流水，绵绵不绝。你看得如痴如醉，老道微微一笑："有缘人，看好了。"一套「太极拳」演练三遍，尽数传你。' }] },
  { id: 'zhongnan', name: '终南山', region: 'zhongyuan', lv: 16, events: [{ id: 'ev_kongming', lvReq: 17, skill: 'kongming', title: '重阳宫外', text: '重阳宫外，一位蓬头道人拦住你，硬要与你拆招。三十招后他哈哈大笑："空手而回，不如空拳！"当场传了你一套「空明拳」——至柔的拳法。' }] },
  { id: 'emei', name: '峨眉山', region: 'chuanshu', lv: 11, events: [{ id: 'ev_poyun', lvReq: 12, skill: 'poyun', title: '金顶云海', text: '金顶云海翻腾，一位灰袍老尼正在教授弟子掌法。你远远观摩，被她察觉。老尼非但不怪，反而赞你资质，将「破云掌」倾囊相授。' }] },
  { id: 'qingcheng', name: '青城山', region: 'chuanshu', lv: 14 },
  { id: 'diancang', name: '点苍山', region: 'chuanshu', lv: 17, events: [{ id: 'ev_tiancan', lvReq: 18, skill: 'tiancan', title: '点苍药庐', text: '药庐主人身患奇疾，你以银两相赠、亲侍汤药七日。主人痊愈后以一部「天蚕神功」相谢——疗伤圣典，江湖梦寐以求。' }] },
  { id: 'minjiang', name: '岷江栈道', region: 'chuanshu', lv: 10 },
  { id: 'luoyang', name: '洛阳城', region: 'zhongyuan', lv: 18 },
  { id: 'kaifeng', name: '开封府', region: 'zhongyuan', lv: 20, events: [{ id: 'ev_liuruyan', lvReq: 21, comp: 'liuruyan', title: '夜探开封', text: '三更时分，你追一道黑影至大相国寺后墙。黑影转身，竟是个笑吟吟的少女："追了我三条街，就为了还这个钱袋？"她自称柳如烟，飞檐走壁劫富济贫。见你侠气纵横，她眨眨眼："带上我呗，屋檐上的风景，你肯定没见过。"' }] },
  { id: 'xiangyang', name: '襄阳城', region: 'zhongyuan', lv: 22, ch: 3, events: [{ id: 'ev_shenzhao', lvReq: 24, skill: 'shenzhao', title: '牢城营旧事', text: '襄阳牢城营遗址中，你救起一名垂死的老囚犯。他握着你的手，将一部残破心法塞入你怀中："神照经……天下第一奇功……可惜我练成了，却没能等到他……"言罢溘然长逝。你在坟前守了三日，参悟神照经。' }] },
  { id: 'huosirenmu', name: '活死人墓', region: 'zhongyuan', lv: 25, events: [
    { id: 'ev_jiuyin', lvReq: 26, skill: 'jiuyin', title: '断龙石下', text: '你从古墓密道潜入，在寒玉床下寻得一部刻在白绫上的武学总纲——九阴真经！墓中先辈留言：习武之人，当以之为济世之资，而非杀人利器。你谨记于心，参悟九阴真经。' },
    { id: 'ev_hubo', lvReq: 28, skill: 'zuoyouhubo', title: '老顽童', text: '墓中竟还住着一个满头白发的老顽童！他缠着你比武，输了就要你陪他玩。三天后他玩腻了，一拍脑门："教你个好玩的！"——竟是失传已久的「左右互搏」！' }
  ] },
  { id: 'baimasi', name: '白马寺', region: 'zhongyuan', lv: 27, events: [{ id: 'ev_damoji', lvReq: 28, skill: 'damoji', title: '达摩院残碑', text: '白马寺后山立着一块残碑，碑上剑痕深达三寸，剑意凛然。老方丈说这是达摩祖师东渡时所留。你面碑七日，以指代剑，终于参透「达摩剑法」。' }] },
  { id: 'shaolin', name: '嵩山少林', region: 'zhongyuan', lv: 29, ch: 5, events: [
    { id: 'ev_xiantian', lvReq: 30, skill: 'xiantian', title: '藏经阁参悟', text: '你在藏经阁帮忙整理经卷，无意间读到一部《先天功》残篇。知客僧见你有缘，默许你抄录参详。闭关七日，你只觉脱胎换骨。' },
    { id: 'ev_weituo', lvReq: 32, skill: 'weituogun', title: '木人巷', text: '你闯木人巷一百零八铜人阵，棍影如林。闯到第七十二人时，忽然福至心灵——降魔护法，正是此意！你顺手抄起一根木棍，使出了「韦陀棍法」。' }
  ] },
  // —— 塞北大漠 ——
  { id: 'liaodong', name: '辽东雪原', region: 'saibei', lv: 20, events: [
    { id: 'ev_xuantie', lvReq: 21, skill: 'xuantiejian', title: '独孤剑冢', text: '雪原深处，乱石堆中斜插着一柄黑黝黝的重剑，剑下刻着"四十岁前恃之横行天下"。你奋力拔剑，剑身重逾千斤——玄铁剑法，重剑无锋，大巧不工！' },
    { id: 'ev_xuanming', lvReq: 23, skill: 'xuanming', title: '玄冥寒潭', text: '寒潭冰面之下，隐约有两个人影激斗。你凿冰救人，捞上来的却是两具早已冻僵的玄衣老者，怀中各揣半部「玄冥神掌」掌谱。你将二人合葬，依法参悟。' }
  ] },
  { id: 'yanmenguan', name: '雁门关', region: 'saibei', lv: 17 },
  { id: 'yinshan', name: '阴山', region: 'saibei', lv: 19, bossSide: 'qiutiezhang', events: [{ id: 'ev_qishang', lvReq: 21, skill: 'qishang', title: '崆峒遗老', text: '阴山山洞里住着一位崆峒派遗老，身负内伤却拒绝医治："七伤拳练至深处，伤人先伤己，我这是报应，不必管我。"你日夜相陪，老人感其诚，将「七伤拳」拳谱相赠："切记，一练七伤，先伤自己……"' }] },
  { id: 'datong', name: '大同府', region: 'saibei', lv: 21 },
  { id: 'caoyuan', name: '蒙古草原', region: 'saibei', lv: 23, events: [{ id: 'ev_batulu', lvReq: 24, comp: 'batulu', title: '摔跤大会', text: '草原那达慕大会，你与蒙古力士巴图鲁摔了三百回合不分胜负。巴图鲁对你佩服得五体投地："安达！跟我走！大漠的孩子说话算数！"他执意随你闯荡中原。' }] },
  { id: 'damo', name: '大漠戈壁', region: 'saibei', lv: 26, ch: 4 },
  { id: 'juyanhai', name: '居延海', region: 'saibei', lv: 28, events: [{ id: 'ev_xuedao', lvReq: 29, skill: 'xuedaodao', title: '血刀老祖', text: '枯海盐滩上，一名血衣老僧盘膝而坐，已是弥留。他一生杀人如麻，临终却只想找个传人："血刀刀法……狠、毒……你若学去，望你……斩恶人……"你学了刀法，也记住了他的话。' }] },
  // —— 西域边陲 ——
  { id: 'loulan', name: '楼兰古城', region: 'xiyu', lv: 30, events: [{ id: 'ev_jinshe', lvReq: 31, skill: 'jinshejian', title: '古城密窟', text: '流沙半掩的密窟中，你寻得一柄金光灿灿的奇形长剑，剑身蜿蜒如蛇。剑匣中还有一卷「金蛇剑法」——招招阴狠毒辣，专攻要害。' }] },
  { id: 'huoyanshan', name: '火焰山', region: 'xiyu', lv: 31, events: [{ id: 'ev_huoyan', lvReq: 32, skill: 'huoyandao', title: '赤焰刀客', text: '火焰山下，一位赤膊刀客正在岩浆余烬上练刀，刀锋过处热浪滚滚。他与你一战倾心："我这火焰刀，正缺个传人！"倾囊相授之后，大笑而去。' }] },
  { id: 'baituoshan', name: '白驼山', region: 'xiyu', lv: 33, bossSide: 'ouyanggu' },
  { id: 'gaoshan', name: '高昌古城', region: 'xiyu', lv: 34 },
  { id: 'kunlun', name: '昆仑山', region: 'xiyu', lv: 35, bossSide: 'kunlunyiren', events: [{ id: 'ev_ganxiaomei', lvReq: 36, comp: 'ganxiaomei', title: '铸剑炉遗迹', text: '昆仑绝顶有一座荒废的铸剑炉，炉边少女干小妹是铸剑世家最后传人。她守着祖传图谱却无炉可铸："跟我下山吧！我的锤子，早就想敲一敲中原的铁了！"' }] },
  { id: 'guangmingding', name: '光明顶', region: 'xiyu', lv: 37, ch: 7 },
  { id: 'xingxiuhai', name: '星宿海', region: 'xiyu', lv: 39, bossSide: 'xingxiuyaonv', events: [
    { id: 'ev_lanxieer', lvReq: 40, comp: 'lanxieer', title: '毒沼怪医', text: '毒沼深处，一名紫衣少女正给巨蟒喂药。她自称蓝蝎儿，用毒救人，也用毒杀人。中原正道容不下她，星宿派又要抓她回去。"你去哪，我就去哪——反正毒物不咬自己人。"' },
    { id: 'ev_huagong', lvReq: 41, skill: 'huagong', title: '化功遗篇', text: '你在星宿派旧巢的地窖里，寻得一册人皮封面的邪功——化功大法。书页间夹着字条："此功歹毒，因果自负。"你犹豫再三，还是收下了。' }
  ] },
  { id: 'lingjiufeng', name: '天山灵鹫峰', region: 'xiyu', lv: 41, ch: 8, events: [{ id: 'ev_xueyan', lvReq: 42, comp: 'xueyan', title: '缥缈峰雪崩', text: '灵鹫峰雪崩，你从雪堆里刨出一名宫装少女——灵鹫宫侍女雪雁。她伤愈后拜谢救命之恩："宫主有令，雪雁此生追随恩公。"' }] },
  // —— 彩云之南 ——
  { id: 'wuliangshan', name: '无量山', region: 'diannan', lv: 24, events: [{ id: 'ev_shihu', lvReq: 25, title: '剑湖宫底', bonus: { atk: 6, def: 6, hp: 50 }, text: '剑湖湖底石室，玉像前的蒲团中藏着一卷逍遥派手札。你依图吐纳，只觉真气生生不息——攻击永久+6，防御永久+6，气血上限永久+50！' }] },
  { id: 'lancang', name: '澜沧江畔', region: 'diannan', lv: 27 },
  { id: 'yaowanggu', name: '药王谷', region: 'diannan', lv: 29 },
  { id: 'cangshan', name: '苍山洱海', region: 'diannan', lv: 31 },
  { id: 'dali', name: '大理城', region: 'diannan', lv: 33, ch: 6 },
  // —— 东海海外 ——
  { id: 'binghuodao', name: '冰火岛', region: 'haiwai', lv: 39 },
  { id: 'lingshedao', name: '灵蛇岛', region: 'haiwai', lv: 40 },
  { id: 'xiakedao', name: '侠客岛', region: 'haiwai', lv: 42, bossSide: 'xiakeshizhe', events: [{ id: 'ev_taixuan', lvReq: 43, skill: 'taixuan', title: '太玄经石壁', text: '侠客岛石洞壁上刻着一部《侠客行》，二十四个石室各藏玄机。你逐室参悟，到第二十四室时，壁上蝌蚪文忽然化作漫天剑意——你竟在懵懂之间，学会了无人能解的「太玄经」！' }] },
  { id: 'yihuadao', name: '移花岛', region: 'haiwai', lv: 45, ch: 9, events: [{ id: 'ev_beiming', lvReq: 46, skill: 'beiming', title: '崖壁刻痕', text: '你在断崖之下避雨，发现崖壁上竟有人以指力刻下一部心法，笔意高古。你依法吐纳，只觉四肢百骸真气倒流，天地灵气源源不断汇入丹田——你学会了「北冥神功」！' }] },
  { id: 'penglai', name: '蓬莱仙山', region: 'haiwai', lv: 46, events: [{ id: 'ev_lingxi', lvReq: 47, skill: 'lingxiyz', title: '海上仙山', text: '蓬莱山巅云雾缭绕，一位白眉仙人（其实是个隐居的老怪物）见你登顶不易，捋须大笑："一指之寒，可通灵犀！"传了你「灵犀一指」——指风所至，百穴俱开。' }] },
  // —— 魔域绝地 ——
  { id: 'youminggu', name: '幽冥谷', region: 'moyu', lv: 44, bossSide: 'youmingguzhu', events: [{ id: 'ev_yewushuang', lvReq: 45, comp: 'yewushuang', title: '囚笼影卫', text: '幽冥谷底的铁囚笼里，锁着一个浑身是伤的黑衣人。他是魔教影卫夜无双，因抗命被囚十年。你斩断锁链，他沉默良久，只说了一句："这条命，是你的了。"' }] },
  { id: 'riyuefeng', name: '日月峰', region: 'moyu', lv: 46, events: [{ id: 'ev_xixing', lvReq: 47, skill: 'xixing', title: '湖底地牢', text: '日月峰下湖底暗牢，囚禁过魔教前任教主。墙上指甲刻痕犹在，旁边竟是一部「吸星大法」！你依法修习，可将他人内力吸为己用——善用之，慎用之。' }] },
  { id: 'heimuya', name: '黑木崖', region: 'moyu', lv: 49, ch: 10 }
];

// 主线章节
const CHAPTERS = [
  { ch: 1,  map: 'niujiacun', boss: 'zhouba',     text: '【第一章 · 初露锋芒】牛家村恶霸"镇关西·周霸"勾结官府、欺压乡邻。侠义当前，教训他！' },
  { ch: 2,  map: 'huashan',    boss: 'dugucan',    text: '【第二章 · 华山论剑】你声名渐起。传闻华山之巅有个"剑痴"，胜他者可得剑道真传。' },
  { ch: 3,  map: 'xiangyang',  boss: 'jinlunseng', text: '【第三章 · 襄阳血战】蒙古国师金轮僧遣高手混入襄阳，欲刺杀守将。驰援襄阳！' },
  { ch: 4,  map: 'damo',       boss: 'shalifei',  text: '【第四章 · 大漠孤烟】马贼"沙里飞"劫掠商队、血案累累。受商会所托，前往大漠讨伐。' },
  { ch: 5,  map: 'shaolin',    boss: 'guimian',   text: '【第五章 · 血战少林】魔教护法"鬼面判官"率众围攻少林，欲夺《易筋经》。星夜驰援！' },
  { ch: 6,  map: 'dali',       boss: 'duanyanping', text: '【第六章 · 天南惊变】大理段氏逆徒段延平勾结魔教，篡位夺权，段氏满门危在旦夕。' },
  { ch: 7,  map: 'guangmingding', boss: 'chenguiseng', text: '【第七章 · 光明顶之围】六大派围攻光明顶，魔教趁乱练功欲一统江湖，幕后黑手成鬼僧现形。' },
  { ch: 8,  map: 'lingjiufeng', boss: 'dinglaoguai', text: '【第八章 · 天山折梅】星宿老怪丁春秋觊觎灵鹫宫百年基业，缥缈峰告急。' },
  { ch: 9,  map: 'yihuadao',   boss: 'yuehuagongzhu', text: '【第九章 · 移花接玉】魔教下一个目标是移花岛。乘船出海，报信退敌，宫主却不肯不战而降。' },
  { ch: 10, map: 'heimuya',    boss: 'dongfangyao', text: '【终章 · 决战黑木崖】魔教教主东方曜练成绝世魔功，欲一统江湖。群雄束手，唯你可用性命相搏。决战黑木崖，在此一举！' },
  { ch: 11, map: null, boss: null, text: '【后日谈 · 江湖路远】东方曜败亡，魔教树倒猢狲散，江湖重归太平。但你知道，有人的地方就有恩怨，有恩怨就有江湖。收剑入鞘，继续你的江湖路……' }
];

// 头目（chapter 为主线，side 为支线）
// hpMul/atkMul 随等级缓增：玩家武学倍率与装备成长超线性，固定倍率会导致高等级头目形同虚设
function boss(name, lv, o = {}) {
  return Object.assign({
    name, lv,
    hpMul: 4 + lv * .12, atkMul: 1.5 + lv * .004,
    expMul: 3, silMul: 5, skills: [], reward: {}
  }, o);
}
const BOSSES = {
  zhouba: boss('镇关西 · 周霸', 4, { flavor: '"江南这一带，规矩由我定！"', skills: [{ name: '横扫千军', mult: 1.95, chance: .42 }], reward: { silver: 300, item: 'w_tiejian' } }),
  dugucan: boss('剑痴 · 独孤残', 14, { flavor: '"三十年了……终于有人配让我出剑。"', skills: [{ name: '独孤剑意', mult: 2.0, chance: .38 }], reward: { silver: 900, skill: 'dugu', item: 'w_poJunjian' } }),
  jinlunseng: boss('蒙古国师 · 金轮僧', 24, { flavor: '"龙象般若，十龙十象之力！"', skills: [{ name: '五轮齐飞', mult: 2.6, chance: .45 }], reward: { silver: 2200, potions: { dahuan: 2 }, sp: 'feilin' } }),
  shalifei: boss('大漠凶鹰 · 沙里飞', 28, { flavor: '"大漠孤烟直，长河落日……刀！"', skills: [{ name: '连环旋风刀', mult: 2.45, chance: .42 }], reward: { silver: 3200, item: 'a_ruanweijia' } }),
  guimian: boss('鬼面判官', 31, { hpMul: 8.8, atkMul: 2.0, flavor: '"生死簿上，又添一名。"', skills: [{ name: '勾魂锁链', mult: 3.2, chance: .55 }], reward: { silver: 4500, potions: { dahuan: 3 } } }),
  duanyanping: boss('大理逆徒 · 段延平', 35, { flavor: '"段氏的江山，本来就该是我的！"', skills: [{ name: '一阳指 · 邪焰', mult: 2.3, chance: .4 }, { name: '段家剑 · 血影', mult: 1.8, chance: .32 }], reward: { silver: 6500, potions: { xuelian: 2 }, sp: 'daliYudai' } }),
  chenguiseng: boss('恶僧 · 成鬼僧', 39, { flavor: '"混元霹雳功成之日，便是尔等授首之时！"', skills: [{ name: '幻阴指', mult: 2.45, chance: .4 }], reward: { silver: 9000, skill: 'qiankun', sp: 'shenghuo' } }),
  dinglaoguai: boss('星宿老怪 · 丁老怪', 43, { flavor: '"星宿老仙，法力无边！"', skills: [{ name: '化功绵掌', mult: 2.45, chance: .4 }], reward: { silver: 12000, sp: 'shexinZhu' } }),
  yuehuagongzhu: boss('月华宫主', 47, { atkMul: 1.58, flavor: '"能接我三掌者，方可离去。"', skills: [{ name: '明玉掌', mult: 1.85, chance: .35 }, { name: '移花接玉', mult: 1.4, chance: .22, lifesteal: .45 }], reward: { silver: 18000, sp: 'jianhun' } }),
  dongfangyao: boss('魔教教主 · 东方曜', 50, { flavor: '"日出东方，唯我不败！"', skills: [{ name: '日月同辉', mult: 2.3, chance: .35 }, { name: '魔功滔天', mult: 2.6, chance: .25 }], reward: { silver: 50000 } }),
  // 支线
  taohuaDaozhu: boss('桃花岛主 · 黄青霞', 11, { flavor: '"五行八卦，生门在西北。找得到，算你赢。"', skills: [{ name: '碧海潮生', mult: 2.2, chance: .4 }], reward: { silver: 800, item: 'acc_yuxiao' }, side: true }),
  qiutiezhang: boss('铁掌帮主 · 裘铁掌', 19, { flavor: '"铁掌水上漂？不，今天漂的是你。"', skills: [{ name: '铁掌催心', mult: 2.2, chance: .4 }], reward: { silver: 1500, potions: { dahuan: 2 } }, side: true }),
  ouyanggu: boss('白驼山主 · 欧阳孤', 34, { flavor: '"老毒物这一称号，可不是白叫的。"', skills: [{ name: '灵蛇拳', mult: 2.2, chance: .38 }, { name: '蛤蟆功', mult: 2.6, chance: .22 }], reward: { silver: 5000, sp: 'shexinZhu' }, side: true }),
  kunlunyiren: boss('昆仑异人 · 何太岁', 36, { flavor: '"昆仑剑法，天下第五！前面四个都死了。"', skills: [{ name: '昆仑两仪剑', mult: 2.2, chance: .4 }], reward: { silver: 6000, sp: 'bingpo' }, side: true }),
  xingxiuyaonv: boss('星宿妖女 · 阿紫烟', 40, { flavor: '"师门绝学，正好拿你喂毒。"', skills: [{ name: '三笑逍遥散', mult: 2.3, chance: .38 }], reward: { silver: 9000, sp: 'shexinZhu' }, side: true }),
  xiakeshizhe: boss('侠客岛使者', 43, { flavor: '"赏善罚恶，先礼后兵。"', skills: [{ name: '腊八粥掌', mult: 2.35, chance: .38 }], reward: { silver: 13000, sp: 'yinxiongWan' }, side: true }),
  youmingguzhu: boss('幽冥谷主', 45, { flavor: '"进了幽冥谷，就别想活着出去。"', skills: [{ name: '幽冥鬼爪', mult: 2.45, chance: .38 }], reward: { silver: 16000, sp: 'miankilled' }, side: true }),
  riyuezuoshi: boss('日月神教左使', 47, { flavor: '"教主千秋万载，一统江湖！"', skills: [{ name: '葵花点穴手', mult: 2.45, chance: .36 }], reward: { silver: 20000, sp: 'heimuLing' }, side: true })
};

const STORY_AFTER = {
  zhouba: '周霸被你一记重手打得跪地求饶，围观百姓欢声雷动！\n当晚，说书人已把你的名字编进了新书。你的同伴苏杏儿为你包扎伤口，轻声说："这一路，我陪你走下去。"',
  dugucan: '独孤残弃剑长笑："痛快！我的剑，等的就是你这样的人！"\n他将毕生所悟的「独孤九剑」倾囊相授，又赠佩剑"破军"。落魄剑客沈孤鸿在旁看得心折，当场拜你为主："沈某这条命，往后跟着公子了。"',
  jinlunseng: '金轮僧五轮尽碎，仓皇北遁。襄阳城头，守将亲自为你斟酒。\n江湖传言：蒙古国师折戟襄阳，折在一个后生晚辈手里。',
  shalifei: '沙里飞的弯刀断为两截，马贼群龙无首，作鸟兽散。\n商会送来重金相谢，大漠商路重新畅通。',
  guimian: '鬼面判官的面具裂成两半："不可能……教主的『日月神功』明明……"\n他咬破毒囊气绝。怀中密令写着下一个目标：大理段氏。事不宜迟！',
  duanyanping: '段延平的一阳指尽散，瘫坐在段家祠堂前。段氏家主握着你的手连声道谢，取出族中秘藏相赠。\n但魔教的黑手，已经伸向了西域光明顶。',
  chenguiseng: '成鬼僧奸计败露，伏诛于光明顶。六大派与魔教的血战，因你而止戈。\n明教教众以圣火令相赠，谢你化解这场弥天大祸。而星宿老怪，已在赶往天山的路上。',
  dinglaoguai: '丁老怪周身剧毒反噬，葬身于自己炼的毒沼。灵鹫宫上下对你感激涕零。\n宫主临别时道："东海之滨，移花岛主也在等一场劫数。你若得闲，请移步相助。"',
  yuehuagongzhu: '月华宫主收掌而立，淡淡道："三掌之内，你未败。江湖后浪，果真凶猛。"\n她告知你黑木崖秘径，又赠剑魂三枚："东方曜武功通神，此去黑木崖，千万小心。"',
  dongfangyao: '东方曜仰天长笑，笑声渐弱："日出东方……唯我不败……哈哈，哈哈哈……原来『败』字，是这般滋味……"\n魔教教主陨落，群雄欢声雷动。你仗剑立于黑木崖之巅，看一轮红日喷薄而出——从此江湖上，有你的传说。'
};

// 敌人名词库（按地域）
const ENEMY_POOLS = {
  jiangnan: ['市井地痞', '剪径山贼', '恶霸家奴', '泼皮刀客', '水寨匪兵', '盐枭打手', '采花大盗', '黑店伙计', '码头把头', '漕帮恶徒'],
  zhongyuan: ['落魄剑客', '华山门人', '全真道人', '江洋大盗', '铁掌帮众', '黑店掌柜', '镖局恶徒', '欺行霸市', '地痞头目', '雪山派弟子'],
  saibei: ['大漠沙盗', '马贼游骑', '沙漠毒蝎', '铁骑哨兵', '溃军乱兵', '草原狼群', '雪原饿熊', '边关逃卒', '马匪头目', '胡商护卫'],
  xiyu: ['魔教教众', '假行脚僧', '火焰刀客', '白驼山仆', '星宿弟子', '楼兰马贼', '昆仑叛徒', '幻音坊刺客', '波斯胡商', '邪派妖人'],
  chuanshu: ['青城打手', '蜀中刀客', '岷江水匪', '唐门叛徒', '川中盐枭', '青衣盗', '猛虎', '毒瘴巨蟒', '蜀绣坊恶少', '栈道劫匪'],
  diannan: ['五毒教众', '苗疆蛊师', '大理叛卒', '茶马古道匪', '澜沧江水贼', '毒沼蜈蚣', '象兵逃卒', '药贩骗子', '象鼻虫群', '南疆巫师'],
  haiwai: ['岛上死士', '宫装侍女', '玄冰护法', '海盗倭寇', '海沙帮众', '灵蛇岛毒蛇', '鲸波帮舵主', '渔村恶霸', '海外散修', '荒岛野人'],
  moyu: ['魔教死士', '黑崖长老', '黑衣刺客', '血刀门人', '日月坛主', '幽冥谷鬼卒', '圣火坛香主', '魔教供奉', '摄魂使者', '黑木崖守卫']
};

// 地域风味文本
const REGION_FLAVOR = {
  jiangnan: ['小桥流水，酒旗招展，你倚着乌篷船看流水，心潮起伏。', '茶馆里说书人正讲到"乔峰三掌退群雄"，满堂喝彩。', '细雨斜织，你信步走过青石板长街。'],
  zhongyuan: ['古道西风，你与过往镖师抱拳而过。', '官道旁茶棚里，江湖客们正议论着最新的悬赏令。', '远山如黛，中原的辽阔让你心胸一宽。'],
  saibei: ['大漠孤烟，长河落日，你的影子被夕阳拉得很长。', '驼铃声声，商队的白骨半掩在黄沙之下。', '北风如刀，你裹紧了斗篷。'],
  xiyu: ['胡笳与驼铃交错，异域的风沙扑面而来。', '残阳下的古城，仿佛还回荡着千年前的战鼓。', '葡萄美酒夜光杯，你与胡商举碗共饮。'],
  chuanshu: ['蜀道之难，难于上青天。你攀着铁索，脚下是万丈深渊。', '青城天下幽，你在道观钟声里缓缓吐纳。', '火锅香气里，你听川中豪杰大摆龙门阵。'],
  diannan: ['风花雪月，苍山洱海，你竟有些不想走了。', '竹楼傣寨，象脚鼓声里姑娘们翩翩起舞。', '茶马古道，马蹄声碎，铃声悠远。'],
  haiwai: ['海风拂过甲板，落霞与孤鹜齐飞。', '你踩着细软的白沙，看远处海天一色。', '渔火点点，你与老渔民换了一壶浊酒。'],
  moyu: ['崖壁上悬挂着森森骷髅，魔教以此立威。', '山风呜咽，如万千冤魂夜哭。', '你紧了紧手中兵刃，一步一步向前走去。']
};

// 伙伴（16 名）
// role: atk 攻 / tank 坦 / heal 医 / sup 辅
const COMPANIONS = {
  suxinger:  { name: '俏药师 · 苏杏儿', role: 'heal', from: '第一章后于牛家村结伴', recruit: 'story1', desc: '牛家村药铺的女儿，医术得自乃父真传。你说要闯江湖，她背起药箱就跟你走了。', skill: '素手回春' },
  shenguhong: { name: '落魄剑客 · 沈孤鸿', role: 'atk', from: '第二章后于华山结拜', recruit: 'story2', desc: '十年磨一剑，霜刃未曾试。败给你之后，他把剑擦了又擦："服了，跟你混。"', skill: '孤鸿掠影' },
  fuhonjiang: { name: '白衣秀士 · 傅寒江', role: 'sup', from: '第九章移花岛同船', recruit: 'story9', desc: '手持折扇，满腹经纶。移花岛账房先生，运筹帷幄，决胜千里之外。', skill: '扇底风雷' },
  afu:       { name: '小叫花 · 阿福', role: 'atk', from: '嘉兴城奇遇', recruit: 'event', map: 'jiaxing', lvReq: 6, desc: '丐帮小叫花，机灵古怪，一手打狗棒使得有模有样。', skill: '打狗棒法 · 起手式' },
  liuruyan:  { name: '女飞贼 · 柳如烟', role: 'atk', from: '开封府奇遇', recruit: 'event', map: 'kaifeng', lvReq: 21, desc: '轻功卓绝，专偷贪官污吏。她说屋檐上的月色，比地上的好看。', skill: '踏瓦无声' },
  oyeeqing:  { name: '铁匠 · 欧冶青', role: 'tank', from: '襄阳城雇请', recruit: 'hire', map: 'xiangyang', cost: 800, desc: '铸剑世家传人，臂力惊人。锻造费用 -25%。', skill: '铁锤横扫', perk: 'forgeCost' },
  zhaotiejian: { name: '镖师 · 赵铁肩', role: 'tank', from: '洛阳城雇请', recruit: 'hire', map: 'luoyang', cost: 600, desc: '走镖二十年，一身横练功夫，挡在你身前像一堵墙。', skill: '铁肩担道' },
  baixiaosheng: { name: '说书人 · 百晓生', role: 'sup', from: '襄阳城雇请', recruit: 'hire', map: 'xiangyang', cost: 1000, desc: '兵器谱排名的编纂者。有他在，悬赏奖励 +25%。', skill: '评书惊堂', perk: 'bounty' },
  huyantie:  { name: '大漠刀客 · 呼延铁', role: 'tank', from: '大同府雇请', recruit: 'hire', map: 'datong', cost: 900, desc: '大漠里活下来的刀客，刀疤比刀法更有名。', skill: '铁血刀势' },
  lanxieer:  { name: '毒仙子 · 蓝蝎儿', role: 'atk', from: '星宿海奇遇', recruit: 'event', map: 'xingxiuhai', lvReq: 40, desc: '用毒救人，也用毒杀人。她的袖箭淬着七步断肠散。', skill: '蝎尾毒针' },
  xueyan:    { name: '灵鹫侍女 · 雪雁', role: 'heal', from: '灵鹫峰奇遇', recruit: 'event', map: 'lingjiufeng', lvReq: 42, desc: '灵鹫宫侍女，一手天山疗伤术出神入化。', skill: '天山雪暖' },
  aheng:     { name: '桃花岛婢 · 阿蘅', role: 'sup', from: '桃花岛奇遇', recruit: 'event', map: 'taohuadao', lvReq: 10, desc: '桃花岛主的婢女，通晓奇门五行，辅助得力。', skill: '桃花阵法' },
  batulu:    { name: '蒙古力士 · 巴图鲁', role: 'tank', from: '蒙古草原奇遇', recruit: 'event', map: 'caoyuan', lvReq: 24, desc: '那达慕摔跤冠军，能徒手撂倒一匹烈马。他叫你"安达"。', skill: '草原摔技' },
  shiajiu:   { name: '剑冢守童 · 石阿九', role: 'atk', from: '比武大会夺魁', recruit: 'tournament', desc: '守着剑冢长大的少年，剑法无师自通。比武大会后死心塌地跟着你。', skill: '石破天惊' },
  ganxiaomei: { name: '铸剑传人 · 干小妹', role: 'sup', from: '昆仑山奇遇', recruit: 'event', map: 'kunlun', lvReq: 36, desc: '铸剑世家最后传人。锻造成功率 +10%。', skill: '锻气加身', perk: 'forgeRate' },
  yewushuang: { name: '影卫 · 夜无双', role: 'atk', from: '幽冥谷救出', recruit: 'event', map: 'youminggu', lvReq: 45, desc: '魔教影卫，因抗命被囚十年。他话不多，出刀很快。', skill: '无影暗杀' }
};
