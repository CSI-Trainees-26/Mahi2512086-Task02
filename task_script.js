lucide.createIcons();
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeTaskFormBtn = document.getElementById('closeTaskForm');
    const addTaskForm = document.getElementById('addTaskForm');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskInput = document.getElementById('taskInput');
    const taskDateSelect = document.getElementById('taskDate');
    const taskCategorySelect = document.getElementById('taskCategory');
    const taskList = document.getElementById('taskList');
    const filterButtons = document.querySelectorAll('.task-filter');
    const completedTaskCountEl = document.getElementById('completedTaskCount');
    const taskProgressFillEl = document.getElementById('taskProgressFill');
    const taskProgressPercentageEl = document.getElementById('taskProgressPercentage');

    const todayISO = new Date().toISOString().split('T')[0];
    const getDateISO = (label) => {
        let d = new Date();
        if(label === 'Tomorrow') d.setDate(d.getDate()+1);
        if(label === 'This Week') d.setDate(d.getDate()+3);
        return d.toISOString().split('T')[0];
    };

    let tasks = JSON.parse(localStorage.getItem('clover_tasks')) || [
        { id: 1, title: 'Morning Workout', name: 'Morning Workout', timeCategory: '07:00 AM · Fitness', completed: true, date: 'Today', dateISO: todayISO, category: 'Fitness', done: true },
        { id: 2, title: 'Drink Water', name: 'Drink Water', timeCategory: 'Health', completed: true, date: 'Today', dateISO: todayISO, category: 'Health', done: true },
        { id: 3, title: 'Complete DSA Assignment', name: 'Complete DSA Assignment', timeCategory: '06:00 PM · Productivity', completed: false, date: 'Today', dateISO: todayISO, category: 'Productivity', done: false },
        { id: 4, title: 'Read 20 Pages', name: 'Read 20 Pages', timeCategory: 'Personal', completed: false, date: 'Today', dateISO: todayISO, category: 'Personal', done: false }
    ];

    let currentFilter = 'all';

    function saveToStorage() {
        localStorage.setItem('clover_tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        if(!taskList) return;
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'today') return task.dateISO === todayISO || task.date === 'Today';
            if (currentFilter === 'upcoming') return task.dateISO!== todayISO;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<p style="padding:20px;text-align:center;opacity:0.6;">No tasks found.</p>`;
        } else {
            filteredTasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = 'task';
                taskCard.innerHTML = `
                    <div class="task-left">
                        <div class="task-check ${task.completed? 'completed' : ''}" data-id="${task.id}">${task.completed? '✓' : ''}</div>
                        <div class="task-details">
                            <h3 style="${task.completed? 'text-decoration:line-through;opacity:0.6;' : ''}">${escapeHTML(task.title)}</h3>
                            <p>${escapeHTML(task.timeCategory)}</p>
                        </div>
                    </div>
                    <span class="task-status ${task.completed? 'done' : 'pending'}">${task.completed? 'Done' : 'Pending'}</span>
                `;
                taskCard.querySelector('.task-check').addEventListener('click', () => toggleTaskStatus(task.id));
                taskList.appendChild(taskCard);
            });
        }
        updateProgress();
    }

    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                let newDone =!task.completed;
                return {...task, completed: newDone, done: newDone, name: task.title, title: task.title };
            }
            return task;
        });
        saveToStorage();
        renderTasks();
    }

    function addTask() {
        const title = taskInput.value.trim();
        if (!title) return;
        const dateLabel = taskDateSelect.value;
        const category = taskCategorySelect.value;
        const newTask = {
            id: Date.now(),
            title: title,
            name: title,
            timeCategory: `${dateLabel} · ${category}`,
            completed: false,
            done: false,
            date: dateLabel,
            dateISO: getDateISO(dateLabel),
            category: category
        };
        tasks.unshift(newTask);
        saveToStorage();
        taskInput.value = '';
        addTaskForm.style.display = 'none';
        renderTasks();
    }

    function updateProgress() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percentage = total === 0? 0 : Math.round((completed / total) * 100);
        if (completedTaskCountEl) completedTaskCountEl.textContent = completed;
        if (taskProgressPercentageEl) taskProgressPercentageEl.textContent = `${percentage}%`;
        if (taskProgressFillEl) taskProgressFillEl.style.width = `${percentage}%`;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag]||tag));
    }

    if (addTaskBtn && addTaskForm) {
        addTaskBtn.addEventListener('click', () => {
            addTaskForm.style.display = addTaskForm.style.display === 'block'? 'none' : 'block';
        });
    }
    if (closeTaskFormBtn && addTaskForm) {
        closeTaskFormBtn.addEventListener('click', () => { addTaskForm.style.display = 'none'; });
    }
    if (saveTaskBtn) saveTaskBtn.addEventListener('click', addTask);
    if (taskInput) {
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTask(); }
        });
    }
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });

    renderTasks();
});