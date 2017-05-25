app.controller('contentController', function ($scope, $window, $http, $sce, accountService) {

	// Load user account from service
	var user = {};
	if (accountService.loaded()) {
		user = accountService.get();
		if (user.auth) {
			$scope.userInfo = user;
			$scope.playlists = user.playlists;
		}
	} else {
		$scope.$on('account:loaded',function() {
			user = accountService.get();
			if (user.auth) {
				$scope.userInfo = user;
				$scope.playlists = user.playlists;
			}
		});
	}

	//Get songs for a playlist
	$scope.getSongs = function (plistID, owner) {
		$http.get('http://' + location.host + '/spotify/getSongs', {
			params: {
				userID: owner,
				playlistID: plistID
			}
		}).then(function (response) {
			if (response.data.error) {
				alert('There was an error retrieving this playlist from Spotify.');
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
		$scope.playlistSelected = true;
	}
	function playlistDeselected() {
		$scope.playlistSelected = false;
		$scope.youtubeSearched = false;
	}
	function youtubeQueried() {
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
		return new Promise(function (resolve, reject) {

			// Return an embed link of a youtube video
			$http.get('http://' + location.host + '/youtube/search', {
				params: {
					searchQuery: query
				}
			}).then(function (response) {
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
			searchRequest(query).then(function (response) {
				console.log('links', response);
				videoLinks.push(
					{
						link: $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + response.items[0].id.videoId)
					});
			}, function (error) {
				console.log(error);
			});
		}
		$scope.links = videoLinks;
		if ($scope.links) {
			$scope.youtubeSearched = true;
		}
	}
	$scope.findVideos = findVideos;
});
