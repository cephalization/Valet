/**
 * Authoritative Store of Account Information
 */
app.service('accountService', function($http){
	// Initialize the service state
	var account = {
		auth: false
	};
	var loaded = false;
    var playlist = null;

	/**
	 * Get the user's account
	 *
	 * @return {object} The user's account object
	 */
	this.get = function() {
		return account;
	};

	/**
	 * Check if the account has been loaded already
	 *
	 * @return {boolean} is the account loaded
	 */
	this.loaded = function() {
		return loaded;
	};

	/**
	 * Destroy the account object
	 */
	this.logout = function() {
		account = {
			auth: false
		};
	};

	/**
	 * If the user has an accessToken,
	 * refresh the user's account information.
	 */
	this.loadAccount = function (callback) {
		refreshAccount(function(results) {
			angular.copy(results, account);
			loaded = true;
			callback();
		});
    };

    this.setPlaylist = function(playlist) {
        this.playlist = playlist;
    }

    this.removePlaylist = function() {
        this.playlist = null;
    }

	/**
	 * Refresh account properties with a user's Spotify accessToken.
	 *
	 * @param {function} callback Callback function to be called after HTTP requests finish. Passed temporary account object.
	 */
	function refreshAccount(callback) {
		var a = {
			auth: false
		};

		// Load general account information
		$http.get('/api/spotify/isAuthenticated').then(function(aResponse) {
			if (aResponse.data.auth) {
				a.auth = true;
				Object.assign(a, aResponse.data.userInfo);

				// Load playlists
				$http.get('/api/spotify/getPlaylists').then(function(pResponse) {
					if (!pResponse.error) {
						a.playlists = pResponse.data.data.items;
					} else {
						a.auth = false;
					}
					callback(a);
					return;
				});

			// Return the unauthenticated account if the user is not logged in
			} else {
				callback(a);
				return;
			}
		});
	}
});
