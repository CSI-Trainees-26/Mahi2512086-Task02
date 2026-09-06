lucide.createIcons();

/* ---WATER TRACKER--- */

const WATER_GOAL=2000;
const WATER_INCREMENT=250;

const waterAmountElement=document.getElementById("waterAmount");
const addWaterButton=document.getElementById("addWaterBtn");  
const waterProgress=document.querySelector(".water-progress"); 

let waterAmount= Number(localStorage.getItem("waterAmount")) || 1250; // Default to 1250 if not set

function updateWaterAmount() {

    //display current water status//
    waterAmountElement.textContent = waterAmount.toLocaleString(); // Format with commas

    //calculate progress percentage//
    const progressPercentage = Math.min(
        (waterAmount/WATER_GOAL)*100,
        100); // Cap at 100%

    //update progress bar//
    waterProgress.style.width = progressPercentage+"%";

    //update button
    if (waterAmount>=WATER_GOAL){
        addWaterButton.textContent = "Goal Reached";
    } else{
        addWaterButton.textContent = "+250 ml";
    }
}
//add water button

addWaterButton.addEventListener("click",function(){
    if (waterAmount<WATER_GOAL){

    //add 250ml
    waterAmount+=WATER_INCREMENT;

    //SAVE TO LOCAL STORAGE
    localStorage.setItem("waterAmount",waterAmount);

    //update the ui
    updateWaterAmount()
    }
});
//load water data
updateWaterAmount();

//---SLEEP TRACKER---//

const sleepAmountElement=document.getElementById("sleepAmount");
const sleepStatusElement=document.getElementById("sleepStatus");

let sleepAmount= Number(localStorage.getItem("sleepAmount")) || 7.5; // Default to 7.5 if not set

//update sleep info
function updateSleepDisplay() {

    sleepAmountElement.textContent = sleepAmount;

    if (sleepAmount < 6) {
        sleepStatusElement.textContent = "Not enough sleep";
    }
    else if (sleepAmount < 7) {
        sleepStatusElement.textContent = "Could be better";
    }
    else if (sleepAmount < 8) {
        sleepStatusElement.textContent = "Good sleep";
    }
    else if (sleepAmount <= 9) {
        sleepStatusElement.textContent = "Great sleep";
    }
    else {
        sleepStatusElement.textContent = "Long sleep";
    }
}
//load sleep data
updateSleepDisplay();


//---CALORIE TRACKER---//

const CALORIE_GOAL=2000;
const calorieAmountElement=document.getElementById("calorieAmount");
const calorieProgress=document.getElementById("calorieProgress");
const caloriePercentageElement=document.getElementById("caloriePercentage");

let calorieAmount= Number(localStorage.getItem("calorieAmount")) || 1450;  
// Default to 1450 if not set

function updateCalorieDisplay() {
    calorieAmountElement.textContent = calorieAmount.toLocaleString(); // Format with commas

    const progressPercentage = Math.min(
        (calorieAmount/CALORIE_GOAL)*100,
        100); // Cap at 100%

    calorieProgress.style.width = progressPercentage+"%";
    caloriePercentageElement.textContent = Math.round(progressPercentage);

}
updateCalorieDisplay();

// ====================
// TASK TRACKER
// ====================

const taskList = document.querySelector(".task-list");
const addTaskBtn = document.getElementById("addTaskBtn");

// ====================
// COMPLETE / UNCOMPLETE TASK
// ====================

function setupTask(task) {
    const check = task.querySelector(".task-check");
    const status = task.querySelector(".task-status");

    if (!check || !status) return;

    check.addEventListener("click", function () {

        if (check.classList.contains("completed")) {

            // Uncomplete task
            check.classList.remove("completed");
            check.textContent = "";

            status.textContent = "Pending";
            status.classList.remove("done");

        } else {

            // Complete task
            check.classList.add("completed");
            check.textContent = "✓";

            status.textContent = "Done";
            status.classList.add("done");

            // Update daily streak
            if (typeof window.completeToday === "function") {
                window.completeToday();
                saveTaskCompletion();
            }
        }
    });
}


// ====================
// SETUP EXISTING TASKS
// ====================

const tasks = document.querySelectorAll(".task");

tasks.forEach(function (task) {
    setupTask(task);
});


// ====================
// ADD NEW TASK
// ====================

const addTaskForm = document.getElementById("addTaskForm");
const taskInput = document.getElementById("taskInput");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const closeTaskForm = document.getElementById("closeTaskForm");


// ====================
// OPEN FORM
// ====================

if (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {

        if (addTaskForm) {
            addTaskForm.style.display = "block";
        }

        if (taskInput) {
            taskInput.focus();
        }
    });
}


// ====================
// CLOSE FORM
// ====================

if (closeTaskForm) {
    closeTaskForm.addEventListener("click", function () {

        if (addTaskForm) {
            addTaskForm.style.display = "none";
        }

        if (taskInput) {
            taskInput.value = "";
        }
    });
}


// ====================
// SAVE NEW TASK
// ====================

if (saveTaskBtn) {
    saveTaskBtn.addEventListener("click", function () {

        const taskName = taskInput.value.trim();

        if (taskName === "") {
            taskInput.focus();
            return;
        }

        const taskDate = document.getElementById("taskDate").value;
        const taskCategory = document.getElementById("taskCategory").value;


        // Create new task
        const newTask = document.createElement("div");

        newTask.classList.add("task");

        newTask.innerHTML = `
            <div class="task-left">

                <div class="task-check"></div>

                <div>
                    <h3>${taskName}</h3>

                    <p>
                        ${taskDate} · ${taskCategory}
                    </p>
                </div>

            </div>

            <span class="task-status">
                Pending
            </span>
        `;


        // Add task to task list
        if (taskList) {
            taskList.appendChild(newTask);
        }


        // Make checkbox work
        setupTask(newTask);


        // Clear form
        taskInput.value = "";


        // Hide form
        addTaskForm.style.display = "none";
    });
}



// ==================================================
// HABIT TRACKER
// ==================================================

const habits = document.querySelectorAll(".habit");

const habitProgressText =
    document.getElementById("habitProgressText");

const habitProgressFill =
    document.querySelector(".habit-progress-fill");


// ====================
// UPDATE HABIT PROGRESS
// ====================

function updateHabitProgress() {

    const totalHabits = habits.length;

    const completedHabits =
        document.querySelectorAll(".habit-check.completed").length;

    const percentage =
        totalHabits > 0
            ? (completedHabits / totalHabits) * 100
            : 0;


    // Update text
    if (habitProgressText) {
        habitProgressText.textContent =
            completedHabits + " / " + totalHabits;
    }


    // Update progress bar
    if (habitProgressFill) {
        habitProgressFill.style.width =
            percentage + "%";
    }
}


// ====================
// HABIT CLICK
// ====================

habits.forEach(function (habit) {

    const check =
        habit.querySelector(".habit-check");

    if (!check) return;


    check.addEventListener("click", function () {

        if (check.classList.contains("completed")) {

            // Mark incomplete
            check.classList.remove("completed");
            check.textContent = "";

        } else {

            // Mark complete
            check.classList.add("completed");
            check.textContent = "✓";

            // Update daily streak
            if (typeof window.completeToday === "function") {
                window.completeToday();
                saveHabitCompletion();
            }
        }


        // Update progress
        updateHabitProgress();
    });
});


// ====================
// INITIAL HABIT PROGRESS
// ====================

updateHabitProgress();


/* =========================================
   POMODORO TIMER
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const timerDisplay = document.getElementById("timerDisplay");
    const timerStatus = document.getElementById("timerStatus");

    const startTimer = document.getElementById("startTimer");
    const pauseTimer = document.getElementById("pauseTimer");
    const resetTimer = document.getElementById("resetTimer");

    const completedSessions =
        document.getElementById("completedSessions");


    /* =========================================
       CHECK REQUIRED ELEMENTS
    ========================================= */

    if (
        !timerDisplay ||
        !timerStatus ||
        !startTimer ||
        !pauseTimer ||
        !resetTimer ||
        !completedSessions
    ) {
        console.error(
            "Pomodoro Timer: One or more HTML elements are missing."
        );

        return;
    }


    /* =========================================
       TIMER SETTINGS
    ========================================= */

    const POMODORO_TIME = 25 * 60;

    let timeLeft = POMODORO_TIME;
    let timerInterval = null;
    let isRunning = false;


    /* =========================================
       COMPLETED SESSIONS
    ========================================= */

    let sessions =
        Number(localStorage.getItem("pomodoroSessions")) || 0;

    completedSessions.textContent = sessions;


    /* =========================================
       UPDATE TIMER DISPLAY
    ========================================= */

    function updateTimerDisplay() {

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        const formattedMinutes =
            String(minutes).padStart(2, "0");

        const formattedSeconds =
            String(seconds).padStart(2, "0");

        timerDisplay.textContent =
            `${formattedMinutes}:${formattedSeconds}`;
    }


    /* =========================================
       START TIMER
    ========================================= */

    function startPomodoro() {

        if (isRunning) {
            return;
        }

        isRunning = true;

        timerStatus.textContent = "Focus time";

        timerInterval = setInterval(function () {

            timeLeft--;

            updateTimerDisplay();

            if (timeLeft <= 0) {

                completePomodoro();

            }

        }, 1000);
    }


    /* =========================================
       PAUSE TIMER
    ========================================= */

    function pausePomodoro() {

        if (!isRunning) {
            return;
        }

        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;

        timerStatus.textContent = "Timer paused";
    }


    /* =========================================
       RESET TIMER
    ========================================= */

    function resetPomodoro() {

        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;

        timeLeft = POMODORO_TIME;

        updateTimerDisplay();

        timerStatus.textContent = "Ready to focus?";
    }


    /* =========================================
       COMPLETE POMODORO
    ========================================= */

    function completePomodoro() {

        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;

        timeLeft = 0;

        updateTimerDisplay();


        /* Increase completed sessions */

        sessions++;

        completedSessions.textContent = sessions;

        localStorage.setItem(
            "pomodoroSessions",
            sessions
        );


        timerStatus.textContent =
            "Pomodoro complete! Great work 🎉";


        /* Browser notification */

        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {

            new Notification("Pomodoro Complete!", {
                body:
                    "Great work! Your focus session is finished."
            });

        }
    }


    /* =========================================
       BUTTON EVENTS
    ========================================= */

    startTimer.addEventListener(
        "click",
        startPomodoro
    );

    pauseTimer.addEventListener(
        "click",
        pausePomodoro
    );

    resetTimer.addEventListener(
        "click",
        resetPomodoro
    );


    /* =========================================
       INITIAL DISPLAY
    ========================================= */

    updateTimerDisplay();

});

/* =========================================
   DAILY STREAK
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentStreakElement =
        document.getElementById("currentStreak");

    const bestStreakElement =
        document.getElementById("bestStreak");

    const streakMessageElement =
        document.getElementById("streakMessage");

    const streakDays =
        document.querySelectorAll(".streak-day");


    /* Make sure Streak HTML exists */

    if (
        !currentStreakElement ||
        !bestStreakElement ||
        !streakMessageElement ||
        streakDays.length !== 7
    ) {
        console.error("Streak: Required HTML elements are missing.");
        return;
    }


    /* =========================================
       GET SAVED COMPLETION DATES
    ========================================= */

    let completedDates =
        JSON.parse(
            localStorage.getItem("streakCompletedDates")
        ) || [];


    /* =========================================
       GET TODAY
    ========================================= */

    function getToday() {

        const today = new Date();

        return today.getFullYear() +
            "-" +
            String(today.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(today.getDate()).padStart(2, "0");
    }


    /* =========================================
       DATE HELPERS
    ========================================= */

    function dateToString(date) {

        return date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0");
    }


    function getPreviousDate(dateString) {

        const date = new Date(dateString + "T00:00:00");

        date.setDate(date.getDate() - 1);

        return dateToString(date);
    }


    /* =========================================
       CALCULATE CURRENT STREAK
    ========================================= */

    function calculateCurrentStreak() {

        const today = getToday();

        let streak = 0;
        let checkDate = today;


        /* If today isn't completed,
           allow the streak to continue from yesterday */

        if (!completedDates.includes(checkDate)) {

            checkDate = getPreviousDate(checkDate);

        }


        while (completedDates.includes(checkDate)) {

            streak++;

            checkDate = getPreviousDate(checkDate);

        }


        return streak;
    }


    /* =========================================
       CALCULATE BEST STREAK
    ========================================= */

    function calculateBestStreak() {

        if (completedDates.length === 0) {
            return 0;
        }


        const dates = [...new Set(completedDates)]
            .sort();


        let best = 1;
        let current = 1;


        for (let i = 1; i < dates.length; i++) {

            const previousDate =
                new Date(dates[i - 1] + "T00:00:00");

            const currentDate =
                new Date(dates[i] + "T00:00:00");


            const difference =
                (currentDate - previousDate) /
                (1000 * 60 * 60 * 24);


            if (difference === 1) {

                current++;

                if (current > best) {
                    best = current;
                }

            } else {

                current = 1;

            }
        }


        return best;
    }


    /* =========================================
       UPDATE STREAK DISPLAY
    ========================================= */

    function updateStreak() {

        const currentStreak =
            calculateCurrentStreak();

        const bestStreak =
            calculateBestStreak();


        currentStreakElement.textContent =
            currentStreak;

        bestStreakElement.textContent =
            bestStreak + " days";


        /* Message */

        if (currentStreak === 0) {

            streakMessageElement.textContent =
                "Start your streak today!";

        } else if (currentStreak === 1) {

            streakMessageElement.textContent =
                "Great start! Keep it going!";

        } else if (currentStreak < 7) {

            streakMessageElement.textContent =
                "You're building momentum! 🔥";

        } else if (currentStreak < 30) {

            streakMessageElement.textContent =
                "Amazing consistency! Keep going! 🔥";

        } else {

            streakMessageElement.textContent =
                "Incredible! You're on fire! 🔥";

        }


        updateWeek();
    }


    /* =========================================
       UPDATE WEEKLY DOTS
    ========================================= */

    function updateWeek() {

        const today = new Date();

        /*
           Find Monday of current week
        */

        const day =
            today.getDay();

        const difference =
            day === 0 ? -6 : 1 - day;


        const monday =
            new Date(today);

        monday.setDate(
            today.getDate() + difference
        );


        streakDays.forEach(function (dayElement, index) {

            const date =
                new Date(monday);

            date.setDate(
                monday.getDate() + index
            );


            const dateString =
                dateToString(date);


            const dot =
                dayElement.querySelector(".streak-dot");


            if (
                completedDates.includes(dateString)
            ) {

                dayElement.classList.add("active");

                if (dot) {
                    dot.classList.add("completed");
                }

            } else {

                dayElement.classList.remove("active");

                if (dot) {
                    dot.classList.remove("completed");
                }

            }

        });
    }


    /* =========================================
       MARK TODAY AS COMPLETED
    ========================================= */

    window.completeToday = function () {

        const today = getToday();


        if (!completedDates.includes(today)) {

            completedDates.push(today);

            localStorage.setItem(
                "streakCompletedDates",
                JSON.stringify(completedDates)
            );

        }


        updateStreak();
    };


    /* =========================================
       INITIALIZE
    ========================================= */

    updateStreak();

});

// ==========================================
// WEEKLY PROGRESS / ANALYTICS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const weekSelect = document.getElementById("weekSelect");

    const weeklyTasks = document.getElementById("weeklyTasks");
    const weeklyHabits = document.getElementById("weeklyHabits");

    const bars = document.querySelectorAll(".chart-bars .bar");


    if (!weekSelect || !weeklyTasks || !weeklyHabits || bars.length !== 7) {
        console.error("Weekly Progress: Required elements are missing.");
        return;
    }


    // ==========================================
    // DATE HELPERS
    // ==========================================

    function dateToString(date) {

        return date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0") + "-" +
            String(date.getDate()).padStart(2, "0");

    }


    function getMonday(date) {

        const result = new Date(date);

        const day = result.getDay();

        const difference = day === 0 ? -6 : 1 - day;

        result.setDate(result.getDate() + difference);

        result.setHours(0, 0, 0, 0);

        return result;

    }


    // ==========================================
    // GET TASK COMPLETION DATA
    // ==========================================

    function getTaskDates() {

        return JSON.parse(
            localStorage.getItem("taskCompletedDates")
        ) || [];

    }


    // ==========================================
    // GET HABIT COMPLETION DATA
    // ==========================================

    function getHabitDates() {

        return JSON.parse(
            localStorage.getItem("habitCompletedDates")
        ) || [];

    }


    // ==========================================
    // GET WEEK START
    // ==========================================

    function getSelectedWeekStart() {

        const today = new Date();

        let monday = getMonday(today);

        if (weekSelect.value === "last") {

            monday.setDate(
                monday.getDate() - 7
            );

        }

        return monday;

    }


    // ==========================================
    // UPDATE WEEKLY PROGRESS
    // ==========================================

    function updateWeeklyProgress() {

        const monday = getSelectedWeekStart();

        const taskDates = getTaskDates();

        const habitDates = getHabitDates();


        let taskCount = 0;
        let habitCount = 0;


        // ------------------------------------------
        // DAILY CHART
        // ------------------------------------------

        bars.forEach(function (bar, index) {

            const currentDate = new Date(monday);

            currentDate.setDate(
                monday.getDate() + index
            );

            const dateString =
                dateToString(currentDate);


            const tasksForDay =
                taskDates.filter(
                    date => date === dateString
                ).length;


            const habitsForDay =
                habitDates.filter(
                    date => date === dateString
                ).length;


            const totalForDay =
                tasksForDay + habitsForDay;


            taskCount += tasksForDay;

            habitCount += habitsForDay;


            // --------------------------------------
            // BAR HEIGHT
            // --------------------------------------

            const maxHeight = 100;

            const barHeight =
                Math.min(
                    totalForDay * 15,
                    maxHeight
                );


            bar.style.height =
                barHeight + "%";


            // --------------------------------------
            // ACTIVE BAR
            // --------------------------------------

            if (totalForDay > 0) {

                bar.classList.add("active");

            } else {

                bar.classList.remove("active");

            }

        });


        // ==========================================
        // UPDATE TOTALS
        // ==========================================

        weeklyTasks.textContent = taskCount;

        weeklyHabits.textContent = habitCount;

    }


    // ==========================================
    // WEEK SELECT
    // ==========================================

    weekSelect.addEventListener(
        "change",
        updateWeeklyProgress
    );


    // ==========================================
    // INITIAL UPDATE
    // ==========================================

    updateWeeklyProgress();


    // ==========================================
    // MAKE AVAILABLE TO OTHER JS
    // ==========================================

    window.updateWeeklyProgress =
        updateWeeklyProgress;

});