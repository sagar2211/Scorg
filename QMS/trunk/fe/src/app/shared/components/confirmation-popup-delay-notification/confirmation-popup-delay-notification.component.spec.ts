import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPopupDelayNotificationComponent } from './confirmation-popup-delay-notification.component';

describe('ConfirmationPopupDelayNotificationComponent', () => {
  let component: ConfirmationPopupDelayNotificationComponent;
  let fixture: ComponentFixture<ConfirmationPopupDelayNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationPopupDelayNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationPopupDelayNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
