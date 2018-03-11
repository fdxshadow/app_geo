'use strict';

/**
 * @ngdoc service
 * @name appGeoApp.gestionservice
 * @description
 * # gestionservice
 * Factory in the appGeoApp.
 */
angular.module('appGeoApp')
  .factory('gestionservice',["$http","$q","config", function ($http, $q,config) {

    return {
      Vendedores: Vendedores
  }
    
    function Vendedores(codigo){
      var defered = $q.defer();
      var promise = defered.promise;
      $http.post(config.ipPlanServer + "ServiciosCaseritaWEB/servicioRest/vendedor/post", {
        codigoSupervisor : codigo}).
        then(function(data){
          defered.resolve(data);
        }).catch(function(err){
          defered.reject(err);
        });
      return promise;  
    }
}]);
