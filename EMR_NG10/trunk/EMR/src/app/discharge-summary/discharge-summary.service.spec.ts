import { TestBed } from '@angular/core/testing';

import { DischargeSummaryService } from './discharge-summary.service';

describe('DischargeSummaryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DischargeSummaryService = TestBed.get(DischargeSummaryService);
    expect(service).toBeTruthy();
  });
});
