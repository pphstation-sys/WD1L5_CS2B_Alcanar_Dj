// planner.js - Planner (list) page
// Tasks are stored as an ARRAY of OBJECTS, for example:
// { id: 1700000000000, title: "Lab", subject: "WD1", due: "2025-03-01", priority: "High", done: false }

// ---------- Page guard: logged-in users only ----------
const user = DB.currentUser();

if (user === null) {
  window.location.href = "login.html";
} else {
  startPlanner(user);
}

function startPlanner(user) {

  // ----- State -----
  let tasks = DB.getTasks(user.username);   // the single source of truth
  let activeFilter = "all";                 // "all", "pending" or "done"

  // ----- Elements -----
  const listEl = document.getElementById("taskList");
  const emptyEl = document.getElementById("emptyText");
  const formEl = document.getElementById("taskForm");
  const messageEl = document.getElementById("message");

  // Show the user's first name
  document.getElementById("userName").textContent = user.fullName.split(" ")[0];

  // ----- Events -----
  formEl.addEventListener("submit", addTask);

  document.getElementById("logoutBtn").addEventListener("click", function () {
    DB.clearSession();
    window.location.href = "login.html";
  });

  document.getElementById("clearDoneBtn").addEventListener("click", function () {
    const hasDone = tasks.some(function (t) { return t.done; });
    if (hasDone && confirm("Remove all completed tasks?")) {
      tasks = tasks.filter(function (t) { return !t.done; });
      update();
    }
  });

  // Filter buttons: one listener on the parent (event delegation)
  document.getElementById("filters").addEventListener("click", function (event) {
    const chip = event.target.closest(".chip");
    if (!chip) return;

    activeFilter = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach(function (c) {
      c.classList.toggle("active", c === chip);
    });
    render();
  });

  // Checkbox and delete button: one listener on the list
  listEl.addEventListener("click", function (event) {
    const row = event.target.closest(".task");
    if (!row) return;
    const id = Number(row.dataset.id);

    if (event.target.matches("input[type='checkbox']")) {
      toggleTask(id);
    } else if (event.target.matches(".task-delete")) {
      deleteTask(id);
    }
  });

  // ----- Functions -----

  // Today's date as YYYY-MM-DD (local time), used to detect overdue tasks
  function todayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

  // Create a task object from the form and add it to the array
  function addTask(event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const due = document.getElementById("due").value;
    const priority = document.getElementById("priority").value;

    if (title === "" || subject === "" || due === "") {
      showMessage(messageEl, "Please fill in the task, subject, and due date.", "error");
      return;
    }

    tasks.push({
      id: Date.now(),
      title: title,
      subject: subject,
      due: due,
      priority: priority,
      done: false
    });

    update();
    formEl.reset();
    document.getElementById("priority").value = "Medium";
    showMessage(messageEl, "Task added!", "success");
  }

  // Flip done / not done
  function toggleTask(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    task.done = !task.done;
    update();
  }

  // Keep every task except the deleted one
  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    update();
  }

  // Save to localStorage, then redraw
  function update() {
    DB.saveTasks(user.username, tasks);
    render();
  }

  // Return the tasks that match the active filter, sorted by due date
  function getVisibleTasks() {
    return tasks
      .filter(function (t) {
        if (activeFilter === "pending") return !t.done;
        if (activeFilter === "done") return t.done;
        return true;
      })
      .sort(function (a, b) {
        return a.due.localeCompare(b.due);   // earliest deadline first
      });
  }

  // Redraw the list from the array
  function render() {
    const today = todayString();
    const visible = getVisibleTasks();
    listEl.innerHTML = "";

    for (let i = 0; i < visible.length; i++) {
      const t = visible[i];
      const isLate = !t.done && t.due < today;

      const row = document.createElement("li");
      row.className = "task" + (t.done ? " done" : "") + (isLate ? " late" : "");
      row.dataset.id = t.id;
      row.dataset.priority = t.priority;

      // Static structure first...
      row.innerHTML =
        '<input type="checkbox" aria-label="Mark as done">' +
        '<div class="task-info">' +
          '<span class="task-title"></span>' +
          '<span class="task-meta"></span>' +
        '</div>' +
        '<button type="button" class="task-delete">Delete</button>';

      // ...then the user's text through textContent (safe from HTML injection)
      row.querySelector("input").checked = t.done;
      row.querySelector(".task-title").textContent = t.title;
      row.querySelector(".task-meta").textContent =
        t.subject + " | Due " + t.due + " | " + t.priority +
        (isLate ? " | OVERDUE" : "");

      listEl.appendChild(row);
    }

    // Empty message
    emptyEl.hidden = visible.length > 0;
    emptyEl.textContent = tasks.length === 0
      ? "No tasks yet. Add your first one!"
      : "No tasks in this filter.";

    // Stat cards
    document.getElementById("statTotal").textContent = tasks.length;
    document.getElementById("statDone").textContent =
      tasks.filter(function (t) { return t.done; }).length;
    document.getElementById("statLate").textContent =
      tasks.filter(function (t) { return !t.done && t.due < today; }).length;
  }

  // First draw
  render();
}