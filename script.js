// ====== 状態 ======
let mood=5, hunger=5, sleep=5, nuts=0;
const max=5;

function updateParams(){
  document.getElementById("param-mood").textContent   = "ｺﾞｷｹﾞﾝ: " + "♥️".repeat(mood);
  document.getElementById("param-hunger").textContent = "ｵﾅｶ: "   + "🍬".repeat(hunger);
  document.getElementById("param-sleep").textContent  = "ﾈﾑﾈﾑ: " + "💤".repeat(sleep);
  document.getElementById("nuts").textContent = String(nuts);
}

// ====== 要素参照 ======
const stand = document.getElementById("fairy-stand");
const happy = document.getElementById("fairy-happy");
const guest = document.getElementById("fairy-guest");
const frameArt = document.getElementById("frameArt");
const bubble = document.getElementById("bubble");
const bubbleText = document.getElementById("bubble-text");
const fx = document.getElementById("fx");

// ====== 吹き出し ======
function say(text, ms=1500){
  bubbleText.textContent = text;
  bubble.classList.remove("hidden");
  clearTimeout(say._t);
  say._t = setTimeout(()=> bubble.classList.add("hidden"), ms);
}
const smallTalks = [
  "ﾅﾃﾞﾅﾃﾞ…わるくない", "どんぐり…ひとつくれ", "む…いい光", "ｵﾔﾂの じかん？"
];

// ====== 自分のジャンプ（バンザイ） ======
function fairyJump(){
  stand.classList.add("hidden");
  happy.classList.remove("hidden");
  happy.classList.add("jump");
  happy.addEventListener("animationend", ()=>{
    happy.classList.remove("jump");
    happy.classList.add("hidden");
    stand.classList.remove("hidden");
  }, {once:true});
}
stand.addEventListener("click", fairyJump);

// ====== ｵﾔﾂ演出：降下→口パク→バンザイ ======
const eat1 = new Image(); eat1.src = "assets/fairy-eat1.png";
const eat2 = new Image(); eat2.src = "assets/fairy-eat2.png";
let hasEat=false; eat1.onload = eat2.onload = ()=> hasEat=true;

function dropSnacks(count=7){
  const emojis = ["🥮","🍒","🍬","🍪","🍓","🍇","🧁"];
  const baseLeft = 50;
  for(let i=0;i<count;i++){
    const s = document.createElement("span");
    s.className = "snack";
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const offset = (Math.random()*36 - 18);
    s.style.left = `calc(${baseLeft}% + ${offset}%)`;
    s.style.setProperty("--t", (0.9 + Math.random()*0.6) + "s");
    s.style.animationDelay = (Math.random()*0.25) + "s";
    fx.appendChild(s);
    s.addEventListener("animationend", ()=> s.remove(), {once:true});
  }
}
function playMouth(ms=1200){
  if(!hasEat){ return; }
  const origin = stand.src;
  let i=0, seq=[eat1.src, eat2.src];
  stand.src = seq[0];
  const int = setInterval(()=>{ i=1-i; stand.src = seq[i]; }, 160);
  setTimeout(()=>{ clearInterval(int); stand.src = origin; }, ms);
}

// ====== ﾈﾝﾈ：後ろ向き→ベッドで寝る→Zzz×2→回復 ======
const BED = { left: "72%", bottom: "20%" }; // 背景に合わせて微調整してね
let originPos = null;
function zzz(count=2){
  for(let i=0;i<count;i++){
    const s = document.createElement("span");
    s.className = "zzz";
    s.style.animationDelay = (i*0.6)+"s";
    s.textContent = "💤";
    fx.appendChild(s);
    s.addEventListener("animationend", ()=> s.remove(), {once:true});
  }
}
function goSleep(){
  if(!originPos){
    const cs = getComputedStyle(stand);
    originPos = { bottom: cs.bottom, left: "50%", width: cs.width };
  }
  // 後ろ向きへ（なければ直立のままでもOK）
  fetch("assets/fairy-back.png",{method:"HEAD"}).then(r=>{
    if(r.ok) stand.src = "assets/fairy-back.png";
  });
  // ベッド位置へ移動
  stand.style.left = BED.left;
  stand.style.bottom = BED.bottom;
  stand.style.width = "min(22%,140px)";

  setTimeout(()=>{
    fetch("assets/fairy-sleep.png",{method:"HEAD"}).then(r=>{
      if(r.ok) stand.src = "assets/fairy-sleep.png";
      zzz(2);
      sleep = max; updateParams();
      setTimeout(()=>{
        stand.src = "assets/fairy-stand.png";
        stand.style.left = originPos.left;
        stand.style.bottom = originPos.bottom;
        stand.style.width = originPos.width;
      }, 1700);
    });
  }, 350);
}

// ====== ｵｷｬｸｻﾝ：3種からランダム、並んでぴょん ======
function pickGuest(n=3){
  const id = 1 + Math.floor(Math.random()*n);
  return {
    stand:`assets/fairy-guest${id}-stand.png`,
    happy:`assets/fairy-guest${id}-happy.png`
  };
}
function guestVisit(){
  const g = pickGuest();
  guest.src = g.stand;
  guest.classList.remove("hidden");
  // 並んで2回ぴょん
  fairyJump();
  setTimeout(()=> fairyJump(), 550);
  // ゲストもバンザイ画像に差し替えてジャンプ感
  setTimeout(()=>{
    guest.src = g.happy;
    guest.classList.add("jump");
    guest.addEventListener("animationend", ()=>{
      guest.classList.remove("jump");
      guest.src = g.stand;
    }, {once:true});
  }, 80);

  // ごきげん＆どんぐりUP
  mood = Math.min(max, mood+1);
  nuts += 1;
  updateParams();
  say("ｵｷｬｸｻﾝ ｲﾗｯｼｬｲ", 1300);

  setTimeout(()=> guest.classList.add("hidden"), 1800);
}

// ====== ショップ（額＆パネル壁紙） ======
const shop = document.getElementById("shop");
const shopGrid = document.getElementById("shopGrid");
const items = [
  { id:"art-sky",    name:"空の絵",   cost:2, type:"frame", src:"assets/frame-sky.png" },
  { id:"art-flower", name:"花の絵",   cost:3, type:"frame", src:"assets/frame-flower.png" },
  { id:"art-moon",   name:"月の絵",   cost:4, type:"frame", src:"assets/frame-moon.png" },
  { id:"panel-wood", name:"木目ﾊﾟﾈﾙ", cost:2, type:"panel", src:"assets/panel-wood.png" },
  { id:"panel-fancy",name:"模様ﾊﾟﾈﾙ", cost:3, type:"panel", src:"assets/panel-fancy.png" }
];
function renderShop(){
  shopGrid.innerHTML = "";
  items.forEach(it=>{
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `
      <div style="font-size:28px;margin:6px 0;">${it.type==="frame"?"🖼️":"🧩"}</div>
      <div>${it.name}</div>
      <div style="opacity:.7;">🌰 ${it.cost}</div>
      <button data-id="${it.id}">こうにゅう</button>
    `;
    shopGrid.appendChild(div);
  });
  // 購入ボタン
  shopGrid.querySelectorAll("button").forEach(btn=>{
    btn.onclick = ()=>{
      const it = items.find(i=>i.id===btn.dataset.id);
      if(!it) return;
      if(nuts < it.cost){ say("…どんぐり たりない", 1000); return; }
      nuts -= it.cost; updateParams();
      if(it.type==="frame"){
        frameArt.src = it.src; frameArt.classList.remove("hidden");
        saveGame();
        say("いい えらび", 1000);
      }else if(it.type==="panel"){
        document.documentElement.style.setProperty("--panel-bg", `url('${it.src}')`);
        document.documentElement.style.setProperty("--panel-bg-size", `auto 100%`);
        saveGame();
        say("かわいく なった", 1000);
      }
    };
  });
}
function openShop(){ renderShop(); shop.classList.remove("hidden"); }
function closeShop(){ shop.classList.add("hidden"); }
document.getElementById("act-shop").onclick = openShop;
document.getElementById("shopClose").onclick = closeShop;

// 黒背景クリック or ESCキーでも閉じられる
shop.addEventListener("click", (e)=>{
  if(e.target.id === "shop") closeShop();
});
document.addEventListener("keydown",(e)=>{
  if(e.key==="Escape") closeShop();
});
// ====== ボタン動作（かわいめ演出つき） ======
document.getElementById("act-pet").onclick = ()=>{
  if(mood<max) mood++;
  updateParams();
  fairyJump();
  say("…いまの、わるくない", 1200);
};
document.getElementById("act-snack").onclick = ()=>{
  if(hunger<max) hunger++;
  updateParams();
  dropSnacks(7);      // 上からおやつ
  setTimeout(()=> playMouth(1200), 250); // ちょい遅れて口パク
  setTimeout(()=> fairyJump(), 1200);    // 〆にバンザイぴょん
  say("もぐ… これ、好きかも", 1200);
};
document.getElementById("act-sleep").onclick = ()=>{
  goSleep();
  say("すこし… ねるね…", 1200);
};
document.getElementById("act-guest").onclick = guestVisit;
document.getElementById("act-adventure").onclick = ()=>{
  nuts++; if(mood>0) mood--; if(hunger>0) hunger--;
  updateParams();
  fairyJump();
  say(smallTalks[Math.floor(Math.random()*smallTalks.length)], 1500);
};

// 昼/夜トグル（sky二枚のhidden切替）
document.getElementById("toggle-sky").onclick = ()=>{
  document.querySelectorAll(".room-sky").forEach(img=>img.classList.toggle("hidden"));
};

// セーブ／ロード（額とパネルも保存）
function saveGame(){
  const panelBg = getComputedStyle(document.documentElement).getPropertyValue("--panel-bg").trim();
  const data = {
    mood,hunger,sleep,nuts,
    frameSrc: frameArt.classList.contains("hidden") ? "" : frameArt.src,
    panelBg
  };
  localStorage.setItem("fairyData", JSON.stringify(data));
}
document.getElementById("save").onclick = ()=>{ saveGame(); alert("日記に書いたよ ✍️"); };

(function load(){
  const raw = localStorage.getItem("fairyData");
  if(raw){
    try{
      const d = JSON.parse(raw);
      mood=d.mood??5; hunger=d.hunger??5; sleep=d.sleep??5; nuts=d.nuts??0;
      if(d.frameSrc){ frameArt.src=d.frameSrc; frameArt.classList.remove("hidden"); }
      if(d.panelBg){
        document.documentElement.style.setProperty("--panel-bg", d.panelBg);
        // 画像が入ってるときに伸びすぎないよう一応
        if(d.panelBg.includes("url(")){
          document.documentElement.style.setProperty("--panel-bg-size", `auto 100%`);
        }
      }
    }catch(e){}
  }
  updateParams();
})();
