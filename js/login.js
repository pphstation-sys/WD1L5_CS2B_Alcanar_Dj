// login.js - handles the Login form

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("message");

// Show or hide the password when the checkbox changes
document.getElementById("togglePassword").addEventListener("change", function () {
  document.getElementById("password").type = this.checked ? "text" : "password";
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === "" || password === "") {
    showMessage(loginMessage, "Please enter your username and password.", "error");
    return;
  }

  // Look up the user, then compare the password
  const user = DB.findUser(username);

  if (user && user.password === password) {
    DB.setSession(user.username);            // remember who logged in
    window.location.href = "planner.html";   // go to the list page
  } else {
    showMessage(loginMessage, "Wrong username or password.", "error");
  }
});