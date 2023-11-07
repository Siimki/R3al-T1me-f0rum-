export function commentsScript() {
        console.log("Do i come to the commentsScript.js?")
        var posts = document.querySelectorAll('.comment');
        posts.forEach(function(post) {
            var commentlikeButton = post.querySelector('.commentlikeButton');
            var commentdislikeButton = post.querySelector('.commentdislikeButton');
            var postID = parseInt(commentlikeButton.getAttribute('data-comment-id')); // assuming both buttons have same data-post-id
            var userID = commentlikeButton.getAttribute('data-user-id'); // assuming both buttons have same data-user-id
    
            // Add event listener to the like button.
            commentlikeButton.addEventListener('click', function() {
                // Send a request to the server indicating a "like" was clicked.
                fetch('/commentlike', {

                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',

                    },

                    body: JSON.stringify({
                        postID: postID,
                        username: userID,
                    }),

                })
                .then(handleResponse)
                .then(updateLikesDislikes) // Add this line
                .catch(handleError);
            });
    
            // Add event listener to the dislike button.
            commentdislikeButton.addEventListener('click', function() {
                // Send a request to the server indicating a "dislike" was clicked.
                fetch('/commentdislike', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        postID: postID,
                        username: userID,
                    }),
                })
                .then(handleResponse)
                .then(updateLikesDislikes) // Add this line
                .catch(handleError);
            });
    
            function handleResponse(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }
    
            function handleError(error) {
                console.error('There has been a problem with your fetch operation:', error);
            }
    
            function updateLikesDislikes(data) {
                document.getElementById(`commentlikeCount${postID}`).innerText = data.likesCount;
                document.getElementById(`commentdislikeCount${postID}`).innerText = data.dislikesCount;
            }
        });
    
}