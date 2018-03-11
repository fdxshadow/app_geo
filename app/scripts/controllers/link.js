'use strict';

/**
 * @ngdoc function
 * @name appGeoApp.controller:LinkCtrl
 * @description
 * # LinkCtrl
 * Controller of the appGeoApp
 */
angular.module('appGeoApp')
  .controller('LinkCtrl', ["$scope", "$rootScope", "$location", "AuthenticationService",
  function ($scope, $rootScope, $location, AuthenticationService) {
   
    $scope.linkGeo = function () {
      $location.path("/geo");
      }
    $scope.linkGes = function () {
      $location.path("/ges");
    }
    $scope.linkLogin = function () {
      $location.path("/");
      AuthenticationService.ClearCredentials();
    }
}]); 
