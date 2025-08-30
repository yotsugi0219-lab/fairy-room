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
  shopItems: [
    { id:"wall-kraft", label:"ｸﾗﾌﾄ", cost:2, type:"panel", wall:"#171a20" },
    { id:"wall-navy",  label:"ﾈｲﾋﾞｰ", cost:2, type:"panel", wall:"#0f1524" },
    { id:"wall-rose",  label:"ﾛｰｽﾞ",  cost:2, type:"panel", wall:"#1f1418" }
  ]
};

// ===================== 参照 =====================
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
function say(pool, ms=1100){
  const line = Array.isArray(pool) ? pool[Math.floor(Math.random()*pool.length)] : String(pool);
  speechText.textContent = line;
  speech.classList.remove('hidden');
  clearTimeout(say._t);
  say._t = setTimeout(()=> speech.classList.add('hidden'), ms);
}
function updateView(){
  pvMood.textContent   = "♥️".repeat(mood);
  pvHunger.textContent = "🍬".repeat(hunger);
  pvSleep.textContent  = "💪".repeat(sleep);   // 既にゲンキ表記にしてる想定
  nutsEl.textContent   = String(nuts);

  applyBasePose();      // ← ここを追加
}
/* ===== パラメータ自然変化（15秒に1回） ===== */
const STATE = { isAway:false, guest:null };

function tick() {
  // 寝てる時は減らさない（寝姿判定は class で）
  const sleeping = fairy.classList.contains('sleeping');
  if (!sleeping) {
    hunger = clamp(hunger - 1, 0, CFG.max);
    sleep  = clamp(sleep  - 1, 0, CFG.max);
    if (hunger === 0 || sleep === 0) mood = clamp(mood - 1, 0, CFG.max);
  }
  updateView();

  // いまの数値から「基本ポーズ」を決めて反映する
function applyBasePose() {
  if (fairy.classList.contains('sleeping')) return;    // ねんね中は触らない
  if (/fairy-happy/.test(fairy.src)) return;           // ぴょん中の一時差し替えは尊重

  const want = (mood <= 1)
    ? 'assets/fairy-back.png'   // ごきげん低い → うしろ向き
    : 'assets/fairy-stand.png'; // ふつう

  // 同じなら触らない（無駄な再描画を避ける）
  if (!fairy.src.endsWith(want)) fairy.src = want;
}

  // たまに独り言
  if (Math.random() < 0.15 && !STATE.isAway && !STATE.guest) {
    say(CFG.talk.idle, 1000);
  }
}
// 15秒ごとに実行
setInterval(tick, 30000);
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

/* ===================== ボタン配線（これだけ残す） ===================== */
(function wire(){
  const on = (id, fn) => {
    const b = document.getElementById(id);
    if (!b) { console.warn('missing:', id); return; }
    b.addEventListener('click', fn);
    b.addEventListener('touchstart', e=>{ e.preventDefault(); fn(e); }, {passive:false});
  };

  on('act-pet', () => {
    mood = clamp(mood+1, 0, CFG.max); updateView();
    jump(); say(CFG.talk.pet);
  });

  on('act-snack', () => {
    dropSnack(() => {
      hunger = clamp(hunger + 1, 0, CFG.max);
      mood   = clamp(mood   + 1, 0, CFG.max);
      updateView();
      jump();
      const lines = ['ｵｲｼｲ','ﾓｯﾄ','ｼｱﾜｾ','ｱﾘｶﾞﾄ','ﾑﾌﾌ'];
      say(lines[Math.floor(Math.random()*lines.length)]);
    });
      on('act-adventure', () => {
    if (STATE.isAway) return;
    STATE.isAway = true;
    // 留守演出
    fairy.style.opacity = '0';
    say("｢…ﾎﾞｳｹﾝ ｲｯﾃｸﾙ｣", 900);

    const trip = 3500 + Math.random()*3500; // 3.5〜7秒くらい
    setTimeout(() => {
      const gain = 1 + Math.floor(Math.random()*3); // 1〜3個
      nuts = clamp(nuts + gain, 0, 99);
      mood = clamp(mood + 1, 0, CFG.max);
      updateView();

      // 帰還
      fairy.style.opacity = '';
      jump();
      say(`｢ﾄﾞﾝｸﾞﾘ ${gain}ｺ ﾐﾂｹﾀ｣`, 1200);
      STATE.isAway = false;
    }, trip);
  });

  on('act-guest', () => callGuest());
  });

  on('act-sleep', () => {
    fairy.classList.add('sleeping');
    fairy.style.left   = CFG.bedPos.left;
    fairy.style.bottom = CFG.bedPos.bottom;
    fairy.src = "assets/fairy-sleep.png";
    say(CFG.talk.sleepS, 900);
    for(let i=0;i<2;i++) setTimeout(()=> say("｢💤｣", 600), 400 + i*700);
    setTimeout(()=>{
      sleep = CFG.max; updateView();
      fairy.classList.remove('sleeping');
      fairy.style.left = "50%";
      fairy.style.bottom = "8%";
      fairy.src = "assets/fairy-stand.png";
      say(CFG.talk.sleepE, 1000);
    }, 2000);
  });

  on('act-sky', () => {
    const state = sky.dataset.state || 'day';
    if(state === 'day'){ sky.src = sky.dataset.night; sky.dataset.state = 'night'; }
    else { sky.src = sky.dataset.day; sky.dataset.state = 'day'; }
  });

  on('act-save', saveGame);
  function saveGame(){
  const data = {
    mood, hunger, sleep, nuts,
    skyState: sky.dataset.state,
    panelWall: getComputedStyle(document.documentElement)
      .getPropertyValue('--panel-wall').trim()
  };
  localStorage.setItem('fairy-room-v1', JSON.stringify(data));
  say("｢ﾆｯｷ ﾆ ｶｲﾀ｣", 900);
}

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
// ===================== インラインショップ =====================
function renderShop(){
  shopGrid.innerHTML = "";
  CFG.shopItems.forEach(it=>{
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.innerHTML = `
      <div style="font-size:26px;">🧩</div>
      <div class="label">${it.label}</div>
      <div class="price" style="opacity:.8;">🌰 ${it.cost}</div>
      <button class="pill mini" data-id="${it.id}">こうにゅう</button>
    `;
    shopGrid.appendChild(card);
  });

  shopGrid.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.onclick = ()=>{
      const it = CFG.shopItems.find(x=>x.id===btn.dataset.id);
      if(!it) return;
      if(nuts < it.cost){ say("｢…ﾄﾞﾝｸﾞﾘ ﾀﾘﾅｲ｣", 1000); return; }
      nuts -= it.cost; updateView();
      if(it.type === 'panel'){
        document.documentElement.style.setProperty('--panel-wall', it.wall);
        say("｢ｶﾜｲｸ ﾅｯﾀ｣", 900);
      }
      saveGame();
    };
  });
}

document.getElementById('act-shop').onclick = ()=>{
  // コマンド帯を非表示 → ショップ帯を表示（非モーダル）
  cmdPanel.classList.add('hidden');
  renderShop();
  shopPanel.classList.remove('hidden');
  shopPanel.setAttribute('aria-hidden','false');
};
document.getElementById('shop-close').onclick = ()=>{
  shopPanel.classList.add('hidden');
  shopPanel.setAttribute('aria-hidden','true');
  cmdPanel.classList.remove('hidden');
};

// ===================== メモ：どんぐりの入手（後で実装予定） =====================
// いまは 0 のまま運用。入手手段（ﾎﾞｳｹﾝ or ｵｷｬｸｻﾝ）を後段で足すね。
