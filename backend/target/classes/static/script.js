// =============================================
// STATE MANAGEMENT
// =============================================
let meetings = [];
let tasks = [];
let currentEditingMeeting = null;
let currentTab = 'dashboard';

// LOCAL STORAGE
const STORAGE_KEY = 'meeting_tracker_data';

// DOM ELEMENTS (will be set after DOM loads)
let meetingForm, taskForm, taskTableBody, taskMeetingId, meetingsList, meetingsGrid;
let editMeetingModal, editMeetingForm, meetingSearch, globalSearch, filterPriority, filterStatus;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    meetingForm = document.getElementById('meetingForm');
    taskForm = document.getElementById('taskForm');
    taskTableBody = document.getElementById('taskTableBody');
    taskMeetingId = document.getElementById('taskMeetingId');
    meetingsList = document.getElementById('meetingsList');
    meetingsGrid = document.getElementById('meetingsGrid');
    editMeetingModal = document.getElementById('editMeetingModal');
    editMeetingForm = document.getElementById('editMeetingForm');
    meetingSearch = document.getElementById('meetingSearch');
    globalSearch = document.getElementById('globalSearch');
    filterPriority = document.getElementById('filterPriority');
    filterStatus = document.getElementById('filterStatus');

    loadData();
    initializeApp();
    attachFormListeners();
    attachEventListeners();
    updateHeroStats();

    // Load theme preference
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
});

function initializeApp() {
    console.log('Initializing app...');
    displayMeetings();
    displayTasks();
    updateAnalytics();
    updateDashboard();
    switchTab('dashboard');
}

// =============================================
// NAVIGATION & UI MANAGEMENT
// =============================================
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    // Add active class to clicked nav link
    const activeNav = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    currentTab = tabName;

    // Update URL hash without triggering navigation
    if (tabName !== 'dashboard') {
        window.history.replaceState(null, null, '#' + tabName);
    } else {
        window.history.replaceState(null, null, ' ');
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('hidden');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

function showQuickMeetingModal() {
    // Quick meeting creation - could be expanded
    document.getElementById('meetingTitle').focus();
    showToast('Quick meeting mode activated!', 'info');
}

// =============================================
// API FUNCTIONS
// =============================================
async function loadData() {
    try {
        const [meetingsResponse, tasksResponse] = await Promise.all([
            fetch('/api/meetings'),
            fetch('/api/tasks')
        ]);
        meetings = await meetingsResponse.json();
        tasks = await tasksResponse.json();
        displayMeetings();
        displayTasks();
        updateAnalytics();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
    }
}

async function createMeeting(meeting) {
    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meeting)
        });
        if (response.ok) {
            await loadData();
            showToast('Meeting created successfully!', 'success');
        } else {
            showToast('Error creating meeting', 'error');
        }
    } catch (error) {
        console.error('Error creating meeting:', error);
        showToast('Error creating meeting', 'error');
    }
}

async function updateMeeting(id, meeting) {
    try {
        const response = await fetch(`/api/meetings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meeting)
        });
        if (response.ok) {
            await loadData();
            showToast('Meeting updated successfully!', 'success');
        } else {
            showToast('Error updating meeting', 'error');
        }
    } catch (error) {
        console.error('Error updating meeting:', error);
        showToast('Error updating meeting', 'error');
    }
}

async function deleteMeeting(id) {
    try {
        const response = await fetch(`/api/meetings/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            await loadData();
            showToast('Meeting deleted successfully!', 'success');
        } else {
            showToast('Error deleting meeting', 'error');
        }
    } catch (error) {
        console.error('Error deleting meeting:', error);
        showToast('Error deleting meeting', 'error');
    }
}

async function createTask(task) {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        if (response.ok) {
            await loadData();
            showToast('Task created successfully!', 'success');
        } else {
            showToast('Error creating task', 'error');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showToast('Error creating task', 'error');
    }
}

async function updateTask(id, task) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        if (response.ok) {
            await loadData();
            showToast('Task updated successfully!', 'success');
        } else {
            showToast('Error updating task', 'error');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showToast('Error updating task', 'error');
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            await loadData();
            showToast('Task deleted successfully!', 'success');
        } else {
            showToast('Error deleting task', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Error deleting task', 'error');
    }
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg hidden z-50 animate-slide-in font-semibold`;

    const colors = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white',
        warning: 'bg-yellow-600 text-white'
    };

    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in font-semibold ${colors[type]}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// =============================================
// FORM VALIDATION
// =============================================
function validateMeetingForm() {
    const title = document.getElementById('meetingTitle').value.trim();
    const date = document.getElementById('meetingDate').value;

    if (!title) {
        showToast('Please enter meeting title', 'error');
        return false;
    }
    if (!date) {
        showToast('Please select a date', 'error');
        return false;
    }
    return true;
}

function validateTaskForm() {
    const meetingId = document.getElementById('taskMeetingId').value;
    const taskName = document.getElementById('taskName').value.trim();
    const assignedTo = document.getElementById('assignedTo').value.trim();
    const deadline = document.getElementById('taskDeadline').value;

    if (!meetingId) {
        showToast('Please select a meeting', 'error');
        return false;
    }
    if (!taskName) {
        showToast('Please enter task name', 'error');
        return false;
    }
    if (!assignedTo) {
        showToast('Please enter assignee', 'error');
        return false;
    }
    if (!deadline) {
        showToast('Please select deadline', 'error');
        return false;
    }
    return true;
}

// =============================================
// MEETING FUNCTIONS
// =============================================

function displayMeetings() {
    const searchTerm = meetingSearch.value.toLowerCase();
    const filtered = meetings.filter(m => m.title.toLowerCase().includes(searchTerm));

    if (filtered.length === 0) {
        meetingsGrid.innerHTML = `
            <div class="col-span-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 border-dashed">
                <div class="text-center py-12">
                    <div class="bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-calendar-plus text-2xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-white mb-2">No Meetings Found</h3>
                    <p class="text-gray-400 text-sm mb-4">Create your first meeting to get started</p>
                    <button onclick="document.getElementById('meetingTitle').focus()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-plus mr-1"></i>Create One
                    </button>
                </div>
            </div>
        `;
        return;
    }

    meetingsGrid.innerHTML = filtered.map(meeting => {
        const taskCount = tasks.filter(t => t.meetingId === meeting.id).length;
        const completedCount = tasks.filter(t => t.meetingId === meeting.id && t.status === 'Completed').length;
        const progressPercent = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

        return `
            <div class="meeting-card animate-fadeIn group">
                <div class="meeting-card-header">
                    <div class="flex-1">
                        <h3 class="meeting-card-title">${escapeHtml(meeting.title)}</h3>
                        <p class="meeting-card-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${formatDate(meeting.date)}
                        </p>
                    </div>
                    <div class="text-right">
                        <div class="text-blue-400 font-bold text-lg">${completedCount}/${taskCount}</div>
                        <div class="text-xs text-gray-500">Tasks</div>
                    </div>
                </div>

                <p class="meeting-card-description">${escapeHtml(meeting.description)}</p>

                <!-- Progress Bar -->
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs text-gray-400">Progress</span>
                        <span class="text-xs text-blue-400 font-medium">${progressPercent}%</span>
                    </div>
                    <div class="w-full bg-slate-700 rounded-full h-2">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="meeting-card-actions">
                    <button onclick="editMeeting('${meeting.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-all hover:scale-105">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteMeeting('${meeting.id}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-all hover:scale-105">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateDashboard() {
    updateRecentMeetings();
    updateUpcomingTasks();
    updateDashboardProgress();
}

function updateRecentMeetings() {
    const recentMeetings = meetings.slice(0, 3);
    const container = document.getElementById('recentMeetings');

    if (recentMeetings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-calendar-alt text-4xl mb-2"></i>
                <p>No recent meetings</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recentMeetings.map(meeting => {
        const taskCount = tasks.filter(t => t.meetingId === meeting.id).length;
        const completedCount = tasks.filter(t => t.meetingId === meeting.id && t.status === 'Completed').length;

        return `
            <div class="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors cursor-pointer" onclick="switchTab('meetings')">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-white truncate">${escapeHtml(meeting.title)}</h4>
                    <span class="text-xs text-blue-400">${completedCount}/${taskCount}</span>
                </div>
                <p class="text-sm text-gray-400 mb-2">${formatDate(meeting.date)}</p>
                <div class="w-full bg-slate-600 rounded-full h-1">
                    <div class="bg-blue-500 h-1 rounded-full transition-all duration-500" style="width: ${taskCount > 0 ? (completedCount / taskCount) * 100 : 0}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateUpcomingTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTasks = tasks
        .filter(task => {
            const deadline = new Date(task.deadline);
            return deadline >= today && task.status !== 'Completed';
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3);

    const container = document.getElementById('upcomingTasks');

    if (upcomingTasks.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-tasks text-4xl mb-2"></i>
                <p>No upcoming tasks</p>
            </div>
        `;
        return;
    }

    container.innerHTML = upcomingTasks.map(task => {
        const meeting = meetings.find(m => m.id === task.meetingId);
        const meetingTitle = meeting ? meeting.title : 'Unknown Meeting';
        const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));

        let priorityColor = 'text-green-400';
        if (task.priority === 'High') priorityColor = 'text-red-400';
        else if (task.priority === 'Medium') priorityColor = 'text-yellow-400';

        return `
            <div class="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors cursor-pointer" onclick="switchTab('tasks')">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-white truncate">${escapeHtml(task.taskName)}</h4>
                    <span class="text-xs ${priorityColor}">${task.priority}</span>
                </div>
                <p class="text-sm text-gray-400 mb-1">${escapeHtml(meetingTitle)}</p>
                <p class="text-sm text-gray-400">${daysLeft} days left</p>
            </div>
        `;
    }).join('');
}

function updateDashboardProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Update circular progress
    const progressCircle = document.getElementById('progressCircle');
    if (progressCircle) {
        const circumference = 2 * Math.PI * 15.9155;
        const offset = circumference - (completionPercentage / 100) * circumference;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = offset;
    }

    // Update stats
    document.getElementById('dashboardCompletion').textContent = completionPercentage + '%';
    document.getElementById('dashboardTotalTasks').textContent = totalTasks;
    document.getElementById('dashboardCompletedTasks').textContent = completedTasks;
    document.getElementById('dashboardPendingTasks').textContent = tasks.filter(t => t.status === 'Pending').length;
    document.getElementById('dashboardOverdueTasks').textContent = tasks.filter(t => {
        const deadline = new Date(t.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return deadline < today && t.status !== 'Completed';
    }).length;

    // Update weekly progress (mock data for demo)
    const weeklyProgress = Math.min(completionPercentage + Math.floor(Math.random() * 20), 100);
    document.getElementById('weeklyProgress').textContent = weeklyProgress + '%';
    document.getElementById('weeklyProgressBar').style.width = weeklyProgress + '%';

    // Update team efficiency (mock data for demo)
    const teamEfficiency = Math.min(completionPercentage + Math.floor(Math.random() * 15), 100);
    document.getElementById('teamEfficiency').textContent = teamEfficiency + '%';
    document.getElementById('teamEfficiencyBar').style.width = teamEfficiency + '%';
}

function updateHeroStats() {
    document.getElementById('heroMeetings').textContent = meetings.length;
    document.getElementById('heroTasks').textContent = tasks.length;
    document.getElementById('heroCompleted').textContent = tasks.filter(t => t.status === 'Completed').length;

    // Calculate streak (mock data - could be based on consecutive days with completed tasks)
    const streak = Math.floor(Math.random() * 7) + 1;
    document.getElementById('heroStreak').textContent = streak;
}

// =============================================
// FORM EVENT LISTENERS (attached after DOM loads)
// =============================================
function attachFormListeners() {
    // Meeting form submission
    if (meetingForm) {
        meetingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateMeetingForm()) return;

            const meeting = {
                title: document.getElementById('meetingTitle').value.trim(),
                date: document.getElementById('meetingDate').value,
                description: document.getElementById('meetingDescription').value.trim(),
                createdBy: 'User' // You can get this from user context
            };

            await createMeeting(meeting);
            updateMeetingOptions();
            updateHeroStats();
            meetingForm.reset();
        });
    }

    // Task form submission
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateTaskForm()) return;

            const task = {
                meetingId: taskMeetingId.value,
                taskName: document.getElementById('taskName').value.trim(),
                assignedTo: document.getElementById('assignedTo').value.trim(),
                deadline: document.getElementById('taskDeadline').value,
                priority: document.getElementById('taskPriority').value,
                status: 'Pending'
            };

            await createTask(task);
            taskForm.reset();
        });
            updateDashboard();
            updateHeroStats();
            taskForm.reset();
            showToast('Task created successfully!', 'success');
        });
    }

    // Edit meeting form submission
    if (editMeetingForm) {
        editMeetingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('editMeetingId').value;
            const meeting = {
                title: document.getElementById('editMeetingTitle').value.trim(),
                date: document.getElementById('editMeetingDate').value,
                description: document.getElementById('editMeetingDescription').value.trim(),
                createdBy: 'User' // You can get this from user context
            };

            await updateMeeting(id, meeting);
            updateMeetingOptions();
            closeEditModal();
        });
    }
}

function deleteMeeting(id) {
    if (confirm('Are you sure you want to delete this meeting? All associated tasks will remain.')) {
        deleteMeeting(id);
        updateMeetingOptions();
    }
}

function editMeeting(id) {
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) return;
    
    document.getElementById('editMeetingId').value = meeting.id;
    document.getElementById('editMeetingTitle').value = meeting.title;
    document.getElementById('editMeetingDate').value = meeting.date;
    document.getElementById('editMeetingDescription').value = meeting.description;
    
    editMeetingModal.classList.remove('hidden');
}

function closeEditModal() {
    editMeetingModal.classList.add('hidden');
}

function updateMeetingOptions() {
    taskMeetingId.innerHTML = '<option value="">Choose Meeting</option>';
    meetings.forEach(meeting => {
        const option = document.createElement('option');
        option.value = meeting.id;
        option.textContent = meeting.title;
        taskMeetingId.appendChild(option);
    });
}

// =============================================
// TASK FUNCTIONS
// =============================================

function displayTasks() {
    const priorityFilter = filterPriority.value;
    const statusFilter = filterStatus.value;
    
    let filtered = tasks;
    
    if (priorityFilter) {
        filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    if (statusFilter) {
        filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (filtered.length === 0) {
        taskTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-gray-400">
                    <i class="fas fa-tasks text-4xl block mb-2"></i>
                    <p>No tasks found. Add one to get started!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    taskTableBody.innerHTML = filtered.map(task => {
        const meeting = meetings.find(m => m.id === task.meetingId);
        const meetingTitle = meeting ? meeting.title : 'N/A';
        const statusClass = task.status === 'Overdue' ? 'bg-red-100' : task.status === 'Completed' ? 'bg-green-100' : '';
        const priorityClass = `task-row-${task.priority.toLowerCase()}`;
        
        return `
            <tr class="${statusClass} ${priorityClass}">
                <td class="text-blue-400 font-semibold">${escapeHtml(meetingTitle)}</td>
                <td>${escapeHtml(task.taskName)}</td>
                <td>${escapeHtml(task.assignedTo)}</td>
                <td>${formatDate(task.deadline)}</td>
                <td class="text-center">
                    <span class="badge badge-${task.priority.toLowerCase()}">${getPriorityIcon(task.priority)} ${task.priority}</span>
                </td>
                <td class="text-center">
                    <span class="badge badge-${getStatusBadgeClass(task.status)}">${getStatusIcon(task.status)} ${task.status}</span>
                </td>
                <td class="text-center">
                    <button onclick="toggleTaskStatus('${task.id}')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition mr-2">
                        <i class="fas fa-check mr-1"></i>Done
                    </button>
                    <button onclick="deleteTask('${task.id}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const updatedTask = { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' };
        await updateTask(id, updatedTask);
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(id);
    }
}

// =============================================
// ANALYTICS FUNCTIONS
// =============================================
function updateAnalytics() {
    const totalMeetings = meetings.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const overdueTasks = tasks.filter(t => {
        const deadline = new Date(t.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return deadline < today && t.status !== 'Completed';
    }).length;
    
    document.getElementById('totalMeetings').textContent = totalMeetings;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('overdueTasks').textContent = overdueTasks;
    
    const totalTasks = tasks.length;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    const completionBar = document.getElementById('completionBar').querySelector('div');
    completionBar.style.width = completionPercentage + '%';
    document.getElementById('completionPercentage').textContent = completionPercentage + '%';
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function getPriorityIcon(priority) {
    const icons = {
        'High': '🔴',
        'Medium': '🟡',
        'Low': '🟢'
    };
    return icons[priority] || '';
}

function getStatusIcon(status) {
    const icons = {
        'Completed': '✓',
        'Pending': '⏳',
        'Overdue': '⚠️'
    };
    return icons[status] || '';
}

function getStatusBadgeClass(status) {
    const classes = {
        'Completed': 'success',
        'Pending': 'warning',
        'Overdue': 'danger'
    };
    return classes[status] || 'info';
}

// =============================================
// TAB SWITCHING
// =============================================
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    // Add active class to clicked nav link
    const activeNav = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    currentTab = tabName;

    // Update URL hash without triggering navigation
    if (tabName !== 'dashboard') {
        window.history.replaceState(null, null, '#' + tabName);
    } else {
        window.history.replaceState(null, null, ' ');
    }
}

// =============================================
// THEME TOGGLE
// =============================================
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// =============================================
// EVENT LISTENERS
// =============================================
function attachEventListeners() {
    // Search functionality
    meetingSearch.addEventListener('input', displayMeetings);
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }

    // Task filters
    filterPriority.addEventListener('change', displayTasks);
    filterStatus.addEventListener('change', displayTasks);

    // Close modal on outside click
    editMeetingModal.addEventListener('click', (e) => {
        if (e.target === editMeetingModal) {
            closeEditModal();
        }
    });

    // Close user menu on outside click
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('userMenu');
        const userMenuButton = document.querySelector('[onclick="toggleUserMenu()"]');
        if (userMenu && userMenuButton && !userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuButton = document.querySelector('[onclick="toggleMobileMenu()"]');
        if (mobileMenu && mobileMenuButton && !mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

function handleGlobalSearch() {
    const searchTerm = globalSearch.value.toLowerCase();

    // Search in meetings
    const matchingMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(searchTerm) ||
        m.description.toLowerCase().includes(searchTerm)
    );

    // Search in tasks
    const matchingTasks = tasks.filter(t =>
        t.taskName.toLowerCase().includes(searchTerm) ||
        t.assignedTo.toLowerCase().includes(searchTerm)
    );

    // If there are matches, switch to appropriate tab
    if (matchingMeetings.length > 0 && matchingTasks.length === 0) {
        switchTab('meetings');
    } else if (matchingTasks.length > 0 && matchingMeetings.length === 0) {
        switchTab('tasks');
    }

    // Update displays with search filter
    displayMeetings();
    displayTasks();
}