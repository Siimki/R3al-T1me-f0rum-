document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.comments-toggler').forEach(item => {
        item.addEventListener('click', event => {
            const postId = event.target.getAttribute('data-post-id');
            const commentsDiv = document.querySelector(`#comments${postId}`);
            if (commentsDiv.style.display === "none") {
                commentsDiv.style.display = "block";
            } else {
                commentsDiv.style.display = "none";
            }
        })
    })
});