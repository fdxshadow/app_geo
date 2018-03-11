'use strict';

/**
 * @ngdoc function
 * @name appGeoApp.controller:GestionMasivaCtrl
 * @description
 * # GestionMasivaCtrl
 * Controller of the appGeoApp
 */
angular.module('appGeoApp')
  .controller('GestionMasivaCtrl', ["$scope","$rootScope","gestionservice",
  function($scope,$rootScope,gestionservice){
    $scope.collapsea=false;
    $scope.collapseb=false;
    $scope.hideLoader=true;
    $scope.supervisores = $rootScope.supervisorsList;
    $scope.slider = {
      minValue: "00:00",
      maxValue: "23:59",
      options: {
          stepsArray: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:59"]
      }
  };

  $scope.getvendedores = function(codigo){
    gestionservice.Vendedores(codigo).then(function(response){
      $scope.vendedores = response.data
      console.log(response.data);
    }).
    catch(function(err){
      console.log(err);
    })
  }

  




    $scope.mostrar = function(a){
        if(a===1){
          $scope.collapsea=!$scope.collapsea;
        }
        if(a==2){
          $scope.collapseb=!$scope.collapseb;
        }
        
    }



  }]);

