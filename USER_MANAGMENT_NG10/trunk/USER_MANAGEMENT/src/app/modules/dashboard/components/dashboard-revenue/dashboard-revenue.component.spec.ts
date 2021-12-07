import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRevenueComponent } from './dashboard-revenue.component';

describe('DashboardRevenueComponent', () => {
  let component: DashboardRevenueComponent;
  let fixture: ComponentFixture<DashboardRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardRevenueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
