import { TestBed } from '@angular/core/testing';

import { ScoreTemplateService } from './score-template.service';

describe('ScoreTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScoreTemplateService = TestBed.get(ScoreTemplateService);
    expect(service).toBeTruthy();
  });
});
