app.controller('navController', function ($scope, $http, $window, $location) {
	$http.get('http://' + location.host + '/spotify/isAuthenticated').then(function (response) {
		$scope.auth = response.data.auth;
	});

	console.log('ng scope', $scope);
	$scope.whichRoot = function () {
		if ($scope.auth != null) {
			if ($scope.auth) {
				if ($window.location.href == 'http://' + location.host + '/#!/') {
					$location.path('/loggedin');
				}
				return '/#!/loggedin';
			} else {
				return '/#!/';
			}
		}
		return '/#!/';
	};

	$scope.toggleSidenav = function() {
		var sidenav = document.getElementById('sidenav');
		if (sidenav.classList.contains('collapse')) {
			sidenav.classList.remove('collapse');
		} else {
			sidenav.classList.add('collapse');
		}
	};
});
