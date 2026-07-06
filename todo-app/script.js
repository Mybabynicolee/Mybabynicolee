// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');
const totalCountSpan = document.getElementById('totalCount');
const completedCountSpan = document.getElementById('completedCount');

// State
let todos = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todos';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
}

// Add Todo
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        shake(todoInput);
        return;
    }

    if (text.length > 100) {
        alert('Todo text is too long! Maximum 100 characters.');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
}

// Delete Todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Toggle Todo Completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Clear Completed Todos
function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;

    if (completedCount === 0) {
        alert('No completed todos to clear!');
        return;
    }

    if (confirm(`Clear ${completedCount} completed todo(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    }
}

// Clear All Todos
function clearAll() {
    if (todos.length === 0) {
        alert('No todos to clear!');
        return;
    }

    if (confirm('Are you sure you want to delete ALL todos? This cannot be undone!')) {
        todos = [];
        saveTodos();
        renderTodos();
    }
}

// Render Todos
function renderTodos() {
    todoList.innerHTML = '';

    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
        todoList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        todoList.style.display = 'block';

        filteredTodos.forEach(todo => {
            const li = createTodoElement(todo);
            todoList.appendChild(li);
        });
    }

    updateStats();
}

// Create Todo Element
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="checkbox" 
            ${todo.completed ? 'checked' : ''}
            onchange="toggleTodo(${todo.id})"
        >
        <span class="todo-text" title="${todo.text}">${escapeHtml(todo.text)}</span>
        <button class="delete-btn-item" onclick="deleteTodo(${todo.id})">
            🗑️ Delete
        </button>
    `;
    return li;
}

// Get Filtered Todos
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Update Stats
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    totalCountSpan.textContent = total;
    completedCountSpan.textContent = completed;
}

// Local Storage Functions
function saveTodos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error('Failed to save todos:', error);
    }
}

function loadTodos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        todos = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load todos:', error);
        todos = [];
    }
}

// Utility Functions
function shake(element) {
    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'shake 0.5s';
    }, 10);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
