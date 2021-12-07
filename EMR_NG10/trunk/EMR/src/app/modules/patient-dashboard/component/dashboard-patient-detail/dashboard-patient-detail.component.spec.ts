import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPatientDetailComponent } from './dashboard-patient-detail.component';

describe('DashboardPatientDetailComponent', () => {
  let component: DashboardPatientDetailComponent;
  let fixture: ComponentFixture<DashboardPatientDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPatientDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPatientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
