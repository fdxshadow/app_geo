'use strict';

/**
 * @ngdoc service
 * @name appGeoApp.AuthenticationService
 * @description
 * # AuthenticationService
 * Factory in the appGeoApp.
 */
angular.module('appGeoApp')
  .factory('AuthenticationService', ["$http", "$rootScope", "$window", function ($http,$rootScope,$window) {
    var service = {};

    service.Login = function (username, password, callback) {

        $http.post("http://200.68.49.237:8080/ServiciosCaseritaWEB/servicioRest/usuarioMonitoreo/post", { usuario: username, password: password })
            .then(
                function succesCallback(response) {
                    callback(response);
                },
                function errorCallback(response){
                    $rootScope.serError = true;
                });   
    };
    service.SetCredentials = function (username, name, code, role) {

        $rootScope.credentials = {
            currentUser: {
                username: username,
                name: name,
                code: code,
                role: role,
            }
        };

        $window.sessionStorage.setItem("credentials", $rootScope.credentials);
        console.log($rootScope);
    };

    service.ClearCredentials = function () {
        $rootScope.credentials = {};
        $window.sessionStorage.removeItem("credentials");
    };

return service;
}]);

