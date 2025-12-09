const fileInput = document.getElementById('fileInput');
const predictBtn = document.getElementById('predictBtn');
const resultSection = document.getElementById('result');
const labelEl = document.getElementById('label');
const scoreEl = document.getElementById('score');
const guidanceEl = document.getElementById('guidance');
const historyEl = document.getElementById('history');

async function loadHistory(){
  try{
    const res = await fetch('/api/history');
    const data = await res.json();
    historyEl.innerHTML = '';
    data.forEach(it => {
      const li = document.createElement('li');
      li.textContent = `${new Date(it.createdAt).toLocaleString()} — ${it.label} (${(it.score*100).toFixed(1)}%)`;
      historyEl.appendChild(li);
    });
  }catch(err){
    console.error(err);
  }
}

predictBtn.onclick = async () => {
  if (!fileInput.files || fileInput.files.length === 0) return alert('Select an image');
  const f = fileInput.files[0];
  const b = await toBase64(f);
  const payload = { imageBase64: b };
  const res = await fetch('/api/predict', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  const data = await res.json();
  if (res.ok){
    labelEl.textContent = 'Category: ' + data.label;
    scoreEl.textContent = 'Confidence: ' + (data.score*100).toFixed(1) + '%';
    guidanceEl.textContent = `Recyclable: ${data.guidance.recyclable} — Bin: ${data.guidance.bin}`;
    resultSection.hidden = false;
    loadHistory();
  } else {
    alert(data.error || 'Prediction error');
  }
}

function toBase64(file){
  return new Promise((resolve,reject)=>{
    const fr = new FileReader();
    fr.onload = ()=>resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

loadHistory();
