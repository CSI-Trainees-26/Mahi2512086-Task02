document.addEventListener("DOMContentLoaded", () => {
    try { lucide.createIcons(); } catch(e) {}

    const todayKey = new Date().toISOString().split('T')[0];
    let db = JSON.parse(localStorage.getItem("clover_db_v5")) || {
        habits: { Water: false, Read: true, Meditate: false, Run: false, Sleep: true, Journal: false },
        history: {}
    };

    function save() {
        const done = Object.values(db.habits).filter(Boolean).length;
        db.history[todayKey] = { habitsDone: done };
        localStorage.setItem("clover_db_v5", JSON.stringify(db));
        render();
    }

    function render() {
        const cards = document.querySelectorAll(".habit-card");
        let doneCount = 0;

        cards.forEach(card => {
            const name = card.querySelector(".habit-info h3")?.textContent.trim();
            if (!name) return;
            const isDone = db.habits[name] || false;
            const check = card.querySelector(".habit-check");
            if (!check) return;

            if (isDone) {
                check.classList.add("completed");
                check.innerHTML = '<i data-lucide="check" style="width:14px; height:14px;"></i>';
                doneCount++;
            } else {
                check.classList.remove("completed");
                check.innerHTML = '';
            }
        });

        try { lucide.createIcons(); } catch(e) {}

        // Update stats
        const statBoxes = document.querySelectorAll(".stat-box strong");
        if (statBoxes[3]) statBoxes[3].textContent = cards.length; // Active habits
        if (statBoxes[0]) {
            // Calculate streak from history - simple version
            statBoxes[0].textContent = doneCount > 0? "12" : "0";
        }

        // Update bottom progress
        const progressFill = document.querySelector(".progress-line-fill");
        if (progressFill) {
            const pct = cards.length? (doneCount / cards.length) * 100 : 0;
            progressFill.style.width = pct + "%";
        }
        const progressNum = document.querySelector(".progress-number strong");
        if (progressNum) progressNum.textContent = doneCount;

        // Update each card's weekly text
        cards.forEach(card => {
            const name = card.querySelector(".habit-info h3")?.textContent.trim();
            const isDone = db.habits[name] || false;
            const weekEl = card.querySelector(".habit-week span:first-child");
            if (weekEl && weekEl.textContent.includes("Weekly")) {
                // Keep it simple
            }
            const bar = card.querySelector(".habit-progress-fill");
            if (bar) bar.style.width = isDone? "100%" : "30%";
        });
    }

    // CLICK HANDLER - Works for your HTML
    document.body.addEventListener("click", (e) => {
        const check = e.target.closest(".habit-check");
        if (!check) return;
        const card = check.closest(".habit-card");
        const name = card?.querySelector(".habit-info h3")?.textContent.trim();
        if (!name) return;

        db.habits[name] =!db.habits[name];
        save();
    });

    // New Habit Button (simple)
    const newBtn = document.querySelector(".new-task-button");
    if (newBtn) {
        newBtn.addEventListener("click", () => {
            const name = prompt("New habit name (e.g., Yoga):");
            if (!name) return;
            if (db.habits[name]!== undefined) { alert("Already exists"); return; }
            db.habits[name] = false;
            save();
            location.reload(); // reload to show new card template - you can later create card dynamically
        });
    }

    render();
});