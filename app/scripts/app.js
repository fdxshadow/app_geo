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
  })
  .config(function (momentPickerProvider) {
        momentPickerProvider.options({
            minView:       'month',
            maxView:       'year',
            startView:     'month',
            autoclose:     true,
            yearsFormat:   'YYYY',
            monthsFormat:  'MM',
            daysFormat:    'DD',
            locale:        "es",
            keyboard:       false,
        });
    })
    .run(["$rootScope", "$location", "$window", "$http",
        function ($rootScope, $location, $window, $http) {
            $rootScope.credentials = $window.sessionStorage.getItem("credentials") || {};
            $rootScope.$on("$locationChangeStart",
                function (event, next, current) {
                    if ($location.path() !== "/" && !$rootScope.credentials.currentUser) {
                        $location.path("/");
                        alert("Indique Usuario y Contraseña para poder entrar");
                    }
                });
        }
    ]);
