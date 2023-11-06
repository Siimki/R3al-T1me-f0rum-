package helpers



import (
	
	"net/http"
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
)

func SQLAuthorize(w http.ResponseWriter, r *http.Request, db *sql.DB, username string, email string) {

	count, _ := CountSQL(db, "usernameCheck", username)
	if count == 0 {
		InsertUser(db, username, "", email,"user",0)
		CreateSession(w, r, username) 
		http.Redirect(w, r, "/homepage.html", http.StatusTemporaryRedirect)
	} else if count == 1 {
		CreateSession(w, r, username) 
		http.Redirect(w, r, "/homepage.html", http.StatusTemporaryRedirect)
	} else {
		http.Redirect(w, r, "/login", http.StatusTemporaryRedirect)

	}
	
}

func CountSQL(db *sql.DB, status string, username string) (count int, err error) {
	switch status {
	case "reportedRequests":
		err = db.QueryRow("SELECT COUNT (*) FROM posts WHERE flagged = 1;").Scan(&count)
		if err != nil {
			return 0, fmt.Errorf("failed to count reported requests: %v", err)
		}
	case "usernameCheck":
		err = db.QueryRow("SELECT COUNT (*) FROM users WHERE username = ?;", username).Scan(&count)
		if err != nil {
			return 0, fmt.Errorf("failed to count username: %v", err)
		}
	default:
		fmt.Println("Mu isamaa, mu õnn ja rõõm")
	} 

	return count, nil
}

func InsertUser(db *sql.DB, username, password, email, role string, apply int) error {
	stmt, err := db.Prepare("INSERT INTO users(username, password, email, role, appliesformoderator) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare user statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(username, password, email, role, apply)
	if err != nil {
		return fmt.Errorf("failed to execute user statement: %w", err)
	}

	return nil
}

func SQLinsertVote(postID, userID int, voteType string, comment bool) error {

	db, err := GetDbConnection()
	defer db.Close()

	if comment != true {
		_, err = db.Exec(`INSERT INTO post_votes(post_id, user_id, vote_type) VALUES(?, ?, ?) ON CONFLICT(post_id, user_id) DO UPDATE SET vote_type = ?`, postID, userID, voteType, voteType)
		if err != nil {
			return err
		}

		} else {
		_, err = db.Exec(`INSERT INTO comment_votes(comment_id, user_id, vote_type) VALUES(?, ?, ?) ON CONFLICT(comment_id, user_id) DO UPDATE SET vote_type = ?`, postID, userID, voteType, voteType)
		if err != nil {
			return err
		}

	}

	return nil
}

func GetDbConnection() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "registration.db")
	if err != nil {
		return nil, fmt.Errorf("failed to prepare database connection: %w", err)
	}
	return db, nil
}

func InitalizeDb(username string, password string, email string, role string, apply int) error {

	db, err := GetDbConnection()
	if err != nil {
		return fmt.Errorf("failed to get DB connection: %w", err)
	}
	defer db.Close()

	if err := ExecuteSchema(db); err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	if err := InsertUser(db, username, password, email, role, apply); err != nil {
		//fmt.Println("000", email, "000", password, username)
		return fmt.Errorf("failed to insert user: %w", err)
	}

	return nil
}

func getUserID(username string) (int, error) {
	db, err := GetDbConnection()
	if err != nil {
		return 0, fmt.Errorf("failed to get DB connection: %w", err)
	}
	defer db.Close()

	var id int

	err = db.QueryRow("SELECT id FROM users WHERE username = ?;", username).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("user not found")
		}
		return 0, fmt.Errorf("failed to get user ID: %w", err)
	}

	return id, nil
}

func ExecuteSchema(db *sql.DB) error {
	schema, err := ioutil.ReadFile("schema.sql")
	if err != nil {
		return fmt.Errorf("failed to read schema file: %w", err)
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}
	return nil
}

func SQLGetVotesCount(db *sql.DB, postID int, typeOfVote string, isComment bool) (int, error) {
	tableName := "post_votes"
	idField := "post_id"

	if isComment {
		tableName = "comment_votes"
		idField = "comment_id"
	}

	query := fmt.Sprintf(`SELECT COUNT(*) FROM %s WHERE %s = ? AND vote_type = ?;`, tableName, idField)
	row := db.QueryRow(query, postID, typeOfVote)

	var voteCount int
	err := row.Scan(&voteCount)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("no rows found")
		}
		return 0, fmt.Errorf("failed to get vote count: %w", err)
	}

	return voteCount, nil
}

func SQLAnswerModerationRequest(db *sql.DB, username string, status string) error {
	switch status {
	case "SetToModerator":

		_, err := db.Exec("UPDATE users SET role = 'moderator' WHERE users.username = ?;", username)
		if err != nil {
			return fmt.Errorf("Error because: %v", err)
		}

	case "RemoveModeration":

		_, err := db.Exec("UPDATE users SET role = 'user' WHERE users.username = ?;", username)
		if err != nil {
			return fmt.Errorf("Error because: %v", err)
		}

	default:
		// Incase we need to write more queries
	}

	_, err := db.Exec("UPDATE users SET appliesformoderator = 0 WHERE users.username = ?;", username)
	if err != nil {
		return fmt.Errorf("Error because: %v", err)
	}

	return nil
}

func SQLGetCommentCount(db *sql.DB, postID int) int {
	var CommentCount int
	err := db.QueryRow("SELECT COUNT(*) FROM comments WHERE post_id = ?", postID).Scan(&CommentCount)
	if err != nil {
		log.Println("Failed to execute query in commentCount:", err)
	}

	return CommentCount
}

func SQLReportAndDeletePosts(db *sql.DB, postID int, status string) error {
	if status == "report" {
		_, err := db.Exec("UPDATE posts SET flagged = 1 WHERE posts.id = ?;", postID)
		if err != nil {
			return fmt.Errorf("Failed to flag post: %v", err)
		}
	} else if status == "delete" {
		_, err := db.Exec("DELETE FROM posts WHERE posts.id = ?;", postID)
		if err != nil {
			return fmt.Errorf("Failed to flag post: %v", err)
		}
	}

	return nil
}

func SQLInsertCategorie(db *sql.DB, postID int, category_id []int) error {
	for _, catID := range category_id {
		if catID != 0 {
			stmt, err := db.Prepare("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?);")
			if err != nil {
				return fmt.Errorf("failed to prepare user statement: %w", err)
			}
			defer stmt.Close()

			_, err = stmt.Exec(postID, catID)
			if err != nil {
				return fmt.Errorf("failed to execute user statement: %w", err)
			}
		}
	}
	return nil
}

func SQLInsertPost(db *sql.DB, content string, userID int) error {
	stmt, err := db.Prepare("INSERT INTO posts(content, user_id) VALUES (?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare post statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(content, userID)
	if err != nil {
		return fmt.Errorf("failed to execute post statement: %w", err)
	}

	return nil
}
func SQLInsertComment(db *sql.DB, post_id, content string, user_id int) error {
	stmt, err := db.Prepare("INSERT INTO comments(post_id, user_id, content) VALUES (?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare user statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(post_id, user_id, content)
	if err != nil {
		return fmt.Errorf("failed to execute user statement: %w", err)
	}

	return nil
}

func SQLDeletePost(db *sql.DB, postID int, status string) error {
	var stmt *sql.Stmt
	var err error
	if status == "delete" {
		stmt, err = db.Prepare("DELETE FROM posts WHERE posts.id = ?;")
		if err != nil {
			return fmt.Errorf("Error to delete post: %v", err)
		}
	} else if status == "report" {
		stmt, err = db.Prepare("UPDATE posts SET flagged = 1 WHERE posts.id = ?;")
		if err != nil {
			return fmt.Errorf("Error to delete post: %v", err)
		}
	}

	if err != nil {
		return fmt.Errorf("Unable to prepare statement: %v", err)
	}
	defer stmt.Close()

	res, err := stmt.Exec(postID)
	if err != nil {
		return fmt.Errorf("execution failed: %v", err)
	}
	count, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("could not get rows affected: %v", err)
	} else if count == 0 {
		return fmt.Errorf("no rows deleted")
	}

	return nil
}

func SQLSelectUserID(db *sql.DB, username string) (userID int) {
	row := db.QueryRow("SELECT id FROM users WHERE username = ?;", username) 

	err := row.Scan(&userID)
	if err == sql.ErrNoRows {
		fmt.Println("There is no rows in SQL")
		return
	} else if err != nil {
		fmt.Println("Failed to SQL query ")
		return
	}
	return userID
}

func SQLGetUserRole(db *sql.DB, username string) (role string, err error) {
	err = db.QueryRow("SELECT role FROM users WHERE username = ?;", username).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return "None", fmt.Errorf("Role not found")
		}
		return "None", fmt.Errorf("failed to get user role: %w", err)
	}

	return role, nil
}


func SQLSelectModeratorRequest(db *sql.DB, status bool) (usernames []string, err error) {
	var rows *sql.Rows
	var username string
	if status == false {
		rows, err = db.Query("SELECT username FROM users WHERE appliesformoderator = 1;")
	} else if status == true {
		rows, err = db.Query("SELECT username FROM users WHERE role = 'moderator';")
	}

	if err != nil {
		return nil, fmt.Errorf("Failed to query database: %v", err)
	}
	defer func() {
		if closeErr := rows.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close rows: %v", closeErr)
		}
	}()

	for rows.Next() {
		var scanErr error
		if scanErr = rows.Scan(&username); scanErr != nil {
			return nil, fmt.Errorf("failed to scan row: %v", scanErr)
		}
		usernames = append(usernames, username)
	}
	return usernames, nil
}

func SQLLastPostID(db *sql.DB) (tempPostID int, err error) {
	rows, err := db.Query("SELECT id FROM posts ORDER BY ID DESC LIMIT 1;")
	if err != nil {
		return 0, fmt.Errorf("failed to prepare user statement: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		if err := rows.Scan(&tempPostID); err != nil {
			return 0, fmt.Errorf("failed to scan row: %w", err)
		}
	}
	return tempPostID, nil
}