import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtScheduleHomeComponent } from './ot-schedule-home.component';

describe('OtScheduleHomeComponent', () => {
  let component: OtScheduleHomeComponent;
  let fixture: ComponentFixture<OtScheduleHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtScheduleHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtScheduleHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
