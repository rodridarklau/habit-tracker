// Mensaje de comprobación en consola para verificar que el archivo está bien enlazado
console.log("HabitFlow: Base del proyecto cargada exitosamente.");// 1. Selección de elementos del DOM (Document Object Model)
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsList = document.getElementById('habits-list');

// 2. Estado de la aplicación: arreglo en memoria donde viven los hábitos
let habits = [];

// 3. Función para renderizar (dibujar) los hábitos en el HTML
function renderHabits() {
  // Limpiamos la lista para no duplicar elementos al redibujar
  habitsList.innerHTML = '';

  if (habits.length === 0) {
    habitsList.innerHTML = '<p style="color: #64748b; text-align: center;">No tienes hábitos registrados aún. ¡Agrega uno arriba!</p>';
    return;
  }

  habits.forEach((habit) => {
    // Creamos el elemento <li> para cada hábito
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

// 4. Función para manejar el envío del formulario
habitForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita que la página se recargue

  const habitName = habitInput.value.trim();
  if (habitName === '') return;

  // Creamos el objeto del nuevo hábito
  const newHabit = {
    id: Date.now(), // Identificador único basado en la marca de tiempo
    name: habitName,
    completed: false,
    streak: 0
  };

  // Agregamos al arreglo y limpiamos el input
  habits.push(newHabit);
  habitInput.value = '';

  // Actualizamos la vista
  renderHabits();
});

// 5. Función para alternar el estado de completado
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

  renderHabits();
}

// 6. Función para eliminar un hábito
function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);
  renderHabits();
}

// Renderizado inicial al cargar la página
renderHabits();