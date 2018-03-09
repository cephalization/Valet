var app = angular.module('valetState', ['ngResource', 'ngAnimate', 'ngRoute']);

app.config(function ($routeProvider, $controllerProvider) {
	app.cp = $controllerProvider;
	$routeProvider
		.when('/valet', {
			templateUrl: '/valet/src/pages/login.html'
		})
		.when('/valet/about', {
			templateUrl: '/valet/src/pages/about.html'
		})
		.when('/valet/loggedin', {
			templateUrl: '/valet/src/pages/content.html',
		})
		.when('/valet/error', {
			templateUrl: '/valet/src/pages/error.html'
		});
});
