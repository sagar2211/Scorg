import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrnScheduleHomeComponent } from './grn-schedule-home.component';

describe('GrnScheduleHomeComponent', () => {
  let component: GrnScheduleHomeComponent;
  let fixture: ComponentFixture<GrnScheduleHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrnScheduleHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrnScheduleHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
