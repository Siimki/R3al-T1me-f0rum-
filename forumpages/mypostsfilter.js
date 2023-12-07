import { mainPage } from "./mainpage.js";

export function fetchMyPosts(myposts) {
    console.log("[start fetch]")
    fetch('/myposts', {
        method: 'POST', // or GET with query parameters
        body: JSON.stringify({ myposts: myposts }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        mainPage(data); // Call mainPage with the filtered data
    })
    .catch(error => console.error('Error:', error));
}
