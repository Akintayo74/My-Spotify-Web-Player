const express = require('express')
const request = require('request')
const dotenv = require('dotenv')

const port = 5000

global.access_token = ''

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var app = express()

var generateRandomString = function(length) {
    var text = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for(var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

app.get('/auth/login', (req, res) => {
    console.log('Login endpoint hit');
    var scope = 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state'

    var state = generateRandomString(16)

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: "http://localhost:5173/auth/callback",
        state: state
    })

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString())
})

app.get('/auth/callback', (req, res) => {
    var code = req.query.code
    
    // Handle case where code is missing
    if (!code) {
        console.error('No code provided in callback');
        return res.redirect('/#error=no_code');
    }

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: "http://localhost:5173/auth/callback",
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
    }

    request.post(authOptions, function(error, response, body) {
        if (error) {
            console.error('Error in token request:', error);
            return res.redirect('/#error=token_request_failed');
        }
        
        if (response.statusCode === 200 && body.access_token) {
            global.access_token = body.access_token;
            return res.redirect('http://localhost:5173/');
        } else {
            console.error('Token request failed:', body);
            return res.redirect('/#error=token_request_failed');
        }
    })
})

app.get('/auth/token', (req, res) => {
    res.json({
        access_token: global.access_token
    })
})











// New route for search functionality
app.get('/search', (req, res) => {
    // Get query parameters from the request
    const { q, type = 'track', limit = 10 } = req.query;

    // Check if access token is available
    if (!global.access_token) {
        return res.status(401).json({ error: 'No access token available' });
    }

    // Prepare search options
    var searchOptions = {
        url: 'https://api.spotify.com/v1/search',
        qs: {
            q: q,
            type: type,
            limit: limit
        },
        headers: {
            'Authorization': `Bearer ${global.access_token}`,
            'Content-Type': 'application/json'
        },
        json: true
    };

    // Make the search request
    request.get(searchOptions, function(error, response, body) {
        if (error) {
            return res.status(500).json({ error: 'Search request failed' });
        }

        if (response.statusCode === 200) {
            // Return the search results
            res.json(body);
        } else {
            res.status(response.statusCode).json({ 
                error: 'Search failed', 
                details: body 
            });
        }
    });
});

// ... (rest of the code remains the same)










app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})