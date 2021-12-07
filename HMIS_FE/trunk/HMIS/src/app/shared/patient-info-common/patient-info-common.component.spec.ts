import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInfoCommonComponent } from './patient-info-common.component';

describe('PatientInfoCommonComponent', () => {
  let component: PatientInfoCommonComponent;
  let fixture: ComponentFixture<PatientInfoCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientInfoCommonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInfoCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
