import { TestBed } from '@angular/core/testing';

import { IcuFlowSheetService } from './icu-flow-sheet.service';

describe('IcuFlowSheetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IcuFlowSheetService = TestBed.get(IcuFlowSheetService);
    expect(service).toBeTruthy();
  });
});
