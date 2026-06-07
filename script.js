const STORAGE_KEY = "shanesTodayTodoListV5";
const EMAIL_TO = "shanepcollins1978@gmail.com";
const TEXT_TO = "6022281134";

let tasks = loadTasks();
let draggedId = null;

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const saveStatus = document.getElementById("saveStatus");

addTaskBtn.addEventListener("click", addTasksFromInput);
document.getElementById("saveBtn").addEventListener("click", () => saveTasks(true));
document.getElementById("emailBtn").addEventListener("click", emailList);
document.getElementById("textBtn").addEventListener("click", textList);
document.getElementById("clearCompletedBtn").addEventListener("click", clearCompleted);
document.getElementById("clearAllBtn").addEventListener("click", clearAll);

taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    addTasksFromInput();
  }
});

document.addEventListener("DOMContentLoaded", renderTasks);

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn("Could not load saved tasks.", error);
  }
  return [];
}

function saveTasks(showConfirmation = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  if (showConfirmation) showSaved();
}

function showSaved() {
  saveStatus.textContent = "✓ Saved";
  setTimeout(() => {
    saveStatus.textContent = "";
  }, 2000);
}

function addTasksFromInput() {
  const lines = taskInput.value
    .split("\n")
    .map(line => cleanTaskText(line))
    .filter(Boolean);

  if (!lines.length) return;

  lines.forEach(text => {
    tasks.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      text,
      completed: false
    });
  });

  taskInput.value = "";
  saveTasks(true);
  renderTasks();
}

function cleanTaskText(text) {
  return text
    .replace(/^\s*[-*•]\s+/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .trim();
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    item.draggable = true;
    item.dataset.id = task.id;

    item.innerHTML = `
      <button class="check-btn" aria-label="Toggle complete">${task.completed ? "☑" : "☐"}</button>
      <input class="task-text" value="${escapeHtml(task.text)}" aria-label="Task text" />
      <div class="drag-handle" aria-label="Drag to reorder">☰</div>
    `;

    item.querySelector(".check-btn").addEventListener("click", () => toggleTask(task.id));
    item.querySelector(".task-text").addEventListener("input", event => updateTaskText(task.id, event.target.value));

    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);

    taskList.appendChild(item);
  });

  updateCount();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  renderTasks();
}

function updateTaskText(id, text) {
  tasks = tasks.map(task => task.id === id ? { ...task, text } : task);
  saveTasks();
  updateCount();
}

function updateCount() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  taskCount.textContent = `${completed}/${total} done`;
}

function handleDragStart(event) {
  draggedId = event.currentTarget.dataset.id;
  event.currentTarget.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  const targetId = event.currentTarget.dataset.id;
  if (!draggedId || draggedId === targetId) return;

  const draggedIndex = tasks.findIndex(task => task.id === draggedId);
  const targetIndex = tasks.findIndex(task => task.id === targetId);
  const [draggedTask] = tasks.splice(draggedIndex, 1);
  tasks.splice(targetIndex, 0, draggedTask);

  saveTasks(true);
  renderTasks();
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove("dragging");
  draggedId = null;
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks(true);
  renderTasks();
}

function clearAll() {
  if (!tasks.length) return;
  if (!confirm("Clear the whole list?")) return;
  tasks = [];
  saveTasks(true);
  renderTasks();
}

function getListText() {
  if (!tasks.length) return "Today's list is empty.";

  return tasks.map((task, index) => {
    const box = task.completed ? "☑" : "☐";
    return `${index + 1}. ${box} ${task.text}`;
  }).join("\n");
}

function emailList() {
  const subject = encodeURIComponent("Shane's Today To-Do List");
  const body = encodeURIComponent(getListText());
  window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
}

function textList() {
  const body = encodeURIComponent(getListText());
  window.location.href = `sms:${TEXT_TO}&body=${body}`;
}
