function createUserList() {
    const userListContainer = document.getElementById('userList');
  
    // Clear out current list
    userListContainer.innerHTML = '';
  
    // Create user list items
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.classList.add('user-list-item');
        userItem.textContent = user.username;
        userItem.onclick = () => initiateChat(user.id); // Replace with actual chat initiation logic
        userListContainer.appendChild(userItem);
    });
  }