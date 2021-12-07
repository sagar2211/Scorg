import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummeryTimeScheduleComponent } from './summery-time-schedule.component';

describe('SummeryTimeScheduleComponent', () => {
  let component: SummeryTimeScheduleComponent;
  let fixture: ComponentFixture<SummeryTimeScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummeryTimeScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummeryTimeScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
