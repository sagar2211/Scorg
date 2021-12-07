import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOtPatientComponent } from './dashboard-ot-patient.component';

describe('DashboardOtPatientComponent', () => {
  let component: DashboardOtPatientComponent;
  let fixture: ComponentFixture<DashboardOtPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardOtPatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOtPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
