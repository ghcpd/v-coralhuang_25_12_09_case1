document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('imageInput');
  const cameraBtn = document.getElementById('cameraBtn');
  const classifyBtn = document.getElementById('classifyBtn');
  const preview = document.getElementById('preview');
  const resultDiv = document.getElementById('result');
  const historyList = document.getElementById('historyList');
  const analyticsData = document.getElementById('analyticsData');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  let currentImage = null;

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'history') loadHistory();
      if (btn.dataset.tab === 'analytics') loadAnalytics();
    });
  });

  // Image upload
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentImage = e.target.result;
        preview.innerHTML = `<img src="${currentImage}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Camera
  cameraBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      preview.innerHTML = '';
      preview.appendChild(video);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 480;

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture';
      captureBtn.addEventListener('click', () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        currentImage = canvas.toDataURL('image/jpeg');
        preview.innerHTML = `<img src="${currentImage}" alt="Captured">`;
        stream.getTracks().forEach(track => track.stop());
      });
      preview.appendChild(captureBtn);
    } catch (error) {
      alert('Camera access denied or not available');
    }
  });

  // Classify
  classifyBtn.addEventListener('click', async () => {
    if (!currentImage) {
      alert('Please select or capture an image first');
      return;
    }

    const formData = new FormData();
    // Convert data URL to blob
    const response = await fetch(currentImage);
    const blob = await response.blob();
    formData.append('image', blob);

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        resultDiv.innerHTML = `
          <h3>Prediction: ${data.prediction}</h3>
          <p>Confidence: ${(data.confidence * 100).toFixed(2)}%</p>
          <p>Recyclable: ${data.recyclable ? 'Yes' : 'No'}</p>
          <p>Bin Color: ${data.binColor}</p>
          <button class="feedback-btn correct" data-id="${data.id}">Correct</button>
          <button class="feedback-btn incorrect" data-id="${data.id}">Incorrect</button>
        `;
        loadHistory(); // Refresh history
      } else {
        resultDiv.innerHTML = `<p>Error: ${data.error}</p>`;
      }
    } catch (error) {
      resultDiv.innerHTML = '<p>Classification failed</p>';
    }
  });

  // Feedback
  resultDiv.addEventListener('click', async (e) => {
    if (e.target.classList.contains('feedback-btn')) {
      const id = e.target.dataset.id;
      const feedback = e.target.classList.contains('correct') ? 'correct' : 'incorrect';
      await fetch(`/api/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      loadAnalytics(); // Refresh analytics
    }
  });

  // Load history
  async function loadHistory() {
    const res = await fetch('/api/history');
    const history = await res.json();
    historyList.innerHTML = history.map(item => `
      <li>
        <img src="data:image/jpeg;base64,${item.image}" alt="Item" style="width: 50px; height: 50px;">
        <div>
          <strong>${item.prediction}</strong> (${(item.confidence * 100).toFixed(2)}%)
          <br>Bin: ${item.binColor} | ${item.recyclable ? 'Recyclable' : 'Non-recyclable'}
          <br>${new Date(item.timestamp).toLocaleString()}
        </div>
      </li>
    `).join('');
  }

  // Load analytics
  async function loadAnalytics() {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    analyticsData.innerHTML = `
      <p>Total Predictions: ${data.totalPredictions}</p>
      <p>Accuracy: ${data.accuracy.toFixed(2)}%</p>
      <h4>Top Items:</h4>
      <ul>
        ${data.topItems.map(item => `<li>${item._id}: ${item.count}</li>`).join('')}
      </ul>
    `;
  }

  // Load initial data
  loadHistory();
  loadAnalytics();
});