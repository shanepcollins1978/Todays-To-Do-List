const STORAGE_KEY = "shanesTodayTodoListV4";
const EMAIL_TO = "shanepcollins1978@gmail.com";
const TEXT_TO = "6022281134";

const state = loadState();
let currentFilter = "all";
let draggedId = null;

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const saveStatus = document.getElementById("saveStatus");
const template = document.getElementById("taskTemplate");

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved || { tasks: [], theme: "light" };
  } catch {
    return { tasks: [], theme: "light" };
  }
}

function saveState(message = "Saved") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStatus.textContent = message;
  setTimeout(() => saveStatus.textContent = "Saved", 1200);
}

function addTasks() {
  const lines = taskInput.value.split("\n").map(t => t.trim()).filter(Boolean);
  if (!lines.length) return;
  lines.forEach(text => state.tasks.push({ id: crypto.randomUUID(), text, done: false, createdAt: Date.now() }));
  taskInput.value = "";
  saveState("Added");
  render();
}

function taskSummary() {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  return { total, done, open: total - done };
}

function render() {
  document.documentElement.dataset.theme = state.theme || "light";
  document.getElementById("themeToggle").textContent = state.theme === "dark" ? "☀" : "☾";
  const summary = taskSummary();
  document.getElementById("totalCount").textContent = summary.total;
  document.getElementById("openCount").textContent = summary.open;
  document.getElementById("doneCount").textContent = summary.done;

  taskList.innerHTML = "";
  const visibleTasks = state.tasks.filter(task => {
    if (currentFilter === "open") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });

  emptyState.classList.toggle("hidden", visibleTasks.length > 0);

  visibleTasks.forEach(task => {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = task.id;
    item.classList.toggle("done", task.done);

    const input = item.querySelector(".task-text");
    input.value = task.text;
    input.addEventListener("input", () => {
      task.text = input.value;
      saveState("Edited");
    });

    item.querySelector(".check-btn").addEventListener("click", () => {
      task.done = !task.done;
      saveState(task.done ? "Completed" : "Reopened");
      render();
    });

    item.querySelector(".delete-btn").addEventListener("click", () => {
      state.tasks = state.tasks.filter(t => t.id !== task.id);
      saveState("Deleted");
      render();
    });

    item.addEventListener("dragstart", () => {
      draggedId = task.id;
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
    item.addEventListener("dragover", event => event.preventDefault());
    item.addEventListener("drop", () => reorderTasks(draggedId, task.id));

    taskList.appendChild(item);
  });
}

function reorderTasks(fromId, toId) {
  if (!fromId || fromId === toId) return;
  const fromIndex = state.tasks.findIndex(t => t.id === fromId);
  const toIndex = state.tasks.findIndex(t => t.id === toId);
  const [moved] = state.tasks.splice(fromIndex, 1);
  state.tasks.splice(toIndex, 0, moved);
  saveState("Reordered");
  render();
}

function buildListText() {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const open = state.tasks.filter(t => !t.done).map(t => `☐ ${t.text}`);
  const done = state.tasks.filter(t => t.done).map(t => `✓ ${t.text}`);
  return [`Shane's Today To-Do List`, today, "", "Open Tasks:", ...(open.length ? open : ["None"]), "", "Completed:", ...(done.length ? done : ["None"])].join("\n");
}

function emailList() {
  const subject = encodeURIComponent("Shane's Today To-Do List");
  const body = encodeURIComponent(buildListText());
  window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
}

function textList() {
  const body = encodeURIComponent(buildListText());
  window.location.href = `sms:${TEXT_TO}&body=${body}`;
}

document.getElementById("addTaskBtn").addEventListener("click", addTasks);
taskInput.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") addTasks();
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    taskInput.value = chip.dataset.template;
    taskInput.focus();
    taskInput.setSelectionRange(taskInput.value.length, taskInput.value.length);
  });
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

document.getElementById("themeToggle").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState("Theme saved");
  render();
});

document.getElementById("saveBtn").addEventListener("click", () => saveState("Saved now"));
document.getElementById("emailBtn").addEventListener("click", emailList);
document.getElementById("textBtn").addEventListener("click", textList);
document.getElementById("clearCompletedBtn").addEventListener("click", () => {
  state.tasks = state.tasks.filter(t => !t.done);
  saveState("Cleared done");
  render();
});
document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (!state.tasks.length) return;
  if (confirm("Clear your entire list?")) {
    state.tasks = [];
    saveState("Cleared");
    render();
  }
});

render();
