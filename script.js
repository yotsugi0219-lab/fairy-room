// ===================== 設定 =====================
const CFG = {
  max: 5,
  bedPos: { left:"72%", bottom:"22%" },
  talk: {
    pet:    ["｢……ｲﾏﾉ､ﾜﾙｸﾅｲ｣","｢……ﾁｮｯﾄﾀﾞｹ ｷﾓﾁｲｲ｣","｢ｺﾞｷｹﾞﾝ､ｱｶﾞｯﾀ ｶﾓ｣","｢ｳﾌﾌ｣"],
    snack:  ["｢…ﾝ､ｺﾚ ｽｷ｣","｢ﾓｳ ﾋﾄﾂ､ﾎｼｲ｣","｢ｵﾅｶ､ﾐﾀｻﾚﾀ｣"],
    sleepS: ["｢……ﾈﾑｲ｣","｢ﾁｮｯﾄ ﾀﾞｹ ﾈﾙ｣","｢ｵﾔｽﾐ｣"],
    sleepE: ["｢…ｽｯｷﾘ｣","｢ﾖｸ ﾈﾀ｣","｢ﾏﾀﾞ ﾈﾑｲ ｶﾓ｣"],
    idle:   ["｢ｷｮｳﾊ ｲｲﾃﾝｷ｣","｢ﾄﾞﾝｸﾞﾘ… ﾄﾞｺｶﾆ ﾅｲｶﾅ｣","｢ｵﾊﾅｼ ｼﾀｲ ｷﾌﾞﾝ｣","｢ﾌﾜｧ…｣"]
  }
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
const STATE = { isAway:false, guest:null };

// ===================== ユーティリティ =====================
const clamp = (n,min,max)=> Math.max(min, Math.min(max,n));
function say(pool, ms=1100){
  const line = Array.isArray(pool) ? pool[Math.floor(Math.random()*pool.length)] : String(pool);
  speechText.textContent = line;
  speech.classList.remove('hidden');
  clearTimeout(say._t);
  say._t = setTimeout(()=> speech.classList.add('hidden'), ms);
}
function applyBasePose() {
  if (fairy.classList.contains('sleeping')) return;
  if (/fairy-happy/.test(fairy.src)) return;
  const want = (mood <= 1) ? 'assets/fairy-back.png' : 'assets/fairy-stand.png';
  if (!fairy.src.endsWith(want)) fairy.src = want;
}
function updateView(){
  pvMood.textContent   = "♥️".repeat(mood);
  pvHunger.textContent = "🍬".repeat(hunger);
  pvSleep.textContent  = "💪".repeat(sleep);
  nutsEl.textContent   = String(nuts);
  applyBasePose();
}

// ===================== 自然変化（🍬だけ減る） =====================
function tick(){
  const sleeping = fairy.classList.contains('sleeping');
  if (!sleeping && !STATE.isAway) {
    hunger = clamp(hunger - 1, 0, CFG.max);
    if (hunger === 0) mood = clamp(mood - 1, 0, CFG.max);
  }
  updateView();
  if (Math.random() < 0.15 && !STATE.isAway && !STATE.guest) say(CFG.talk.idle, 1000);
}
setInterval(tick, 30000);

// ===================== アニメ＆演出 =====================
function swapFairy(src, dur=350){
  const old = fairy.src;
  fairy.src = src;
  setTimeout(()=> fairy.src = old, dur);
}
function jump(){
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
  // CSS側：.snack{ position:absolute; left:var(--x,50%); top:-20%; transform:translateX(-50%); animation:fall var(--t,1400ms) linear forwards;}
  // @keyframes fall{ to{ top:130%; opacity:.95; } }
  const snacks = ['🥮','🍒','🍰','🍮','🍩'];
  const snack  = snacks[Math.floor(Math.random()*snacks.length)];
  const el = document.createElement('span');
  el.className = 'snack';
  el.textContent = snack;
  const duration = 1400;
  el.style.setProperty('--t', duration + 'ms');
  el.style.setProperty('--x', '50%');
  fx.appendChild(el);

  const F = fairy.getBoundingClientRect();
  const R = fx.getBoundingClientRect();
  const startY = -0.2 * R.height;
  const endY   =  1.3 * R.height;
  const targetY = (F.top - R.top);
  const ratio = (targetY - startY) / (endY - startY);
  const tHit  = Math.max(0, Math.min(duration, duration * ratio));

  setTimeout(() => {
    el.remove();
    if (typeof onLanded === 'function') onLanded();
  }, tHit);
}

// iOSドラッグ無効
["roomBase","sky","windowFrame","fairy"].forEach(id=>{
  const el = document.getElementById(id);
  if(el){ el.setAttribute('draggable','false'); el.addEventListener('dragstart', e=>e.preventDefault()); }
});

// ===================== セーブ =====================
function saveGame(){
  const data = {
    mood,hunger,sleep,nuts,
    skyState: sky.dataset.state,
    panelWall: getComputedStyle(document.documentElement).getPropertyValue('--panel-wall').trim()
  };
  localStorage.setItem('fairy-room-v1', JSON.stringify(data));
  say("｢ﾆｯｷ ﾆ ｶｲﾀ｣", 900);
}
(function restore(){
  try{
    const raw = localStorage.getItem('fairy-room-v1');
    if(!raw) return;
    const d = JSON.parse(raw);
    mood=d.mood??5; hunger=d.hunger??5; sleep=d.sleep??5; nuts=d.nuts??0;
    const st = d.skyState==='night' ? 'night' : 'day';
    sky.dataset.state = st;
    sky.src = st==='night' ? sky.dataset.night : sky.dataset.day;
    if(d.panelWall){ document.documentElement.style.setProperty('--panel-wall', d.panelWall); }
  }catch{}
  updateView();
})();

// ===================== ショップ =====================
function renderShop(){
  shopGrid.innerHTML = "";
  [
    { id:"wall-kraft", label:"ｸﾗﾌﾄ", cost:2, type:"panel", wall:"#171a20" },
    { id:"wall-navy",  label:"ﾈｲﾋﾞｰ", cost:2, type:"panel", wall:"#0f1524" },
    { id:"wall-rose",  label:"ﾛｰｽﾞ",  cost:2, type:"panel", wall:"#1f1418" }
  ].forEach(it=>{
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.innerHTML = `
      <div style="font-size:26px;">🧩</div>
      <div class="label">${it.label}</div>
      <div class="price" style="opacity:.8;">🌰 ${it.cost}</div>
      <button class="pill mini" data-id="${it.id}">こうにゅう</button>`;
    shopGrid.appendChild(card);
  });
  shopGrid.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.onclick = ()=>{
      const it = [{ id:"wall-kraft", wall:"#171a20", cost:2, type:"panel"},
                  { id:"wall-navy",  wall:"#0f1524", cost:2, type:"panel"},
                  { id:"wall-rose",  wall:"#1f1418", cost:2, type:"panel"}].find(x=>x.id===btn.dataset.id);
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

// ===================== ボタン配線（“click一発”の安定版） =====================
(function wire(){
  try{
    // 既存リスナーを物理的に剥がして“clickだけ”に統一
    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) { console.warn('missing:', id); return; }
      const fresh = el.cloneNode(true);
      el.parentNode.replaceChild(fresh, el);
      fresh.onclick = (e)=>{ e.preventDefault?.(); fn(e); };
      return fresh;
    };

    on('act-pet', () => {
      mood = clamp(mood+1, 0, CFG.max); updateView();
      jump(); say(CFG.talk.pet);
    });

    on('act-snack', () => {
      dropSnack(() => {
        hunger = clamp(hunger+1, 0, CFG.max);
        mood   = clamp(mood+1, 0, CFG.max);
        updateView(); jump(); say(CFG.talk.snack);
      });
    });

    let ADV_BUSY=false;
    on('act-adventure', () => {
      if (ADV_BUSY || STATE.isAway) return;
      if (fairy.classList.contains('sleeping')) { say("｢…ﾈﾃﾙ｣", 800); return; }
      ADV_BUSY = true; STATE.isAway = true;

      sleep = clamp(sleep-2, 0, CFG.max); updateView();
      fairy.style.opacity = '0'; say("｢…ﾎﾞｳｹﾝ ｲｯﾃｸﾙ｣", 900);

      const trip = 3500 + Math.random()*3500;
      setTimeout(()=>{
        try{
          const gain = 1 + Math.floor(Math.random()*3);
          nuts = clamp(nuts + gain, 0, 99);
          mood = clamp(mood + 1, 0, CFG.max);
          updateView();
          fairy.style.opacity = '1'; jump();
          say(`｢ﾄﾞﾝｸﾞﾘ ${gain}ｺ ﾐﾂｹﾀ｣`, 1200);
        } finally {
          STATE.isAway=false; ADV_BUSY=false;
        }
      }, trip);
    });

    on('act-guest', () => { if (typeof callGuest === 'function') callGuest(); });

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
        applyBasePose();
        say(CFG.talk.sleepE, 1000);
      }, 2000);
    });

    on('act-sky', () => {
      const state = sky.dataset.state || 'day';
      if(state === 'day'){ sky.src = sky.dataset.night; sky.dataset.state = 'night'; }
      else { sky.src = sky.dataset.day; sky.dataset.state = 'day'; }
    });

    on('act-save', saveGame);

    on('act-shop', () => {
      cmdPanel.classList.add('hidden');
      renderShop();
      shopPanel.classList.remove('hidden');
      shopPanel.setAttribute('aria-hidden','false');
    });
    const close = document.getElementById('shop-close');
    if (close) close.onclick = () => {
      shopPanel.classList.add('hidden'); shopPanel.setAttribute('aria-hidden','true');
      cmdPanel.classList.remove('hidden');
    };

    console.log('[wire] buttons ready');
  }catch(err){ console.error('[wire] failed:', err); }
})();

updateView();
