'use strict';

describe('Controller: CollapsecontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('appGeoApp'));

  var CollapsecontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CollapsecontrollerCtrl = $controller('CollapsecontrollerCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CollapsecontrollerCtrl.awesomeThings.length).toBe(3);
  });
});
