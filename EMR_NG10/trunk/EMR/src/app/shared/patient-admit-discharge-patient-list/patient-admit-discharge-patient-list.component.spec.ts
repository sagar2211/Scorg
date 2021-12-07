import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAdmitDischargePatientListComponent } from './patient-admit-discharge-patient-list.component';

describe('PatientAdmitDischargePatientListComponent', () => {
  let component: PatientAdmitDischargePatientListComponent;
  let fixture: ComponentFixture<PatientAdmitDischargePatientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAdmitDischargePatientListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAdmitDischargePatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
