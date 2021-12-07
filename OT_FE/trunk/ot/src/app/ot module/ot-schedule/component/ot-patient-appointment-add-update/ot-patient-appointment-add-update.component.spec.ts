import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtPatientAppointmentAddUpdateComponent } from './ot-patient-appointment-add-update.component';

describe('OtPatientAppointmentAddUpdateComponent', () => {
  let component: OtPatientAppointmentAddUpdateComponent;
  let fixture: ComponentFixture<OtPatientAppointmentAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtPatientAppointmentAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtPatientAppointmentAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
