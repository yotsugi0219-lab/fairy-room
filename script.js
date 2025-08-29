let mood=5, hunger=5, sleep=5, nuts=0;
const max=5;

function updateParams(){
  document.getElementById("param-mood").textContent = "ｺﾞｷｹﾞﾝ: " + "♥️".repeat(mood);
  document.getElementById("param-hunger").textContent = "ｵﾅｶ: " + "🍬".repeat(hunger);
  document.getElementById("param-sleep").textContent = "ﾈﾑﾈﾑ: " + "💤".repeat(sleep);
  document.getElementById("nuts").textContent = "🌰"+nuts;
}

function fairyJump(){
  const stand=document.getElementById("fairy-stand");
  const happy=document.getElementById("fairy-happy");
  stand.classList.add("hidden");
  happy.classList.remove("hidden");
  happy.classList.add("jump");
  happy.addEventListener("animationend",()=>{
    happy.classList.remove("jump");
    happy.classList.add("hidden");
    stand.classList.remove("hidden");
  },{once:true});
}

document.getElementById("act-pet").onclick=()=>{
  if(mood<max) mood++;
  updateParams(); fairyJump();
};
document.getElementById("act-snack").onclick=()=>{
  if(hunger<max) hunger++;
  updateParams();
};
document.getElementById("act-sleep").onclick=()=>{
  sleep=max; updateParams();
};
document.getElementById("act-adventure").onclick=()=>{
  nuts++; if(mood>0) mood--; if(hunger>0) hunger--; updateParams();
};

document.getElementById("save").onclick=()=>{
  localStorage.setItem("fairyData",JSON.stringify({mood,hunger,sleep,nuts}));
  alert("ﾁｮｺｯと日記ﾂｹﾀ");
};
document.getElementById("toggle-sky").onclick=()=>{
  const sky=document.querySelector("[data-sky]");
  if(sky.src.includes("sky-day")){ sky.src="assets/themes/default/sky-night.png"; }
  else { sky.src="assets/themes/default/sky-day.png"; }
};

function load(){
  let d=localStorage.getItem("fairyData");
  if(d){ let obj=JSON.parse(d); mood=obj.mood; hunger=obj.hunger; sleep=obj.sleep; nuts=obj.nuts; }
  updateParams();
}
load();
