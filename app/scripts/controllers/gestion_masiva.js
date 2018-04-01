'use strict';

/**
 * @ngdoc function
 * @name appGeoApp.controller:GestionMasivaCtrl
 * @description
 * # GestionMasivaCtrl
 * Controller of the appGeoApp
 */
angular.module('appGeoApp')
  .controller('GestionMasivaCtrl', ["$scope","$rootScope","gestionservice", "$filter",
  function($scope,$rootScope,gestionservice, $filter){

    /* Variables "constantes" */
    var bounds; //Limites del mapa;
    var infowindow = new google.maps.InfoWindow();// Solo hay un infowindow activo a la vez. Se crea al inicio
    var pinSize = new google.maps.Size(30, 45); // Tamanio de los pines
    $scope.marcadores = []; // Lista de marcadores
    $scope.ctrl = {};
    $scope.today = moment().format("DD-MM-YYYY"); // Se obtiene la fecha del dia de hoy

    $scope.dia;
    $scope.collapsea=false;
    $scope.collapseb=false;
    $scope.hideLoader=true;



   /* gestionservice.Supervisores(1).then(function (response) {
      console.log("hola");
      //$scope.supervisores = response;
      console.log(response);
    }).catch(function (error) {
      console.log(error);
    })*/

    $scope.supervisores = $rootScope.supervisorsList;








    //console.log("$scope.supervisores",$scope.supervisores);
    $scope.slider = {
      minValue: "00:00",
      maxValue: "23:59",
      options: {
          stepsArray: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:59"]
      }
    };

    /* TODO: Obtener lista de supervisores en esta vista. Replicar código del servicio markersservice
       al servicio gestionservice.
       Esto se debe hacer para que cargue independientemente los supervisores en cada vista.
       Si no se hace, puede ocurrir una falla: Si se pasa muy rapido desde Georeferenciacion a Ges Masiva,
       puede que no se carguen todos los supervisores a la lista (ya que está cargandolos solo en
       la vista de Georeferenciacion) */

    /* Si el usuario es Supervisor, se obtienen los vendedores asociados a él */
    //console.log($rootScope.credentials.currentUser);
    if ($rootScope.credentials.currentUser.role == "SUPE") {
      var codigo = $rootScope.credentials.currentUser.code;
      gestionservice.Vendedores(codigo)
      .then(function(response){
        $scope.vendedores = response.data
        console.log(response.data);
      })
      .catch(function(err){
        console.log(err);
      })
    }

    /* Función utilizada para obtener los vendedores del Supervisor seleccionado (si el usuario es ADMIN) */
    $scope.getvendedores = function(codigo){
      $scope.vendedoresConRank = [];
      $scope.vendedoresSinRank = [];
      $scope.collapseb = ($scope.collapseb)?!$scope.collapseb:$scope.collapseb;
       console.log("codigo",codigo);
      if (codigo == 'All') { // Si la opcion elegida es "TODOS LOS SUPERVISORES"
        $scope.vendedores = [];
        /* Por cada supervisor en la lista de supervisores, se traen los vendedores asociados a él */
        for (var i = 0 ; i < $scope.supervisores.length ; i++) {
          if ($scope.supervisores[i].codigo != 'All') {
            var codigoSupervisor = $scope.supervisores[i].codigo;
            gestionservice.Vendedores(codigoSupervisor)
            .then(function(response){
              //$scope.vendedores = response.data
              var respuesta = response.data;
              for (var e = 0; e < respuesta.length; e++) {
                $scope.vendedores.push(respuesta[e]);
              }
              console.log(response.data);
            })
            .catch(function(err){
              console.log(err);
            })
          }
        }
      } else { // Si se selecciona solo un supervisor, se traen los vendedores asociados a él
        gestionservice.Vendedores(codigo)
        .then(function(response){
          $scope.vendedores = response.data
          //console.log(response.data);
        })
        .catch(function(err){
          console.log(err);
        })
      }
    }

    /* Función utilizada para ordenar dinamicamente un arreglo */
    function dynamicSort(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
      }
      return function (a,b) {
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
      }
    }

    /* Funcion utilizada para tener el mapa disponible como una variable global dentro del codigo.
       Esta funcion se ejecuta cuando el mapa se ha cargado. */
    $scope.bindMap = function(map){
      $scope.mapa = map;
    }

    /* Funcion que se ejecuta al presionar el boton 'Actualizar resultados' */
    $scope.getMarcadores = function(dia, from_hour, to_hour) {

      $scope.hideLoader = false;
      if ($scope.vendedores === undefined){ // Validamos que se haya seleccionado supervisor.
        alert("Debe seleccionar supervisor.");
        $scope.hideLoader = true;
        return false;
      }

      var diaFormatted = moment(dia).format('YYYY-MM-DD');

      gestionservice.Marcadores($scope.vendedores, diaFormatted, diaFormatted, from_hour, to_hour)
      .then(function (response) {
        $scope.marcadores = [];

        console.log("response Marcadores",response);
        /* Seteamos los limites a cero */
        bounds = new google.maps.LatLngBounds();

        /* Se recorre la respuesta para crear los marcadores */
        var respuesta = response.data;
        for (var i = 0 ; i < respuesta.length ; i++ ) {
          if (respuesta[i].geoloc != false) { // Si el vendedor tiene una ubicacion, se agrega como marcador
            var marcador = {};
            var position = new google.maps.LatLng(respuesta[i].geoloc.latitud, respuesta[i].geoloc.longitud);
            marcador.position = position;

            /* Parseamos los datos de la respuesta */
            var visitasPlanificadas = respuesta[i].planificacion;
            console.log(respuesta[i].planificacion);
            //var visitasPlanificadas = 30; // BORRAR ESTO. Se debe obtener valor desde el servicio (linea de arriba).
            var vendedorId = respuesta[i].vendedor_id;
            var nombre = respuesta[i].nombre;
            var cantidadVentas = respuesta[i].ventas;
            var cantidadNoVentas = respuesta[i].no_ventas; // Cambiar esto por var cantidadNoVentas = respuesta[i].no_ventas;
            var montoVentas = respuesta[i].total;
            var ticketPromedio = respuesta[i].ticket;

            var rendimiento = ((cantidadVentas+cantidadNoVentas)/visitasPlanificadas)*100;
            marcador.visitasPlanificadas = visitasPlanificadas;
            marcador.vendedorId = vendedorId;
            marcador.nombre = nombre;
            marcador.cantidadVentas = cantidadVentas;
            marcador.cantidadNoVentas = cantidadNoVentas;
            marcador.montoVentas = montoVentas;
            marcador.ticketPromedio = ticketPromedio;
            marcador.rendimiento = rendimiento;

            /* Verificamos el rendimiento del vendedor actual, para asignarle el pin correspondiente */
            if (rendimiento <= 25){
              marcador.icon = {url: '/images/pin-noventa.png', scaledSize: pinSize};
            } else if (rendimiento > 25 && rendimiento <= 50) {
              marcador.icon = {url: '/images/pin-naranjo.png', scaledSize: pinSize};
            } else if (rendimiento > 50 && rendimiento <= 75) {
              marcador.icon = {url: '/images/pin-amarillo.png', scaledSize: pinSize};
            } else if (rendimiento > 75) {
              marcador.icon = {url: '/images/pin-venta.png', scaledSize: pinSize};
            }

            $scope.marcadores.push(marcador); // Agregamos el marcador a la lista de marcadores
            bounds.extend(marcador.position); // Agregamos el marcador a los limites del mapa
          }
        }
        /* Se ordenan los marcadores segun el parámetro rendimiento */
        $scope.marcadores.sort(dynamicSort("rendimiento")).reverse();

        $scope.vendedoresConRank = [];
        $scope.vendedoresSinRank = [];
        // Según el orden anterior, se agrega el atributo 'ranking' a los marcadores
        if ($scope.marcadores.length > 0) {
          for (var i = 0; i < $scope.marcadores.length; i++) {
            var marcador_actual = $scope.marcadores[i];
            marcador_actual.ranking = i+1;
            marcador_actual.infowindow = {};
            marcador_actual.infowindow.content = '<h2 class="infoWindowTitle">' + marcador_actual.nombre + '</h2>' + '<div class="infoWindowContent"><ul>' + '<li>' + "<span>Ranking</span>: #" + marcador_actual.ranking + '</li>' + '<li>' + "<span>Ventas</span>: " + marcador_actual.cantidadVentas + '</li>' + '<li>' + "<span>No Ventas</span>: " + marcador_actual.cantidadNoVentas + '</li>' +'<li>' + "<span>Visitas Planificadas</span>: " + marcador_actual.visitasPlanificadas  + '</li>' + '<li>' + "<span>Total Venta</span>: " + $filter('currency')(marcador_actual.montoVentas) + '</li>' + '<li>' + "<span>Ticket Promedio</span>: " + $filter('currency')(marcador_actual.ticketPromedio) + '</li>' + '</ul></div>';

            /* Se llena la lista de vendedores con ranking */
            var vendedor_actual = {};
            vendedor_actual.nombre = marcador_actual.nombre;
            vendedor_actual.ranking = marcador_actual.ranking;
            vendedor_actual.vendedorId = marcador_actual.vendedorId;
            $scope.vendedoresConRank.push(vendedor_actual);
          }
          /* Se llena la lista de vendedores sin ranking (no vendieron el dia seleccionado) */
          for (var i = 0; i < $scope.vendedores.length; i++) {
            var found = $scope.vendedoresConRank.some(function (el) {
              return el.vendedorId == $scope.vendedores[i].codigoVendedor;
            });
            if (!found) {
              $scope.vendedoresSinRank.push({nombre:$scope.vendedores[i].nombreVendedor,vendedorId:$scope.vendedores[i].codigoVendedor});
            }
          }
          /* Si la cantidad de marcadores es 1, se centra el mapa en ese marcador */
          if ($scope.marcadores.length == 1) {
            var position1 = $scope.marcadores[0].position;
            $scope.mapa.setOptions({center: position});
          } else { // Si la cantidad de marcadores es mayor a 1, se ponen los limites del mapa
            $scope.mapa.fitBounds(bounds); // Seteamos los limites del mapa, para que todos los marcadores queden dentro
          }
        } else { // Si no hay marcadores, se muestra por pantalla el siguiente mensaje
          /* Si no hay marcadores, la lista de vendedores se muestra sin ranking */
          for (var i = 0; i < $scope.vendedores.length; i++) {
            var vendedor_actual = {};
            vendedor_actual.nombre = $scope.vendedores[i].nombreVendedor;
            vendedor_actual.vendedorId = $scope.vendedores[i].codigoVendedor;
            $scope.vendedoresSinRank.push(vendedor_actual);
          }
          alert("No se encontraron vendedores con información en la fecha indicada.");
          $scope.mapa.setOptions({zoom: 9,center: new google.maps.LatLng(-33.455, -70.655),mapTypeId: google.maps.MapTypeId.TERRAIN});
        }
        $scope.hideLoader=true; //Ocultamos el loader en boton 'Actualizar resultados'
        $scope.collapseb = ($scope.collapseb)?$scope.collapseb:!$scope.collapseb;
      })
      .catch(function (err) {
        console.log(err);
        $scope.hideLoader=true; //Ocultamos el loader en boton 'Actualizar resultados'
      })
    }

    /* Funcion para mostrar la infowindow cuando se cliquea un marcador */
    $scope.showInfoWindow = function (map, marker, marcador) {
      infowindow.setContent(marcador.infowindow.content);
      infowindow.open(map, marker);
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
