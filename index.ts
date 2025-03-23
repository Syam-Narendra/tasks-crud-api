import express from "express";
import { v4 } from "uuid";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        error: "Invalid JSON format",
        message: "Please ensure the request body contains valid JSON"
      });
    }
    next();
  });

type Task = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  dueDate?: Date; 
  createdAt: Date;
};

const tasks: Task[] = [];

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({
      error: "Task not found",
      message: `No task exists with ID: ${req.params.id}`
    });
  }
  
  res.json(task);
});

app.post("/tasks", (req, res) => {
  const { title, description, status, dueDate } = req.body;
  if (!title || !status) {
    return res.status(400).json({
      error: "Required fields missing",
      required: ["title", "status"]
    });
  }

  if (!["todo", "in-progress", "completed"].includes(status)) {
    return res.status(400).json({
      error: "Invalid status value",
      allowedValues: ["todo", "in-progress", "completed"]
    });
  }

  const task: Task = {
    id: v4(),
    title,
    description,
    status,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    createdAt: new Date()
  };

  tasks.push(task);
  res.status(201).json(task);
});

app.put("/tasks/:id", (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({
      error: "Task not found",
      message: `No task exists with ID: ${req.params.id}`
    });
  }

  const { title, description, status, dueDate } = req.body;

  if (!title || !status) {
    return res.status(400).json({
      error: "Required fields missing",
      required: ["title", "status"]
    });
  }
  if (!["todo", "in-progress", "completed"].includes(status)) {
    return res.status(400).json({
      error: "Invalid status value",
      allowedValues: ["todo", "in-progress", "completed"]
    });
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    title,
    description,
    status,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  };

  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});
app.delete("/tasks/:id", (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      error: "Task not found",
      message: `No task exists with ID: ${req.params.id}`
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({
    message: "Task deleted successfully",
    task: deletedTask
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});