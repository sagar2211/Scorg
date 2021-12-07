import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientIcuHomeComponent } from './patient-icu-home.component';

describe('PatientIcuHomeComponent', () => {
  let component: PatientIcuHomeComponent;
  let fixture: ComponentFixture<PatientIcuHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientIcuHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientIcuHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
