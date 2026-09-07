lucide.createIcons();
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons if available
    if (window.lucide) {
        lucide.createIcons();
    }

    // Elements
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

    // Default State / Storage Initialization
    let tasks = JSON.parse(localStorage.getItem('clover_tasks')) || [
        { id: 1, title: 'Morning Workout', timeCategory: '07:00 AM · Fitness', completed: true, date: 'Today', category: 'Fitness' },
        { id: 2, title: 'Drink Water', timeCategory: 'Health', completed: true, date: 'Today', category: 'Health' },
        { id: 3, title: 'Complete DSA Assignment', timeCategory: '06:00 PM · Productivity', completed: false, date: 'Today', category: 'Productivity' },
        { id: 4, title: 'Read 20 Pages', timeCategory: 'Personal', completed: false, date: 'Today', category: 'Personal' }
    ];

    let currentFilter = 'all';

    // Save tasks to LocalStorage
    function saveToStorage() {
        localStorage.setItem('clover_tasks', JSON.stringify(tasks));
    }

    // Render tasks based on active filter
    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'today') return task.date === 'Today';
            if (currentFilter === 'upcoming') return task.date === 'Tomorrow' || task.date === 'This Week';
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<p style="padding: 20px; text-align: center; opacity: 0.6;">No tasks found.</p>`;
        } else {
            filteredTasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = 'task';
                
                taskCard.innerHTML = `
                    <div class="task-left">
                        <div class="task-check ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                            ${task.completed ? '✓' : ''}
                        </div>
                        <div class="task-details">
                            <h3 style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                                ${escapeHTML(task.title)}
                            </h3>
                            <p>${escapeHTML(task.timeCategory)}</p>
                        </div>
                    </div>
                    <span class="task-status ${task.completed ? 'done' : ''}">
                        ${task.completed ? 'Done' : 'Pending'}
                    </span>
                `;

                // Toggle completion on check click
                const checkBtn = taskCard.querySelector('.task-check');
                checkBtn.addEventListener('click', () => toggleTaskStatus(task.id));

                taskList.appendChild(taskCard);
            });
        }

        updateProgress();
    }

    // Toggle task completed state
    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });

        saveToStorage();
        renderTasks();
    }

    // Add a new task
    function addTask() {
        const title = taskInput.value.trim();
        if (!title) return;

        const date = taskDateSelect.value;
        const category = taskCategorySelect.value;

        const newTask = {
            id: Date.now(),
            title: title,
            timeCategory: category,
            completed: false,
            date: date,
            category: category
        };

        tasks.unshift(newTask);
        saveToStorage();

        // Reset Form & Close
        taskInput.value = '';
        addTaskForm.style.display = 'none';

        renderTasks();
    }

    // Update Progress Metrics
    function updateProgress() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        if (completedTaskCountEl) completedTaskCountEl.textContent = completed;
        if (taskProgressPercentageEl) taskProgressPercentageEl.textContent = `${percentage}%`;
        if (taskProgressFillEl) taskProgressFillEl.style.width = `${percentage}%`;
    }

    // Sanitize user inputs
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // UI Event Listeners
    if (addTaskBtn && addTaskForm) {
        addTaskBtn.addEventListener('click', () => {
            addTaskForm.style.display = addTaskForm.style.display === 'block' ? 'none' : 'block';
        });
    }

    if (closeTaskFormBtn && addTaskForm) {
        closeTaskFormBtn.addEventListener('click', () => {
            addTaskForm.style.display = 'none';
        });
    }

    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', addTask);
    }

    // Handle ENTER key inside task input
    if (taskInput) {
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
            }
        });
    }

    // Filter switching
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Initial Execution
    renderTasks();
});