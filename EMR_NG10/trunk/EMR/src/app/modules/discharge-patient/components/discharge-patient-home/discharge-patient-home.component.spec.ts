import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargePatientHomeComponent } from './discharge-patient-home.component';

describe('DischargePatientHomeComponent', () => {
  let component: DischargePatientHomeComponent;
  let fixture: ComponentFixture<DischargePatientHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargePatientHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargePatientHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
