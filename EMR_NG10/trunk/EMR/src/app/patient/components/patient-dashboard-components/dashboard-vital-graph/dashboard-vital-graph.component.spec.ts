import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVitalGraphComponent } from './dashboard-vital-graph.component';

describe('DashboardVitalGraphComponent', () => {
  let component: DashboardVitalGraphComponent;
  let fixture: ComponentFixture<DashboardVitalGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardVitalGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardVitalGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
