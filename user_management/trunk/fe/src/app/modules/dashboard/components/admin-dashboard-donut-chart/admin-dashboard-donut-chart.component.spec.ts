import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardDonutChartComponent } from './admin-dashboard-donut-chart.component';

describe('AdminDashboardDonutChartComponent', () => {
  let component: AdminDashboardDonutChartComponent;
  let fixture: ComponentFixture<AdminDashboardDonutChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDashboardDonutChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardDonutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
