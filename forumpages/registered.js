export function RegistrationComplete() {
 
    var appDiv = document.getElementById('app');

    var content;

        content = `
        <div class="flex bg-gray-100"></div>
        <p class="flex place-items-center font-extrabold text-3xl justify-center p-10">You have created an account!</p>
        `;
    
    appDiv.innerHTML = content;
    console.log("do i get called_")
    setTimeout(function() {
        window.location.href = '/';
    }, 1000);
    
}
