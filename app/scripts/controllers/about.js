/**
 * @ngdoc function
 * @name appGeoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the appGeoApp
 */
     "use strict";

     var app = angular.module("appGeoApp");

     app.controller("AboutCtrl", ["$scope", "$rootScope", "$location", "$timeout", "MarkersService", "$interval",
         function ($scope, $rootScope, $location, $timeout, MarkersService, $interval){

         Number.prototype.formatMoney = function(c, d, t){
         var n = this,
             c = isNaN(c = Math.abs(c)) ? 2 : c,
             d = d == undefined ? "," : d,
             t = t == undefined ? "." : t,
             s = n < 0 ? "-" : "",
             i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
             j = (j = i.length) > 3 ? j % 3 : 0;
            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
          };

         var mapOptions = {
             zoom: 9,
             center: new google.maps.LatLng(-33.455, -70.655),
             mapTypeId: google.maps.MapTypeId.TERRAIN
         };

         var zoomActual = 9;
         var zoomNuevo;
         $scope.listRouteGPS = []
         $scope.listBorderRouteGPS = []

         $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
         map.addEventListener('google-map-ready', function(e) {
            alert('Map loaded!');
         });

         $scope.oms = new OverlappingMarkerSpiderfier($scope.map, {
             keepSpiderfied: true,
             nearbyDistance: 50,
         });

         var border = new google.maps.Polyline({
             strokeColor: 'black', // border color
             strokeOpacity: 1.0,
             strokeWeight: 7 // You can change the border weight here
         });

         var polyline = new google.maps.Polyline({
            // set desired options for color, opacity, width, etc.
            strokeColor:"#FFFF00",  // blue (RRGGBB, R=red, G=green, B=blue)
            strokeOpacity: 1,      // opacity of line
            strokeWeight: 5
         });

         var bounds = new google.maps.LatLngBounds();

         var path = [];
         var vendorColor;
         var vendorColorList = [];

         $rootScope.total = 0;
         $rootScope.avg = 0;

         var directionsService = new google.maps.DirectionsService();

         var geocoder = new google.maps.Geocoder();

         var chartOptions = {
                 responsive: true,
                 legend: {
                     display: false
                 },
                 tooltips: {
                     enabled: false
                 },
                 hover: {
                     mode: null
                 }
         };

         $rootScope.finishedCustomMarkers = false;
         $rootScope.finishedForeignMarkers = false;

         var chart;

         $scope.$on("$routeChangeSuccess", function () {
             if (document.getElementById("pieChart") !== null) {
                 chart = new Chart(document.getElementById("pieChart").getContext("2d"), {
                     type: 'pie',
                     data: {
                         labels: ["Ventas", "No Ventas", "Visitas Pendientes", "Fuera de Ruta"],
                         datasets: [{
                             backgroundColor: ["#0B9B00","#FF1E00","#B0B0B0", "#000000"],
                             data: [1, 1, 1, 1]
                         }]
                     },
                     options: chartOptions
                 });
             }
             else {
                 chart = null;
             }
         });

         function getRandomColor() {
           var letters = '0123456789ABCDEF';
           var color = '#';
           for (var i = 0; i < 6; i++) {
             color += letters[Math.floor(Math.random() * 16)];
           }
           return color;
         }

         var choiceVendor = function (info) {
             var vendor = {
             nombre: info.nombreVendedor,
             codigo: info.codigoVendedor
             }
             $rootScope.vendorsList.push(vendor);
         }

         var selectVendor = function (info) {
         	var vendor = {
         	nombre: info.nombreVendedor,
         	codigo: info.codigoVendedor
         	}
         	$rootScope.selectedVendors.push(vendor);
         }

         $scope.$on("$routeChangeSuccess", function () {
             var page;
             if ($location.path() == "/geo") {
                 page = "geo";
             }
             else if ($location.path() == "/ges") {
                 page = "ges";
             };
             if ($rootScope.credentials.currentUser.role == "ADMI") {
                 $rootScope.supervisorsList = [];
                 MarkersService.getSupervisors (1, page);
             }
             else if ($rootScope.credentials.currentUser.role == "SUPE") {
                 MarkersService.getVendors($rootScope.credentials.currentUser.code, function (response) {
                     $rootScope.vendorsList = [];
                     $scope.vendors = response.data;
                     for (var i = 0; i < $scope.vendors.length; i++) {
                         choiceVendor($scope.vendors[i]);
                     }
                 })
             }
             else {
                 //console.log($rootScope.credentials.currentUser.role);
                 $rootScope.selectedVendors.push($rootScope.credentials.currentUser);
                 //console.log($rootScope.selectedVendors[0].codigo);
             };
         });

         $rootScope.allSelected = false;
         $rootScope.buscarAsociado = true;

         var allSupervisorsSelected = false;

         $scope.getVendorsBySupervisor = function (codigoSupervisor, page) {
         	$rootScope.allSelected = false;
         	if (codigoSupervisor == "All" && page == "geo") {
         		$rootScope.vendorsList = [];
         		$rootScope.selectedVendors = [];
         		for (var i = 0; i < $rootScope.supervisorsList.length; i++) {
         			var cod = $rootScope.supervisorsList[i].codigo;
         			MarkersService.getVendors(cod, function (response) {
         				$scope.vendors = response.data;
         				for (var e = 0; e < $scope.vendors.length; e++) {
         					selectVendor($scope.vendors[e]);
         					$rootScope.allSelected = true;
         				}
         			})
         		}
         	}
         	else if (codigoSupervisor == "All" && page == "ges") {
             allSupervisorsSelected = true;
         		$rootScope.selectedVendors = [];
         		for (var i = 0; i < $rootScope.supervisorsList.length; i++) {
         			var cod = $rootScope.supervisorsList[i].codigo;
         			MarkersService.getVendors(cod, function (response) {
         			    $scope.vendors = response.data;
         			    for (var e = 0; e < $scope.vendors.length; e++) {
         			        selectVendor($scope.vendors[e]);
         			    };
         			})
         		}
         	}
         	else if (codigoSupervisor != "All" && page == "ges") {
             allSupervisorsSelected = false;
         		MarkersService.getVendors(codigoSupervisor, function (response) {
         		    $rootScope.selectedVendors = [];
         		    $scope.vendors = response.data;
         		    for (var i = 0; i < $scope.vendors.length; i++) {
         		        selectVendor($scope.vendors[i]);
         		    };
         		})
         	}
         	else {
         		MarkersService.getVendors(codigoSupervisor, function (response) {
         		    $rootScope.vendorsList = [];
         		    $rootScope.selectedVendors = [];
         		    $scope.vendors = response.data;
         		    for (var i = 0; i < $scope.vendors.length; i++) {
         		        choiceVendor($scope.vendors[i]);
         		    };
         		})
         	}
         };

         $scope.slider = {
             minValue: "00:00",
             maxValue: "23:59",
             options: {
                 stepsArray: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:59"]
             }
         };

         $scope.ctrl = {};

         $scope.today = moment().format("DD-MM-YYYY");
         console.log("today",$scope.today);

         $scope.types = ["Planificación", "Venta", "No Venta", "Venta Fuera de Ruta", "GPS"];

         var pinSize = new google.maps.Size(30, 45);
         var pinOrigin = new google.maps.Point(0, 0);
         var pinAnchor = new google.maps.Point(15, 45);
         var pinLabel = new google.maps.Point(15, 15);
         var sqSize = new google.maps.Size(45, 45);
         var sqOrigin= new google.maps.Point(0, 0);
         var sqAnchor = new google.maps.Point(22.5, 45);
         var sqLabel = new google.maps.Point(22.5, 15);

         $scope.icons = {
             "planPin": {
                 url: "images/pin-rutafutura.png",
                 scaledSize: pinSize,
                 origin: pinOrigin,
                 anchor: pinAnchor,
                 labelOrigin: pinLabel
             },
             "ventaPin": {
                 url: "images/pin-venta.png",
                 scaledSize: pinSize,
                 origin: pinOrigin,
                 anchor: pinAnchor,
                 labelOrigin: pinLabel
             },
             "naranjoPin": {
                 url: "images/pin-naranjo.png",
                 scaledSize: pinSize,
                 origin: pinOrigin,
                 anchor: pinAnchor,
                 labelOrigin: pinLabel
             },
             "amarilloPin": {
                 url: "images/pin-amarillo.png",
                 scaledSize: pinSize,
                 origin: pinOrigin,
                 anchor: pinAnchor,
                 labelOrigin: pinLabel
             },
             "noVentaPin": {
                 url: "images/pin-noventa.png",
                 scaledSize: pinSize,
                 origin: pinOrigin,
                 anchor: pinAnchor,
                 labelOrigin: pinLabel
             },
             "fueraDeRutaPin": {
                 url: "images/pin-venta-fueraderuta.png",
                 scaledSize: pinSize,
                 origin: pinOrigin,
                 anchor: pinAnchor,
                 labelOrigin: pinLabel
             },
             "gpsPin": {
                 url: "images/pin-gps.png",
                 scaledSize: pinSize,
                 origin: pinOrigin,
                 anchor: pinAnchor,
                 labelOrigin: pinLabel
             },
             "planSq": {
                 url: "images/rutafutura.png",
                 scaledSize: sqSize,
                 origin: sqOrigin,
                 anchor: sqAnchor,
                 labelOrigin: sqLabel
             },
             "ventaSq": {
                 url: "images/venta.png",
                 scaledSize: sqSize,
                 origin: sqOrigin,
                 anchor: sqAnchor,
                 labelOrigin: sqLabel
             },
             "noVentaSq": {
                 url: "images/no venta.png",
                 scaledSize: sqSize,
                 origin: sqOrigin,
                 anchor: sqAnchor,
                 labelOrigin: sqLabel
             },
             "fueraDeRutaSq": {
                 url: "images/fueraderuta.png",
                 scaledSize: sqSize,
                 origin: sqOrigin,
                 anchor: sqAnchor,
                 labelOrigin: sqLabel
             },
             "gpsSq": {
                 url: "images/gps.png",
                 scaledSize: sqSize,
                 origin: sqOrigin,
                 anchor: sqAnchor,
                 labelOrigin: sqLabel
             }
         };

         $rootScope.markers = [];


         var infoWindow = new google.maps.InfoWindow();
         $scope.oms.addListener('unspiderfy', function () {
             infoWindow.close();
             // path = [];
             // polyline.setPath(path);
         });
         google.maps.event.addListener(infoWindow, 'closeclick', function () {
             $scope.oms.unspiderfy();
             // path = [];
             // polyline.setPath(path);
         });


         $scope.openInfoWindow = function (e, selectedMarker) {
             e.preventDefault();
             google.maps.event.trigger(selectedMarker, 'click');
         }

         // Generación de marcadores y rutas

         var createMarker = function (info, day, page, vendor, address) {
         	var map;
             if (page == "geo") {
             	map = $scope.map;
             }
             else if (page == "ges") {
             	map = null;
             }
             var vendorName;
             for (var i = 0; i < $rootScope.selectedVendors.length; i++){
                 if($rootScope.selectedVendors[i].codigo == vendor){
                     vendorName = $rootScope.selectedVendors[i].nombre
                 }
             }
             var label = "" + vendor;
             if (day == "plan") {
             	var ico = $scope.icons["planSq"];
             	var title = info.razonSocial;
             	var client = info.rutCliente;
             	var clientName = info.razonSocial;
             	var type = "Planificación";
             	var money = null;
             	var hour = null;
             	var content = '<div class="infoWindowContent"><ul>' + '<li>' + "RUT: " + info.rutCliente + '</li>' + '</ul></div>';
             }
             else if (info.pedido_id == null) {
                 var ico = $scope.icons["gpsSq"];
                 var title = "GPS";
                 var type = "GPS";
                 var money = null;
                 var client = null;
                 var clientName = null;
                 var content = '<div class="infoWindowContent"><ul>' + '<li>' + "Fecha: " + moment(info.fecha).format("DD/MM/YYYY")  + '</li>' +'<li>' + "Hora: " + moment(info.fecha).format("HH:mm")  + '</li>' + '</ul></div>';
             }
             else {
                 var title = info.pedido.cliente.nombre;
                 var clientName = info.pedido.cliente.nombre;
                 var client = info.pedido.cliente_rut;
                 var money = info.pedido.total;
                 var moneyString = info.pedido.total.formatMoney(0, '.', ',');
                 var content = '<div class="infoWindowContent"><ul>' + '<li>' + "RUT: " + info.pedido.cliente_rut + '</li>' + '<li>' + "Total Pedido: $" + moneyString + '</li>' + '<li>' + "Fecha: " + moment(info.fecha).format("DD/MM/YYYY")  + '</li>' +'<li>' + "Hora: " + moment(info.fecha).format("HH:mm")  + '</li>' + '</ul></div>';
                 if (info.pedido.razon_id != null && info.pedido.razon_id != 0) {
                     var ico = $scope.icons["noVentaSq"];
                     var type = "No Venta"
                 }
                 else if (info.pedido.fuera_de_ruta != null && info.pedido.fuera_de_ruta != 0) {
                     var ico = $scope.icons["fueraDeRutaSq"];
                     var type = "Venta Fuera de Ruta"
                 }
                 else {
                     var ico = $scope.icons["ventaSq"];
                     var type = "Venta"
                 }
             }
             var textMarker = vendor.toString();
             if(info.pedido !== undefined){
                 if(info.pedido.markerText !== undefined)
                     textMarker = info.pedido.markerText;
             }
             var position = new google.maps.LatLng(info.latitud, info.longitud);
             if(address != null) {
             	position = address;
             }
             var marker = new google.maps.Marker({
 				map: map,
                 position: position,
                 title: title,
                 clientName: clientName,
                 client: client,
                 label: textMarker,
                 vendor: vendor,
                 vendorName: vendorName,
                 day: info.fecha,
                 hour: moment(info.fecha).format("HH:mm"),
                 money: money,
                 icon: ico,
                 type: type,
                 day: day,
                 lat: info.latitud,
                 lng: info.longitud,
                 page: page,
                 visible: false,
                 geoCodeAddress: address,
                 content: content
             });
             //marker.setMap($scope.map);

             google.maps.event.addListener(marker, 'spider_click', function () {
                 console.log($rootScope.markers);
                 infoWindow.close();
                 infoWindow.setContent('<h2 class="infoWindowTitle">' + marker.title + '</h2>' + marker.content);
                 infoWindow.open($scope.map, marker);
                 if (marker.type == "Planificación" || marker.type == "Venta") {
                   bounds = new google.maps.LatLngBounds();
                   if ($rootScope.buscarAsociado) {
                     for (var i = 0; i < $rootScope.markers.length; i++) {
                       var markerAssoc = $rootScope.markers[i];
                       if (markerAssoc.client == marker.client && markerAssoc.type != marker.type && marker.map != null) {
                         path = [];
                         border.setPath(path);
                         polyline.setPath(path);
                         var myLatLng = new google.maps.LatLng(marker.lat, marker.lng);
                         var myLatLngAssoc = new google.maps.LatLng(markerAssoc.lat, markerAssoc.lng);
                         $scope.oms.unspiderfy();
                         infoWindow.open($scope.map, marker);
                         bounds.extend(myLatLng);
                         bounds.extend(myLatLngAssoc);

                         path.push(myLatLng);
                         path.push(myLatLngAssoc);
                         //console.log("marker position:", marker.lat, marker.lng);
                         //console.log("marker position lat lng:", marker.getPosition().lat(),marker.getPosition().lng() );
                         //console.log("markerAssoc position:", markerAssoc.lat, markerAssoc.lng);
                         border.setPath(path);
                         polyline.setPath(path);
                         border.setMap($scope.map);
                         polyline.setMap($scope.map);


                         $rootScope.buscarAsociado = false;
                         $scope.map.fitBounds(bounds);
                         //google.maps.event.trigger(markerAssoc, 'click');
                       }
                     }

                     //console.log(bounds);
                   }
                 }
                 $rootScope.buscarAsociado = true;

             });
             // $scope.oms.addListener('click', function (marker) {
             //     console.log(marker);
             //     infoWindow.close();
             //     infoWindow.setContent('<h2 class="infoWindowTitle">' + marker.title + '</h2>' + content);
             //     infoWindow.open($scope.map, marker);

             // });

             for (var i = 0; i < $scope.selectedTypes.length; i++) {
                 if (marker.type == $scope.selectedTypes[i] && marker.page != "ges")
                     marker.visible = true;
             }

             var isDuplicate = false;
             $rootScope.markers.forEach(function (element) {
                 if (element.client === marker.client) {
                 	if (address != null && element.geoCodeAddress === marker.geoCodeAddress || element.lat === marker.lat && element.lng === marker.lng) {
                 		    isDuplicate = true;
                 		    return false;
                 	}
                 }
             })
             if (isDuplicate == true) {
                 marker.visible = false;
             };

             $rootScope.markers.push(marker);
             $rootScope.countingMarkers = $rootScope.countingMarkers +1;
             $scope.oms.addMarker(marker);
             //console.log($scope.oms);
         }

         var markerFromAdress = function (info, day, page, vendor) {

         	$rootScope.markersByAddress = $rootScope.markersByAddress +1;
             geocoder.geocode( { "address": info.direccion + info.numeroDireccion + "," + info.descripcionComuna + "," + info.descripcionCiudad + "," + "Chile"},function (results, status) {
                     if (status == google.maps.GeocoderStatus.OK) {

                         createMarker(info, day, page, vendor, results[0].geometry.location);


                     }
                     else {
                     	// Desactive este log porque estaba llenando la consola;
                         // console.log("No existe latitud y longitud para vendedor: " + vendor + ", fecha: " + info.fecha + ". Marcador tampoco se pudo generar por dirección, por error: " + status);
                         if (status == "ZERO_RESULTS"){
                         	$rootScope.zeroResults = $rootScope.zeroResults +1;
                         }
                         else if (status == "OVER_QUERY_LIMIT") {
                         	$rootScope.overQueryLimit = $rootScope.overQueryLimit +1;
                         }
                         $rootScope.countingMarkers = $rootScope.countingMarkers +1;
                         $rootScope.errorMarkers = $rootScope.errorMarkers +1;
                     }
                 }
             )
         }

         $rootScope.directionsArray = [];

         var createRoute = function (start, end, waypts, color, vendor, day) {
             // var directionsDisplay = new google.maps.DirectionsRenderer({
             //     suppressMarkers: true,
             //     polylineOptions: {
             //         strokeColor: color
             //     }
             // });

             // routeGPS.setMap($scope.map);
             // routeGPS.setPath(waypts);

             //directionsDisplay.setMap($scope.map);

             var request = {
                 origin: start,
                 destination: end,
                 waypoints: waypts,
                 optimizeWaypoints: false,
                 travelMode: google.maps.TravelMode.WALKING
             };
             // directionsService.route(request, function(response, status) {
             //     if (status == google.maps.DirectionsStatus.OK) {
             //         //directionsDisplay.setDirections(response);
             //         $rootScope.directionsArray.push(directionsDisplay);
             //     }
             //     else if (waypts != null){
             //         $rootScope.routeErrors = $rootScope.routeErrors +1;
             //     	//console.log("Error en ruta, vendedor = " + vendor + ", día = " + day + ". Google Status = " + status + ". Se intentará crear una versión simplificada, puede que no incluya todos los marcadores");
             // 		createRoute(start, waypts[0].location, null, color, vendor, day);
             // 		createRoute(waypts[0].location, waypts[parseInt(waypts.length/4)].location, null, color, vendor, day);
             // 		createRoute(waypts[parseInt(waypts.length/4)].location, waypts[parseInt(waypts.length/4) *2].location, null, color, vendor, day);
             // 		createRoute(waypts[parseInt(waypts.length/4) *2].location, waypts[parseInt(waypts.length/4) *3].location, null, color, vendor, day);
             // 		createRoute(waypts[parseInt(waypts.length/4) *3].location, waypts[waypts.length -1].location, null, color, vendor, day);
             // 		createRoute(waypts[waypts.length -1].location, end, null, color, vendor, day);
             //     }
             // })
         }


         var routeByVendor = function (vendor, day) {
         	moment.locale("es");
         	var ddd = moment(day).format('ddd').toUpperCase().replace(".", "");
         	var color;
         	if (ddd == "LUN") {
         		color = "red"
         	}
         	else if (ddd == "MAR") {
         		color = "blue"
         	}
         	else if (ddd == "MIÉ") {
         		color = "green"
         	}
         	else if (ddd == "JUE") {
         		color = "purple"
         	}
         	else if (ddd == "VIE") {
         		color = "orange"
         	}
         	else if (ddd == "SÁB") {
         		color = "brown"
         	}
         	else if (ddd == "DOM") {
         		color = "black"
         	}

             var routeArr = [];
             for (var i = 0; i < $rootScope.markers.length; i++) {
                 var marker = $rootScope.markers[i];
                 if (marker.vendor == vendor && marker.day == day && marker.map != null && marker.type == "GPS") {
                     routeArr.push(marker.getPosition());
                 }
             }

             // if (routeArr.length <= 25) {
             var start = routeArr [0];
             var end = routeArr[routeArr.length - 1];
             var waypts = [];
             var pathRoute = [];
             $scope.listRouteGPS = []
             $scope.listBorderRouteGPS = []

             vendorColor = getRandomColor();

             while (vendorColorList.includes(vendorColor) || vendorColor == color){
               vendorColor = getRandomColor();
             }

             vendorColorList.push(vendorColor);
             console.log("vendorColor:", vendorColor);

             for (var i = 1; i < routeArr.length -1; i++) {
               if (routeArr[i] != end) {
                 pathRoute = [];
                 $scope.routeGPS = new google.maps.Polyline({
                     strokeOpacity: 1,
                     strokeColor: color,
                     strokeWeight: 4 // You can change the border weight here
                 });

                 $scope.borderRouteGPS = new google.maps.Polyline({
                     strokeColor: vendorColor, // border color
                     strokeOpacity: 1.0,
                     strokeWeight: 8 // You can change the border weight here
                 });
                 // routeGPS.setOptions({icons: [{icon: lineSymbol, offset: '100%'}]});
                 $scope.borderRouteGPS.setMap($scope.map);
                 $scope.routeGPS.setMap($scope.map);

                 pathRoute.push(routeArr[i]);
                 pathRoute.push(routeArr[i+1]);

                 $scope.borderRouteGPS.setPath(pathRoute);
                 $scope.routeGPS.setPath(pathRoute);

                 $scope.listBorderRouteGPS.push($scope.borderRouteGPS);
                 $scope.listRouteGPS.push($scope.routeGPS);
               }
                 // waypts.push(routeArr[i]);
                 // console.log("routeArr[i]", routeArr[i]);
             }


             //createRoute(start, end, waypts, color, vendor, day);
             // }
             // else {
             //     while (routeArr.length > 25) {
             //         var smallRoute = routeArr.splice(0, 25);
             //
             //         var start = smallRoute [0];
             //         var end = smallRoute[smallRoute.length - 1];
             //         var waypts = [];
             //
             //         for (var i = 1; i < smallRoute.length -1; i++) {
             //             waypts.push({
             //                 location: smallRoute[i],
             //                 stopover: false
             //                 });
             //             }
             //
             //         createRoute(start, end, waypts, color, vendor, day);
             //     }
             // }
         };

         $rootScope.selectedVendors = [];

         $scope.selectVendor = function (vendor, selectedVendor) {
             if (selectedVendor == true) {
                 $rootScope.selectedVendors.push(vendor);
             }
             else if (selectedVendor == false) {
                 for (var i = 0; i < $rootScope.selectedVendors.length; i++) {
                     if ($rootScope.selectedVendors[i] == vendor) {
                         $rootScope.selectedVendors.splice(i, 1);
                         i--;
                     }
                 }
             }
         };

         $scope.selectedTypes = ["Planificación", "Venta", "No Venta", "Venta Fuera de Ruta", "GPS"];

         $scope.selectType = function (type, selectedType) {
             if (selectedType == true) {
                 $scope.selectedTypes.push(type);
             }
             else if (selectedType == false) {
                 for (var i = 0; i < $scope.selectedTypes.length; i++) {
                     if ($scope.selectedTypes[i] == type) {
                         $scope.selectedTypes.splice(i, 1);
                         i--;
                     }
                 }
             }
         };

         var sumMoney = function(){
             $rootScope.total = 0;
             for (var i = 0; i < $rootScope.markers.length; i++) {
                 $rootScope.total = $rootScope.total + $rootScope.markers[i].money;
              }
              $rootScope.avg = $rootScope.total/($rootScope.ventas + $rootScope.ventasNo)
         };

         var countTypes = function(){
             $rootScope.ventas = 0;
             $rootScope.noVentas = 0;
             $rootScope.ventasNo = 0;
             $rootScope.gps = 0;
             $rootScope.planificacion = 0;
             $rootScope.visitasPlanificadas = 0;

             for (var i = 0; i < $rootScope.markers.length; i++) {
                 var marker = $rootScope.markers[i];
                 //$scope.oms.addMarker($rootScope.markers[i]);

                 if (marker.type == "Venta") {
                     $rootScope.ventas = $rootScope.ventas + 1;
                     $rootScope.planificacion = $rootScope.planificacion -1;
                 }
                 else if (marker.type == "No Venta") {
                     $rootScope.noVentas = $rootScope.noVentas + 1;
                     $rootScope.planificacion = $rootScope.planificacion -1;
                 }
                 else if (marker.type == "Venta Fuera de Ruta") {
                     $rootScope.ventasNo = $rootScope.ventasNo + 1;
                 }
                 else if (marker.type == "GPS") {
                     $rootScope.gps = $rootScope.gps +1;
                 }
                 else if (marker.type == "Planificación") {
                     $rootScope.planificacion = $rootScope.planificacion +1;
                     $rootScope.visitasPlanificadas = $rootScope.visitasPlanificadas +1;
                 }
                 else {
                     //console.log(marker.client + " " + marker.vendorName + " no tiene tipo asignado.")
                 }
             }
             // TODO: Revisar si la variable '$rootScope.planificacion' es menor a 0
             // Si lo es, setearla a 0. Puede ocurrir que esta variable sea menor a 0 por problemas
             // con los datos que se reciben desde el WebService
             if ($rootScope.planificacion < 0) {
               $rootScope.planificacion = 0;
             }
         };


         $rootScope.reporteria = [];

         $scope.sortProperty = "ventas";
         $scope.sortReverse = true;

         $scope.sortBy = function(sortProperty) {
         	$scope.sortReverse = ($scope.sortProperty === sortProperty) ? !$scope.sortReverse : false;
         	$scope.sortProperty = sortProperty;
         };

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
         };

         var markersByVendor = function (vendor) {
             var markersArr = [];
             for (var i = 0; i < $rootScope.markers.length; i++) {
                 if ($rootScope.markers[i].vendor == vendor.codigo) {
                     markersArr.push($rootScope.markers[i]);
                 }
             };
             return markersArr;
         };

         var vendorReport = function (nombre, codigo, ventas, plan, noVentas, money, perf, avg) {
         	var report = {
         		nombre: nombre,
         		codigo: codigo,
         		ventas: ventas,
         		plan: plan,
         		noVentas: noVentas,
         		perf: perf,
         		money: money,
         		moneyString: money.formatMoney(0, '.', ','),
         		avg: avg,
         		avgString: avg.formatMoney(0, '.', ','),
         	};

         	$rootScope.reporteria.push(report);
             $rootScope.readyReports = $rootScope.readyReports +1;
         };

         var vendorsRanking = function (page) {
         	$rootScope.reporteria = [];
             $rootScope.expectedReports = 0;
             $rootScope.readyReports = 0;
         	for (var i = 0; i < $rootScope.selectedVendors.length; i++) {
                 $rootScope.expectedReports = $rootScope.expectedReports +1;
         		var markers = markersByVendor($rootScope.selectedVendors[i]);
         		var ventas = 0;
         		var noVentas = 0;
         		var plan = 0;
         		var money = 0;
         		for (var e = 0; e < markers.length; e++) {
         			money = money + markers[e].money
         			if (markers[e].type == "Venta") {
         			    ventas = ventas +1;
         			    plan = plan -1;
         			}
         			else if (markers[e].type == "Planificación") {
         			    plan = plan +1;
         			}
               // Se agregó clausula if para considerar como venta las ventas fuera de Ruta
               // No considerarlas generaba una division por cero en el calculo de avg = money/ventas
               // Esto se daba cuando el vendedor no tenia ninguna venta pero sí tenia Ventas fuera de Ruta
               // TODO: Considerar una etiqueta de Ventas Fuera de Ruta para el InfoWindow
               else if (markers[e].type == "Venta Fuera de Ruta") {
         			    ventas = ventas +1;
         			}
         			else if (markers[e].type == "No Venta") {
         			    noVentas = noVentas +1;
         			    plan = plan -1;
         			}
         		};
         		var perf = ventas/(plan + ventas + noVentas) * 100 || 0;
         		var avg = money/ventas || 0;
         		vendorReport ($rootScope.selectedVendors[i].nombre, $rootScope.selectedVendors[i].codigo, ventas, plan, noVentas, money, perf, avg);

         	};

             var interval = setInterval(function(){

                 if($rootScope.readyReports === $rootScope.expectedReports){

                     $rootScope.reporteria.sort(dynamicSort("ventas")).reverse();
                     if (page == "ges") {
                         for (var e = 0; e < $rootScope.selectedVendors.length; e++) {
                             var vendor = $rootScope.selectedVendors[e];
                             var rank = $rootScope.reporteria.map(function(e) { return e.nombre; }).indexOf(vendor.nombre);
                             var markers = markersByVendor(vendor);
                             var arr = [];
                             for (var a = 0; a < markers.length; a++) {
                                 if (markers[a].type != "Planificación") {
                                     arr.push(markers[a])
                                 }
                             }
                             var lastMarker = arr[arr.length -1];
                             if (lastMarker != undefined) {
                                 for (var a = 0; a < $rootScope.reporteria.length; a++) {
                                     var report = $rootScope.reporteria[a];
                                     if (report.codigo == vendor.codigo) {
                                         createGesMarker(lastMarker, report.ventas, report.noVentas, report.plan, report.money, report.avg, report.perf, rank)
                                     }
                                 }
                             }
                         }
                     }
                     clearInterval(interval);
                 }
                 //do whatever here..
             }, 1000);

         	//console.log("Reporteria");
         	//console.log($rootScope.reporteria);
         };

         var createGesMarker = function (lastMarker, ventas, noVentas, plan, money, avg, perf, rank) {

           //TODO: Si visitas pendientes (variable 'plan') es menor a 0. Setear la variable a 0.
           // Esto puede ocurrir cuando la suma de ventas + no ventas es mayor al numero de
           // visitas planeadas.

           if (plan < 0) {
             plan = 0;
           }

         	var ico;
             var rank = Number(rank) + 1
         	if (perf <= 25) {
         		ico = $scope.icons["noVentaPin"];
         	}
         	else if (perf <= 50 && perf > 25) {
         		ico = $scope.icons["naranjoPin"];
         	}
         	else if (perf > 50 && perf <= 75) {
         		ico = $scope.icons["amarilloPin"];
         	}
         	else if (perf > 75) {
         		ico = $scope.icons["ventaPin"];
         	};

         	var marker = new google.maps.Marker({
         		map: $scope.map,
         		position: new google.maps.LatLng(lastMarker.lat, lastMarker.lng),
         		title: lastMarker.vendorName,
         		ventas: ventas || 0,
         		noVentas: noVentas || 0,
         		plan: plan || 0,
         		money: money || 0,
         		moneyString: money.formatMoney(0, '.', ','),
         		avg: avg || 0,
         		avgString: avg.formatMoney(0, '.', ','),
         		perf: perf || 0,
         		icon: ico,
         		ranking: "#" + rank
         	});

         	var content = '<div class="infoWindowContent"><ul>' + '<li>' + "Ranking: #" + rank + '</li>' + '<li>' + "Ventas: " + ventas + '</li>' + '<li>' + "No Ventas: " + noVentas + '</li>' +'<li>' + "Visitas Pendientes: " + plan  + '</li>' + '<li>' + "Total Venta: $" + money.formatMoney(0, '.', ',') + '</li>' + '<li>' + "Ticket Promedio: $" + avg.formatMoney(0, '.', ',') + '</li>' + '</ul></div>';

         	google.maps.event.addListener(marker, 'click', function () {
         	    infoWindow.setContent('<h2 class="infoWindowTitle">' + marker.title + '</h2>' + content);
         	    infoWindow.open($scope.map, marker);
         	});

         	$rootScope.markers.push(marker);
         };

         $scope.days = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

         function getDates(startDate, stopDate) {
             moment.locale("es");
             var dateArray = [];
             var currentDate = moment(startDate);
             var stopDate = moment(stopDate);
             while (currentDate <= stopDate) {
                 dateArray.push(moment(currentDate).format('ddd').toUpperCase().replace("SÁB", "SAB").replace(".", "").replace("MIÉ", "MIE"));
                 currentDate = moment(currentDate).add(1, 'days');
             }
             return dateArray;
         };

         function coloredMarkers (fromDay, toDay, fromHour, toHour, page) {
             var fromDay = moment(fromDay).format("YYYY-MM-DD");
             var toDay = moment(toDay).format("YYYY-MM-DD");
             MarkersService.getMarkers($rootScope.selectedVendors, fromDay, toDay, fromHour, toHour, function (response){

                 var vendorList = response.data.data;
                 for( var vendedor_id in vendorList){
                     var daysList = vendorList[vendedor_id];
                     for (var key in daysList) {
                         for (var e = 0; e < daysList[key].length; e++){
                             var marker = daysList[key][e];

                             var vendor = marker.vendedor_id
                             if (marker.longitud == 0 && marker.latitud == 0 || marker.longitud == null || marker.latitud == null) {
                                 markerFromAdress(marker, key, page, vendor);
                                 $rootScope.markersQuerys = $rootScope.markersQuerys +1;
                             }
                             else {
                                 createMarker(marker, key, page, vendor, null);
                                 $rootScope.markersQuerys = $rootScope.markersQuerys +1;
                             }
                         }
                     if (page == "geo") {
                     	routeByVendor(vendor, key);
                     }
                     }
                 }

             });
             $rootScope.$broadcast('finishedCustomMarkersEvent');
         };

         function 
         planMarkers(fromDay, toDay, page) {
             $rootScope.routeErrors = 0;
         	$rootScope.countingMarkers = 0;
         	$rootScope.markersQuerys = 0;
         	$rootScope.markersByAddress = 0;
         	$rootScope.errorMarkers = 0;
         	$rootScope.zeroResults = 0;
         	$rootScope.overQueryLimit = 0;
         	$rootScope.doneQuerys = 0;
         	$rootScope.markersList = [];

         	var dateArray = getDates(fromDay, toDay);
         	var uniqueDays = dateArray.filter(function(elem, index, self) {
         	    return index == self.indexOf(elem);
         	});

         	$rootScope.planQuerys = $rootScope.selectedVendors.length * uniqueDays.length;
             for (var i = 0; i < $rootScope.selectedVendors.length; i++) {
                 var vendor = $rootScope.selectedVendors[i];
                 for (var o = 0; o < uniqueDays.length; o++) {

                 	var day = uniqueDays[o];

                   if (vendor.codigo == null) {
                     vendor.codigo = vendor.code;
                   }
                   console.log("vendor.codigo",vendor.codigo);
                   console.log("day",day);
                 	MarkersService.getPlanification(vendor.codigo, day, function(response) {
                    console.log("response",response);
                 		if (response.data.zona != null) {

                 				$rootScope.markersList = $rootScope.markersList.concat(response.data)
                 			} else{
                        console.log("getplanif error");
                      }
                 			$rootScope.doneQuerys = $rootScope.doneQuerys + 1;

                 		})
                 }

             }
             var interval = setInterval(function(){

                 if($rootScope.doneQuerys === $rootScope.planQuerys){

                 	for (var i = 0; i < $rootScope.selectedVendors.length; i++) {
                 	    var vendor = $rootScope.selectedVendors[i];

                 	   	for (var e = 0; e < dateArray.length; e ++) {

                 	   	    var day = dateArray[e];
                 	   	    var key = "plan";
             	   	    	for (var a = 0; a < $rootScope.markersList.length; a++) {
             	   	    		var list = $rootScope.markersList[a];
             	   	    		if (list.codigoVendedor == vendor.codigo) {
             	   	    			var markersList = [];
             	   	    			for (var u = 0; u < list.zona.length; u++) {
             	   	    				if (list.zona[u].dia == day) {
             	   	    					markersList = markersList.concat(list.zona[u].cliente);
             	   	    				}
             	   	    			}
             	   	    			for (var o = 0; o < markersList.length; o++) {
     	   	    						var marker = markersList[o];
     	   	    				        if (marker != null) {
     	   	    				            if (marker.longitud == 0 && marker.latitud == 0 || marker.longitud == null || marker.latitud == null) {
     	   	    				                markerFromAdress(marker, key, page, vendor.codigo);
     	   	    				                $rootScope.markersQuerys = $rootScope.markersQuerys +1;

     	   	    				            }
     	   	    				            else {
     	   	    				                createMarker(marker, key, page, vendor.codigo, null);
     	   	    				                $rootScope.markersQuerys = $rootScope.markersQuerys +1;
     	   	    				        	}
     	   	    				        };
             	   	    			}
             	   	    		}
             	   	    	}
             	   	    }

                 	};
                     clearInterval(interval);
                 }
             }, 1000);

             $rootScope.$broadcast('finishedForeignMarkersEvent');

         };

         $rootScope.loadGraph = function(page){
                 var chartData = [];
                 countTypes();
                 sumMoney();
                 vendorsRanking(page);
                 //console.log("Markers");
                 //console.log($rootScope.markers);

                 if (chart != null) {
                     chart.destroy();
                 };
                 if ($rootScope.ventas == 0 && $rootScope.noVentas == 0 && $rootScope.planificacion == 0 && $rootScope.ventasNo == 0) {
                   chartData = [1,1,1,1];
                 } else {
                   chartData = [$rootScope.ventas, $rootScope.noVentas, $rootScope.planificacion, $rootScope.ventasNo];
                 }
                 chart = new Chart(document.getElementById("pieChart").getContext("2d"), {
                         type: 'pie',
                         data: {
                             datasets: [{
                                 backgroundColor: ["#0B9B00","#FF1E00","#B0B0B0", "#000000"],
                                 labels: ["Ventas", "No Ventas", "Visitas Pendientes", "Fuera de Ruta"],
                                 data: chartData
                           }]
                         },
                         options: chartOptions
                 });
             };

         $scope.hideLoader = true;
         $scope.geoMarkers = function (fromDay, toDay, fromHour, toHour) {
             // if ($rootScope.credentials.currentUser.role !== "ADMI" && $rootScope.credentials.currentUser.role !== "SUPE") {
             //   fromDay = "2018/01/29";
             //   toDay = "2018/01/29";
             // }
             if (typeof $rootScope.selectedVendors != undefined && $rootScope.selectedVendors.length < 1) {
               alert("Debe seleccionar al menos un vendedor");
               return false;
             }

             $scope.hideLoader = false;

             vendorColorList = [];
             for (var i = 0; i < $scope.listRouteGPS.length; i++) {
                 $scope.listRouteGPS[i].setMap(null);
                 $scope.listRouteGPS.splice(i, 1);
                 i--;
             }
             $scope.listRouteGPS = [];

             for (var i = 0; i < $scope.listBorderRouteGPS.length; i++) {
                 $scope.listBorderRouteGPS[i].setMap(null);
                 $scope.listBorderRouteGPS.splice(i, 1);
                 i--;
             }
             $scope.listBorderRouteGPS = [];

             for (var i = 0; i < $rootScope.directionsArray.length; i++) {
                 $rootScope.directionsArray[i].setMap(null);
                 $rootScope.directionsArray.splice(i, 1);
                 i--;
             }

             for (var i = 0; i < $rootScope.markers.length; i++) {
                 $rootScope.markers[i].setMap(null);
                 $rootScope.markers.splice(i, 1);
                 i--;
             }

             var page = "geo";

             planMarkers(fromDay, toDay, page);

             coloredMarkers(fromDay, toDay, fromHour, toHour, page);

             var interval = setInterval(function(){

             	//console.log("Expected Queries = " + $rootScope.planQuerys + " Finalized Queries = " + $rootScope.doneQuerys + " Expected Markers = " + $rootScope.markersQuerys + " Finalized Markers = " + $rootScope.countingMarkers + " Markers without LatLng = " + $rootScope.markersByAddress + " Google Errors = " + $rootScope.errorMarkers + " Error: overQueryLimit = " + $rootScope.overQueryLimit + " Error: zeroResults = " + $rootScope.zeroResults + " Route Errors = " + $rootScope.routeErrors);

                 if($rootScope.finishedCustomMarkers && $rootScope.finishedForeignMarkers && $rootScope.doneQuerys === $rootScope.planQuerys && $rootScope.countingMarkers === $rootScope.markersQuerys){
                     $rootScope.loadGraph(page);
                     $scope.hideLoader = true;
                     var element = angular.element(document.getElementById('Geo'));
                     element.scope().$apply();
                     clearInterval(interval);
                 }
                 //do whatever here..
             }, 8000);

         };
         $rootScope.$on('finishedCustomMarkersEvent', function () {
             $rootScope.finishedCustomMarkers = true;
         });

         $rootScope.$on('finishedForeignMarkersEvent', function () {
             $rootScope.finishedForeignMarkers = true;
         });
         $scope.hideLoader = true;
         $rootScope.gesMarkers = function (day, fromHour, toHour) {
           $scope.hideLoader = false;
           $scope.saving = true;
           if ($rootScope.credentials.currentUser.role == "SUPE") {
             $scope.getVendorsBySupervisor($rootScope.credentials.currentUser.code ,'ges');
           }
         	for (var i = 0; i < $rootScope.directionsArray.length; i++) {
         	    $rootScope.directionsArray[i].setMap(null);
         	    $rootScope.directionsArray.splice(i, 1);
         	    i--;
         	}
         	for (var i = 0; i < $rootScope.markers.length; i++) {
         	    $rootScope.markers[i].setMap(null);
         	    $rootScope.markers.splice(i, 1);
         	    i--;
         	}

         	var page = "ges";

             planMarkers(day, day, page);
         	coloredMarkers(day, day, fromHour, toHour, page);

           var tiempo = (allSupervisorsSelected ? 15000: 10000)
         	var interval = $interval(function(){

                 //console.log("Expected Queries = " + $rootScope.planQuerys + " Finalized Queries = " + $rootScope.doneQuerys + " Expected Markers = " + $rootScope.markersQuerys + " Finalized Markers = " + $rootScope.countingMarkers + " Markers without LatLng = " + $rootScope.markersByAddress + " Google Errors = " + $rootScope.errorMarkers + " Error: overQueryLimit = " + $rootScope.overQueryLimit + " Error: zeroResults = " + $rootScope.zeroResults + " Route Errors = " + $rootScope.routeErrors);

                 if($rootScope.finishedCustomMarkers && $rootScope.finishedForeignMarkers && $rootScope.doneQuerys === $rootScope.planQuerys && $rootScope.countingMarkers === $rootScope.markersQuerys){
         	    	vendorsRanking(page);
                 $scope.hideLoader = true;
                 $scope.saving = false;

                     //console.log("Markers");
         	    	//console.log($rootScope.markers);
         	        clearInterval(interval);
         	    }
         	}, tiempo, false);

         };
     }]);
