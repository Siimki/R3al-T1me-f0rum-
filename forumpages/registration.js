import { RegistrationComplete } from "./registered.js";

var data = null;

export async function loadRegistrationForm() {
  var appDiv = document.getElementById("app");
  var registrationForm = `
    <h1 class="text-2xl font-bold mb-8 text-center">Registration Form</h1>
    <form action="/register" method="post" class="space-y-4">
    <div>
        <label for="username" class="block text-sm font-semibold mb-2">Nickname:</label>
        <input type="text" id="username" name="username" required class="block w-full p-2 border rounded-md" placeholder="Username">
    </div>
    <div>
        <label for="password" class="block text-sm font-semibold mb-2">Password:</label>
        <input type="password" id="password" name="password" required class="block w-full p-2 border rounded-md" placeholder="Password">
    </div>

    <div class="flex justify-between space-x-4">
        <div class="flex-1">
            <label for="first_name" class="block text-sm font-semibold mb-2">First name:</label>
            <input type="text" id="first_name" name="first_name" required class="block w-full p-2 border rounded-md" placeholder="First Name">
        </div>
        <div class="flex-1">
            <label for="last_name" class="block text-sm font-semibold mb-2">Last name:</label>
            <input type="text" id="last_name" name="last_name" required class="block w-full p-2 border rounded-md" placeholder="Last Name">
        </div>
    </div>

    <div class="flex justify-between space-x-4">
        <div class="flex-1">
            <label for="email" class="block text-sm font-semibold mb-2">Email:</label>
            <input type="email" id="email" name="email" required class="block w-full p-2 border rounded-md" placeholder="Email">
        </div>
        <div class="flex-1">
            <label for="age" class="block text-sm font-semibold mb-2">Age:</label>
            <input type="number" id="age" name="age" required class="block w-full p-2 border rounded-md" placeholder="Age">
        </div>
    </div>

    <div>
    <span class="block text-sm font-semibold mb-2">Gender:</span>
    <div class="flex items-center mb-2">
        <input type="radio" id="male" name="gender" value="male" required class="mr-2">
        <label for="male" class="mr-2">Male</label>

        <input type="radio" id="female" name="gender" value="female" required class="mr-2">
        <label for="female">Female</label>
    </div>
    </div>
    

    <div>
        <input type="submit" value="Register" class="block w-full p-2 text-white bg-blue-600 rounded-md cursor-pointer">
    </div>

    </form>

    <h2 class="text-2xl font-bold my-8 text-center">Login Form</h2>
    <form action="/login" method="post" class="space-y-4">
        <div class= "text-center" id="error-message" style="display: none;"></div>
        <div>
            <label for="login-username" class="block text-sm font-semibold mb-2">Username:</label>
            <input type="text" id="login-username" name="login-username" required class="block w-full p-2 border rounded-md" placeholder="Username">
        </div>
        <div>
            <label for="login-password" class="block text-sm font-semibold mb-2">Password:</label>
            <input type="password" id="login-password" name="login-password" required class="block w-full p-2 border rounded-md" placeholder="Password">
        </div>
        <div>
            <input type="submit" value="Login" class="block w-full p-2 text-white bg-blue-600 rounded-md cursor-pointer">
        </div>
    </form>
    `;

  appDiv.innerHTML = registrationForm;

  var regForm = document.querySelector('form[action="/register"]');
  regForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    var formData = new FormData(regForm);
    var object = {};
    formData.forEach(function (value, key) {
      object[key] = value;
    });
    var json = JSON.stringify(object);

    // send AJAX request
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: json,
      });

      const data = await response.json();

      if (data.Success) {
        loadPage("registered");
      } else {
        alert(data.Message);
        RegistrationComplete();
      }
    } catch (error) {
      console.error("There was an error with the registration", error);
    }
  });

  var loginForm = document.querySelector('form[action="/login"]');

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      await loginHandler();
    } catch (error) {
      console.error("Error during login", error);
    }
    document.getElementById("error-message").style.display = "block";
    document.getElementById("error-message").innerText =
      "Invalid Username or Password";
  });
}

export async function loginHandler() {
  let username = document.getElementById("login-username").value;
  let password = document.getElementById("login-password").value;
  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "login-username": username,
        "login-password": password,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    data = await response.json();

    window.location.hash = "#login";
  } catch (error) {
    console.error("There was an error fetching the login data", error);
  }
}

export async function fetchDataFromServer() {
  try {
    const response = await fetch("/homepage", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    data = await response.json();

    window.location.hash = "#login";
  } catch (error) {
    console.error("There was an error fetching the login data", error);
    window.location.hash = "#registration";
  }
  return data;
}

export { data };
