const STORAGE_KEY = "shanesTodayTodoListV4WithHabits";
const EMAIL_TO = "shanepcollins1978@gmail.com";
const TEXT_TO = "6022281134";

const defaultHabits = [
  "7-minute workout",
  "Stretch or mobility",
  "Drink water",
  "Read or learn AI for 10 minutes",
  "Pickleball footwork cue"
];

let state = loadState();

const taskInput = document.getElementById("taskInput");
const habitInput = document.getElementById("habitInput");
const taskList = document.getElementById("taskList");
const habitList = document.getElementById("habitList");
const taskCount = document.getElementById("taskCount");
const habitCount = document.getElementById("habitCount");
const saveStatus = document.getElementById("saveStatus");

const today = new Date();
document.getElementById("dayName").textContent = today.toLocaleDateString(undefined, { weekday: "long" });
document.getElementById("todayDate").textContent = today.toLocaleDateString(undefined, { month: "short", day: "numeric" });

document.getElementById("addTaskBtn").addEventListener("click", addTask);
document.getElementById("addHabitBtn").addEventListener("click", addHabit);
document.getElementById("clearCompletedBtn").addEventListener("click", clearCompletedTasks);
document.getElementById("clearAllBtn").addEventListener("click", clearAll);
document.getElementById("resetHabitsBtn").addEventListener("click", resetHabits);
document.getElementById("emailBtn").addEventListener("click", emailList);
document.getElementById("textBtn").addEventListener("click", textList);

taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addTask();
});

habitInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addHabit();
});

render();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.tasks) && Array.isArray(saved.habits)) return saved;
  } catch (error) {
    console.warn("Could not load saved list", error);
  }

  return {
    tasks: [],
    habits: defaultHabits.map(text => createItem(text))
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStatus.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function createItem(text) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text: text.trim(),
    completed: false
  };
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  state.tasks.push(createItem(text));
  taskInput.value = "";
  saveState();
  render();
}

function addHabit() {
  const text = habitInput.value.trim();
  if (!text) return;
  state.habits.push(createItem(text));
  habitInput.value = "";
  saveState();
  render();
}

function toggleItem(type, id) {
  const item = state[type].find(entry => entry.id === id);
  if (!item) return;
  item.completed = !item.completed;
  saveState();
  render();
}

function deleteItem(type, id) {
  state[type] = state[type].filter(entry => entry.id !== id);
  saveState();
  render();
}

function clearCompletedTasks() {
  state.tasks = state.tasks.filter(task => !task.completed);
  saveState();
  render();
}

function resetHabits() {
  state.habits = state.habits.map(habit => ({ ...habit, completed: false }));
  saveState();
  render();
}

function clearAll() {
  if (!confirm("Clear all tasks and habits?")) return;
  state.tasks = [];
  state.habits = defaultHabits.map(text => createItem(text));
  saveState();
  render();
}

function render() {
  renderList("tasks", taskList);
  renderList("habits", habitList);

  const completedTasks = state.tasks.filter(task => task.completed).length;
  taskCount.textContent = `${completedTasks} of ${state.tasks.length} completed`;

  const completedHabits = state.habits.filter(habit => habit.completed).length;
  habitCount.textContent = `${completedHabits} of ${state.habits.length} completed`;
}

function renderList(type, container) {
  container.innerHTML = "";
  const items = state[type];

  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = type === "habits" ? "No daily habits yet." : "No tasks yet. Add one above.";
    container.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const li = document.createElement("li");
    li.className = `list-item ${item.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed;
    checkbox.setAttribute("aria-label", `Mark ${item.text} complete`);
    checkbox.addEventListener("change", () => toggleItem(type, item.id));

    const text = document.createElement("span");
    text.className = "item-text";
    text.textContent = item.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Remove";
    deleteBtn.addEventListener("click", () => deleteItem(type, item.id));

    li.append(checkbox, text, deleteBtn);
    container.appendChild(li);
  });
}

function buildPlainTextList() {
  const tasks = state.tasks.map(task => `${task.completed ? "✓" : "○"} ${task.text}`).join("\n") || "No tasks.";
  const habits = state.habits.map(habit => `${habit.completed ? "✓" : "○"} ${habit.text}`).join("\n") || "No habits.";
  return `Today's List\n\nDaily Habits\n${habits}\n\nTasks\n${tasks}`;
}

function emailList() {
  const subject = encodeURIComponent("Today's To-Do List");
  const body = encodeURIComponent(buildPlainTextList());
  window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
}

function textList() {
  const body = encodeURIComponent(buildPlainTextList());
  window.location.href = `sms:${TEXT_TO}&body=${body}`;
}
