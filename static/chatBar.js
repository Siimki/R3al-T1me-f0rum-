
    const chatbox = document.getElementById('chatbox');
    const chatboxToggle = document.querySelectorAll('.chatboxToggle');
    const chatboxClose = document.querySelector('.chat-header .close'); // Make sure the selector is specific to the close button
    
    
    chatboxClose.addEventListener('click', () => {
        chatbox.classList.remove('expanded');
    });
    chatboxToggle.forEach(element => {
      element.addEventListener('click', () => {
          chatbox.classList.toggle('expanded');
          const username = element.textContent; // This gets the username from the clicked element
          openChat(username);
 
        
      });
  });

    chatbox.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    
    const users = document.querySelectorAll('.user-name');
    
    function openChat(username) {
      console.log('Opening chat with username:', username);
      const chatBox = document.getElementById('chatbox');
      const chatHeaderUsername = document.getElementById('chat-header-username'); // Make sure you have this element in your HTML
      chatHeaderUsername.textContent = `Chat with ${username}`;
      chatBox.classList.add('expanded');

    }

    
      users.forEach(user => {
        user.addEventListener('click', () => {
          var receiverusername = user.getAttribute('data-username');
          console.log("i know who you are messaging")
          openChat(receiverusername);
        });
      });
