import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInsuranceUtilizationComponent } from './patient-insurance-utilization.component';

describe('PatientInsuranceUtilizationComponent', () => {
  let component: PatientInsuranceUtilizationComponent;
  let fixture: ComponentFixture<PatientInsuranceUtilizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientInsuranceUtilizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceUtilizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
