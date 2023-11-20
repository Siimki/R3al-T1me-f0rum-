
    const chatbox = document.getElementById('chatbox');
    const chatboxToggle = document.getElementById('chatboxToggle');
    const chatboxClose = document.querySelector('.chat-header .close'); // Make sure the selector is specific to the close button
    
    // Open chatbox
    chatboxToggle.addEventListener('click', () => {
        console.log("i expand ")
        chatbox.classList.add('expanded');
    });
    
    // Close chatbox from the close button
    chatboxClose.addEventListener('click', () => {
        console.log("i remove")
        chatbox.classList.remove('expanded');
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
        console.log('lgo to openChat')
      const chatBox = document.getElementById('chatbox');
      const chatHeader = document.getElementById('chat-header-username');
      chatHeader.textContent = `Chat with ${username}`;
      chatBox.classList.add('expanded');
      // Load message history and establish connection for real-time messaging
      // This will likely involve an AJAX call to your backend or establishing a WebSocket connection
    }
    
    // Add click event to each user to open a chat window
    users.forEach(user => {
      user.addEventListener('click', () => {
        const username = user.getAttribute('data-username');
        openChat(username);
      });
    });
