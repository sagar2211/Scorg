import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPatientPrescriptionComponent } from './show-patient-prescription.component';

describe('ShowPatientPrescriptionComponent', () => {
  let component: ShowPatientPrescriptionComponent;
  let fixture: ComponentFixture<ShowPatientPrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowPatientPrescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPatientPrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
