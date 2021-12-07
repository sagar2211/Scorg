import { TestBed } from '@angular/core/testing';

import { LocationMasterService } from './location-master.service';

describe('LocationMasterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocationMasterService = TestBed.get(LocationMasterService);
    expect(service).toBeTruthy();
  });
});
