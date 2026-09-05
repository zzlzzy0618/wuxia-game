/* ============ UI：弹窗 · 渲染 · 各界面 ============ */

// ---------- 屏幕切换 ----------
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ---------- 弹窗（队列，避免覆盖）----------
const mQueue = [];
function modal(title, bodyHtml, buttons) {
  if ($('#modal-root').classList.contains('show')) {
    mQueue.push([title, bodyHtml, buttons]);
    return;
  }
  const root = $('#modal-root');
  buttons = buttons || [{ label: '确 定', primary: true, fn: null }];
  const btns = buttons.map((b, i) =>
    `<button class="btn ${b.primary ? 'btn-primary' : ''}" data-mbtn="${i}">${b.label}</button>`).join('');
  root.innerHTML = `<div class="overlay"></div>
    <div class="modal panel"><h2>${title}</h2><hr class="hr"><div class="body">${bodyHtml}</div>
    <div class="foot">${btns}</div></div>`;
  root.classList.add('show');
  root.querySelectorAll('[data-mbtn]').forEach(el => {
    el.addEventListener('click', () => {
      const b = buttons[+el.dataset.mbtn];
      Sfx.ensure(); Sfx.click();
      closeModal();
      if (b && b.fn) b.fn();
    });
  });
}
function closeModal() {
  $('#modal-root').classList.remove('show');
  $('#modal-root').innerHTML = '<div class="overlay"></div>';
  if (mQueue.length) {
    const [t, b, btns] = mQueue.shift();
    modal(t, b, btns);
  }
}
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 1600);
  setTimeout(() => t.remove(), 2000);
}

// ---------- 日志 ----------
function log(msg, cls = '') {
  const box = $('#log');
  const p = document.createElement('p');
  p.className = cls; p.innerHTML = msg;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}
function blog(msg, cls = '') {
  const box = $('#battle-log');
  const p = document.createElement('p');
  p.className = cls; p.innerHTML = msg;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

// ---------- 状态栏 ----------
function renderStatus() {
  $('#sb-name').innerHTML = `${esc(P.name)}<small>${SECTS[P.sect].name} · ${P.lv}级 · ${SECTS[P.sect].tag}</small>`;
  const hpP = clamp(P.hp / P.hpMax * 100, 0, 100), mpP = clamp(P.mp / P.mpMax * 100, 0, 100), xpP = clamp(P.exp / expNeed(P.lv) * 100, 0, 100);
  $('#sb-hp-t').textContent = `气血 ${P.hp} / ${P.hpMax}`;
  $('#sb-mp-t').textContent = `内力 ${P.mp} / ${P.mpMax}`;
  $('#sb-hp-f').style.width = hpP + '%';
  $('#sb-mp-f').style.width = mpP + '%';
  $('#sb-xp-f').style.width = xpP + '%';
  $('#sb-silver').textContent = `银两 ${P.silver}`;
  $('#sb-title').textContent = P.title ? '「' + TITLES[P.title].name + '」' : '';
}

// ---------- 主界面 ----------
function renderHome() {
  const map = MAPS.find(m => m.id === curMap) || MAPS[0];
  const reg = REGIONS[map.region];
  $('#loc-name').textContent = map.name;
  $('#loc-sub').textContent = `${reg.name} · 建议等级 ${map.lv}`;
  $('#loc-desc').textContent = pick(REGION_FLAVOR[map.region]);

  // 头目按钮：#btn-boss 常驻（主线），支线按钮动态插拔，避免锚点丢失
  const bb = $('#btn-boss');
  const oldSide = $('#btn-side-boss');
  if (oldSide) oldSide.remove();
  const chapter = CHAPTERS[flags.ch - 1];
  let chBoss = null;
  if (chapter && chapter.map === map.id && chapter.boss && !flags.bossBeaten[chapter.boss]) chBoss = BOSSES[chapter.boss];
  if (chBoss) {
    bb.style.display = '';
    bb.disabled = P.lv < chBoss.lv - 3;
    bb.textContent = '挑战 · ' + chBoss.name;
    bb.title = '主线头目，誓死一战，不可逃走！';
    bb.onclick = () => challengeBoss(chBoss.id);
  } else {
    bb.style.display = 'none';
  }
  if (map.bossSide && !flags.bossBeaten[map.bossSide]) {
    const sb = BOSSES[map.bossSide];
    bb.insertAdjacentHTML('afterend', `<button class="btn" id="btn-side-boss" ${P.lv >= sb.lv - 4 ? '' : 'disabled'}>支线 · ${sb.name}</button>`);
    const sbt = $('#btn-side-boss');
    sbt.title = '支线头目，可获珍稀奖励。';
    sbt.onclick = () => challengeBoss(map.bossSide);
  }

  $('#quest-box').innerHTML = `<b style="color:var(--red)">${chapter.text.split('】')[0]}】</b>${chapter.text.split('】')[1] || ''}`;

  const strip = $('#comp-strip');
  strip.innerHTML = P.compActive.length
    ? P.compActive.map(id => {
      const c = COMPANIONS[id];
      return `<span class="comp-chip"><span class="role r-${c.role}">${{ atk: '攻', tank: '坦', heal: '医', sup: '辅' }[c.role]}</span><b>${c.name.split(' · ')[1]}</b></span>`;
    }).join('')
    : '<span class="muted" style="font-size:13px">孤身行走江湖（可在「伙伴」中招募随行）</span>';
  strip.querySelectorAll('.comp-chip').forEach(el => el.addEventListener('click', openCompanions));

  const ab = $('#btn-auto');
  ab.textContent = AUTO.on ? `■ 停止自动 · 已历${AUTO.fights}战` : '自动探索';
  ab.title = AUTO.on ? '点击停止自动历练' : '自动历练：遇敌自战 · 伤重自歇 · 遇强敌自停';

  renderStatus();
  save();
}

// ---------- 拜师（建角色）----------
function renderCreate() {
  const grid = $('#sect-grid');
  grid.innerHTML = Object.entries(SECTS).map(([id, s]) => {
    const names = s.skills.map(d => d[0]);
    const preview = names.slice(0, 3).join(' → ') + ' → … → ' + names[names.length - 1];
    return `<div class="panel sect-card" data-sect="${id}">
      <h3>${s.name} <span class="tag">${s.tag}</span></h3>
      <div class="passive">${s.passive.text}</div>
      <p class="desc">${s.desc}</p>
      <ul>
        <li>气血 ${s.base.hp} · 内力 ${s.base.mp} · 攻 ${s.base.atk} · 防 ${s.base.def} · 敏 ${s.base.spd} · 暴 ${s.base.crt}%</li>
        <li>${preview}</li>
      </ul>
    </div>`;
  }).join('');
  grid.querySelectorAll('.sect-card').forEach(c => {
    c.addEventListener('click', () => {
      Sfx.ensure(); Sfx.click();
      grid.querySelectorAll('.sect-card').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      selectedSect = c.dataset.sect;
    });
  });
}

// ---------- 伙伴 ----------
function compStatus(c) {
  const lvOk = !c.lvReq || P.lv >= c.lvReq;
  if (c.recruit === 'story') return `<span class="tag">主线剧情入队</span>`;
  if (c.recruit === 'tournament') return `<span class="tag">比武夺冠入队</span>`;
  const here = curMap === c.map;
  if (c.recruit === 'hire') {
    return here && P.silver >= c.cost
      ? `<button class="btn btn-sm btn-gold" data-hire="${idOf(c)}">雇请（${c.cost}两）</button>`
      : `<span class="tag">${here ? '银两不足' : '需至' + mapName(c.map)}</span>`;
  }
  return here && lvOk
    ? `<button class="btn btn-sm btn-primary" data-join="${idOf(c)}">结交</button>`
    : `<span class="tag">${here ? '等级不足（需' + c.lvReq + '级）' : '需至' + mapName(c.map) + (c.lvReq ? '（' + c.lvReq + '级）' : '')}</span>`;
}
const idOf = c => Object.keys(COMPANIONS).find(k => COMPANIONS[k] === c);
const mapName = id => (MAPS.find(m => m.id === id) || { name: '?' }).name;

function openCompanions() {
  const activeHtml = P.compActive.map(id => {
    const c = COMPANIONS[id];
    return `<div class="list-row equipped">
      <div class="grow"><b>${c.name}</b> <span class="role r-${c.role}">${{ atk: '攻', tank: '坦', heal: '医', sup: '辅' }[c.role]}</span>
        <small>${c.desc} · 随行绝技「${c.skill}」${c.perk ? ' · 天赋：' + ({ forgeCost: '锻造费用-25%', forgeRate: '锻造成功率+10%', bounty: '悬赏赏金+25%' }[c.perk]) : ''}</small></div>
      <button class="btn btn-sm" data-off="${id}">请下</button>
    </div>`;
  }).join('') || '<p class="muted">尚无随行伙伴（最多两人同行）。</p>';

  const rosterHtml = Object.values(COMPANIONS).map(c => {
    const id = idOf(c);
    const joined = P.comps.includes(id);
    return `<div class="list-row">
      <div class="grow"><b>${c.name}</b> <span class="tag">${{ atk: '攻', tank: '坦', heal: '医', sup: '辅' }[c.role]}</span>
        <small>${joined ? c.desc + ' · 「' + c.skill + '」' : '？？？ · ' + c.from}</small></div>
      ${joined
        ? (P.compActive.includes(id) ? '<span class="tag jade">随行中</span>' : `<button class="btn btn-sm" data-on="${id}" ${P.compActive.length >= 2 ? 'disabled' : ''}>随行</button>`)
        : compStatus(c)}
    </div>`;
  }).join('');

  modal('伙伴 · 同行之人',
    `<p class="muted" style="margin-bottom:6px">江湖路远，结伴同行。上阵伙伴会随你出战（最多 2 人）。</p>
     <div class="divider"></div><p><b>随行阵容</b></p>${activeHtml}
     <div class="divider"></div><p><b>江湖名录</b></p>${rosterHtml}`,
    [{ label: '关闭', fn: null }, { label: '后会有期', primary: true }]);

  $('#modal-root').querySelectorAll('[data-on]').forEach(b => b.addEventListener('click', () => {
    if (P.compActive.length >= 2) return toast('最多两人同行。');
    P.compActive.push(b.dataset.on);
    save(); closeModal(); openCompanions();
  }));
  $('#modal-root').querySelectorAll('[data-off]').forEach(b => b.addEventListener('click', () => {
    P.compActive = P.compActive.filter(x => x !== b.dataset.off);
    save(); closeModal(); openCompanions();
  }));
  $('#modal-root').querySelectorAll('[data-hire]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.hire, c = COMPANIONS[id];
    if (P.silver < c.cost) return toast('银两不足。');
    P.silver -= c.cost;
    P.comps.push(id);
    if (P.compActive.length < 2) P.compActive.push(id);
    Sfx.coin();
    log(`你雇请了${c.name}。`, 'good');
    save(); closeModal(); openCompanions(); renderHome();
  }));
  $('#modal-root').querySelectorAll('[data-join]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.join, c = COMPANIONS[id];
    P.comps.push(id);
    if (P.compActive.length < 2) P.compActive.push(id);
    Sfx.levelup();
    modal('结伴同行', `<p>${c.desc}</p><p style="margin-top:8px"><b style="color:var(--jade)">「${c.name}」加入了你的队伍！</b></p>`,
      [{ label: '同去', primary: true, fn: () => { openCompanions(); renderHome(); } }]);
    save();
  }));
}

// ---------- 商店 ----------
function ensureShop() {
  if (!flags.shop) flags.shop = { round: 0, stock: [] };
  if (!flags.shop.stock.length) genShop();
}
function gearByLv(lv) {
  const wTr = WTIER_LV.reduce((acc, need, i) => lv >= need ? i : acc, 0);
  const aTr = [1, 10, 20, 28, 36].reduce((acc, need, i) => lv >= need ? i : acc, 0);
  const cTr = [5, 18, 32].reduce((acc, need, i) => lv >= need ? i : acc, 0);
  const eTr = ETIER_LV.reduce((acc, need, i) => lv >= need ? i : acc, 0);
  const gear = [
    'w_' + rnd(0, WTYPES.length - 1) + '_' + wTr,
    'w_' + rnd(0, WTYPES.length - 1) + '_' + wTr,
    'a_' + rnd(0, ATYPES.length - 1) + '_' + aTr,
    'a_' + rnd(0, ATYPES.length - 1) + '_' + aTr,
    'acc_' + rnd(0, ACC_TYPES.length - 1) + '_' + cTr
  ];
  shuffle(EXTRA_EQUIP.slice()).slice(0, 3).forEach(eq => {
    gear.push(eq.abbr + '_' + rnd(0, eq.shapes.length - 1) + '_' + eTr);
  });
  return gear;
}
function genShop() {
  if (!flags.shop) flags.shop = { round: 0, stock: [] };
  flags.shop.round++;
  const gear = gearByLv(P.lv + 2);
  const pots = shuffle(['pot_jinchuang', 'pot_liaoshang', 'pot_neixi', 'pot_dahuan', 'pot_huichun', 'pot_ningqi', 'pot_xiaohuan', 'pot_guiyuan'])
    .slice(0, 3);
  flags.shop.stock = gear.concat(pots);
}
function openShop() {
  ensureShop();
  const stockRows = flags.shop.stock.map(id => {
    const it = ITEMS[id];
    if (!it) return '';
    const sold = it.cat === 'pot' ? false : flags.shop.sold && flags.shop.sold[flags.shop.round + id];
    return `<div class="list-row">
      <div class="grow"><b>${it.name}</b><small>${it.desc}</small></div>
      <span class="gold">${it.price} 两</span>
      ${sold ? '<span class="tag">已售</span>' : `<button class="btn btn-sm" data-buy="${id}">购买</button>`}
    </div>`;
  }).join('');
  const potRows = ['jinchuang', 'yulu', 'liaoshang', 'neixi', 'ningqi', 'xiaohuan'].map(k => {
    const it = ITEMS['pot_' + k];
    return `<div class="list-row">
      <div class="grow"><b>${it.name}</b> <small>${it.desc}（持有 ${P.bag['pot_' + k] || 0}）</small></div>
      <span class="gold">${it.price} 两</span>
      <button class="btn btn-sm" data-buy="pot_${k}">购买</button>
    </div>`;
  }).join('');
  modal('飞鸽购药 · 万宝商行',
    `<p class="muted" style="margin-bottom:6px">信鸽振翅，隔日即达。你现有 <b class="gold">${P.silver} 两</b>。</p>
     <div class="divider"></div><p><b>本期到货（第 ${flags.shop.round} 期）</b></p>${stockRows}
     <p class="muted" style="margin-top:4px">花 30 两请商行换一批货。</p>
     <div class="divider"></div><p><b>丹药常备</b></p>${potRows}`,
    [{ label: '关闭', fn: null }, { label: '换货（30两）', primary: true, fn: refreshShop }]);
  $('#modal-root').querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.buy, it = ITEMS[id];
    if (P.silver < it.price) return toast('银两不足！');
    P.silver -= it.price;
    addItem(id, 1);
    if (it.cat !== 'pot') { flags.shop.sold = flags.shop.sold || {}; flags.shop.sold[flags.shop.round + id] = true; }
    Sfx.coin(); save();
    toast(`购得「${it.name}」。`);
    closeModal(); openShop(); renderStatus();
  }));
}
function refreshShop() {
  if (P.silver < 30) return toast('银两不足。');
  P.silver -= 30;
  genShop();
  save();
  openShop();
}

// ---------- 行囊 ----------
function equipSlotName(slot) { return { weapon: '兵刃', armor: '护甲', acc: '饰品', head: '头饰', wrist: '护腕', feet: '鞋子', ring: '戒指', belt: '腰带' }[slot]; }
function openBag() {
  const cats = { equip: [], pot: [], mat: [], trs: [], book: [], sp: [] };
  Object.entries(P.bag).forEach(([id, n]) => {
    const it = ITEMS[id];
    if (it) cats[it.cat].push([id, n]);
  });
  const equipHtml = cats.equip.map(([id, n]) => {
    const it = ITEMS[id];
    const worn = EQUIP_SLOTS.some(s => P[s] === id);
    const star = forgeStar(id);
    return `<div class="list-row ${worn ? 'equipped' : ''}">
      <div class="grow"><b>${it.name}</b>${n > 1 ? ' ×' + n : ''}${star ? ` <span class="forge-star">+${star}</span>` : ''}
        <small>${it.desc} · ${equipSlotName(it.slot)}</small></div>
      ${worn ? '<span class="tag">装备中</span>' : `<button class="btn btn-sm btn-primary" data-eq="${id}">装备</button><button class="btn btn-sm" data-sell="${id}">售${Math.round(it.price / 2)}两</button>`}
    </div>`;
  }).join('') || '<p class="muted">尚无兵刃护甲。</p>';

  const potHtml = cats.pot.map(([id, n]) => {
    const it = ITEMS[id];
    return `<div class="list-row">
      <div class="grow"><b>${it.name}</b> ×${n}<small>${it.desc}</small></div>
      <button class="btn btn-sm btn-primary" data-use="${id}">服用</button>
    </div>`;
  }).join('') || '<p class="muted">无丹药。</p>';

  const matHtml = cats.mat.map(([id, n]) => {
    const it = ITEMS[id];
    return `<div class="list-row"><div class="grow"><b>${it.name}</b> ×${n}<small>${it.desc}</small></div></div>`;
  }).join('') || '<p class="muted">无材料。</p>';

  const trsHtml = cats.trs.concat(cats.sp).map(([id, n]) => {
    const it = ITEMS[id];
    return `<div class="list-row">
      <div class="grow"><b>${it.name}</b>${n > 1 ? ' ×' + n : ''}<small>${it.desc}</small></div>
      <button class="btn btn-sm btn-gold" data-sell="${id}">售${it.sell}两</button>
    </div>`;
  }).join('') || '<p class="muted">无珍玩。</p>';

  const bookHtml = cats.book.map(([id, n]) => {
    const it = ITEMS[id];
    const known = P.skills.includes(it.bookSkill);
    return `<div class="list-row">
      <div class="grow"><b>${it.name}</b>${n > 1 ? ' ×' + n : ''}<small>${it.desc}</small></div>
      ${known ? '<span class="tag">已参悟</span>' : `<button class="btn btn-sm btn-primary" data-read="${id}">研读</button>`}
    </div>`;
  }).join('') || '<p class="muted">无秘籍。</p>';

  const slotLine = EQUIP_SLOTS.map(s => {
    const none = { weapon: '赤手空拳', armor: '粗衣布衫' }[s] || '无';
    return `<b>${equipSlotName(s)}：</b>${P[s] ? esc(ITEMS[P[s]].name) + (forgeStar(P[s]) ? ' +' + forgeStar(P[s]) : '') : none}`;
  }).join('　');
  modal('行囊 · 盘缠',
    `<p style="line-height:2.1">${slotLine}<br>　<b>银两：</b><span class="gold">${P.silver}</span></p>
     <div class="divider"></div><p><b>装备</b></p>${equipHtml}
     <div class="divider"></div><p><b>丹药</b></p>${potHtml}
     <div class="divider"></div><p><b>秘籍</b></p>${bookHtml}
     <div class="divider"></div><p><b>材料（锻造用）</b></p>${matHtml}
     <div class="divider"></div><p><b>珍玩（可售）</b></p>${trsHtml}`,
    [{ label: '关闭', fn: null }, { label: '收拾妥当', primary: true }]);

  $('#modal-root').querySelectorAll('[data-eq]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.eq, it = ITEMS[id];
    if (!EQUIP_SLOTS.includes(it.slot)) return;
    P[it.slot] = id;
    recompute(); save();
    toast(`已装备「${it.name}」。`);
    closeModal(); renderStatus(); openBag();
  }));
  $('#modal-root').querySelectorAll('[data-use]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.use, pot = POTIONS[ITEMS[id].pot];
    if (pot.bbAtk || pot.bbDef || pot.bbSpd || pot.bbNextCrit || pot.bbDodge || pot.bbStun)
      return toast('此物须在战斗中服用。');
    removeItem(id);
    const boost = passiveId() === 'royal' ? 1.3 : 1;
    if (pot.hp) P.hp = clamp(P.hp + Math.round(pot.hp * boost), 0, P.hpMax);
    if (pot.mp) P.mp = clamp(P.mp + Math.round(pot.mp * boost), 0, P.mpMax);
    if (pot.pct) { P.hp = clamp(P.hp + Math.round(P.hpMax * pot.pct * boost), 0, P.hpMax); P.mp = clamp(P.mp + Math.round(P.mpMax * pot.pct), 0, P.mpMax); }
    if (pot.full) { P.hp = P.hpMax; P.mp = P.mpMax; }
    if (pot.perm) {
      Object.entries(pot.perm).forEach(([k, v]) => { P.bonus[k] = (P.bonus[k] || 0) + v; });
      recompute();
      toast('药力化入经脉，属性永久提升！');
    }
    Sfx.heal(); save();
    closeModal(); renderStatus(); openBag();
  }));
  $('#modal-root').querySelectorAll('[data-sell]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.sell, it = ITEMS[id];
    const val = Math.round(it.price / 2);
    removeItem(id);
    P.silver += val;
    Sfx.coin();
    toast(`售出「${it.name}」，得 ${val} 两。`);
    save(); closeModal(); renderStatus(); openBag();
  }));
  $('#modal-root').querySelectorAll('[data-read]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.read, it = ITEMS[id];
    removeItem(id);
    const slot = grantSkill(it.bookSkill);
    recompute();
    Sfx.levelup();
    log(`你参悟了「${SKILLS[it.bookSkill].name}」！`, 'good');
    save();
    closeModal();
    modal('武学精进', `<p>你挑灯夜读，豁然贯通——习得「<b>${SKILLS[it.bookSkill].name}</b>」！</p>
      <p class="muted">${SKILLS[it.bookSkill].desc}</p>
      ${slot ? `<p>真气自行流转，此功已运于<b style="color:var(--jade)">${slot}</b>之位。</p>` : ''}`,
      [{ label: '好哉', primary: true, fn: () => openBag() }]);
  }));
}

// ---------- 人物属性 ----------
function openStats() {
  const s = SECTS[P.sect];
  const stat = (label, val, sub) => `<div class="stat-cell"><span>${label}</span><b>${val}</b>${sub ? `<em>${sub}</em>` : ''}</div>`;
  const gear = EQUIP_SLOTS.map(s => `<div class="stat-cell"><span>${equipSlotName(s)}</span><b class="small">${P[s] ? esc(ITEMS[P[s]].name) + (forgeStar(P[s]) ? ' +' + forgeStar(P[s]) : '') : '无'}</b></div>`).join('');
  const slots = [
    ['主套路', P.rtSkill], ['副套路', P.rtSkill2], ['内功', P.inSkill], ['轻功', P.agSkill]
  ].map(([k, id]) => `<div class="stat-cell"><span>${k}</span><b class="small">${id ? esc(SKILLS[id].name) : '——'}</b><em>${id ? CAT_NAME[SKILLS[id].cat] + ' · ' + SKILLS[id].lv + '级' : '待运功'}</em></div>`).join('');
  const fx = [];
  if (P.ls) fx.push(`攻击吸血 ${P.ls}%`);
  if (P.dmgred) fx.push(`受到伤害 -${P.dmgred}%`);
  if (P.dodgeBonus) fx.push(`闪避 +${P.dodgeBonus}%`);
  if (P.regen) fx.push(`每回合回复 ${P.regen}% 气血`);
  if (P.mpregen) fx.push(`每回合回复内力 +${P.mpregen}`);
  if (P.firstCrit) fx.push('每战首击必定会心');
  modal(`人物 · ${esc(P.name)}`,
    `<p class="muted" style="margin-bottom:6px">${s.name}（${s.tag}）· ${P.lv} 级${P.title ? ' · 「' + TITLES[P.title].name + '」' : ''}　心法：${s.passive.text}</p>
     <div class="divider"></div><p><b>根骨属性</b></p>
     <div class="stat-grid">
       ${stat('气血上限', P.hpMax, P.regen ? '每回合+' + P.regen + '%' : '')}
       ${stat('内力上限', P.mpMax, P.mpregen ? '每回合+' + P.mpregen : '')}
       ${stat('攻 击', P.atk)}${stat('防 御', P.def)}
       ${stat('身 法', P.spd, '闪避+' + P.dodgeBonus + '%')}${stat('暴 击', P.crt + '%', P.firstCrit ? '首击必暴' : '')}
     </div>
     ${fx.length ? `<p style="margin-top:8px"><b>奇特效性</b></p><p class="fx-line">${fx.join('　·　')}</p>` : ''}
     <div class="divider"></div><p><b>武学运功</b> <span class="muted">（已参悟的被动招式增益，均已计入上述属性）</span></p>
     <div class="stat-grid">${slots}</div>
     <p style="margin-top:8px"><b>随身装备</b></p>
     <div class="stat-grid">${gear}</div>
     <div class="divider"></div><p><b>江湖履历</b></p>
     <p style="font-size:13.5px;line-height:2">败敌 ${P.kills} 人 · 斩头目 ${P.bossKills} 员 · 比武夺冠 ${P.tourWins} 次 · 缉悬赏 ${flags.bountyCount} 张<br>
     已习武学 ${P.skills.length - 1} 门 · 锻造神兵 ${P.forgeSucc} 次 · 身怀 <span class="gold">${P.silver}</span> 两 · 获名号 ${P.titles.length} 个</p>`,
    [{ label: '关闭', fn: null }, { label: '侠影犹在', primary: true }]);
}

// ---------- 武学 ----------
function moveRow(m) {
  const un = moveUnlocked(m);
  const tag = m.t === 'act' ? '<span class="mtag act">主动</span>' : '<span class="mtag pas">被动</span>';
  let d;
  if (m.t === 'pas') d = moveFxDesc(m);
  else if (m.heal) d = `回复${Math.round(m.heal * 100)}%气血${m.healMp ? `、${Math.round(m.healMp * 100)}%内力` : ''}`;
  else {
    d = `威力 ${r1(m.mult * (m.hits || 1))} 倍${m.hits > 1 ? `（${m.hits}连击）` : ''}`;
    const fx = moveFxDesc(m);
    if (fx && fx !== '寻常招式') d += ' · ' + fx;
  }
  return `<div class="move-row${un ? '' : ' locked'}"><span class="mno">${MV_NAME[m.mv - 1]}</span>${tag}<b>${esc(m.name)}</b><span class="mfx">${d}${un ? '' : `　<span class="red">${m.unlock}级参悟</span>`}</span></div>`;
}

function openSkills() {
  const s = SECTS[P.sect];
  const sectSkillIds = s.skills.map((d, i) => P.sect + '_s' + i);
  const equipped = equippedSkillIds();

  const slotRow = (label, id) => {
    if (!id) return `<div class="list-row"><div class="grow"><b class="muted">${label} · 空</b><small>习得${label === '主套路' || label === '副套路' ? '套路' : label}武学后自动运功于此</small></div></div>`;
    const sk = SKILLS[id];
    return `<div class="list-row equipped">
      <div class="grow"><b>${esc(sk.name)}</b> <span class="tag">${label} · ${CAT_NAME[sk.cat]}</span>
        <small>${sk.desc}</small>
        <div style="margin-top:5px">${sk.moves.map(moveRow).join('')}</div></div>
    </div>`;
  };

  const catRows = cat => P.skills.filter(k => k !== 'basic' && SKILLS[k].cat === cat).map(k => {
    const sk = SKILLS[k];
    const worn = equipped.includes(k);
    const canWear = P.lv >= sk.lv;
    return `<div class="list-row">
      <div class="grow"><b>${esc(sk.name)}</b> <span class="tag">${CAT_NAME[cat]}</span>
        <small>${sk.desc} · ${sk.lv}级武学${canWear ? '' : '（' + sk.lv + '级方可参悟）'}</small></div>
      ${worn ? '<span class="tag jade">运功中</span>' : (canWear ? `<button class="btn btn-sm btn-primary" data-wear="${k}">运功</button>` : '<span class="tag">未参悟</span>')}
    </div>`;
  }).join('');

  const future = sectSkillIds.filter(k => !P.skills.includes(k)).map(k =>
    `<div class="list-row"><div class="grow"><b>${esc(SKILLS[k].name)}</b> <span class="tag">${CAT_NAME[SKILLS[k].cat]}</span><small>${SKILLS[k].lv} 级时由师父传授 · ${SKILLS[k].desc}</small></div></div>`).join('');
  const hiddenCount = Object.keys(HIDDEN_SKILLS).filter(k => !P.skills.includes(k)).length;
  const hiddenRows = hiddenCount
    ? `<div class="divider"></div><p><b>隐世武学</b></p><div class="list-row"><div class="grow"><b>？？？？</b><small>江湖五十五处，藏着 ${hiddenCount} 部无人知晓的绝学……游历四方，机缘自现。</small></div></div>`
    : '';

  modal(`武学 · ${s.name}`,
    `<p class="muted" style="margin-bottom:6px">门派心法：<b>${s.passive.text}</b>　已习得 ${P.skills.length - 1} 门 · 每门武学五式招法，主动招式战斗中施展，被动招式运功即生效。</p>
     <div class="divider"></div><p><b>运功之中</b></p>
     ${slotRow('主套路', P.rtSkill)}${slotRow('副套路', P.rtSkill2)}${slotRow('内功', P.inSkill)}${slotRow('轻功', P.agSkill)}
     <div class="divider"></div><p><b>套路武学</b> <span class="muted">（攻伐招式为主，可运功两门）</span></p>${catRows('rt') || '<p class="muted">尚无。</p>'}
     <div class="divider"></div><p><b>内功武学</b> <span class="muted">（被动增益为主，附疗伤/吸星之法）</span></p>${catRows('in') || '<p class="muted">尚无。</p>'}
     <div class="divider"></div><p><b>轻功武学</b> <span class="muted">（身法闪避为主，附凌空迅击）</span></p>${catRows('ag') || '<p class="muted">尚无。</p>'}
     ${future ? `<div class="divider"></div><p><b>门派深造</b></p>${future}` : ''}${hiddenRows}`,
    [{ label: '关闭', fn: null }, { label: '招式在心', primary: true }]);

  $('#modal-root').querySelectorAll('[data-wear]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.wear, sk = SKILLS[id];
    const slot = forceEquip(id);
    recompute(); save();
    Sfx.click();
    toast(`「${sk.name}」已运于${slot}之位。`);
    closeModal(); renderStatus(); openSkills();
  }));
}

// ---------- 江湖舆图 ----------
function openMap() {
  const regionHtml = Object.entries(REGIONS).map(([rid, reg]) => {
    const maps = MAPS.filter(m => m.region === rid);
    const rows = maps.map(m => {
      const unlocked = P.lv >= m.lv - 6;
      const here = m.id === curMap;
      const bossDone = m.bossSide ? flags.bossBeaten[m.bossSide] : false;
      const eventsLeft = (m.events || []).filter(ev => !flags.doneEvents[ev.id]).length;
      return `<div class="list-row" style="${here ? 'background:rgba(166,58,46,.08)' : ''}">
        <div class="grow"><b>${m.name}</b> ${here ? '<span class="tag">在此</span>' : ''}${m.ch ? '<span class="tag red">主线</span>' : ''}${bossDone ? '<span class="tag">已平定</span>' : ''}
          <small>${reg.name} · 建议等级 ${m.lv}${eventsLeft ? ' · 有奇遇' : ''}${unlocked ? '' : ` · 需 ${m.lv - 6} 级`}</small></div>
        ${unlocked ? (here ? '' : `<button class="btn btn-sm btn-primary" data-go="${m.id}">启程</button>`) : '<span class="tag">未开启</span>'}
      </div>`;
    }).join('');
    return `<div class="divider"></div><p><b>${reg.name}</b> <span class="muted">（等级 ${reg.band[0]}–${reg.band[1]}）</span></p>${rows}`;
  }).join('');
  modal('江湖舆图',
    `<p class="muted" style="margin-bottom:6px">大好河山，仗剑而行。行至奇处，自有际遇。</p>${regionHtml}`,
    [{ label: '收起舆图', primary: true }]);
  $('#modal-root').querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    curMap = b.dataset.go;
    const m = MAPS.find(x => x.id === curMap);
    log(`你晓行夜宿，来到了${m.name}。`, 'sys');
    closeModal();
    show('#screen-home');
    renderHome();
  }));
}

// ---------- 关于 ----------
function about() {
  const eqCnt = {}, catCnt = {};
  Object.values(ITEMS).forEach(it => {
    if (it.cat === 'equip') eqCnt[it.slot] = (eqCnt[it.slot] || 0) + 1;
    catCnt[it.cat] = (catCnt[it.cat] || 0) + 1;
  });
  const n = k => eqCnt[k] || 0, c = k => catCnt[k] || 0;
  modal('关于《江湖录》',
    `<p>一款致敬金庸、古龙武侠世界的回合制 RPG，纯前端单文件，无需安装。</p>
     <div class="divider"></div>
     <p><b>十大门派</b>：各有 15 阶门派武学与独门被动心法。</p>
     <p><b>二百余门武学</b>：分套路 · 内功 · 轻功三系，每门五式招法，主动被动相辅——门派嫡传 150 · 江湖秘籍 20 · 隐世绝学 32（内含八部绝世神功），共千余式招法。<b>门派嫡传强于江湖杂学，唯隐世神功可盖其锋。</b></p>
     <p><b>近四百件物品</b>：兵刃 ${n('weapon')} · 护甲 ${n('armor')} · 饰品 ${n('acc')} · 头饰 ${n('head')} · 护腕 ${n('wrist')} · 鞋子 ${n('feet')} · 戒指 ${n('ring')} · 腰带 ${n('belt')} · 丹药 ${c('pot')} · 材料 ${c('mat')} · 珍宝 ${c('trs')} · 秘籍 ${c('book')} · 奇物 ${c('sp')}。</p>
     <p><b>八件装束</b>：兵刃 · 护甲 · 饰品之外，另有头饰、护腕、鞋子、戒指、腰带五处装束，皆可锻造强化。</p>
     <p><b>五十五处江湖</b>：八大地域，十章主线，十八头目。</p>
     <p><b>伙伴同行</b>：十六位江湖豪杰可招入麾下，至多两人随行出战。</p>
     <p><b>玩法</b>：自动历练 · 悬赏榜 · 锻造强化 · 比武大会 · 称号成就 · 隐世奇遇。</p>
     <div class="divider"></div>
     <p class="muted">同人练手之作，武林名号皆属原著。青山不改，绿水长流。</p>`,
    [{ label: '后会有期', primary: true }]);
}
