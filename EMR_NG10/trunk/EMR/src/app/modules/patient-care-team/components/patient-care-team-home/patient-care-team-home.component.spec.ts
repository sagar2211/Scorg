import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCareTeamHomeComponent } from './patient-care-team-home.component';

describe('PatientCareTeamHomeComponent', () => {
  let component: PatientCareTeamHomeComponent;
  let fixture: ComponentFixture<PatientCareTeamHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientCareTeamHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCareTeamHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
