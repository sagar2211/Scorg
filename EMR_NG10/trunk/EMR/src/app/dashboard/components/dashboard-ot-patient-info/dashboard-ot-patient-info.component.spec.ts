import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOtPatientInfoComponent } from './dashboard-ot-patient-info.component';

describe('DashboardOtPatientInfoComponent', () => {
  let component: DashboardOtPatientInfoComponent;
  let fixture: ComponentFixture<DashboardOtPatientInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardOtPatientInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOtPatientInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
