import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardMultiseriesBarChartComponent } from './admin-dashboard-multiseries-bar-chart.component';

describe('AdminDashboardMultiseriesBarChartComponent', () => {
  let component: AdminDashboardMultiseriesBarChartComponent;
  let fixture: ComponentFixture<AdminDashboardMultiseriesBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDashboardMultiseriesBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardMultiseriesBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
