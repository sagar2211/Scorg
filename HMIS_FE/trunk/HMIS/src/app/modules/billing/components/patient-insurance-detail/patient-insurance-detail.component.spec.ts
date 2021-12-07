import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInsuranceDetailComponent } from './patient-insurance-detail.component';

describe('PatientInsuranceDetailComponent', () => {
  let component: PatientInsuranceDetailComponent;
  let fixture: ComponentFixture<PatientInsuranceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientInsuranceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
