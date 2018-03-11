'use strict';

describe('Controller: GestionMasivaCtrl', function () {

  // load the controller's module
  beforeEach(module('appGeoApp'));

  var GestionMasivaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GestionMasivaCtrl = $controller('GestionMasivaCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(GestionMasivaCtrl.awesomeThings.length).toBe(3);
  });
});
