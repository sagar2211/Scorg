import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTimeLineComponent } from './dashboard-time-line.component';

describe('DashboardTimeLineComponent', () => {
  let component: DashboardTimeLineComponent;
  let fixture: ComponentFixture<DashboardTimeLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTimeLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTimeLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
