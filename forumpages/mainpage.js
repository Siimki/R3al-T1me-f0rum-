// window.onload = async function () {
       
// }

import { data, fetchDataFromServer, loginHandler} from './registration.js'
import { displayComments } from '/static/displayComments.js';
import { changeColor } from '/static/changeColor.js'; // Replace 'function1' with the actual function name
import { commentsScript } from '/static/commentsScript.js'; // Replace 'function2' with the actual function name
import { likesFunction } from '/static/likesFunction.js'; // Replace 'function3' with the actual function name



export async function mainPage() {
    if (!data) {
        console.log("data not exist, start fetch")
        data = fetchDataFromServer()
    }
    
    const body = document.getElementById('body');
    body.className = 'bg-gray-100';
  console.log("This is ducked")
  const appDiv = document.getElementById('app');
        appDiv.className = ''
  // Clear the content of appDiv
  appDiv.innerHTML = '';

  // Create the Welcome header
  const welcomeHeader = document.createElement('h1');
  welcomeHeader.className = 'text-3xl font-bold text-center pt-8';
  welcomeHeader.textContent = `Welcome ${data.Username}!`;
  appDiv.appendChild(welcomeHeader);

  // Create the Forum description
  const forumDescription = document.createElement('p');
  forumDescription.className = 'text-2xl text-center p-6';
  forumDescription.textContent = 'Forum to search for playmates!';
  appDiv.appendChild(forumDescription);

  // Create the button div
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'flex justify-center p-2 font-bold';

  // Create form and button elements
  // Note: For brevity, I'm just doing one button. You can repeat similar logic for all buttons.
  const createPostForm = document.createElement('form');
  createPostForm.action = '/createpost';
  createPostForm.method = 'post';

  const createPostBtn = document.createElement('button');
  createPostBtn.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500';
  createPostBtn.type = 'submit';
  createPostBtn.textContent = 'Create Post';

  createPostForm.appendChild(createPostBtn);
  buttonDiv.appendChild(createPostForm);
  appDiv.appendChild(buttonDiv);

  // Assuming 'appDiv' is the parent element where you want to append your forms
// and 'buttonDiv' is the div where all buttons will be placed.

// My Posts form and button
const myPostsForm = document.createElement('form');
myPostsForm.action = '/myposts';
myPostsForm.method = 'post';

const myPostsBtn = document.createElement('button');
myPostsBtn.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500';
myPostsBtn.type = 'submit';
myPostsBtn.value = 'myposts';
myPostsBtn.name = 'myposts';
myPostsBtn.textContent = 'My posts';

myPostsForm.appendChild(myPostsBtn);
buttonDiv.appendChild(myPostsForm);

// My Liked Posts form and button
const myLikedPostsForm = document.createElement('form');
myLikedPostsForm.action = '/myposts';
myLikedPostsForm.method = 'post';

const myLikedPostsBtn = document.createElement('button');
myLikedPostsBtn.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500';
myLikedPostsBtn.type = 'submit';
myLikedPostsBtn.value = 'mylikedposts';
myLikedPostsBtn.name = 'myposts';
myLikedPostsBtn.textContent = 'My liked posts';

myLikedPostsForm.appendChild(myLikedPostsBtn);
buttonDiv.appendChild(myLikedPostsForm);

// Show All Posts button
const showAllPostsBtn = document.createElement('button');
showAllPostsBtn.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500';
showAllPostsBtn.onclick = function() {
  window.location.href = 'http://localhost:8080/homepage.html';
};
showAllPostsBtn.textContent = 'Show all posts';

buttonDiv.appendChild(showAllPostsBtn);

// Logout form and input/button
const logoutForm = document.createElement('form');
logoutForm.action = '/logout';
logoutForm.method = 'post';

const logoutBtn = document.createElement('input');
logoutBtn.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500';
logoutBtn.type = 'submit';
logoutBtn.id = 'log-out';
logoutBtn.name = 'log-out';
logoutBtn.value = 'Log out';

logoutForm.appendChild(logoutBtn);
buttonDiv.appendChild(logoutForm);

// Finally, append the buttonDiv to the appDiv
appDiv.appendChild(buttonDiv);


  // Add the rest of the buttons and elements in a similar manner

  // Role-based logic
  if (data.Role === 'admin') {
      const moderationLink = document.createElement('a');
      moderationLink.href = '/admin';
      moderationLink.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500 inline-block text-center';
      moderationLink.textContent = 'Moderation';
      buttonDiv.appendChild(moderationLink);

      if (data.ModerationRequests && data.ModerationRequests.length > 0) {
          const notificationSpan = document.createElement('span');
          notificationSpan.className = 'inline-block bg-red-500 text-white text-xs px-1 pt-1 pb-0.5 rounded-full uppercase font-semibold tracking-wide';
          notificationSpan.textContent = data.ModerationRequests.length.toString();
          moderationLink.appendChild(notificationSpan);
      }
  } else if (data.Role === 'moderator') {
    const smallModeratorLink = document.createElement('a');
    smallModeratorLink.href = '/report';
    smallModeratorLink.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500 inline-block text-center';
    smallModeratorLink.textContent = 'Reported posts'
    buttonDiv.appendChild(smallModeratorLink)
        if (data.ReportedRequests > 0){
            const notificationSpan = document.createElement('span');
            notificationSpan.className = 'inline-block bg-red-500 text-white text-xs px-1 pt-1 pb-0.5 rounded-full uppercase font-semibold tracking-wide';
            notificationSpan.textContent = data.ModerationRequests.length.toString();
            moderationLink.appendChild(notificationSpan);
        }
} 
//filteredPosts form 
// Create the filtered posts form
const filteredPostsForm = document.createElement('form');
filteredPostsForm.action = '/filterpage';
filteredPostsForm.method = 'post';

// Create the container div for the checkboxes and button
const filterContainerDiv = document.createElement('div');
filterContainerDiv.className = 'flex justify-center bg-pink-300';

// Create and append checkboxes with labels
const games = [
  { id: 'league', name: 'league', value: '1', text: 'League' },
  { id: 'runescape', name: 'runescape', value: '2', text: 'Runescape' },
  { id: 'counter-strike', name: 'counter-strike', value: '3', text: 'Counter-Strike' }
];

games.forEach(game => {
  const label = document.createElement('label');
  label.className = 'bg-blue-300 hover:bg-blue-400 checked:bg-blue-500 border rounded p-2 m-1 transition duration-500 shadow-lg';
  label.id = `checkboxDiv${game.value}`;
  label.style.cursor = 'pointer';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = game.id;
  input.name = game.name;
  input.value = game.value;
  input.style.visibility = 'hidden';
  input.style.position = 'absolute';
  input.onchange = function() { changeColor(this, `checkboxDiv${game.value}`); };

  label.appendChild(input);
  label.append(game.text);
  filterContainerDiv.appendChild(label);
});

// Create and append the submit button
const submitBtn = document.createElement('button');
submitBtn.className = 'font-bold bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500 ml-4';
submitBtn.type = 'submit';
submitBtn.textContent = 'Apply filter';

// Append the button to the container div
filterContainerDiv.appendChild(submitBtn);

// Append the container div to the form
filteredPostsForm.appendChild(filterContainerDiv);

// Assuming 'appDiv' is the parent element where you want to append your form
appDiv.appendChild(filteredPostsForm);


  // ... Add other form and checkbox elements ...
console.log("do i arrive to the data.posts?")
  // Posts loop
  data.Posts.forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post';

      const innerPostDiv = document.createElement('div')
      innerPostDiv.className = 'flex flex-col p-6 bg-gray-200 mb-4 rounded'
      innerPostDiv.style = 'max-width: 800px; margin: 1rem auto;'
      //postDiv.appendChild(innerPostDiv)
        const innerPostDiv2 = document.createElement('div')
        innerPostDiv2.className = 'bg-gray-300'
        innerPostDiv.appendChild(innerPostDiv2)
            const postContent = document.createElement('p')
            postContent.className = 'm-5'
            postContent.textContent = post.Content
            innerPostDiv2.appendChild(postContent)
        const postAttributes = document.createElement('p')
        postAttributes.className = 'my-5 mx-5'
        postAttributes.textContent = 'Post by'
            const usernamePostAttributes = document.createElement('p')
            usernamePostAttributes.className = 'font-bold'
            usernamePostAttributes.textContent = post.Username
            postAttributes.appendChild(usernamePostAttributes)
            const usernamePostAttributes2 = document.createElement('p')
            usernamePostAttributes2.textContent = post.PostedAgo
            postAttributes.appendChild(usernamePostAttributes2)
        innerPostDiv2.appendChild(postAttributes)
        const flexBox = document.createElement('div');
        flexBox.className = 'flex';

        // Like Button
        const likeButton = document.createElement('button');
        likeButton.className = 'likeButton mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded m-3';
        likeButton.dataset.postId = post.ID;
        likeButton.dataset.userId = post.Username; // Assuming you have the username in post.Username
        likeButton.innerHTML = `👍 Like <span id="likeCount${post.ID}">${post.Likes}</span>`;
        flexBox.appendChild(likeButton);

        // Dislike Button
        const dislikeButton = document.createElement('button');
        dislikeButton.className = 'dislikeButton mr-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded m-3';
        dislikeButton.dataset.postId = post.ID;
        dislikeButton.dataset.userId = post.Username; // Assuming you have the username in post.Username
        dislikeButton.innerHTML = `👎 Dislike <span id="dislikeCount${post.ID}">${post.Dislikes}</span>`;
        flexBox.appendChild(dislikeButton);

        // Comments Toggle Button
        const commentsToggleDiv = document.createElement('div');
        commentsToggleDiv.className = 'flex ml-auto bg-blue-300 hover:bg-blue-400 border rounded m-2 px-2 transition duration-500';

        const commentsToggleButton = document.createElement('button');
        commentsToggleButton.className = 'comments-toggler';
        commentsToggleButton.dataset.postId = post.ID;
        // Check if CommentCount is available and add it to the button text
        commentsToggleButton.textContent = post.CommentCount ? `Load comments (${post.CommentCount})` : 'Load comments';
        commentsToggleDiv.appendChild(commentsToggleButton);

        flexBox.appendChild(commentsToggleDiv);

        // Append flexBox to the innerPostDiv or where you want it to appear
        innerPostDiv2.appendChild(flexBox);
        
        //append comments
        const commentsSection = document.createElement('div')
        commentsSection.id = 'comments' + post.ID 
        commentsSection.className = 'comments'
        commentsSection.style.display = 'none'
            //append text
            const commentSectionText = document.createElement('p')
            commentSectionText.textContent = 'Comment section 💬'
            //range comments
            console.log(post.Comments)
            if (post.Comments) {
            post.Comments.forEach(comment =>{
                console.log(comment)
                const commentDiv = document.createElement('div')
                commentDiv.className = 'comment border rounded my-1 ml-24'
                    const commentInnerDiv = document.createElement('div')
                    commentInnerDiv.className = "flex flex-col p-2 bg-gray-300 mb-4 mx-8 rounded"
                        const commentContent = document.createElement('p')
                        commentContent.className = 'm-2'
                        commentContent.textContent = comment.Content
                        const commentAttributes = document.createElement('p')
                        commentAttributes.className = 'my-5 mx-2'
                        commentAttributes.textContent = 'Post by:'
                            const commentUsername = document.createElement('span')
                            commentUsername.className = "font-bold"
                            commentUsername.textContent = comment.Username
                            const commentPostedAgo = document.createElement('span')
                            commentPostedAgo.textContent = comment.PostedAgo
                        commentAttributes.appendChild(commentUsername)
                        commentAttributes.appendChild(commentPostedAgo)
                    commentInnerDiv.appendChild(commentContent)
                    commentInnerDiv.appendChild(commentAttributes)
                        const commentFlexBox = document.createElement('div')
                        commentFlexBox.class = 'flex'
                            const commentLikeButton = document.createElement('button')
                            commentLikeButton.className = 'commentlikeButton mr-2 bg-blue-500 hover:bg-blue-700 text-white py-2 px-2 rounded'
                            commentLikeButton.dataset.commentId = comment.ID;
                            //check here
                            commentLikeButton.dataset.userId = comment.Username;
                            commentLikeButton.innerHTML = `👍 <span id="commentlikeCount${comment.ID}">${comment.Likes}</span>`;

                        commentFlexBox.appendChild(commentLikeButton)
                            const commentDisLikeButton = document.createElement('button')  
                            commentDisLikeButton.className = 'commentdislikeButton mr-2 bg-red-500 hover:bg-red-700 text-white py-1.5 px-1.5 rounded'
                            commentDisLikeButton.dataset.commentId = comment.ID;
                            commentDisLikeButton.dataset.userId = comment.Username;
                            commentDisLikeButton.innerHTML = `👎 <span id="commentdislikeCount${comment.ID}">${comment.Dislikes}</span>`
                        commentFlexBox.appendChild(commentDisLikeButton)
                        
                            
                    commentInnerDiv.appendChild(commentFlexBox)
                commentDiv.appendChild(commentInnerDiv)
             commentsSection.appendChild(commentDiv);
             //   innerPostDiv.appendChild(commentDiv)

            })
        }
            innerPostDiv.appendChild(commentsSection)

            // i am not entirely sure where i put this line
        // innerPostDiv.appendChild(commentDiv)
            const addCommentForm = document.createElement('form')
            addCommentForm.method = 'post'
            addCommentForm.action = '/addcomment'
            // const randomDiv = document.createElement('div')
            // randomDiv.className = 'flex justify-between'
                const inputAddComment = document.createElement('input')
                inputAddComment.type = 'hidden'
                inputAddComment.name = 'id'
                inputAddComment.value = post.ID
                addCommentForm.appendChild(inputAddComment)
                const inputAddComment2 = document.createElement('input')
                inputAddComment2.type = 'submit'
                inputAddComment2.value = 'Comment'
                inputAddComment2.className = 'submit-button bg-gray-300 hover:bg-gray-400 text-black p-2 mt-4 rounded'
                addCommentForm.appendChild(inputAddComment2)
            if (data.Role == 'moderator') {
                const moderatorForm = document.createElement('form');
                moderatorForm.action = '/delete';
                moderatorForm.method = 'post';

                const reportButton = document.createElement('button');
                reportButton.type = 'submit';
                reportButton.className = 'submit-button ml-auto bg-red-700 hover:bg-red-800 border rounded p-2 mt-4';
                reportButton.name = 'report';
                reportButton.value = post.ID;
                reportButton.textContent = 'Report this post!';

                moderatorForm.appendChild(reportButton);
                innerPostDiv.appendChild(moderatorForm);

            }
            innerPostDiv.appendChild(addCommentForm)



        
      // Populate postDiv with post data
      // ... similar logic as above, create elements and append them ...
   // Append the innerPostDiv to the postDiv
        postDiv.appendChild(innerPostDiv);

        // Append the postDiv to the appDiv

      appDiv.appendChild(postDiv);
  });



  // If no posts, display a message
  if (!data.Posts || data.Posts.length === 0) {
      const message = document.createElement('p');
      message.className = 'flex justify-center font-extrabold text-2xl pt-4';
      message.textContent = 'No categories chosen, please choose categories.';
      appDiv.appendChild(message);
  }
    // Add scripts
//   const script1 = document.createElement('script');
//   script1.src = '/static/changeColor.js';
const scriptArr = ["changeColor.js", "displayComments.js", "likesFunction.js", "commentsScript.js"]
scriptArr.forEach(script => {
  let script2 = document.createElement('script');
  script2.src = `../static/${script}`
    script2.type = 'module'
  

  body.appendChild(script2)

  
})
// appDiv.appendChild(script1);
// ... add other scripts ...
displayComments()
commentsScript()
likesFunction()


}