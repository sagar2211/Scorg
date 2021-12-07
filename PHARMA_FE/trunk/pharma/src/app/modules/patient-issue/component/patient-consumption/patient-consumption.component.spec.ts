import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConsumptionComponent } from './patient-consumption.component';

describe('PatientConsumptionComponent', () => {
  let component: PatientConsumptionComponent;
  let fixture: ComponentFixture<PatientConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientConsumptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
