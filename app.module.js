var app = angular.module('valetState', ['ngResource', 'ngAnimate', 'ngRoute']);
// stateCtrl
app.controller('loginCtrl', function($scope, $window, $location, $http) {
	function getHashParams() {
		var hashParams = {};
		var e, r = /([^&;=]+)=?([^&;]*)/g,
			q = document.cookie;
		while (e = r.exec(q)) {
			hashParams[e[1]] = decodeURIComponent(e[2]);
		}
		return hashParams;
	}

	var params = getHashParams();
	console.log(params);
	var accessToken = params.accessToken,
		refreshToken = params.refreshToken,
		userID = params.userID;
	//
	// if (error) {
	// 	alert('Authentication was not completed successfully');
	// 	$window.location.href = '/';
	// }
	var user = {};
	if (accessToken) {
		// Gets user information
		$http({
			method: 'GET',
			url: 'https://api.spotify.com/v1/me',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then(function(response) {
			console.log(response);
			if (response.error) {
				alert('Could not authorize request for user information.');
				$window.location.href = '/';
			} else {
				user = response.data;
				$scope.userInfo = user;
			}
		});

		//Get user's playlists
		$http({
			method: 'GET',
			url: 'https://api.spotify.com/v1/me/playlists',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then(function(response) {
			console.log(response);
			if (response.error) {
				alert('Could not authorize request for user information.');
				$window.location.href = '/';
			} else {
				console.log('response items are', response.data.items);
				$scope.playlists = response.data.items;
			}
		});

	} else {
		alert('Login token has expired. Please log in again.');
		$window.location.href = '/';
	}

	$scope.getSongs = function(playListID) {
		var userID = user.id;
		getSongsReq(playListID, accessToken, userID);
	};

	var getSongsReq = function(id, accessToken, userID) {
		console.log('getSongs triggered. playlistID:', id, 'accessToken:', accessToken, 'userID:', userID);
		$http({
			method: 'GET',
			url: 'https://api.spotify.com/v1/users/' +
				userID +
				'/playlists/' +
				id +
				'/tracks',
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		}).then(function(response, status) {
			console.log('getSongs response', response);
			console.log('response error:', response.error);
			if (response.error) {
				alert('Spotify encountered an error receiving tracks for this playlist.');
			} else {
				$scope.tracks = response.data.items;
			}
		}, function errorCallback(response) {
			console.log("Server error", response.data.error.status, response.data.error.statusText);
		});
	};
});

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'login.html'
		})
		.when('/about', {
			templateUrl: 'about.html'
		})
		.when('/loggedin', {
			templateUrl: 'user.html'
		})
		.when('/error', {
			templateUrl: 'error.html'
		});
});
