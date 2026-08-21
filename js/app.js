// Storage Keys
const HABITS_KEY = 'habitflow_elite_habits';
const PROFILE_KEY = 'habitflow_elite_profile';

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

// Athlete Profile Elements
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

// Habits Load & Streak Verification
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
}

// Update Athlete Stats
function updateProfileUI() {
  userNameEl.textContent = userProfile.name.toUpperCase();
  userAvatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.avatarSeed}`;
  userLevelEl.textContent = `NIVEL ${userProfile.level} • ${getRankTitle(userProfile.level)}`;

  xpDisplay.textContent = userProfile.xp;
  const currentLevelXp = userProfile.xp % 100;
  xpText.textContent = `${currentLevelXp}/100 XP para Lv. ${userProfile.level + 1}`;
}

function getRankTitle(lvl) {
  if (lvl >= 10) return 'TITÁN';
  if (lvl >= 5) return 'VETERANO';
  if (lvl >= 3) return 'ELITE';
  return 'RECLUTA';
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

// Habit Actions
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
      if (isCompleting) {
        addXP(25);
      }
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

// Filters
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderHabits();
  });
});

// Profile Modal Actions
editProfileBtn.addEventListener('click', () => {
  profileNameInput.value = userProfile.name;
  selectedAvatarSeed = userProfile.avatarSeed;
  avatarOptions.forEach((img) => {
    img.classList.toggle('selected', img.dataset.seed === selectedAvatarSeed);
  });
  profileModal.classList.add('open');
});

closeModalBtn.addEventListener('click', () => {
  profileModal.classList.remove('open');
});

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
updateProfileUI();
renderHabits();