import { TestBed } from '@angular/core/testing';

import { InvestigationService } from './investigation.service';

describe('InvestigationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvestigationService = TestBed.get(InvestigationService);
    expect(service).toBeTruthy();
  });
});
