app.controller('contentController', function ($rootScope, $scope, $window, $http, $sce, accountService) {

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
		$scope.youtubeSearched = false;
		$scope.playlistSelected = true;
	}
	function playlistDeselected() {
		$scope.playlistSelected = false;
		$scope.youtubeSearched = false;
		accountService.removePlaylist();
		$rootScope.$broadcast('playlist:removed');
	}
	function youtubeQueried(videos) {
		$scope.youtubeSearched = true;
		$scope.links = videos;
		$scope.$apply();
	}
	$scope.playlistSelected = false;
	$scope.selectPlaylist = playlistSelected;
	$scope.deselectPlaylist = playlistDeselected;
	$scope.youtubeSearched = false;
	$scope.searchYoutube = youtubeQueried;
	var playlist = null;
	if (accountService.playlist != null) {
		playlist = accountService.playlist;
		$scope.getSongs(playlist.id, playlist.owner.id);
	}
	$scope.$on('playlist:selected', function(){
		playlist = accountService.playlist;
		$scope.getSongs(playlist.id, playlist.owner.id);
	});

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
		var promises = [];

		// Build a collection of promises for every youtube query
		for (var i = 0; i < tracks.length; i++) {
			var track = tracks[i];
			var query = track.track.artists[0].name + track.track.name;
			promises.push(searchRequest(query));
		}

		// Evaluate the results all of the promises in order
		Promise.all(promises).then(function(results) {
			var videoLinks = [];
			for (var i = 0; i < results.length; i++) {
				query = results[i].items;
				for (var j = 0; j < query.length; j++) {
					var songLink = query[j];
					if (songLink != null) {
						videoLinks.push(
							{
								link: $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + songLink.id.videoId)
							});
						break;
					}
				}
			}

			// All songs have been resolved
			youtubeQueried(videoLinks);

		}, function(error) {
			console.log(error);
		});
	}
	$scope.findVideos = findVideos;
});
