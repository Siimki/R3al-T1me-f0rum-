window.addEventListener('load', function() {
    let lastPage = localStorage.getItem('lastActivePage') || 'registration';
    console.log("LastPage is:", lastPage)
    loadPage('registration');
});


 function loadPage(pageName) {

    localStorage.setItem('lastActivePage', pageName);

    switch(pageName) {
        case 'registration':
            import('../forumpages/registration.js').then(module => {
                 module.loadRegistrationForm();
            });
            console.log("registration")
            break;
        case 'registered':
            import('../forumpages/registered.js').then(module => {
                module.registrationComplete();
            });
            console.log("registration2")

            break;
        case 'login':
            import('../forumpages/mainpage.js').then(module => {
                console.log("It is case login in loadpage")
                module.mainPage();
            });
           break;
        default:
            console.log('Page not found');
    }
}