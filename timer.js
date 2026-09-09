const timeText = document.querySelector(".circle-text strong");
const roundText = document.querySelector(".circle-text span");
const progressCircle = document.querySelector(".progress-ring.fg");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const noteText = document.getElementById("timerNote");
const activeTag = document.querySelector(".active-tag");

let focusTime = 25 * 60;
let breakTime = 5 * 60;
let timeLeft = focusTime;
let isRunning = false;
let timerInterval = null;
let isFocus = true;
let round = 1;
const fullDash = 339.29;

// ---- FOR DASHBOARD ----
let sessions = Number(localStorage.getItem("sessions") || 0);
function saveSession(){
  sessions++;
  localStorage.setItem("sessions", sessions);
  // save daily streak date
  let today = new Date().toISOString().split('T')[0];
  let dates = JSON.parse(localStorage.getItem("streakDates")||"[]");
  if(!dates.includes(today)){ dates.push(today); localStorage.setItem("streakDates", JSON.stringify(dates)); }
}

function updateDisplay(){
  let m = Math.floor(timeLeft / 60);
  let s = timeLeft % 60;
  if(m < 10) m = "0" + m;
  if(s < 10) s = "0" + s;
  if(timeText) timeText.innerText = m + ":" + s;
}

function updateCircle(){
  let total = isFocus? focusTime : breakTime;
  let percentLeft = timeLeft / total;
  if(progressCircle) progressCircle.style.strokeDashoffset = fullDash * (1 - percentLeft);
}

function startTimer(){
  isRunning = true;
  if(startBtn){ startBtn.innerText = "Pause"; startBtn.classList.add("pause-mode"); }
  if(noteText) noteText.innerText = isFocus? "Focusing... stay in flow" : "Break time... relax";
  if(activeTag) activeTag.innerText = isFocus? "Focusing" : "Break";

  timerInterval = setInterval(function(){
    timeLeft--;
    updateDisplay();
    updateCircle();

    if(timeLeft <= 0){
      clearInterval(timerInterval);
      isRunning = false;
      if(startBtn){ startBtn.innerText = "Start"; startBtn.classList.remove("pause-mode"); }

      if(isFocus){
        saveSession(); // <-- SAVES TO DASHBOARD
        alert("Focus done! Session saved. Time for break.");
        isFocus = false;
        timeLeft = breakTime;
      } else {
        alert("Break over! Next focus.");
        isFocus = true;
        round++;
        if(round > 4){ round = 1; alert("All 4 sessions done! 🎉"); }
        timeLeft = focusTime;
      }
      if(roundText) roundText.innerText = (isFocus? "Focus" : "Break") + " • Round " + round + "/4";
      updateDisplay();
      updateCircle();
      if(noteText) noteText.innerText = "Ready to " + (isFocus? "focus" : "break");
      if(activeTag) activeTag.innerText = "Active";
    }
  }, 1000);
}

function pauseTimer(){
  clearInterval(timerInterval);
  isRunning = false;
  if(startBtn){ startBtn.innerText = "Resume"; startBtn.classList.remove("pause-mode"); }
  if(noteText) noteText.innerText = "Paused";
}

function resetTimer(){
  clearInterval(timerInterval);
  isRunning = false;
  isFocus = true;
  timeLeft = focusTime;
  round = 1;
  if(startBtn){ startBtn.innerText = "Start"; startBtn.classList.remove("pause-mode"); }
  if(roundText) roundText.innerText = "Focus • Round 1/4";
  if(noteText) noteText.innerText = "Ready to focus";
  if(activeTag) activeTag.innerText = "Active";
  updateDisplay();
  updateCircle();
}

startBtn?.addEventListener("click", function(){
  if(isRunning) pauseTimer();
  else startTimer();
});
resetBtn?.addEventListener("click", resetTimer);

updateDisplay();
updateCircle();