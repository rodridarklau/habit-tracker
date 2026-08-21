// 1. Selección de elementos del DOM
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsList = document.getElementById('habits-list');

// 2. Clave única para guardar en el almacenamiento del navegador
const STORAGE_KEY = 'habitflow_habits';

// 3. Cargar hábitos iniciales desde localStorage (si no hay nada guardado, inicia como arreglo vacío [])
let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// 4. Función para guardar el estado actual de los hábitos en localStorage
function saveHabitsToStorage() {
  // localStorage solo guarda texto plano (strings), por eso convertimos el arreglo a formato JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// 5. Función para renderizar los hábitos en el HTML
function renderHabits() {
  habitsList.innerHTML = '';

  if (habits.length === 0) {
    habitsList.innerHTML = '<p style="color: #64748b; text-align: center;">No tienes hábitos registrados aún. ¡Agrega uno arriba!</p>';
    return;
  }

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

// 6. Manejo del formulario
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
  saveHabitsToStorage(); // <-- Guardamos en localStorage
  habitInput.value = '';

  renderHabits();
});

// 7. Alternar completado
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

  saveHabitsToStorage(); // <-- Guardamos en localStorage
  renderHabits();
}

// 8. Eliminar hábito
function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);
  saveHabitsToStorage(); // <-- Guardamos en localStorage
  renderHabits();
}

// Renderizado inicial al abrir la página
renderHabits();