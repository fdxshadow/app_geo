'use strict';

describe('Service: gestionservice', function () {

  // load the service's module
  beforeEach(module('appGeoApp'));

  // instantiate service
  var gestionservice;
  beforeEach(inject(function (_gestionservice_) {
    gestionservice = _gestionservice_;
  }));

  it('should do something', function () {
    expect(!!gestionservice).toBe(true);
  });

});
