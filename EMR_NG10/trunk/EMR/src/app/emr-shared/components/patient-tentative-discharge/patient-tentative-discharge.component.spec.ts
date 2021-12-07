import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTentativeDischargeComponent } from './patient-tentative-discharge.component';

describe('PatientTentativeDischargeComponent', () => {
  let component: PatientTentativeDischargeComponent;
  let fixture: ComponentFixture<PatientTentativeDischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientTentativeDischargeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientTentativeDischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
