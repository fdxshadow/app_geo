'use strict';

/**
 * @ngdoc function
 * @name appGeoApp.controller:CollapsecontrollerCtrl
 * @description
 * # CollapsecontrollerCtrl
 * Controller of the appGeoApp
 */
angular.module('appGeoApp')
  .controller('CollapseController', ["$rootScope", "$scope", "$timeout",
    function ($rootScope, $scope, $timeout){
			$scope.collapse1 = function() {
					if ($rootScope.Open1 == true) {
				    	document.getElementById("Collapsible1").style.display = "none";
				    	$rootScope.Open1 = false }
				    	else {
							document.getElementById("Collapsible1").style.display = "inline-block";
				    		$rootScope.Open1 = true;

				    		//Actualiza la posición del slider, de lo contrario se bugea
				    		$timeout(function () {
						        $scope.$broadcast('rzSliderForceRender');
						    });
				    	};
				};

			$scope.collapse2 = function() {
					if ($rootScope.Open2 == true) {
				    	document.getElementById("Collapsible2").style.display = "none";
				    	$rootScope.Open2 = false }
				    	else {
							document.getElementById("Collapsible2").style.display = "inline-block";
				    		$rootScope.Open2 = true
				    	};
				};

			$scope.collapse3 = function() {
					if ($rootScope.Open3 == true) {
				    	document.getElementById("Collapsible3").style.display = "none";
				    	$rootScope.Open3 = false }
				    	else {
							document.getElementById("Collapsible3").style.display = "inline-block";
				    		$rootScope.Open3 = true
				    	};
				};

			$scope.mapTab = function() {
					document.getElementById("map").style.display = "inline-block";
					document.getElementById("rep").style.display = "none";
					document.getElementById("mapTab").style.backgroundColor = "white";
					document.getElementById("repTab").style.backgroundColor = "#F8F8F8";
			}

			$scope.repTab = function() {
					document.getElementById("map").style.display = "none";
					document.getElementById("rep").style.display = "inline-block";
					document.getElementById("mapTab").style.backgroundColor = "#F8F8F8";
					document.getElementById("repTab").style.backgroundColor = "white";
			}
		}])
