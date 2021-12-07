import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOtComponent } from './dashboard-ot.component';

describe('DashboardOtComponent', () => {
  let component: DashboardOtComponent;
  let fixture: ComponentFixture<DashboardOtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardOtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
