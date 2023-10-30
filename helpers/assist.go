package helpers

import (
	
	"time"
	"strconv"
	"fmt"
	"log"
	"net/http"
	"strings"
	"golang.org/x/crypto/bcrypt"
)

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

func PostedAgo(postTime time.Time) (time23 string) {
	var daysPassedString string
	start := postTime

	end := time.Now()
	difference := end.Sub(start)

	daysPassed := difference.Hours() / 24

	if daysPassed < 1 {
		hoursPassed := int(difference.Hours())
		if hoursPassed < 1 {
			minutesPassed := int(difference.Minutes())
			daysPassedString = strconv.Itoa(minutesPassed) + " minutes ago"
		} else {
			daysPassedString = strconv.Itoa(hoursPassed) + " hours ago"
		}
	} else if daysPassed < 2 {
		daysPassedString = "1 day ago"
	} else {
		daysPassedString = strconv.Itoa(int(daysPassed)) + " days ago"
	}

	return daysPassedString
}


func AddCommentsToPost(posts []Post, comments []Comment) (modPosts []Post) {
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

func ErrorCheck(err error) (string, uint) {
	log.Println("Error opening database:", err)
	switch {
	case isDuplicateConstraintError(err, "users.username"):
		return "Username is already taken!", http.StatusBadRequest
	case isDuplicateConstraintError(err, "users.email"):
		return "Email is already taken!", http.StatusBadRequest
	default:
		return "Failed to register user", http.StatusInternalServerError
	}
}

func isDuplicateConstraintError(err error, constraint string) bool {
	return strings.Contains(err.Error(), fmt.Sprintf("UNIQUE constraint failed: %s", constraint))
}

func PasswordCrypter(password string) ([]byte, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}
	return hashedPassword, nil
}


func PasswordCheck(password string, hashedPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false, fmt.Errorf("password check failed: %w", err)
	}
	return true, nil
}