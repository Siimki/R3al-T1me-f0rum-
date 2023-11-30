package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"forum/helpers"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"text/template"
	"time"
	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}
  

type Post struct {
	ID           int
	Content      string
	Username     string
	Likes        int
	Dislikes     int
	CreatedAt    time.Time
	Comments     []Comment
	PostedAgo    string
	CommentCount int
}

type HomePageData struct {
	Username           string
	Usernames          []string
	Posts              []Post
	Role               string
	ModerationRequests []string
	Moderators         []string
	ReportedRequests   int
	UsernameId 		   int
}

type Comment struct {
	ID        int
	PostID    int
	Username  string
	Content   string
	Likes     int
	Dislikes  int
	CreatedAt time.Time
	PostedAgo string
}

type Vote struct {
	PostID   int    `json:"postID"`
	Username string `json:"username"`
}



var clients = make(map[string]*websocket.Conn)

func main() {

	db, err := helpers.GetDbConnection()
	if err != nil {
		log.Fatalf("failed to prepare database connection: %v", err)
	}
	defer db.Close()

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.Handle("/dist/", http.StripPrefix("/dist/", http.FileServer(http.Dir("dist"))))
	http.Handle("/forumpages/", http.StripPrefix("/forumpages/", http.FileServer(http.Dir("forumpages"))))

	http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) { handleCallback(w, r, db) })
	http.HandleFunc("/callbackgithub", func(w http.ResponseWriter, r *http.Request) { HandleCallbackGithub(w, r, db) })
	http.HandleFunc("/auth/google", helpers.HandleLogin)
	http.HandleFunc("/auth/github", handleGithubLogin)
	http.HandleFunc("/report", func(w http.ResponseWriter, r *http.Request) { reportPostHandler(w, r, db) })
	http.HandleFunc("/delete", func(w http.ResponseWriter, r *http.Request) { deletePostHandler(w, r, db) })
	http.HandleFunc("/admin", func(w http.ResponseWriter, r *http.Request) { admin(w, r, db) })
	http.HandleFunc("/submitpost", func(w http.ResponseWriter, r *http.Request) { createPost(w, r, db) })
	http.HandleFunc("/myposts", func(w http.ResponseWriter, r *http.Request) { showMyPostsHandler(w, r, db) })
	http.HandleFunc("/commentlike", commentLikeHandler)
	http.HandleFunc("/commentdislike", commentDislikeHandler)
	http.HandleFunc("/like", likeHandler)
	http.HandleFunc("/dislike", dislikeHandler)
	http.HandleFunc("/filterpage", filterPage)
	http.HandleFunc("/submitcomment", func(w http.ResponseWriter, r *http.Request) { submitComment(w, r, db) })
	http.HandleFunc("/addcomment", addComment)
	http.HandleFunc("/register", registerHandler)
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) { loginHandler(w, r, db) })
	http.HandleFunc("/homepage", func(w http.ResponseWriter, r *http.Request) { homePageHandler(w, r, db) })
	http.HandleFunc("/logout", logOutHandler)
	http.HandleFunc("/createpost", serveCreatePostPage)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request){handleWebSocket(w,r,db)})
	http.HandleFunc("/send-message", func(w http.ResponseWriter, r *http.Request){messageHandler(w,r,db)})
	http.HandleFunc("/get-message", func(w http.ResponseWriter, r *http.Request){getMessageHandler(w,r,db)})
	http.HandleFunc("/", homeHandler)

	fmt.Println("Server started on port 8080.")
	fmt.Println("http://localhost:8080/")
	http.ListenAndServe(":8080", nil)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	fmt.Println("Websocket got called")
	ws, err := upgrader.Upgrade(w,r, nil )
	if err != nil {
		log.Fatal()
	}
	defer ws.Close()

	username := r.URL.Query().Get("username")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")
	fmt.Println("this is username, limit and offset from URL", username, limit, offset)
	clients[username] = ws 
	strLimit, err := strconv.Atoi(limit)
	if err != nil {
		fmt.Println("str conversion fucked ")
	}
	offsetLimit, err := strconv.Atoi(offset)
	if err != nil {
		fmt.Println("Str conversion fucked v2")
	}


	for { 
		fmt.Println("the clients are", clients)
		var msg struct {
			Message          string `json:"message"`
			SenderUsername   string `json:"senderusername"`
			ReceiverUsername string `json:"receiverusername"`
			Status 			 string `json:"status"`
		}
		type WebSocketResponse struct {
			Type     string        `json:"type"`
			Messages any     `json:"messages,omitempty"`
			Userlist []string      `json:"userlist,omitempty"`
			Online bool 	 `json:"active,omitempty"`
		}



		if err := ws.ReadJSON(&msg); err != nil {
			log.Println("read:", err)
			delete(clients, username)
			return
		}

		if err := liteMesssageHandler(msg.Message, msg.SenderUsername, msg.ReceiverUsername, db); err != nil {
			log.Println("Store message:", err) 
			continue
		}

		if senderWs, ok := clients[msg.SenderUsername]; ok {
			
			privateMessages, err := helpers.GetPrivateMessages(db, msg.SenderUsername, msg.ReceiverUsername, strLimit, offsetLimit)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if len(privateMessages) == 0 {
				fmt.Println("No messages found")
			}

			response := WebSocketResponse{
				Type:     "message",
				Messages: privateMessages,
			}
			
			if err := senderWs.WriteJSON(response); err != nil {
				log.Println("write confirmation error:", err )
				//handle errror
			}
		}

		if receiverWs, ok := clients[msg.ReceiverUsername]; ok {
			privateMessages, err := helpers.GetPrivateMessages(db, msg.SenderUsername, msg.ReceiverUsername, strLimit, offsetLimit)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if len(privateMessages) == 0 {
				fmt.Println("No messages found")
			}

			response := WebSocketResponse{
				Type:     "message",
				Messages: privateMessages,
			}
			
			if err := receiverWs.WriteJSON(response); err != nil {
				log.Println("write confirmation error:", err )
				//handle errror
			}
		}
		// After message is sent, update user list and broadcast it
		userId, err := helpers.GetUserID(msg.SenderUsername)
        if err != nil {
            log.Println("GetUserID error:", err)
            continue
        }

        updatedUserList, err := helpers.GetUsernames(db, userId)
        if err != nil {
            log.Println("Error fetching updated user list:", err)
            continue
        }
		broadcastData := WebSocketResponse{
			Type:     "userlist",
			Userlist: updatedUserList,
		}
		

        for _, clientWs := range clients {
            if err := clientWs.WriteJSON(broadcastData); err != nil {
                log.Println("Error sending updated user list:", err)
            }
        }
	}
	
}

func liteMesssageHandler(msg string, senderName string, receiver string, db *sql.DB) (err error ) {
	fmt.Println("log litemessagehandler")

	  senderUserId, err := helpers.GetUserID(senderName)
	  if err != nil {
		fmt.Println(err)
	  }
	  receiverUserId, err := helpers.GetUserID(receiver)
	  if err != nil {
		fmt.Println(err)
	  }
	  log.Printf("Message from %s to %s: %s", senderName, receiver, msg)

	  _, err = db.Exec("INSERT INTO private_messages (content, sender_id, receiver_id) VALUES (?, ?, ?)", msg, senderUserId, receiverUserId )
	  if err != nil {
		fmt.Println(err)
		return
	  } 
	 
	return err
}

func getMessageHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
    // Parse query parameters
    senderUsername := r.URL.Query().Get("senderusername")
    receiverUsername := r.URL.Query().Get("receiverusername")
    // limitStr := r.URL.Query().Get("limit")
    // offsetStr := r.URL.Query().Get("offset")

    // Convert limit and offset to integers
	pageStr := r.URL.Query().Get("page")
    page, err := strconv.Atoi(pageStr)
    if err != nil {
        // handle error
    }

    const limit = 10
    offset := (page - 1) * limit

    // offset, err = strconv.Atoi(offsetStr)
    // if err != nil {
    //     fmt.Println("Error converting offset:", err)
    //     http.Error(w, "Invalid offset", http.StatusBadRequest)
    //     return
    // }

    // Fetch messages
    privateMessages, err := helpers.GetPrivateMessages(db, senderUsername, receiverUsername, limit, offset)
    if err != nil {
        fmt.Println("Error fetching messages:", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Handle case when no messages are found
    if len(privateMessages) == 0 {
        fmt.Println("No messages found")
        w.Write([]byte("[]")) // Send empty JSON array
        return
    }

    // Send messages as JSON
    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(privateMessages); err != nil {
        fmt.Println("Error encoding messages:", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
    }
}


func messageHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	fmt.Println("do i get called")
	var msg struct {
		Message  string `json:"message"`
		SenderUsername string `json:"senderusername"`
		Receiverusername string `json:"receiverusername"`
		Id int `json:"Id"`
	  }
	  err := json.NewDecoder(r.Body).Decode(&msg)
	  fmt.Println("this is msg", msg.Message, "this is user that sent messsage:", msg.SenderUsername, "and receiver",msg.Receiverusername)
	  if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	  }
	
	  // Here you would insert the message into your database
	  // db.Query("INSERT INTO messages (content, username) VALUES (?, ?)", msg.Message, msg.Username)
	  senderUserId, err := helpers.GetUserID(msg.SenderUsername)
	  if err != nil {
		fmt.Println(err)
	  }
	  receiverUserId, err := helpers.GetUserID(msg.Receiverusername)
	  if err != nil {
		fmt.Println(err)
	  }
	  _, err = db.Exec("INSERT INTO private_messages (content, sender_id, receiver_id) VALUES (?, ?, ?)", msg.Message, senderUserId, receiverUserId )
	  if err != nil {
		fmt.Println(err)
		return
	  } 
	  // Respond back to the client
	  json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func handleGithubLogin(w http.ResponseWriter, r *http.Request) {
	githubClientID := "25d7ff2314f58883dc2a"

	// Create the dynamic redirect URL for login
	redirectURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s",
		githubClientID,
		"http://localhost:8080/callbackgithub",
	)

	http.Redirect(w, r, redirectURL, http.StatusMovedPermanently)

}

func handleCallback(w http.ResponseWriter, r *http.Request, db *sql.DB) {

	if r.FormValue("state") != helpers.RandomState {
		fmt.Println("State is not valid")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	token, err := helpers.GoogleOauthConfig.Exchange(context.Background(), r.FormValue("code"))

	if err != nil {
		fmt.Fprintf(w, "Could not get token: %s\n", err.Error())
		return
	}

	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		fmt.Printf("Could not create get request: %s/n", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	defer resp.Body.Close()
	content, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Could not  parse response : %s/n", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	var GoogleResponse helpers.GoogleResponse
	if err := json.Unmarshal(content, &GoogleResponse); err != nil {
		fmt.Printf("Error unmarshalling response: %s\n", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	helpers.SQLAuthorize(w, r, db, GoogleResponse.Name, GoogleResponse.Email)

}
func HandleCallbackGithub(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	code := r.URL.Query().Get("code")

	githubAccessToken := helpers.GetGithubAccessToken(code)

	username := helpers.GetGithubData(githubAccessToken)

	helpers.SQLAuthorize(w, r, db, username, "")

}

func handleVote(w http.ResponseWriter, r *http.Request, voteType string, comment bool) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var vote Vote
	err := json.NewDecoder(r.Body).Decode(&vote)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	db, err := helpers.GetDbConnection()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get DB connection: %v", err), http.StatusInternalServerError)
	}
	defer db.Close()

	userSession, err := helpers.ValidateSessionFromCookie(w, r)
	if err != nil {
		http.Error(w, "Invalid username", http.StatusBadRequest)
		return
	}

	userID := helpers.SQLSelectUserID(db, userSession.Username)

	err = helpers.SQLinsertVote(vote.PostID, userID, voteType, comment)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	likesCount, err := helpers.SQLGetVotesCount(db, vote.PostID, "like", comment)
	if err != nil {
		http.Error(w, "failed to get likes count for post ID %d: %w", vote.PostID)
	}
	dislikesCount, err := helpers.SQLGetVotesCount(db, vote.PostID, "dislike", comment)
	if err != nil {
		http.Error(w, "failed to get likes count for post ID %d: %w", vote.PostID)
	}

	response := map[string]int{
		"likesCount":    likesCount,
		"dislikesCount": dislikesCount,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func likeHandler(w http.ResponseWriter, r *http.Request) {
	handleVote(w, r, "like", false)
}

func dislikeHandler(w http.ResponseWriter, r *http.Request) {
	handleVote(w, r, "dislike", false)
}

func commentLikeHandler(w http.ResponseWriter, r *http.Request) {
	handleVote(w, r, "like", true)
}

func commentDislikeHandler(w http.ResponseWriter, r *http.Request) {
	handleVote(w, r, "dislike", true)
}

func filterPage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	categories, err := formValue(w, r)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed in formValue: %v", err), http.StatusBadRequest)
		return
	}

	db, err := helpers.GetDbConnection()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get DB connection: %v", err), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	posts, err := filterPosts(db, categories)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to filter posts: %v", err), http.StatusInternalServerError)
		return
	}

	comments, err := getCommentsFromDatabase(db)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to retrieve comments: %v", err), http.StatusInternalServerError)
		return
	}

	posts = addCommentsToPost(posts, comments)
	likesToPostsAndComments(db, posts)

	for _, v := range posts {
		likesCount, err := helpers.SQLGetVotesCount(db, v.ID, "like", false)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to get likes count for post ID %d: %v", v.ID, err), http.StatusInternalServerError)
			return
		}
		v.Likes = likesCount
	}

	data := HomePageData{
		Posts: posts,
	}
	// before i parsed the filteredPage here. Though i think it is actually unnecessary
	t, err := template.ParseFiles("templates/homepage.html")
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = t.Execute(w, data)
	if err != nil {
		http.Error(w, "Error executing template", http.StatusInternalServerError)
		return
	}
}

func addCommentsToPost(posts []Post, comments []Comment) (modPosts []Post) {
	modPosts = make([]Post, len(posts))
	for i, post := range posts {
		modPosts[i] = post
		for _, comment := range comments {
			if posts[i].ID == comment.PostID {
				modPosts[i].Comments = append(modPosts[i].Comments, comment)
			}
		}
	}
	return modPosts
}

func admin(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userSession, error := helpers.ValidateSessionFromCookie(w, r)

	if userSession == nil {
		helpers.DeleteCookie(w, r)
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if userSession != nil {
		if userSession.Username != "Admin" {
			http.Redirect(w, r, "/", http.StatusForbidden)
			return
		}
		if error != nil {
			http.Error(w, "This is error", http.StatusBadRequest)
			return
		}
	}

	var moderationRequests []string

	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing in Admin func", http.StatusBadRequest)
	}

	if r.Method == http.MethodPost {
		remove := r.FormValue("remove")
		accept := r.FormValue("accept")
		decline := r.FormValue("decline")

		if accept != "" {
			helpers.SQLAnswerModerationRequest(db, accept, "SetToModerator")
		} else if decline != "" {
			helpers.SQLAnswerModerationRequest(db, decline, "")
		} else {
			fmt.Println("Excuse-moi?")
		}

		if remove != "" {
			helpers.SQLAnswerModerationRequest(db, remove, "RemoveModeration")
		}
	}

	moderationRequests, _ = helpers.SQLSelectModeratorRequest(db, false)
	moderators, _ := helpers.SQLSelectModeratorRequest(db, true)

	data := HomePageData{
		Moderators:         moderators,
		ModerationRequests: moderationRequests,
	}

	t, err := template.ParseFiles("templates/admin.html")
	if err != nil {
		log.Printf("Error parsing template: %v", err)

		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = t.Execute(w, data)
	if err != nil {
		log.Printf("Error executing template: %v", err)
		http.Error(w, "Error executing template", http.StatusInternalServerError)
		return
	}
}

func submitComment(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	fmt.Println("SubmitComment got called")
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
  // Parse the request body as JSON
	var requestBody struct {
		PostID  string `json:"postID"`
		Comment string `json:"comment"`
	}
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Error parsing JSON", http.StatusBadRequest)
		return
	}


	userSession, _ := helpers.ValidateSessionFromCookie(w, r)
	if err != nil {
        http.Error(w, "User not authenticated", http.StatusUnauthorized)
        return
    }
	userID := helpers.SQLSelectUserID(db, userSession.Username)
	 // Extract post ID and comment from the JSON request body
	 postID := requestBody.PostID
	 comment := requestBody.Comment
	fmt.Printf("the comment inside submitComment is: %v \n", comment)
	if postID == "" {
        http.Error(w, "Missing post ID", http.StatusBadRequest)
        fmt.Println("Post ID is missing, post ID is:", postID, "the comment is:", comment)
        return
    }

    fmt.Printf("The comment inside submitComment is: %v\n", comment)

    if comment == "" {
        http.Error(w, "Creating empty comment is forbidden.", http.StatusBadRequest)
    } else {
        if err := helpers.SQLInsertComment(db, postID, comment, userID); err != nil {
            http.Error(w, "Error inserting comment", http.StatusInternalServerError)
            return
        }
    }

    // Redirect to the appropriate page, e.g., assuming you have an "homepage.html" page
    http.Redirect(w, r, "homepage.html", http.StatusSeeOther)
}

func addComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("addComment got called!")

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed: func addComment", http.StatusMethodNotAllowed)
		return
	}
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadGateway)
		return
	}

	postID := r.FormValue("id")
	if postID == "" {
		http.Error(w, "missing post id", http.StatusBadRequest)
		fmt.Println( " err")
		return
	}
	// t, err := template.ParseFiles("templates/addcomment.html")
	// if err != nil {
	// 	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	// 	return
	// }

	// err = t.Execute(w, postID)
	// if err != nil {
	// 	http.Error(w, "Error executing template", http.StatusInternalServerError)
	// 	return
	// }

	//incase we try to pass the postID 

}

func createPost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	categories, err := formValue(w, r)
	if err != nil {
		http.Error(w, "Failed in formValue", http.StatusBadRequest)
		return
	}

	postContent := r.FormValue("postContent")

	userSession, _ := helpers.ValidateSessionFromCookie(w, r)

	userID := helpers.SQLSelectUserID(db, userSession.Username)
	if postContent != "" {
		if err := helpers.SQLInsertPost(db, postContent, userID); err != nil {
			http.Error(w, "failed to insert post: %w", http.StatusBadRequest)
		}
	} else {
		http.Error(w, "Creating empty post is forbidden.", http.StatusBadRequest)
	}
	postID, err := helpers.SQLLastPostID(db)
	if err != nil {
		http.Error(w, "Failed to get last post ID", http.StatusInternalServerError)
		return
	}
	helpers.SQLInsertCategorie(db, postID, categories)

	http.Redirect(w, r, "homepage.html", http.StatusSeeOther)
}

func serveCreatePostPage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	http.ServeFile(w, r, "templates/createpost.html")
}

func logOutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	helpers.DeleteCookie(w, r)

	http.ServeFile(w, r, "templates/logout.html")
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	http.ServeFile(w, r, "templates/newpage.html")
}

func likesToPostsAndComments(db *sql.DB, posts []Post) error {
	for i := range posts {
		// Added time since post.
		postAgo := helpers.PostedAgo(posts[i].CreatedAt)
		posts[i].PostedAgo = postAgo
		posts[i].CommentCount = helpers.SQLGetCommentCount(db, posts[i].ID)

		likesCount, err := helpers.SQLGetVotesCount(db, posts[i].ID, "like", false)
		if err != nil {
			return fmt.Errorf("failed to get likes count for post ID %d: %w", posts[i].ID, err)
		}
		posts[i].Likes = likesCount

		dislikesCount, err := helpers.SQLGetVotesCount(db, posts[i].ID, "dislike", false)
		if err != nil {
			return fmt.Errorf("failed to get dislikes count for post ID %d: %w", posts[i].ID, err)
		}
		posts[i].Dislikes = dislikesCount

		for j := range posts[i].Comments {

			// adding time since comment.
			commentAgo := helpers.PostedAgo(posts[i].Comments[j].CreatedAt)
			posts[i].Comments[j].PostedAgo = commentAgo

			commentLikesCount, err := helpers.SQLGetVotesCount(db, posts[i].Comments[j].ID, "like", true)
			if err != nil {
				return fmt.Errorf("failed to get likes count for comment ID %d: %w", posts[i].Comments[j].ID, err)
			}
			posts[i].Comments[j].Likes = commentLikesCount

			commentDislikesCount, err := helpers.SQLGetVotesCount(db, posts[i].Comments[j].ID, "dislike", true)
			if err != nil {
				return fmt.Errorf("failed to get dislikes count for comment ID %d: %w", posts[i].Comments[j].ID, err)
			}
			posts[i].Comments[j].Dislikes = commentDislikesCount
		}
	}

	return nil
}

func homePageHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// if r.Method != http.MethodGet {
	// 	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	// 	return
	// }

	//i had to outcomment it because i am calling this handler from another handler

	posts, _ := getPostsFromDatabase(db, "normal", "")
	comments, _ := getCommentsFromDatabase(db)
	posts = addCommentsToPost(posts, comments)
	likesToPostsAndComments(db, posts)
	

	userSession, err := helpers.ValidateSessionFromCookie(w, r)
	var username string
	var role string
	var moderationRequests []string
	var count int
	if userSession != nil {
		username = userSession.Username
		role, err = helpers.SQLGetUserRole(db, userSession.Username)
		if err != nil {
			fmt.Println("Failed to get role")
		}
		moderationRequests, _ = helpers.SQLSelectModeratorRequest(db, false)
		count, err = helpers.CountSQL(db, "reportedRequests", "")
	} else {
		fmt.Println("This is usersession in homepagehandler \n", userSession)
		fmt.Println("This is error", err)
	}

	usernameId, err := helpers.GetUserID(username)
	if err != nil {
		fmt.Println(err)
	}

	usernames, err := helpers.GetUsernames(db, usernameId)
	if err != nil {
		fmt.Println("This is error:", err)
	}
	// admin pw is Admin123

	data := HomePageData{
		Username:           username,
		Usernames:          usernames,
		Posts:              posts,
		Role:               role,
		ModerationRequests: moderationRequests,
		ReportedRequests:   count,
		UsernameId:         usernameId,
	}

	fmt.Println("HomepageHandler got called!")
	//fmt.Println(data)

	if err != nil {
		// if error exists, mean there is no session and show view page only.
		var rawMessage = "Usersession is not valid! Proceed to registration page!"

		message, err := json.Marshal(rawMessage)
		if err != nil {
			fmt.Printf("Could now marshal data %s\n", err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(message)
	} else {
		//fmt.Println(string(jsonData))
		jsonData, err := json.Marshal(data)
		if err != nil {
			fmt.Printf("Could now marshal data %s\n", err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
	}

}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("early success")
	var response struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}

	if r.Method != http.MethodPost {
		response.Success = false
		response.Message = "Method not allowed"
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	err := r.ParseForm()
	if err != nil {
		response.Success = false
		response.Message = "Error parsing form"
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	} else {
		fmt.Println("this is not error ")
	}
	var requestData struct {
		Username            string `json:"username"`
		PasswordRaw         string `json:"password"`
		Email               string `json:"email"`
		AppliesForModerator string `json:"checkbox"`
	}

	err = json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		fmt.Println("Failed to decode request body in: registerHandler")
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	username2 := requestData.Username
	email2 := requestData.Email
	appliesForModerator2 := requestData.AppliesForModerator
	password2 := requestData.PasswordRaw

	body := r.FormValue("body")
	fmt.Println("abybody_", body)
	//username := r.FormValue("username")
	//passwordRaw := r.FormValue("password")
	cryptedPassword, err := helpers.PasswordCrypter(password2)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
	}
	email := r.FormValue("email")
	//appliesForModerator := r.FormValue("checkbox")
	fmt.Println(username2, password2, email, "empty?")

	var apply int

	if appliesForModerator2 != "" {
		apply = 1
	} else {
		apply = 0
	}

	err = helpers.InitalizeDb(username2, string(cryptedPassword), email2, "user", apply)
	if err != nil {

		errMessage, _ := helpers.ErrorCheck(err)
		response.Success = false
		response.Message = errMessage
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	} else {
		fmt.Println(err, "is error")
	}

	response.Success = true
	response.Message = "Registration successful"
	json.NewEncoder(w).Encode(response)

	fmt.Println("success")
}

func loginHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// if r.Method != http.MethodPost {
	// 	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	// 	return
	// }
	// w.Header().Set("Access-Control-Allow-Origin", "*") // This allows any website to access this API. Adjust as needed for security reasons.
	// w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	// w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")

	// // If it's just an OPTIONS request (pre-flight), then just return with an OK status.
	// if r.Method == "OPTIONS" {
	//     w.WriteHeader(http.StatusOK)
	//     return
	// }

	var requestData map[string]string
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		bodyBytes, _ := ioutil.ReadAll(r.Body)
		fmt.Println("Raw body:", string(bodyBytes))
		http.Error(w, "Error decoding request body", http.StatusBadRequest)
		return
	}

	err = r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadGateway)
		return
	}
	fmt.Println("Inside loginhandler2")

	username := requestData["login-username"]
	password := requestData["login-password"]
	fmt.Println("this is password", password, username)
	row := db.QueryRow("SELECT password FROM users WHERE username = ?;", username)

	var hashedPassword string
	err = row.Scan(&hashedPassword)

	if err == sql.ErrNoRows {
		fmt.Println("Err1")
		http.Redirect(w, r, "/registration.html?error=Invalid username or password!", http.StatusSeeOther)
		return
	} else if err != nil {
		fmt.Println("Err2")
		http.Error(w, "Failed to execute query", http.StatusInternalServerError)
		return
	}

	match, _ := helpers.PasswordCheck(password, hashedPassword)
	fmt.Println("Inside loginhandler3")
	if match {
		helpers.CreateSession(w, r, username)
		http.Redirect(w, r, "/homepage", http.StatusSeeOther) // Assuming "/home" is the route for the homePageHandler
		fmt.Println("Login handler got called with correct password")
	} else {
		fmt.Println("Login handler got called with wrong password")
		
		http.Redirect(w, r, "/registration.html?error=Invalid username or password!", http.StatusSeeOther)
	}
}

func getReportedPostsFromDatabase(db *sql.DB) ([]Post, error) {
	rows, err := db.Query("SELECT posts.id, posts.content, posts.created_at, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE flagged = 1;")
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}

	if rows != nil {
		defer rows.Close()

		var posts []Post
		for rows.Next() {
			var post Post
			if err := rows.Scan(&post.ID, &post.Content, &post.CreatedAt, &post.Username); err != nil {
				return nil, fmt.Errorf("failed to scan row: %v", err)
			}
			posts = append(posts, post)
		}

		if err := rows.Err(); err != nil {
			return nil, fmt.Errorf("failed after iterating rows: %v", err)
		}

		return posts, nil
	}

	return nil, fmt.Errorf("no rows to return")
}

func getPostsFromDatabase(db *sql.DB, postsQuery string, username string) ([]Post, error) {
	var rows *sql.Rows
	var err error

	if postsQuery == "normal" {
		rows, err = db.Query("SELECT posts.id, posts.content,  posts.created_at, users.username FROM posts JOIN users ON posts.user_id = users.id;")
		if err != nil {
			return nil, fmt.Errorf("failed to execute query: %v", err)
		}
	} else if postsQuery == "myposts" {
		rows, err = db.Query(`SELECT posts.id, posts.content, posts.created_at, users.username 
		FROM posts 
		JOIN users ON posts.user_id = users.id 
		WHERE users.username = ?;`, username)
		if err != nil {
			return nil, fmt.Errorf("failed to execute query: %v", err)
		}
	} else if postsQuery == "mylikedposts" {
		// Merci
		rows, err = db.Query(`SELECT 
		posts.id, 
		posts.content, 
		posts.created_at,
		authors.username 
		FROM 
		post_votes 
		JOIN 
		users as likers ON post_votes.user_id = likers.id 
		JOIN 
		posts ON post_votes.post_id = posts.id 
		JOIN 
		users as authors ON posts.user_id = authors.id 
		WHERE 
		likers.username = ? 
		AND post_votes.vote_type = 'like';
	`, username)
		if err != nil {
			return nil, fmt.Errorf("failed to execute query: %v", err)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}

	if rows != nil {
		defer rows.Close()

		var posts []Post
		for rows.Next() {
			var post Post
			if err := rows.Scan(&post.ID, &post.Content, &post.CreatedAt, &post.Username); err != nil {
				return nil, fmt.Errorf("failed to scan row: %v", err)
			}
			posts = append(posts, post)
		}

		if err := rows.Err(); err != nil {
			return nil, fmt.Errorf("failed after iterating rows: %v", err)
		}

		return posts, nil
	}

	return nil, fmt.Errorf("fo rows to return")
}

func getCommentsFromDatabase(db *sql.DB) ([]Comment, error) {
	rows, err := db.Query("SELECT comments.id, comments.content, comments.created_at, posts.id AS post_id, users.username FROM comments JOIN posts ON comments.post_id = posts.id JOIN users ON comments.user_id = users.id;")
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}

	defer rows.Close()
	var comments []Comment
	for rows.Next() {
		var comment Comment
		if err := rows.Scan(&comment.ID, &comment.Content, &comment.CreatedAt, &comment.PostID, &comment.Username); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed after iterating rows: %v", err)
	}
	return comments, nil
}

func filterPosts(db *sql.DB, categories []int) (posts []Post, err error) {
	postMap := make(map[int]Post)
	for _, category := range categories {
		if category != 0 {
			rows, err := db.Query(`SELECT posts.id, posts.content, posts.created_at, users.username 
			FROM posts 
			JOIN post_categories 
			ON posts.id = post_categories.post_id 
			JOIN users ON posts.user_id = users.id
			WHERE post_categories.category_id = ?;`, category)
			if err != nil {
				return nil, fmt.Errorf("failed to execute query: %v", err)
			}
			defer rows.Close()

			for rows.Next() {
				var post Post
				if err := rows.Scan(&post.ID, &post.Content, &post.CreatedAt, &post.Username); err != nil {
					return nil, fmt.Errorf("failed to scan row: %v", err)
				}
				// If the post is not in the map, add it.
				if _, exists := postMap[post.ID]; !exists {
					postMap[post.ID] = post
				}
			}

			if err := rows.Err(); err != nil {
				return nil, fmt.Errorf("failed after iterating rows: %v", err)
			}
		}
	}

	for _, post := range postMap {
		posts = append(posts, post)
	}

	return posts, nil
}

func formValue(w http.ResponseWriter, r *http.Request) ([]int, error) {
	err := r.ParseForm()
	if err != nil {
		return nil, fmt.Errorf("error parsing form: %v", err)
	}

	csValue := r.FormValue("counter-strike")
	lolValue := r.FormValue("league")
	rsValue := r.FormValue("runescape")

	var categories []int

	if csValue != "" {
		strCsValue, err := strconv.Atoi(csValue)
		if err != nil {
			return nil, fmt.Errorf("error converting counter-strike value: %v", err)
		}
		categories = append(categories, strCsValue)
	}

	if lolValue != "" {
		strLolValue, err := strconv.Atoi(lolValue)
		if err != nil {
			return nil, fmt.Errorf("error converting league value: %v", err)
		}
		categories = append(categories, strLolValue)
	}

	if rsValue != "" {
		strRsValue, err := strconv.Atoi(rsValue)
		if err != nil {
			return nil, fmt.Errorf("error converting runescape value: %v", err)
		}
		categories = append(categories, strRsValue)
	}

	return categories, nil
}

func showMyPostsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	err := r.ParseForm()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error parsing form: %v", err), http.StatusBadRequest)
		return
	}

	formValue := r.FormValue("myposts")

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userSession, _ := helpers.ValidateSessionFromCookie(w, r)
	var username string
	var role string
	if userSession != nil {
		username = userSession.Username
		role, _ = helpers.SQLGetUserRole(db, userSession.Username)
	}

	posts, _ := getPostsFromDatabase(db, formValue, userSession.Username)
	comments, _ := getCommentsFromDatabase(db)

	posts = addCommentsToPost(posts, comments)

	likesToPostsAndComments(db, posts)

	data := HomePageData{
		Username: username,
		Posts:    posts,
		Role:     role,
	}

	t, err := template.ParseFiles("templates/homepage.html")
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = t.Execute(w, data)
	if err != nil {
		http.Error(w, "Error executing template", http.StatusInternalServerError)
		return
	}
}

func deletePostHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	err := r.ParseForm()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var postID int
	var status string
	if r.FormValue("delete") != "" {
		postID, err = strconv.Atoi(r.FormValue("delete"))
		status = "delete"
	} else if r.FormValue("report") != "" {
		postID, err = strconv.Atoi(r.FormValue("report"))
		status = "report"
	} else {
		http.Error(w, "Either report or delete parameter required", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = helpers.SQLDeletePost(db, postID, status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	redirectLocation := "homepage.html"
	if status == "delete" {
		redirectLocation = "report"
	}
	http.Redirect(w, r, redirectLocation, http.StatusSeeOther)
}

func reportPostHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	userSession, err := helpers.ValidateSessionFromCookie(w, r)
	if err != nil {
		http.Error(w, "Failed to validate session from cookie: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var role string
	if userSession != nil {
		role, err = helpers.SQLGetUserRole(db, userSession.Username)
		if err != nil {
			http.Error(w, "Failed to get user role: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if role != "moderator" {
		helpers.DeleteCookie(w, r)
		http.Redirect(w, r, "/", http.StatusForbidden)
		return
	}

	posts, err := getReportedPostsFromDatabase(db)
	if err != nil {
		http.Error(w, "Failed to get reported posts from database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	comments, err := getCommentsFromDatabase(db)
	if err != nil {
		http.Error(w, "Failed to get comments from database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	posts = addCommentsToPost(posts, comments)
	err = likesToPostsAndComments(db, posts)
	if err != nil {
		http.Error(w, "Failed to add likes to posts and comments: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = r.ParseForm()
	if err != nil {
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusInternalServerError)
		return
	}

	report := r.FormValue("report")
	delete := r.FormValue("delete")

	if report != "" {
		reportInt, err := strconv.Atoi(report)
		if err != nil {
			http.Error(w, "Failed to convert report to integer: "+err.Error(), http.StatusInternalServerError)
			return
		}
		err = helpers.SQLDeletePost(db, reportInt, "report")
		if err != nil {
			http.Error(w, "Failed to report post: "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else if delete != "" {
		deleteInt, err := strconv.Atoi(delete)
		if err != nil {
			http.Error(w, "Failed to convert delete to integer: "+err.Error(), http.StatusInternalServerError)
			return
		}
		err = helpers.SQLDeletePost(db, deleteInt, "delete")
		if err != nil {
			http.Error(w, "Failed to delete post: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	data := HomePageData{
		Posts: posts,
		Role:  role,
	}

	t, err := template.ParseFiles("templates/reportedposts.html")
	if err != nil {
		http.Error(w, "Failed to parse template: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = t.Execute(w, data)
	if err != nil {
		http.Error(w, "Failed to execute template: "+err.Error(), http.StatusInternalServerError)
	}
}
