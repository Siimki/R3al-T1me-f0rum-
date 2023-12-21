package helpers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	Username string
	Expiry   time.Time
}

var sessions = map[string]Session{}

func CreateSession(w http.ResponseWriter, r *http.Request, user string) {

	Check(user) //Check if user cookie already exists, if exists: DELETE old one, make new one.
	//so only 1 browser can be active at once

	sessionToken := uuid.NewString()
	expiresAt := time.Now().Add(2400 * time.Second)

	sessions[sessionToken] = Session{
		Username: user,
		Expiry:   expiresAt,
	}

	// Create a new cookie with the session token
	cookie := &http.Cookie{
		Name:    "session_token",
		Value:   sessionToken,
		Expires: expiresAt,
	}

	// Set the cookie in the response
	http.SetCookie(w, cookie)

	fmt.Println("Session token cookie:", cookie.Value) //Check the cookie value

}

func ValidateSessionFromCookie(w http.ResponseWriter, r *http.Request) (*Session, error) {
	// this func idea is to check if cookie exists? get the info from the cookie
	c, err := r.Cookie("session_token")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return nil, err
		}

		w.WriteHeader(http.StatusBadRequest)
		return nil, err
	}
	sessionToken := c.Value

	userSession, exists := sessions[sessionToken]
	if !exists {
		return nil, fmt.Errorf("session does not exist")
	}

	if userSession.IsExpired() {
		delete(sessions, sessionToken)
		return nil, fmt.Errorf("session expired")
	}

	//	fmt.Println("At the end of OK")
	return &userSession, nil
}

//referesh is not really necessary for our project.
//it can refresh the cookie

func Refresh(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("session_token")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		w.WriteHeader(http.StatusBadRequest)
		return
	}
	sessionToken := c.Value

	userSession, exists := sessions[sessionToken]
	if !exists {
		return
	}

	if userSession.IsExpired() {
		delete(sessions, sessionToken)
		return
	}

	newSessionToken := uuid.NewString()
	expiresAt := time.Now().Add(120 * time.Second)

	//if previous session is valid, create new.

	sessions[newSessionToken] = Session{
		Username: userSession.Username,
		Expiry:   expiresAt,
	}
	delete(sessions, sessionToken)

	http.SetCookie(w, &http.Cookie{
		Name:    "session_token",
		Value:   newSessionToken,
		Expires: time.Now().Add(120 * time.Second),
	})

}

func (s Session) IsExpired() bool {
	return s.Expiry.Before(time.Now())
}

func Check(user string) {
	for token, session := range sessions { //check if
		if session.Username == user {
			delete(sessions, token)
			break
		}
	}
}

func DeleteCookie(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("session_token")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	sessionToken := c.Value

	delete(sessions, sessionToken)

	// set cookie to empty value, and set expiry date to now!
	http.SetCookie(w, &http.Cookie{
		Name:    "session_token",
		Value:   "",
		Expires: time.Now(),
	})
}
