
const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Get all tasks
app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare(
        "SELECT * FROM tasks ORDER BY id DESC"
    ).all();

    res.json(tasks);
});

// Add a task
app.post("/api/tasks", (req, res) => {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const result = db.prepare(
        "INSERT INTO tasks (title, description) VALUES (?, ?)"
    ).run(title.trim(), description || "");

    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json(task);
});

// Update task status
app.patch("/api/tasks/:id", (req, res) => {
    const { status } = req.body;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    if (!["Pending", "Completed"].includes(status)) {
        return res.status(400).json({
            message: "Invalid task status"
        });
    }

    const result = db.prepare(
        "UPDATE tasks SET status = ? WHERE id = ?"
    ).run(status, id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json({ message: "Task status updated" });
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    const result = db.prepare(
        "DELETE FROM tasks WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json({ message: "Task deleted successfully" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Task Manager running at http://localhost:${PORT}`);
});
