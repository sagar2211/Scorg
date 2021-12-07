import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientNotificationStatusComponent } from './patient-notification-status.component';

describe('PatientNotificationStatusComponent', () => {
  let component: PatientNotificationStatusComponent;
  let fixture: ComponentFixture<PatientNotificationStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientNotificationStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientNotificationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
