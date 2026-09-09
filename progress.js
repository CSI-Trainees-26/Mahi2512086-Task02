const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const dateElement = document.getElementById("motivationDate");
const likeBtn = document.getElementById("likeBtn");
const saveBtn = document.getElementById("saveBtn");
const newBtn = document.getElementById("newQuoteBtn");
const savedBox = document.getElementById("savedBox");
const savedList = document.getElementById("savedList");
const savedCount = document.getElementById("savedCount");

const backupQuotes = [
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Consistency is more important than perfection.", author: "Unknown" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" }
];

let currentQuote = null;
let savedQuotes = JSON.parse(localStorage.getItem("clover_saved") || "[]");
let isLiked = false;

function showDate() {
  const today = new Date();
  if(dateElement) dateElement.innerText = today.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
}

async function fetchQuoteFromAPI() {
  try {
    if(quoteText) quoteText.innerText = "Loading today's quote...";
    if(quoteAuthor) quoteAuthor.innerText = "";
    const response = await fetch("https://dummyjson.com/quotes/random");
    if (!response.ok) throw new Error("API failed");
    const data = await response.json();
    showQuote({ text: data.quote, author: data.author });
  } catch (error) {
    console.log("API failed, using backup:", error);
    const random = backupQuotes[Math.floor(Math.random() * backupQuotes.length)];
    showQuote(random);
  }
}

function showQuote(quote) {
  currentQuote = quote;
  if(quoteText) quoteText.innerText = `"${quote.text}"`;
  if(quoteAuthor) quoteAuthor.innerText = `- ${quote.author}`;
  isLiked = false;
  if(likeBtn){ likeBtn.innerText = "🤍 Like"; likeBtn.classList.remove("liked"); }
}

likeBtn?.addEventListener("click", function() {
  isLiked =!isLiked;
  if (isLiked) {
    likeBtn.innerText = "❤️ Liked";
    likeBtn.classList.add("liked");
  } else {
    likeBtn.innerText = "🤍 Like";
    likeBtn.classList.remove("liked");
  }
});

saveBtn?.addEventListener("click", function() {
  if(!currentQuote) return;
  const already = savedQuotes.find(q => q.text === currentQuote.text);
  if (already) { alert("Already saved!"); return; }
  savedQuotes.push(currentQuote);
  localStorage.setItem("clover_saved", JSON.stringify(savedQuotes));
  renderSaved();
});

function renderSaved() {
  if(!savedBox ||!savedList) return;
  if (savedQuotes.length === 0) {
    savedBox.style.display = "none";
    return;
  }
  savedBox.style.display = "block";
  if(savedCount) savedCount.innerText = savedQuotes.length;
  savedList.innerHTML = "";
  savedQuotes.forEach((q, index) => {
    const div = document.createElement("div");
    div.style.padding = "8px 0";
    div.style.borderBottom = "1px solid #EFE6F3";
    div.innerHTML = `
      <p style="margin:0; font-size:13px; color:#4B305C;">"${q.text}" - ${q.author}</p>
      <button onclick="deleteQuote(${index})" style="font-size:10px; margin-top:4px; cursor:pointer;">Delete</button>
    `;
    savedList.appendChild(div);
  });
}

window.deleteQuote = function(index) {
  savedQuotes.splice(index, 1);
  localStorage.setItem("clover_saved", JSON.stringify(savedQuotes));
  renderSaved();
}

newBtn?.addEventListener("click", function() {
  fetchQuoteFromAPI();
});

// ---- FIXED: REAL OVERALL PROGRESS FROM DASHBOARD DATA ----
function updateOverallProgress() {
  const get = (k,d) => { try{ return JSON.parse(localStorage.getItem(k))??d }catch{ return d } };
  let tasks = get("clover_tasks", []);
  let habits = get("clover_habits", []);
  let waterHistory = get("waterHistory", {});
  let today = new Date().toISOString().split('T')[0];

  let taskPct = 0;
  if(tasks.length){ taskPct = Math.round(tasks.filter(t=>t.completed||t.done).length / tasks.length * 100); }

  let habitPct = 0;
  if(habits.length){ habitPct = Math.round(habits.filter(h=>h.doneDates?.includes(today)).length / habits.length * 100); }

  let waterPct = 0;
  if(waterHistory[today]){ waterPct = Math.min(100, Math.round(waterHistory[today]/3000*100)); }

  let sess = Number(localStorage.getItem("sessions")||0);
  let focusPct = Math.min(100, sess*25); // 4 sessions = 100%

  let overall = Math.round((taskPct + habitPct + waterPct + focusPct)/4);
  if(overall > 100) overall = 100;

  const circle = document.querySelector(".progress-ring.fg");
  const text = document.querySelector(".circle-text strong");
  if (circle && text) {
    const totalDash = 534;
    const offset = totalDash - (totalDash * overall / 100);
    circle.style.strokeDashoffset = offset;
    text.innerText = overall + "%";
  }
}

window.addEventListener("DOMContentLoaded", function() {
  showDate();
  fetchQuoteFromAPI();
  renderSaved();
  updateOverallProgress();
  setInterval(updateOverallProgress, 3000); // update live
});