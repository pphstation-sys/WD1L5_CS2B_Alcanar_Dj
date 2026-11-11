// storage.js - shared helpers, loaded BEFORE the other scripts.
// All localStorage / sessionStorage access is kept in this one object.

const DB = {
  // Storage keys
  USERS_KEY: "sp_users",           // localStorage: array of user objects
  SESSION_KEY: "sp_session",       // sessionStorage: username of the logged-in user
  TASKS_PREFIX: "sp_tasks_",       // localStorage: "sp_tasks_<username>" -> array of tasks

  // ----- Users -----
  getUsers: function () {
    return readJSON(this.USERS_KEY, []);
  },

  saveUsers: function (users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  // Find a user by username (not case-sensitive). Returns undefined if none.
  findUser: function (username) {
    return this.getUsers().find(function (u) {
      return u.username.toLowerCase() === username.toLowerCase();
    });
  },

  // ----- Session (who is logged in) -----
  setSession: function (username) {
    sessionStorage.setItem(this.SESSION_KEY, username);
  },

  clearSession: function () {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  // Returns the logged-in user object, or null
  currentUser: function () {
    const username = sessionStorage.getItem(this.SESSION_KEY);
    return username ? this.findUser(username) || null : null;
  },

  // ----- Tasks (each user has their own array) -----
  getTasks: function (username) {
    return readJSON(this.TASKS_PREFIX + username, []);
  },

  saveTasks: function (username, tasks) {
    localStorage.setItem(this.TASKS_PREFIX + username, JSON.stringify(tasks));
  }
};

// Reads and parses JSON from localStorage. Returns the fallback if empty or corrupted.
function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

// Writes a message into an element. type = "error" or "success".
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}