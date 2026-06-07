const STORAGE_KEY = "shanesTodayToDoListV1";

const EMAIL = "shanepcollins1978@gmail.com";
const PHONE = "6022281134";

const todoList = document.getElementById("todoList");
const notes = document.getElementById("notes");
const priority1 = document.getElementById("priority1");
const priority2 = document.getElementById("priority2");
const priority3 = document.getElementById("priority3");

const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");
const newDayButton = document.getElementById("newDayButton");
const emailButton = document.getElementById("emailButton");
const textButton = document.getElementById("textButton");

function getCurrentData() {
  return {
    todoList: todoList.value,
    notes: notes.value,
    priority1: priority1.value,
    priority2: priority2.value,
    priority3: priority3.value
  };
}

function saveData(showAlert = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getCurrentData()));
  updateShareLinks();

  if (showAlert) {
    alert("Your list has been saved.");
  }
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    updateShareLinks();
    return;
  }

  try {
    const data = JSON.parse(saved);
    todoList.value = data.todoList || "";
    notes.value = data.notes || "";
    priority1.value = data.priority1 || "";
    priority2.value = data.priority2 || "";
    priority3.value = data.priority3 || "";
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  updateShareLinks();
}

function buildMessage() {
  const priorities = [priority1.value, priority2.value, priority3.value]
    .map(item => item.trim())
    .filter(Boolean);

  let message = "Shane's Today To-Do List\n\n";

  if (priorities.length) {
    message += "Top 3 Priorities:\n";
    priorities.forEach((item, index) => {
      message += `${index + 1}. ${item}\n`;
    });
    message += "\n";
  }

  const listText = todoList.value.trim();
  if (listText) {
    message += "Today's List:\n" + listText + "\n\n";
  }

  const notesText = notes.value.trim();
  if (notesText) {
    message += "Notes:\n" + notesText + "\n";
  }

  if (!priorities.length && !listText && !notesText) {
    message += "No items added yet.";
  }

  return message.trim();
}

function updateShareLinks() {
  const subject = encodeURIComponent("Shane's Today To-Do List");
  const body = encodeURIComponent(buildMessage());

  emailButton.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  const isiPhoneOrIPad = /iPad|iPhone|iPod/.test(navigator.userAgent);
  textButton.href = isiPhoneOrIPad
    ? `sms:${PHONE}&body=${body}`
    : `sms:${PHONE}?body=${body}`;
}

function clearList() {
  if (!confirm("Clear everything on today's list?")) return;

  todoList.value = "";
  notes.value = "";
  priority1.value = "";
  priority2.value = "";
  priority3.value = "";
  localStorage.removeItem(STORAGE_KEY);
  updateShareLinks();
}

function startNewDay() {
  if (!confirm("Start a new day and clear the list?")) return;
  clearList();
}

function addCategory(prefix) {
  const current = todoList.value;
  const needsNewLine = current.length > 0 && !current.endsWith("\n");
  todoList.value = current + (needsNewLine ? "\n" : "") + prefix;
  todoList.focus();
  saveData(false);
}

[todoList, notes, priority1, priority2, priority3].forEach(input => {
  input.addEventListener("input", () => saveData(false));
});

saveButton.addEventListener("click", () => saveData(true));
clearButton.addEventListener("click", clearList);
newDayButton.addEventListener("click", startNewDay);

document.querySelectorAll(".chip").forEach(button => {
  button.addEventListener("click", () => addCategory(button.dataset.add));
});

loadData();
