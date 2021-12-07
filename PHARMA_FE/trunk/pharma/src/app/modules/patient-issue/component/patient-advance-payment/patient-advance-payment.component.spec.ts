import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAdvancePaymentComponent } from './patient-advance-payment.component';

describe('PatientAdvancePaymentComponent', () => {
  let component: PatientAdvancePaymentComponent;
  let fixture: ComponentFixture<PatientAdvancePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAdvancePaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAdvancePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
