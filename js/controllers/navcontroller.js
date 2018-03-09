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
				$window.location.href = '/valet/';
			}
		});
	}

	$scope.userName = function () {
		console.log('username');
		if ($scope.account.display_name != null) {
			return $scope.account.display_name;
		} else {
			return $scope.account.id;
		}
	};

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

	$scope.setPlaylist = function(playlist) {
		if (playlist != $scope.selectedPlaylist) {
			accountService.setPlaylist(playlist);
			$scope.selectedPlaylist = playlist;
			$rootScope.$broadcast('playlist:selected');
		}
	};

	$scope.$on('playlist:removed', function() {
		$scope.selectedPlaylist = accountService.playlist;
	});

	$scope.logout = function () {
		accountService.logout();
	};

	var sidenav = document.getElementById('sidenav');
	sidenav.onclick = function(e) {
		var target = e.target.localName;
		if (!sidenav.classList.contains('collapse') && document.body.clientWidth < 768 && target === 'li' || target === 'a') {
			sidenav.classList.add('collapse');
		}
	};
});
