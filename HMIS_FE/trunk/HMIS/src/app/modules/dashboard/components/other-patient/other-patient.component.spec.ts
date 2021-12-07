import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherPatientComponent } from './other-patient.component';

describe('OtherPatientComponent', () => {
  let component: OtherPatientComponent;
  let fixture: ComponentFixture<OtherPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherPatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
