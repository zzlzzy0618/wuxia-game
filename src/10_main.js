/* ============ 主逻辑：新游戏 · 探索 · 升级 · 初始化 ============ */

function newGame() {
  const name = ($('#name-input').value || '').trim() || '无名侠客';
  P = {
    v: 2, name, sect: selectedSect, lv: 1, exp: 0,
    hp: 1, mp: 1, hpMax: 1, mpMax: 1, atk: 0, def: 0, spd: 0, crt: 0, regen: 0,
    silver: 120,
    bag: { pot_jinchuang: 3, pot_neixi: 2 },
    weapon: null, armor: null, acc: null, forge: {},
    skills: ['basic'],
    rtSkill: null, rtSkill2: null, inSkill: null, agSkill: null,
    bonus: { hp: 0, mp: 0, atk: 0, def: 0, spd: 0, crt: 0 },
    comps: [], compActive: [],
    titles: ['newbie'], title: 'newbie',
    kills: 0, bossKills: 0, tourWins: 0, forgeSucc: 0
  };
  recompute();
  P.hp = P.hpMax; P.mp = P.mpMax;
  grantSkill(selectedSect + '_s0');
  recompute();
  P.hp = P.hpMax; P.mp = P.mpMax;
  flags = {
    ch: 1, doneEvents: {}, bossBeaten: {},
    bounty: null, bountyCount: 0, tourLvReq: 10, shop: null,
    muted: Sfx.muted, ended: false
  };
  curMap = 'niujiacun';
  $('#log').innerHTML = '';
  log('你背起行囊，提剑踏出柴门。江湖路远，就此启程！', 'sys');
  show('#screen-home');
  renderHome();
  save();
  modal('序章 · 出门',
    `<p>大江东去，浪淘尽，千古风流人物。</p>
     <p>武林风云再起——魔教<b>"日月神宗"</b>卷土重来，黑木崖号令一出，江湖血雨腥风。</p>
     <p>你是江南小镇一介布衣少年，机缘巧合拜入${SECTS[P.sect].name}门下。今日仗剑出门，前路有刀光剑影，有快意恩仇，也有萍水相逢。</p>
     <p class="muted">小提示：先「探索」历练几级，逛逛「悬赏榜」赚些银两；伙伴、锻造、比武大会都会随声名渐起而解锁。黑木崖的决战，在第五十章等你。</p>`,
    [{ label: '踏入江湖', primary: true }]);
}

// ---------- 升级 ----------
function gainExp(n) {
  P.exp += n;
  const ups = [];
  while (P.exp >= expNeed(P.lv) && P.lv < 50) {
    P.exp -= expNeed(P.lv);
    P.lv++;
    const before = { hp: P.hpMax, mp: P.mpMax, atk: P.atk, def: P.def, spd: P.spd, crt: P.crt };
    recompute();
    P.hp = P.hpMax; P.mp = P.mpMax;
    ups.push(`等级提升至 <b>${P.lv}</b> 级！气血+${P.hpMax - before.hp}，内力+${P.mpMax - before.mp}，攻+${P.atk - before.atk}，防+${P.def - before.def}，敏+${P.spd - before.spd}，暴+${(P.crt - before.crt).toFixed(1)}%`);
    SECTS[P.sect].skills.forEach((def, i) => {
      const id = P.sect + '_s' + i;
      if (P.lv >= SKILLS[id].lv && !P.skills.includes(id)) {
        const slot = grantSkill(id);
        ups.push(`师父传授门派绝学「<b>${SKILLS[id].name}</b>」${slot ? '，已运功于' + slot : ''}！`);
      }
    });
    reevaluateSlots().forEach(t => ups.push(t));
  }
  if (ups.length) {
    recompute();
    P.hp = P.hpMax; P.mp = P.mpMax;
    Sfx.levelup();
    log(ups[0].replace(/<[^>]+>/g, ''), 'good');
    modal('武学精进', ups.map(u => `<p>🎉 ${u}</p>`).join(''));
    checkTitles();
    save();
  }
}

// ---------- 探索 ----------
function explore() {
  if (B) return;
  const map = MAPS.find(m => m.id === curMap) || MAPS[0];
  // 奇遇事件（一次性）
  const avail = (map.events || []).filter(ev => !flags.doneEvents[ev.id] && P.lv >= (ev.lvReq || 1));
  if (avail.length) {
    const ev = pick(avail);
    flags.doneEvents[ev.id] = true;
    let gains = [];
    if (ev.skill) {
      const slot = grantSkill(ev.skill);
      recompute();
      gains.push(`习得绝学「<b>${SKILLS[ev.skill].name}</b>」${slot ? '，真气自行运于' + slot : ''}！`);
    }
    if (ev.bonus) {
      Object.entries(ev.bonus).forEach(([k, v]) => { P.bonus[k] = (P.bonus[k] || 0) + v; });
      recompute();
      gains.push('体魄脱胎换骨：' + Object.entries(ev.bonus).map(([k, v]) => ({ atk: '攻', def: '防', hp: '气血上限', mp: '内力上限' }[k] || k) + '+' + v).join('，'));
    }
    if (ev.comp && !P.comps.includes(ev.comp)) {
      P.comps.push(ev.comp);
      if (P.compActive.length < 2) P.compActive.push(ev.comp);
      gains.push(`<b style="color:var(--jade)">「${COMPANIONS[ev.comp].name}」加入队伍！</b>`);
    }
    Sfx.levelup();
    log(`【奇遇】${ev.title}！`, 'sys');
    modal(ev.title,
      `<p style="white-space:pre-line">${ev.text}</p>${gains.length ? '<div class="divider"></div>' + gains.map(g => `<p>${g}</p>`).join('') : ''}`,
      [{ label: '善哉', primary: true, fn: () => renderHome() }]);
    save();
    return;
  }
  const roll = Math.random();
  if (roll < .48) {
    startBattle(pick(GEN.mapEnemies(map)));
    return;
  }
  if (roll < .60) {
    const silver = rnd(20, 40 + P.lv * 10);
    P.silver += silver; Sfx.coin();
    log(`你在路旁拾得一只钱袋，得银两 <b>${silver}</b>。`, 'good');
    toast(`拾得银两 ${silver} 两`);
  } else if (roll < .76) {
    const d = rollDrop();
    addItem(d, 1);
    Sfx.coin();
    log(`你寻得一件物事：<b>${ITEMS[d].name}</b>。`, 'good');
    toast(`拾得「${ITEMS[d].name}」`);
  } else if (roll < .92) {
    const exp = 6 + P.lv * 2;
    const flavor = pick(REGION_FLAVOR[map.region]);
    log(flavor);
    gainExp(exp);
    toast(`行走见闻，经验 +${exp}`);
  } else {
    log('你寻了一处茶棚歇脚，听南来北往的客人讲江湖轶事，不觉日已西斜。');
    toast('茶棚闲话，江湖又多了一段传闻');
  }
  renderHome();
}

// ---------- 头目挑战 ----------
function challengeBoss(bossId) {
  const boss = BOSSES[bossId];
  modal('誓师一战',
    `<p><b>${boss.name}</b>（等级 ${boss.lv}）</p>
     <p class="muted">${boss.flavor}</p>
     <div class="divider"></div>
     <p>此战<b>誓死一搏，无法逃走</b>。战败将损失两成银两。</p>
     <p>你的状态：气血 ${P.hp}/${P.hpMax}，内力 ${P.mp}/${P.mpMax}，攻 ${P.atk}，防 ${P.def}。随行：${P.compActive.length ? P.compActive.map(id => COMPANIONS[id].name.split(' · ')[1]).join('、') : '无'}。</p>
     <p class="muted">若无把握，可先探索练级、锻造兵刃、购置丹药。</p>`,
    [{ label: '再准备准备', fn: null }, {
      label: '拔剑 · 决一死战', primary: true, fn: () => {
        const e = GEN.mkEnemy(boss.name, boss.lv, {
          hpMul: boss.hpMul, atkMul: boss.atkMul, expMul: boss.expMul, silMul: boss.silMul,
          skills: boss.skills, flavor: boss.flavor
        });
        startBattle(e, { bossId });
      }
    }]);
}

// ---------- 修炼 / 歇息 ----------
function train() {
  const cost = 10 + 12 * P.lv, gain = 18 * P.lv + 30;
  if (P.silver < cost) return toast('银两不足，无法安心打坐。');
  P.silver -= cost;
  if (Math.random() < .12) {
    const dmg = Math.round(P.hpMax * .15);
    P.hp = Math.max(1, P.hp - dmg);
    log('打坐时心浮气躁，走火入魔，气血受损！', 'bad');
    renderStatus(); save();
    modal('走火入魔', `<p>你强冲经脉，真气逆行，气血受损 <b class="red">${dmg}</b> 点。</p><p class="muted">练功贵在循序渐进，切忌急于求成。</p>`);
    return;
  }
  log(`你盘膝打坐，参悟武学至理。经验 +${gain}，银两 -${cost}。`, 'sys');
  gainExp(gain);
  renderHome();
  toast(`打坐参悟，经验 +${gain}`);
  save();
}
function rest() {
  const cost = 4 * P.lv + 6;
  if (P.hp === P.hpMax && P.mp === P.mpMax) return toast('你精神饱满，无需歇息。');
  if (P.silver < cost) return toast('银两不足，掌柜的翻了翻白眼。');
  P.silver -= cost;
  P.hp = P.hpMax; P.mp = P.mpMax;
  Sfx.heal();
  log(`你在客栈美美睡了一觉，气血内力尽复（花费 ${cost} 两）。`, 'good');
  renderStatus(); save();
  toast('一夜好眠，气血内力尽复');
}

// ---------- 初始化 ----------
function restoreSave(d) {
  P = d.p; flags = d.flags;
  P.bonus = P.bonus || {}; P.bag = P.bag || {}; P.forge = P.forge || {};
  P.comps = P.comps || []; P.compActive = P.compActive || [];
  P.titles = P.titles || ['newbie'];
  if (!P.titles.includes('newbie')) P.titles.push('newbie');
  // 旧档迁移：补齐武学运功槽
  if (!P.rtSkill && !P.rtSkill2 && !P.inSkill && !P.agSkill) {
    P.skills.slice().forEach(id => autoEquip(id));
  }
  curMap = flags.loc || 'niujiacun';
  if (!MAPS.find(m => m.id === curMap)) curMap = 'niujiacun';
  Sfx.muted = !!flags.muted;
  $('#mute-btn').textContent = Sfx.muted ? '✕' : '♪';
  recompute();
  show('#screen-home');
  renderHome();
  log('你抖了抖衣上的风尘，重出江湖。', 'sys');
}

function init() {
  SKILLS = GEN.buildSkills();
  ITEMS = GEN.buildItems();
  GEN.SKILLS = SKILLS; GEN.ITEMS = ITEMS;

  renderCreate();

  $('#btn-new').addEventListener('click', () => { Sfx.ensure(); Sfx.click(); show('#screen-create'); });
  $('#btn-start').addEventListener('click', () => {
    if (!selectedSect) return toast('请先择一门派拜师。');
    Sfx.ensure(); Sfx.click();
    newGame();
  });
  $('#btn-about').addEventListener('click', about);
  $('#mute-btn').addEventListener('click', () => {
    Sfx.ensure(); Sfx.muted = !Sfx.muted;
    $('#mute-btn').textContent = Sfx.muted ? '✕' : '♪';
    if (flags) { flags.muted = Sfx.muted; save(); }
  });

  const d = loadSave();
  if (d) {
    $('#btn-continue').style.display = '';
    $('#btn-continue').addEventListener('click', () => { Sfx.ensure(); Sfx.click(); restoreSave(d); });
  }

  $('#btn-explore').addEventListener('click', explore);
  $('#btn-travel').addEventListener('click', openMap);
  $('#btn-companions').addEventListener('click', openCompanions);
  $('#btn-bounty').addEventListener('click', openBounty);
  $('#btn-forge').addEventListener('click', openForge);
  $('#btn-tournament').addEventListener('click', openTournament);
  $('#btn-titles').addEventListener('click', openTitles);
  $('#btn-rest').addEventListener('click', rest);
  $('#btn-train').addEventListener('click', train);
  $('#btn-shop').addEventListener('click', openShop);
  $('#btn-bag').addEventListener('click', openBag);
  $('#btn-skills').addEventListener('click', openSkills);
  $('#btn-stats').addEventListener('click', openStats);
}
init();
