import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Tasks.css";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState({
        taskName: "",
        description: "",
        status: "Pending",
        dueDate: "",
    });
    const [showAddTaskForm, setShowAddTaskForm] = useState(false);
    const userId = JSON.parse(localStorage.getItem("user"))?.UserID;

    useEffect(() => {
        if (!userId) return;

        axios
            .get(`/user-tasks/${userId}`)
            .then((res) => {
                if (res.data.success) {
                    setTasks(res.data.tasks);
                } else {
                    setTasks([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching tasks:", err);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleAddTask = async () => {
        const { taskName, description, status, dueDate } = newTask;
        const weddingID = JSON.parse(localStorage.getItem("weddingID"));

        if (!taskName || !status || !dueDate) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!weddingID) {
            alert("Wedding ID is missing. Please ensure your wedding is selected before adding tasks.");
            return;
        }

        try {
            const res = await axios.post("/addTask", {
                weddingID,
                taskName,
                description,
                status,
                dueDate,
            });

            if (res.data.success) {
                setTasks([
                    ...tasks,
                    {
                        Task_ID: res.data.taskID,
                        Task_Name: taskName,
                        Description: description,
                        Status: status,
                        Due_Date: dueDate,
                    },
                ]);
                setNewTask({
                    taskName: "",
                    description: "",
                    status: "Pending",
                    dueDate: "",
                });
                setShowAddTaskForm(false);
            }
        } catch (err) {
            console.error("Error adding task:", err);
            alert("Error adding task");
        }
    };

    const handleUpdateTask = async (taskId) => {
        try {
            const res = await axios.put("/update-task", { taskId });

            if (res.data.success) {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.Task_ID === taskId
                            ? { ...task, Status: "Completed" }
                            : task
                    )
                );
            } else {
                alert(res.data.message || "Task could not be updated");
            }
        } catch (err) {
            console.error("Error updating task:", err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const res = await axios.delete("/Deletetasks", {
                data: { taskID: taskId },
            });

            if (res.data.success) {
                setTasks((prev) =>
                    prev.filter((task) => task.Task_ID !== taskId)
                );
            } else {
                alert(res.data.message || "Task could not be deleted");
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    return (
        <div className="tasks-container">
            <h1>Your Tasks</h1>

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <>
                    {tasks.length === 0 ? (
                        <p>No tasks found.</p>
                    ) : (
                        <div>
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th>Task Name</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks
                                        .sort(
                                            (a, b) =>
                                                new Date(a.Due_Date) -
                                                new Date(b.Due_Date)
                                        )
                                        .map((task) => (
                                            <tr key={task.Task_ID}>
                                                <td>{task.Task_Name}</td>
                                                <td>{task.Description}</td>
                                                <td>{task.Status}</td>
                                                <td>
                                                    {new Date(task.Due_Date).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    {task.Status !== "Completed" && (
                                                        <button
                                                            className="btn-complete"
                                                            onClick={() =>
                                                                handleUpdateTask(
                                                                    task.Task_ID
                                                                )
                                                            }
                                                        >
                                                            Mark as Completed
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() =>
                                                            handleDeleteTask(
                                                                task.Task_ID
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <button
                        className="add-task-btn"
                        onClick={() => setShowAddTaskForm(true)}
                    >
                        Add New Task
                    </button>
                </>
            )}
            {showAddTaskForm && (
                <div className="add-task-form">
                    <h2>Add a New Task</h2>
                    <input
                        type="text"
                        placeholder="Task Name"
                        value={newTask.taskName}
                        onChange={(e) =>
                            setNewTask({ ...newTask, taskName: e.target.value })
                        }
                    />
                    <textarea
                        placeholder="Description"
                        value={newTask.description}
                        onChange={(e) =>
                            setNewTask({ ...newTask, description: e.target.value })
                        }
                    />
                    <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                            setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                    />
                    <select
                        value={newTask.status}
                        onChange={(e) =>
                            setNewTask({ ...newTask, status: e.target.value })
                        }
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button className="btn-add" onClick={handleAddTask}>
                        Add Task
                    </button>
                    <button
                        className="btn-cancel"
                        onClick={() => setShowAddTaskForm(false)}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

export default Tasks;
