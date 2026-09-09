
document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();
    const todayKey = new Date().toISOString().split('T')[0];

    /* ===== LOAD DB ===== */
    let db = JSON.parse(localStorage.getItem("clover_db_v5")) || {
        habits: { Workout: true, Study: true, Meditation: false, Reading: true },
        tasks: { "Morning Workout": true, "Drink Water": false, "Read Book": false, "Do DSA": false, "Read 20 Pages": false, "drink enough water": true },
        water: 1250,
        sleep: 7.5,
        calories: 1450,
        pomodoroSessions: 0,
        streak: { current: 0, best: 0, week: [false,false,false,false,false,false,false], lastDate: null },
        mood: null,
        history: {}
    };

    function save() {
        db.history[todayKey] = {
            habitsDone: Object.values(db.habits).filter(Boolean).length,
            tasksDone: Object.values(db.tasks).filter(Boolean).length,
            water: db.water,
            sleep: db.sleep
        };
        localStorage.setItem("clover_db_v5", JSON.stringify(db));
        renderAll();
    }

    /* ===== ELEMENTS - YOUR CLASSES ONLY ===== */
    const habitChecks = document.querySelectorAll(".habit-check");
    const habitProgressText = document.getElementById("habitProgressText");
    const habitProgressFill = document.querySelector(".habit-progress-fill");

    const taskChecks = document.querySelectorAll(".task-check");
    const taskStatuses = document.querySelectorAll(".task-status");

    const waterAmount = document.getElementById("waterAmount");
    const waterProgress = document.querySelector(".water-progress");
    const addWaterBtn = document.getElementById("addWaterBtn");

    const sleepAmount = document.getElementById("sleepAmount");
    const calorieAmount = document.getElementById("calorieAmount");
    const calorieProgress = document.getElementById("calorieProgress");
    const caloriePercentage = document.getElementById("caloriePercentage");

    const moodEmojis = document.querySelectorAll("#moodEmojis span");
    const moodText = document.getElementById("moodText");
    const moodNote = document.getElementById("moodNote");
    const mDots = document.querySelectorAll(".m-dot");

    const timerDisplay = document.getElementById("timerDisplay");
    const timerStatus = document.getElementById("timerStatus");
    const startTimer = document.getElementById("startTimer");
    const pauseTimer = document.getElementById("pauseTimer");
    const resetTimer = document.getElementById("resetTimer");
    const completedSessions = document.getElementById("completedSessions");

    const currentStreak = document.getElementById("currentStreak");
    const bestStreak = document.getElementById("bestStreak");
    const streakMessage = document.getElementById("streakMessage");
    const streakDots = document.querySelectorAll(".streak-dot");
    const insightStreak = document.getElementById("insightStreak");

    const weeklyTasks = document.getElementById("weeklyTasks");
    const weeklyHabits = document.getElementById("weeklyHabits");
    const weeklyWater = document.getElementById("weeklyWater");
    const weeklyWaterLabel = document.getElementById("weeklyWaterLabel");
    const weeklySleep = document.getElementById("weeklySleep");
    const bars = document.querySelectorAll(".bar");

    /* ===== 1. HABITS -.habit-check ===== */
    habitChecks.forEach(check => {
        check.addEventListener("click", () => {
            const habitName = check.closest(".habit").querySelector(".habit-info h3").textContent.trim();
            db.habits[habitName] =!db.habits[habitName];
            save();
        });
    });

    /* ===== 2. TASKS -.task-check ===== */
    taskChecks.forEach(check => {
        check.addEventListener("click", () => {
            const taskName = check.dataset.task;
            db.tasks[taskName] =!db.tasks[taskName];
            save();
        });
    });

    /* ===== 3. WATER - #addWaterBtn ===== */
    if (addWaterBtn) {
        addWaterBtn.addEventListener("click", () => {
            db.water = Math.min(db.water + 250, 3000);
            save();
        });
    }

    /* ===== 4. MOOD - #moodEmojis span ===== */
    moodEmojis.forEach(emoji => {
        emoji.addEventListener("click", () => {
            moodEmojis.forEach(e => e.classList.remove("active"));
            emoji.classList.add("active");
            db.mood = emoji.dataset.mood;
            const todayIdx = new Date().getDay() === 0? 6 : new Date().getDay() - 1;
            mDots.forEach((d,i) => d.classList.remove("today"));
            if(mDots[todayIdx]) mDots[todayIdx].classList.add("today", "active");
            save();
        });
    });

    /* ===== 5. POMODORO - #timerDisplay ===== */
    let timeLeft = 25 * 60;
    let timerInterval = null;
    let isRunning = false;

    function updateTimer() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
    }

    if (startTimer) {
        startTimer.addEventListener("click", () => {
            if (isRunning) return;
            isRunning = true;
            timerStatus.textContent = "Stay focused!";
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimer();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    timeLeft = 25 * 60;
                    db.pomodoroSessions++;
                    timerStatus.textContent = "Session complete!";
                    save();
                    updateTimer();
                }
            }, 1000);
        });
    }
    if (pauseTimer) {
        pauseTimer.addEventListener("click", () => {
            clearInterval(timerInterval);
            isRunning = false;
            timerStatus.textContent = "Paused";
        });
    }
    if (resetTimer) {
        resetTimer.addEventListener("click", () => {
            clearInterval(timerInterval);
            isRunning = false;
            timeLeft = 25 * 60;
            updateTimer();
            timerStatus.textContent = "Ready to focus?";
        });
    }

    /* ===== 6. STREAK LOGIC ===== */
    function updateStreak() {
        const doneHabits = Object.values(db.habits).filter(Boolean).length;
        const doneTasks = Object.values(db.tasks).filter(Boolean).length;
        const today = new Date().toDateString();
        const todayIdx = new Date().getDay() === 0? 6 : new Date().getDay() - 1;

        if ((doneHabits > 0 || doneTasks > 0) && db.streak.lastDate!== today) {
            if (db.streak.lastDate) {
                db.streak.current++;
            } else {
                db.streak.current = 1;
            }
            db.streak.week[todayIdx] = true;
            db.streak.lastDate = today;
            if (db.streak.current > db.streak.best) db.streak.best = db.streak.current;
        }
        // If no activity yet, keep 0
        if (doneHabits === 0 && doneTasks === 0 && db.streak.current === 0) {
            db.streak.week = [false,false,false,false,false,false,false];
        }
    }

    /* ===== 7. RENDER ALL - FIXES WEEKLY PROGRESS ===== */
    function renderAll() {
        updateStreak();

        const doneHabits = Object.values(db.habits).filter(Boolean).length;
        const totalHabits = Object.keys(db.habits).length;
        const doneTasks = Object.values(db.tasks).filter(Boolean).length;
        const totalTasks = Object.keys(db.tasks).length;

        // HABITS
        document.querySelectorAll(".habit").forEach(row => {
            const name = row.querySelector(".habit-info h3").textContent.trim();
            const check = row.querySelector(".habit-check");
            const isDone = db.habits[name];
            if (isDone) {
                check.classList.add("completed");
                check.textContent = "✓";
                row.style.opacity = "0.7";
            } else {
                check.classList.remove("completed");
                check.textContent = "";
                row.style.opacity = "1";
            }
        });
        if (habitProgressText) habitProgressText.textContent = `${doneHabits} / ${totalHabits}`;
        if (habitProgressFill) habitProgressFill.style.width = `${(doneHabits/totalHabits)*100}%`;

        // TASKS
        taskChecks.forEach(check => {
            const name = check.dataset.task;
            const status = check.closest(".task").querySelector(".task-status");
            const isDone = db.tasks[name];
            if (isDone) {
                check.classList.add("completed");
                check.textContent = "✓";
                status.textContent = "Done";
                status.className = "task-status done";
                check.closest(".task").style.opacity = "0.6";
            } else {
                check.classList.remove("completed");
                check.textContent = "";
                status.textContent = "Pending";
                status.className = "task-status pending";
                check.closest(".task").style.opacity = "1";
            }
        });

        // WATER
        if (waterAmount) waterAmount.textContent = db.water;
        if (waterProgress) waterProgress.style.width = `${(db.water/2000)*100}%`;

        // CALORIES
        if (calorieAmount) calorieAmount.textContent = db.calories.toLocaleString();
        if (calorieProgress) calorieProgress.style.width = `${(db.calories/2000)*100}%`;
        if (caloriePercentage) caloriePercentage.textContent = Math.round((db.calories/2000)*100);

        // SLEEP
        if (sleepAmount) sleepAmount.textContent = db.sleep;

        // POMODORO
        if (completedSessions) completedSessions.textContent = db.pomodoroSessions;
        updateTimer();

        // STREAK
        if (currentStreak) currentStreak.textContent = db.streak.current;
        if (bestStreak) bestStreak.textContent = `${db.streak.best} days`;
        if (streakMessage) {
            if (db.streak.current === 0) streakMessage.textContent = "Start your streak today!";
            else if (db.streak.current === 1) streakMessage.textContent = "Great start! Keep going!";
            else streakMessage.textContent = `You're on fire! ${db.streak.current} days in a row!`;
        }
        streakDots.forEach((dot, i) => {
            if (db.streak.week[i]) dot.parentElement.classList.add("active");
            else dot.parentElement.classList.remove("active");
        });
        if (insightStreak) insightStreak.textContent = `${db.streak.current || 1} day`;

        // WEEKLY PROGRESS - MAIN FIX
        if (weeklyTasks) weeklyTasks.textContent = doneTasks;
        if (weeklyHabits) weeklyHabits.textContent = doneHabits;
        if (weeklyWater) weeklyWater.textContent = (db.water/1000).toFixed(1) + "L";
        if (weeklyWaterLabel) weeklyWaterLabel.textContent = `Avg. ${(db.water/1000).toFixed(1)}L`;
        if (weeklySleep) weeklySleep.textContent = db.sleep + "h";

        // Chart bars based on history
        const historyValues = Object.values(db.history).slice(-7);
        const last7 = historyValues.length === 7? historyValues.map(h=>h.habitsDone) : [1,2,2,3,doneHabits-1,2,doneHabits];
        bars.forEach((bar, i) => {
            const val = last7[i] || 0;
            bar.style.height = `${20 + val * 15}px`;
            bar.style.background = i === 6? "#719377" : "#9cb19e";
        });

        // MOOD
        if (db.mood) {
            moodEmojis.forEach(e => {
                if (e.dataset.mood === db.mood) e.classList.add("active");
                else e.classList.remove("active");
            });
            if (moodText) moodText.textContent = `Feeling ${db.mood} today`;
            if (moodNote) moodNote.textContent = `Feeling ${db.mood} after workout 💪`;
        }

        lucide.createIcons();
    }

    renderAll();

    // Debug helpers
    window.cloverDB = db;
    window.resetClover = () => { localStorage.removeItem("clover_db_v5"); location.reload(); };
});
// ===== REAL DATE FIX =====
(function() {
    const dateEl = document.querySelector(".date");
    const greetingEl = document.querySelector(".top-bar h1");
    const moodDateEl = document.getElementById("moodDate");

    const now = new Date();
    
    // Real date 
    const realDate = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Update date
    if (dateEl) dateEl.textContent = realDate;
    if (moodDateEl) moodDateEl.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Auto greeting
    if (greetingEl) {
        const hour = now.getHours();
        if (hour < 12) greetingEl.textContent = "Good Morning!";
        else if (hour < 18) greetingEl.textContent = "Good Afternoon!";
        else greetingEl.textContent = "Good Evening!";
    }
})();
// Auto-update at midnight
const msTillMidnight = new Date().setHours(24,0,0,0) - Date.now();
setTimeout(() => location.reload(), msTillMidnight);