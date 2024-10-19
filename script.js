document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById('task-list');
    const taskNameInput = document.getElementById('task-name');
    const taskDateInput = document.getElementById('task-date');
    const addTaskBtn = document.getElementById('add-task');
    const searchInput = document.getElementById('search');
    let editingTask = null; // Zmienna do przechowywania aktualnie edytowanego zadania

    // Ustawienie minimalnej daty na dzisiejszy dzień
    taskDateInput.min = new Date().toISOString().split("T")[0];

    // Załadowanie zadań z Local Storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    displayTasks(tasks);

    // Dodawanie zadania
    addTaskBtn.addEventListener('click', () => {
        const taskName = taskNameInput.value.trim();
        const taskDate = taskDateInput.value;

        // Walidacja zadania
        if (taskName.length < 3 || taskName.length > 255) {
            alert("Nazwa zadania musi mieć co najmniej 3 znaki i nie więcej niż 255 znaki.");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (taskDate && taskDate <= today) {
            alert("Data musi być w przyszłości");
            return;
        }

        const task = {
            name: taskName,
            date: taskDate
        };

        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks(tasks);

        // Resetowanie pól
        taskNameInput.value = "";
        taskDateInput.value = "";
    });

    // Wyświetlanie zadań
    function displayTasks(tasks) {
        // Sortowanie zadań według daty (od najstarszej do najnowszej)
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement('li');

            const taskSpan = document.createElement('span');
            taskSpan.classList.add('task-name');
            taskSpan.textContent = task.name;

            const taskDateSpan = document.createElement('span');
            taskDateSpan.classList.add('task-date');
            taskDateSpan.innerHTML = `<strong>${task.date}</strong>`;

            // Przycisk usuwania zadania z ikoną śmietnika
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tasks.splice(index, 1);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                displayTasks(tasks);

                if (editingTask === li) {
                    editingTask = null;
                }
            });

            // Edycja nazwy i daty zadania
            taskSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                // Sprawdzenie, czy aktualnie inne zadanie jest edytowane
                if (editingTask) {
                    saveTask(editingTask);i
                }

                if (!li.classList.contains('editing')) {
                    li.classList.add('editing');
                    editingTask = li; // Ustaw edytowane zadanie

                    // Input edycji nazwy
                    const editNameInput = document.createElement('input');
                    editNameInput.type = 'text';
                    editNameInput.value = task.name;

                    // Input edycji daty
                    const editDateInput = document.createElement('input');
                    editDateInput.type = 'date';
                    editDateInput.value = task.date;
                    editDateInput.min = new Date().toISOString().split("T")[0];

                    // Przycisk zapisu edytowanych wartości
                    const saveBtn = document.createElement('button');
                    saveBtn.style.backgroundColor = '#28a745';
                    saveBtn.textContent = 'Zapisz';
                    saveBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        saveTask(li);
                    });

                    // Zamiana treści na inputy
                    li.innerHTML = '';
                    li.appendChild(editNameInput);
                    li.appendChild(editDateInput);
                    li.appendChild(saveBtn);
                    li.appendChild(deleteBtn);
                }
            });

            li.appendChild(taskSpan);
            li.appendChild(taskDateSpan);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    // Funkcja zapisu zadania
    function saveTask(li) {
        const editNameInput = li.querySelector('input[type="text"]');
        const editDateInput = li.querySelector('input[type="date"]');
        const index = Array.from(taskList.children).indexOf(li);

        const selectedDate = new Date(editDateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Ustawienie godziny na 00:00:00

        // Walidacja daty
        if (selectedDate < today) {
            alert("Data musi być co najmniej dzisiejsza.");
            return;
        }

        tasks[index].name = editNameInput.value;
        tasks[index].date = editDateInput.value;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks(tasks);
        editingTask = null;
    }

    // Nasłuchiwanie kliknięć poza edytowanym elementem
    document.addEventListener('click', (event) => {
        if (editingTask && !editingTask.contains(event.target)) {
            saveTask(editingTask);
        }
    });

    // Wyszukiwanie zadań
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length < 2) {
            displayTasks(tasks); // Wyświetl całą listę, jeśli fraza jest za krótka
            return;
        }

        const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(searchTerm));
        displayTasks(filteredTasks);

        // Wyróżnienie wyszukiwanego terminu
        const taskItems = taskList.querySelectorAll('.task-name');
        taskItems.forEach(item => {
            const regex = new RegExp(searchTerm, 'gi');
            item.innerHTML = item.textContent.replace(regex, (match) => `<span class="search-highlight">${match}</span>`);
        });
    });
});
