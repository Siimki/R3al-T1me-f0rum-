export function likesFunction() {
    const IS_VIEW_ONLY = document.body.dataset.viewOnly === 'true';
    if (!IS_VIEW_ONLY) {
            var posts = document.querySelectorAll('.post');
            posts.forEach(function(post) {
                var likeButton = post.querySelector('.likeButton');
                var dislikeButton = post.querySelector('.dislikeButton');
                var postID = parseInt(likeButton.getAttribute('data-post-id')); // assuming both buttons have same data-post-id
                var userID = likeButton.getAttribute('data-user-id'); // assuming both buttons have same data-user-id
        
                likeButton.addEventListener('click', function() {
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
                    .then(updateLikesDislikes) 
                    .catch(handleError);
                });
        
                dislikeButton.addEventListener('click', function() {
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
                    .then(updateLikesDislikes) 
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
                    document.getElementById(`likeCount${postID}`).innerText = data.likesCount;
                    document.getElementById(`dislikeCount${postID}`).innerText = data.dislikesCount;
                }
            });
        
      }
    
}