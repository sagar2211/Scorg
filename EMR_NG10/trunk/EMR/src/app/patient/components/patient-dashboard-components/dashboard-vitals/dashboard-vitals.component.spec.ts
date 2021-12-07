import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVitalsComponent } from './dashboard-vitals.component';

describe('DashboardVitalsComponent', () => {
  let component: DashboardVitalsComponent;
  let fixture: ComponentFixture<DashboardVitalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardVitalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardVitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
