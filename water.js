const todayIntake = document.getElementById("todayIntake");
const leftToGoal = document.getElementById("leftToGoal");
const topPercent = document.getElementById("topPercent");
const bigIntake = document.getElementById("bigIntake");
const bigFill = document.getElementById("bigFill");
const bigPercent = document.getElementById("bigPercent");
const openBtn = document.getElementById("openWaterModal");
const modal = document.getElementById("waterModal");
const closeBtn = document.getElementById("closeModal");
const quickBtns = document.querySelectorAll(".quick-btn");
const customInput = document.getElementById("customMl");
const customAddBtn = document.getElementById("addCustomBtn");
const habitChecks = document.querySelectorAll(".habit-check");

let dailyGoal = 3000;
let today = new Date().toISOString().split('T')[0];
let history = JSON.parse(localStorage.getItem("waterHistory") || "{}");
let currentIntake = history[today]?? Number(localStorage.getItem("waterIntake") || 1800);
if (currentIntake > 10000) currentIntake = 1800;

function saveWeeklyHistory(){
  // THIS CONNECTS TO DASHBOARD - DO NOT REMOVE
  let hist = JSON.parse(localStorage.getItem("waterHistory") || "{}");
  hist[today] = currentIntake;
  localStorage.setItem("waterHistory", JSON.stringify(hist));
  localStorage.setItem("waterIntake", currentIntake);
  localStorage.setItem("lastWaterDate", today);
}

function showToast(msg){
  let t=document.createElement("div");
  t.innerText=msg;
  t.style.cssText="position:fixed;top:20px;right:20px;background:#2F4A5A;color:#fff;padding:12px 18px;border-radius:10px;z-index:9999;font-weight:700;";
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

function updateDisplay(){
  let liters = (currentIntake/1000).toFixed(1);
  let left = Math.max(0,(dailyGoal-currentIntake)/1000);
  let percent = Math.min(100, Math.round((currentIntake/dailyGoal)*100));
  if(todayIntake) todayIntake.innerText = liters+"L";
  if(leftToGoal) leftToGoal.innerText = left.toFixed(1)+"L left to goal";
  if(topPercent) topPercent.innerText = percent+"%";
  if(bigIntake) bigIntake.innerText = liters+"L";
  if(bigFill) bigFill.style.width = percent+"%";
  if(bigPercent) bigPercent.innerText = percent+"%";
  saveWeeklyHistory();
}

function addWater(amount){
  if(currentIntake >= dailyGoal){ showToast("Goal done for today! 🎉"); return; }
  currentIntake += amount;
  if(currentIntake > dailyGoal) currentIntake = dailyGoal;
  updateDisplay();
  if(modal) modal.classList.remove("show");
  if(currentIntake >= dailyGoal) showToast("Goal Completed! "+(currentIntake/1000).toFixed(1)+"L 🎉");
}

if(openBtn) openBtn.addEventListener("click",()=>modal.classList.add("show"));
if(closeBtn) closeBtn.addEventListener("click",()=>modal.classList.remove("show"));
if(modal) modal.addEventListener("click",(e)=>{ if(e.target===modal) modal.classList.remove("show"); });
quickBtns.forEach(btn=> btn.addEventListener("click",()=> addWater(Number(btn.dataset.ml))));
if(customAddBtn) customAddBtn.addEventListener("click",()=>{
  let ml=Number(customInput.value);
  if(!ml) return;
  addWater(ml); customInput.value="";
});
habitChecks.forEach(check=>{
  check.addEventListener("click",()=>{
    let card=check.closest(".habit-card");
    let ml=parseInt(card.querySelector(".habit-info p")?.innerText)||250;
    if(check.innerText==="✓"){
      check.innerText="○";
      check.classList.remove("completed");
      currentIntake=Math.max(0,currentIntake-ml);
      updateDisplay();
    }
    else{
      check.innerText="✓";
      check.classList.add("completed");
      addWater(ml);
    }
  });
});

updateDisplay();