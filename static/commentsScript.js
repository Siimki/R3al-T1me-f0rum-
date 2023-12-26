export function commentsScript() {
        var posts = document.querySelectorAll('.comment');
        posts.forEach(function(post) {
            var commentlikeButton = post.querySelector('.commentlikeButton');
            var commentdislikeButton = post.querySelector('.commentdislikeButton');
            var postID = parseInt(commentlikeButton.getAttribute('data-comment-id'));
            var userID = commentlikeButton.getAttribute('data-user-id'); 
    
            commentlikeButton.addEventListener('click', function() {
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
                .then(updateLikesDislikes) 
                .catch(handleError);
            });
    
            commentdislikeButton.addEventListener('click', function() {
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
                document.getElementById(`commentlikeCount${postID}`).innerText = data.likesCount;
                document.getElementById(`commentdislikeCount${postID}`).innerText = data.dislikesCount;
            }
        });
    
}