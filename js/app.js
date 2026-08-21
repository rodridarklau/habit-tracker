// 1. Constantes y elementos del DOM
const STORAGE_KEY = 'habitflow_habits_v2';
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitCategory = document.getElementById('habit-category');
const habitsList = document.getElementById('habits-list');

const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentage = document.getElementById('progress-percentage');
const progressText = document.getElementById('progress-text');
const activeStreakCount = document.getElementById('active-streak-count');
const currentDateText = document.getElementById('current-date-text');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

// 2. Formateador de fechas y comprobación diaria
function getTodayString() {
  return new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function displayFormattedDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('es-ES', options);
  currentDateText.textContent = today.charAt(0).toUpperCase() + today.slice(1);
}

// 3. Inicializar hábitos con lógica de rachas basada en fechas
let habits = (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map((h) => {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Si la última fecha de completado fue anterior a ayer, la racha se reinicia
  if (h.lastCompletedDate && h.lastCompletedDate !== today && h.lastCompletedDate !== yesterday) {
    h.streak = 0;
  }

  // Si no se completó hoy, el estado 'completed' vuelve a false para el nuevo día
  if (h.lastCompletedDate !== today) {
    h.completed = false;
  }

  return h;
});

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// 4. Panel de métricas
function updateStats() {
  const total = habits.length;
  const completedToday = habits.filter((h) => h.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completedToday / total) * 100);

  progressBarFill.style.width = `${percentage}%`;
  progressPercentage.textContent = `${percentage}%`;
  progressText.textContent = `${completedToday} de ${total} completados`;

  const highestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  activeStreakCount.textContent = `🔥 Mayor racha: ${highestStreak} días`;
}

// 5. Renderizado con filtrado
function renderHabits() {
  habitsList.innerHTML = '';

  let filteredHabits = habits;
  if (currentFilter === 'pending') {
    filteredHabits = habits.filter((h) => !h.completed);
  } else if (currentFilter === 'completed') {
    filteredHabits = habits.filter((h) => h.completed);
  }

  if (filteredHabits.length === 0) {
    habitsList.innerHTML = `
      <li style="text-align: center; color: #64748b; padding: 2rem 0; font-size: 0.95rem;">
        No hay hábitos en este filtro.
      </li>
    `;
  } else {
    filteredHabits.forEach((habit) => {
      const badgeClass = `badge-${habit.category.toLowerCase().replace('/', '')}`;
      const li = document.createElement('li');
      li.className = `habit-card ${habit.completed ? 'completed' : ''}`;

      li.innerHTML = `
        <div class="habit-info">
          <div class="habit-main">
            <span class="habit-title">${habit.name}</span>
            <span class="badge ${badgeClass}">${habit.category}</span>
          </div>
          <span class="habit-streak">🔥 Racha actual: ${habit.streak} días</span>
        </div>
        <div class="habit-actions">
          <button class="btn-complete" onclick="toggleHabit(${habit.id})">
            ${habit.completed ? 'Desmarcar' : 'Completar'}
          </button>
          <button class="btn-delete" onclick="deleteHabit(${habit.id})">Eliminar</button>
        </div>
      `;

      habitsList.appendChild(li);
    });
  }

  updateStats();
}

// 6. Acciones
habitForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = habitInput.value.trim();
  const category = habitCategory.value;
  if (!name) return;

  const newHabit = {
    id: Date.now(),
    name: name,
    category: category,
    completed: false,
    streak: 0,
    lastCompletedDate: null
  };

  habits.push(newHabit);
  saveHabits();
  habitInput.value = '';
  renderHabits();
});

function toggleHabit(id) {
  const today = getTodayString();

  habits = habits.map((h) => {
    if (h.id === id) {
      const isCompleting = !h.completed;
      return {
        ...h,
        completed: isCompleting,
        streak: isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1),
        lastCompletedDate: isCompleting ? today : null
      };
    }
    return h;
  });

  saveHabits();
  renderHabits();
}

function deleteHabit(id) {
  habits = habits.filter((h) => h.id !== id);
  saveHabits();
  renderHabits();
}

// 7. Configuración de botones de filtro
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderHabits();
  });
});

// Inicializar la aplicación
displayFormattedDate();
renderHabits();