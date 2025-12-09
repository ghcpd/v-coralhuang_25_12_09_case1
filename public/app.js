const imageInput = document.getElementById('imageInput');
const classifyBtn = document.getElementById('classifyBtn');
const preview = document.getElementById('preview');
const result = document.getElementById('result');
const historyList = document.getElementById('historyList');
const analyticsEl = document.getElementById('analytics');

let selectedFile = null;

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile = file;
  const url = URL.createObjectURL(file);
  preview.innerHTML = `<img src="${url}" alt="preview">`;
});

classifyBtn.addEventListener('click', async () => {
  if (!selectedFile) return alert('Choose an image first');
  const fd = new FormData();
  fd.append('image', selectedFile, selectedFile.name);
  result.textContent = 'Classifying...';

  try {
    const r = await fetch('/api/classify', { method: 'POST', body: fd });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Classification failed');
    result.innerHTML = `<strong>${data.label}</strong> (${(data.score||0).toFixed(2)})<br>${data.guidance}`;
    await loadHistory();
    await loadAnalytics();
  } catch (err) {
    result.textContent = err.message;
  }
});

async function loadHistory() {
  const r = await fetch('/api/history');
  const items = await r.json();
  historyList.innerHTML = '';
  for (const it of items) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${it.label}</strong> ${(it.score||0).toFixed(2)} — ${new Date(it.createdAt).toLocaleString()} <button data-id="${it._id}">Mark Correct</button>`;
    const btn = li.querySelector('button');
    btn.addEventListener('click', async () => {
      await fetch('/api/history/feedback', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: it._id, correct: true }) });
      loadHistory();
      loadAnalytics();
    });
    historyList.appendChild(li);
  }
}

async function loadAnalytics() {
  const r = await fetch('/api/analytics');
  const a = await r.json();
  analyticsEl.textContent = JSON.stringify(a, null, 2);
}

// initial
loadHistory();
loadAnalytics();
