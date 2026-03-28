// =============================================
// STATE MANAGEMENT
// =============================================
let meetings = [];
let tasks = [];
let currentEditingMeeting = null;

// LOCAL STORAGE
const STORAGE_KEY = 'meeting_tracker_data';

// DOM ELEMENTS
const meetingForm = document.getElementById('meetingForm');
const taskForm = document.getElementById('taskForm');
const taskTableBody = document.getElementById('taskTableBody');
const taskMeetingId = document.getElementById('taskMeetingId');
const meetingsList = document.getElementById('meetingsList');
const editMeetingModal = document.getElementById('editMeetingModal');
const editMeetingForm = document.getElementById('editMeetingForm');
const meetingSearch = document.getElementById('meetingSearch');
const filterPriority = document.getElementById('filterPriority');
const filterStatus = document.getElementById('filterStatus');

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    displayMeetings();
    displayTasks();
    updateAnalytics();
    attachEventListeners();
});

// =============================================
// LOCAL STORAGE FUNCTIONS
// =============================================
function saveToLocalStorage() {
    const data = { meetings, tasks };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        meetings = parsed.meetings || [];
        tasks = parsed.tasks || [];
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
meetingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateMeetingForm()) return;
    
    const meeting = {
        id: Date.now().toString(),
        title: document.getElementById('meetingTitle').value.trim(),
        date: document.getElementById('meetingDate').value,
        description: document.getElementById('meetingDescription').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    meetings.unshift(meeting);
    saveToLocalStorage();
    updateMeetingOptions();
    displayMeetings();
    updateAnalytics();
    meetingForm.reset();
    showToast('Meeting created successfully!', 'success');
});

function displayMeetings() {
    const searchTerm = meetingSearch.value.toLowerCase();
    const filtered = meetings.filter(m => m.title.toLowerCase().includes(searchTerm));
    
    if (filtered.length === 0) {
        meetingsList.innerHTML = `
            <div class="text-center py-8 text-gray-400 col-span-full">
                <i class="fas fa-inbox text-4xl mb-2 block"></i>
                <p>No meetings found. Create one to get started!</p>
            </div>
        `;
        return;
    }
    
    meetingsList.innerHTML = filtered.map(meeting => {
        const taskCount = tasks.filter(t => t.meetingId === meeting.id).length;
        const completedCount = tasks.filter(t => t.meetingId === meeting.id && t.status === 'Completed').length;
        
        return `
            <div class="meeting-card animate-fadeIn">
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
                <div class="meeting-card-actions">
                    <button onclick="editMeeting('${meeting.id}')" class="bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteMeeting('${meeting.id}')" class="bg-red-600 hover:bg-red-700 text-white rounded transition">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function editMeeting(id) {
    currentEditingMeeting = meetings.find(m => m.id === id);
    document.getElementById('editMeetingId').value = id;
    document.getElementById('editMeetingTitle').value = currentEditingMeeting.title;
    document.getElementById('editMeetingDate').value = currentEditingMeeting.date;
    document.getElementById('editMeetingDescription').value = currentEditingMeeting.description;
    editMeetingModal.classList.remove('hidden');
}

function closeEditModal() {
    editMeetingModal.classList.add('hidden');
    currentEditingMeeting = null;
}

editMeetingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editMeetingId').value;
    const meeting = meetings.find(m => m.id === id);
    
    meeting.title = document.getElementById('editMeetingTitle').value.trim();
    meeting.date = document.getElementById('editMeetingDate').value;
    meeting.description = document.getElementById('editMeetingDescription').value.trim();
    
    saveToLocalStorage();
    displayMeetings();
    updateMeetingOptions();
    updateAnalytics();
    closeEditModal();
    showToast('Meeting updated successfully!', 'success');
});

function deleteMeeting(id) {
    if (confirm('Are you sure you want to delete this meeting? All associated tasks will remain.')) {
        meetings = meetings.filter(m => m.id !== id);
        saveToLocalStorage();
        displayMeetings();
        updateMeetingOptions();
        updateAnalytics();
        showToast('Meeting deleted successfully!', 'success');
    }
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
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateTaskForm()) return;
    
    const deadline = new Date(document.getElementById('taskDeadline').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const task = {
        id: Date.now().toString(),
        meetingId: taskMeetingId.value,
        taskName: document.getElementById('taskName').value.trim(),
        assignedTo: document.getElementById('assignedTo').value.trim(),
        deadline: document.getElementById('taskDeadline').value,
        priority: document.getElementById('taskPriority').value,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    saveToLocalStorage();
    displayTasks();
    updateAnalytics();
    taskForm.reset();
    showToast('Task created successfully!', 'success');
});

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

function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
    saveToLocalStorage();
    displayTasks();
    updateAnalytics();
    showToast(`Task marked as ${task.status}!`, 'success');
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
        displayTasks();
        updateAnalytics();
        showToast('Task deleted successfully!', 'success');
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
    document.getElementById('taskCount').textContent = `${tasks.length} Tasks`;
    
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
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // Add active class to clicked button
    event.target.closest('.tab-btn').classList.add('active');
}

// =============================================
// THEME TOGGLE
// =============================================
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Load theme preference
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// =============================================
// EVENT LISTENERS
// =============================================
function attachEventListeners() {
    meetingSearch.addEventListener('input', displayMeetings);
    filterPriority.addEventListener('change', displayTasks);
    filterStatus.addEventListener('change', displayTasks);
    
    // Close modal on outside click
    editMeetingModal.addEventListener('click', (e) => {
        if (e.target === editMeetingModal) {
            closeEditModal();
        }
    });
}