export function logout() {
 
    var appDiv = document.getElementById('app');

    var content;

        content = `
        <div class = "flex bg-gray-100" ></div>
        <p class="flex place-items-center font-extrabold text-3xl justify-center p-10">You have been logged out of Forum!</p>
                `;
    
    appDiv.innerHTML = content;
    setTimeout(function() {
        window.location.href = '/';
    }, 1000);
    
}
