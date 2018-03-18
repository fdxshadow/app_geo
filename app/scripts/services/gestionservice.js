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
      Vendedores : Vendedores,
      Marcadores : Marcadores
  };

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

    function Marcadores(vendedor_ids,from_day,to_day,from_hour,to_hour) {
      var fd = new FormData();

      for (var i = 0; i < vendedor_ids.length; i++)
        fd.append("vendedor_ids[]", vendedor_ids[i].codigoVendedor)

      fd.append("from_day", from_day);
      fd.append("to_day", to_day);
      fd.append("from_hour", from_hour);
      fd.append("to_hour", to_hour);
      var defered = $q.defer();
      var promise = defered.promise;
      $http({
        method: "POST",
        url:'http://200.68.49.232/geolocation/markers',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined},
        data: fd}).
      then(function(data){
        defered.resolve(data);
      }).catch(function(err){
        defered.reject(err);
      });
      return promise;

    }
}]);
