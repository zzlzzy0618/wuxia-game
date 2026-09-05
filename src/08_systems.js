/* ============ 玩法系统：悬赏榜 · 锻造 · 比武大会 · 称号 ============ */

// —— 悬赏榜 ——
function ensureBounty() {
  if (!flags.bounty) flags.bounty = { round: 1, list: null, done: {} };
  if (!flags.bounty.list) genBounties();
}
function genBounties() {
  if (!flags.bounty) flags.bounty = { round: 1, list: null, done: {} };
  const list = [];
  const nearMaps = MAPS.filter(m => Math.abs(m.lv - P.lv) <= 6);
  for (let i = 0; i < 4; i++) {
    const m = nearMaps.length ? pick(nearMaps) : pick(MAPS);
    const lv = clamp(P.lv + rnd(-2, 3), 1, 52);
    const name = pick(ENEMY_POOLS[m.region]);
    list.push({
      key: flags.bounty.round + '_' + i,
      name, lv, mapName: m.name,
      silver: 60 + lv * 42, exp: 30 + lv * 14
    });
  }
  flags.bounty.list = list;
}
function openBounty() {
  ensureBounty();
  const rows = flags.bounty.list.map(b => {
    const done = flags.bounty.done[b.key];
    return `<div class="list-row bounty-row">
      <div class="grow"><b>${b.name}</b>（${b.lv}级）<small>现身于${b.mapName} · 赏金 ${b.silver} 两 · 经验 ${b.exp}${done ? ' · 已完成' : ''}</small></div>
      ${done ? '<span class="tag">已了结</span>' : `<button class="btn btn-sm btn-primary" data-bt="${b.key}">缉拿</button>`}
    </div>`;
  }).join('');
  modal('悬赏榜 · 六扇门',
    `<p class="muted" style="margin-bottom:6px">官府张榜，缉拿江湖恶徒。了结一单，赏银结清。<b>百晓生随行时赏金 +25%</b>。你已了结 <b>${flags.bountyCount || 0}</b> 单。</p>${rows}
     <div class="divider"></div>
     <p class="muted">榜单自有更新之时——花 80 两银子，托捕快换一批新榜。</p>`,
    [{ label: '关闭', fn: null }, { label: '换一批（80两）', primary: true, fn: refreshBounty }]);
  $('#modal-root').querySelectorAll('[data-bt]').forEach(b => b.addEventListener('click', () => {
    const key = b.dataset.bt;
    const target = flags.bounty.list.find(x => x.key === key);
    if (!target) return;
    closeModal();
    const e = GEN.mkEnemy(target.name, target.lv, {
      hpMul: 1.6, atkMul: 1.05, silMul: 0, expMul: 1,
      flavor: '"官府画影图形捉拿的，就是老子？"'
    });
    curMap = (MAPS.find(m => m.name === target.mapName) || MAPS.find(m => m.id === curMap) || MAPS[0]).id;
    startBattle(e, { bountyKey: key });
  }));
}
function refreshBounty() {
  if (P.silver < 80) return toast('银两不足。');
  P.silver -= 80;
  flags.bounty.round++;
  genBounties();
  Sfx.coin();
  save();
  openBounty();
}

// —— 锻造 ——
function forgeInfo(slot) {
  const id = P[slot];
  if (!id) return null;
  const it = ITEMS[id];
  const star = forgeStar(id);
  const matTier = clamp(it.tier, 1, 5);
  const matNeed = star + 1;
  const cost = Math.round((120 + it.tier * 90) * (star + 1) * (hasPerk('forgeCost') ? .75 : 1));
  const rate = clamp(.92 - star * .07, .25, .95) + (hasPerk('forgeRate') ? .1 : 0);
  return { id, it, star, matTier, matNeed, cost, rate };
}
function starStr(n) { return '★'.repeat(n) + '☆'.repeat(10 - n); }
function openForge() {
  const slots = ['weapon', 'armor', 'acc'].map(slot => {
    const f = forgeInfo(slot);
    if (!f) return `<div class="list-row"><div class="grow"><b>${{ weapon: '兵刃', armor: '护甲', acc: '饰品' }[slot]}</b><small>尚未装备</small></div></div>`;
    const mats = countMat(f.matTier);
    const needSoul = f.it.tier === 6;
    const soulOk = !needSoul || (P.bag['sp_jianhun'] || 0) >= 1;
    const can = f.star < 10 && mats >= f.matNeed && P.silver >= f.cost && soulOk;
    const statTxt = f.it.slot === 'weapon'
      ? `攻击 +${f.it.atk + forgeAdd(f.it.atk, f.id)}`
      : f.it.slot === 'armor' ? `防御 +${f.it.def + forgeAdd(f.it.def, f.id)}` : f.it.desc.replace(/^.*——/, '');
    return `<div class="list-row">
      <div class="grow"><b>${f.it.name}</b><span class="forge-star">${starStr(f.star)}</span>
        <small>${statTxt} · ${f.it.tier}阶装备 · 需 ${f.matTier}阶材料 ×${f.matNeed}（有 ${mats}）${needSoul ? ' · 剑魂 ×1' : ''} · 银两 ${f.cost} · 成功率 ${fmtPct(f.rate)}</small></div>
      ${f.star >= 10 ? '<span class="tag">+10 极限</span>' : `<button class="btn btn-sm btn-gold" data-fg="${slot}" ${can ? '' : 'disabled'}>锻造</button>`}
    </div>`;
  }).join('');
  modal('锻造 · 铸剑山庄',
    `<p class="muted" style="margin-bottom:6px">千锤百炼，方成神兵。强化 +1 至 +10，每星提升基础属性 8%（至少 +1）。<b>失败会掉一星</b>，还请三思。
     ${hasComp('oyeeqing') && P.compActive.includes('oyeeqing') ? '欧冶青随行：费用 -25%。' : ''}${hasComp('ganxiaomei') && P.compActive.includes('ganxiaomei') ? '干小妹随行：成功率 +10%。' : ''}</p>
     <div class="divider"></div>${slots}
     <div class="divider"></div>
     <p class="muted">材料来自探索与战斗缴获；神兵（六阶）另需「剑魂」。当前持有剑魂 ×${P.bag['sp_jianhun'] || 0}。</p>`,
    [{ label: '关闭', fn: null }, { label: '收锤歇业', primary: true }]);
  $('#modal-root').querySelectorAll('[data-fg]').forEach(b => b.addEventListener('click', () => {
    doForge(b.dataset.fg);
  }));
}
function doForge(slot) {
  const f = forgeInfo(slot);
  if (!f) return;
  if (f.star >= 10) return toast('已达锻造极限。');
  if (countMat(f.matTier) < f.matNeed) return toast('材料不足。');
  if (P.silver < f.cost) return toast('银两不足。');
  if (f.it.tier === 6 && !(P.bag['sp_jianhun'] >= 1)) return toast('神兵锻造需要「剑魂」。');
  consumeMat(f.matTier, f.matNeed);
  if (f.it.tier === 6) removeItem('sp_jianhun', 1);
  P.silver -= f.cost;
  closeModal();
  if (Math.random() < f.rate) {
    P.forge[f.id] = f.star + 1;
    P.forgeSucc++;
    recompute();
    Sfx.forge();
    log(`锻造成功！「${f.it.name}」升至 +${f.star + 1}。`, 'good');
    modal('百炼成钢',
      `<p>炉火纯青，一声清鸣——「<b>${f.it.name}</b>」锻造成功，升至 <b class="gold">+${f.star + 1}</b>！</p>
       <p class="muted">${starStr(f.star + 1)}</p>`,
      [{ label: '再锻', fn: () => openForge() }, { label: '好剑！', primary: true, fn: () => { renderStatus(); save(); } }]);
    checkTitles();
    save();
  } else {
    if (f.star > 0) P.forge[f.id] = f.star - 1;
    recompute();
    Sfx.fail();
    log(`锻造失败，「${f.it.name}」${f.star > 0 ? '降为 +' + (f.star - 1) : '纹丝不动'}。`, 'bad');
    modal('功亏一篑',
      `<p>火候差了一分，铁胚发出一声闷响——锻造失败${f.star > 0 ? '，「' + f.it.name + '」降为 +' + (f.star - 1) : '，「' + f.it.name + '」幸而无损'}。</p>
       <p class="muted">锻造之道，七分天意，三分人力。</p>`,
      [{ label: '再试', fn: () => openForge() }, { label: '罢了', primary: true, fn: () => { renderStatus(); save(); } }]);
    save();
  }
}

// —— 比武大会 ——
const TOUR = { active: false, step: 0, names: [] };
const TOUR_NAMES = ['铁剑先生', '追风快刀', '判官笔客', '千手书生', '断岳枪王', '踏云女侠', '醉里挑灯客', '百步穿杨手', '寒潭剑影', '燕山怪杰'];

function openTournament() {
  if (P.lv < 10) {
    return modal('比武大会', `<p>台下老者摇了摇头："后生，功夫不到家，上台是挨打。等级 10 再来吧。"</p>`);
  }
  const lvReq = flags.tourLvReq || 10;
  if (P.lv < lvReq) {
    return modal('比武大会',
      `<p>你上次夺魁的余温尚在，擂主不肯再与你交手。</p><p class="muted">冠军需等级 ${lvReq} 后方可再战（磨刀不误砍柴工）。</p>`);
  }
  modal('泰山比武大会',
    `<p>五湖四海的英雄齐聚泰山，擂台三丈，胜负立判。</p>
     <p><b>规则：</b>连胜三场即为魁首。头目级对手，实力随你的声名水涨船高。</p>
     <p>参赛费 <b class="gold">100 两</b>。魁首赏银 <b class="gold">${400 + P.lv * 60} 两</b>，另有名动天下之荣。</p>
     <p class="muted">你已夺冠 ${P.tourWins} 次。</p>`,
    [{ label: '再等等', fn: null }, {
      label: '登台！', primary: true, fn: () => {
        if (P.silver < 100) return toast('银两不足，交不起参赛费。');
        P.silver -= 100;
        startTournament();
      }
    }]);
}
function startTournament() {
  TOUR.active = true;
  TOUR.step = 0;
  TOUR.names = shuffle(TOUR_NAMES).slice(0, 3);
  log('你跃上擂台，与群雄一较高下！', 'sys');
  save();
  tourNext();
}
function tourNext() {
  if (!TOUR.active) return;
  if (TOUR.step >= 3) return tourChampion();
  TOUR.step++;
  const lv = P.lv + TOUR.step - 1;
  const name = TOUR.names[TOUR.step - 1];
  const e = GEN.mkEnemy(name, lv, {
    hpMul: 2.1, atkMul: 1.02, expMul: 2, silMul: 4,
    skills: [{ name: '大会名招', mult: 1.7, chance: .32 }],
    flavor: '"承让了！"'
  });
  startBattle(e, { tournament: true });
}
function tourChampion() {
  TOUR.active = false;
  const silver = 400 + P.lv * 60;
  P.silver += silver;
  P.tourWins++;
  flags.tourLvReq = P.lv + 3;
  let extra = '';
  if (!P.comps.includes('shiajiu')) {
    P.comps.push('shiajiu');
    if (P.compActive.length < 2) P.compActive.push('shiajiu');
    extra += `<p style="margin-top:8px"><b style="color:var(--jade)">守剑冢的少年石阿九看得目眩神驰，当场拜你为师，随你行走江湖！</b></p>`;
  }
  Sfx.victory();
  log(`你在比武大会上连胜三场，夺魁！赏银 ${silver}。`, 'good');
  checkTitles();
  save();
  modal('魁首 · 天下扬名',
    `<p>三场连胜，台下喝彩如雷！你捧起鎏金擂主印，名动江湖。</p>
     <p>获得赏银 <b class="gold">${silver} 两</b>。</p>${extra}
     <p class="muted">擂主放话：待你等级 ${flags.tourLvReq}，再来做过一场。</p>`,
    [{ label: '功成身退', primary: true, fn: () => { renderStatus(); renderHome(); } }]);
}

// —— 称号 ——
function openTitles() {
  const rows = Object.entries(TITLES).map(([id, t]) => {
    const owned = P.titles.includes(id);
    const wearing = P.title === id;
    const fxTxt = Object.entries(t.fx).map(([k, v]) =>
      ({ hp: '气血', mp: '内力', atk: '攻击', def: '防御', spd: '身法', crt: '暴击%' }[k] || k) + '+' + v).join('，') || '无加成';
    return `<div class="list-row" ${wearing ? 'style="background:rgba(78,122,99,.1)"' : ''}>
      <div class="grow"><b>${owned ? t.name : '？？？'}</b> ${wearing ? '<span class="tag jade">佩戴中</span>' : ''}
        <small>${owned ? ('加成：' + fxTxt + ' · ' + t.how) : '尚未获得——' + t.how}</small></div>
      ${owned && !wearing ? `<button class="btn btn-sm" data-tt="${id}">佩戴</button>` : ''}
    </div>`;
  }).join('');
  modal('称号 · 江湖名号',
    `<p class="muted" style="margin-bottom:6px">名号是闯出来的。佩戴一枚称号，获得其加成。</p>${rows}`,
    [{ label: '关闭', fn: null }, { label: '名号加身', primary: true }]);
  $('#modal-root').querySelectorAll('[data-tt]').forEach(b => b.addEventListener('click', () => {
    P.title = b.dataset.tt;
    recompute();
    Sfx.click();
    toast('已佩戴称号「' + TITLES[P.title].name + '」。');
    save();
    closeModal();
    openTitles();
    renderStatus();
  }));
}
