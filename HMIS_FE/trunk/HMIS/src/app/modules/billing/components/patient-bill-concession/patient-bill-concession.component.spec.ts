import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBillConcessionComponent } from './patient-advance-payment.component';

describe('PatientBillConcessionComponent', () => {
  let component: PatientBillConcessionComponent;
  let fixture: ComponentFixture<PatientBillConcessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientBillConcessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientBillConcessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
