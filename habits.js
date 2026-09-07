/* =========================================
   CLOVER - HABITS.JS - FULLY WORKING
========================================= */

const TODAY = new Date();
const TODAY_STR = TODAY.toISOString().split('T')[0]; // YYYY-MM-DD
const MONTH = TODAY.getMonth();
const YEAR = TODAY.getFullYear();

// Default 6 habits
const DEFAULT_HABITS = [
    { id: 'water', name: 'Water', desc: 'Drink 2L water daily', icon: 'droplets', streak: 7, total: 12, weekly: [1,1,1,1,1,1,0], completions: {} },
    { id: 'read', name: 'Read', desc: 'Read 10 pages', icon: 'book-open', streak: 18, total: 22, weekly: [1,1,1,1,1,1,1], completions: {} },
    { id: 'meditate', name: 'Meditate', desc: '10 min mindfulness', icon: 'brain', streak: 2, total: 8, weekly: [1,0,1,0,0,0,0], completions: {} },
    { id: 'run', name: 'Run', desc: '2km walk/run', icon: 'footprints', streak: 5, total: 15, weekly: [1,1,1,1,1,0,0], completions: {} },
    { id: 'sleep', name: 'Sleep', desc: '8h sleep goal', icon: 'moon', streak: 12, total: 20, weekly: [1,1,1,1,1,1,0], completions: {} },
    { id: 'journal', name: 'Journal', desc: 'Write 3 lines', icon: 'notebook-pen', streak: 3, total: 10, weekly: [1,1,1,0,0,0,0], completions: {} }
];

// Load or init
let habits = JSON.parse(localStorage.getItem('clover_habits')) || DEFAULT_HABITS;

// Init fake history for calendar demo if empty
if (!localStorage.getItem('clover_history')) {
    const history = {};
    for (let d = 1; d <= 30; d++) {
        const date = `${YEAR}-${String(MONTH+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        // random realistic data
        let done = Math.floor(Math.random() * 7);
        if ([22,23,24,1,3,5,9,11,12,13,15,16,17,20].includes(d)) done = 6;
        if ([6,7,21,29,30].includes(d)) done = 0;
        history[date] = done;
    }
    localStorage.setItem('clover_history', JSON.stringify(history));
}

function save() {
    localStorage.setItem('clover_habits', JSON.stringify(habits));
}

function getHistory() {
    return JSON.parse(localStorage.getItem('clover_history')) || {};
}

function setHistory(dateStr, count) {
    const h = getHistory();
    h[dateStr] = count;
    localStorage.setItem('clover_history', JSON.stringify(h));
}

function countTodayDone() {
    return habits.filter(h => isDoneToday(h)).length;
}

function isDoneToday(habit) {
    const h = getHistory();
    // check if today's entry includes this habit - we simplify by checking weekly array + today toggle
    return habit._doneToday || false;
}

// ================= RENDER HABITS =================
function renderHabits() {
    const grid = document.querySelector('.habit-grid');
    if (!grid) return;
    grid.innerHTML = '';

    habits.forEach(habit => {
        const doneToday = habit._doneToday || false;
        const weeklyDone = habit.weekly.filter(x=>x===1).length;
        const weeklyPercent = Math.round((weeklyDone/7)*100);

        const card = document.createElement('div');
        card.className = 'habit-card';
        card.innerHTML = `
            <div class="habit-top">
                <div class="habit-left">
                    <div class="habit-icon"><i data-lucide="${habit.icon}"></i></div>
                    <div class="habit-info"><h3>${habit.name}</h3><p>${habit.desc}</p></div>
                </div>
                <div class="habit-check ${doneToday? 'completed' : ''}" data-id="${habit.id}">
                    ${doneToday? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
                </div>
            </div>
            <div class="habit-meta"><span>🔥 ${habit.streak} day streak</span><span>${habit.total} times done</span></div>
            <div class="habit-progress"><div class="habit-progress-fill" style="width:${weeklyPercent}%"></div></div>
            <div class="habit-week"><span>Weekly ${weeklyDone}/7</span><span>${weeklyPercent}%</span></div>
        `;
        grid.appendChild(card);
    });

    lucide.createIcons();

    // Add click listeners
    document.querySelectorAll('.habit-check').forEach(btn => {
        btn.addEventListener('click', () => toggleHabit(btn.dataset.id));
    });
}

function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    habit._doneToday =!habit._doneToday;

    if (habit._doneToday) {
        habit.total++;
        habit.streak++;
        habit.weekly[6] = 1; // today = last index (SUN)
    } else {
        habit.total = Math.max(0, habit.total - 1);
        habit.streak = Math.max(0, habit.streak - 1);
        habit.weekly[6] = 0;
    }

    // Update history calendar
    const todayCount = habits.filter(h => h._doneToday).length;
    setHistory(TODAY_STR, todayCount);

    save();
    renderAll();
}

// ================= RENDER STATS =================
function renderStats() {
    const history = getHistory();
    const currentStreak = Math.max(...habits.map(h=>h.streak), 0);
    const longestStreak = Math.max(currentStreak, 24);
    const totalActive = habits.length;

    // This month % = average done per day / total habits
    const daysInMonth = new Date(YEAR, MONTH+1, 0).getDate();
    const totalPossible = daysInMonth * totalActive;
    let totalDoneMonth = 0;
    Object.values(history).forEach(v => totalDoneMonth += v);
    const monthPercent = Math.round((totalDoneMonth / totalPossible) * 100) || 68;

    const boxes = document.querySelectorAll('.stat-box');
    if (boxes.length >= 4) {
        boxes[0].querySelector('strong').textContent = currentStreak;
        boxes[1].querySelector('strong').textContent = longestStreak;
        boxes[2].querySelector('strong').textContent = monthPercent + '%';
        boxes[2].querySelector('small').textContent = `${Object.values(history).filter(v=>v>0).length} of ${daysInMonth} days`;
        boxes[3].querySelector('strong').textContent = totalActive;
    }

    // Streak section
    const streakEl = document.querySelector('.progress-number strong');
    if (streakEl) streakEl.textContent = currentStreak;
    const lineFill = document.querySelector('.progress-line-fill');
    if (lineFill) lineFill.style.width = monthPercent + '%';
    const weeklyMeta = document.querySelector('.progress-meta strong');
    if (weeklyMeta) weeklyMeta.textContent = monthPercent + '%';
}

function renderCalendar() {
    const grid = document.querySelector('.calendar-grid');
    if (!grid) return;
    const history = getHistory();
    grid.innerHTML = '';

    const daysInMonth = new Date(YEAR, MONTH+1, 0).getDate();
    const firstDay = new Date(YEAR, MONTH, 1).getDay(); // 0 Sun
    const startOffset = firstDay === 0? 6 : firstDay - 1; // MON start

    for (let i=0; i<startOffset; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let d=1; d<=daysInMonth; d++) {
        const dateStr = `${YEAR}-${String(MONTH+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        let count = history[dateStr]?? 0;
        // Override today with real count
        if (dateStr === TODAY_STR) count = countTodayDone();

        let level = 'level-0';
        if (count === 1) level = 'level-1';
        else if (count === 2) level = 'level-2';
        else if (count === 3) level = 'level-3';
        else if (count === 4 || count === 5) level = 'level-4';
        else if (count >= 6) level = 'level-6';

        const day = document.createElement('div');
        day.className = `calendar-day ${level}`;
        day.innerHTML = `<strong>${d}</strong><small>${count}/6</small>`;
        if (dateStr === TODAY_STR) day.style.outline = '2px solid #171717';
        grid.appendChild(day);
    }

    // Fill remaining to make 35 cells
    const totalCells = startOffset + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i=0; i<remaining; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }
}

function renderInsights() {
    if (habits.length === 0) return;
    const most = [...habits].sort((a,b)=>b.streak-a.streak)[0];
    const least = [...habits].sort((a,b)=>a.weekly.filter(x=>x===1).length - b.weekly.filter(x=>x===1).length)[0];

    const bestCard = document.querySelector('.insight-card.best h4');
    if (bestCard) bestCard.innerHTML = `<i data-lucide="${most.icon}" style="width:16px;height:16px;"></i> ${most.name} — ${most.streak} days`;

    const attentionCard = document.querySelector('.insight-card.attention h4');
    const attentionP = document.querySelector('.insight-card.attention p');
    if (attentionCard) attentionCard.innerHTML = `<i data-lucide="${least.icon}" style="width:16px;height:16px;"></i> ${least.name} — ${least.weekly.filter(x=>x===1).length}/7 days`;
    if (attentionP) attentionP.textContent = `You skipped ${7 - least.weekly.filter(x=>x===1).length} days this week. Try morning slot.`;

    const currentStreak = Math.max(...habits.map(h=>h.streak));
    const motivationH4 = document.querySelector('.insight-card.motivation h4');
    if (motivationH4) motivationH4.textContent = `You're ${24-currentStreak} days away from beating your record!`;
}

function renderWeekPills() {
    const weekRow = document.querySelector('.week-row');
    if (!weekRow) return;
    const history = getHistory();

    // last 7 days
    const pills = weekRow.querySelectorAll('.pill');
    let dayIndex = 0;
    for (let i=6; i>=0; i--) {
        const date = new Date();
        date.setDate(TODAY.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = history[dateStr] || 0;
        const pill = pills[dayIndex];
        if (pill) {
            pill.className = 'pill';
            if (count >= 4) pill.classList.add('done');
            if (i===0) {
                pill.classList.add('today');
                if (count >=4) pill.classList.add('done');
            }
            pill.innerHTML = count >=4? '<i data-lucide="check" style="width:12px;height:12px;"></i>' : '';
        }
        dayIndex++;
    }
    lucide.createIcons();
}

function renderAll() {
    renderHabits();
    renderStats();
    renderCalendar();
    renderInsights();
    renderWeekPills();
}

// ================= NEW HABIT MODAL =================
function createModal() {
    if (document.getElementById('habitModal')) return;
    const modalHTML = `
    <div id="habitModal" style="display:none;position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;">
        <div style="background:#FFFFFF;border:1px solid #D9D6CC;padding:28px;width:90%;max-width:420px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="margin:0;font-size:20px;font-weight:800;">New Ritual</h3>
                <button id="closeModal" style="background:none;border:none;cursor:pointer;"><i data-lucide="x"></i></button>
            </div>
            <input id="habitName" placeholder="Habit name (e.g. Exercise)" style="width:100%;padding:12px;border:1px solid #D9D6CC;margin-bottom:12px;font-family:Inter;">
            <input id="habitDesc" placeholder="Description (e.g. 30 mins daily)" style="width:100%;padding:12px;border:1px solid #D9D6CC;margin-bottom:12px;font-family:Inter;">
            <select id="habitIcon" style="width:100%;padding:12px;border:1px solid #D9D6CC;margin-bottom:20px;font-family:Inter;">
                <option value="droplets">💧 Water</option>
                <option value="book-open">📚 Read</option>
                <option value="brain">🧘 Meditate</option>
                <option value="footprints">🏃 Run</option>
                <option value="moon">😴 Sleep</option>
                <option value="notebook-pen">📝 Journal</option>
                <option value="dumbbell">💪 Workout</option>
                <option value="apple">🍎 Healthy Eat</option>
                <option value="sun">☀️ Morning</option>
            </select>
            <button id="saveHabit" style="width:100%;background:#171717;color:#F3F0E8;border:none;padding:14px;font-weight:600;cursor:pointer;">Create Habit</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    lucide.createIcons();

    document.getElementById('closeModal').onclick = () => document.getElementById('habitModal').style.display = 'none';
    document.getElementById('habitModal').onclick = (e) => { if (e.target.id==='habitModal') e.target.style.display='none'; }
    document.getElementById('saveHabit').onclick = addNewHabit;
}

function addNewHabit() {
    const name = document.getElementById('habitName').value.trim();
    const desc = document.getElementById('habitDesc').value.trim() || 'Daily habit';
    const icon = document.getElementById('habitIcon').value;
    if (!name) { alert('Enter habit name'); return; }

    habits.push({
        id: name.toLowerCase().replace(/\s+/g,'-') + '-' + Date.now(),
        name: name,
        desc: desc,
        icon: icon,
        streak: 0,
        total: 0,
        weekly: [0,0,0,0,0,0,0],
        _doneToday: false
    });
    save();
    document.getElementById('habitModal').style.display = 'none';
    document.getElementById('habitName').value = '';
    document.getElementById('habitDesc').value = '';
    renderAll();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    createModal();
    renderAll();

    const newBtn = document.querySelector('.new-task-button');
    if (newBtn) {
        newBtn.onclick = () => {
            document.getElementById('habitModal').style.display = 'flex';
        };
    }

    // Set today's date label
    const label = document.querySelector('.workspace-header.section-label');
    if (label) {
        label.textContent = `TODAY • ${TODAY.toLocaleDateString('en-US',{month:'short', day:'numeric', year:'numeric'}).toUpperCase()}`;
    }
});