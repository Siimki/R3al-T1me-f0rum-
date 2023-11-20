// var addcomment = true 

// window.addEventListener("load", function () {
//   let lastPage = localStorage.getItem("lastActivePage") || "registration";
//   console.log("LastPage is:", lastPage, addcomment);
//   if (lastPage == "registered") {
//     loadPage("registration");
//     console.log("Log line 6")
//   } else if (addcomment){
//     addcomment = false
//     console.log("log line 12", addcomment)
    
//     loadPage("addcomment");
//   }
// });

// function loadPage(pageName) {
//   //if cookie is not exist always go to registration page
//   localStorage.setItem("lastActivePage", "registration");

//   switch (pageName) {
//     case "registration":
//       import("../forumpages/registration.js").then((module) => {
//         module.loadRegistrationForm();
//       });
//       console.log("registration");
//       break;
//     case "registered":
//       import("../forumpages/registered.js").then((module) => {
//         module.registrationComplete();
//       });
//       console.log("registration2");

//       break;
//     case "login":
//       import("../forumpages/mainpage.js").then((module) => {
//         console.log("It is case login in loadpage");
//         module.mainPage();
//       });
//       break;
//     case "addcomment":
//       import("../forumpages/addcomment.js").then((module) => {
//         console.log("It is case COMMENT in loadpage");
//         module.addCommentForm();
//       });
//       break;
//     default:
//       import("../forumpages/registration.js").then((module) => {
//         module.loadRegistrationForm();
//       });
//       console.log("Page not found");
//   }
// }

// Define your routes
const routes = {
  "#registration": "../forumpages/registration.js",
  "#registered": "../forumpages/registered.js",
  "#login": "../forumpages/mainpage.js",
  "#addcomment": "../forumpages/addcomment.js",
};

// Load the page based on the current hash
function loadPageFromHash() {
  const hash = window.location.hash || "#registration"; // Default to registration page
  const pageModule = routes[hash];
  console.log("Calling loadPageFromHash")

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