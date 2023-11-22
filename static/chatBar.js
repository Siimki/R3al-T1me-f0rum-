
    const chatbox = document.getElementById('chatbox');
    const chatboxToggle = document.querySelectorAll('.chatboxToggle');
    const chatboxClose = document.querySelector('.chat-header .close'); // Make sure the selector is specific to the close button
    
    // Open chatbox
    // chatboxToggle.addEventListener('click', () => {
    //     console.log("i expand ")
    //     chatbox.classList.add('expanded');
    // });
    
    // Close chatbox from the close button
    chatboxClose.addEventListener('click', () => {
        console.log("i remove")
        chatbox.classList.remove('expanded');
    });
    chatboxToggle.forEach(element => {
      element.addEventListener('click', () => {
          // Toggle the chatbox expansion here
          console.log("do i get called?")
          chatbox.classList.toggle('expanded');
          const username = element.textContent; // This gets the username from the clicked element
          openChat(username);
          // openChat()          // If you have a function to open a chat with a specific user, you could call it here
          // For example: openChat(element.textContent);
        
      });
  });
    // Clicking outside the chatbox closes it if it is open
    // document.addEventListener('click', (event) => {
    //     console.log('i outside of chatbox')
    //     if (chatbox.classList.contains('expanded') && !chatbox.contains(event.target) && !event.target.matches('#chatboxToggle')) {
    //         chatbox.classList.remove('expanded');
    //     }
    // });
    
    // Stop propagation inside chatbox
    chatbox.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    
    const users = document.querySelectorAll('.user-name');
    
    // Function to open a chat window
    function openChat(username) {
      console.log('Opening chat with username:', username);
      const chatBox = document.getElementById('chatbox');
      const chatHeaderUsername = document.getElementById('chat-header-username'); // Make sure you have this element in your HTML
      chatHeaderUsername.textContent = `Chat with ${username}`;
      chatBox.classList.add('expanded');
      // Load message history and establish connection for real-time messaging
      // This will likely involve an AJAX call to your backend or establishing a WebSocket connection
    }

    
    // Add click event to each user to open a chat window
    users.forEach(user => {
      user.addEventListener('click', () => {
        var receiverusername = user.getAttribute('data-username');
        console.log("i know who you are messaging")
        openChat(receiverusername);
      });
    });
