export function likesFunction() {
    const IS_VIEW_ONLY = document.body.dataset.viewOnly === 'true';
    console.log("is view only?", IS_VIEW_ONLY)
    if (!IS_VIEW_ONLY) {
            console.log("Do i come to the likesFunction.js?")
    
            var posts = document.querySelectorAll('.post');
            posts.forEach(function(post) {
                var likeButton = post.querySelector('.likeButton');
                var dislikeButton = post.querySelector('.dislikeButton');
                var postID = parseInt(likeButton.getAttribute('data-post-id')); // assuming both buttons have same data-post-id
                var userID = likeButton.getAttribute('data-user-id'); // assuming both buttons have same data-user-id
        
                // Add event listener to the like button.
                likeButton.addEventListener('click', function() {
                    console.log("I gave like")
                    // Send a request to the server indicating a "like" was clicked.
                    fetch('/like', {
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
                dislikeButton.addEventListener('click', function() {
                    // Send a request to the server indicating a "dislike" was clicked.
                    console.log("i gave dislike ")
                    fetch('/dislike', {
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
                    console.log("update likesDislikes")
                    document.getElementById(`likeCount${postID}`).innerText = data.likesCount;
                    document.getElementById(`dislikeCount${postID}`).innerText = data.dislikesCount;
                }
            });
        
      }
    
}