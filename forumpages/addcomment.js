
export async function addCommentForm() {
  console.log("beginning of addcomment")
  var appDiv = document.getElementById("app");
  // document.addEventListener("DOMContentLoaded", function () {
  // Create the main container div
  const mainContainer = document.createElement("div");
  mainContainer.classList.add("bg-gray-100");

  // Create the page title
  const pageTitle = document.createElement("h1");
  pageTitle.classList.add("text-3xl", "font-bold", "text-center", "pt-8");
  pageTitle.textContent = "Will you add a comment?";

  // Create the page description
  const pageDescription = document.createElement("p");
  pageDescription.classList.add("text-2xl", "text-center", "p-6");
  pageDescription.textContent = "Forum to search for playmates!";

  // Create the button container
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("flex", "justify-center", "p-2", "font-bold");

  // Create buttons and add event listeners
  const createPostBtn = createButton("Create Post", "/createpost");
  const myPostsBtn = createButton("My posts", "/myposts", "myposts");
  const myLikedPostsBtn = createButton(
    "My liked posts",
    "/myposts",
    "mylikedposts"
  );
  const showAllPostsBtn = createButton(
    "Show all posts",
    "http://localhost:8080/homepage.html"
  );
  const logOutBtn = createButton("Log out", "/logout");

  // Create the comment form
  const commentFormContainer = document.createElement("div");
  commentFormContainer.classList.add(
    "flex",
    "flex-col",
    "p-8",
    "bg-gray-200",
    "mb-4",
    "mx-16",
    "rounded"
  );

  const commentForm = document.createElement("form");
  commentForm.classList.add("bg-gray-300", "m-3");
  commentForm.method = "post";
//   try {
//     const response = await fetch('/addcomment', {
        
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });

//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }

//     var postID = await response.json();
//     console.log(postID," this is the data");
//     loadPage('login');
// } catch (error) {
//     console.error('There was an error fetching the login data', error);
//     loadPage('registration ');
// }
//   console.log("this is postID")
  // document.getElementById('')
  // commentForm.action = `/submitcomment?id=${postID}`;
  
  const postID = commentForm.action.split("=")[1];
  commentForm.action = `/submitcomment?id=${postID}`;


  const commentTextarea = document.createElement("textarea");
  commentTextarea.classList.add("bg-gray-100");
  commentTextarea.name = "comment";
  commentTextarea.placeholder = "Your comment";
  const submitCommentBtn = document.createElement("input");
  submitCommentBtn.classList.add(
    "bg-blue-300",
    "hover-bg-blue-400",
    "border",
    "rounded",
    "m-2",
    "px-2",
    "transition",
    "duration-500"
  );
  submitCommentBtn.type = "submit";
  submitCommentBtn.value = "Submit Comment";

  // Append elements to the page
  mainContainer.appendChild(pageTitle);
  mainContainer.appendChild(pageDescription);
  mainContainer.appendChild(buttonContainer);
  buttonContainer.appendChild(createPostBtn);
  buttonContainer.appendChild(myPostsBtn);
  buttonContainer.appendChild(myLikedPostsBtn);
  buttonContainer.appendChild(showAllPostsBtn);
  buttonContainer.appendChild(logOutBtn);
  mainContainer.appendChild(commentFormContainer);
  commentFormContainer.appendChild(commentForm);
  commentForm.appendChild(commentTextarea);
  commentForm.appendChild(submitCommentBtn);

  // Add the main container to the body
  // document.body.appendChild(mainContainer);
  // appDiv.innerHTML = mainContainer;
  appDiv.appendChild(mainContainer);

  // Function to create a button with an event listener
  function createButton(text, action, name) {
    const button = document.createElement("button");
    button.textContent = text;
    button.classList.add(
      "bg-blue-300",
      "hover-bg-blue-400",
      "border",
      "rounded",
      "p-2",
      "transition",
      "duration-500"
    );
    button.addEventListener("click", function () {
      if (action.startsWith("http")) {
        window.location.href = action;
      } else {
        const form = document.createElement("form");
        form.method = "post";
        form.action = action;

        if (name) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = name;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      }
    });
    return button;
  }

  commentForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission
    console.log("calling submit button")
    // Get the post ID from the form's action attribute
    var postID = commentForm.action.split("=")[1];
    console.log("this is postID", postID)
    // Get the current URL
    const currentUrl = window.location.href;

    // Create a URL object to parse the URL
    const url = new URL(currentUrl);

    // Get the 'id' parameter from the URL
    const postId = url.searchParams.get('id');

    // Make sure postId is not null or empty before proceeding
    if (!postId) {
      console.error('Invalid post_id');
      return;
    }

    // Remove the '#addcomment' part if it's present in postId
    const postIdWithoutHash = postId.replace('#addcomment', '');

    // Make sure postIdWithoutHash is not null or empty before proceeding
    if (!postIdWithoutHash) {
      console.error('Invalid post_id');
      return;
    }
    console.log("this is postID", postIdWithoutHash)
    // Get the comment text from the textarea
    const commentText = commentTextarea.value;

    // Make an AJAX request to your Go server to add the comment
    fetch("/submitcomment", {
      method: "POST",
      body: JSON.stringify({ postID: postIdWithoutHash, comment: commentText }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Handle a successful response (e.g., show a success message)
          console.log("Comment added successfully!");
          setTimeout(function () {
            window.location.href = "http://localhost:8080/#login";
          }, 800); // 2000 milliseconds (2 seconds)
        } else {
          // Handle an error response
          console.error("Error adding comment");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

// export function addCommentForm() {
//   var appDiv = document.getElementById("app");

//   var comment = `
//     <h1 class="text-3xl font-bold text-center pt-8">Will you add comment?</h1>
//     <p class="text-2xl text-center p-6">Forum to search for playmates!</p>
//     <div class="flex justify-center p-2 font-bold">
//       <div
//         class="bg-blue-300 hover:bg-blue-400 border rounded p-2 transition duration-500"
//       >
//         <form action="/createpost" method="post">
//           <!-- Form fields and other content -->
//           <button type="submit">Create Post</button>
//         </form>
//       </div>
//       <div
//         class="bg-blue-300 hover:bg-blue-400 border rounded p-2 transition duration-500"
//       >
//         <form action="/myposts" method="post">
//           <button
//             class="transition duration-500"
//             type="submit"
//             value="myposts"
//             name="myposts"
//           >
//             My posts
//           </button>
//         </form>
//       </div>
//       <div
//         class="bg-blue-300 hover:bg-blue-400 border rounded p-2 transition duration-500"
//       >
//         <form action="/myposts" method="post">
//           <button
//             class="transition duration-500"
//             type="submit"
//             value="mylikedposts"
//             name="myposts"
//           >
//             My liked posts
//           </button>
//         </form>
//       </div>

//       <div
//         class="bg-blue-300 hover:bg-blue-400 border rounded p-2 transition duration-500"
//       >
//         <button
//           onclick="window.location.href='http://localhost:8080/homepage.html'"
//         >
//           Show all posts
//         </button>
//       </div>
//       <div
//         class="bg-blue-300 hover:bg-blue-400 border rounded p-2 transition duration-500"
//       >
//         <form action="/logout" method="post">
//           <label for="log-out"> </label>
//           <input type="submit" id="log-out" name="log-out" value="Log out" />
//         </form>
//       </div>
//     </div>
//     <div class="flex flex-col p-8 bg-gray-200 mb-4 mx-16 rounded">
//       <div class="bg-gray-300">
//         <form
//           class="bg-gray-300 m-3"
//           method="post"
//           action="/submitcomment?id={{.}}"
//         >
//           <textarea
//             class="bg-gray-100"
//             name="comment"
//             placeholder="Your comment"
//           ></textarea>
//           <input
//             class="bg-blue-300 hover:bg-blue-400 border rounded m-2 px-2 transition duration-500"
//             type="submit"
//             value="Submit Comment"
//           />
//         </form>
//       </div>
//     </div>`;

//   appDiv.innerHTML = comment;
// }
