let gameData = [];
let wordsQueue = [];
let score = 0;
let passedCount = 0;
let wordHistory = [];
let timeLeft = 60;
let gameTimer;
let isProcessing = false;
let audioCtx = null;
let referenceBeta = null;

// --- Áudio ---

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';

    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
    } else {
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
    }

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Sem suporte a áudio — falha silenciosa
  }
}

// --- Carregamento ---

async function loadGameData() {
  try {
    const index = await fetch('palavras/index.json').then((r) => r.json());

    const results = await Promise.allSettled(
      index.map(async (cat) => {
        const palavras = await fetch(cat.arquivo).then((r) => r.json());
        return { ...cat, palavras };
      }),
    );

    gameData = results
      .filter((r) => r.status === 'fulfilled' && r.value.palavras.length > 0)
      .map((r) => r.value);

    if (gameData.length === 0) throw new Error('Nenhuma categoria carregada');

    renderMenu();
  } catch (error) {
    console.error('Erro ao carregar palavras:', error);
    alert('Erro ao carregar as categorias. Verifique se os arquivos estão na pasta palavras/.');
  }
}

// --- Menu ---

const FAIXA_CLASS = {
  '5 anos':  'category-card--5anos',
  '9 anos':  'category-card--9anos',
  '14 anos': 'category-card--14anos',
};

function renderMenu() {
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';

  gameData.forEach((cat) => {
    const faixaClass = FAIXA_CLASS[cat.faixa_etaria] ?? '';
    const card = document.createElement('div');
    card.className = `category-card ${faixaClass}`;
    card.innerHTML = `
      <span class="category-icon">${cat.icone}</span>
      <span>${cat.nome}</span>
      ${cat.faixa_etaria ? `<span class="category-age">${cat.faixa_etaria.replace(' anos', '+')}</span>` : ''}
    `;
    card.onclick = () => prepareGame(cat.id);
    grid.appendChild(card);
  });

  const allCard = document.createElement('div');
  allCard.className = 'category-card category-card--all';
  allCard.innerHTML = `
    <span class="category-icon">🎲</span>
    <span>Todas</span>
  `;
  allCard.onclick = () => prepareGame('all');
  grid.appendChild(allCard);
}

// --- Preparar Jogo ---

function prepareGame(categoryId) {
  const words =
    categoryId === 'all'
      ? gameData.flatMap((c) => c.palavras)
      : gameData.find((c) => c.id === categoryId).palavras;

  wordsQueue = [...words].sort(() => Math.random() - 0.5);
  showScreen('countdown-screen');
  startCountdown();
}

function startCountdown() {
  let count = 3;
  const countEl = document.getElementById('countdown-number');

  function showCount(val) {
    countEl.innerText = val;
    countEl.classList.remove('pop');
    void countEl.offsetWidth; // força reflow para reativar a animação
    countEl.classList.add('pop');
  }

  showCount(count);

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      showCount(count);
    } else {
      showCount('VAI!');
      clearInterval(interval);
      setTimeout(startGame, 600);
    }
  }, 1000);
}

// --- Partida ---

function startGame() {
  showScreen('play-screen');
  score = 0;
  passedCount = 0;
  timeLeft = 60;
  wordHistory = [];
  updateTimerDisplay();
  nextWord();

  gameTimer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) endGame();
  }, 1000);

  referenceBeta = null;
  window.addEventListener('deviceorientation', handleMotion);
}

function nextWord() {
  if (wordsQueue.length === 0) {
    endGame();
    return;
  }
  document.getElementById('word-card').innerText = wordsQueue.pop();
  isProcessing = false;
}

// --- Movimento ---

function handleMotion(event) {
  if (isProcessing) return;
  const tilt = event.beta;
  if (tilt === null) return;

  if (referenceBeta === null) {
    referenceBeta = tilt;
    return;
  }

  let delta = tilt - referenceBeta;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  if (delta < -40) {
    isProcessing = true;
    processPoint('correct');
  } else if (delta > 40) {
    isProcessing = true;
    processPoint('passed');
  }
}

function processPoint(type) {
  const currentWord = document.getElementById('word-card').innerText;
  wordHistory.push({ word: currentWord, result: type });

  if (type === 'correct') score++;
  else passedCount++;

  playSound(type);

  const playScreen = document.getElementById('play-screen');
  playScreen.classList.add(type);

  setTimeout(() => {
    playScreen.classList.remove(type);
    nextWord();
  }, 600);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer');
  el.innerText = timeLeft;
  el.classList.toggle('timer-urgent', timeLeft <= 10);
}

// --- Fim ---

function endGame() {
  clearInterval(gameTimer);
  window.removeEventListener('deviceorientation', handleMotion);
  showScreen('result-screen');

  document.getElementById('final-score').innerText = score;
  document.getElementById('final-passed').innerText = passedCount;

  const historyEl = document.getElementById('word-history');
  historyEl.innerHTML = wordHistory
    .map(
      (item) => `
      <div class="history-item history-${item.result}">
        <span class="history-icon">${item.result === 'correct' ? '✓' : '→'}</span>
        <span>${item.word}</span>
      </div>
    `,
    )
    .join('');
}

function exitGame() {
  clearInterval(gameTimer);
  window.removeEventListener('deviceorientation', handleMotion);
  showScreen('menu-screen');
}

// --- Utilitários ---

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// --- Init ---

document.getElementById('btn-start-app').addEventListener('click', async () => {
  getAudioContext(); // Inicializa AudioContext via gesto (requisito iOS)

  // iOS 13+ exige permissão explícita para o giroscópio
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        alert('É necessário permitir o acesso ao giroscópio para jogar!');
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }

  showScreen('menu-screen');
});

document.getElementById('btn-play-again').addEventListener('click', () => {
  showScreen('menu-screen');
});

loadGameData();

// Registar Service Worker (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
