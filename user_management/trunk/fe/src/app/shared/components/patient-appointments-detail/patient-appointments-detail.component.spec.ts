import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAppointmentsDetailComponent } from './patient-appointments-detail.component';

describe('PatientAppointmentsDetailComponent', () => {
  let component: PatientAppointmentsDetailComponent;
  let fixture: ComponentFixture<PatientAppointmentsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientAppointmentsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAppointmentsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
