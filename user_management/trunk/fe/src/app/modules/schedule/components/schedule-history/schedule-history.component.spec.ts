import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleHistoryComponent } from './schedule-history.component';

describe('ScheduleHistoryComponent', () => {
  let component: ScheduleHistoryComponent;
  let fixture: ComponentFixture<ScheduleHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
