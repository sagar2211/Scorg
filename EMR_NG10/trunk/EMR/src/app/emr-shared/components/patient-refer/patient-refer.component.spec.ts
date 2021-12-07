import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientReferComponent } from './patient-refer.component';

describe('PatientReferComponent', () => {
  let component: PatientReferComponent;
  let fixture: ComponentFixture<PatientReferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientReferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientReferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
