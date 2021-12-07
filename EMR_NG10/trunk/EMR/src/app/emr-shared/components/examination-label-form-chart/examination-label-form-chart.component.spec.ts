import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationLabelFormChartComponent } from './examination-label-form-chart.component';

describe('ExaminationLabelFormChartComponent', () => {
  let component: ExaminationLabelFormChartComponent;
  let fixture: ComponentFixture<ExaminationLabelFormChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExaminationLabelFormChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExaminationLabelFormChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
