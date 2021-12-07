import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrHomeDashboardComponent } from './emr-home-dashboard.component';

describe('EmrHomeDashboardComponent', () => {
  let component: EmrHomeDashboardComponent;
  let fixture: ComponentFixture<EmrHomeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrHomeDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmrHomeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
