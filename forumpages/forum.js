window.addEventListener("load", function () {
  let lastPage = localStorage.getItem("lastActivePage") || "registration";
  console.log("LastPage is:", lastPage);
  if (lastPage == "registered") {
    loadPage("registration");
  } else {
    loadPage("addcomment");
  }
});

function loadPage(pageName) {
  //if cookie is not exist always go to registration page
  localStorage.setItem("lastActivePage", pageName);

  switch (pageName) {
    case "registration":
      import("../forumpages/registration.js").then((module) => {
        module.loadRegistrationForm();
      });
      console.log("registration");
      break;
    case "registered":
      import("../forumpages/registered.js").then((module) => {
        module.registrationComplete();
      });
      console.log("registration2");

      break;
    case "login":
      import("../forumpages/mainpage.js").then((module) => {
        console.log("It is case login in loadpage");
        module.mainPage();
      });
      break;
    case "addcomment":
      import("../forumpages/addcomment.js").then((module) => {
        console.log("It is case COMMENT in loadpage");
        module.addCommentForm();
      });
      break;
    default:
      import("../forumpages/registration.js").then((module) => {
        module.loadRegistrationForm();
      });
      console.log("Page not found");
  }
}
