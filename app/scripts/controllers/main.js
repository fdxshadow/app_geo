
  "use strict";

  var app = angular.module ('appGeoApp')

  app.controller("loginController",
  ['$scope', '$rootScope', '$location', 'AuthenticationService',
      function ($scope, $rootScope, $location, AuthenticationService) {
          $scope.hideLoginLoader = true;
          $scope.login = function () {
              $scope.hideLoginLoader = false;
              AuthenticationService.ClearCredentials();
              AuthenticationService.Login($scope.username, $scope.password, function(response) {
                  var login = response.data;
                  $rootScope.serError = false;
                  $scope.loginForm.$setValidity("user", true);
                  if(login.estado == 0) {
                      AuthenticationService.SetCredentials($scope.username, login.nombreSupervisor, login.codigoSupervisor, login.tipoUsuario);
                      console.dir($rootScope.credentials.currentUser);
                      console.log($rootScope);
                      $location.path("/geo");
                  }
                  else if (login.estado == -1) {
                      $scope.loginForm.$setValidity("user", false);
                      $scope.username = "";
                      $scope.password = "";
                      $scope.hideLoginLoader = true;
                  };
              });
          };
      }]);
