
const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");

// Get tasks from the backend
async function loadTasks() {
    try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        taskList.textContent = "Could not load tasks. Please try again.";
        console.error(error);
    }
}

// Display tasks on the webpage
function displayTasks(tasks) {
    taskList.replaceChildren();

    taskCount.textContent =
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

    if (tasks.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No tasks yet. Add your first task!";
        taskList.appendChild(message);
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent =
            task.description || "No description provided.";

        const status = document.createElement("span");
        status.className = "task-status";

        if (task.status === "Completed") {
            status.classList.add("completed");
        }

        status.textContent = task.status;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-button";
        completeButton.textContent =
            task.status === "Completed" ? "Mark Pending" : "Complete";

        completeButton.addEventListener("click", () => {
            updateTask(task.id, task.status === "Completed" ? "Pending" : "Completed");
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(completeButton, deleteButton);
        card.append(title, description, status, actions);
        taskList.appendChild(card);
    });
}

// Add a new task
taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();

    if (!title) {
        alert("Please enter a task title.");
        return;
    }

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not add task");
        }

        taskForm.reset();
        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
});

// Update task status
async function updateTask(id, status) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not update task");
        }

        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
}

// Delete a task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not delete task");
        }

        await loadTasks();
    } catch (error) {
        alert(error.message);
    }
}

// Load existing tasks when the page opens
loadTasks();
