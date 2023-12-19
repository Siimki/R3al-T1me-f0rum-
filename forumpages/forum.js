// Define your routes
const routes = {
  "#registration": "../forumpages/registration.js",
  "#registered": "../forumpages/registered.js",
  "#login": "../forumpages/mainpage.js",
  "#addcomment": "../forumpages/addcomment.js",
  "#createpost": "../forumpages/createpost.js"
};

// Load the page based on the current hash
function loadPageFromHash() {
  const hash = window.location.hash || "#registration"; // Default to registration page
  const pageModule = routes[hash];

  if (pageModule) {
    import(pageModule).then((module) => {
      switch (hash) {
        case "#registration":
          module.loadRegistrationForm();
          break;
        case "#registered":
          module.registrationComplete();
          break;
        case "#login":
          module.mainPage();
          break;
        case "#addcomment":
          module.addCommentForm();
          break;
        case "#createpost":
          module.createPost();
          break;
        case "#logout":
          module.logout();
          break;
        // ... other cases ...
      }
      // Update the last active page in localStorage
      localStorage.setItem("lastActivePage", hash);
    });
  } else {
    console.error("Page module not found for hash:", hash);
  }
}

// Event listener for hash change
window.addEventListener("hashchange", loadPageFromHash);

// Load the page when the application starts
window.addEventListener("load", loadPageFromHash);