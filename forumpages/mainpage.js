import { data, fetchDataFromServer, loginHandler } from "./registration.js";
import { displayComments } from "/static/displayComments.js";
import { changeColor } from "/static/changeColor.js";
import { commentsScript } from "/static/commentsScript.js";
import { likesFunction } from "/static/likesFunction.js";
import { fetchFilteredPosts } from "./filterpages.js";
import { fetchMyPosts } from "./mypostsfilter.js";
import { logout } from "./logout.js";

export async function mainPage(data) {
  if (!data) {
    console.log("data not exist, start fetch");
    var data2 = await fetchDataFromServer();
  }
  if (!data) {
    data = data2;
  }

  const body = document.getElementById("body");
  body.className = "bg-gray-100";
  console.log("This is ducked");
  const appDiv = document.getElementById("app");
  appDiv.className = "";
  appDiv.innerHTML = "";

  // Create the Welcome header
  const welcomeHeader = document.createElement("h1");
  welcomeHeader.className = "text-3xl font-bold text-center pt-8";
  welcomeHeader.textContent = `Welcome ${data.Username}!`;
  appDiv.appendChild(welcomeHeader);

  // Create the Forum description
  const forumDescription = document.createElement("p");
  forumDescription.className = "text-2xl text-center p-6";
  forumDescription.textContent = "Forum to search for playmates!";
  appDiv.appendChild(forumDescription);

  // Create the button div
  const buttonDiv = document.createElement("div");
  buttonDiv.className = "flex justify-center p-2 font-bold";

  // Create form and button elements
  const createPostForm = document.createElement("form");
  createPostForm.action = "#createpost";
  createPostForm.method = "get";

  const createPostBtn = document.createElement("button");
  createPostBtn.className =
    "bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500";
  createPostBtn.type = "submit";
  createPostBtn.textContent = "Create Post";

  createPostForm.appendChild(createPostBtn);
  buttonDiv.appendChild(createPostForm);
  appDiv.appendChild(buttonDiv);

  //toggleUserListBtn
  const toggleUserListButton = document.getElementById("toggleUserListBtn");
  toggleUserListButton.style.display = "block";
  // My Posts form and button
  const myPostsForm = document.createElement("form");
  const myPostsBtn = document.createElement("button");
  myPostsBtn.className =
    "bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500";
  myPostsBtn.type = "submit";
  myPostsBtn.value = "myposts";
  myPostsBtn.name = "myposts";
  myPostsBtn.textContent = "My posts";

  myPostsBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting traditionally
    fetchMyPosts("myposts"); // Fetch "My Posts"
  });

  myPostsForm.appendChild(myPostsBtn);
  buttonDiv.appendChild(myPostsForm);

  // My Liked Posts form and button
  const myLikedPostsForm = document.createElement("form");
  // myLikedPostsForm.action = '/myposts';
  // myLikedPostsForm.method = 'post';

  const myLikedPostsBtn = document.createElement("button");
  myLikedPostsBtn.className =
    "bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500";
  myLikedPostsBtn.type = "submit";
  myLikedPostsBtn.value = "mylikedposts";
  myLikedPostsBtn.name = "myposts";
  myLikedPostsBtn.textContent = "My liked posts";

  myLikedPostsBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting traditionally
    fetchMyPosts("mylikedposts"); // Fetch "My Liked Posts"
  });

  myLikedPostsForm.appendChild(myLikedPostsBtn);
  buttonDiv.appendChild(myLikedPostsForm);

  // Show All Posts button
  const showAllPostsBtn = document.createElement("button");
  showAllPostsBtn.className =
    "bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500";
  showAllPostsBtn.onclick = function () {
    window.location.href = "http://localhost:8080#login";
  };
  showAllPostsBtn.textContent = "Show all posts";
  showAllPostsBtn.addEventListener("click", function (event) {
    fetchMyPosts("normal");
  });

  buttonDiv.appendChild(showAllPostsBtn);

  // Logout form and input/button
  const logoutForm = document.createElement("form");
  logoutForm.action = "/logout";
  logoutForm.method = "post";

  const logoutBtn = document.createElement("input");
  logoutBtn.className =
    "bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500";
  logoutBtn.type = "submit";
  logoutBtn.id = "log-out";
  logoutBtn.name = "log-out";
  logoutBtn.value = "Log out";
  async function logoutter() {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // or response.text() if the response is not in JSON format
      console.log("Logout successful:", data);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  logoutBtn.addEventListener("click", function (event) {
    logoutter();
    logout();
  });

  logoutForm.appendChild(logoutBtn);
  buttonDiv.appendChild(logoutForm);

  appDiv.appendChild(buttonDiv);

  // Create the filtered posts form
  const filteredPostsForm = document.createElement("form");
  filteredPostsForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting in the traditional way

    let selectedGames = [];
    games.forEach((game) => {
      const checkbox = document.getElementById(game.id);
      if (checkbox.checked) {
        selectedGames.push(checkbox.value);
      }
    });

    // Call a function to handle fetching the filtered data
    fetchFilteredPosts(selectedGames);
  });

  // Create the container div for the checkboxes and button
  const filterContainerDiv = document.createElement("div");
  filterContainerDiv.className = "flex justify-center bg-gray-300";

  // Create and append checkboxes with labels
  const games = [
    { id: "league", name: "league", value: "1", text: "League" },
    { id: "runescape", name: "runescape", value: "2", text: "Runescape" },
    {
      id: "counter-strike",
      name: "counter-strike",
      value: "3",
      text: "Counter-Strike",
    },
  ];

  games.forEach((game) => {
    const label = document.createElement("label");
    label.className =
      "bg-blue-300 hover:bg-blue-400 checked:bg-blue-500 border rounded p-2 m-1 transition duration-500 shadow-lg";
    label.id = `checkboxDiv${game.value}`;
    label.style.cursor = "pointer";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = game.id;
    input.name = game.name;
    input.value = game.value;
    input.style.visibility = "hidden";
    input.style.position = "absolute";
    input.onchange = function () {
      changeColor(this, `checkboxDiv${game.value}`);
    };

    label.appendChild(input);
    label.append(game.text);
    filterContainerDiv.appendChild(label);
  });

  // Create and append the submit button
  const submitBtn = document.createElement("button");
  submitBtn.className =
    "font-bold bg-blue-300 hover:bg-blue-400 border rounded p-2 m-1 transition duration-500 ml-4";
  submitBtn.type = "submit";
  submitBtn.textContent = "Apply filter";

  filterContainerDiv.appendChild(submitBtn);

  filteredPostsForm.appendChild(filterContainerDiv);

  appDiv.appendChild(filteredPostsForm);

  console.log("do i arrive to the data.posts?");
  // Posts loop
  data.Posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    const innerPostDiv = document.createElement("div");
    innerPostDiv.className = "flex flex-col p-6 bg-gray-200 mb-4 rounded";
    innerPostDiv.style = "max-width: 800px; margin: 1rem auto;";
    const innerPostDiv2 = document.createElement("div");
    innerPostDiv2.className = "bg-gray-300";
    innerPostDiv.appendChild(innerPostDiv2);
    const postContent = document.createElement("p");
    postContent.className = "m-5";
    postContent.textContent = post.Content;
    innerPostDiv2.appendChild(postContent);
    const postAttributes = document.createElement("p");
    postAttributes.className = "my-5 mx-5";
    postAttributes.textContent = "Post by: ";
    const usernamePostAttributes = document.createElement("span");
    usernamePostAttributes.className = "font-bold";
    usernamePostAttributes.textContent = post.Username;
    postAttributes.appendChild(usernamePostAttributes);
    const usernamePostAttributes2 = document.createElement("p");
    usernamePostAttributes2.textContent = post.PostedAgo;
    postAttributes.appendChild(usernamePostAttributes2);
    innerPostDiv2.appendChild(postAttributes);
    const flexBox = document.createElement("div");
    flexBox.className = "flex";

    // Like Button
    const likeButton = document.createElement("button");
    likeButton.className =
      "likeButton mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded m-3";
    likeButton.dataset.postId = post.ID;
    likeButton.dataset.userId = post.Username; // Assuming you have the username in post.Username
    likeButton.innerHTML = `👍 Like <span id="likeCount${post.ID}">${post.Likes}</span>`;
    flexBox.appendChild(likeButton);

    // Dislike Button
    const dislikeButton = document.createElement("button");
    dislikeButton.className =
      "dislikeButton mr-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded m-3";
    dislikeButton.dataset.postId = post.ID;
    dislikeButton.dataset.userId = post.Username; // Assuming you have the username in post.Username
    dislikeButton.innerHTML = `👎 Dislike <span id="dislikeCount${post.ID}">${post.Dislikes}</span>`;
    flexBox.appendChild(dislikeButton);

    // Comments Toggle Button
    const commentsToggleDiv = document.createElement("div");
    commentsToggleDiv.className =
      "flex ml-auto bg-blue-300 hover:bg-blue-400 border rounded m-2 px-2 transition duration-500";

    const commentsToggleButton = document.createElement("button");
    commentsToggleButton.className = "comments-toggler";
    commentsToggleButton.dataset.postId = post.ID;
    // Check if CommentCount is available and add it to the button text
    commentsToggleButton.textContent = post.CommentCount
      ? `Load comments (${post.CommentCount})`
      : "Load comments";
    commentsToggleDiv.appendChild(commentsToggleButton);

    flexBox.appendChild(commentsToggleDiv);

    // Append flexBox to the innerPostDiv or where you want it to appear
    innerPostDiv2.appendChild(flexBox);

    //append comments
    const commentsSection = document.createElement("div");
    commentsSection.id = "comments" + post.ID;
    commentsSection.className = "comments";
    commentsSection.style.display = "none";
    //append text
    const commentSectionText = document.createElement("p");
    commentSectionText.textContent = "Comment section 💬";
    //range comments
    console.log(post.Comments);
    if (post.Comments) {
      post.Comments.forEach((comment) => {
        console.log(comment);
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment border rounded my-1 ml-24";
        const commentInnerDiv = document.createElement("div");
        commentInnerDiv.className =
          "flex flex-col p-2 bg-gray-300 mb-4 mx-8 rounded";
        const commentContent = document.createElement("p");
        commentContent.className = "m-2";
        commentContent.textContent = comment.Content;
        const commentAttributes = document.createElement("p");
        commentAttributes.className = "my-5 mx-2";
        commentAttributes.textContent = "Post by: ";
        const commentUsername = document.createElement("span");
        commentUsername.className = "font-bold";
        commentUsername.textContent = comment.Username;
        const commentPostedAgo = document.createElement("p");
        commentPostedAgo.textContent = comment.PostedAgo;
        commentAttributes.appendChild(commentUsername);
        commentAttributes.appendChild(commentPostedAgo);
        commentInnerDiv.appendChild(commentContent);
        commentInnerDiv.appendChild(commentAttributes);
        const commentFlexBox = document.createElement("div");
        commentFlexBox.class = "flex";
        const commentLikeButton = document.createElement("button");
        commentLikeButton.className =
          "commentlikeButton mr-2 bg-blue-500 hover:bg-blue-700 text-white py-2 px-2 rounded";
        commentLikeButton.dataset.commentId = comment.ID;
        //check here
        commentLikeButton.dataset.userId = comment.Username;
        commentLikeButton.innerHTML = `👍 <span id="commentlikeCount${comment.ID}">${comment.Likes}</span>`;

        commentFlexBox.appendChild(commentLikeButton);
        const commentDisLikeButton = document.createElement("button");
        commentDisLikeButton.className =
          "commentdislikeButton mr-2 bg-red-500 hover:bg-red-700 text-white py-1.5 px-1.5 rounded";
        commentDisLikeButton.dataset.commentId = comment.ID;
        commentDisLikeButton.dataset.userId = comment.Username;
        commentDisLikeButton.innerHTML = `👎 <span id="commentdislikeCount${comment.ID}">${comment.Dislikes}</span>`;
        commentFlexBox.appendChild(commentDisLikeButton);

        commentInnerDiv.appendChild(commentFlexBox);
        commentDiv.appendChild(commentInnerDiv);
        commentsSection.appendChild(commentDiv);
        //   innerPostDiv.appendChild(commentDiv)
      });
    }
    innerPostDiv.appendChild(commentsSection);

    // i am not entirely sure where i put this line
    // innerPostDiv.appendChild(commentDiv)
    const addCommentForm = document.createElement("form");
    addCommentForm.method = "get";
    addCommentForm.action = "#addcomment";
    // const randomDiv = document.createElement('div')
    // randomDiv.className = 'flex justify-between'
    const inputAddComment = document.createElement("input");
    inputAddComment.type = "hidden";
    inputAddComment.name = "id";
    inputAddComment.value = post.ID;
    addCommentForm.appendChild(inputAddComment);
    const inputAddComment2 = document.createElement("button");
    inputAddComment2.type = "submit";
    inputAddComment2.value = "Comment";
    inputAddComment2.className =
      "submit-button bg-gray-300 hover:bg-gray-400 text-black p-2 mt-4 rounded";
    inputAddComment2.innerHTML = `Comment`;
    addCommentForm.appendChild(inputAddComment2);
    if (data.Role == "moderator") {
      const moderatorForm = document.createElement("form");
      moderatorForm.action = "/delete";
      moderatorForm.method = "post";

      const reportButton = document.createElement("button");
      reportButton.type = "submit";
      reportButton.className =
        "submit-button ml-auto bg-red-700 hover:bg-red-800 border rounded p-2 mt-4";
      reportButton.name = "report";
      reportButton.value = post.ID;
      reportButton.textContent = "Report this post!";

      moderatorForm.appendChild(reportButton);
      innerPostDiv.appendChild(moderatorForm);
    }
    innerPostDiv.appendChild(addCommentForm);

    // Populate postDiv with post data
    // ... similar logic as above, create elements and append them ...
    // Append the innerPostDiv to the postDiv
    postDiv.appendChild(innerPostDiv);

    // Append the postDiv to the appDiv

    appDiv.appendChild(postDiv);
  });

  function checkIfOnline() {}

  function updateUserStatus(username, isOnline, userId) {
    const userItem = document.querySelector(
      `.user-list-item[data-user-id="${userId}"]`
    );

    if (userItem) {
      // If the user is already in the list, update their status
      if (isOnline) {
        userItem.classList.add("online");
      } else {
        userItem.classList.remove("online");
      }
    } else {
      // If the user is not in the list and is online, add them
      if (isOnline) {
        const newUserItem = document.createElement("div");
        newUserItem.classList.add("user-list-item", "chatboxToggle", "online");
        newUserItem.textContent = username;
        newUserItem.setAttribute("data-username", username);
        newUserItem.onclick = () => initiateChat(username);
        document.getElementById("userList").appendChild(newUserItem);
      }
    }
  }
  let currentChatUsername = null;
  function createUserList() {
    const userListContainer = document.getElementById("userList");
    // Clear out current list
    userListContainer.innerHTML = "";

    // Create user list items
    const userlistHeader = document.createElement("div");
    userlistHeader.innerHTML = "Private messages";
    userlistHeader.style.textAlign = "center"; // Center align the text
    userlistHeader.style.fontWeight = "bold"; // Make the text bold
    userlistHeader.style.marginBottom = "20px"; // Add bottom margin for spacing
    userListContainer.appendChild(userlistHeader);

    data.Userlist.forEach((user) => {
      const userItem = document.createElement("div");
      userItem.classList.add("user-list-item", "chatboxToggle");
      userItem.classList.add("chatboxToggle");
      userItem.textContent = user.username;
      currentChatUsername = user;
      userItem.dataset.userId = user.id; // Store the user ID using data attributes

      // Set up the click event for initiating chat
      userItem.onclick = () => initiateChat(user.username, user.id); // Pass both username and ID

      userListContainer.appendChild(userItem);
    });

    console.log("usernameID", data.Userlist[0]);
    console.log("usernameID", data.UsernameId);
  }

  function updateUserList(userlist) {
    const userListContainer = document.getElementById("userList");
    userListContainer.innerHTML = ""; // Clear the current list

    userlist.forEach((user) => {
      const userItem = document.createElement("div");
      userItem.classList.add("user-list-item", "chatboxToggle");
      userItem.textContent = user.username;
      userItem.dataset.userId = user.id; // Store the user ID using data attributes
      //I try to outComment this line
      // currentChatUsername = user;
      // chatBox.classList.add('expanded');

      // Set up the click event for initiating chat
      userItem.onclick = () => initiateChat(user.username, user.id); // Pass both username and ID

      userListContainer.appendChild(userItem);
    });

    addEventListenersToUsers();
  }

  function addEventListenersToUsers() {
    const users = document.querySelectorAll(".chatboxToggle");
    const chatBox = document.getElementById("chatbox");

    users.forEach((user) => {
      user.addEventListener("click", () => {
        chatBox.classList.add("expanded");
      });
    });
  }

  // Function to initiate chat with a user
  function initiateChat(nickname) {
    currentChatUsername = nickname;
    console.log("Initiating chat with username:", nickname);
    setupWebSocket(data.Username);
    // Call with 1 to load the first page of messages
    getMessagesFromServer(1);
    currentPage = 1;
    allMessagesLoaded = false;
    const chatHeaderUsername = document.getElementById("chat-header-username"); // Make sure you have this element in your HTML
    chatHeaderUsername.textContent = `Chat with ${nickname}`;
  }
  const toggleUserListBtn = document.getElementById("toggleUserListBtn");
  const userList = document.getElementById("userList"); // Assuming this is the ID of your user list sidebar

  // Event listener for the toggle button
  toggleUserListBtn.addEventListener("click", () => {
    // Check if the user list is currently visible
    if (userList.style.display === "none" || userList.style.display === "") {
      userList.style.display = "block"; // Show the user list
      toggleUserListBtn.textContent = "Hide friendlist";
    } else {
      userList.style.display = "none"; // Hide the user list
      toggleUserListBtn.textContent = "Show  friendlist";
    }
  });

  const chatboxToggle = document.querySelectorAll(".chatboxToggle");
  const chatboxClose = document.querySelector(".chat-header .close"); // Make sure the selector is specific to the close button

  // Establish a WebSocket connection when the user navigates to the chat
  let socket = null;
  function setupWebSocket(username) {
    socket = new WebSocket(`ws://localhost:8080/ws?username=${username}`);

    socket.onopen = function (e) {
      console.log("[open] Connection established");
    };

    socket.onmessage = function (event) {
      console.log(`[message] Data received from server: ${event.data}`);
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message") {
          // Handle message data
          //try to reverse here
          displayMessages(data.messages.reverse()); // Assuming data.Messages contains an array of message objects
        } else if (data.type === "userlist") {
          // Handle user list data
          updateUserList(data.userlist); // Assuming data.Userlist contains the updated user list
        } else if (data.type == "status") {
          console.log("[UPDATE]: Updating userlist status ");
          updateUserStatus(data.username, data.online, data.userid);
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    };

    socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(
          `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.log("[close] Connection died");
      }
    };

    socket.onerror = function (error) {
      console.log(`[error] ${error.message}`);
    };
  }

  // When sending a message, call `sendMessage(message)`
  // When the user navigates to the chat, call `setupWebSocket(user)`

  document.getElementById("sendMessage").addEventListener("click", () => {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    console.log(
      "This is message that is going to be sent to the server",
      message
    );
    if (message) {
      sendMessageToServer(message);
      messageInput.value = ""; // Clear the input after sending
    }
  });

  function sendMessageToServer(message) {
    var senderusername = data.Username;
    var receiverusername = currentChatUsername;
    console.log("The message we send to the server:", message);
    console.log("Sender and Receiver below");
    console.log("Sender and Receiver", senderusername, receiverusername);

    // Here we send the message through the WebSocket instead of using fetch
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({ message, senderusername, receiverusername })
      );
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  }

  function displayMessages(messages, append = false) {
    const messagesContainer = document.getElementById("messages");
    if (!append) {
      // Clear previous messages only if 'append' is false
      messagesContainer.innerHTML = "";
    }
    const shouldScrollToBottom =
      messagesContainer.scrollTop + messagesContainer.clientHeight ===
      messagesContainer.scrollHeight;

    messages.forEach((message) => {
      const messageWrapper = document.createElement("div");
      console.log(typeof message.sender, "And: ", typeof data.UsernameId);

      messageWrapper.classList.add(
        "message-wrapper",
        message.sender === data.UsernameId.toString() ? "right" : "left"
      );

      const timestampDiv = document.createElement("div");
      timestampDiv.classList.add("message-timestamp");
      timestampDiv.textContent = formatDate(message.timestamp);

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("message-content");
      contentDiv.textContent = message.content;

      messageWrapper.appendChild(timestampDiv);
      messageWrapper.appendChild(contentDiv);

      messagesContainer.appendChild(messageWrapper);
      if (shouldScrollToBottom) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function getMessagesFromServer(page = 1) {
    const senderusername = data.Username;
    const receiverusername = currentChatUsername;

    // const url = `/get-message?senderusername=${encodeURIComponent(senderusername)}&receiverusername=${encodeURIComponent(receiverusername)}&page=${page}`;
    const limit = 10;
    const offset = (page - 1) * limit;

    const url = `/get-message?senderusername=${encodeURIComponent(
      senderusername
    )}&receiverusername=${encodeURIComponent(
      receiverusername
    )}&limit=${limit}&offset=${offset}`;
    page = page || currentPage;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const privateMessages = await response.json();
      if (page === 1) {
        // Clear previous messages only if it's the first page
        const messagesContainer = document.getElementById("messages");
        messagesContainer.innerHTML = "";
      }
      console.log("Fetched messages count: ", privateMessages.length);
      if (privateMessages.length < 10) {
        //allMessagesLoaded = true;
        console.log("Setting allMessagesLoaded to true");
      } else {
        console.log("There are more messages to load");
      }
      // Display the fetched messages
      displayMessages(privateMessages.reverse(), true); // Pass 'true' to append messages
    } catch (error) {
      console.error(
        "There was an error fetching messages from the server:",
        error
      );
    }
  }

  let currentPage = 1; // Keep track of the current page of messages
  let loadingMessages = false; // Flag to prevent multiple simultaneous loads
  let allMessagesLoaded = false; // Flag to indicate when all messages are loaded

  // Function to load more messages when scrolled to the top
  async function loadMoreMessages() {
    console.log("Calling LoadMoreMessage");
    if (loadingMessages || allMessagesLoaded) {
      console.log("Exit early: ", { loadingMessages, allMessagesLoaded });
      return;
    }

    loadingMessages = true;

    const senderusername = data.Username;
    const receiverusername = currentChatUsername;
    currentPage++; // Increment page to load the next set of messages

    const url = `/get-message?senderusername=${encodeURIComponent(
      senderusername
    )}&receiverusername=${encodeURIComponent(
      receiverusername
    )}&page=${currentPage}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const moreMessages = await response.json();
      console.log("[LoadMoreMessages]Received messages: ", moreMessages);

      if (moreMessages && moreMessages.length < 10) {
        allMessagesLoaded = true;
        console.log("No more messages to load");
      }

      prependMessages(moreMessages); // Add new messages to the top of the chat
    } catch (error) {
      console.error("Error:", error);
    } finally {
      loadingMessages = false; // Reset loading state
    }
  }

  function prependMessages(messages) {
    const messagesContainer = document.getElementById("messages");
    let oldScrollHeight = messagesContainer.scrollHeight;

    messages.forEach((message) => {
      const messageWrapper = document.createElement("div");
      messageWrapper.classList.add(
        "message-wrapper",
        message.sender === data.UsernameId.toString() ? "right" : "left"
      );
      const timestampDiv = document.createElement("div");
      timestampDiv.classList.add("message-timestamp");
      timestampDiv.textContent = formatDate(message.timestamp);

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("message-content");
      contentDiv.textContent = message.content;

      // Append children in the same order as displayMessages
      messageWrapper.appendChild(timestampDiv);
      messageWrapper.appendChild(contentDiv);

      // Prepend the message wrapper to the messages container
      messagesContainer.insertBefore(
        messageWrapper,
        messagesContainer.firstChild
      );
    });

    // Adjust the scroll position so the user stays at the same place in the chat
    messagesContainer.scrollTop =
      messagesContainer.scrollHeight - oldScrollHeight;
  }

  initiateChat(currentChatUsername);
  getMessagesFromServer(1);
  // Throttle function to limit the rate at which a function can fire
  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  const messagesContainer = document.getElementById("messages");
  messagesContainer.addEventListener(
    "scroll",
    throttle(async () => {
      if (messagesContainer.scrollTop === 0 && !allMessagesLoaded) {
        console.log("Attempting to load more messages");
        await loadMoreMessages();
      }
    }, 500)
  );
  // Update the rest of your functions and event listeners as needed

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
  // userList.style.display = 'none'; // Start with the user list hidden
  toggleUserListBtn.textContent = "Show User List";

  createUserList();

  // If no posts, display a message
  if (!data.Posts || data.Posts.length === 0) {
    const message = document.createElement("p");
    message.className = "flex justify-center font-extrabold text-2xl pt-4";
    message.textContent = "No categories chosen, please choose categories.";
    appDiv.appendChild(message);
  }
  // Add scripts

  const scriptArr = [
    "chatBar.js",
    "changeColor.js",
    "displayComments.js",
    "likesFunction.js",
    "commentsScript.js",
  ];
  scriptArr.forEach((script) => {
    let script2 = document.createElement("script");
    script2.src = `../static/${script}`;
    script2.type = "module";

    body.appendChild(script2);
  });
  // appDiv.appendChild(script1);
  // ... add other scripts ...
  displayComments();
  commentsScript();
  likesFunction();
}
