import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFeedbackComponent } from './patient-feedback.component';

describe('PatientFeedbackComponent', () => {
  let component: PatientFeedbackComponent;
  let fixture: ComponentFixture<PatientFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
