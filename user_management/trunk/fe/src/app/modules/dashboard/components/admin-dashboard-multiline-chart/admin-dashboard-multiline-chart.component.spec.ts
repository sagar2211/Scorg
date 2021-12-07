import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardMultilineChartComponent } from './admin-dashboard-multiline-chart.component';

describe('AdminDashboardMultilineChartComponent', () => {
  let component: AdminDashboardMultilineChartComponent;
  let fixture: ComponentFixture<AdminDashboardMultilineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDashboardMultilineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardMultilineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
