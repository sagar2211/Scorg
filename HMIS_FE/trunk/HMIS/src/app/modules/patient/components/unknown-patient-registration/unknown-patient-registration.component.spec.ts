import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnknownPatientRegistrationComponent } from './unknown-patient-registration.component';

describe('UnknownPatientRegistrationComponent', () => {
  let component: UnknownPatientRegistrationComponent;
  let fixture: ComponentFixture<UnknownPatientRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnknownPatientRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnknownPatientRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
