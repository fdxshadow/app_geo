'use strict';

describe('Service: MarkersService', function () {

  // load the service's module
  beforeEach(module('appGeoApp'));

  // instantiate service
  var MarkersService;
  beforeEach(inject(function (_MarkersService_) {
    MarkersService = _MarkersService_;
  }));

  it('should do something', function () {
    expect(!!MarkersService).toBe(true);
  });

});
