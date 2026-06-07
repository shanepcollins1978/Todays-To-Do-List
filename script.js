const STORAGE_KEY = "shanesTodayTodoListV4";
const EMAIL_TO = "shanepcollins1978@gmail.com";
const TEXT_TO = "6022281134";

let state = loadState();
let draggedId = null;

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const saveStatus = document.getElementById("saveStatus");

document.addEventListener("DOMContentLoaded", render);
addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addTask();
});

document.getElementById("emailBtn").addEventListener("click", emailList);
document.getElementById("textBtn").addEventListener("click", textList);
document.getElementById("clearCompletedBtn").addEventListener("click", clearCompleted);
document.getElementById("clearAllBtn").addEventListener("click", clearAll);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.tasks)) return saved;
  } catch (error) {}

  return {
    tasks: [
      { id: makeId(), text: "Laundry", completed: false },
      { id: makeId(), text: "Work", completed: false },
      { id: makeId(), text: "Hamburgers", completed: false },
      { id: makeId(), text: "Website w Ashley", completed: false },
      { id: makeId(), text: "Water pressure", completed: false },
      { id: makeId(), text: "Amazon return", completed: false }
    ]
  };
}

function makeId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStatus.textContent = "Saved automatically.";

  clearTimeout(window.saveStatusTimer);
  window.saveStatusTimer = setTimeout(() => {
    saveStatus.textContent = "Auto-save is on.";
  }, 1400);
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  state.tasks.push({
    id: makeId(),
    text,
    completed: false
  });

  taskInput.value = "";
  saveState();
  render();
  taskInput.focus();
}

function render() {
  taskList.innerHTML = "";
  taskCount.textContent = state.tasks.length;

  if (!state.tasks.length) {
    taskList.innerHTML = `<div class="empty-state">No tasks yet. Add one above.</div>`;
    updateProgress();
    return;
  }

  state.tasks.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });

  updateProgress();
}

function createTaskElement(task) {
  const item = document.createElement("div");
  item.className = `task-item${task.completed ? " completed" : ""}`;
  item.draggable = true;
  item.dataset.id = task.id;

  item.addEventListener("dragstart", () => {
    draggedId = task.id;
    item.classList.add("dragging");
  });

  item.addEventListener("dragend", () => {
    draggedId = null;
    item.classList.remove("dragging");
  });

  item.addEventListener("dragover", event => {
    event.preventDefault();
  });

  item.addEventListener("drop", event => {
    event.preventDefault();
    moveTask(draggedId, task.id);
  });

  const handle = document.createElement("span");
  handle.className = "drag-handle";
  handle.textContent = "☰";
  handle.title = "Drag to reorder";

  const checkBtn = document.createElement("button");
  checkBtn.className = "task-check";
  checkBtn.type = "button";
  checkBtn.textContent = task.completed ? "✓" : "";
  checkBtn.setAttribute("aria-label", "Mark complete");

  checkBtn.addEventListener("click", () => {
    task.completed = !task.completed;
    saveState();
    render();
  });

  const textWrap = document.createElement("div");
  textWrap.className = "task-text-wrap";

  const text = document.createElement("div");
  text.className = "task-text";
  text.textContent = task.text;
  text.contentEditable = "true";
  text.setAttribute("role", "textbox");
  text.setAttribute("aria-label", "Task text");

  text.addEventListener("input", () => {
    task.text = text.textContent.trim();
    saveState();
  });

  text.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      taskInput.focus();
    }
  });

  textWrap.appendChild(text);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-task";
  deleteBtn.type = "button";
  deleteBtn.textContent = "Remove";

  deleteBtn.addEventListener("click", () => {
    state.tasks = state.tasks.filter(item => item.id !== task.id);
    saveState();
    render();
  });

  item.append(handle, checkBtn, textWrap, deleteBtn);

  return item;
}

function moveTask(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return;

  const fromIndex = state.tasks.findIndex(task => task.id === fromId);
  const toIndex = state.tasks.findIndex(task => task.id === toId);

  if (fromIndex < 0 || toIndex < 0) return;

  const [movedTask] = state.tasks.splice(fromIndex, 1);
  state.tasks.splice(toIndex, 0, movedTask);

  saveState();
  render();
}

function updateProgress() {
  const total = state.tasks.length;
  const complete = state.tasks.filter(task => task.completed).length;
  const percent = total ? Math.round((complete / total) * 100) : 0;

  document.getElementById("progressText").textContent =
    `Today's Progress: ${complete} / ${total} Complete`;

  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressFill").style.width = `${percent}%`;
}

function buildMessage() {
  const lines = ["Shane's Today To-Do List", ""];

  state.tasks.forEach(task => {
    lines.push(`${task.completed ? "✓" : "☐"} ${task.text}`);
  });

  return lines.join("\n");
}

function emailList() {
  const subject = encodeURIComponent("Shane's Today To-Do List");
  const body = encodeURIComponent(buildMessage());

  window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
}

function textList() {
  const body = encodeURIComponent(buildMessage());
  const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";

  window.location.href = `sms:${TEXT_TO}${separator}body=${body}`;
}

function clearCompleted() {
  state.tasks = state.tasks.filter(task => !task.completed);
  saveState();
  render();
}

function clearAll() {
  const confirmed = confirm("Clear every task?");
  if (!confirmed) return;

  state.tasks = [];
  saveState();
  render();
}
