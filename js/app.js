// 1. Selección de elementos del DOM
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsList = document.getElementById('habits-list');

// Elementos de la sección de progreso
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentage = document.getElementById('progress-percentage');
const progressText = document.getElementById('progress-text');

// 2. Clave de almacenamiento local
const STORAGE_KEY = 'habitflow_habits';

// 3. Estado inicial desde localStorage
let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// 4. Guardar en localStorage
function saveHabitsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// 5. Actualizar el panel de progreso y la barra visual
function updateProgress() {
  const total = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;
  
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  // Modificamos el DOM con los cálculos
  progressBarFill.style.width = `${percentage}%`;
  progressPercentage.textContent = `${percentage}%`;
  progressText.textContent = `${completedCount} de ${total} hábitos completados`;
}

// 6. Renderizar los hábitos en pantalla
function renderHabits() {
  habitsList.innerHTML = '';

  if (habits.length === 0) {
    habitsList.innerHTML = '<p style="color: #64748b; text-align: center;">No tienes hábitos registrados aún. ¡Agrega uno arriba!</p>';
  } else {
    habits.forEach((habit) => {
      const li = document.createElement('li');
      li.className = `habit-card ${habit.completed ? 'completed' : ''}`;

      li.innerHTML = `
        <div class="habit-info">
          <span class="habit-title">${habit.name}</span>
          <span class="habit-streak">🔥 Racha: ${habit.streak} días</span>
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

  // Cada vez que se renderizan hábitos, recalculamos el progreso
  updateProgress();
}

// 7. Evento para crear un nuevo hábito
habitForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const habitName = habitInput.value.trim();
  if (habitName === '') return;

  const newHabit = {
    id: Date.now(),
    name: habitName,
    completed: false,
    streak: 0
  };

  habits.push(newHabit);
  saveHabitsToStorage();
  habitInput.value = '';

  renderHabits();
});

// 8. Alternar completado
function toggleHabit(id) {
  habits = habits.map((habit) => {
    if (habit.id === id) {
      const isNowCompleted = !habit.completed;
      return {
        ...habit,
        completed: isNowCompleted,
        streak: isNowCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
      };
    }
    return habit;
  });

  saveHabitsToStorage();
  renderHabits();
}

// 9. Eliminar hábito
function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);
  saveHabitsToStorage();
  renderHabits();
}

// Inicialización
renderHabits();