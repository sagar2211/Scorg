import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAdmitDischargeListComponent } from './patient-admit-discharge-list.component';

describe('PatientAdmitDischargeListComponent', () => {
  let component: PatientAdmitDischargeListComponent;
  let fixture: ComponentFixture<PatientAdmitDischargeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAdmitDischargeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAdmitDischargeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
