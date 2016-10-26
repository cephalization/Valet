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
		refreshToken = params.refreshToken;
	//
	// if (error) {
	// 	alert('Authentication was not completed successfully');
	// 	$window.location.href = '/';
	// }
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
			$scope.userInfo = response.data;
		}
	});

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
