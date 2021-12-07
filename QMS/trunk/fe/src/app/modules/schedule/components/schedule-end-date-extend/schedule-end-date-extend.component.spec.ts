import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleEndDateExtendComponent } from './schedule-end-date-extend.component';

describe('ScheduleEndDateExtendComponent', () => {
  let component: ScheduleEndDateExtendComponent;
  let fixture: ComponentFixture<ScheduleEndDateExtendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleEndDateExtendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleEndDateExtendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
