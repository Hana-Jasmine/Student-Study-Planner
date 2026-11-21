// GET HTML ELEMENTS
const taskInput = document.getElementById("task-input");
const subjectInput = document.getElementById("subject-input");
const priorityInput = document.getElementById("priority-input");
const dateInput = document.getElementById("date-input");

const addButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

const searchInput = document.getElementById("search-input");
const filterInput = document.getElementById("filter-input");
const clearAllButton = document.getElementById("clear-all");

const todayDate = document.getElementById("today-date");
const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

// PREVENT UNWANTED FORM SUBMISSION
addButton.type = "button";
clearAllButton.type = "button";

// LOAD SAVED TASKS
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
} catch (error) {
    tasks = [];
}

let editingTaskId = null;


// SAVE TASKS
function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}


// UPDATE DASHBOARD AND PROGRESS
function updateProgress() {
    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    completedTasks.textContent = completed;

    progressText.textContent =
        percentage + "% Completed (" + completed + "/" + total + ")";

    progressFill.style.width = percentage + "%";
}


// GET TODAY'S DATE
function getTodayString() {
    const today = new Date();

    return today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
}


// DISPLAY TASKS
function displayTasks() {
    taskList.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterValue = filterInput.value;

    // FILTER TASKS
    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.name.toLowerCase().includes(searchTerm) ||
            task.subject.toLowerCase().includes(searchTerm);

        const matchesFilter =
            filterValue === "All" ||
            (filterValue === "Pending" && !task.completed) ||
            (filterValue === "Completed" && task.completed) ||
            task.priority === filterValue;

        return matchesSearch && matchesFilter;
    });

    // SORT BY PRIORITY
    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    };

    filteredTasks.sort((a, b) => {
        return (priorityOrder[a.priority] || 4) -
               (priorityOrder[b.priority] || 4);
    });

    // EMPTY MESSAGE
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent = tasks.length === 0
            ? "No tasks yet. Add your first study task! 🌿"
            : "No matching tasks found.";

        taskList.appendChild(emptyMessage);
    }

    // CREATE EACH TASK
    filteredTasks.forEach(task => {

        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // TASK INFORMATION
        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const priorityText = document.createElement("p");
        priorityText.textContent = "Priority: " + task.priority;
        priorityText.className =
            "priority-" + task.priority.toLowerCase();

        const taskName = document.createElement("h3");
        taskName.textContent = task.name;

        const taskDetails = document.createElement("p");
        taskDetails.textContent =
            task.subject + " | " + (task.date || "No deadline");

        // DUE DATE STATUS
        const dueStatus = document.createElement("p");

        if (!task.date) {
            dueStatus.textContent = "No deadline";
        } else if (task.date < getTodayString()) {
            dueStatus.textContent = "⚠️ Overdue";
            dueStatus.className = "overdue";
        } else if (task.date === getTodayString()) {
            dueStatus.textContent = "📅 Due Today";
            dueStatus.className = "due-today";
        } else {
            dueStatus.textContent = "🗓️ Upcoming";
            dueStatus.className = "upcoming";
        }

        taskInfo.appendChild(priorityText);
        taskInfo.appendChild(taskName);
        taskInfo.appendChild(taskDetails);
        taskInfo.appendChild(dueStatus);

        // ACTION BUTTONS
        const actions = document.createElement("div");
        actions.className = "task-actions";

        // EDIT BUTTON
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {

            taskInput.value = task.name;
            subjectInput.value = task.subject;
            priorityInput.value = task.priority;
            dateInput.value = task.date || "";

            editingTaskId = task.id;

            addButton.textContent = "Update Task";

            taskInput.focus();
        });

        // COMPLETE / UNDO BUTTON
        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.textContent =
            task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", () => {

            task.completed = !task.completed;

            saveTasks();
            displayTasks();
        });

        // DELETE BUTTON
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {

            tasks = tasks.filter(item => item.id !== task.id);

            if (editingTaskId === task.id) {
                resetForm();
            }

            saveTasks();
            displayTasks();
        });

        // ADD BUTTONS TO TASK
        actions.appendChild(editButton);
        actions.appendChild(completeButton);
        actions.appendChild(deleteButton);

        taskItem.appendChild(taskInfo);
        taskItem.appendChild(actions);

        taskList.appendChild(taskItem);
    });

    updateProgress();
}


// RESET INPUT FORM
function resetForm() {
    taskInput.value = "";
    subjectInput.value = "";
    priorityInput.value = "";
    dateInput.value = "";

    editingTaskId = null;

    addButton.textContent = "+ Add Task";
}


// ADD OR UPDATE TASK
function addTask() {

    const name = taskInput.value.trim();
    const subject = subjectInput.value;
    const priority = priorityInput.value;
    const date = dateInput.value;

    if (name === "") {
        alert("Please enter a study task!");
        return;
    }

    if (subject === "") {
        alert("Please select a subject!");
        return;
    }

    if (priority === "") {
        alert("Please select task priority!");
        return;
    }

    // UPDATE EXISTING TASK
    if (editingTaskId !== null) {

        const taskToUpdate = tasks.find(
            task => task.id === editingTaskId
        );

        if (taskToUpdate) {
            taskToUpdate.name = name;
            taskToUpdate.subject = subject;
            taskToUpdate.priority = priority;
            taskToUpdate.date = date;
        }

        saveTasks();
        resetForm();
        displayTasks();

        return;
    }

    // CREATE NEW TASK
    const newTask = {
        id: Date.now(),
        name: name,
        subject: subject,
        priority: priority,
        date: date,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    resetForm();
    displayTasks();
}


// ADD TASK BUTTON
addButton.addEventListener("click", addTask);


// SEARCH TASKS
searchInput.addEventListener("input", displayTasks);


// FILTER TASKS
filterInput.addEventListener("change", displayTasks);


// CLEAR ALL TASKS
clearAllButton.addEventListener("click", () => {

    if (confirm("Delete all study tasks?")) {

        tasks = [];

        saveTasks();
        resetForm();
        displayTasks();
    }
});


// DISPLAY TODAY'S DATE
const today = new Date();

todayDate.textContent = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});


// INITIAL DISPLAY
displayTasks();