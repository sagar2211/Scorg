import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientIssueHomeComponent } from './patient-issue-home.component';

describe('PatientIssueHomeComponent', () => {
  let component: PatientIssueHomeComponent;
  let fixture: ComponentFixture<PatientIssueHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientIssueHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientIssueHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
