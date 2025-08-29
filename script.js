// ====== 参照 ======
const shop     = document.getElementById("shop");
const shopGrid = document.getElementById("shopGrid");
const frameArt = document.getElementById("frameArt");
const sky      = document.getElementById("sky");
const fairy    = document.getElementById("fairy");

// ====== パラメータ（絵文字5段階） ======
let mood=5, hunger=5, sleep=5, nuts=0, max=5;
function hearts(n){ return "♥️".repeat(n); }
function candies(n){ return "🍬".repeat(n); }
function sleeps(n){ return "💤".repeat(n); }
function updateParams(){
  document.getElementById("mood").textContent = hearts(mood);
  document.getElementById("hunger").textContent = candies(hunger);
  document.getElementById("sleep").textContent = sleeps(sleep);
  document.getElementById("nuts").textContent = nuts;
}
updateParams();

// ====== 昼/夜 ======
document.getElementById("toggle-sky").onclick = ()=>{
  const isDay = sky.src.includes("sky-day");
  sky.src = isDay ? sky.dataset.night : sky.dataset.day;
};

// ====== 行動ボタン ======
document.getElementById("act-pet").onclick = ()=>{
  if(mood<max) mood++;
  updateParams();
  jump();
};
document.getElementById("act-snack").onclick = ()=>{
  if(hunger<max) hunger++;
  updateParams();
  jump();
};
document.getElementById("act-sleep").onclick = ()=>{
  sleep = max;
  updateParams();
};

// ====== ジャンプ（簡易） ======
function jump(){
  fairy.style.transition = "transform .25s ease";
  fairy.style.transform = "translate(-50%, -20px)";
  setTimeout(()=>{
    fairy.style.transform = "translate(-50%, 0)";
  }, 250);
}

// ====== ショップ ======
function renderShop(){
  // 最小の2品だけ（確認用）
  // data-id に応じて処理
}
function openShop(){ renderShop(); shop.classList.remove("hidden"); }
function closeShop(){ shop.classList.add("hidden"); }
window.closeShop = closeShop; // HTMLのonclick保険

document.getElementById("act-shop").onclick = openShop;

// 背景クリック＆ESCで閉じる
shop.addEventListener("click",(e)=>{ if(e.target.id==="shop") closeShop(); });
document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeShop(); });

// ショップ内の購入ボタン（動作チェック用）
shopGrid.addEventListener("click",(e)=>{
  if(e.target.tagName!=="BUTTON") return;
  const id = e.target.dataset.id || e.target.getAttribute("data-id");
  if(id==="frameA"){
    if(nuts<2) return; nuts-=2;
    frameArt.src = "assets/window-frame.png"; // 手持ちの額縁に差し替え
    updateParams();
  }else if(id==="panelDark"){
    if(nuts<2) return; nuts-=2;
    document.documentElement.style.background = "#0d0f12";
    updateParams();
  }
});
