import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConsumptionSummeryComponent } from './patient-consumption-summery.component';

describe('PatientConsumptionSummeryComponent', () => {
  let component: PatientConsumptionSummeryComponent;
  let fixture: ComponentFixture<PatientConsumptionSummeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientConsumptionSummeryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientConsumptionSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
