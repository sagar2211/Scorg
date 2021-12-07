import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMainHomeComponent } from './dashboard-main-home.component';

describe('DashboardMainHomeComponent', () => {
  let component: DashboardMainHomeComponent;
  let fixture: ComponentFixture<DashboardMainHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardMainHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardMainHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
