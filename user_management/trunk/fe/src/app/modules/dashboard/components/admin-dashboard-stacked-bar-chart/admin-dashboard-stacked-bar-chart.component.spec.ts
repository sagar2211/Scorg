import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardStackedBarChartComponent } from './admin-dashboard-stacked-bar-chart.component';

describe('AdminDashboardStackedBarChartComponent', () => {
  let component: AdminDashboardStackedBarChartComponent;
  let fixture: ComponentFixture<AdminDashboardStackedBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDashboardStackedBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardStackedBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
