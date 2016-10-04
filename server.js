// Initialize library objects for use by node
// Also specify server dependencies
var http = require('http');
var express = require('express');
var server = express();
var path = require('path');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var request = require('request');

/** Setup Spotify auth information
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
var client_id = '';
var client_secret = '';
var redirect_uri = '';
// The scopes variable determines what user data you can access when they login
var scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative'

// Setup file routing
server.use('/src/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
server.use('/src/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
server.use('/src/css', express.static(__dirname + '/css'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular-route'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular-resource'));
server.use('/src/scripts', express.static(__dirname + '/node_modules/angular-animate'));
server.use('/src/scripts', express.static(__dirname + '/controller'));
server.use('/src/scripts', express.static(__dirname + '/'));
server.use(express.static(__dirname + '/partials'))
server.use(express.static(__dirname + '/src/img'))


// Setup Micellaneous Server functions
/**
 * Generates a random string containing numbers and letters
 * Source = https://github.com/spotify/web-api-auth-examples/blob/master/authorization_code/app.js
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

if (client_id == '' || client_secret == '' || redirect_uri == '') {
    console.log('Enter spotify authorization information in the server.js file then try again.');
} else {


    // Setup request functions
    server.listen(3000, function() {
        console.log('Connection Successful!');
    })


    server.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });


    // Spotify Authorization code. Still needs some tuning.
    server.get('/login', function(req, res) {
        var state = generateRandomString(16);
        res.cookie(stateKey, state);

        res.redirect('https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scopes,
                redirect_uri: redirect_uri,
                state: state
            }));
    });

    server.get('/callback', function(req, res) {

        // your application requests refresh and access tokens
        // after checking the state parameter

        var code = req.query.code || null;
        var state = req.query.state || null;
        var storedState = req.cookies ? req.cookies[stateKey] : null;

        if (state === null || state !== storedState) {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'state_mismatch'
                }));
        } else {
            res.clearCookie(stateKey);
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                },
                json: true
            };

            request.post(authOptions, function(error, response, body) {
                if (!error && response.statusCode === 200) {

                    var access_token = body.access_token,
                        refresh_token = body.refresh_token;

                    var options = {
                        url: 'https://api.spotify.com/v1/me',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        json: true
                    };

                    // use the access token to access the Spotify Web API
                    request.get(options, function(error, response, body) {
                        console.log(body);
                    });

                    // we can also pass the token to the browser to make requests from there
                    res.redirect('/#' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token
                        }));
                } else {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'invalid_token'
                        }));
                }
            });
        }
    });

    server.get('/refresh_token', function(req, res) {

        // requesting access token from refresh token
        var refresh_token = req.query.refresh_token;
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                res.send({
                    'access_token': access_token
                });
            }
        });
    });
}
