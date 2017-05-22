var app = angular.module('valetState', ['ngResource', 'ngAnimate', 'ngRoute']);

app.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'src/pages/login.html'
		})
		.when('/about', {
			templateUrl: 'src/pages/about.html'
		})
		.when('/loggedin', {
			templateUrl: 'src/pages/user.html'
		})
		.when('/error', {
			templateUrl: 'src/pages/error.html'
		});
});
