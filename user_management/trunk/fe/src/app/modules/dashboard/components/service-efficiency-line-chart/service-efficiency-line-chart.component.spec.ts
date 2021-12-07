import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceEfficiencyLineChartComponent } from './service-efficiency-line-chart.component';

describe('ServiceEfficiencyLineChartComponent', () => {
  let component: ServiceEfficiencyLineChartComponent;
  let fixture: ComponentFixture<ServiceEfficiencyLineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceEfficiencyLineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceEfficiencyLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
