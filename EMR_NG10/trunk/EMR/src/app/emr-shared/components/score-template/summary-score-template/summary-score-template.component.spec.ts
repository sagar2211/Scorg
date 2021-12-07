import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryScoreTemplateComponent } from './summary-score-template.component';

describe('SummaryScoreTemplateComponent', () => {
  let component: SummaryScoreTemplateComponent;
  let fixture: ComponentFixture<SummaryScoreTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryScoreTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryScoreTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
