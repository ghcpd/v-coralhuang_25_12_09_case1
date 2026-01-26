// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const userId = generateUserId();

// Generate or retrieve user ID from localStorage
function generateUserId() {
    let id = localStorage.getItem('wasteUserID');
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('wasteUserID', id);
    }
    return id;
}

// DOM Elements
const uploadBox = document.getElementById('uploadBox');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const removeImageBtn = document.getElementById('removeImageBtn');
const classifyBtn = document.getElementById('classifyBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

let currentFile = null;
let currentPredictionId = null;

// Event Listeners - Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const viewName = btn.dataset.view;
        switchView(viewName);
    });
});

function switchView(viewName) {
    // Update active nav button
    navBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update active view
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Load data for specific views
    if (viewName === 'history') {
        loadHistory();
    } else if (viewName === 'analytics') {
        loadAnalytics();
    }
}

// Upload Handling
uploadBox.addEventListener('click', () => {
    imageInput.click();
});

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--primary-color)';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = 'var(--border-color)';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--border-color)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

function handleFileSelection(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadBox.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        classifyBtn.classList.remove('hidden');
    };

    reader.readAsDataURL(file);
}

removeImageBtn.addEventListener('click', () => {
    currentFile = null;
    imageInput.value = '';
    previewContainer.classList.add('hidden');
    uploadBox.classList.remove('hidden');
    classifyBtn.classList.add('hidden');
    result.classList.add('hidden');
});

classifyBtn.addEventListener('click', classifyWaste);

async function classifyWaste() {
    if (!currentFile) return;

    const formData = new FormData();
    formData.append('image', currentFile);
    formData.append('userId', userId);

    try {
        loading.classList.remove('hidden');
        classifyBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/classify/classify`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Classification failed');
        }

        const data = await response.json();

        if (data.success) {
            currentPredictionId = data.prediction.id;
            displayResult(data.prediction);
            result.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to classify waste. Please try again.');
    } finally {
        loading.classList.add('hidden');
        classifyBtn.disabled = false;
    }
}

function displayResult(prediction) {
    const categoryEmojis = {
        'paper': '📄',
        'plastic': '🧴',
        'glass': '🥤',
        'metal': '🥫',
        'organic': '🍂',
        'other': '🗑️'
    };

    const categoryBadge = document.getElementById('categoryBadge');
    const resultCategory = document.getElementById('resultCategory');
    const confidence = document.getElementById('confidence');
    const binColor = document.getElementById('binColor');
    const recyclableStatus = document.getElementById('recyclableStatus');
    const guidance = document.getElementById('guidance');

    categoryBadge.textContent = categoryEmojis[prediction.category] || '🗑️';
    resultCategory.textContent = prediction.category.charAt(0).toUpperCase() + prediction.category.slice(1);
    confidence.textContent = `Confidence: ${prediction.confidence}%`;

    // Set bin color
    binColor.className = `bin-color bin-${prediction.binColor}`;
    
    // Set recyclable status
    if (prediction.recycled) {
        recyclableStatus.innerHTML = '♻️ Recyclable';
        recyclableStatus.style.color = 'var(--success-color)';
    } else {
        recyclableStatus.innerHTML = '🚫 Not Recyclable';
        recyclableStatus.style.color = 'var(--danger-color)';
    }

    guidance.textContent = prediction.disposalGuidance;

    // Setup feedback buttons
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    feedbackBtns.forEach(btn => {
        btn.classList.remove('selected');
        btn.onclick = () => submitFeedback(btn.dataset.feedback, feedbackBtns);
    });
}

async function submitFeedback(feedback, buttons) {
    try {
        const response = await fetch(`${API_BASE_URL}/classify/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                predictionId: currentPredictionId,
                feedback: feedback
            })
        });

        if (response.ok) {
            buttons.forEach(btn => {
                if (btn.dataset.feedback === feedback) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
    }
}

document.getElementById('classifyAnotherBtn')?.addEventListener('click', () => {
    removeImageBtn.click();
});

// History View
async function loadHistory() {
    const historyList = document.getElementById('historyList');
    const historyLoading = document.getElementById('historyLoading');
    const noHistory = document.getElementById('noHistory');

    try {
        historyLoading.classList.remove('hidden');
        historyList.innerHTML = '';
        noHistory.classList.add('hidden');

        const response = await fetch(`${API_BASE_URL}/history/${userId}`);
        const data = await response.json();

        historyLoading.classList.add('hidden');

        if (data.data && data.data.length > 0) {
            data.data.forEach(prediction => {
                const historyItem = createHistoryItem(prediction);
                historyList.appendChild(historyItem);
            });
        } else {
            noHistory.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading history:', error);
        historyLoading.classList.add('hidden');
        noHistory.classList.remove('hidden');
    }
}

function createHistoryItem(prediction) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const categoryEmojis = {
        'paper': '📄',
        'plastic': '🧴',
        'glass': '🥤',
        'metal': '🥫',
        'organic': '🍂',
        'other': '🗑️'
    };

    const date = new Date(prediction.createdAt);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    item.innerHTML = `
        <img src="${prediction.imageUrl}" alt="Waste item" class="history-item-image">
        <div class="history-item-content">
            <h3>${prediction.category}</h3>
            <div class="history-meta">
                <span class="meta-badge">Confidence: ${(prediction.confidence * 100).toFixed(2)}%</span>
                <span class="meta-badge">${prediction.recycled ? '♻️ Recyclable' : '🚫 Not Recyclable'}</span>
                <span class="meta-badge">${formattedDate} ${formattedTime}</span>
                <span class="meta-badge">Feedback: ${prediction.userFeedback || 'Pending'}</span>
            </div>
            <p>${prediction.disposalGuidance}</p>
        </div>
    `;

    return item;
}

// Analytics View
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/user/${userId}`);
        const data = await response.json();

        if (data.success) {
            displayAnalytics(data.analytics);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function displayAnalytics(analytics) {
    document.getElementById('totalPredictions').textContent = analytics.totalPredictions;
    document.getElementById('accuracy').textContent = analytics.accuracy + '%';
    document.getElementById('recyclableItems').textContent = analytics.weeklyRecyclableItems;
    document.getElementById('recycleRate').textContent = analytics.recyclablePercentage + '%';

    // Category breakdown chart
    const categoryChart = document.getElementById('categoryChart');
    categoryChart.innerHTML = '';

    if (analytics.categoryBreakdown.length > 0) {
        const maxCount = Math.max(...analytics.categoryBreakdown.map(c => c.count));

        analytics.categoryBreakdown.forEach(category => {
            const percentage = (category.count / maxCount) * 100;
            const chartBar = document.createElement('div');
            chartBar.className = 'chart-bar';
            chartBar.innerHTML = `
                <div class="chart-label">${category._id}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar-fill" style="width: ${percentage}%">
                        ${category.count}
                    </div>
                </div>
                <div class="chart-value">${(category.avgConfidence * 100).toFixed(1)}%</div>
            `;
            categoryChart.appendChild(chartBar);
        });
    }

    // Daily activity chart
    const dailyChart = document.getElementById('dailyChart');
    dailyChart.innerHTML = '';

    if (analytics.dailyImpact.length > 0) {
        const maxDaily = Math.max(...analytics.dailyImpact.map(d => d.count));

        analytics.dailyImpact.forEach(day => {
            const percentage = (day.count / maxDaily) * 100;
            const chartBar = document.createElement('div');
            chartBar.className = 'chart-bar';
            chartBar.innerHTML = `
                <div class="chart-label">${day._id}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar-fill" style="width: ${percentage}%">
                        ${day.recycledCount}/${day.count}
                    </div>
                </div>
                <div class="chart-value">${day.count}</div>
            `;
            dailyChart.appendChild(chartBar);
        });
    }
}

// Initialize
console.log(`User ID: ${userId}`);
console.log('Waste Sorting App Loaded');
