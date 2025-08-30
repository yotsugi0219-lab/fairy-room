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
  pvSleep.textContent  = "💪".repeat(sleep);
  nutsEl.textContent   = String(nuts);
  applyBasePose(); // ここで呼ぶ
}

/* ===== パラメータ自然変化 ===== */
const STATE = { isAway:false, guest:null };

function tick(){
  const sleeping = fairy.classList.contains('sleeping');

  // 時間経過では「おなか」だけ減らす（留守/就寝中は止める）
  if (!sleeping && !STATE.isAway) {
    hunger = clamp(hunger - 1, 0, CFG.max);
    if (hunger === 0) mood = clamp(mood - 1, 0, CFG.max);
  }

  updateView();

  // たまに独り言
  if (Math.random() < 0.15 && !STATE.isAway && !STATE.guest) {
    say(CFG.talk.idle, 1000);
  }
}

// 30秒ごとに実行
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

/* ===================== ボタン配線（安全版） ===================== */
(function wire(){
  // ここでエラーになったらすぐ気づけるように
  try {
    const on = (id, fn) => {
      const b = document.getElementById(id);
      if (!b) { console.warn('missing:', id); return; }
      const handler = (e)=>{ e.preventDefault?.(); fn(e); };
      b.addEventListener('pointerup', handler);  // タッチ/クリックを一本化
      b.addEventListener('click', handler);      // 古い環境の保険
    };

    // ﾅﾃﾞﾅﾃﾞ
    on('act-pet', () => {
      mood = clamp(mood+1, 0, CFG.max); updateView();
      jump(); say(CFG.talk.pet);
    });

    // ｵﾔﾂ（+1回復＆ぴょん）
    on('act-snack', () => {
      dropSnack(() => {
        hunger = clamp(hunger+1, 0, CFG.max);
        mood   = clamp(mood+1, 0, CFG.max);
        updateView();
        jump();
        say(CFG.talk.snack);
      });
    });

    // ﾎﾞｳｹﾝ（出発コスト-2、戻ったら報告）
    let ADV_BUSY = false;
    on('act-adventure', () => {
      if (ADV_BUSY || STATE.isAway) return;
      if (fairy.classList.contains('sleeping')) { say("｢…ﾈﾃﾙ｣", 800); return; }
      ADV_BUSY = true; STATE.isAway = true;

      sleep = clamp(sleep-2, 0, CFG.max); updateView();
      fairy.style.opacity = '0'; say("｢…ﾎﾞｳｹﾝ ｲｯﾃｸﾙ｣", 900);

      const trip = 3500 + Math.random()*3500;
      setTimeout(() => {
        try{
          const gain = 1 + Math.floor(Math.random()*3);
          nuts = clamp(nuts + gain, 0, 99);
          mood = clamp(mood + 1, 0, CFG.max);
          updateView();
          fairy.style.opacity = '1'; jump();
          say(`｢ﾄﾞﾝｸﾞﾘ ${gain}ｺ ﾐﾂｹﾀ｣`, 1200);
        } finally {
          STATE.isAway = false;
          ADV_BUSY = false;
        }
      }, trip);
    });

    // ｵｷｬｸｻﾝ（実装済みなら）
    on('act-guest', () => { if (typeof callGuest === 'function') callGuest(); });

    // ﾈﾝﾈ（全回復）
    on('act-sleep', () => {
      if (STATE.isAway) { say("｢…ﾏﾀﾞ ｶｴｯﾃﾅｲ｣", 900); return; }
      fairy.classList.add('sleeping');
      fairy.style.left = CFG.bedPos.left; fairy.style.bottom = CFG.bedPos.bottom;
      fairy.src = "assets/fairy-sleep.png"; say(CFG.talk.sleepS, 900);
      for(let i=0;i<2;i++) setTimeout(()=> say("｢💤｣", 600), 400 + i*700);
      setTimeout(()=>{
        sleep = CFG.max; mood = clamp(mood+1, 0, CFG.max); updateView();
        fairy.classList.remove('sleeping');
        fairy.style.left = "50%"; fairy.style.bottom = "8%";
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
    const saveGame = ()=>{
      const data = {
        mood, hunger, sleep, nuts,
        skyState: sky.dataset.state,
        panelWall: getComputedStyle(document.documentElement).getPropertyValue('--panel-wall').trim()
      };
      localStorage.setItem('fairy-room-v1', JSON.stringify(data));
      say("｢ﾆｯｷ ﾆ ｶｲﾀ｣", 900);
    };
    on('act-save', saveGame);

    // ｼｮｯﾌﾟ
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
  } catch(err){
    console.error('[wire] failed:', err);
  }
})();

// ===================== メモ：どんぐりの入手（後で実装予定） =====================
// いまは 0 のまま運用。入手手段（ﾎﾞｳｹﾝ or ｵｷｬｸｻﾝ）を後段で足すね。
