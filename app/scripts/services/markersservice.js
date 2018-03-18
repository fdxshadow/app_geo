'use strict';

/**
 * @ngdoc service
 * @name appGeoApp.MarkersService
 * @description
 * # MarkersService
 * Factory in the appGeoApp.
 */

angular.module('appGeoApp').constant("config", {
  //ipColorServer: "http://api.caserita.local/",
  ipColorServer: "http://200.68.49.232:81/",
  ipPlanServer: "http://200.68.49.237:8080/"
});

angular.module('appGeoApp')
  .factory('MarkersService', ["$http", "$rootScope", "$location", "config",
  function ($http, $rootScope, $location, config) {
    // Service logic
    // ...
    var factory = {};

    factory.getMarkers = function (vendors, fromDay, toDay, fromHour, toHour, callback) {

        var fd = new FormData();

        for (var i = 0; i < vendors.length; i++)
            fd.append("vendedor_ids[]", vendors[i].codigo)

        fd.append("from_day", fromDay);
        fd.append("to_day", toDay);
        fd.append("from_hour", fromHour);
        fd.append("to_hour", toHour);

        $http({
            method: "POST",
            url: config.ipColorServer + "geolocation/map",
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
            data: fd,
            // transformRequest: function(obj) {
            //     var str = [];
            //     for (var key in obj) {
            //         if (obj[key] instanceof Array) {
            //             for(var idx in obj[key]){
            //                 var subObj = obj[key][idx];
            //                 for(var subKey in subObj){
            //                     str.push(encodeURIComponent(key) + "[" + idx + "][" + encodeURIComponent(subKey) + "]=" + encodeURIComponent(subObj[subKey]));
            //                 }
            //             }
            //         }
            //         else {
            //             str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
            //         }
            //     }
            //     return str.join("&");
            // }
        })
            .then(
                function successCallback(response){
                    callback(response);
                },
                function errorCallback(response){
                    //console.log("MarkersService error");
                }
                );
    };

    factory.getVendors = function (codigoSupervisor, callback) {
                    $http.post(config.ipPlanServer + "ServiciosCaseritaWEB/servicioRest/vendedor/post", {
                        codigoSupervisor : codigoSupervisor })
                        .then(
                            function successCallback(response){
                                callback(response);
                            },
                            function errorCallback(response){
                                //console.log("getVendors function failed");
                            })
                };

    factory.getNumbers = function (vendor, fromDay, toDay, fromHour, toHour, callback) {

        var fd = new FormData();

        for (var i = 0; i < vendor.length; i++) {
            fd.append("vendedor_ids[]", vendor[i])
        }
        fd.append("from_day", fromDay);
        fd.append("to_day", toDay);
        fd.append("from_hour", fromHour);
        fd.append("to_hour", toHour);
        //console.log(fd);


        $http({
            method: "POST",
            url: config.ipColorServer + "geolocation/graph-data",
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
            data: fd,
        })
            .then(
                function successCallback(response){
                    callback(response);
                },
                function errorCallback(response){
                    //console.log("GraphsService error");
                }
                );
    };

    factory.getPlanification = function (codigoVendedor, dia, callback) {
        $http.post(config.ipPlanServer + "ServiciosCaseritaWEB/servicioRest/clienteVendedor/post", {
            vendedor : codigoVendedor , dia : dia })
            .then(
                function successCallback(response){
                    //console.log(response);
                    callback(response);
                },
                function errorCallback(response){
                    //console.log("getPlanification function failed");
                }
                );
    };

    $rootScope.supervisorsList = [];

    var addSupervisor = function (info) {
        var supervisor = {
            nombre: info.nombreSupervisor,
            codigo: info.codigoSupervisor
            };

        $rootScope.supervisorsList.push(supervisor);
    }

    var Todos = {
        nombreSupervisor: "TODOS LOS SUPERVISORES",
        codigoSupervisor: "All"
    };

    // factory.getSupervisors = function (a, page, callback) {
    //
    //     $http.post(config.ipPlanServer + "ServiciosCaseritaWEB/servicioRest/vendedor/post", {
    //         codigoSupervisor : a })
    //     .then(
    //         function successCallback(response){
    //             var currentPage;
    //
    //             if ($location.path() == "/ges") {
    //                 currentPage = "ges"
    //             }
    //             else if ($location.path() == "/geo") {
    //                 currentPage = "geo"
    //             };
    //             if (currentPage == page) {
    //                 if (response.data.codigoEstado !== -2) {
    //                     addSupervisor(response.data[0]);
    //                     factory.getSupervisors(a + 1, page);
    //                 }
    //                 else {
    //                     addSupervisor(Todos);
    //                 }
    //             }
    //
    //         },
    //         function errorCallback(response){
    //             //console.log("getSupervisors failed");
    //         })
    // };


    /* Descomentar lo de arriba y comentar lo de abajo. Parche provisorio para obtener todos los
       supervisores que existen actualmente */
    $rootScope.contador = 0;
    factory.getSupervisors = function (a, page, callback) {
        if ($rootScope.todosAgregado) {
          $rootScope.contador = 0;
          $rootScope.todosAgregado = false;
        }
        $http.post(config.ipPlanServer + "ServiciosCaseritaWEB/servicioRest/vendedor/post", {
            codigoSupervisor : a })
        .then(
            function successCallback(response){
                var currentPage;

                if ($location.path() == "/ges") {
                    currentPage = "ges"
                }
                else if ($location.path() == "/geo") {
                    currentPage = "geo"
                };
                if (currentPage == page) {
                    if (response.data.codigoEstado !== -2) {
                        addSupervisor(response.data[0]);
                        factory.getSupervisors(a + 1, page);
                    }
                    else {
                        $rootScope.contador++;
                        if ($rootScope.contador > 10) {
                          $rootScope.todosAgregado = true;
                          addSupervisor(Todos);
                        } else {
                          factory.getSupervisors(a + 1, page);
                        }
                    }
                }

            },
            function errorCallback(response){
                //console.log("getSupervisors failed");
            })
    };

    return factory;
}
]);
