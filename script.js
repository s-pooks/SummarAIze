javascript
let isRecording = false;
let recognition;
let currentTranscript = "";

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (window.SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const text = e.results[i][0].transcript;
      if (e.results[i].isFinal) currentTranscript += text + ". ";
      else interim += text;
    }
    document.getElementById("notesList").innerHTML = <div class='note'><strong>Live:</strong> ${currentTranscript + interim}</div>;
  };
} else alert("Speech Recognition not supported");

document.getElementById("recordBtn").onclick = () => {
  if (!isRecording) {
    recognition.start();
    isRecording = true;
    recordBtn.innerText = "⏹ Stop Recording";
  } else {
    recognition.stop();
    isRecording = false;
    recordBtn.innerText = "🎤 Start Recording";
  }
};

document.getElementById("saveBtn").onclick = () => {
  const title = document.getElementById("lectureTitle").value || "Untitled";
  saveLecture(title, currentTranscript);
  currentTranscript = "";
  displayLectures();
};

function saveLecture(title, transcript) {
  const lectures = JSON.parse(localStorage.getItem("lectures") || "[]");
  lectures.push({ title, transcript, date: new Date().toLocaleString() });
  localStorage.setItem("lectures", JSON.stringify(lectures));
}

function displayLectures() {
  const list = document.getElementById("notesList");
  const lectures = JSON.parse(localStorage.getItem("lectures") || "[]");
  list.innerHTML = lectures.map(l => <div class='note'><strong>${l.title}</strong><br>${l.transcript}</div>).join('');
}

document.getElementById("translateBtn").onclick = async () => {
  const text = currentTranscript;
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'en', target: 'es' })
  });
  const data = await res.json();
  alert('Translated Text: ' + data.translatedText);
};

// Daily Goals
const goalList = document.getElementById('goalList');
const timeDisplay = document.getElementById('timeDisplay');
let timer;
let seconds = 0;

document.getElementById('addGoal').onclick = () => {
  const goal = document.getElementById('goalInput').value;
  if (!goal) return;
  const li = document.createElement('li');
  li.textContent = goal;
  goalList.appendChild(li);
};

document.getElementById('startTimer').onclick = () => {
  timer = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timeDisplay.textContent = ${m}:${s};
  }, 1000);
};

document.getElementById('stopTimer').onclick = () => clearInterval(timer);

// Mind Game
const grid = document.getElementById('gameGrid');
const symbols = ['A','B','C','A','B','C'];
let firstCard = null;
let lock = false;

function renderGame() {
  grid.innerHTML = '';
  symbols.sort(() => Math.random() - 0.5);
  symbols.forEach(sym => {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.symbol = sym;
    div.onclick = () => flipCard(div);
    grid.appendChild(div);
  });
}
function flipCard(card) {
  if (lock || card.classList.contains('matched')) return;
  card.textContent = card.dataset.symbol;
  if (!firstCard) firstCard = card;
  else {
    if (firstCard.dataset.symbol === card.dataset.symbol) {
      firstCard.classList.add('matched');
      card.classList.add('matched');
    } else {
      lock = true;
      setTimeout(() => {
        firstCard.textContent = '';
        card.textContent = '';
        lock = false;
      }, 800);
    }
    firstCard = null;
  }
}
renderGame();