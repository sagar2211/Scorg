import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientListNotificationComponent } from './patient-list-notification.component';

describe('PatientListNotificationComponent', () => {
  let component: PatientListNotificationComponent;
  let fixture: ComponentFixture<PatientListNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientListNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientListNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
