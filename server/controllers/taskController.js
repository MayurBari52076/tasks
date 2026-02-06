import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  const { title, description } = req.body;

  const task = await Task.create({
    title,
    description,
    owner: req.user.id,
    collaborators: [],
    subtasks: []
  });

  res.json(task);
};

export const getTasks = async (req, res) => {
  const myTasks = await Task.find({ owner: req.user.id });
  const collaborativeTasks = await Task.find({
    collaborators: req.user.id
  });

  res.json({ myTasks, collaborativeTasks });
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json("Task not found");

  const allowed =
    task.owner.equals(req.user.id) ||
    task.collaborators.includes(req.user.id);

  if (!allowed) return res.status(403).json("No permission");

  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;

  await task.save();
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json("Task not found");

  if (!task.owner.equals(req.user.id))
    return res.status(403).json("Only owner can delete");

  await task.deleteOne();
  res.json("Task deleted");
};

export const addSubtask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json("Task not found");

  const allowed =
    task.owner.equals(req.user.id) ||
    task.collaborators.includes(req.user.id);

  if (!allowed) return res.status(403).json("No permission");

  task.subtasks.push({ title: req.body.title });
  await task.save();

  res.json(task);
};

export const toggleSubtask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json("Task not found");

  const allowed =
    task.owner.equals(req.user.id) ||
    task.collaborators.includes(req.user.id);

  if (!allowed) return res.status(403).json("No permission");

  const subtask = task.subtasks.id(req.params.subId);
  if (!subtask) return res.status(404).json("Subtask not found");

  subtask.completed = !subtask.completed;
  await task.save();

  res.json(task);
};
