export function displayComments() {
    // Your code for setting up comment toggling
    document.addEventListener('click', function(event) {
        // Check if the clicked element has the .comments-toggler class
        console.log("Display comments!")
        if (event.target.classList.contains('comments-toggler')) {
            console.log("Here i display comment")
            const postId = event.target.dataset.postId;
            const commentsDiv = document.getElementById(`comments${postId}`);
            if (commentsDiv) {
                console.log("Here i really display comment")
                commentsDiv.style.display = commentsDiv.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
}


// export function displayComments() {
//     document.addEventListener('DOMContentLoaded', (event) => {
//         console.log("Do i come to the displaycomments.js?")
    
//         document.querySelectorAll('.comments-toggler').forEach(item => {
//             item.addEventListener('click', event => {
//                 const postId = event.target.getAttribute('data-post-id');
//                 const commentsDiv = document.querySelector(`#comments${postId}`);
//                 if (commentsDiv.style.display === "none") {
//                     commentsDiv.style.display = "block";
//                 } else {
//                     commentsDiv.style.display = "none";
//                 }
//             })
//         })
//     });
// }