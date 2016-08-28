var app = angular.module('valetState', ['ngResource', 'ngAnimate', 'ngRoute']);

// stateCtrl
app.controller("stateCtrl", function ($scope) {
// Select valid html stuff method
return $scope.currentHtml;
});

app.config(function($routeProvider){
  $routeProvider
  .when("/", {
    templateUrl : "login.html"
  })
  .when("/about", {
    templateUrl : "about.html"
  })
})
