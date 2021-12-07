import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBulkNotificationComponent } from './patient-bulk-notification.component';

describe('PatientBulkNotificationComponent', () => {
  let component: PatientBulkNotificationComponent;
  let fixture: ComponentFixture<PatientBulkNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientBulkNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientBulkNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
