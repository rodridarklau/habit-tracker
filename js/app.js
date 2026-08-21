// Storage Keys
const HABITS_KEY = 'habitflow_elite_habits';
const PROFILE_KEY = 'habitflow_elite_profile';
const HISTORY_KEY = 'habitflow_elite_history'; // Almacena historial de días completados

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

// Profile Elements
const userNameEl = document.getElementById('user-name');
const userAvatarImg = document.getElementById('user-avatar-img');
const userLevelEl = document.getElementById('user-level');
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const profileNameInput = document.getElementById('profile-name-input');
const avatarOptions = document.querySelectorAll('.avatar-pick');

let currentFilter = 'all';
let selectedAvatarSeed = 'Ares';

// State
let userProfile = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {
  name: 'ATLETA #01',
  avatarSeed: 'Ares',
  xp: 0,
  level: 1
};

// Historial de días exitosos: arreglo de fechas completadas ['2026-08-20', '2026-08-21']
let completionHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

// Date Utilities
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

// Habits Load
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

// Rangos de Disciplina basados en Racha
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

// Tracker de los últimos 7 días
function renderWeeklyHistory() {
  daysStrip.innerHTML = '';
  const daysOfWeek = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  let completedDaysCount = 0;

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = i === 0;
    
    // Verificamos si este día fue completado
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

// Verificar si hoy se cumplieron TODOS los hábitos para marcar el día en el historial
function checkDayCompletionStatus() {
  const today = getTodayString();
  const total = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;

  if (total > 0 && completedCount === total) {
    if (!completionHistory.includes(today)) {
      completionHistory.push(today);
    }
  } else {
    // Si desmarca algún hábito y ya no están todos completos hoy, se retira del historial
    completionHistory = completionHistory.filter((d) => d !== today);
  }

  saveAll();
  renderWeeklyHistory();
}

// Update Profile
function updateProfileUI() {
  userNameEl.textContent = userProfile.name.toUpperCase();
  userAvatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.avatarSeed}`;
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

// Modal Perfil
editProfileBtn.addEventListener('click', () => {
  profileNameInput.value = userProfile.name;
  selectedAvatarSeed = userProfile.avatarSeed;
  avatarOptions.forEach((img) => {
    img.classList.toggle('selected', img.dataset.seed === selectedAvatarSeed);
  });
  profileModal.classList.add('open');
});

closeModalBtn.addEventListener('click', () => profileModal.classList.remove('open'));

avatarOptions.forEach((img) => {
  img.addEventListener('click', () => {
    avatarOptions.forEach((opt) => opt.classList.remove('selected'));
    img.classList.add('selected');
    selectedAvatarSeed = img.dataset.seed;
  });
});

saveProfileBtn.addEventListener('click', () => {
  const newName = profileNameInput.value.trim();
  if (newName) userProfile.name = newName;
  userProfile.avatarSeed = selectedAvatarSeed;
  saveAll();
  updateProfileUI();
  profileModal.classList.remove('open');
});

// Init
displayDate();
renderWeeklyHistory();
renderHabits();