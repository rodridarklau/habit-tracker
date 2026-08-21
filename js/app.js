// Storage Keys
const HABITS_KEY = 'habitflow_elite_habits';
const PROFILE_KEY = 'habitflow_elite_profile_v3';
const HISTORY_KEY = 'habitflow_elite_history';

// DOM Elements
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitCategory = document.getElementById('habit-category');
const habitsList = document.getElementById('habits-list');

const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentage = document.getElementById('progress-percentage');
const streakStat = document.getElementById('streak-stat');
const xpDisplay = document.getElementById('xp-display');
const xpText = document.getElementById('xp-text');
const currentDateText = document.getElementById('current-date-text');
const filterBtns = document.querySelectorAll('.f-btn');

// Rank & History Elements
const rankIcon = document.getElementById('rank-icon');
const currentRankTitle = document.getElementById('current-rank-title');
const rankBarFill = document.getElementById('rank-bar-fill');
const nextRankInfo = document.getElementById('next-rank-info');
const daysStrip = document.getElementById('days-strip');
const weeklyCompletionRate = document.getElementById('weekly-completion-rate');

// Profile & Studio Elements
const userNameEl = document.getElementById('user-name');
const chipAvatarContainer = document.getElementById('chip-avatar-container');
const svgPreviewContainer = document.getElementById('svg-preview-container');
const userLevelEl = document.getElementById('user-level');
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const profileNameInput = document.getElementById('profile-name-input');
const randomizeAvatarBtn = document.getElementById('randomize-avatar-btn');

// Customizer Inputs
const avatarHair = document.getElementById('avatar-hair');
const avatarHairColor = document.getElementById('avatar-hair-color');
const avatarSkinColor = document.getElementById('avatar-skin-color');
const avatarFacialHair = document.getElementById('avatar-facial-hair');
const avatarAccessories = document.getElementById('avatar-accessories');
const avatarFace = document.getElementById('avatar-face');

let currentFilter = 'all';

// Estado de Perfil con Configuración del Avatar
let userProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {
  name: 'ATLETA #01',
  xp: 0,
  level: 1,
  avatarConfig: {
    hair: 'fade',
    hairColor: '#1c1917',
    skinColor: '#e0a37e',
    facialHair: 'stubble',
    accessories: 'shades',
    face: 'confident'
  }
};

let tempAvatarConfig = { ...userProfile.avatarConfig };
let completionHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

// ==========================================
// MOTOR NATIVO DE GENERACIÓN DE AVATAR SVG
// ==========================================
function renderAvatarSVG(config, isSmall = false) {
  const { hair, hairColor, skinColor, facialHair, accessories, face } = config;

  // 1. Capa de Pelo Trasero (para estilos como TopKnot o Dreads)
  let backHairSVG = '';
  if (hair === 'topknot') {
    backHairSVG = `<circle cx="50" cy="18" r="9" fill="${hairColor}" />`;
  }

  // 2. Capa de Rostro y Ojos
  let faceSVG = '';
  if (face === 'serious') {
    faceSVG = `
      <!-- Cejas firmes -->
      <path d="M 33 46 L 44 48" stroke="#111" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 67 46 L 56 48" stroke="#111" stroke-width="2.5" stroke-linecap="round" />
      <!-- Ojos con parpadeo -->
      <g class="anim-blink">
        <circle cx="39" cy="52" r="2.5" fill="#111" />
        <circle cx="61" cy="52" r="2.5" fill="#111" />
      </g>
      <!-- Nariz y Boca -->
      <path d="M 50 54 L 48 58 L 52 58" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" fill="none" />
      <path d="M 44 65 L 56 65" stroke="#111" stroke-width="2.5" stroke-linecap="round" />
    `;
  } else if (face === 'confident') {
    faceSVG = `
      <!-- Cejas elevadas -->
      <path d="M 34 45 Q 40 43 45 47" stroke="#111" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 66 45 Q 60 43 55 47" stroke="#111" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <g class="anim-blink">
        <circle cx="39" cy="52" r="2.5" fill="#111" />
        <circle cx="61" cy="52" r="2.5" fill="#111" />
      </g>
      <!-- Sonrisa -->
      <path d="M 50 54 L 48 58 L 52 58" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" fill="none" />
      <path d="M 43 64 Q 50 70 57 64" stroke="#111" stroke-width="2.5" stroke-linecap="round" fill="none" />
    `;
  } else if (face === 'beast') {
    faceSVG = `
      <!-- Cejas agresivas / enfocado -->
      <path d="M 33 48 L 45 52" stroke="#111" stroke-width="3" stroke-linecap="round" />
      <path d="M 67 48 L 55 52" stroke="#111" stroke-width="3" stroke-linecap="round" />
      <g class="anim-blink">
        <circle cx="39" cy="54" r="2" fill="#111" />
        <circle cx="61" cy="54" r="2" fill="#111" />
      </g>
      <path d="M 50 56 L 48 59 L 52 59" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" fill="none" />
      <path d="M 42 66 Q 50 62 58 66" stroke="#111" stroke-width="3" stroke-linecap="round" fill="none" />
    `;
  }

  // 3. Capa de Vello Facial
  let beardSVG = '';
  if (facialHair === 'stubble') {
    beardSVG = `
      <path d="M 35 58 Q 50 76 65 58 Q 50 72 35 58 Z" fill="rgba(0,0,0,0.18)" />
    `;
  } else if (facialHair === 'full') {
    beardSVG = `
      <path d="M 32 55 Q 50 82 68 55 Q 60 76 50 76 Q 40 76 32 55 Z" fill="${hairColor}" />
      <path d="M 43 62 Q 50 60 57 62" stroke="${hairColor}" stroke-width="3" stroke-linecap="round" />
    `;
  } else if (facialHair === 'goatee') {
    beardSVG = `
      <path d="M 42 61 Q 50 59 58 61" stroke="${hairColor}" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 45 68 Q 50 76 55 68 Z" fill="${hairColor}" />
    `;
  }

  // 4. Capa de Pelo Delantero
  let hairSVG = '';
  if (hair === 'fade') {
    hairSVG = `
      <!-- Textured Crop / High Fade -->
      <path d="M 28 42 C 28 22 72 22 72 42 C 68 32 58 28 50 28 C 42 28 32 32 28 42 Z" fill="${hairColor}" />
      <path d="M 32 34 Q 40 28 50 30 Q 60 28 68 34" stroke="${hairColor}" stroke-width="5" stroke-linecap="round" fill="none" />
    `;
  } else if (hair === 'buzz') {
    hairSVG = `
      <!-- Buzz Cut Rapado -->
      <path d="M 30 40 C 30 25 70 25 70 40 C 65 31 58 28 50 28 C 42 28 35 31 30 40 Z" fill="${hairColor}" opacity="0.85" />
    `;
  } else if (hair === 'dreads') {
    hairSVG = `
      <!-- Modern Dreads -->
      <path d="M 28 38 C 28 24 72 24 72 38" fill="${hairColor}" />
      <rect x="30" y="28" width="5" height="18" rx="2.5" fill="${hairColor}" transform="rotate(-15 32 28)" />
      <rect x="40" y="24" width="5" height="20" rx="2.5" fill="${hairColor}" transform="rotate(-5 42 24)" />
      <rect x="52" y="24" width="5" height="20" rx="2.5" fill="${hairColor}" transform="rotate(8 54 24)" />
      <rect x="63" y="28" width="5" height="18" rx="2.5" fill="${hairColor}" transform="rotate(20 65 28)" />
    `;
  } else if (hair === 'topknot') {
    hairSVG = `
      <!-- Undercut Sides + Top Bun -->
      <path d="M 30 40 C 30 26 70 26 70 40 C 65 30 50 26 30 40 Z" fill="${hairColor}" />
      <circle cx="50" cy="22" r="5" fill="#ccff00" />
    `;
  } else if (hair === 'undercut') {
    hairSVG = `
      <!-- Undercut Despeinado / Flow -->
      <path d="M 28 42 C 28 22 72 22 72 42 C 60 26 40 24 28 42 Z" fill="${hairColor}" />
      <path d="M 32 30 Q 55 18 72 34 Q 55 24 32 30 Z" fill="${hairColor}" />
    `;
  } else if (hair === 'bald') {
    hairSVG = `<!-- Calvo / Clean -->`;
  }

  // 5. Capa de Accesorios
  let accessorySVG = '';
  if (accessories === 'shades') {
    accessorySVG = `
      <!-- Gafas Deportivas Shield Neón -->
      <path d="M 30 48 L 70 48 L 66 58 L 34 58 Z" fill="#0c0c0c" stroke="#ccff00" stroke-width="1.5" />
      <line x1="33" y1="52" x2="67" y2="52" stroke="#ccff00" stroke-width="1" opacity="0.6" />
    `;
  } else if (accessories === 'headband') {
    accessorySVG = `
      <!-- Bandana Deportiva -->
      <path d="M 28 38 Q 50 35 72 38 L 72 44 Q 50 41 28 44 Z" fill="#111" stroke="#ccff00" stroke-width="1.5" />
      <circle cx="50" cy="40" r="2" fill="#ccff00" />
    `;
  } else if (accessories === 'mask') {
    accessorySVG = `
      <!-- Mascarilla Techwear -->
      <path d="M 34 58 L 50 74 L 66 58 L 68 64 L 50 78 L 32 64 Z" fill="#181818" stroke="#333" stroke-width="1.5" />
      <circle cx="50" cy="67" r="2.5" fill="#ccff00" />
    `;
  }

  return `
    <svg viewBox="0 0 100 100" class="anim-idle" xmlns="http://www.w3.org/2000/svg">
      <!-- Fondo y Cuello -->
      <g id="body-base">
        <!-- Hombros / Ropa Deportiva -->
        <path d="M 15 100 Q 50 82 85 100 Z" fill="#161616" stroke="#262626" stroke-width="1.5" />
        <path d="M 40 89 L 50 96 L 60 89 Z" fill="#ccff00" opacity="0.8" />
        <!-- Cuello -->
        <path d="M 42 66 L 42 82 Q 50 86 58 82 L 58 66 Z" fill="${skinColor}" />
      </g>

      <!-- Pelo Trasero -->
      <g id="back-hair">${backHairSVG}</g>

      <!-- Cabeza y Orejas -->
      <g id="head-base">
        <!-- Orejas -->
        <circle cx="29" cy="53" r="5" fill="${skinColor}" />
        <circle cx="71" cy="53" r="5" fill="${skinColor}" />
        <!-- Cabeza Base -->
        <rect x="30" y="30" width="40" height="42" rx="16" fill="${skinColor}" />
      </g>

      <!-- Expresión / Ojos -->
      <g id="facial-features">${faceSVG}</g>

      <!-- Barba -->
      <g id="facial-hair">${beardSVG}</g>

      <!-- Pelo Delantero -->
      <g id="front-hair">${hairSVG}</g>

      <!-- Accesorios -->
      <g id="accessories">${accessorySVG}</g>
    </svg>
  `;
}

// Fechas
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function displayDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  const today = new Date().toLocaleDateString('es-ES', options);
  currentDateText.textContent = `HOY • ${today.toUpperCase()}`;
}

// Carga de Hábitos
let habits = (JSON.parse(localStorage.getItem(HABITS_KEY)) || []).map((h) => {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (h.lastCompletedDate && h.lastCompletedDate !== today && h.lastCompletedDate !== yesterday) {
    h.streak = 0;
  }
  if (h.lastCompletedDate !== today) {
    h.completed = false;
  }
  return h;
});

function saveAll() {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(completionHistory));
}

// Rangos de Disciplina
const RANKS = [
  { name: 'RECLUTA', minDays: 0, maxDays: 2, icon: '🛡️', next: 'ATLETA DEDICADO' },
  { name: 'ATLETA DEDICADO', minDays: 3, maxDays: 6, icon: '⚡', next: 'ÉLITE DISCIPLINADO' },
  { name: 'ÉLITE DISCIPLINADO', minDays: 7, maxDays: 13, icon: '🏆', next: 'MÁQUINA IMPARABLE' },
  { name: 'MÁQUINA IMPARABLE', minDays: 14, maxDays: 29, icon: '🔥', next: 'TITÁN LEGENDARIO' },
  { name: 'TITÁN LEGENDARIO', minDays: 30, maxDays: 999, icon: '👑', next: 'MÁXIMO RANGO ALCANZADO' }
];

function updateRankUI(maxStreak) {
  const currentRank = RANKS.find((r) => maxStreak >= r.minDays && maxStreak <= r.maxDays) || RANKS[0];
  
  rankIcon.textContent = currentRank.icon;
  currentRankTitle.textContent = currentRank.name;
  
  if (currentRank.maxDays === 999) {
    rankBarFill.style.width = '100%';
    nextRankInfo.textContent = '¡Has alcanzado la cúspide de la disciplina!';
  } else {
    const daysIntoRank = maxStreak - currentRank.minDays;
    const rankSpan = (currentRank.maxDays - currentRank.minDays) + 1;
    const progressPercent = Math.min(100, Math.round((daysIntoRank / rankSpan) * 100));
    const daysLeft = (currentRank.maxDays + 1) - maxStreak;
    
    rankBarFill.style.width = `${progressPercent}%`;
    nextRankInfo.textContent = `Faltan ${daysLeft} día(s) para ${currentRank.next}`;
  }
}

// Tracker Semanal
function renderWeeklyHistory() {
  daysStrip.innerHTML = '';
  const daysOfWeek = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  let completedDaysCount = 0;

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = i === 0;
    
    const isCompleted = completionHistory.includes(dateStr);
    if (isCompleted) completedDaysCount++;

    const dayBox = document.createElement('div');
    dayBox.className = `day-box ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}`;

    dayBox.innerHTML = `
      <span class="day-name">${daysOfWeek[date.getDay()]}</span>
      <span class="day-num">${date.getDate()}</span>
      <div class="day-indicator">${isCompleted ? '✓' : '•'}</div>
    `;

    daysStrip.appendChild(dayBox);
  }

  const weeklyPercent = Math.round((completedDaysCount / 7) * 100);
  weeklyCompletionRate.textContent = `${weeklyPercent}% Consistencia Semanal`;
}

function checkDayCompletionStatus() {
  const today = getTodayString();
  const total = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;

  if (total > 0 && completedCount === total) {
    if (!completionHistory.includes(today)) {
      completionHistory.push(today);
    }
  } else {
    completionHistory = completionHistory.filter((d) => d !== today);
  }

  saveAll();
  renderWeeklyHistory();
}

// Actualizar Perfil y Avatares SVG
function updateProfileUI() {
  userNameEl.textContent = userProfile.name.toUpperCase();
  chipAvatarContainer.innerHTML = renderAvatarSVG(userProfile.avatarConfig, true);
  userLevelEl.textContent = `NIVEL ${userProfile.level} • ${currentRankTitle.textContent}`;

  xpDisplay.textContent = userProfile.xp;
  const currentLevelXp = userProfile.xp % 100;
  xpText.textContent = `${currentLevelXp}/100 XP`;
}

function addXP(amount) {
  userProfile.xp += amount;
  userProfile.level = Math.floor(userProfile.xp / 100) + 1;
  saveAll();
  updateProfileUI();
}

function updateStats() {
  const total = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  progressBarFill.style.width = `${percentage}%`;
  progressPercentage.textContent = `${percentage}%`;

  const maxStreak = habits.reduce((acc, h) => Math.max(acc, h.streak), 0);
  streakStat.textContent = maxStreak;

  updateRankUI(maxStreak);
  checkDayCompletionStatus();
  updateProfileUI();
}

// Render Habits
function renderHabits() {
  habitsList.innerHTML = '';

  let filtered = habits;
  if (currentFilter === 'pending') filtered = habits.filter((h) => !h.completed);
  if (currentFilter === 'completed') filtered = habits.filter((h) => h.completed);

  if (filtered.length === 0) {
    habitsList.innerHTML = `
      <li style="text-align: center; color: var(--text-muted); padding: 2.5rem 0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;">
        NO HAY OBJETIVOS EN ESTE REGISTRO
      </li>
    `;
  } else {
    filtered.forEach((habit) => {
      const li = document.createElement('li');
      li.className = `habit-card ${habit.completed ? 'completed' : ''}`;

      li.innerHTML = `
        <div class="habit-info">
          <div class="habit-head">
            <span class="habit-title">${habit.name}</span>
            <span class="discipline-badge">${habit.category}</span>
          </div>
          <span class="streak-tag">🔥 RACHA: ${habit.streak} DÍAS</span>
        </div>
        <div class="habit-actions">
          <button class="btn-check" onclick="toggleHabit(${habit.id})">
            ${habit.completed ? 'COMPLETADO' : 'CUMPLIR'}
          </button>
          <button class="btn-del" onclick="deleteHabit(${habit.id})" title="Eliminar">✕</button>
        </div>
      `;
      habitsList.appendChild(li);
    });
  }

  updateStats();
}

// Acciones
habitForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = habitInput.value.trim();
  if (!name) return;

  const newHabit = {
    id: Date.now(),
    name: name,
    category: habitCategory.value,
    completed: false,
    streak: 0,
    lastCompletedDate: null
  };

  habits.push(newHabit);
  saveAll();
  habitInput.value = '';
  renderHabits();
});

function toggleHabit(id) {
  const today = getTodayString();

  habits = habits.map((h) => {
    if (h.id === id) {
      const isCompleting = !h.completed;
      if (isCompleting) addXP(25);
      return {
        ...h,
        completed: isCompleting,
        streak: isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1),
        lastCompletedDate: isCompleting ? today : null
      };
    }
    return h;
  });

  saveAll();
  renderHabits();
}

function deleteHabit(id) {
  habits = habits.filter((h) => h.id !== id);
  saveAll();
  renderHabits();
}

// Filtros
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderHabits();
  });
});

// Customizer Studio (Live Preview)
function refreshPreview() {
  svgPreviewContainer.innerHTML = renderAvatarSVG(tempAvatarConfig);
}

function syncCustomizerInputs() {
  profileNameInput.value = userProfile.name;
  avatarHair.value = tempAvatarConfig.hair;
  avatarHairColor.value = tempAvatarConfig.hairColor;
  avatarSkinColor.value = tempAvatarConfig.skinColor;
  avatarFacialHair.value = tempAvatarConfig.facialHair;
  avatarAccessories.value = tempAvatarConfig.accessories;
  avatarFace.value = tempAvatarConfig.face;
  refreshPreview();
}

[avatarHair, avatarHairColor, avatarSkinColor, avatarFacialHair, avatarAccessories, avatarFace].forEach((el) => {
  el.addEventListener('change', () => {
    tempAvatarConfig.hair = avatarHair.value;
    tempAvatarConfig.hairColor = avatarHairColor.value;
    tempAvatarConfig.skinColor = avatarSkinColor.value;
    tempAvatarConfig.facialHair = avatarFacialHair.value;
    tempAvatarConfig.accessories = avatarAccessories.value;
    tempAvatarConfig.face = avatarFace.value;
    refreshPreview();
  });
});

randomizeAvatarBtn.addEventListener('click', () => {
  const hairs = ['fade', 'buzz', 'dreads', 'topknot', 'undercut', 'bald'];
  const hairColors = ['#1c1917', '#451a03', '#b45309', '#eab308', '#ccff00', '#38bdf8'];
  const skins = ['#f8d2b7', '#e0a37e', '#c68642', '#8d5524', '#492816'];
  const beards = ['none', 'stubble', 'full', 'goatee'];
  const accs = ['none', 'shades', 'headband', 'mask'];
  const faces = ['serious', 'confident', 'beast'];

  tempAvatarConfig.hair = hairs[Math.floor(Math.random() * hairs.length)];
  tempAvatarConfig.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
  tempAvatarConfig.skinColor = skins[Math.floor(Math.random() * skins.length)];
  tempAvatarConfig.facialHair = beards[Math.floor(Math.random() * beards.length)];
  tempAvatarConfig.accessories = accs[Math.floor(Math.random() * accs.length)];
  tempAvatarConfig.face = faces[Math.floor(Math.random() * faces.length)];

  syncCustomizerInputs();
});

editProfileBtn.addEventListener('click', () => {
  tempAvatarConfig = { ...userProfile.avatarConfig };
  syncCustomizerInputs();
  profileModal.classList.add('open');
});

closeModalBtn.addEventListener('click', () => profileModal.classList.remove('open'));

saveProfileBtn.addEventListener('click', () => {
  const newName = profileNameInput.value.trim();
  if (newName) userProfile.name = newName;
  userProfile.avatarConfig = { ...tempAvatarConfig };
  saveAll();
  updateProfileUI();
  profileModal.classList.remove('open');
});

// Init
displayDate();
renderWeeklyHistory();
renderHabits();