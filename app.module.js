var app = angular.module('valetState', ['ngResource', 'ngAnimate', 'ngRoute']);
// stateCtrl
app.controller('loginCtrl', function($scope, $window, $http) {

	// Get user's spotify information/profile
	console.log('location host is', location.host);
	var user = {};
	$http.get('http://'+ location.host +'/spotify/isAuthenticated').then(function(response) {
		console.log('user info response is', response);
		if (response.data.auth) {
			var userProps = Object.keys(response.data.userInfo);
			for (var i = 0; i < userProps.length; i++) {
				var property = userProps[i];
				var val = response.data.userInfo[property];
				Object.defineProperty(user, property, {
					value: val,
					enumerable: true,
					configurable: true
				});
			}
			$scope.userInfo = user;
			console.log('scope', $scope.userInfo);
		} else {
			alert('Login token has expired. Please log in again.');
			$window.location.href = '/';
		}
	});

	//Get user's spotify playlists
	$http.get('http://'+ location.host +'/spotify/getPlaylists').then(function(response) {
		console.log(response);
		if (response.error) {
			alert('Could not authorize request for user playlists. Please sign in later.');
			$window.location.href = '/';
		} else {
			console.log('playlist response items are', response.data.data.items);
			$scope.playlists = response.data.data.items;
		}
	});

	$scope.userName = function() {
		if (user.display_name == null) {
			return user.id;
		} else {
			return user.display_name;
		}
	};

	//Get songs for a playlist
	$scope.getSongs = function(plistID) {
		console.log('getSongs triggered. playlistID:', plistID, 'userID:', user.id);
		$http.get('http://'+ location.host +'/spotify/getSongs', {
			params: {
				userID: user.id,
				playlistID: plistID
			}
		}).then(function(response) {
			console.log('getSongs response', response);
			console.log('response error:', response.error);
			if (response.data.error) {
				alert('Spotify encountered an error receiving tracks for this playlist.');
			} else {
				$scope.tracks = response.data.data.items;
				playlistSelected();
			}
		}, function errorCallback(response) {
			console.log('Server error', response.data.error.status, response.data.error.statusText);
		});
	};

	/*
	* STATE MANAGEMENT
	*/
	// Handle state changes within the application
	function playlistSelected() {
		console.log('selecting playlist...');
		$scope.playlistSelected = true;
	}
	function playlistDeselected() {
		console.log('deselecting playlist...');
		$scope.playlistSelected = false;
	}
	function youtubeQueried() {
		console.log('youtube has been sent a request...');
		$scope.youtubeSearched = true;
	}
	$scope.playlistSelected = false;
	$scope.selectPlaylist = playlistSelected;
	$scope.deselectPlaylist = playlistDeselected;
	$scope.youtubeSearched = false;
	$scope.searchYoutube = youtubeQueried;

	/*
     * YOUTUBE REQUESTS
	 */

	// Handle youtube search requests
	function searchRequest(query) {
        return new Promise(function(resolve, reject) {
    		// Return an embed link of a youtube video
            $http.get('http://'+ location.host +'/youtube/search', {
    			params: {
			    	searchQuery: query
		    	}
	    	}).then(function(response){
    			if (response.data.error) {
			    	alert('some youtube error has occurred');
                    console.log('error response for youtube is', response);
                    reject(response.data.error);
    			} else {
				    resolve(JSON.parse(response.data.body));
			    }
		    });
        });
    }

	function findVideos(tracks) {
		var videoLinks = [];
		for (var i = 0; i < tracks.length; i++) {
			var track = tracks[i];
            var query = track.track.artists[0].name + track.track.name;
            searchRequest(query).then(function(response) {
			      videoLinks.push(response.items[0].id.videoId);
            }, function(error) {
                console.log(error);
            });
		}
		$scope.videos = videoLinks;
        console.log('videoLinks contains', videoLinks);
    }
	$scope.findVideos = findVideos;
});

app.controller('titleCtrl', function($scope, $http, $window) {
	$http.get('http://'+ location.host +'/spotify/isAuthenticated').then(function(response) {
		$scope.auth = response.data.auth;
	});

	$scope.whichRoot = function() {
		console.log('whichRoot has been triggered');
		if ($scope.auth != null) {
			if ($scope.auth) {
				console.log('Location check is', $window.location.href );
				if ($window.location.href == 'http://'+ location.host +'/#/') {
					$window.location.href = '/#/loggedin';
				}
				return '/#/loggedin';
			} else {
				return '/#/';
			}
		}
		return '/#/';
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
