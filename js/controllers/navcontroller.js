app.controller('navController', function ($rootScope, $scope, $http, $window, $location, $compile, accountService) {
	// $http.get('http://' + location.host + '/spotify/isAuthenticated').then(function (response) {
	// 	$scope.auth = response.data.auth;
	// });
	if (accountService.loaded()) {
		$scope.account = accountService.get();
		$scope.auth = $scope.account.auth;
		$rootScope.$broadcast('account:loaded');
	} else {
		accountService.loadAccount(function() {
			$scope.account = accountService.get();
			$scope.auth = $scope.account.auth;
			$rootScope.$broadcast('account:loaded');
			if ($location.path() === '/loggedin' && !$scope.auth) {
				alert('Login token has expired. Please log in again.');
				$window.location.href = '/';
			}
		});
	}

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

	$scope.logout = function () {
		accountService.logout();
	};
});
