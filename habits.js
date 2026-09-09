lucide.createIcons();
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const get = (k,d) => { try{ return JSON.parse(localStorage.getItem(k))??d }catch{ return d } };
    const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));

    const habitListEl = document.getElementById("habitList") || document.querySelector(".habits-container") || document.querySelector(".habit-list");
    const addHabitBtn = document.getElementById("addHabitBtn");
    const addHabitForm = document.getElementById("addHabitForm");
    const closeHabitForm = document.getElementById("closeHabitForm");
    const saveHabitBtn = document.getElementById("saveHabitBtn");
    const habitInput = document.getElementById("habitInput");
    const habitCategory = document.getElementById("habitCategory");

    let habits = get("clover_habits", [
        {id:1, name:"Workout", cat:"Fitness", icon:"dumbbell", doneDates:[today]},
        {id:2, name:"Study", cat:"Productivity", icon:"book-open", doneDates:[today]},
        {id:3, name:"Meditation", cat:"Wellness", icon:"brain", doneDates:[]},
        {id:4, name:"Reading", cat:"Personal", icon:"book-marked", doneDates:[today]},
    ]);

    function save(){ set("clover_habits", habits); }

    function render(){
        if(!habitListEl) return;
        // if your HTML already has static habits, clear and re-render
        if(habitListEl.children.length > 0 && habitListEl.id!== "habitList") {
            // keep header, clear habits
            habitListEl.querySelectorAll(".habit").forEach(e=>e.remove());
        } else {
            habitListEl.innerHTML="";
        }

        habits.forEach(h=>{
            const done = h.doneDates?.includes(today);
            const div = document.createElement("div");
            div.className="habit";
            div.innerHTML=`
                <div class="habit-icon"><i data-lucide="${h.icon||'repeat-2'}"></i></div>
                <div class="habit-info"><h3>${h.name}</h3><p>${h.cat}</p></div>
                <div class="habit-check ${done?'completed':''}">${done?'✓':''}</div>
            `;
            div.querySelector(".habit-check").addEventListener("click",()=>{
                let target = habits.find(x=>x.id===h.id);
                if(!target.doneDates) target.doneDates=[];
                if(target.doneDates.includes(today)) target.doneDates = target.doneDates.filter(d=>d!==today);
                else target.doneDates.push(today);
                save(); render(); lucide.createIcons();
            });
            habitListEl.appendChild(div);
        });
        lucide.createIcons();

        // progress
        let doneCount = habits.filter(h=>h.doneDates?.includes(today)).length;
        let pct = habits.length? Math.round(doneCount/habits.length*100):0;
        let countEl = document.getElementById("completedHabitCount") || document.getElementById("habitProgressText");
        if(countEl) countEl.textContent = `${doneCount} / ${habits.length}`;
        let fill = document.querySelector(".habit-progress-fill") || document.getElementById("habitProgressFill");
        if(fill) fill.style.width = pct+"%";
    }

    function addHabit(){
        let name = habitInput.value.trim(); if(!name) return;
        let cat = habitCategory? habitCategory.value : "Personal";
        habits.unshift({id: Date.now(), name, cat, icon:"repeat-2", doneDates:[]});
        save(); render();
        habitInput.value=""; if(addHabitForm) addHabitForm.style.display="none";
    }

    addHabitBtn?.addEventListener("click",()=>{ if(addHabitForm) addHabitForm.style.display="block"; });
    closeHabitForm?.addEventListener("click",()=>{ if(addHabitForm) addHabitForm.style.display="none"; });
    saveHabitBtn?.addEventListener("click", addHabit);
    habitInput?.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); addHabit(); } });

    render();
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