var app = angular.module('valetState', ['ngResource', 'ngAnimate', 'ngRoute']);

app.config(function ($routeProvider, $controllerProvider) {
	app.cp = $controllerProvider;
	$routeProvider
        .when('/', {
			templateUrl: '/valet/src/pages/login.html'
		})
        .when('/about', {
			templateUrl: '/valet/src/pages/about.html'
		})
        .when('/loggedin', {
			templateUrl: '/valet/src/pages/content.html',
		})
        .when('error/', {
			templateUrl: '/valet/src/pages/error.html'
		});
});
