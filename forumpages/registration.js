// window.onload = function () {
//     loadRegistrationForm();
// }

var data = null

export async function loadRegistrationForm() {
    var appDiv = document.getElementById('app');
    var registrationForm = `
    <h1 class="text-2xl font-bold mb-8 text-center">Registration Form</h1>
    <form action="/register" method="post" class="space-y-4">
        <div>
            <label for="username" class="block text-sm font-semibold mb-2">Username:</label>
            <input type="text" id="username" name="username" required class="block w-full p-2 border rounded-md" placeholder="Username">
        </div>
        <div>
            <label for="password" class="block text-sm font-semibold mb-2">Password:</label>
            <input type="password" id="password" name="password" required class="block w-full p-2 border rounded-md" placeholder="Password">
        </div>
        <div>
            <label for="email" class="block text-sm font-semibold mb-2">Email:</label>
            <input type="email" id="email" name="email" required class="block w-full p-2 border rounded-md" placeholder="Email">
        </div>
        <div>
            <input type ="checkbox" id = "checkbox" name = "checkbox" >
            <label for ="checkbox"> Apply for moderator user</label>
        </div>
        <div>
            <input type="submit" value="Register" class="block w-full p-2 text-white bg-blue-600 rounded-md cursor-pointer">
        </div>
    </form>
    <h2 class="text-2xl font-bold my-8 text-center">Log in Form</h2>
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
    regForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        var formData = new FormData(regForm);
        var object = {};
        formData.forEach(function(value, key) {
            object[key] = value;
        });
        var json = JSON.stringify(object);
    
        console.log(json, "this is form data in JSON");
    
        // send AJAX request
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: json
            });
    
            const data = await response.json();
    
            if (data.Success) {
                loadPage('registered');
            } else {
                alert(data.Message);
            }
        } catch (error) {
            console.error('There was an error with the registration', error);
        }
    });
    var loginForm = document.querySelector('form[action="/login"]')
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log("come here?")
        try {
            await loginHandler();
        } catch (error) {
            console.error('Error during login', error);
        }
    });
    
  
}

export async function loginHandler() {
    let username = document.getElementById('login-username').value;
    let password = document.getElementById('login-password').value;
    console.log(username, password,"it was username and password")
    try {
        console.log(username, password,"it was username and password")

        const response = await fetch('/login', {
            
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'login-username': username,
                'login-password': password
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        data = await response.json();
        console.log(data," this is the data");
        console.log(data.Username, "this is username")
        loadPage('login');
    } catch (error) {
        console.error('There was an error fetching the login data', error);
    }
}

export async function fetchDataFromServer() {
    try {
        const response = await fetch('/homepage', {
            
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        data = await response.json();
        console.log(data," this is the data");
        console.log(data.Username, "this is username")
        loadPage('login');
    } catch (error) {
        console.error('There was an error fetching the login data', error);
    }
    return data
}

export { data };
