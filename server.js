// Initialize library objects for use by node
// Also specify server dependencies
var express = require('express');
var server = express();
var auth_info = require('./apiAuthentication.json');
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

/** Setup Youtube auth information
 * For more information, read examples at
 * https://developers.google.com/youtube/v3/getting-started
 */
var yt_api_key = '';

// Load auth information (secret keys) from file so they aren't accidentally committed anymore
var loadAuth = function () {
	client_id = auth_info.spotify_client_id;
	client_secret = auth_info.spotify_client_secret;
	redirect_uri = auth_info.spotify_redirect_uri;
	yt_api_key = auth_info.youtube_yt_api_key;
};
loadAuth();

// The scopes variable determines what user data you can access when they login
var scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

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
server.use(express.static(__dirname + '/partials'));
server.use(express.static(__dirname + '/src/img'));
server.use(express.static(__dirname + '/')).use(cookieParser());


// Setup Micellaneous Server functions
/**
 * Generates a random string containing numbers and letters
 * Source = https://github.com/spotify/web-api-auth-examples/blob/master/authorization_code/app.js
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var stateKey = 'spotify_auth_state';

if (!client_id || !client_secret || !redirect_uri || !yt_api_key) {
	console.log('Enter spotify authorization and youtube api information in the server.js file then try again.');
} else {

	// Setup request functions
	server.listen(8080, function () {
		console.log('Connection Successful!');
	});

	// server.get('/', function(req, res) {
	// 	res.sendFile(path.join(__dirname + '/index.html'));
	// });


	// Spotify Authorization code. Still needs some tuning.
	server.get('/login', function (req, res) {
		var state = generateRandomString(16);

		res.cookie(stateKey, state);

		res.redirect('https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: client_id,
				scope: scopes,
				redirect_uri: redirect_uri,
				state: state,
				show_dialog: true
			}));
	});

	server.get('/callback', function (req, res) {

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

			request.post(authOptions, function (error, response, body) {
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
					request.get(options, function (error, response, body) {
						console.log(body);
					});

					//we can also pass the token to the browser to make requests from there
					// Stored as an http only token that the browser does not have access to
					res.cookie('accessToken', access_token, {
						httpOnly: true,
						maxAge: (60000 * 60 * 24)
					});
					res.cookie('refreshToken', refresh_token, {
						httpOnly: true,
						maxAge: (60000 * 60 * 24)
					});

					res.redirect('/#!/loggedin');
				} else {
					res.redirect('/#' +
						querystring.stringify({
							error: 'invalid_token'
						}));
				}
			});
		}
	});

	server.get('/refresh_token', function (req, res) {

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
		request.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token;
				res.send({
					'access_token': access_token
				});
			}
		});
	});
	server.get('/logout', function (req, res) {
		res.clearCookie('accessToken');
		res.clearCookie('refreshToken');
		res.redirect('/');
	});

	/*
	 * SPOTIFY HTTP REQUESTS
	 */

	// ***** retrieve user information ******
	server.get('/spotify/isAuthenticated', function (req, res) {
		var spotifyAccessToken = req.cookies['accessToken'];
		var spotifyRefreshToken = req.cookies['refreshToken'];
		if (spotifyAccessToken !== null && spotifyRefreshToken !== null) {
			var options = {
				url: 'https://api.spotify.com/v1/me',
				headers: {
					'Authorization': 'Bearer ' + spotifyAccessToken
				},
				json: true
			};

			// use the access token to access the Spotify Web API
			request.get(options, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					res.send({
						auth: true,
						userInfo: body
					});
				} else {
					res.send({
						auth: false
					});
				}
			});
		}
	});

	// ****** retrieve user playlists *****
	server.get('/spotify/getPlaylists', function (req, res) {
		var spotifyAccessToken = req.cookies['accessToken'];
		var spotifyRefreshToken = req.cookies['refreshToken'];
		if (spotifyAccessToken !== null && spotifyRefreshToken !== null) {
			var options = {
				url: 'https://api.spotify.com/v1/me/playlists',
				headers: {
					'Authorization': 'Bearer ' + spotifyAccessToken
				},
				qs: {
					limit: 50
				},
				json: true
			};

			// use the access token to access the Spotify Web API
			request.get(options, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					res.send({
						data: body,
						error: false
					});
				} else {
					res.send({
						error: true
					});
				}
			});
		}
	});

	// ***** retrieve playlist's songs ******
	server.get('/spotify/getSongs', function (req, res) {
		var spotifyAccessToken = req.cookies['accessToken'];
		var spotifyRefreshToken = req.cookies['refreshToken'];
		var userID = req.query.userID;
		var playlistID = req.query.playlistID;
		if (spotifyAccessToken !== null && spotifyRefreshToken !== null) {
			var options = {
				url: 'https://api.spotify.com/v1/users/' +
				userID +
				'/playlists/' +
				playlistID +
				'/tracks',
				headers: {
					'Authorization': 'Bearer ' + spotifyAccessToken
				},
				json: true
			};

			// use the access token to access the Spotify Web API
			request.get(options, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					res.send({
						data: body,
						error: false
					});
				} else {
					res.send({
						error: true
					});
				}
			});
		}
	});

	/*
	 * YouTube HTTP REQUESTS
	 */

	// ****** Perform search query for a song ******
	server.get('/youtube/search', function (req, res) {
		var searchQuery = req.query.searchQuery;
		var options = {
			url: 'https://www.googleapis.com/youtube/v3/search',
			qs: {
				key: yt_api_key,
				part: 'snippet',
				order: 'viewCount',
				q: searchQuery,
				type: 'video',
				videoEmbeddable: 'true'
			}
		};
		request.get(options, function (error, response) {
			res.send(response);
		});
	});
}
