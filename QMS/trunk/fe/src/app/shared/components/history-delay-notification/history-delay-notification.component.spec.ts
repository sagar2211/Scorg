import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryDelayNotificationComponent } from './history-delay-notification.component';

describe('HistoryDelayNotificationComponent', () => {
  let component: HistoryDelayNotificationComponent;
  let fixture: ComponentFixture<HistoryDelayNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryDelayNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryDelayNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
