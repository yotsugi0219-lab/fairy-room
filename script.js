// ====== 基本状態 ======
let mood=5, hunger=5, sleep=5, nuts=0;
const max=5;

const sky = document.getElementById('sky');
const fairy = document.getElementById('fairy');
const sayBox = document.getElementById('say');

// ドラッグ無効
['roomBase','sky','frameArt','fairy'].forEach(id=>{
  const el = document.getElementById(id);
  if(el){ el.setAttribute('draggable','false'); el.addEventListener('dragstart',e=>e.preventDefault()); }
});

// ステータス表示
function hearts(n){ return '♥️'.repeat(n); }
function candies(n){ return '🍬'.repeat(n); }
function sleeps(n){ return '💤'.repeat(n); }
function updateParams(){
  document.getElementById('mood').textContent   = hearts(mood);
  document.getElementById('hunger').textContent = candies(hunger);
  document.getElementById('sleep').textContent  = sleeps(sleep);
  document.getElementById('nuts').textContent   = nuts;
}
updateParams();

// しゃべる
function say(text,ms=1100){
  sayBox.textContent = text;
  sayBox.classList.remove('hidden');
  setTimeout(()=>sayBox.classList.add('hidden'), ms);
}

// フェアリー演出
function swap(src, dur=400){
  const old = fairy.src;
  fairy.src = src;
  setTimeout(()=>fairy.src=old, dur);
}
function jump(){ fairy.classList.add('jump'); setTimeout(()=>fairy.classList.remove('jump'), 600); }

// 昼夜
document.getElementById('toggle-sky').onclick = ()=>{
  const isDay = sky.src.includes('sky-day');
  sky.src = isDay ? sky.dataset.night : sky.dataset.day;
};

// ====== ボタン ======
document.getElementById('act-pet').onclick = ()=>{
  if(mood<max) mood++;
  updateParams();
  jump();
  say('…いまの、わるくない');
};

document.getElementById('act-snack').onclick = ()=>{
  if(hunger<max) hunger++;
  updateParams();
  // 1) 上からおやつが降る
  dropSnacks(7);
  // 2) 口パク（happy差し替え）
  swap('assets/fairy-happy.png', 400);
  // 3) ぴょん
  setTimeout(jump, 420);
  say('おいしい！');
};

// スナック降下（絵文字だけでOK）
function dropSnacks(count=5){
  const layer = document.getElementById('snackLayer');
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className='snack';
    el.textContent = Math.random()<.5 ? '🥮' : '🍒';
    const left = Math.random()*90+5;
    const dur = 1200 + Math.random()*900;
    el.style.left = left+'vw';
    el.style.animation = `fall ${dur}ms linear forwards`;
    layer.appendChild(el);
    setTimeout(()=>layer.removeChild(el), dur+100);
  }
}

// ネンネ：ちょっとだけ演出 → ねむけ回復
document.getElementById('act-sleep').onclick = async ()=>{
  say('おふとん…');
  // ふとんのほうへ寄った風に（簡易）
  fairy.style.bottom = '18%';
  setTimeout(()=>fairy.style.bottom='8%', 1000);
  await new Promise(r=>setTimeout(r, 400));
  say('💤', 1000);
  await new Promise(r=>setTimeout(r, 1000));
  sleep = max; updateParams();
};

// セーブ
document.getElementById('save').onclick = ()=>{
  const data = {mood,hunger,sleep,nuts, sky: sky.src, wall:getComputedStyle(document.documentElement).getPropertyValue('--panel-wall').trim()};
  localStorage.setItem('fairy-room', JSON.stringify(data));
  say('日記にかいたよ');
};
(function restore(){
  const raw = localStorage.getItem('fairy-room');
  if(!raw) return;
  try{
    const d = JSON.parse(raw);
    mood=d.mood; hunger=d.hunger; sleep=d.sleep; nuts=d.nuts; 
    if(d.sky) sky.src=d.sky;
    if(d.wall) document.documentElement.style.setProperty('--panel-wall', d.wall);
    updateParams();
  }catch{}
})();

// ====== ショップ ======
const shop = document.getElementById('shop');
const shopGrid = document.getElementById('shopGrid');
// 壁紙候補（CSS色で安全運用）
const items = [
  { id:'wall-kraft', label:'クラフト', cost:2, type:'panel', wall:'#171a20' },
  { id:'wall-navy',  label:'ネイビー', cost:2, type:'panel', wall:'#0f1524' },
  { id:'wall-rose',  label:'ローズ',   cost:2, type:'panel', wall:'#1f1418' },
];
function renderShop(){
  shopGrid.innerHTML = items.map(i=>`
    <button data-id="${i.id}">
      <div><strong>${i.label}</strong></div>
      <div class="tiny">🌰×${i.cost}</div>
    </button>
  `).join('');
}
function openShop(){ renderShop(); shop.classList.remove('hidden'); }
function closeShop(){ shop.classList.add('hidden');}

// open/close配線（絶対閉じる）
document.getElementById('act-shop').onclick = openShop;
document.getElementById('shopClose').onclick = closeShop;
shop.addEventListener('click', (e)=>{ if(e.target.id==='shop') closeShop(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeShop(); });

// 購入動作
shopGrid.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const it = items.find(x=>x.id===btn.dataset.id); if(!it) return;
  if(nuts < it.cost){ say('…どんぐり たりない'); return; }
  nuts -= it.cost; updateParams();
  if(it.type==='panel'){
    document.documentElement.style.setProperty('--panel-wall', it.wall);
    saveAfterShop();
    say('かわいく なった');
  }
});
function saveAfterShop(){
  // 状態も保存しておく
  document.getElementById('save').click();
}
