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


    $scope.dia;
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
    gestionservice.Vendedores(codigo)
    .then(function(response){
      $scope.vendedores = response.data
      console.log(response.data);
    })
    .catch(function(err){
      console.log(err);
    })
  }

  /* Funcion utilizada para tener el mapa disponible como una variable global dentro del codigo.
     Esta funcion se ejecuta cuando el mapa se ha cargado. */
  $scope.bindMap = function(map){
    $scope.mapa = map;
  }

  console.log($scope.dia);

  /* Funcion que se ejecuta al presionar el boton 'Actualizar resultados' */
  $scope.getMarcadores = function(dia, from_hour, to_hour) {
    $scope.hideLoader = false;
    gestionservice.Marcadores($scope.vendedores, moment(dia).format('YYYY-MM-DD'), moment(dia).format('YYYY-MM-DD'), from_hour, to_hour).
    then(function (response) {
      console.log(response);
      $scope.hideLoader = true;
    }).catch(function (err) {
      console.log(err);
    })


  }


    /* Hacer calculos correspondientes para obtener rendimiento de los vendedores*/

    /* Yo me imagino la respuesta asi, pero no tiene por que serlo. Es a modo de ejemplo,
    cada elemento de la respuesta es un vendedor */
   /* var respuesta = [
      {
        codigo: 1111,
        nombre: "Paola Munoz",
        posicion: {
          latitud: -33.455,
          longitud: -70.655
        },
        rendimiento: 35,
        ranking: 1,
        cantidadVentas: 2,
        cantidadNoVentas: 5,
        visitasPlanificadas: 17,
        visitasPendientes: 10,
        montoVentas: 100000
      },
      {
        codigo: 1323,
        nombre: "Victor Troncoso",
        posicion: {
          latitud: -33.455,
          longitud: -70
        },
        rendimiento: 85,
        ranking: 2,
        cantidadVentas:3,
        cantidadNoVentas: 6,
        visitasPlanificadas: 11,
        visitasPendientes: 2,
        montoVentas: 150000
      },
      {
        codigo: 1323,
        nombre: "Victor Troncoso 2",
        posicion: {
          latitud: -30,
          longitud: -70
        },
        rendimiento: 85,
        ranking: 2,
        cantidadVentas:3,
        cantidadNoVentas: 6,
        visitasPlanificadas: 11,
        visitasPendientes: 2,
        montoVentas: 150000
      }
    ]*/

    /* Una vez que se tienen las respuestas necesarias, agregar cada marcador a la
    lista de marcadores, con su respectiva información (es el codigo a continuacion)*/

    /* Seteamos los limites a cero */
   /* bounds = new google.maps.LatLngBounds();
    /* Se recorre la respuesta para crear los marcadores */
    /*for (var i = 0 ; i < respuesta.length ; i++ ) {
      var marcador = {};
      var position = new google.maps.LatLng(respuesta[i].posicion.latitud, respuesta[i].posicion.longitud);
      marcador.position = position;

      /* Parseamos los datos de la respuesta */
     /* var rendimiento = respuesta[i].rendimiento;
      var ranking = respuesta[i].ranking;
      var nombre = respuesta[i].nombre;
      var visitasPendientes = respuesta[i].visitasPendientes;
      var cantidadVentas = respuesta[i].cantidadVentas;
      var cantidadNoVentas = respuesta[i].cantidadNoVentas;
      var montoVentas = respuesta[i].montoVentas;
      var ticketPromedio = montoVentas / cantidadVentas;

      /* Verificamos el rendimiento del vendedor actual, para asignarle el pin correspondiente */
     /* if (rendimiento <= 25){
        marcador.icon = {url: '/images/pin-noventa.png', scaledSize: pinSize};
      } else if (rendimiento > 25 && rendimiento <= 50) {
        marcador.icon = {url: '/images/pin-amarillo.png', scaledSize: pinSize};
      } else if (rendimiento > 50 && rendimiento <= 75) {
        marcador.icon = {url: '/images/pin-naranjo.png', scaledSize: pinSize};
      } else if (rendimiento > 75) {
        marcador.icon = {url: '/images/pin-venta.png', scaledSize: pinSize};
      }*

      /* Generamos el contenido del infowindow con formato HTML */
   /*   marcador.infowindow = {};
      marcador.infowindow.content = '<h2 class="infoWindowTitle">' + nombre + '</h2>' + '<div class="infoWindowContent"><ul>' + '<li>' + "Ranking: #" + ranking + '</li>' + '<li>' + "Ventas: " + cantidadVentas + '</li>' + '<li>' + "No Ventas: " + cantidadNoVentas + '</li>' +'<li>' + "Visitas Pendientes: " + visitasPendientes  + '</li>' + '<li>' + "Total Venta: " + $filter('currency')(montoVentas) + '</li>' + '<li>' + "Ticket Promedio: " + $filter('currency')(ticketPromedio) + '</li>' + '</ul></div>';

      $scope.marcadores.push(marcador); // Agregamos el marcador a la lista de marcadores
      bounds.extend(marcador.position); // Agregamos el marcador a los limites del mapa
    }
    $scope.mapa.fitBounds(bounds); // Seteamos los limites del mapa, para que todos los marcadores queden dentro
    $scope.hideLoader=true; //Ocultamos el loader en boton 'Actualizar resultados'
  }*/

  /* BORRAR ESTO. Ejemplo de la estructura de cada marcador. Lo deje para que veas como es la
  estructura no mas */
  // $scope.marcadores = [
  //   {
  //     position:position1,
  //     icon:{
  //       url: '/images/pin-amarillo.png',
  //       scaledSize: pinSize
  //     },
  //     infowindow:{
  //       content:'Contenido del pin 1'
  //     }
  //   },
  //   {
  //     position:position2,
  //     icon:{
  //       url: '/images/pin-noventa.png',
  //       scaledSize: pinSize
  //     },
  //     infowindow:{
  //       content:'Contenido del pin 2'
  //     }
  //   }
  // ]

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
