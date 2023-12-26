export function displayComments() {
  document.addEventListener("click", function (event) {
    // Check if the clicked element has the .comments-toggler class
    if (event.target.classList.contains("comments-toggler")) {
      console.log("Here i display comment");
      const postId = event.target.dataset.postId;
      const commentsDiv = document.getElementById(`comments${postId}`);
      if (commentsDiv) {
        console.log("Here i really display comment");
        commentsDiv.style.display =
          commentsDiv.style.display === "none" ? "block" : "none";
      }
    }
  });
}
