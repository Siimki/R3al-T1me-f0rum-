package helpers



import (
		"net/http"
		"fmt"
		"golang.org/x/oauth2"
		"golang.org/x/oauth2/google"
		"log"
		"encoding/json"
		"bytes"
		"io/ioutil"

			
)

var ( 
	GoogleOauthConfig = &oauth2.Config{
		RedirectURL: "http://localhost:8080/callback",
		ClientID: "976310999115-8jrtuis8pdjutulstcau808h883pjj94.apps.googleusercontent.com",
		ClientSecret: "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",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
	RandomState = "random"
)

type GoogleResponse struct {
	Name string `json:"name"`
	Email string `json:"email"`
	Login string `json:"login"`
}

func GetGithubData(accessToken string) string {
    // Get request to a set URL
    req, reqerr := http.NewRequest(
        "GET",
        "https://api.github.com/user",
        nil,
    )
    if reqerr != nil {
        log.Panic("API Request creation failed")
    }

    // Set the Authorization header before sending the request
    // Authorization: token XXXXXXXXXXXXXXXXXXXXXXXXXXX
    authorizationHeaderValue := fmt.Sprintf("token %s", accessToken)
    req.Header.Set("Authorization", authorizationHeaderValue)

    // Make the request
    resp, resperr := http.DefaultClient.Do(req)
    if resperr != nil {
        log.Panic("Request failed")
    }

    // Read the response as a byte slice
    respbody, _ := ioutil.ReadAll(resp.Body)
	var GoogleResponse GoogleResponse
	if err := json.Unmarshal(respbody, &GoogleResponse) ; err != nil {
		fmt.Printf("Error unmarshalling response: %s\n", err.Error())	
	}


    return GoogleResponse.Login
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling Login")
	url := GoogleOauthConfig.AuthCodeURL(RandomState)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}




func GetGithubAccessToken(code string) string {

    clientID := "25d7ff2314f58883dc2a"
    clientSecret := "535b62c3d51a5b5dc38a9654ed6dfe034c1a8c28"

    // Set us the request body as JSON
    requestBodyMap := map[string]string{
        "client_id": clientID,
        "client_secret": clientSecret,
        "code": code,
    }
    requestJSON, _ := json.Marshal(requestBodyMap)

    // POST request to set URL
    req, reqerr := http.NewRequest(
        "POST",
        "https://github.com/login/oauth/access_token",
        bytes.NewBuffer(requestJSON),
    )
    if reqerr != nil {
        log.Panic("Request creation failed")
    }
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Accept", "application/json")

    // Get the response
    resp, resperr := http.DefaultClient.Do(req)
    if resperr != nil {
        log.Panic("Request failed")
    }

    // Response body converted to stringified JSON
    respbody, _ := ioutil.ReadAll(resp.Body)

    // Represents the response received from Github
    type githubAccessTokenResponse struct {
        AccessToken string `json:"access_token"`
        TokenType   string `json:"token_type"`
        Scope       string `json:"scope"`
    }

    // Convert stringified JSON to a struct object of type githubAccessTokenResponse
    var ghresp githubAccessTokenResponse
    json.Unmarshal(respbody, &ghresp)

    // Return the access token (as the rest of the
    // details are relatively unnecessary for us)
    return ghresp.AccessToken
}
