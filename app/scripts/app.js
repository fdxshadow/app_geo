'use strict';

/**
 * @ngdoc overview
 * @name appGeoApp
 * @description
 * # appGeoApp
 *
 * Main module of the application.
 */
angular
  .module('appGeoApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'rzModule',
    'moment-picker',
    'GoogleMapsNative'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'loginController',
        controllerAs: 'main'
      })
      .when('/geo', {
        templateUrl: 'views/about.html',
      })
      .when('/ges',{
        templateUrl:'views/gestion_masiva.html',
      })
      .otherwise({
        redirectTo: '/'
      });
  });
