// register.js - handles the Register form

const form = document.getElementById("registerForm");
const messageBox = document.getElementById("message");

// The fields to check. A loop uses this array so the checking code is not repeated.
const requiredFields = [
  { id: "fullName", label: "Full name" },
  { id: "username", label: "Username" },
  { id: "email", label: "Email" },
  { id: "password", label: "Password" },
  { id: "confirmPassword", label: "Confirm password" }
];

form.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the page from reloading

  // STEP 1: read all inputs into one object
  const data = {};
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    const value = document.getElementById(field.id).value;
    // Passwords keep their spaces, other fields are trimmed
    data[field.id] = field.id.includes("assword") ? value : value.trim();

    // STEP 2: no empty fields allowed
    if (data[field.id] === "") {
      showMessage(messageBox, field.label + " is required.", "error");
      return;
    }
  }

  // STEP 3: other validations
  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    showMessage(messageBox, "Please enter a valid email address.", "error");
    return;
  }

  if (data.password.length < 6) {
    showMessage(messageBox, "Password must be at least 6 characters.", "error");
    return;
  }

  if (data.password !== data.confirmPassword) {
    showMessage(messageBox, "Passwords do not match.", "error");
    return;
  }

  if (DB.findUser(data.username)) {
    showMessage(messageBox, "That username is already taken.", "error");
    return;
  }

  // STEP 4: build the user object (confirmPassword is not saved) and store it
  const users = DB.getUsers();
  users.push({
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    password: data.password
  });
  DB.saveUsers(users);

  // STEP 5: success message, then go to the login page
  showMessage(messageBox, "Account created! Redirecting to login...", "success");
  setTimeout(function () {
    window.location.href = "login.html";
  }, 1200);
});