import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDeceasedPopupComponent } from './patient-deceased-popup.component';

describe('PatientDeceasedPopupComponent', () => {
  let component: PatientDeceasedPopupComponent;
  let fixture: ComponentFixture<PatientDeceasedPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDeceasedPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDeceasedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
