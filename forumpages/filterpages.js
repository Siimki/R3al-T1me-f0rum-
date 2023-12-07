import { mainPage } from "./mainpage.js";

export function fetchFilteredPosts(categories) {
    console.log("[start fetch]")
    fetch('/filterpage', {
        method: 'POST', // or GET with query parameters
        body: JSON.stringify({ categories: categories }),
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
