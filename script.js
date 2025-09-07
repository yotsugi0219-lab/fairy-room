// ===================== 設定（みゆが触るのはここだけでOK） =====================
const CFG = {
  max: 5,
  snackCount: 7,             // ｵﾔﾂ落下の数
  bedPos: { left:"72%", bottom:"22%" }, // ﾈﾝﾈ位置（絵に合わせて微調整可）
  talk: {
    pet:    ["｢……ｲﾏﾉ､ﾜﾙｸﾅｲ｣","｢……ﾁｮｯﾄﾀﾞｹ ｷﾓﾁｲｲ｣","｢ｺﾞｷｹﾞﾝ､ｱｶﾞｯﾀ ｶﾓ｣","｢ｳﾌﾌ｣"],
    snack:  ["｢…ﾝ､ｺﾚ ｽｷ｣","｢ﾓｳ ﾋﾄﾂ､ﾎｼｲ｣","｢ｵﾅｶ､ﾐﾀｻﾚﾀ｣"],
    sleepS: ["｢……ﾈﾑｲ｣","｢ﾁｮｯﾄ ﾀﾞｹ ﾈﾙ｣","｢ｵﾔｽﾐ｣"],
    sleepE: ["｢…ｽｯｷﾘ｣","｢ﾖｸ ﾈﾀ｣","｢ﾏﾀﾞ ﾈﾑｲ ｶﾓ｣"],
    idle:   ["｢ｷｮｳﾊ ｲｲﾃﾝｷ｣","｢ﾄﾞﾝｸﾞﾘ… ﾄﾞｺｶﾆ ﾅｲｶﾅ｣","｢ｵﾊﾅｼ ｼﾀｲ ｷﾌﾞﾝ｣","｢ﾌﾜｧ…｣"]
  },
  guests: [
  {
    id: 'fuyao', label: 'ﾌｰﾔｵ',
    gift: { nuts:[1,3], mood:+1 },
    lines: ["｢ｷｮｳﾊ ｲｲｶｾﾞ｣","｢ｺﾚ ﾄﾞｳｿﾞ｣","｢ﾏﾀ ｱｿﾎﾞ｣"]
  },
  {
    id: 'fengxin', label: 'ﾌｫﾝｼﾝ',
    gift: { nuts:[1,2], mood:+1 },
    lines: ["｢ｻｸｯ ﾄ ﾐﾂｹﾀ｣","｢ﾔﾏﾐﾁ ﾖｶｯﾀ｣","｢ｵﾊﾅｼ ｽﾙ?｣"]
  },
  {
    id: 'nanfeng', label: 'ﾅﾝﾌｫﾝ',
    gift: { nuts:[2,3], mood:+0 },
    lines: ["｢ｺﾝﾆﾁﾊ｣","｢ｱﾒ ﾌﾘｿｳ｣","｢ｵﾐﾔｹﾞ ﾓｯﾃｷﾀ｣"]
  }
],
  shopItems: [
    { id:"wall-kraft", label:"ｸﾗﾌﾄ", cost:2, type:"panel", wall:"#171a20" },
    { id:"wall-navy",  label:"ﾈｲﾋﾞｰ", cost:2, type:"panel", wall:"#0f1524" },
    { id:"wall-rose",  label:"ﾛｰｽﾞ",  cost:2, type:"panel", wall:"#1f1418" },// ここから追加分
    { id:"wall-mint",   label:"ﾐﾝﾄ",   cost:2, type:"panel", wall:"#12332b" },
    { id:"wall-sakura", label:"ｻｸﾗ",   cost:2, type:"panel", wall:"#2a1b23" },
    { id:"wall-cream",  label:"ｸﾘｰﾑ",  cost:2, type:"panel", wall:"#2c2418" },
    { id:"wall-ink",    label:"ｲﾝｸ",   cost:3, type:"panel", wall:"#0b0f16" }
  ]
};

// ===================== 参照 =====================
// （この行の直後あたりに置く → const fx = ... の次）
const BACK_A = 'assets/fairy-back.png';
const BACK_B = 'assets/fairy_back.png';
let FAIRY_BACK = BACK_A;             // デフォはハイフン版

// どっちが存在するか軽くチェックして、無ければスネーク版に切替
(() => {
  const probe = new Image();
  probe.onload  = () => { FAIRY_BACK = BACK_A; };
  probe.onerror = () => { FAIRY_BACK = BACK_B; };
  probe.src = BACK_A;
})();
const sky   = document.getElementById('sky');
const fairy = document.getElementById('fairy');
const speech = document.getElementById('speech');
const speechText = document.getElementById('speechText');
const fx = document.getElementById('fx');

const pvMood   = document.getElementById('pv-mood');
const pvHunger = document.getElementById('pv-hunger');
const pvSleep  = document.getElementById('pv-sleep');
const nutsEl   = document.getElementById('nuts');

const cmdPanel  = document.getElementById('cmdPanel');
const shopPanel = document.getElementById('shopPanel');
const shopGrid  = document.getElementById('shopGrid');

// ===================== 状態 =====================
let mood=5, hunger=5, sleep=5, nuts=0;

// ===================== ユーティリティ =====================
function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
function say(pool, ms = 1100, isGuest = false){
  const line = Array.isArray(pool) ? pool[Math.floor(Math.random()*pool.length)] : pool;

  // まず両方のクラスを外す
  speech.classList.remove('fairy', 'guest');

  // ゲストかどうかでクラスを付ける
  if(isGuest){
    speech.classList.add('guest');
  } else {
    speech.classList.add('fairy');
  }

  speechText.textContent = line;
  speech.classList.remove('hidden');

  clearTimeout(say._t);
  say._t = setTimeout(()=> speech.classList.add('hidden'), ms);
}
function updateView(){
  pvMood.textContent   = "♥️".repeat(mood);
  pvHunger.textContent = "🍬".repeat(hunger);
  pvSleep.textContent  = "💪".repeat(sleep);
  nutsEl.textContent   = String(nuts);
  applyBasePose(); // ここで呼ぶ
}

// ごきげん低いときの差分
function applyBasePose() {
  if (fairy.classList.contains('sleeping')) return;
  if (/fairy-happy/.test(fairy.src)) return;

  const want = (mood <= 1)
    ? 'assets/fairy_back.png'
    : 'assets/fairy-stand.png';

  if (!fairy.src.endsWith(want)) fairy.src = want;
}
/* ===== パラメータ自然変化（15秒に1回） ===== */
/* ===== パラメータ自然変化（🍬だけ減る／ｹﾞﾝｷは絶対いじらない） ===== */
const STATE = window.STATE || { isAway:false, guest:null };

function tick(){
  const sleeping = fairy.classList.contains('sleeping');

  // 留守/就寝中は止める。ｹﾞﾝｷ(sleep)は一切触らない。
  if (!sleeping && !STATE.isAway) {
    hunger = clamp(hunger - 1, 0, CFG.max);
    if (hunger === 0) mood = clamp(mood - 1, 0, CFG.max);
  }

  updateView();

  if (Math.random() < 0.15 && !STATE.isAway && !STATE.guest) {
    say(CFG.talk.idle, 1000);
  }
}

// 以前の interval が残っていたら止めてから、1本だけ張る
if (window.__fairyTick) clearInterval(window.__fairyTick);
window.__fairyTick = setInterval(tick, 30000);
// 15秒ごとに実行
setInterval(tick, 15000);
function swapFairy(src, dur=350){
  const old = fairy.src;
  fairy.src = src;
  setTimeout(()=> fairy.src = old, dur);
}
function jump(){
  // ﾅﾃﾞﾅﾃﾞ系：happyに切替してから小ジャンプ
  const old = fairy.src;
  fairy.src = "assets/fairy-happy.png";
  fairy.animate([
    { transform:'translateX(-50%) translateY(0)' },
    { transform:'translateX(-50%) translateY(-18px)' },
    { transform:'translateX(-50%) translateY(0)' }
  ], { duration:420, easing:'ease-out' }).addEventListener('finish', ()=>{
    fairy.src = old.includes('fairy-happy') ? "assets/fairy-stand.png" : old;
  });
}
function jumpBoth(){
  // まず妖精さん
  jump();
  // ゲストが居たら同じタイミングで小ジャンプ
  if (guestSprite && guestSprite.classList.contains('show')) {
    guestSprite.animate(
      [
        { transform:'translateX(-50%) translateY(0)' },
        { transform:'translateX(-50%) translateY(-16px)' },
        { transform:'translateX(-50%) translateY(0)' }
      ],
      { duration:420, easing:'ease-out' }
    );
  }
}
function callGuest(){
  if (STATE.isAway || STATE.guest) { say("｢…ｲﾏ ﾑｽﾞｶｼｲ｣", 800); return; }

  const g = CFG.guests[Math.floor(Math.random() * CFG.guests.length)];
  STATE.guest = g.id;

  // 画像表示
  const sp = ensureGuestSprite();
  sp.src = GFX_GUEST[g.id] || '';
  sp.classList.add('show');

  // 他操作無効
  disableControls();
  say(`｢${g.label} ｷﾀ｣`, 900);

  // プレゼント
  const [min,max] = g.gift.nuts;
  const gain = min + Math.floor(Math.random() * (max - min + 1));

  setTimeout(() => {
    nuts = clamp(nuts + gain, 0, 99);
    mood = clamp(mood + (g.gift.mood || 0), 0, CFG.max);
    updateView();
    jumpBoth();                        // ★ 二人でぴょん！
    say(`｢ﾄﾞﾝｸﾞﾘ ${gain} ﾄﾞｳｿﾞ｣`, 1100);
  }, 700);

  // 雑談
  setTimeout(() => {
    const line = g.lines[Math.floor(Math.random() * g.lines.length)];
    say(line, 1200);
    jumpBoth();                        // ★ もう一回ぴょんしても可愛い
  }, 2000);

  // 退室
  const stay = 3500 + Math.random()*2500;
  if (callGuest._leaveTimer) clearTimeout(callGuest._leaveTimer);
  callGuest._leaveTimer = setTimeout(() => {
    STATE.guest = null;
    sp.classList.remove('show');       // フェードアウト
    enableControls();
    say("｢ﾏﾀ ﾈ｣", 900);
    if (typeof saveGame === 'function') saveGame(true);
  }, stay);
}
function dropSnack(onLanded) {
  const fx = document.getElementById('fx');
  if (!fx) return;

  const snacks = ['🥮','🍒','🍰','🍮','🍩'];
  const snack  = snacks[Math.floor(Math.random() * snacks.length)];

  const el = document.createElement('span');
  el.className = 'snack';
  el.textContent = snack;

  const duration = 1400; // ms 固定
  el.style.setProperty('--t', duration + 'ms');
  el.style.setProperty('--x', '50%');

  fx.appendChild(el);

  // 妖精の頭の高さを計算
  const fairyRect = fairy.getBoundingClientRect();
  const fxRect    = fx.getBoundingClientRect();
  const fairyHeadY = fairyRect.top - fxRect.top;   // fx内でのY座標

  const fxHeight  = fxRect.height;
  const endY      = fxHeight * 1.3; // CSSアニメの最終位置130%
  const startY    = -0.2 * fxHeight;
  const targetY   = fairyHeadY;     // 妖精の頭位置で止めたい

  // 目標まで落ちる割合
  const ratio = (targetY - startY) / (endY - startY);
  const timeToFairy = duration * ratio;

  // その時点で消す
  setTimeout(() => {
    el.remove();
    if (typeof onLanded === 'function') onLanded();
  }, timeToFairy);
}

// iOSドラッグ無効（念のため）
["roomBase","sky","windowFrame","fairy"].forEach(id=>{
  const el = document.getElementById(id);
  if(el){ el.setAttribute('draggable','false'); el.addEventListener('dragstart', e=>e.preventDefault()); }
});
// ゲスト画像マップ
const GFX_GUEST = {
  fuyao:   'assets/guest-fuyao.png',
  fengxin: 'assets/guest-fengxin.png',
  nanfeng:'assets/guest-nanfeng.png'
};

// ゲスト用スプライトを1度だけ用意
let guestSprite = null;
function ensureGuestSprite(){
  if (guestSprite) return guestSprite;
  guestSprite = document.createElement('img');
  guestSprite.id = 'guestSprite';
  guestSprite.className = 'guest';
  guestSprite.alt = '';
  fx.appendChild(guestSprite);
  return guestSprite;
}

function show(el){
  if(!el) return;
  el.style.display = '';
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden','false');
}
function hide(el){
  if(!el) return;
  el.style.display = 'none';
  el.classList.add('hidden');
  el.setAttribute('aria-hidden','true');
}
function renderShop(){
  shopGrid.innerHTML = '';   // ここで一度空にする
  CFG.shopItems.forEach(it => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div style="font-size:26px;">🧩</div>
      <div class="label">${it.label}</div>
      <div class="price" style="opacity:.8;">🌰 ${it.cost}</div>
      <button class="pill mini" data-id="${it.id}">こうにゅう</button>
    `;
    shopGrid.appendChild(card);
  });

  // 購入ボタン
shopGrid.querySelectorAll('button[data-id]').forEach(btn=>{
  btn.onclick = ()=>{
    const it = CFG.shopItems.find(x=>x.id===btn.dataset.id);
    if(!it) return;
    if(nuts < it.cost){ say("｢…ﾄﾞﾝｸﾞﾘ ﾀﾘﾅｲ｣", 1000); return; }

    nuts = clamp(nuts - it.cost, 0, 99);

    if(it.type === 'panel'){
      document.documentElement.style.setProperty('--panel-wall', it.wall);
      say("｢ｶﾜｲｸ ﾅｯﾀ｣", 900);           // ← 購入時のセリフ
    }

    updateView();

    // ★ここがポイント：サイレント保存にする
    if (typeof saveGame === 'function') saveGame(true);
  };
});

  // 閉じるボタン（毎回つなぎ直し）
  const close = document.getElementById('shop-close');
  if (close){
    const fresh = close.cloneNode(true);
    close.parentNode.replaceChild(fresh, close);
    fresh.onclick = (e)=>{ e.preventDefault?.(); closeShop(); };
  }
}
// 共通ヘルパー（存在チェック付き）
function show(el){
  if (!el) return;
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden','false');
}
function hide(el){
  if (!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden','true');
}
function openShop(){
  if (!shopPanel || !cmdPanel) return;

  // コマンド帯を隠す
  cmdPanel.classList.add('hidden');

  // ショップを表示
  shopPanel.classList.remove('hidden');
  shopPanel.setAttribute('aria-hidden','false');

  renderShop();

  // 閉じるボタン
  const btn = document.getElementById('shop-close');
  if (btn) {
    btn.onclick = (e)=>{ e.preventDefault?.(); closeShop(); };
  }

  // ESCで閉じる
  if (!window.__shopEsc) {
    window.__shopEsc = (e)=>{ if (e.key === 'Escape') closeShop(); };
    window.addEventListener('keydown', window.__shopEsc);
  }
}

function closeShop(){
  if (!shopPanel || !cmdPanel) return;

  // ショップを隠す
  shopPanel.classList.add('hidden');
  shopPanel.setAttribute('aria-hidden','true');

  // コマンド帯を見せる
  cmdPanel.classList.remove('hidden');

  // ESC解除
  if (window.__shopEsc) {
    window.removeEventListener('keydown', window.__shopEsc);
    window.__shopEsc = null;
  }
}
function disableControls(){
  if (!cmdPanel) return;
  cmdPanel.querySelectorAll('button').forEach(b => b.disabled = true);
}
function enableControls(){
  if (!cmdPanel) return;
  cmdPanel.querySelectorAll('button').forEach(b => b.disabled = false);
}

/* ===================== ボタン配線（入れ子なしの正解） ===================== */
function saveGame(silent = false){
  const data = {
    mood, hunger, sleep, nuts,
    skyState: sky.dataset.state,
    panelWall: getComputedStyle(document.documentElement)
                 .getPropertyValue('--panel-wall').trim()
  };
  localStorage.setItem('fairy-room-v1', JSON.stringify(data));

  // ← サイレント時はしゃべらない
  if (!silent) say("｢ﾆｯｷ ﾆ ｶｲﾀ｣", 900);
}
(function wire(){
  const on = (id, fn) => {
    const b = document.getElementById(id);
    if (!b) { console.warn('missing:', id); return; }
    b.addEventListener('click', fn);
    b.addEventListener('touchstart', e=>{ e.preventDefault(); fn(e); }, {passive:false});
  };

  // ﾅﾃﾞﾅﾃﾞ
  on('act-pet', () => {
    mood = clamp(mood+1, 0, CFG.max); updateView();
    jump(); say(CFG.talk.pet);
  });

  // ｵﾔﾂ（+1回復＆ぴょん）
  on('act-snack', () => {
    dropSnack(() => {
      hunger = clamp(hunger + 1, 0, CFG.max);
      mood   = clamp(mood   + 1, 0, CFG.max);
      updateView();
      jump();
      const lines = ['ｵｲｼｲ','ﾓｯﾄ','ｼｱﾜｾ','ｱﾘｶﾞﾄ','ﾑﾌﾌ'];
      say(lines[Math.floor(Math.random()*lines.length)]);
    });
  });

  // ﾎﾞｳｹﾝ（行く→戻る）
on('act-adventure', () => {
  if (STATE.isAway) return;
  if (fairy.classList.contains('sleeping')) { say("｢…ﾈﾃﾙ｣", 800); return; }

  STATE.isAway = true;

  // 出発コスト：ｹﾞﾝｷ -2（下限0）
  sleep = clamp(sleep - 2, 0, CFG.max);
  updateView();
  if (typeof applyBasePose === 'function') applyBasePose();
  if (sleep === 0) say("｢…ﾁｮｯﾄ ﾂｶﾚﾀ｣", 800);

  fairy.style.opacity = '0';
  say("｢…ﾎﾞｳｹﾝ ｲｯﾃｸﾙ｣", 900);

  const trip = 3500 + Math.random()*3500;
  setTimeout(() => {
    const gain = 1 + Math.floor(Math.random()*3);
    nuts = clamp(nuts + gain, 0, 99);
    mood = clamp(mood + 1, 0, CFG.max);
    updateView();

    fairy.style.opacity = '1';
    jump();
    say(`｢ﾄﾞﾝｸﾞﾘ ${gain}ｺ ﾐﾂｹﾀ｣`, 1200);
    STATE.isAway = false;
  }, trip);
});

  // ｵｷｬｸｻﾝ（実装済みなら）
  on('act-guest', () => { if (typeof callGuest === 'function') callGuest(); });

  // ﾈﾝﾈ
  on('act-sleep', () => {
    if (STATE.isAway) { say("｢…ﾏﾀﾞ ｶｴｯﾃﾅｲ｣", 900); return; }
    fairy.classList.add('sleeping');
    fairy.style.left   = CFG.bedPos.left;
    fairy.style.bottom = CFG.bedPos.bottom;
    fairy.src = "assets/fairy-sleep.png";
    say(CFG.talk.sleepS, 900);
    for(let i=0;i<2;i++) setTimeout(()=> say("｢💤｣", 600), 400 + i*700);
    setTimeout(()=>{
      sleep = CFG.max; mood = clamp(mood+1, 0, CFG.max); updateView();
      fairy.classList.remove('sleeping');
      fairy.style.left = "50%";
      fairy.style.bottom = "8%";
      fairy.src = "assets/fairy-stand.png";
      if (typeof applyBasePose === 'function') applyBasePose();
      say(CFG.talk.sleepE, 1000);
    }, 2000);
  });

  // 空の切替
  on('act-sky', () => {
    const state = sky.dataset.state || 'day';
    if(state === 'day'){ sky.src = sky.dataset.night; sky.dataset.state = 'night'; }
    else { sky.src = sky.dataset.day; sky.dataset.state = 'day'; }
  });

  // ｾｰﾌﾞ
  on('act-save', () => saveGame(false));

  // ｼｮｯﾌﾟ開閉
  on('act-shop', () => {
    cmdPanel.classList.add('hidden');
    renderShop();
    shopPanel.classList.remove('hidden');
    shopPanel.setAttribute('aria-hidden','false');
  });
  const close = document.getElementById('shop-close');
  if (close) close.onclick = () => {
    shopPanel.classList.add('hidden');
    shopPanel.setAttribute('aria-hidden','true');
    cmdPanel.classList.remove('hidden');
  };

  console.log('[wire] buttons ready');
})();
// 既存 CFG.shopItems に追加
CFG.shopItems.push(
  { id:"poster-sakura",  label:"ｻｸﾗの絵", cost:2, type:"decor", slot:"poster",   src:"assets/decor/poster_sakura.png" },
  { id:"rug-blue",       label:"あおﾗｸﾞ",  cost:2, type:"decor", slot:"rug",      src:"assets/decor/rug_blue.png" },
  { id:"pot-tea",        label:"ﾃｨｰｾｯﾄ",   cost:1, type:"decor", slot:"tabletop", src:"assets/decor/pot_tea.png" },
);


// ===================== メモ：どんぐりの入手（後で実装予定） =====================
// いまは 0 のまま運用。入手手段（ﾎﾞｳｹﾝ or ｵｷｬｸｻﾝ）を後段で足すね。
