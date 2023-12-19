import { fetchMyPosts } from "./mypostsfilter.js";

export function createPost() {
    var appDiv = document.getElementById('app');
    var bodyDiv = document.getElementById('body')
    bodyDiv.className = "bg-gray-100"
    // Clear previous content in appDiv if any
    appDiv.innerHTML = '';

    // Create the main title
    var mainTitle = document.createElement('h1');
    mainTitle.className = 'text-3xl font-bold text-center pt-8';
    mainTitle.textContent = 'Will you create a post?';
    appDiv.appendChild(mainTitle);
    var flexDiv = document.createElement('div')
    flexDiv.className = 'flex justify-center p-2 font-bold'

    // Function to create a button div with a form
    function createButtonDiv(action, buttonText, buttonName, buttonValue) {
        var buttonDiv = document.createElement('div');
        buttonDiv.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 transition duration-500';

        var buttonForm = document.createElement('form');
        // buttonForm.action = action;
        // buttonForm.method = 'post';

        var formButton = document.createElement('button');
        formButton.type = 'submit';
        formButton.className = 'transition duration-500';
        formButton.textContent = buttonText;
        if (buttonName) formButton.name = buttonName;
        if (buttonValue) formButton.value = buttonValue;

        formButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent the form from submitting traditionally
            fetchMyPosts(`${buttonValue}`); // Fetch "My Liked Posts"
            var toClear = document.getElementById('post-submission-area')
            toClear.innerHTML = ''
            toClear.className = ''
          });

        buttonForm.appendChild(formButton);
        buttonDiv.appendChild(buttonForm);

        return buttonDiv;
    }

    // Create and append the buttons
    flexDiv.appendChild(createButtonDiv("",'My posts', 'myposts', 'myposts'));
    flexDiv.appendChild(createButtonDiv("",'My liked posts', 'myposts', 'mylikedposts'));
    flexDiv.appendChild(createButtonDiv("",'Show all posts', 'myposts', 'normal'));


    // Create the "Show all posts" button
    // var showAllPostsButton = document.createElement('div');
    // showAllPostsButton.className = 'bg-blue-300 hover:bg-blue-400 border rounded p-2 transition duration-500';
    // var showAllPostsLink = document.createElement('button');
    // showAllPostsLink.onclick = function() { window.location.href = 'http://localhost:8080/homepage.html'; };
    // showAllPostsLink.textContent = 'Show all posts';
    // showAllPostsButton.appendChild(showAllPostsLink);
    // flexDiv.appendChild(showAllPostsButton);

    // Create the "Log out" button
    flexDiv.appendChild(createButtonDiv('/logout', 'Log out', 'log-out', 'Log out'));
    appDiv.className = ""
    appDiv.appendChild(flexDiv)

        // Create the post submission area
        var postSubmissionArea = document.createElement('div');
        postSubmissionArea.className = 'flex flex-col p-8 bg-gray-200 mb-4 mx-16 rounded';
        postSubmissionArea.id = 'post-submission-area'
        var postFormContainer = document.createElement('div');
        postFormContainer.className = 'relative bg-gray-300';

        var postForm = document.createElement('form');
        postForm.id = 'postForm'
        postForm.className = 'bg-gray-300 m-3';


        // Function to create checkbox inputs
        function createCheckbox(id, label, val) {
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = id;
            checkbox.name = id;
            checkbox.value = val;
            var checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = id;
            checkboxLabel.textContent = label;
            postForm.appendChild(checkbox);
            postForm.appendChild(document.createTextNode(' '));
            postForm.appendChild(checkboxLabel);
            postForm.appendChild(document.createElement('br'));
        }

        // Create checkboxes
        createCheckbox('league', 'league', 1);
        createCheckbox('runescape', 'runescape', 2);
        createCheckbox('counter-strike', 'counter-strike', 3);

        // Create textarea
        var postContentTextarea = document.createElement('textarea');
        postContentTextarea.className = 'm-3';
        postContentTextarea.id = 'postContent';
        postContentTextarea.name = 'postContent';
        postContentTextarea.rows = '5';
        postContentTextarea.cols = '40';
        postContentTextarea.placeholder = 'Add post text!';
        postForm.appendChild(postContentTextarea);
        postForm.appendChild(document.createElement('br'));

        // Create submit button for post
        var postSubmitButton = document.createElement('button');
        postSubmitButton.className = 'bg-blue-300 hover:bg-blue-400 border rounded m-2 px-2 transition duration-500';
        postSubmitButton.type = 'submit';
        postSubmitButton.textContent = 'Post';
      //  postSubmitButton.href = "http://localhost:8080/#login";

        postForm.appendChild(postSubmitButton);
        postFormContainer.appendChild(postForm);
        postSubmissionArea.appendChild(postFormContainer);
        body.appendChild(postSubmissionArea);


        document.getElementById('postForm').addEventListener('submit', function(event) {
            event.preventDefault();
        //    window.location.href = "http://localhost:8080/#login"
            var postContent = document.getElementById("postContent").value;
            var categories = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(function(checkbox) {
                categories.push(checkbox.value);
            });
            
            var postData = {
                content: postContent,
                categories: categories
            };
        
            fetch("/submitpost", {
                method: "POST",
                body: JSON.stringify(postData),
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                if (response.ok) {
                    console.log("Post added successfully!");
                    window.location.href = "http://localhost:8080/#login";
                } else {
                    console.error("Error adding post");
                    alert("Error adding post ")
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        });
        
        

        // Continue creating and appending other elements...
}