import { TestBed } from '@angular/core/testing';

import { VitalsDataService } from './vitals-data.service';

describe('VitalsDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VitalsDataService = TestBed.get(VitalsDataService);
    expect(service).toBeTruthy();
  });
});
