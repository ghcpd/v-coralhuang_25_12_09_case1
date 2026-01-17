const el = (sel) => document.querySelector(sel);

const uploadForm = el('#uploadForm');
const imageInput = el('#imageInput');
const preview = el('#preview');
const resultBox = el('#result');
const historyList = el('#historyList');
const analyticsBox = el('#analytics');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!imageInput.files || !imageInput.files[0]) return alert('Please choose an image first');

  preview.innerHTML = '';
  resultBox.textContent = 'Classifying…';

  const file = imageInput.files[0];
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  preview.appendChild(img);

  // upload
  try {
    const fd = new FormData();
    fd.append('image', file);
    const resp = await fetch('/api/classify', { method: 'POST', body: fd });
    const data = await resp.json();
    if (!data.ok) throw new Error(data.error || 'server error');

    const r = data.record;
    // top label
    const pred = r.result.predictions?.[0];
    const label = pred?.label || JSON.stringify(r.result).slice(0, 50);

    const guidance = r.guidance || {};
    resultBox.innerHTML = `
      <div>Top: <span class="label-pill">${label}</span> score: ${pred?.score?.toFixed?.(2) || '-'}</div>
      <div style="margin-top:6px;font-size:13px;color:#cfe8e0">Guidance: <strong>${guidance.bin || '-'} </strong> — ${guidance.note || ''}</div>
      <div style="margin-top:8px">
        <button id="feedbackCorrect" style="margin-right:8px">This is correct</button>
        <button id="feedbackIncorrect">Incorrect</button>
      </div>
    `;

    // wire feedback buttons
    document.getElementById('feedbackCorrect').addEventListener('click', () => sendFeedback(r._id || r.id, true));
    document.getElementById('feedbackIncorrect').addEventListener('click', async () => {
      const userLabel = prompt('If you know the correct label, type it here (optional)');
      sendFeedback(r._id || r.id, false, userLabel);
    });

    // refresh history & analytics
    await loadHistory();
    await loadAnalytics();
  } catch (err) {
    resultBox.textContent = 'Failed: ' + err.message;
  }
});

async function loadHistory() {
  const resp = await fetch('/api/history');
  const data = await resp.json();
  if (!data.ok) return historyList.textContent = 'Failed to load history';

  historyList.innerHTML = '';
  for (const it of data.items) {
    const row = document.createElement('div');
    row.className = 'history-item';
    const img = document.createElement('img');
    img.src = '/' + it.imagePath.replace(/^\/+/, '');
    img.width = 64;
    img.style.borderRadius = '6px';
    const text = document.createElement('div');
    const top = it.result.predictions?.[0]?.label || 'unknown';
    const guidance = it.guidance || {};
    text.innerHTML = `
      <div style="font-weight:700">${top} <span style="margin-left:8px;font-weight:600;color:#9adbc8;font-size:12px">${guidance.recyclable ? 'Recyclable' : 'Not recyclable'}</span></div>
      <div style="font-size:12px;color:#a8b4bd">${new Date(it.createdAt).toLocaleString()}</div>
      <div style="font-size:12px;color:#a8b4bd;margin-top:4px">Bin: ${guidance.bin || '-'} — ${guidance.note || ''}</div>
    `;

    // if feedback present, show it
    if (it.feedback) {
      const f = document.createElement('div');
      f.style.fontSize = '12px'; f.style.color = '#d2f7e8'; f.style.marginTop = '6px';
      f.textContent = `Feedback: ${it.feedback.isCorrect ? 'Correct' : 'Incorrect'} ${it.feedback.userLabel ? ' | userLabel: ' + it.feedback.userLabel : ''}`;
      text.appendChild(f);
    } else {
      // add quick feedback buttons
      const fbdiv = document.createElement('div');
      fbdiv.style.marginTop = '6px';
      const ok = document.createElement('button'); ok.textContent = 'Mark correct'; ok.style.marginRight = '6px';
      ok.addEventListener('click', () => sendFeedback(it._id || it.id, true));
      const bad = document.createElement('button'); bad.textContent = 'Mark incorrect';
      bad.addEventListener('click', async () => {
        const userLabel = prompt('Optional: provide correct label');
        sendFeedback(it._id || it.id, false, userLabel);
      });
      fbdiv.appendChild(ok); fbdiv.appendChild(bad);
      text.appendChild(fbdiv);
    }
    row.appendChild(img);
    row.appendChild(text);
    historyList.appendChild(row);
  }
}

async function loadAnalytics() {
  const resp = await fetch('/api/analytics');
  const data = await resp.json();
  if (!data.ok) return analyticsBox.textContent = 'Failed to load analytics';
  analyticsBox.innerHTML = '';
  analyticsBox.innerHTML += `<div>Total items: <strong>${data.total}</strong></div>`;
  if (data.accuracy !== null) analyticsBox.innerHTML += `<div>User-feedback accuracy: <strong>${(data.accuracy*100).toFixed(0)}%</strong> (${data.feedbackCount} feedbacks)</div>`;
  analyticsBox.innerHTML += `<div>Estimated daily impact: <strong>${data.dailyImpactKgCO2?.toFixed(2)} kg CO2e</strong> (demo estimate)</div>`;
  analyticsBox.innerHTML += `<div>Top labels:</div>`;
  const ul = document.createElement('ul');
  for (const [label, count] of Object.entries(data.topLabels || {})) {
    const li = document.createElement('li');
    li.textContent = `${label} — ${count}`;
    ul.appendChild(li);
  }
  analyticsBox.appendChild(ul);
}

async function sendFeedback(id, isCorrect, userLabel) {
  try {
    await fetch('/api/feedback', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ id, isCorrect, userLabel }) });
    await loadHistory();
    await loadAnalytics();
  } catch (err) {
    alert('Failed to send feedback: ' + err.message);
  }
}

(async function init(){
  await loadHistory();
  await loadAnalytics();
})();
