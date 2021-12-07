import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentChartComponent } from './assessment-chart.component';

describe('AssessmentChartComponent', () => {
  let component: AssessmentChartComponent;
  let fixture: ComponentFixture<AssessmentChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
